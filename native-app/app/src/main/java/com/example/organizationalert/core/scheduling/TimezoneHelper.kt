package com.example.organizationalert.core.scheduling

import java.time.Instant
import java.time.ZoneId
import java.time.ZonedDateTime
import java.time.format.DateTimeFormatter
import java.time.format.DateTimeParseException
import java.util.Locale

object TimezoneHelper {
    private val ISO_FORMATTER = DateTimeFormatter.ISO_INSTANT
    private val USER_FRIENDLY_FORMATTER =
        DateTimeFormatter.ofPattern("EEE, MMM d, yyyy · hh:mm a", Locale.getDefault())
    private val TIME_ONLY_FORMATTER =
        DateTimeFormatter.ofPattern("hh:mm a", Locale.getDefault())
    private val DATE_ONLY_FORMATTER =
        DateTimeFormatter.ofPattern("MMM d, yyyy", Locale.getDefault())

    fun parseIsoToInstant(isoString: String?): Instant? {
        if (isoString.isNullOrBlank()) return null
        return try {
            Instant.parse(isoString)
        } catch (e: DateTimeParseException) {
            try {
                // Try parsing offset date time format if not strictly instant
                ZonedDateTime.parse(isoString).toInstant()
            } catch (e2: Exception) {
                null
            }
        }
    }

    fun formatInstantToIso(instant: Instant): String {
        return ISO_FORMATTER.format(instant)
    }

    fun formatUserFriendly(instant: Instant, zoneId: ZoneId = ZoneId.systemDefault()): String {
        val zonedDateTime = instant.atZone(zoneId)
        return USER_FRIENDLY_FORMATTER.format(zonedDateTime)
    }

    fun formatTimeOnly(instant: Instant, zoneId: ZoneId = ZoneId.systemDefault()): String {
        val zonedDateTime = instant.atZone(zoneId)
        return TIME_ONLY_FORMATTER.format(zonedDateTime)
    }

    fun formatDateOnly(instant: Instant, zoneId: ZoneId = ZoneId.systemDefault()): String {
        val zonedDateTime = instant.atZone(zoneId)
        return DATE_ONLY_FORMATTER.format(zonedDateTime)
    }
}
