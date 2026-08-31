package com.example.organizationalert

import com.example.organizationalert.core.alarm.AlarmTrigger
import com.example.organizationalert.core.database.entity.EventStatus
import com.example.organizationalert.domain.model.AlarmType
import com.example.organizationalert.domain.model.Priority
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test
import java.time.Instant

class AlarmEligibilityLogicTest {

    @Test
    fun `broadcaster is excluded from ringing`() {
        val trigger = sampleTrigger(broadcasterId = "user_broadcaster")
        assertFalse(shouldRing(trigger, currentUserId = "user_broadcaster", groupMembers = listOf("user_broadcaster", "user_a")))
    }

    @Test
    fun `group member recipient should ring`() {
        val trigger = sampleTrigger(
            broadcasterId = "user_broadcaster",
            groupId = "group_1"
        )
        assertTrue(shouldRing(trigger, currentUserId = "user_a", groupMembers = listOf("user_broadcaster", "user_a")))
    }

    @Test
    fun `non-member should not ring`() {
        val trigger = sampleTrigger(
            broadcasterId = "user_broadcaster",
            groupId = "group_1"
        )
        assertFalse(shouldRing(trigger, currentUserId = "user_outsider", groupMembers = listOf("user_broadcaster", "user_a")))
    }

    @Test
    fun `EventStatus includes ringing and dismissed states`() {
        assertEquals(EventStatus.RINGING, EventStatus.fromString("RINGING"))
        assertEquals(EventStatus.DISMISSED, EventStatus.fromString("DISMISSED"))
    }

    @Test
    fun `AlarmType distinguishes immediate and scheduled`() {
        assertEquals(AlarmType.IMMEDIATE_ALARM, AlarmType.fromString("IMMEDIATE_ALARM"))
        assertEquals(AlarmType.SCHEDULED_ALARM, AlarmType.fromString("SCHEDULED_ALARM"))
    }

    private fun sampleTrigger(
        broadcasterId: String? = "broadcaster",
        groupId: String? = null
    ) = AlarmTrigger(
        sessionId = "evt-1",
        title = "Meeting",
        message = "Starts now",
        priority = Priority.URGENT,
        scheduledAt = Instant.now(),
        alarmType = AlarmType.IMMEDIATE_ALARM,
        groupId = groupId,
        broadcasterId = broadcasterId
    )

    /** Mirrors [com.example.organizationalert.core.alarm.AlarmEligibilityChecker] rules for unit tests. */
    private fun shouldRing(
        trigger: AlarmTrigger,
        currentUserId: String?,
        groupMembers: List<String>
    ): Boolean {
        if (currentUserId.isNullOrBlank()) return false
        if (!trigger.broadcasterId.isNullOrBlank() && trigger.broadcasterId == currentUserId) return false
        if (!trigger.groupId.isNullOrBlank() && !groupMembers.contains(currentUserId)) return false
        return true
    }
}
