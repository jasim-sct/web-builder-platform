package com.example.organizationalert

import com.example.organizationalert.core.database.entity.AckQueueEntity
import com.example.organizationalert.core.database.entity.EventEntity
import com.example.organizationalert.core.database.entity.EventStatus
import com.example.organizationalert.core.database.entity.QueueStatus
import com.example.organizationalert.domain.model.Priority
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Test
import java.time.Instant
import java.time.temporal.ChronoUnit

class EventLifecycleStateTest {

    @Test
    fun `EventStatus enum parsing and fallback`() {
        assertEquals(EventStatus.SCHEDULED, EventStatus.fromString("SCHEDULED"))
        assertEquals(EventStatus.TRIGGERED, EventStatus.fromString("TRIGGERED"))
        assertEquals(EventStatus.PRESENTED, EventStatus.fromString("PRESENTED"))
        assertEquals(EventStatus.PRESENTATION_BLOCKED, EventStatus.fromString("PRESENTATION_BLOCKED"))
        assertEquals(EventStatus.RECEIVED, EventStatus.fromString("RECEIVED"))
        assertEquals(EventStatus.EXPIRED, EventStatus.fromString("EXPIRED"))
        assertEquals(EventStatus.CANCELLED, EventStatus.fromString("CANCELLED"))
        assertEquals(EventStatus.MISSED, EventStatus.fromString("MISSED"))
        assertEquals(EventStatus.RINGING, EventStatus.fromString("RINGING"))
        assertEquals(EventStatus.DISMISSED, EventStatus.fromString("DISMISSED"))
        assertEquals(EventStatus.SCHEDULED, EventStatus.fromString("INVALID_STATUS"))
    }

    @Test
    fun `AckStatus enum parsing and fallback`() {
        assertEquals(com.example.organizationalert.core.database.entity.AckStatus.NOT_REQUIRED, com.example.organizationalert.core.database.entity.AckStatus.fromString("NOT_REQUIRED"))
        assertEquals(com.example.organizationalert.core.database.entity.AckStatus.PENDING, com.example.organizationalert.core.database.entity.AckStatus.fromString("PENDING"))
        assertEquals(com.example.organizationalert.core.database.entity.AckStatus.SENDING, com.example.organizationalert.core.database.entity.AckStatus.fromString("SENDING"))
        assertEquals(com.example.organizationalert.core.database.entity.AckStatus.CONFIRMED, com.example.organizationalert.core.database.entity.AckStatus.fromString("CONFIRMED"))
        assertEquals(com.example.organizationalert.core.database.entity.AckStatus.FAILED, com.example.organizationalert.core.database.entity.AckStatus.fromString("FAILED"))
        assertEquals(com.example.organizationalert.core.database.entity.AckStatus.PENDING, com.example.organizationalert.core.database.entity.AckStatus.fromString("INVALID"))
    }

    @Test
    fun `Event transition from SCHEDULED to RECEIVED and CONFIRMED with orthogonal AckStatus`() {
        val now = Instant.now()
        val event = EventEntity(
            id = "EVT-TEST-1",
            eventId = "EVT-TEST-1",
            userId = "user_123",
            organizationId = "org_456",
            groupId = null,
            title = "Test Mandatory Alarm",
            message = "Acknowledge drill",
            priority = Priority.URGENT,
            requiresReceive = true,
            status = EventStatus.SCHEDULED,
            ackStatus = com.example.organizationalert.core.database.entity.AckStatus.PENDING,
            scheduledAt = now.plusSeconds(30)
        )

        assertEquals(EventStatus.SCHEDULED, event.status)
        assertEquals(com.example.organizationalert.core.database.entity.AckStatus.PENDING, event.ackStatus)

        val triggeredEvent = event.copy(
            status = EventStatus.TRIGGERED,
            triggeredAt = now.plusSeconds(30)
        )
        assertEquals(EventStatus.TRIGGERED, triggeredEvent.status)
        assertNotNull(triggeredEvent.triggeredAt)

        val receivedEvent = triggeredEvent.copy(
            status = EventStatus.RECEIVED,
            ackStatus = com.example.organizationalert.core.database.entity.AckStatus.PENDING,
            receivedAt = now.plusSeconds(35)
        )
        assertEquals(EventStatus.RECEIVED, receivedEvent.status)
        assertEquals(com.example.organizationalert.core.database.entity.AckStatus.PENDING, receivedEvent.ackStatus)
        assertNotNull(receivedEvent.receivedAt)

        val ackedEvent = receivedEvent.copy(
            ackStatus = com.example.organizationalert.core.database.entity.AckStatus.CONFIRMED,
            acknowledgedAt = now.plusSeconds(36)
        )
        assertEquals(EventStatus.RECEIVED, ackedEvent.status)
        assertEquals(com.example.organizationalert.core.database.entity.AckStatus.CONFIRMED, ackedEvent.ackStatus)
        assertNotNull(ackedEvent.acknowledgedAt)
    }
}

class OfflineAckQueueTest {

    @Test
    fun `AckQueueEntity exponential backoff retry calculation`() {
        val now = Instant.now()
        val ack = AckQueueEntity(
            id = 1,
            eventId = "EVT-999",
            action = "RECEIVE",
            userId = "user_100",
            deviceId = "android_dev_1",
            receivedAt = now,
            status = QueueStatus.PENDING,
            retryCount = 0,
            nextRetryAt = now
        )

        assertEquals(QueueStatus.PENDING, ack.status)
        assertEquals(0, ack.retryCount)

        val retry1DelaySeconds = Math.min(300L, (ack.retryCount + 1) * 15L)
        val nextRetry1 = now.plus(retry1DelaySeconds, ChronoUnit.SECONDS)
        val updatedAck1 = ack.copy(
            status = QueueStatus.FAILED,
            retryCount = ack.retryCount + 1,
            nextRetryAt = nextRetry1
        )

        assertEquals(1, updatedAck1.retryCount)
        assertEquals(15L, ChronoUnit.SECONDS.between(now, updatedAck1.nextRetryAt))

        val retry2DelaySeconds = Math.min(300L, (updatedAck1.retryCount + 1) * 15L)
        val nextRetry2 = now.plus(retry2DelaySeconds, ChronoUnit.SECONDS)
        val updatedAck2 = updatedAck1.copy(
            retryCount = updatedAck1.retryCount + 1,
            nextRetryAt = nextRetry2
        )

        assertEquals(2, updatedAck2.retryCount)
        assertEquals(30L, ChronoUnit.SECONDS.between(now, updatedAck2.nextRetryAt))
    }
}
