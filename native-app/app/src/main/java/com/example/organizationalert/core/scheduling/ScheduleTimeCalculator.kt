package com.example.organizationalert.core.scheduling

import com.example.organizationalert.domain.model.Alert
import com.example.organizationalert.domain.model.AlertStatus
import com.example.organizationalert.domain.model.RepeatType
import java.time.Duration
import java.time.Instant
import java.time.ZoneId

/**
 * Central time math for local AlarmManager scheduling.
 * Backend stores canonical UTC instants; Android computes delay from device clock.
 */
object ScheduleTimeCalculator {

    fun now(): Instant = Instant.now()

    fun resolveZoneId(timezoneId: String?): ZoneId {
        if (timezoneId.isNullOrBlank()) return ZoneId.systemDefault()
        return try {
            ZoneId.of(timezoneId)
        } catch (_: Exception) {
            ZoneId.systemDefault()
        }
    }

    /**
     * Next wall-clock instant this alert should fire on device.
     * Uses server [Alert.nextTriggerAt] when still in the future; otherwise derives from
     * [Alert.scheduledAt] + recurrence in [Alert.timezoneId].
     */
    fun resolveNextTriggerInstant(alert: Alert, now: Instant = now()): Instant? {
        if (!alert.isEnabled || alert.status != AlertStatus.SCHEDULED) return null

        alert.nextTriggerAt?.takeIf { it.isAfter(now) }?.let { return it }

        return RecurrenceHelper.calculateNextOccurrence(
            repeatType = alert.repeatType,
            baseScheduledAt = alert.scheduledAt,
            fromInstant = now,
            zoneId = resolveZoneId(alert.timezoneId)
        )
    }

    fun calculateDelay(alert: Alert, now: Instant = now()): Duration? {
        val trigger = resolveNextTriggerInstant(alert, now) ?: return null
        if (!trigger.isAfter(now)) return null
        return Duration.between(now, trigger)
    }

    fun calculateDelayMillis(alert: Alert, now: Instant = now()): Long? {
        return calculateDelay(alert, now)?.toMillis()
    }

    fun isDue(alert: Alert, now: Instant = now(), toleranceMillis: Long = 60_000L): Boolean {
        val trigger = resolveNextTriggerInstant(alert, now) ?: return false
        val delta = Duration.between(trigger, now).toMillis()
        return delta >= -toleranceMillis && delta <= toleranceMillis
    }

    fun isExpiredOnce(alert: Alert, now: Instant = now()): Boolean {
        return alert.repeatType == RepeatType.ONCE &&
            !alert.scheduledAt.isAfter(now) &&
            (alert.nextTriggerAt == null || !alert.nextTriggerAt.isAfter(now))
    }

    fun shouldScheduleLocally(alert: Alert, now: Instant = now()): Boolean {
        return resolveNextTriggerInstant(alert, now) != null
    }
}
