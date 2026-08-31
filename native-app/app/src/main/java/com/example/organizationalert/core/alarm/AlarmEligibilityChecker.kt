package com.example.organizationalert.core.alarm

import android.util.Log
import com.example.organizationalert.core.database.AppDatabase
import com.example.organizationalert.core.database.entity.EventEntity
import com.example.organizationalert.core.preferences.UserPreferences

/**
 * Determines whether the current device user should ring for an alarm event.
 */
class AlarmEligibilityChecker(
    private val database: AppDatabase,
    private val preferences: UserPreferences
) {

    suspend fun shouldRing(trigger: AlarmTrigger): Boolean {
        val currentUserId = preferences.getUserId()
        if (currentUserId.isNullOrBlank()) {
            Log.w(TAG, "[ELIGIBILITY] No configured user — suppressing alarm ${trigger.sessionId}")
            return false
        }

        val broadcasterId = trigger.broadcasterId
        if (!broadcasterId.isNullOrBlank() && broadcasterId == currentUserId) {
            Log.d(TAG, "[ELIGIBILITY] Broadcaster $currentUserId excluded from ringing ${trigger.sessionId}")
            return false
        }

        val groupId = trigger.groupId
        if (!groupId.isNullOrBlank()) {
            val group = database.groupDao().getGroupByIdDirect(groupId)
            if (group == null) {
                Log.w(TAG, "[ELIGIBILITY] Group $groupId not found locally — suppressing ${trigger.sessionId}")
                return false
            }
            if (!group.memberIds.contains(currentUserId)) {
                Log.d(TAG, "[ELIGIBILITY] User $currentUserId not in group ${group.name} — suppressing ${trigger.sessionId}")
                return false
            }
        }

        val recipients = trigger.recipientUserIds
        if (!recipients.isNullOrEmpty() && !recipients.contains(currentUserId)) {
            Log.d(TAG, "[ELIGIBILITY] User $currentUserId not in targeted recipients — suppressing ${trigger.sessionId}")
            return false
        }

        return true
    }

    suspend fun shouldRing(event: EventEntity): Boolean = shouldRing(
        AlarmTrigger(
            sessionId = event.eventId,
            title = event.title,
            message = event.message,
            priority = event.priority,
            scheduledAt = event.scheduledAt,
            alarmType = event.alarmType,
            groupId = event.groupId,
            groupName = event.groupName,
            broadcasterId = event.broadcasterId,
            broadcasterName = event.broadcasterName,
            vibrationEnabled = event.vibrationEnabled,
            requiresAcknowledge = event.requiresReceive
        )
    )

    companion object {
        private const val TAG = "AlarmEligibility"
    }
}
