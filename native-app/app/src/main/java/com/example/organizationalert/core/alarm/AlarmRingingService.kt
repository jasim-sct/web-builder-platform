package com.example.organizationalert.core.alarm

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.IBinder
import android.os.PowerManager
import android.util.Log
import androidx.core.app.NotificationCompat
import com.example.organizationalert.R
import com.example.organizationalert.ui.feature.receive.MandatoryReceiveActivity

/**
 * Foreground service that owns alarm audio/vibration lifecycle.
 * Notification exists only to satisfy FGS requirements — not the primary UX.
 */
class AlarmRingingService : Service() {

    private var audioController: AlarmAudioController? = null
    private var vibrationController: AlarmVibrationController? = null
    private var wakeLock: PowerManager.WakeLock? = null

    override fun onCreate() {
        super.onCreate()
        audioController = AlarmAudioController(this)
        vibrationController = AlarmVibrationController(this)
        createChannel()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when (intent?.action) {
            ACTION_STOP -> {
                stopAlarmSession()
                stopSelf()
                return START_NOT_STICKY
            }
            ACTION_START, null -> {
                val sessionId = intent?.getStringExtra(EXTRA_SESSION_ID) ?: return START_NOT_STICKY
                if (activeSessionId != null && activeSessionId != sessionId) {
                    Log.w(TAG, "[ALARM_FGS] Another session active; ignoring $sessionId")
                    return START_NOT_STICKY
                }
                activeSessionId = sessionId
                acquireWakeLock()
                startForeground(NOTIFICATION_ID, buildMinimalNotification(sessionId, intent))
                audioController?.start()
                if (intent.getBooleanExtra(EXTRA_VIBRATION_ENABLED, true)) {
                    vibrationController?.start()
                }
                launchFullScreenUi(intent)
                return START_STICKY
            }
            else -> return START_NOT_STICKY
        }
    }

    override fun onDestroy() {
        stopAlarmSession()
        super.onDestroy()
    }

    override fun onBind(intent: Intent?): IBinder? = null

    private fun launchFullScreenUi(intent: Intent) {
        val fullScreenIntent = Intent(this, MandatoryReceiveActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or
                Intent.FLAG_ACTIVITY_NO_USER_ACTION or
                Intent.FLAG_ACTIVITY_CLEAR_TOP or
                Intent.FLAG_ACTIVITY_SINGLE_TOP
            putExtra(MandatoryReceiveActivity.EXTRA_EVENT_ID, intent.getStringExtra(EXTRA_SESSION_ID))
            putExtra(MandatoryReceiveActivity.EXTRA_TITLE, intent.getStringExtra(EXTRA_TITLE))
            putExtra(MandatoryReceiveActivity.EXTRA_MESSAGE, intent.getStringExtra(EXTRA_MESSAGE))
            putExtra(MandatoryReceiveActivity.EXTRA_PRIORITY, intent.getStringExtra(EXTRA_PRIORITY))
            putExtra(MandatoryReceiveActivity.EXTRA_SCHEDULED_AT, intent.getLongExtra(EXTRA_SCHEDULED_AT, System.currentTimeMillis()))
            putExtra(MandatoryReceiveActivity.EXTRA_BROADCASTER_NAME, intent.getStringExtra(EXTRA_BROADCASTER_NAME))
            putExtra(MandatoryReceiveActivity.EXTRA_GROUP_NAME, intent.getStringExtra(EXTRA_GROUP_NAME))
            putExtra(MandatoryReceiveActivity.EXTRA_REQUIRES_ACK, intent.getBooleanExtra(EXTRA_REQUIRES_ACK, true))
        }
        startActivity(fullScreenIntent)
    }

    private fun buildMinimalNotification(sessionId: String, intent: Intent): Notification {
        val title = intent.getStringExtra(EXTRA_TITLE) ?: getString(R.string.alarm_notification_title)
        val stopIntent = Intent(this, AlarmRingingService::class.java).apply {
            action = ACTION_STOP
            putExtra(EXTRA_SESSION_ID, sessionId)
        }
        val stopPending = PendingIntent.getService(
            this,
            sessionId.hashCode(),
            stopIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setSmallIcon(android.R.drawable.ic_lock_idle_alarm)
            .setContentTitle(title)
            .setContentText(getString(R.string.alarm_notification_text))
            .setCategory(NotificationCompat.CATEGORY_ALARM)
            .setPriority(NotificationCompat.PRIORITY_MAX)
            .setOngoing(true)
            .setSilent(true)
            .addAction(android.R.drawable.ic_menu_close_clear_cancel, getString(R.string.alarm_dismiss), stopPending)
            .build()
    }

    private fun createChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                getString(R.string.channel_alarm_ringing_name),
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = getString(R.string.channel_alarm_ringing_desc)
                setSound(null, null)
                enableVibration(false)
                setShowBadge(false)
            }
            val nm = getSystemService(NotificationManager::class.java)
            nm.createNotificationChannel(channel)
        }
    }

    private fun acquireWakeLock() {
        val pm = getSystemService(Context.POWER_SERVICE) as PowerManager
        wakeLock = pm.newWakeLock(
            PowerManager.PARTIAL_WAKE_LOCK,
            "OrganizationAlert:AlarmRinging"
        ).apply {
            acquire(10 * 60 * 1000L)
        }
    }

    private fun releaseWakeLock() {
        try {
            wakeLock?.let {
                if (it.isHeld) it.release()
            }
        } catch (_: Exception) {
        }
        wakeLock = null
    }

    private fun stopAlarmSession() {
        audioController?.stop()
        vibrationController?.stop()
        releaseWakeLock()
        if (activeSessionId != null) {
            stopForeground(STOP_FOREGROUND_REMOVE)
        }
        activeSessionId = null
    }

    companion object {
        private const val TAG = "AlarmRingingService"
        const val ACTION_START = "com.example.organizationalert.action.ALARM_START"
        const val ACTION_STOP = "com.example.organizationalert.action.ALARM_STOP"
        const val EXTRA_SESSION_ID = "extra_session_id"
        const val EXTRA_TITLE = "extra_title"
        const val EXTRA_MESSAGE = "extra_message"
        const val EXTRA_PRIORITY = "extra_priority"
        const val EXTRA_SCHEDULED_AT = "extra_scheduled_at"
        const val EXTRA_BROADCASTER_NAME = "extra_broadcaster_name"
        const val EXTRA_GROUP_NAME = "extra_group_name"
        const val EXTRA_VIBRATION_ENABLED = "extra_vibration_enabled"
        const val EXTRA_REQUIRES_ACK = "extra_requires_ack"
        private const val CHANNEL_ID = "alarm_ringing_service"
        private const val NOTIFICATION_ID = 9001

        @Volatile
        var activeSessionId: String? = null
            private set

        fun start(context: Context, trigger: AlarmTrigger) {
            val intent = Intent(context, AlarmRingingService::class.java).apply {
                action = ACTION_START
                putExtra(EXTRA_SESSION_ID, trigger.sessionId)
                putExtra(EXTRA_TITLE, trigger.title)
                putExtra(EXTRA_MESSAGE, trigger.message)
                putExtra(EXTRA_PRIORITY, trigger.priority.name)
                putExtra(EXTRA_SCHEDULED_AT, trigger.scheduledAt.toEpochMilli())
                putExtra(EXTRA_BROADCASTER_NAME, trigger.broadcasterName)
                putExtra(EXTRA_GROUP_NAME, trigger.groupName)
                putExtra(EXTRA_VIBRATION_ENABLED, trigger.vibrationEnabled)
                putExtra(EXTRA_REQUIRES_ACK, trigger.requiresAcknowledge)
            }
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                context.startForegroundService(intent)
            } else {
                context.startService(intent)
            }
        }

        fun stop(context: Context, sessionId: String) {
            val intent = Intent(context, AlarmRingingService::class.java).apply {
                action = ACTION_STOP
                putExtra(EXTRA_SESSION_ID, sessionId)
            }
            context.startService(intent)
        }
    }
}
