package com.example.organizationalert.domain.model

enum class Priority {
    LOW,
    NORMAL,
    HIGH,
    URGENT;

    companion object {
        fun fromString(value: String?): Priority {
            return when {
                value.equals("MANDATORY", ignoreCase = true) -> URGENT
                value.equals("CRITICAL", ignoreCase = true) -> URGENT
                else -> entries.find { it.name.equals(value, ignoreCase = true) } ?: NORMAL
            }
        }
    }
}

enum class RepeatType {
    ONCE,
    DAILY,
    WEEKLY;

    companion object {
        fun fromString(value: String?): RepeatType {
            return entries.find { it.name.equals(value, ignoreCase = true) } ?: ONCE
        }
    }
}

enum class AlertStatus {
    SCHEDULED,
    TRIGGERED,
    DISABLED,
    CANCELLED,
    COMPLETED,
    MISSED;

    companion object {
        fun fromString(value: String?): AlertStatus {
            return entries.find { it.name.equals(value, ignoreCase = true) } ?: SCHEDULED
        }
    }
}

enum class UserRole {
    ADMIN,
    MEMBER;

    companion object {
        fun fromString(value: String?): UserRole {
            return entries.find { it.name.equals(value, ignoreCase = true) } ?: MEMBER
        }
    }
}

enum class DeliveryStatus {
    DELIVERED,
    ACKNOWLEDGED;

    companion object {
        fun fromString(value: String?): DeliveryStatus {
            return entries.find { it.name.equals(value, ignoreCase = true) } ?: DELIVERED
        }
    }
}
