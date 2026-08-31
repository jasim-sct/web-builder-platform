package com.example.organizationalert.core.scheduling

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import android.util.Log
import com.example.organizationalert.core.database.AppDatabase
import com.example.organizationalert.core.database.entity.EventEntity
import com.example.organizationalert.core.database.entity.EventStatus
import com.example.organizationalert.receiver.EventAlarmReceiver
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.time.Instant

data class ReconciliationResult(
    val scheduledCount: Int,
    val cancelledCount: Int,
    val expiredCount: Int,
    val missedCount: Int,
    val exactAlarmSupported: Boolean
)

class EventAlarmScheduler(private val context: Context) {

    private val alarmManager =
        context.getSystemService(Context.ALARM_SERVICE) as? AlarmManager

    /**
     * Checks if exact alarms can be scheduled under current OS permissions.
     */
    fun canScheduleExact(): Boolean {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S && alarmManager != null) {
            alarmManager.canScheduleExactAlarms()
        } else true
    }

    /**
     * Schedules a local AlarmManager exact alarm for an event.
     */
    fun scheduleEvent(event: EventEntity): Boolean {
        if (event.status != EventStatus.SCHEDULED) {
            Log.d(TAG, "[EVENT_SCHEDULED] Skipped non-scheduled event: ${event.eventId}")
            return false
        }

        val triggerInstant = event.scheduledAt
        val now = Instant.now()

        // Expiration check: if event has already expired, do not schedule
        if (event.expiresAt != null && event.expiresAt.isBefore(now)) {
            Log.d(TAG, "[EVENT_EXPIRED] Event ${event.eventId} already expired at ${event.expiresAt}, skipping.")
            return false
        }

        if (triggerInstant.isBefore(now)) {
            Log.d(TAG, "[EVENT_MISSED] Past timestamp ($triggerInstant), skipping alarm for: ${event.eventId}")
            return false
        }

        if (alarmManager == null) {
            Log.e(TAG, "[EVENT_SCHEDULED] AlarmManager unavailable")
            return false
        }

        val requestCode = AlertAlarmIdGenerator.generateRequestCode(event.eventId)
        val intent = Intent(context, EventAlarmReceiver::class.java).apply {
            action = EventAlarmReceiver.ACTION_TRIGGER_EVENT
            putExtra(EventAlarmReceiver.EXTRA_EVENT_ID, event.eventId)
            putExtra(EventAlarmReceiver.EXTRA_TITLE, event.title)
            putExtra(EventAlarmReceiver.EXTRA_MESSAGE, event.message)
            putExtra(EventAlarmReceiver.EXTRA_PRIORITY, event.priority.name)
            putExtra(EventAlarmReceiver.EXTRA_SCHEDULED_AT, event.scheduledAt.toEpochMilli())
            if (event.expiresAt != null) {
                putExtra(EventAlarmReceiver.EXTRA_EXPIRES_AT, event.expiresAt.toEpochMilli())
            }
            putExtra(EventAlarmReceiver.EXTRA_GROUP_ID, event.groupId)
            putExtra(EventAlarmReceiver.EXTRA_GROUP_NAME, event.groupName)
            putExtra(EventAlarmReceiver.EXTRA_BROADCASTER_ID, event.broadcasterId)
            putExtra(EventAlarmReceiver.EXTRA_BROADCASTER_NAME, event.broadcasterName)
        }

        val pendingIntent = PendingIntent.getBroadcast(
            context,
            requestCode,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val triggerMillis = triggerInstant.toEpochMilli()

        try {
            val canExact = canScheduleExact()

            if (canExact) {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                    alarmManager.setExactAndAllowWhileIdle(
                        AlarmManager.RTC_WAKEUP,
                        triggerMillis,
                        pendingIntent
                    )
                } else {
                    alarmManager.setExact(
                        AlarmManager.RTC_WAKEUP,
                        triggerMillis,
                        pendingIntent
                    )
                }
            } else {
                Log.w(TAG, "[EXACT_ALARM_RESTRICTED] Exact alarm permission restricted! Using setAndAllowWhileIdle fallback for ${event.eventId}")
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                    alarmManager.setAndAllowWhileIdle(
                        AlarmManager.RTC_WAKEUP,
                        triggerMillis,
                        pendingIntent
                    )
                } else {
                    alarmManager.set(
                        AlarmManager.RTC_WAKEUP,
                        triggerMillis,
                        pendingIntent
                    )
                }
            }

            Log.d(
                TAG,
                "[EVENT_SCHEDULED] Successfully scheduled eventId=${event.eventId}, requestCode=$requestCode for ${TimezoneHelper.formatUserFriendly(triggerInstant)}"
            )
            return true
        } catch (e: Exception) {
            Log.e(TAG, "[EVENT_SCHEDULED] Failed to schedule alarm for ${event.eventId}", e)
            return false
        }
    }

    /**
     * Cancels an alarm for a specific event.
     */
    fun cancelEvent(eventId: String): Boolean {
        if (alarmManager == null || eventId.isBlank()) return false

        val requestCode = AlertAlarmIdGenerator.generateRequestCode(eventId)
        val intent = Intent(context, EventAlarmReceiver::class.java).apply {
            action = EventAlarmReceiver.ACTION_TRIGGER_EVENT
        }
        val pendingIntent = PendingIntent.getBroadcast(
            context,
            requestCode,
            intent,
            PendingIntent.FLAG_NO_CREATE or PendingIntent.FLAG_IMMUTABLE
        )

        return if (pendingIntent != null) {
            alarmManager.cancel(pendingIntent)
            pendingIntent.cancel()
            Log.d(TAG, "[EVENT_CANCELLED] Cancelled alarm for eventId=$eventId")
            true
        } else false
    }

    /**
     * Centralized schedule reconciliation mechanism.
     * Evaluates active events, cancels obsolete alarms, and registers valid future alarms.
     */
    suspend fun reconcileScheduledEvents(database: AppDatabase): ReconciliationResult = withContext(Dispatchers.IO) {
        val now = Instant.now()
        val allEvents = database.eventDao().getAllFutureScheduledEvents()
        val canExact = canScheduleExact()

        var scheduled = 0
        var cancelled = 0
        var expired = 0
        var missed = 0

        Log.d(TAG, "[ALARM_RECONCILE] Starting reconciliation for ${allEvents.size} events...")

        for (event in allEvents) {
            when {
                event.status == EventStatus.CANCELLED -> {
                    cancelEvent(event.eventId)
                    cancelled++
                }
                event.expiresAt != null && event.expiresAt.isBefore(now) -> {
                    cancelEvent(event.eventId)
                    database.eventDao().markPresentationBlocked(event.eventId, EventStatus.EXPIRED, "Event expired prior to trigger")
                    expired++
                }
                event.scheduledAt.isBefore(now) -> {
                    cancelEvent(event.eventId)
                    missed++
                }
                event.status == EventStatus.SCHEDULED -> {
                    val success = scheduleEvent(event)
                    if (success) scheduled++
                }
                else -> {
                    cancelEvent(event.eventId)
                    cancelled++
                }
            }
        }

        Log.d(
            TAG,
            "[ALARM_RECONCILE] Completed: scheduled=$scheduled, cancelled=$cancelled, expired=$expired, missed=$missed, canExact=$canExact"
        )

        ReconciliationResult(
            scheduledCount = scheduled,
            cancelledCount = cancelled,
            expiredCount = expired,
            missedCount = missed,
            exactAlarmSupported = canExact
        )
    }

    companion object {
        private const val TAG = "EventAlarmScheduler"

        @Volatile
        private var INSTANCE: EventAlarmScheduler? = null

        fun getInstance(context: Context): EventAlarmScheduler {
            return INSTANCE ?: synchronized(this) {
                val instance = EventAlarmScheduler(context.applicationContext)
                INSTANCE = instance
                instance
            }
        }
    }
}
