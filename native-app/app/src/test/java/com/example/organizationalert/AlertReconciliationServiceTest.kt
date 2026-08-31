package com.example.organizationalert

import com.example.organizationalert.core.scheduling.AlertReconciliationService
import com.example.organizationalert.core.scheduling.AlertScheduler
import com.example.organizationalert.domain.model.Alert
import com.example.organizationalert.domain.model.AlertStatus
import com.example.organizationalert.domain.model.Priority
import com.example.organizationalert.domain.model.RepeatType
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import org.junit.Assert.assertEquals
import org.junit.Before
import org.junit.Test
import java.time.Instant

class AlertReconciliationServiceTest {

    private lateinit var scheduler: AlertScheduler
    private lateinit var reconciliationService: AlertReconciliationService

    private val now = Instant.parse("2026-08-31T10:00:00Z")
    private val future1 = Instant.parse("2026-08-31T10:30:00Z")
    private val future2 = Instant.parse("2026-08-31T11:00:00Z")
    private val pastTime = Instant.parse("2026-08-31T09:00:00Z")

    @Before
    fun setup() {
        scheduler = mockk(relaxed = true)
        every { scheduler.scheduleAlert(any()) } returns true
        every { scheduler.cancelAlert(any()) } returns true
        reconciliationService = AlertReconciliationService(scheduler)
    }

    @Test
    fun reconcile_schedulesNewFutureAlerts() {
        val serverAlert = createAlert("alert_1", future1, AlertStatus.SCHEDULED, isEnabled = true)

        val result = reconciliationService.reconcile(
            currentLocalAlerts = emptyList(),
            incomingServerAlerts = listOf(serverAlert),
            now = now
        )

        assertEquals(1, result.scheduledCount)
        assertEquals(0, result.cancelledCount)
        assertEquals(0, result.unchangedCount)
        verify(exactly = 1) { scheduler.scheduleAlert(serverAlert) }
    }

    @Test
    fun reconcile_cancelsDeletedAlerts() {
        val localAlert = createAlert("alert_deleted", future1, AlertStatus.SCHEDULED, isEnabled = true)

        val result = reconciliationService.reconcile(
            currentLocalAlerts = listOf(localAlert),
            incomingServerAlerts = emptyList(),
            now = now
        )

        assertEquals(0, result.scheduledCount)
        assertEquals(1, result.cancelledCount)
        verify(exactly = 1) { scheduler.cancelAlert("alert_deleted") }
    }

    @Test
    fun reconcile_reschedulesModifiedAlerts() {
        val localAlert = createAlert("alert_mod", future1, AlertStatus.SCHEDULED, isEnabled = true, version = 1)
        val modifiedServerAlert = createAlert("alert_mod", future2, AlertStatus.SCHEDULED, isEnabled = true, version = 2)

        val result = reconciliationService.reconcile(
            currentLocalAlerts = listOf(localAlert),
            incomingServerAlerts = listOf(modifiedServerAlert),
            now = now
        )

        assertEquals(1, result.scheduledCount)
        verify(exactly = 1) { scheduler.cancelAlert("alert_mod") }
        verify(exactly = 1) { scheduler.scheduleAlert(modifiedServerAlert) }
    }

    @Test
    fun reconcile_isIdempotent_runningMultipleTimesKeepsUnchangedState() {
        val alert = createAlert("alert_1", future1, AlertStatus.SCHEDULED, isEnabled = true, version = 1)

        // First run: new alert -> scheduled
        val result1 = reconciliationService.reconcile(
            currentLocalAlerts = emptyList(),
            incomingServerAlerts = listOf(alert),
            now = now
        )
        assertEquals(1, result1.scheduledCount)

        // Second run: same alert in local and server -> unchanged, no redundant alarm calls
        val result2 = reconciliationService.reconcile(
            currentLocalAlerts = listOf(alert),
            incomingServerAlerts = listOf(alert),
            now = now
        )
        assertEquals(0, result2.scheduledCount)
        assertEquals(0, result2.cancelledCount)
        assertEquals(1, result2.unchangedCount)
    }

    @Test
    fun reconcile_skipsPastScheduledAlerts() {
        val pastAlert = createAlert("alert_past", pastTime, AlertStatus.SCHEDULED, isEnabled = true)

        val result = reconciliationService.reconcile(
            currentLocalAlerts = emptyList(),
            incomingServerAlerts = listOf(pastAlert),
            now = now
        )

        assertEquals(0, result.scheduledCount)
        assertEquals(1, result.skippedPastCount)
        verify(exactly = 0) { scheduler.scheduleAlert(any()) }
    }

    private fun createAlert(
        id: String,
        scheduledAt: Instant,
        status: AlertStatus,
        isEnabled: Boolean,
        version: Int = 1
    ): Alert {
        return Alert(
            id = id,
            title = "Test Alert $id",
            message = "Test Message",
            organizationId = "org_1",
            groupId = "group_1",
            scheduledAt = scheduledAt,
            repeatType = RepeatType.ONCE,
            priority = Priority.NORMAL,
            status = status,
            isEnabled = isEnabled,
            nextTriggerAt = scheduledAt,
            version = version
        )
    }
}
