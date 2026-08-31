package com.example.organizationalert

import com.example.organizationalert.core.scheduling.ScheduleTimeCalculator
import com.example.organizationalert.domain.model.Alert
import com.example.organizationalert.domain.model.AlertStatus
import com.example.organizationalert.domain.model.Priority
import com.example.organizationalert.domain.model.RepeatType
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test
import java.time.Instant
import java.time.ZoneId
import java.time.ZonedDateTime
import java.util.concurrent.TimeUnit

class ScheduleTimeCalculatorTest {

    private val zoneKolkata = ZoneId.of("Asia/Kolkata")

    @Test
    fun calculateDelay_threeHoursUntilScheduled() {
        val now = Instant.parse("2026-08-31T13:00:00Z") // 16:00 IST
        val scheduled = Instant.parse("2026-08-31T16:00:00Z") // 19:00 IST
        val alert = createAlert(scheduledAt = scheduled, nextTriggerAt = scheduled)

        val delay = ScheduleTimeCalculator.calculateDelay(alert, now)

        assertNotNull(delay)
        assertEquals(TimeUnit.HOURS.toMillis(3), delay!!.toMillis())
    }

    @Test
    fun resolveNextTrigger_after19to22Update_usesNewTime() {
        val now = Instant.parse("2026-08-31T12:30:00Z") // 18:00 IST
        val oldTime = Instant.parse("2026-08-31T13:30:00Z") // 19:00 IST
        val newTime = Instant.parse("2026-08-31T16:30:00Z") // 22:00 IST
        val alert = createAlert(
            scheduledAt = oldTime,
            nextTriggerAt = newTime,
            version = 5
        )

        val trigger = ScheduleTimeCalculator.resolveNextTriggerInstant(alert, now)
        assertEquals(newTime, trigger)

        val delay = ScheduleTimeCalculator.calculateDelay(alert, now)!!
        assertEquals(TimeUnit.HOURS.toMillis(4), delay.toMillis())
    }

    @Test
    fun resolveNextTrigger_dailyPastBase_computesNextInBusinessTimezone() {
        val base = ZonedDateTime.of(2026, 8, 31, 14, 0, 0, 0, zoneKolkata).toInstant() // 19:00 IST
        val now = ZonedDateTime.of(2026, 8, 31, 15, 0, 0, 0, zoneKolkata).toInstant() // 20:00 IST
        val alert = createAlert(
            scheduledAt = base,
            nextTriggerAt = base,
            repeatType = RepeatType.DAILY,
            timezoneId = "Asia/Kolkata"
        )

        val next = ScheduleTimeCalculator.resolveNextTriggerInstant(alert, now)
        assertNotNull(next)
        val nextZoned = next!!.atZone(zoneKolkata)
        assertEquals(1, nextZoned.dayOfMonth) // Sept 1
        assertEquals(14, nextZoned.hour)
        assertEquals(0, nextZoned.minute)
        assertTrue(next.isAfter(now))
    }

    @Test
    fun resolveNextTrigger_oncePast_returnsNull() {
        val now = Instant.parse("2026-08-31T20:00:00Z")
        val past = Instant.parse("2026-08-31T16:00:00Z")
        val alert = createAlert(scheduledAt = past, nextTriggerAt = past, repeatType = RepeatType.ONCE)

        assertNull(ScheduleTimeCalculator.resolveNextTriggerInstant(alert, now))
        assertTrue(ScheduleTimeCalculator.isExpiredOnce(alert, now))
    }

    private fun createAlert(
        scheduledAt: Instant,
        nextTriggerAt: Instant,
        repeatType: RepeatType = RepeatType.ONCE,
        timezoneId: String = "UTC",
        version: Int = 1
    ): Alert {
        return Alert(
            id = "alert_test",
            title = "Shop Closing",
            message = "Close shop",
            organizationId = "org",
            groupId = "group",
            scheduledAt = scheduledAt,
            repeatType = repeatType,
            priority = Priority.NORMAL,
            status = AlertStatus.SCHEDULED,
            isEnabled = true,
            nextTriggerAt = nextTriggerAt,
            timezoneId = timezoneId,
            version = version
        )
    }
}
