package com.example.organizationalert.core.alarm

import com.example.organizationalert.domain.model.AlarmType
import com.example.organizationalert.domain.model.Priority
import java.time.Instant

/**
 * Portable alarm trigger payload for both Event and legacy Alert pipelines.
 */
data class AlarmTrigger(
    val sessionId: String,
    val title: String,
    val message: String,
    val priority: Priority,
    val scheduledAt: Instant,
    val alarmType: AlarmType,
    val groupId: String? = null,
    val groupName: String? = null,
    val broadcasterId: String? = null,
    val broadcasterName: String? = null,
    val vibrationEnabled: Boolean = true,
    val requiresAcknowledge: Boolean = true,
    /** When non-empty, only these user IDs should ring (targeted immediate). */
    val recipientUserIds: List<String>? = null
)

enum class AlarmStopReason {
    ACKNOWLEDGED,
    DISMISSED,
    SUPERSEDED,
    ERROR
}
