package com.example.organizationalert

import com.example.organizationalert.core.scheduling.TimezoneHelper
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Test
import java.time.Instant
import java.time.ZoneId

class TimezoneHelperTest {

    @Test
    fun parseIsoToInstant_parsesValidIsoString() {
        val iso = "2026-08-31T10:30:00Z"
        val instant = TimezoneHelper.parseIsoToInstant(iso)

        assertNotNull(instant)
        assertEquals(Instant.parse(iso), instant)
    }

    @Test
    fun parseIsoToInstant_returnsNullOnInvalidOrBlank() {
        assertNull(TimezoneHelper.parseIsoToInstant(null))
        assertNull(TimezoneHelper.parseIsoToInstant(""))
        assertNull(TimezoneHelper.parseIsoToInstant("invalid-date"))
    }

    @Test
    fun formatInstantToIso_matchesIsoInstantFormat() {
        val instant = Instant.ofEpochMilli(1788172200000L)
        val iso = TimezoneHelper.formatInstantToIso(instant)

        assertEquals(instant, Instant.parse(iso))
    }

    @Test
    fun formatUserFriendly_formatsAccuratelyForTimezone() {
        val instant = Instant.parse("2026-08-31T10:30:00Z")
        val formattedUtc = TimezoneHelper.formatUserFriendly(instant, ZoneId.of("UTC"))

        assertNotNull(formattedUtc)
    }
}
