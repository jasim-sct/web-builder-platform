package com.example.organizationalert.receiver

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.util.Log
import com.example.organizationalert.core.ack.AckManager
import com.example.organizationalert.core.alarm.AlarmEngine
import com.example.organizationalert.core.alarm.AlarmStopReason
import com.example.organizationalert.core.database.AppDatabase
import com.example.organizationalert.core.database.entity.EventEntity
import com.example.organizationalert.core.database.entity.EventStatus
import com.example.organizationalert.core.presentation.PresentationEngine
import com.example.organizationalert.core.preferences.UserPreferences
import com.example.organizationalert.domain.model.AlarmType
import com.example.organizationalert.domain.model.Priority
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import java.time.Instant

/**
 * Receiver invoked by AlarmManager when a scheduled ring event fires.
 */
class EventAlarmReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent?) {
        if (intent == null) return

        val action = intent.action
        val eventId = intent.getStringExtra(EXTRA_EVENT_ID) ?: return

        Log.d(TAG, "[ALARM_TRIGGERED] Received broadcast action=$action for eventId=$eventId")

        val database = AppDatabase.getInstance(context)
        val preferences = UserPreferences.getInstance(context)
        val presentationEngine = PresentationEngine.getInstance(context, database)
        val alarmEngine = AlarmEngine.getInstance(context, database, preferences)
        val ackManager = AckManager.getInstance(context, database, preferences)

        val pendingResult = goAsync()

        CoroutineScope(Dispatchers.IO).launch {
            try {
                when (action) {
                    ACTION_RECEIVE_EVENT -> {
                        alarmEngine.stop(eventId, AlarmStopReason.ACKNOWLEDGED)
                        ackManager.markReceived(eventId)
                    }
                    ACTION_DISMISS_EVENT -> {
                        alarmEngine.stop(eventId, AlarmStopReason.DISMISSED)
                        ackManager.markDismissed(eventId)
                    }
                    ACTION_TRIGGER_EVENT -> {
                        val now = Instant.now()
                        val expiresMillis = intent.getLongExtra(EXTRA_EXPIRES_AT, 0L)
                        if (expiresMillis > 0L && Instant.ofEpochMilli(expiresMillis).isBefore(now)) {
                            Log.d(TAG, "[EVENT_EXPIRED] Event $eventId expired before ring.")
                            database.eventDao().markPresentationBlocked(
                                eventId,
                                EventStatus.EXPIRED,
                                "Expired at ${Instant.ofEpochMilli(expiresMillis)}"
                            )
                            return@launch
                        }

                        var event = database.eventDao().getEventByEventIdDirect(eventId)
                        if (event == null) {
                            val title = intent.getStringExtra(EXTRA_TITLE) ?: "Scheduled Alarm"
                            val message = intent.getStringExtra(EXTRA_MESSAGE) ?: ""
                            val priorityStr = intent.getStringExtra(EXTRA_PRIORITY)
                            val scheduledMillis = intent.getLongExtra(EXTRA_SCHEDULED_AT, System.currentTimeMillis())

                            presentationEngine.presentImmediateAlarm(
                                sessionId = eventId,
                                title = title,
                                message = message,
                                priority = Priority.fromString(priorityStr),
                                groupId = intent.getStringExtra(EXTRA_GROUP_ID),
                                groupName = intent.getStringExtra(EXTRA_GROUP_NAME),
                                broadcasterId = intent.getStringExtra(EXTRA_BROADCASTER_ID),
                                broadcasterName = intent.getStringExtra(EXTRA_BROADCASTER_NAME)
                            )
                            return@launch
                        }

                        val expiresAt = event.expiresAt
                        if (expiresAt != null && expiresAt.isBefore(now)) {
                            database.eventDao().markPresentationBlocked(eventId, EventStatus.EXPIRED, "Expired at $expiresAt")
                            return@launch
                        }

                        database.eventDao().markTriggered(eventId, EventStatus.TRIGGERED, now)
                        event = event.copy(
                            status = EventStatus.TRIGGERED,
                            triggeredAt = now,
                            alarmType = AlarmType.SCHEDULED_ALARM
                        )
                        presentationEngine.presentEvent(event)
                    }
                }
            } catch (e: Exception) {
                Log.e(TAG, "[ALARM_TRIGGERED] Error in EventAlarmReceiver", e)
            } finally {
                pendingResult.finish()
            }
        }
    }

    companion object {
        private const val TAG = "EventAlarmReceiver"
        const val ACTION_TRIGGER_EVENT = "com.example.organizationalert.ACTION_TRIGGER_EVENT"
        const val ACTION_RECEIVE_EVENT = "com.example.organizationalert.ACTION_RECEIVE_EVENT"
        const val ACTION_DISMISS_EVENT = "com.example.organizationalert.ACTION_DISMISS_EVENT"

        const val EXTRA_EVENT_ID = "extra_event_id"
        const val EXTRA_TITLE = "extra_title"
        const val EXTRA_MESSAGE = "extra_message"
        const val EXTRA_PRIORITY = "extra_priority"
        const val EXTRA_SCHEDULED_AT = "extra_scheduled_at"
        const val EXTRA_EXPIRES_AT = "extra_expires_at"
        const val EXTRA_GROUP_ID = "extra_group_id"
        const val EXTRA_GROUP_NAME = "extra_group_name"
        const val EXTRA_BROADCASTER_ID = "extra_broadcaster_id"
        const val EXTRA_BROADCASTER_NAME = "extra_broadcaster_name"
    }
}

/**
 * Receiver invoked upon system timezone or clock modifications.
 */
class TimezoneChangeReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent?) {
        val action = intent?.action
        if (action == Intent.ACTION_TIMEZONE_CHANGED ||
            action == "android.intent.action.TIME_SET" ||
            action == "android.app.action.SCHEDULE_EXACT_ALARM_PERMISSION_STATE_CHANGED"
        ) {
            Log.d(TAG, "[TIME_OR_PERMISSION_CHANGE] Reconciling local alarms ($action)...")

            val pendingResult = goAsync()
            CoroutineScope(Dispatchers.IO).launch {
                try {
                    val database = AppDatabase.getInstance(context)
                    val scheduler = com.example.organizationalert.core.scheduling.EventAlarmScheduler.getInstance(context)
                    val result = scheduler.reconcileScheduledEvents(database)
                    Log.d(TAG, "[TIME_OR_PERMISSION_CHANGE] Reconciliation completed: $result")
                } catch (e: Exception) {
                    Log.e(TAG, "[TIME_OR_PERMISSION_CHANGE] Error reconciling alarms", e)
                } finally {
                    pendingResult.finish()
                }
            }
        }
    }

    companion object {
        private const val TAG = "TimezoneChangeReceiver"
    }
}
