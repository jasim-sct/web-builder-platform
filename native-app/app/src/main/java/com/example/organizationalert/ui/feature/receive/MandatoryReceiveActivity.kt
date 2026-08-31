package com.example.organizationalert.ui.feature.receive

import android.app.KeyguardManager
import android.content.Context
import android.os.Build
import android.os.Bundle
import android.view.WindowManager
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.NotificationsActive
import androidx.compose.material.icons.outlined.Close
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.organizationalert.core.ack.AckManager
import com.example.organizationalert.core.alarm.AlarmEngine
import com.example.organizationalert.core.alarm.AlarmStopReason
import com.example.organizationalert.core.database.AppDatabase
import com.example.organizationalert.core.preferences.UserPreferences
import com.example.organizationalert.core.scheduling.TimezoneHelper
import com.example.organizationalert.domain.model.Priority
import com.example.organizationalert.ui.theme.Blue500
import com.example.organizationalert.ui.theme.Green500
import com.example.organizationalert.ui.theme.OrganizationAlertAppTheme
import com.example.organizationalert.ui.theme.Red500
import com.example.organizationalert.ui.theme.Slate400
import com.example.organizationalert.ui.theme.Slate800
import com.example.organizationalert.ui.theme.Slate900
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.launch
import java.time.Instant
import javax.inject.Inject

@AndroidEntryPoint
class MandatoryReceiveActivity : ComponentActivity() {

    @Inject
    lateinit var preferences: UserPreferences

    @Inject
    lateinit var ackManager: AckManager

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        configureLockScreenDisplay()

        val eventId = intent.getStringExtra(EXTRA_EVENT_ID) ?: ""
        val title = intent.getStringExtra(EXTRA_TITLE) ?: "Group Alarm"
        val message = intent.getStringExtra(EXTRA_MESSAGE) ?: "Please respond to this alarm."
        val priorityStr = intent.getStringExtra(EXTRA_PRIORITY)
        val scheduledMillis = intent.getLongExtra(EXTRA_SCHEDULED_AT, System.currentTimeMillis())
        val broadcasterName = intent.getStringExtra(EXTRA_BROADCASTER_NAME)
        val groupName = intent.getStringExtra(EXTRA_GROUP_NAME)
        val requiresAck = intent.getBooleanExtra(EXTRA_REQUIRES_ACK, true)

        val priority = Priority.fromString(priorityStr)
        val scheduledAt = Instant.ofEpochMilli(scheduledMillis)

        setContent {
            OrganizationAlertAppTheme {
                val scope = rememberCoroutineScope()
                AlarmRingingScreen(
                    eventId = eventId,
                    title = title,
                    message = message,
                    priority = priority,
                    scheduledAt = scheduledAt,
                    broadcasterName = broadcasterName,
                    groupName = groupName,
                    requiresAcknowledge = requiresAck,
                    onAcknowledge = {
                        scope.launch {
                            val database = AppDatabase.getInstance(applicationContext)
                            val event = database.eventDao().getEventByEventIdDirect(eventId)
                            if (event != null) {
                                ackManager.markReceived(eventId)
                            } else {
                                ackManager.markAlertAcknowledged(eventId)
                            }
                            finishAndRemoveTask()
                        }
                    },
                    onDismiss = {
                        scope.launch {
                            val database = AppDatabase.getInstance(applicationContext)
                            val alarmEngine = AlarmEngine.getInstance(applicationContext, database, preferences)
                            val event = database.eventDao().getEventByEventIdDirect(eventId)
                            if (event != null) {
                                ackManager.markDismissed(eventId)
                            } else {
                                ackManager.markAlertDismissed(eventId)
                            }
                            finishAndRemoveTask()
                        }
                    }
                )
            }
        }
    }

    private fun configureLockScreenDisplay() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
            setShowWhenLocked(true)
            setTurnScreenOn(true)
            val keyguardManager = getSystemService(Context.KEYGUARD_SERVICE) as KeyguardManager
            keyguardManager.requestDismissKeyguard(this, null)
        } else {
            @Suppress("DEPRECATION")
            window.addFlags(
                WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED or
                    WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD or
                    WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON or
                    WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON
            )
        }
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
    }

    companion object {
        const val EXTRA_EVENT_ID = "extra_event_id"
        const val EXTRA_TITLE = "extra_title"
        const val EXTRA_MESSAGE = "extra_message"
        const val EXTRA_PRIORITY = "extra_priority"
        const val EXTRA_SCHEDULED_AT = "extra_scheduled_at"
        const val EXTRA_BROADCASTER_NAME = "extra_broadcaster_name"
        const val EXTRA_GROUP_NAME = "extra_group_name"
        const val EXTRA_REQUIRES_ACK = "extra_requires_ack"
    }
}

@Composable
fun AlarmRingingScreen(
    eventId: String,
    title: String,
    message: String,
    priority: Priority,
    scheduledAt: Instant,
    broadcasterName: String?,
    groupName: String?,
    requiresAcknowledge: Boolean,
    onAcknowledge: () -> Unit,
    onDismiss: () -> Unit
) {
    var isProcessing by remember { mutableStateOf(false) }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Slate900)
            .padding(24.dp),
        contentAlignment = Alignment.Center
    ) {
        Column(
            modifier = Modifier.fillMaxWidth(),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Surface(
                color = Red500.copy(alpha = 0.2f),
                shape = CircleShape,
                modifier = Modifier.size(96.dp)
            ) {
                Box(contentAlignment = Alignment.Center) {
                    Icon(
                        imageVector = Icons.Default.NotificationsActive,
                        contentDescription = null,
                        tint = Red500,
                        modifier = Modifier.size(52.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(20.dp))

            Surface(color = Red500.copy(alpha = 0.15f), shape = RoundedCornerShape(8.dp)) {
                Text(
                    text = "GROUP ALARM — RINGING",
                    color = Red500,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold,
                    letterSpacing = 1.2.sp,
                    modifier = Modifier.padding(horizontal = 14.dp, vertical = 6.dp)
                )
            }

            Spacer(modifier = Modifier.height(16.dp))

            if (!groupName.isNullOrBlank()) {
                Text(
                    text = groupName.uppercase(),
                    color = Blue500,
                    fontSize = 13.sp,
                    fontWeight = FontWeight.SemiBold,
                    letterSpacing = 1.sp
                )
                Spacer(modifier = Modifier.height(8.dp))
            }

            Text(
                text = title,
                style = MaterialTheme.typography.headlineLarge,
                color = Color.White,
                fontWeight = FontWeight.Bold,
                textAlign = TextAlign.Center
            )

            if (!broadcasterName.isNullOrBlank()) {
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = "From: $broadcasterName",
                    color = Slate400,
                    fontSize = 14.sp
                )
            }

            Spacer(modifier = Modifier.height(16.dp))

            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = Slate800)
            ) {
                Column(
                    modifier = Modifier.padding(20.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = message,
                        style = MaterialTheme.typography.bodyLarge,
                        color = Color.White,
                        textAlign = TextAlign.Center,
                        lineHeight = 24.sp
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                    Text(
                        text = "Scheduled: ${TimezoneHelper.formatUserFriendly(scheduledAt)}",
                        style = MaterialTheme.typography.labelSmall,
                        color = Slate400
                    )
                    if (eventId.isNotBlank()) {
                        Text(
                            text = "ID: $eventId",
                            style = MaterialTheme.typography.labelSmall,
                            color = Slate400.copy(alpha = 0.6f)
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(40.dp))

            Row(
                modifier = Modifier.fillMaxWidth(0.92f),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                OutlinedButton(
                    onClick = {
                        if (!isProcessing) {
                            isProcessing = true
                            onDismiss()
                        }
                    },
                    enabled = !isProcessing,
                    modifier = Modifier
                        .weight(1f)
                        .height(58.dp),
                    shape = RoundedCornerShape(28.dp)
                ) {
                    Icon(Icons.Outlined.Close, contentDescription = null, tint = Color.White)
                    Spacer(Modifier.width(6.dp))
                    Text("DISMISS", color = Color.White, fontWeight = FontWeight.Bold)
                }

                if (requiresAcknowledge) {
                    Button(
                        onClick = {
                            if (!isProcessing) {
                                isProcessing = true
                                onAcknowledge()
                            }
                        },
                        enabled = !isProcessing,
                        colors = ButtonDefaults.buttonColors(containerColor = Green500),
                        shape = RoundedCornerShape(28.dp),
                        modifier = Modifier
                            .weight(1f)
                            .height(58.dp)
                    ) {
                        Icon(Icons.Default.Check, contentDescription = null, tint = Color.White)
                        Spacer(Modifier.width(6.dp))
                        Text(
                            text = if (isProcessing) "..." else "ACKNOWLEDGE",
                            color = Color.White,
                            fontWeight = FontWeight.Bold,
                            fontSize = 14.sp
                        )
                    }
                }
            }
        }
    }
}

/** @deprecated Use [AlarmRingingScreen] */
@Composable
fun MandatoryReceiveScreen(
    eventId: String,
    title: String,
    message: String,
    priority: Priority,
    scheduledAt: Instant,
    onReceiveClicked: () -> Unit
) = AlarmRingingScreen(
    eventId = eventId,
    title = title,
    message = message,
    priority = priority,
    scheduledAt = scheduledAt,
    broadcasterName = null,
    groupName = null,
    requiresAcknowledge = true,
    onAcknowledge = onReceiveClicked,
    onDismiss = onReceiveClicked
)
