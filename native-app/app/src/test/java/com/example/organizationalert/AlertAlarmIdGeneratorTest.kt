package com.example.organizationalert

import com.example.organizationalert.core.scheduling.AlertAlarmIdGenerator
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class AlertAlarmIdGeneratorTest {

    @Test
    fun generateRequestCode_isDeterministic_forSameAlertId() {
        val alertId = "65e0a123456789abcdef0123"

        val code1 = AlertAlarmIdGenerator.generateRequestCode(alertId)
        val code2 = AlertAlarmIdGenerator.generateRequestCode(alertId)
        val code3 = AlertAlarmIdGenerator.generateRequestCode(alertId)

        assertEquals(code1, code2)
        assertEquals(code2, code3)
        assertTrue(code1 >= 0)
    }

    @Test
    fun generateRequestCode_producesDifferentCodes_forDifferentAlertIds() {
        val alertId1 = "65e0a123456789abcdef0123"
        val alertId2 = "65e0a123456789abcdef0124"
        val alertId3 = "alert_daily_standup_9am"

        val code1 = AlertAlarmIdGenerator.generateRequestCode(alertId1)
        val code2 = AlertAlarmIdGenerator.generateRequestCode(alertId2)
        val code3 = AlertAlarmIdGenerator.generateRequestCode(alertId3)

        assertNotEquals(code1, code2)
        assertNotEquals(code1, code3)
        assertNotEquals(code2, code3)
    }

    @Test
    fun generateRequestCode_handlesEmptyOrBlankStringsSafely() {
        val code = AlertAlarmIdGenerator.generateRequestCode("")
        assertEquals(0, code)
    }
}
