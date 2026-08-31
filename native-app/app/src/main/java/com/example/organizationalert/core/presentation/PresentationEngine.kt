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
        broadcasterName: String?
    ) {
        CoroutineScope(Dispatchers.IO).launch {
            alarmEngine.trigger(
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
                    broadcasterName = broadcasterName
                ),
                persistEventId = null
            )
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
