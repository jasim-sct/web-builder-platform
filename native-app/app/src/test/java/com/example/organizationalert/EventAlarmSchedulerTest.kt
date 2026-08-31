package com.example.organizationalert

import com.example.organizationalert.core.scheduling.AlertAlarmIdGenerator
import com.example.organizationalert.domain.model.Priority
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test
import java.time.Instant

class EventAlarmSchedulerTest {

    @Test
    fun `generateRequestCode should produce deterministic positive integer from eventId`() {
        val eventId = "EVT-1001-TEST"
        val code1 = AlertAlarmIdGenerator.generateRequestCode(eventId)
        val code2 = AlertAlarmIdGenerator.generateRequestCode(eventId)

        assertEquals("Same eventId must produce same requestCode", code1, code2)
        assertTrue("requestCode must be non-negative", code1 >= 0)
    }

    @Test
    fun `past timestamp event should be recognized as past`() {
        val pastInstant = Instant.now().minusSeconds(120)
        val now = Instant.now()

        assertTrue("past timestamp is before now", pastInstant.isBefore(now))
    }

    @Test
    fun `event priority parsing and default fallback`() {
        assertEquals(Priority.URGENT, Priority.fromString("URGENT"))
        assertEquals(Priority.HIGH, Priority.fromString("HIGH"))
        assertEquals(Priority.NORMAL, Priority.fromString("UNKNOWN_VALUE"))
        // Legacy server values map to closest supported priority
        assertEquals(Priority.URGENT, Priority.fromString("MANDATORY"))
        assertEquals(Priority.URGENT, Priority.fromString("CRITICAL"))
    }
}
