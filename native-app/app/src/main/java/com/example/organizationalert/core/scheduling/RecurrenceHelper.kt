package com.example.organizationalert.core.scheduling

import com.example.organizationalert.domain.model.RepeatType
import java.time.Instant
import java.time.ZoneId
import java.time.ZonedDateTime

object RecurrenceHelper {

    /**
     * Calculates the next trigger timestamp based on repeat type and base scheduled time.
     * Ensures calculation is strictly in the future compared to reference instant (now).
     */
    fun calculateNextOccurrence(
        repeatType: RepeatType,
        baseScheduledAt: Instant,
        fromInstant: Instant = Instant.now(),
        zoneId: ZoneId = ZoneId.systemDefault()
    ): Instant? {
        if (repeatType == RepeatType.ONCE) {
            // Once alerts only have their original scheduled time
            return if (baseScheduledAt.isAfter(fromInstant)) baseScheduledAt else null
        }

        var baseZoned = baseScheduledAt.atZone(zoneId)
        val fromZoned = fromInstant.atZone(zoneId)

        // If the base scheduled time is already in the future, return it
        if (baseZoned.isAfter(fromZoned)) {
            return baseZoned.toInstant()
        }

        when (repeatType) {
            RepeatType.DAILY -> {
                // Keep the same hour, minute, second, increment day until > fromZoned
                var nextCandidate = fromZoned.withHour(baseZoned.hour)
                    .withMinute(baseZoned.minute)
                    .withSecond(baseZoned.second)
                    .withNano(0)

                if (!nextCandidate.isAfter(fromZoned)) {
                    nextCandidate = nextCandidate.plusDays(1)
                }
                return nextCandidate.toInstant()
            }

            RepeatType.WEEKLY -> {
                // Match the original day of week and time
                val targetDayOfWeek = baseZoned.dayOfWeek
                var nextCandidate = fromZoned.withHour(baseZoned.hour)
                    .withMinute(baseZoned.minute)
                    .withSecond(baseZoned.second)
                    .withNano(0)

                // Advance days until day of week matches and is after now
                while (nextCandidate.dayOfWeek != targetDayOfWeek || !nextCandidate.isAfter(fromZoned)) {
                    nextCandidate = nextCandidate.plusDays(1)
                }
                return nextCandidate.toInstant()
            }

            RepeatType.ONCE -> return null
        }
    }
}
