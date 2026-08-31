package com.example.organizationalert.domain.model

/**
 * Distinguishes normal notification UX from true alarm/ringing behavior.
 */
enum class AlarmType {
    IMMEDIATE_ALARM,
    SCHEDULED_ALARM;

    companion object {
        fun fromString(value: String?): AlarmType {
            return entries.find { it.name.equals(value, ignoreCase = true) }
                ?: SCHEDULED_ALARM
        }
    }
}
