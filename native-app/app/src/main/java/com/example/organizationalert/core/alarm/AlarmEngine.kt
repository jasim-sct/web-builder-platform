package com.example.organizationalert.core.alarm

import android.content.Context
import android.util.Log
import androidx.room.withTransaction
import com.example.organizationalert.core.database.AppDatabase
import com.example.organizationalert.core.database.entity.EventEntity
import com.example.organizationalert.core.database.entity.EventStatus
import com.example.organizationalert.core.database.entity.AlertEntity
import com.example.organizationalert.core.preferences.UserPreferences
import com.example.organizationalert.domain.model.AlarmType
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import kotlinx.coroutines.withContext
import java.time.Instant

/**
 * Central alarm/ringing engine — owns sound, vibration, full-screen UI, and duplicate protection.
 */
class AlarmEngine(
    private val context: Context,
    private val database: AppDatabase,
    private val preferences: UserPreferences
) {
    private val eligibilityChecker = AlarmEligibilityChecker(database, preferences)
    private val sessionMutex = Mutex()

    suspend fun triggerFromEvent(event: EventEntity, alarmType: AlarmType = event.alarmType): Boolean {
        return trigger(
            AlarmTrigger(
                sessionId = event.eventId,
                title = event.title,
                message = event.message,
                priority = event.priority,
                scheduledAt = event.scheduledAt,
                alarmType = alarmType,
                groupId = event.groupId,
                groupName = event.groupName,
                broadcasterId = event.broadcasterId,
                broadcasterName = event.broadcasterName,
                vibrationEnabled = event.vibrationEnabled,
                requiresAcknowledge = event.requiresReceive
            ),
            persistEventId = event.eventId
        )
    }

    suspend fun triggerFromAlert(alert: AlertEntity, alarmType: AlarmType): Boolean {
        val recipientIds = try {
            val arr = org.json.JSONArray(alert.recipientUserIdsJson)
            (0 until arr.length()).mapNotNull { i -> arr.optString(i).takeIf { it.isNotBlank() } }
        } catch (_: Exception) {
            emptyList()
        }
        return trigger(
            AlarmTrigger(
                sessionId = alert.id,
                title = alert.title,
                message = alert.message,
                priority = alert.priority,
                scheduledAt = alert.scheduledAt,
                alarmType = alarmType,
                groupId = alert.groupId,
                groupName = alert.groupName,
                broadcasterId = alert.createdBy,
                broadcasterName = alert.creatorName,
                vibrationEnabled = true,
                requiresAcknowledge = true,
                recipientUserIds = recipientIds.takeIf { it.isNotEmpty() }
            ),
            persistEventId = null
        )
    }

    suspend fun trigger(trigger: AlarmTrigger, persistEventId: String?): Boolean = withContext(Dispatchers.IO) {
        sessionMutex.withLock {
            if (!eligibilityChecker.shouldRing(trigger)) {
                Log.d(TAG, "[ALARM_SUPPRESSED] Not eligible: ${trigger.sessionId}")
                return@withContext false
            }

            if (AlarmRingingService.activeSessionId == trigger.sessionId) {
                Log.d(TAG, "[ALARM_DUPLICATE] Session already ringing: ${trigger.sessionId}")
                return@withContext true
            }

            if (persistEventId != null) {
                val claimed = claimEventRinging(persistEventId)
                if (!claimed) {
                    val existing = database.eventDao().getEventByEventIdDirect(persistEventId)
                    if (existing?.status == EventStatus.RINGING ||
                        existing?.status == EventStatus.RECEIVED ||
                        existing?.status == EventStatus.DISMISSED
                    ) {
                        Log.d(TAG, "[ALARM_DUPLICATE] Event already in terminal/ringing state: $persistEventId")
                        return@withContext existing.status == EventStatus.RINGING
                    }
                    Log.w(TAG, "[ALARM_BLOCKED] Could not claim ringing state for $persistEventId")
                    return@withContext false
                }
            } else if (AlarmRingingService.activeSessionId != null) {
                Log.w(TAG, "[ALARM_BLOCKED] Another session active: ${AlarmRingingService.activeSessionId}")
                return@withContext false
            }

            Log.d(TAG, "[ALARM_START] type=${trigger.alarmType} session=${trigger.sessionId}")
            AlarmRingingService.start(context.applicationContext, trigger)
            true
        }
    }

    fun stop(sessionId: String, reason: AlarmStopReason) {
        Log.d(TAG, "[ALARM_STOP] session=$sessionId reason=$reason")
        AlarmRingingService.stop(context.applicationContext, sessionId)
    }

    private suspend fun claimEventRinging(eventId: String): Boolean {
        val now = Instant.now()
        val updated = database.eventDao().markRingingIfEligible(
            eventId = eventId,
            status = EventStatus.RINGING,
            ringingStartedAt = now
        )
        if (updated > 0) return true
        val existing = database.eventDao().getEventByEventIdDirect(eventId)
        return existing?.status == EventStatus.RINGING
    }

    companion object {
        private const val TAG = "AlarmEngine"

        @Volatile
        private var INSTANCE: AlarmEngine? = null

        fun getInstance(context: Context, database: AppDatabase, preferences: UserPreferences): AlarmEngine {
            return INSTANCE ?: synchronized(this) {
                val instance = AlarmEngine(context.applicationContext, database, preferences)
                INSTANCE = instance
                instance
            }
        }
    }
}
