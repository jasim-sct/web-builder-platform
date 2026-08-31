package com.example.organizationalert

import com.example.organizationalert.core.scheduling.RecurrenceHelper
import com.example.organizationalert.domain.model.RepeatType
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test
import java.time.Instant
import java.time.ZoneId
import java.time.ZonedDateTime

class RecurrenceHelperTest {

    private val zoneUtc = ZoneId.of("UTC")

    @Test
    fun calculateNextOccurrence_forOnce_returnsScheduledIfFuture() {
        val baseTime = ZonedDateTime.of(2026, 8, 31, 10, 30, 0, 0, zoneUtc).toInstant()
        val now = ZonedDateTime.of(2026, 8, 31, 9, 0, 0, 0, zoneUtc).toInstant()

        val next = RecurrenceHelper.calculateNextOccurrence(
            repeatType = RepeatType.ONCE,
            baseScheduledAt = baseTime,
            fromInstant = now,
            zoneId = zoneUtc
        )

        assertEquals(baseTime, next)
    }

    @Test
    fun calculateNextOccurrence_forOnce_returnsNullIfPast() {
        val baseTime = ZonedDateTime.of(2026, 8, 31, 8, 30, 0, 0, zoneUtc).toInstant()
        val now = ZonedDateTime.of(2026, 8, 31, 9, 0, 0, 0, zoneUtc).toInstant()

        val next = RecurrenceHelper.calculateNextOccurrence(
            repeatType = RepeatType.ONCE,
            baseScheduledAt = baseTime,
            fromInstant = now,
            zoneId = zoneUtc
        )

        assertNull(next)
    }

    @Test
    fun calculateNextOccurrence_forDaily_advancesToNextDay_preservingHourAndMinute() {
        val baseTime = ZonedDateTime.of(2026, 8, 31, 10, 30, 0, 0, zoneUtc).toInstant()
        val now = ZonedDateTime.of(2026, 8, 31, 10, 35, 0, 0, zoneUtc).toInstant()

        val next = RecurrenceHelper.calculateNextOccurrence(
            repeatType = RepeatType.DAILY,
            baseScheduledAt = baseTime,
            fromInstant = now,
            zoneId = zoneUtc
        )

        assertNotNull(next)
        val nextZoned = next!!.atZone(zoneUtc)
        assertEquals(2026, nextZoned.year)
        assertEquals(9, nextZoned.monthValue) // Sept 1st
        assertEquals(1, nextZoned.dayOfMonth)
        assertEquals(10, nextZoned.hour)
        assertEquals(30, nextZoned.minute)
        assertTrue(next.isAfter(now))
    }

    @Test
    fun calculateNextOccurrence_forWeekly_advancesToSameDayNextWeek() {
        // Monday Aug 31, 2026 at 10:30
        val baseTime = ZonedDateTime.of(2026, 8, 31, 10, 30, 0, 0, zoneUtc).toInstant()
        val now = ZonedDateTime.of(2026, 8, 31, 11, 0, 0, 0, zoneUtc).toInstant()

        val next = RecurrenceHelper.calculateNextOccurrence(
            repeatType = RepeatType.WEEKLY,
            baseScheduledAt = baseTime,
            fromInstant = now,
            zoneId = zoneUtc
        )

        assertNotNull(next)
        val nextZoned = next!!.atZone(zoneUtc)
        // Next Monday: Sept 7, 2026
        assertEquals(2026, nextZoned.year)
        assertEquals(9, nextZoned.monthValue)
        assertEquals(7, nextZoned.dayOfMonth)
        assertEquals(10, nextZoned.hour)
        assertEquals(30, nextZoned.minute)
        assertTrue(next.isAfter(now))
    }
}
