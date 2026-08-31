package com.example.organizationalert.receiver

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.util.Log
import com.example.organizationalert.core.database.AppDatabase
import com.example.organizationalert.core.presentation.PresentationEngine
import com.example.organizationalert.domain.model.Priority

/**
 * Entry point for high-priority push delivery (FCM data messages should forward here).
 * Action: [ACTION_PUSH_ALARM]
 */
class PushAlarmReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent?) {
        if (intent?.action != ACTION_PUSH_ALARM) return

        val alertId = intent.getStringExtra(EXTRA_ALERT_ID) ?: return
        val title = intent.getStringExtra(EXTRA_TITLE) ?: "Incoming Alarm"
        val message = intent.getStringExtra(EXTRA_MESSAGE) ?: ""
        val priority = Priority.fromString(intent.getStringExtra(EXTRA_PRIORITY))
        val groupId = intent.getStringExtra(EXTRA_GROUP_ID)
        val groupName = intent.getStringExtra(EXTRA_GROUP_NAME)
        val recipientIds = intent.getStringArrayListExtra(EXTRA_RECIPIENT_USER_IDS)

        Log.d(TAG, "[PUSH_ALARM] Received push for alertId=$alertId")

        val engine = PresentationEngine.getInstance(
            context,
            AppDatabase.getInstance(context)
        )
        engine.presentImmediateAlarm(
            sessionId = alertId,
            title = title,
            message = message,
            priority = priority,
            groupId = groupId,
            groupName = groupName,
            broadcasterId = null,
            broadcasterName = null,
            recipientUserIds = recipientIds
        )
    }

    companion object {
        private const val TAG = "PushAlarmReceiver"
        const val ACTION_PUSH_ALARM = "com.example.organizationalert.PUSH_ALARM"
        const val EXTRA_ALERT_ID = "extra_alert_id"
        const val EXTRA_TITLE = "extra_title"
        const val EXTRA_MESSAGE = "extra_message"
        const val EXTRA_PRIORITY = "extra_priority"
        const val EXTRA_GROUP_ID = "extra_group_id"
        const val EXTRA_GROUP_NAME = "extra_group_name"
        const val EXTRA_RECIPIENT_USER_IDS = "extra_recipient_user_ids"
    }
}
