package com.example.organizationalert.core.presentation

import android.util.Log
import com.example.organizationalert.core.alarm.AlarmEngine
import com.example.organizationalert.core.database.AppDatabase
import com.example.organizationalert.core.database.entity.EventEntity
import com.example.organizationalert.core.database.entity.EventStatus
import com.example.organizationalert.core.preferences.UserPreferences
import com.example.organizationalert.domain.model.AlarmType
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import java.time.Instant

/**
 * Routes event presentation to the [AlarmEngine] (ringing system).
 * Notification shade is not the primary UX.
 */
class PresentationEngine(
    private val context: android.content.Context,
    private val database: AppDatabase,
    private val preferences: UserPreferences
) {
    private val alarmEngine = AlarmEngine.getInstance(context, database, preferences)

    fun presentEvent(event: EventEntity) {
        Log.d(TAG, "[PRESENTATION] Delegating to AlarmEngine for eventId=${event.eventId}")
        CoroutineScope(Dispatchers.IO).launch {
            val now = Instant.now()
            if (event.expiresAt != null && event.expiresAt.isBefore(now)) {
                Log.d(TAG, "[PRESENTATION] Event expired before ring: ${event.eventId}")
                database.eventDao().markPresentationBlocked(
                    eventId = event.eventId,
                    status = EventStatus.EXPIRED,
                    error = "Expired at ${event.expiresAt}"
                )
                return@launch
            }
            val started = alarmEngine.triggerFromEvent(event, event.alarmType)
            if (started) {
                database.eventDao().markDisplayed(
                    eventId = event.eventId,
                    status = EventStatus.PRESENTED,
                    displayedAt = Instant.now()
                )
            } else {
                database.eventDao().markPresentationBlocked(
                    eventId = event.eventId,
                    status = EventStatus.PRESENTATION_BLOCKED,
                    error = "Alarm suppressed (ineligible or duplicate)"
                )
            }
        }
    }

    fun presentImmediateAlarm(
        sessionId: String,
        title: String,
        message: String,
        priority: com.example.organizationalert.domain.model.Priority,
        groupId: String?,
        groupName: String?,
        broadcasterId: String?,
        broadcasterName: String?,
        recipientUserIds: List<String>? = null
    ) {
        CoroutineScope(Dispatchers.IO).launch {
            val stored = ImmediateEventStore.upsertImmediateEvent(
                database, preferences, sessionId, title, message, priority,
                groupId, groupName, broadcasterId, broadcasterName
            )
            if (stored == null) {
                Log.d(TAG, "[PRESENTATION] Duplicate immediate session suppressed: $sessionId")
                return@launch
            }
            val started = alarmEngine.trigger(
                com.example.organizationalert.core.alarm.AlarmTrigger(
                    sessionId = sessionId,
                    title = title,
                    message = message,
                    priority = priority,
                    scheduledAt = Instant.now(),
                    alarmType = AlarmType.IMMEDIATE_ALARM,
                    groupId = groupId,
                    groupName = groupName,
                    broadcasterId = broadcasterId,
                    broadcasterName = broadcasterName,
                    recipientUserIds = recipientUserIds
                ),
                persistEventId = sessionId
            )
            if (started) {
                database.eventDao().markDisplayed(
                    eventId = sessionId,
                    status = EventStatus.PRESENTED,
                    displayedAt = Instant.now()
                )
            }
        }
    }

    companion object {
        private const val TAG = "PresentationEngine"

        @Volatile
        private var INSTANCE: PresentationEngine? = null

        fun getInstance(context: android.content.Context, database: AppDatabase): PresentationEngine {
            return INSTANCE ?: synchronized(this) {
                val instance = PresentationEngine(
                    context.applicationContext,
                    database,
                    UserPreferences.getInstance(context)
                )
                INSTANCE = instance
                instance
            }
        }
    }
}
