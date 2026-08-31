package com.example.organizationalert.receiver

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.util.Log
import com.example.organizationalert.core.alarm.AlarmEngine
import com.example.organizationalert.core.database.AppDatabase
import com.example.organizationalert.core.preferences.UserPreferences
import com.example.organizationalert.domain.model.AlarmType
import com.example.organizationalert.core.scheduling.AlertScheduler
import com.example.organizationalert.core.scheduling.RecurrenceHelper
import com.example.organizationalert.domain.model.AlertStatus
import com.example.organizationalert.domain.model.Priority
import com.example.organizationalert.domain.model.RepeatType
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import java.time.Instant

/**
 * Lightweight BroadcastReceiver executed by Android AlarmManager when a scheduled alert is due.
 */
class AlertBroadcastReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent?) {
        if (intent == null || intent.action != ACTION_TRIGGER_ALERT) return

        val alertId = intent.getStringExtra(EXTRA_ALERT_ID) ?: return
        val title = intent.getStringExtra(EXTRA_TITLE) ?: "Scheduled Alert"
        val message = intent.getStringExtra(EXTRA_MESSAGE) ?: ""
        val priorityStr = intent.getStringExtra(EXTRA_PRIORITY)
        val repeatTypeStr = intent.getStringExtra(EXTRA_REPEAT_TYPE)
        val groupName = intent.getStringExtra(EXTRA_GROUP_NAME)
        val scheduledAtMillis = intent.getLongExtra(EXTRA_SCHEDULED_AT, System.currentTimeMillis())

        val priority = Priority.fromString(priorityStr)
        val repeatType = RepeatType.fromString(repeatTypeStr)
        val scheduledAt = Instant.ofEpochMilli(scheduledAtMillis)

        Log.d(TAG, "[ALARM_RECEIVER] Alarm triggered for alertId=$alertId, title='$title'")

        val database = AppDatabase.getInstance(context)
        val preferences = UserPreferences.getInstance(context)
        val alarmEngine = AlarmEngine.getInstance(context, database, preferences)

        val pendingResult = goAsync()
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val alertEntity = database.alertDao().getAlertByIdDirect(alertId)
                if (alertEntity != null) {
                    val started = alarmEngine.triggerFromAlert(alertEntity, AlarmType.SCHEDULED_ALARM)
                    if (!started) {
                        Log.d(TAG, "[ALARM_RECEIVER] Ring suppressed for alertId=$alertId (ineligible/duplicate)")
                    }
                } else {
                    Log.w(TAG, "[ALARM_RECEIVER] Alert $alertId not in local DB — cannot ring")
                }

                val now = Instant.now()

                if (repeatType == RepeatType.ONCE) {
                    database.alertDao().updateExecution(
                        id = alertId,
                        status = AlertStatus.TRIGGERED.name,
                        lastTriggered = now,
                        nextTrigger = null
                    )
                } else {
                    // Recurring alert: calculate next occurrence and re-register
                    val nextOccurrence = RecurrenceHelper.calculateNextOccurrence(
                        repeatType = repeatType,
                        baseScheduledAt = scheduledAt,
                        fromInstant = now
                    )

                    database.alertDao().updateExecution(
                        id = alertId,
                        status = AlertStatus.SCHEDULED.name,
                        lastTriggered = now,
                        nextTrigger = nextOccurrence
                    )

                    if (nextOccurrence != null && alertEntity != null) {
                        val updatedAlert = alertEntity.toDomain().copy(
                            lastTriggeredAt = now,
                            nextTriggerAt = nextOccurrence
                        )
                        val scheduler = AlertScheduler.getInstance(context)
                        scheduler.scheduleAlert(updatedAlert)
                        Log.d(TAG, "[ALARM_RECEIVER] Rescheduled recurring alert $alertId for $nextOccurrence")
                    }
                }
            } catch (e: Exception) {
                Log.e(TAG, "[ALARM_RECEIVER] Error updating execution record", e)
            } finally {
                pendingResult.finish()
            }
        }
    }

    companion object {
        private const val TAG = "AlertBroadcastReceiver"
        const val ACTION_TRIGGER_ALERT = "com.example.organizationalert.ACTION_TRIGGER_ALERT"
        const val EXTRA_ALERT_ID = "extra_alert_id"
        const val EXTRA_TITLE = "extra_title"
        const val EXTRA_MESSAGE = "extra_message"
        const val EXTRA_PRIORITY = "extra_priority"
        const val EXTRA_REPEAT_TYPE = "extra_repeat_type"
        const val EXTRA_GROUP_NAME = "extra_group_name"
        const val EXTRA_SCHEDULED_AT = "extra_scheduled_at"
    }
}

/**
 * Receiver executed upon device reboot.
 * Restores all future active alarms from Room database.
 */
class BootCompletedReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent?) {
        val action = intent?.action
        if (action == Intent.ACTION_BOOT_COMPLETED ||
            action == Intent.ACTION_MY_PACKAGE_REPLACED ||
            action == "android.intent.action.QUICKBOOT_POWERON"
        ) {
            Log.d(TAG, "[BOOT] Device rebooted ($action). Restoring future alarms from Room database...")

            val pendingResult = goAsync()
            CoroutineScope(Dispatchers.IO).launch {
                try {
                    val database = AppDatabase.getInstance(context)
                    val scheduler = AlertScheduler.getInstance(context)
                    val eventScheduler = com.example.organizationalert.core.scheduling.EventAlarmScheduler.getInstance(context)
                    
                    val futureAlerts = database.alertDao().getAllFutureScheduledAlerts()
                    var restoredCount = 0
                    for (entity in futureAlerts) {
                        val alert = entity.toDomain()
                        val success = scheduler.scheduleAlert(alert)
                        if (success) restoredCount++
                    }

                    // Centralized event reconciliation
                    val eventReconcileResult = eventScheduler.reconcileScheduledEvents(database)

                    // Flush any pending offline ACKs
                    com.example.organizationalert.core.ack.AckManager.triggerAckWorker(context)

                    Log.d(TAG, "[BOOT] Restored $restoredCount legacy alerts; Event reconciliation: $eventReconcileResult")
                } catch (e: Exception) {
                    Log.e(TAG, "[BOOT] Failed to restore alarms on boot", e)
                } finally {
                    pendingResult.finish()
                }
            }
        }
    }

    companion object {
        private const val TAG = "BootCompletedReceiver"
    }
}
