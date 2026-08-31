package com.example.organizationalert.core.notifications

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.ContentResolver
import android.content.Context
import android.content.Intent
import android.media.AudioAttributes
import android.net.Uri
import android.os.Build
import android.util.Log
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import com.example.organizationalert.MainActivity
import com.example.organizationalert.R
import com.example.organizationalert.domain.model.Alert
import com.example.organizationalert.domain.model.Priority
import java.util.concurrent.atomic.AtomicInteger

class NotificationHelper(private val context: Context) {

    private val notificationManager =
        context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

    init {
        createNotificationChannels()
    }

    /**
     * Initializes Android Notification Channels with sound and vibration configurations.
     */
    fun createNotificationChannels() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val soundUri = getNotificationSoundUri()

            val audioAttributes = AudioAttributes.Builder()
                .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                .setUsage(AudioAttributes.USAGE_NOTIFICATION_EVENT)
                .build()

            // 1. Urgent alerts channel (Immediate broadcasts, urgent alarms)
            val urgentChannel = NotificationChannel(
                CHANNEL_URGENT_ID,
                context.getString(R.string.channel_urgent_name),
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = context.getString(R.string.channel_urgent_desc)
                enableVibration(true)
                vibrationPattern = longArrayOf(0, 500, 200, 500, 200, 500)
                if (soundUri != null) {
                    setSound(soundUri, audioAttributes)
                }
                setShowBadge(true)
                lockscreenVisibility = NotificationCompat.VISIBILITY_PUBLIC
            }

            // 2. Important alerts channel (High priority scheduled reminders)
            val importantChannel = NotificationChannel(
                CHANNEL_IMPORTANT_ID,
                context.getString(R.string.channel_important_name),
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = context.getString(R.string.channel_important_desc)
                enableVibration(true)
                vibrationPattern = longArrayOf(0, 400, 200, 400)
                if (soundUri != null) {
                    setSound(soundUri, audioAttributes)
                }
                setShowBadge(true)
            }

            // 3. Normal alerts channel
            val normalChannel = NotificationChannel(
                CHANNEL_NORMAL_ID,
                context.getString(R.string.channel_normal_name),
                NotificationManager.IMPORTANCE_DEFAULT
            ).apply {
                description = context.getString(R.string.channel_normal_desc)
                enableVibration(true)
                vibrationPattern = longArrayOf(0, 250, 250, 250)
                setShowBadge(true)
            }

            notificationManager.createNotificationChannels(
                listOf(urgentChannel, importantChannel, normalChannel)
            )
            Log.d(TAG, "[NOTIFICATION] Notification channels created successfully")
        }
    }

    /**
     * Posts a notification for an alert, playing sound and vibration.
     */
    fun showNotification(
        alertId: String,
        title: String,
        message: String,
        priority: Priority = Priority.NORMAL,
        groupName: String? = null
    ) {
        val channelId = when (priority) {
            Priority.URGENT -> CHANNEL_URGENT_ID
            Priority.HIGH -> CHANNEL_IMPORTANT_ID
            else -> CHANNEL_NORMAL_ID
        }

        // Tap action: Opens MainActivity and navigates directly to Alert Details
        val intent = Intent(context, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            putExtra(EXTRA_ALERT_ID, alertId)
            putExtra(EXTRA_OPEN_ALERT_DETAILS, true)
        }

        val pendingIntent = PendingIntent.getActivity(
            context,
            alertId.hashCode(),
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val subText = if (!groupName.isNullOrBlank()) "Group: $groupName" else "Priority: ${priority.name}"

        val builder = NotificationCompat.Builder(context, channelId)
            .setSmallIcon(android.R.drawable.ic_dialog_alert)
            .setContentTitle(title)
            .setContentText(message)
            .setStyle(NotificationCompat.BigTextStyle().bigText(message))
            .setSubText(subText)
            .setPriority(
                when (priority) {
                    Priority.URGENT -> NotificationCompat.PRIORITY_MAX
                    Priority.HIGH -> NotificationCompat.PRIORITY_HIGH
                    else -> NotificationCompat.PRIORITY_DEFAULT
                }
            )
            .setAutoCancel(true)
            .setContentIntent(pendingIntent)

        val soundUri = getNotificationSoundUri()
        if (soundUri != null) {
            builder.setSound(soundUri)
        }

        val notificationId = alertId.hashCode()

        try {
            NotificationManagerCompat.from(context).notify(notificationId, builder.build())
            Log.d(TAG, "[NOTIFICATION] Posted notification alertId=$alertId, title='$title', priority=$priority")
        } catch (e: SecurityException) {
            Log.e(TAG, "[NOTIFICATION] Missing POST_NOTIFICATIONS permission", e)
        } catch (e: Exception) {
            Log.e(TAG, "[NOTIFICATION] Error showing notification", e)
        }
    }

    fun showTestNotification() {
        showNotification(
            alertId = "test_${System.currentTimeMillis()}",
            title = "Test Alert Notification",
            message = "Audio, vibration, and channels are functioning properly on this device!",
            priority = Priority.URGENT,
            groupName = "Diagnostics"
        )
    }

    private fun getNotificationSoundUri(): Uri? {
        return try {
            Uri.parse("${ContentResolver.SCHEME_ANDROID_RESOURCE}://${context.packageName}/raw/alert_sound")
        } catch (e: Exception) {
            null
        }
    }

    companion object {
        private const val TAG = "NotificationHelper"
        const val CHANNEL_URGENT_ID = "urgent_alerts"
        const val CHANNEL_IMPORTANT_ID = "important_alerts"
        const val CHANNEL_NORMAL_ID = "normal_alerts"

        const val EXTRA_ALERT_ID = "extra_alert_id"
        const val EXTRA_OPEN_ALERT_DETAILS = "extra_open_alert_details"

        @Volatile
        private var INSTANCE: NotificationHelper? = null

        fun getInstance(context: Context): NotificationHelper {
            return INSTANCE ?: synchronized(this) {
                val instance = NotificationHelper(context.applicationContext)
                INSTANCE = instance
                instance
            }
        }
    }
}
