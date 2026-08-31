package com.example.organizationalert.core.scheduling

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import android.util.Log
import com.example.organizationalert.domain.model.Alert
import com.example.organizationalert.domain.model.AlertStatus
import com.example.organizationalert.receiver.AlertBroadcastReceiver
import java.time.Instant

class AlertScheduler(private val context: Context) {

    private val alarmManager =
        context.getSystemService(Context.ALARM_SERVICE) as? AlarmManager

    /**
     * Schedules a local AlarmManager alarm for the given alert.
     * Uses deterministic request codes and exact alarm delivery while idle.
     */
    fun scheduleAlert(alert: Alert): Boolean {
        if (!alert.isEnabled || alert.status != AlertStatus.SCHEDULED) {
            Log.d(TAG, "[ALARM] Skipped scheduling inactive/disabled alert: ${alert.id}")
            return false
        }

        val triggerInstant = alert.nextTriggerAt ?: alert.scheduledAt
        val now = Instant.now()

        if (triggerInstant.isBefore(now)) {
            Log.d(TAG, "[ALARM] Past alert timestamp ($triggerInstant vs now $now), skipping alarm for: ${alert.id}")
            return false
        }

        if (alarmManager == null) {
            Log.e(TAG, "[ALARM] AlarmManager service unavailable")
            return false
        }

        val requestCode = AlertAlarmIdGenerator.generateRequestCode(alert.id)
        val intent = createAlertIntent(alert)
        val pendingIntent = PendingIntent.getBroadcast(
            context,
            requestCode,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val triggerMillis = triggerInstant.toEpochMilli()

        try {
            // Check exact alarm permission on Android 12+ (API 31+)
            val canExact = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                alarmManager.canScheduleExactAlarms()
            } else {
                true
            }

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
                // Fallback to inexact allow while idle
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
                "[ALARM] Scheduled alarm: alertId=${alert.id}, requestCode=$requestCode at ${TimezoneHelper.formatUserFriendly(triggerInstant)}"
            )
            return true
        } catch (e: SecurityException) {
            Log.e(TAG, "[ALARM] Permission error scheduling exact alarm for ${alert.id}", e)
            return false
        } catch (e: Exception) {
            Log.e(TAG, "[ALARM] Failed to schedule alarm for ${alert.id}", e)
            return false
        }
    }

    /**
     * Cancels an existing scheduled alarm by deterministic requestCode.
     */
    fun cancelAlert(alertId: String): Boolean {
        if (alarmManager == null || alertId.isBlank()) return false

        val requestCode = AlertAlarmIdGenerator.generateRequestCode(alertId)
        val intent = Intent(context, AlertBroadcastReceiver::class.java).apply {
            action = AlertBroadcastReceiver.ACTION_TRIGGER_ALERT
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
            Log.d(TAG, "[ALARM] Cancelled alarm: alertId=$alertId, requestCode=$requestCode")
            true
        } else {
            Log.d(TAG, "[ALARM] No active alarm found to cancel for alertId=$alertId, requestCode=$requestCode")
            false
        }
    }

    private fun createAlertIntent(alert: Alert): Intent {
        return Intent(context, AlertBroadcastReceiver::class.java).apply {
            action = AlertBroadcastReceiver.ACTION_TRIGGER_ALERT
            putExtra(AlertBroadcastReceiver.EXTRA_ALERT_ID, alert.id)
            putExtra(AlertBroadcastReceiver.EXTRA_TITLE, alert.title)
            putExtra(AlertBroadcastReceiver.EXTRA_MESSAGE, alert.message)
            putExtra(AlertBroadcastReceiver.EXTRA_PRIORITY, alert.priority.name)
            putExtra(AlertBroadcastReceiver.EXTRA_REPEAT_TYPE, alert.repeatType.name)
            putExtra(AlertBroadcastReceiver.EXTRA_GROUP_NAME, alert.groupName)
            putExtra(AlertBroadcastReceiver.EXTRA_SCHEDULED_AT, alert.scheduledAt.toEpochMilli())
        }
    }

    companion object {
        private const val TAG = "AlertScheduler"

        @Volatile
        private var INSTANCE: AlertScheduler? = null

        fun getInstance(context: Context): AlertScheduler {
            return INSTANCE ?: synchronized(this) {
                val instance = AlertScheduler(context.applicationContext)
                INSTANCE = instance
                instance
            }
        }
    }
}
