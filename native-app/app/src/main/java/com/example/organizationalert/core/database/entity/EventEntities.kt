package com.example.organizationalert.core.database.entity

import androidx.room.Entity
import androidx.room.Index
import androidx.room.PrimaryKey
import com.example.organizationalert.domain.model.AlarmType
import com.example.organizationalert.domain.model.Priority
import java.time.Instant

/**
 * Local Event Presentation Lifecycle State (Orthogonal to Network ACK state)
 */
enum class EventStatus {
    SCHEDULED,
    TRIGGERED,
    RINGING,
    PRESENTED,
    PRESENTATION_BLOCKED,
    RECEIVED,
    DISMISSED,
    EXPIRED,
    CANCELLED,
    MISSED;

    companion object {
        fun fromString(value: String?): EventStatus {
            return entries.find { it.name.equals(value, ignoreCase = true) } ?: SCHEDULED
        }
    }
}

/**
 * Network Acknowledgement Transport State
 */
enum class AckStatus {
    NOT_REQUIRED,
    PENDING,
    SENDING,
    CONFIRMED,
    FAILED;

    companion object {
        fun fromString(value: String?): AckStatus {
            return entries.find { it.name.equals(value, ignoreCase = true) } ?: PENDING
        }
    }
}

enum class QueueStatus {
    PENDING,
    IN_PROGRESS,
    FAILED,
    SUCCESS;

    companion object {
        fun fromString(value: String?): QueueStatus {
            return entries.find { it.name.equals(value, ignoreCase = true) } ?: PENDING
        }
    }
}

@Entity(
    tableName = "events",
    indices = [
        Index(value = ["eventId"], unique = true),
        Index(value = ["status", "scheduledAt"]),
        Index(value = ["ackStatus"]),
        Index(value = ["priority"]),
        Index(value = ["organizationId"])
    ]
)
data class EventEntity(
    @PrimaryKey val id: String, // Matches eventId
    val eventId: String,
    val userId: String?,
    val organizationId: String,
    val groupId: String?,
    val groupName: String? = null,
    val type: String = "ALERT",
    val alarmType: AlarmType = AlarmType.SCHEDULED_ALARM,
    val broadcasterId: String? = null,
    val broadcasterName: String? = null,
    val vibrationEnabled: Boolean = true,
    val title: String,
    val message: String,
    val payload: String = "{}",
    val priority: Priority = Priority.NORMAL,
    val requiresReceive: Boolean = true,
    val status: EventStatus = EventStatus.SCHEDULED,
    val ackStatus: AckStatus = AckStatus.PENDING,
    val createdAt: Instant = Instant.now(),
    val syncedAt: Instant = createdAt,
    val scheduledAt: Instant,
    val scheduledAtUtc: Instant = scheduledAt,
    val timezoneId: String = "UTC",
    val triggeredAt: Instant? = null,
    val displayedAt: Instant? = null,
    val presentedAt: Instant? = displayedAt,
    val receivedAt: Instant? = null,
    val dismissedAt: Instant? = null,
    val ringingStartedAt: Instant? = null,
    val acknowledgedAt: Instant? = null,
    val ackConfirmedAt: Instant? = acknowledgedAt,
    val expiresAt: Instant? = null,
    val retryCount: Int = 0,
    val lastAttemptAt: Instant? = null,
    val lastError: String? = null,
    val serverVersion: Int = 1,
    val localVersion: Int = 1
)

@Entity(
    tableName = "ack_queue",
    indices = [
        Index(value = ["eventId", "status"]),
        Index(value = ["nextRetryAt"])
    ]
)
data class AckQueueEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val eventId: String,
    val action: String = "RECEIVE",
    val userId: String?,
    val deviceId: String,
    val receivedAt: Instant,
    val payload: String = "{}",
    val status: QueueStatus = QueueStatus.PENDING,
    val retryCount: Int = 0,
    val nextRetryAt: Instant = Instant.now(),
    val lastAttemptAt: Instant? = null,
    val lastError: String? = null,
    val createdAt: Instant = Instant.now()
)

@Entity(tableName = "devices")
data class DeviceRegistrationEntity(
    @PrimaryKey val deviceId: String,
    val userId: String,
    val installationId: String,
    val platform: String = "ANDROID",
    val appVersion: String = "1.0.0",
    val osVersion: String = "",
    val timezone: String = "UTC",
    val isRegistered: Boolean = false,
    val lastRegisteredAt: Instant = Instant.now()
)
