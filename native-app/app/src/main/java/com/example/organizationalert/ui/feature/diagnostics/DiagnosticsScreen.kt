package com.example.organizationalert.ui.feature.diagnostics

import android.app.AlarmManager
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.PowerManager
import android.provider.Settings
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
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Alarm
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.BatteryChargingFull
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.ErrorOutline
import androidx.compose.material.icons.filled.Fullscreen
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material.icons.filled.OpenInNew
import androidx.compose.material.icons.filled.PhoneAndroid
import androidx.compose.material.icons.filled.Schedule
import androidx.compose.material.icons.filled.Sync
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Divider
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.app.NotificationManagerCompat
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.organizationalert.core.database.AppDatabase
import com.example.organizationalert.core.database.entity.AckStatus
import com.example.organizationalert.core.database.entity.EventEntity
import com.example.organizationalert.core.database.entity.EventStatus
import com.example.organizationalert.core.preferences.UserPreferences
import com.example.organizationalert.core.scheduling.EventAlarmScheduler
import com.example.organizationalert.core.scheduling.TimezoneHelper
import com.example.organizationalert.domain.model.Priority
import com.example.organizationalert.ui.components.DetailRow
import com.example.organizationalert.ui.theme.Blue400
import com.example.organizationalert.ui.theme.Blue500
import com.example.organizationalert.ui.theme.Green500
import com.example.organizationalert.ui.theme.Orange500
import com.example.organizationalert.ui.theme.Red500
import com.example.organizationalert.ui.theme.Slate400
import com.example.organizationalert.ui.theme.Slate700
import com.example.organizationalert.ui.theme.Slate800
import com.example.organizationalert.ui.theme.Slate900
import dagger.hilt.android.lifecycle.HiltViewModel
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.firstOrNull
import kotlinx.coroutines.launch
import java.time.Instant
import javax.inject.Inject

data class TimelineStep(
    val stage: String,
    val timestamp: String,
    val isCompleted: Boolean,
    val note: String? = null
)

data class DiagnosticsUiState(
    val hasNotificationPermission: Boolean = false,
    val canScheduleExactAlarms: Boolean = true,
    val isIgnoringBatteryOptimizations: Boolean = false,
    val hasFullScreenIntentCapability: Boolean = true,
    val deviceId: String = "",
    val serverUrl: String = "",
    val lastSyncTime: String = "Never",
    val pendingAcksCount: Int = 0,
    val scheduledEventsCount: Int = 0,
    val testAlarmScheduledAt: String? = null,
    val recentTimeline: List<TimelineStep> = emptyList()
)

@HiltViewModel
class DiagnosticsViewModel @Inject constructor(
    @ApplicationContext private val context: Context,
    private val preferences: UserPreferences,
    private val database: AppDatabase,
    private val eventScheduler: EventAlarmScheduler
) : ViewModel() {

    private val _uiState = MutableStateFlow(loadDiagnostics())
    val uiState: StateFlow<DiagnosticsUiState> = _uiState.asStateFlow()

    init {
        refresh()
    }

    fun refresh() {
        viewModelScope.launch {
            val baseState = loadDiagnostics()
            val pendingCount = database.ackQueueDao().getPendingCount().firstOrNull() ?: 0
            val futureEvents = database.eventDao().getAllFutureScheduledEvents().size
            val recentEvent = database.eventDao().getAllEvents().firstOrNull()?.firstOrNull()

            val timeline = mutableListOf<TimelineStep>()
            if (recentEvent != null) {
                timeline.add(TimelineStep("CREATED", TimezoneHelper.formatUserFriendly(recentEvent.createdAt), true))
                timeline.add(TimelineStep("STORED_LOCAL", TimezoneHelper.formatUserFriendly(recentEvent.createdAt), true))
                timeline.add(TimelineStep("SCHEDULED", TimezoneHelper.formatUserFriendly(recentEvent.scheduledAt), true))
                if (recentEvent.triggeredAt != null) {
                    timeline.add(TimelineStep("ALARM_TRIGGERED", TimezoneHelper.formatUserFriendly(recentEvent.triggeredAt), true))
                }
                if (recentEvent.displayedAt != null) {
                    timeline.add(TimelineStep("PRESENTED", TimezoneHelper.formatUserFriendly(recentEvent.displayedAt), true))
                }
                if (recentEvent.receivedAt != null) {
                    timeline.add(TimelineStep("RECEIVED", TimezoneHelper.formatUserFriendly(recentEvent.receivedAt), true))
                }
                if (recentEvent.acknowledgedAt != null) {
                    timeline.add(TimelineStep("ACK_CONFIRMED", TimezoneHelper.formatUserFriendly(recentEvent.acknowledgedAt), true))
                }
            }

            _uiState.value = baseState.copy(
                pendingAcksCount = pendingCount,
                scheduledEventsCount = futureEvents,
                recentTimeline = timeline
            )
        }
    }

    private fun loadDiagnostics(): DiagnosticsUiState {
        val notifGranted = NotificationManagerCompat.from(context).areNotificationsEnabled()

        val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as? AlarmManager
        val canExact = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S && alarmManager != null) {
            alarmManager.canScheduleExactAlarms()
        } else true

        val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as? android.app.NotificationManager
        val canFullScreen = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE && notificationManager != null) {
            notificationManager.canUseFullScreenIntent()
        } else true

        val powerManager = context.getSystemService(Context.POWER_SERVICE) as? PowerManager
        val ignoringBattery = powerManager?.isIgnoringBatteryOptimizations(context.packageName) ?: false

        val lastSyncMillis = preferences.getLastSyncTime()
        val lastSyncStr = if (lastSyncMillis > 0) {
            TimezoneHelper.formatUserFriendly(Instant.ofEpochMilli(lastSyncMillis))
        } else "Never"

        return DiagnosticsUiState(
            hasNotificationPermission = notifGranted,
            canScheduleExactAlarms = canExact,
            isIgnoringBatteryOptimizations = ignoringBattery,
            hasFullScreenIntentCapability = canFullScreen,
            deviceId = preferences.getOrCreateDeviceId(),
            serverUrl = preferences.getServerUrl(),
            lastSyncTime = lastSyncStr
        )
    }

    fun scheduleTestAlarm(onScheduled: () -> Unit) {
        val triggerInstant = Instant.now().plusSeconds(10)
        val testEvent = EventEntity(
            id = "test_event_${System.currentTimeMillis()}",
            eventId = "EVT-TEST-10S",
            userId = preferences.getUserId(),
            organizationId = preferences.getOrganizationId() ?: "org_demo",
            groupId = null,
            title = "Test Mandatory Wakeup Event",
            message = "Exact alarm requested from Android; verifying Doze and Lockscreen wakeup.",
            priority = Priority.URGENT,
            requiresReceive = true,
            status = EventStatus.SCHEDULED,
            ackStatus = AckStatus.PENDING,
            scheduledAt = triggerInstant
        )

        viewModelScope.launch {
            database.eventDao().insertOrUpdate(testEvent)
            eventScheduler.scheduleEvent(testEvent)
            _uiState.value = _uiState.value.copy(
                testAlarmScheduledAt = TimezoneHelper.formatUserFriendly(triggerInstant)
            )
            refresh()
            onScheduled()
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DiagnosticsScreen(
    viewModel: DiagnosticsViewModel,
    onNavigateBack: () -> Unit
) {
    val uiState by viewModel.uiState.collectAsState()
    val context = LocalContext.current

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Background System Diagnostics", fontWeight = FontWeight.Bold, color = Color.White) },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = Color.White)
                    }
                },
                actions = {
                    IconButton(onClick = { viewModel.refresh() }) {
                        Icon(Icons.Default.Sync, contentDescription = "Refresh", tint = Color.White)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Slate900)
            )
        },
        containerColor = Slate900
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(horizontal = 20.dp)
                .verticalScroll(rememberScrollState())
        ) {
            Spacer(modifier = Modifier.height(12.dp))

            Text("ANDROID PLATFORM CAPABILITIES", style = MaterialTheme.typography.labelSmall, color = Slate400, fontWeight = FontWeight.Bold)
            Spacer(modifier = Modifier.height(8.dp))

            // Capabilities Card
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(14.dp),
                colors = CardDefaults.cardColors(containerColor = Slate800)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    StatusRow(
                        icon = Icons.Default.Notifications,
                        title = "POST_NOTIFICATIONS",
                        isOk = uiState.hasNotificationPermission,
                        okText = "GRANTED",
                        badText = "BLOCKED / DENIED"
                    )

                    Spacer(modifier = Modifier.height(12.dp))

                    StatusRow(
                        icon = Icons.Default.Alarm,
                        title = "SCHEDULE_EXACT_ALARM",
                        isOk = uiState.canScheduleExactAlarms,
                        okText = "EXACT_ALARM_AVAILABLE",
                        badText = "EXACT_ALARM_RESTRICTED"
                    )

                    Spacer(modifier = Modifier.height(12.dp))

                    StatusRow(
                        icon = Icons.Default.BatteryChargingFull,
                        title = "Battery Optimization",
                        isOk = uiState.isIgnoringBatteryOptimizations,
                        okText = "UNRESTRICTED",
                        badText = "OPTIMIZED (May delay Doze)"
                    )

                    Spacer(modifier = Modifier.height(12.dp))

                    StatusRow(
                        icon = Icons.Default.Fullscreen,
                        title = "Full-Screen Intent",
                        isOk = uiState.hasFullScreenIntentCapability,
                        okText = "FULL_SCREEN_ALLOWED",
                        badText = "FULL_SCREEN_RESTRICTED"
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Settings Jump Button
            OutlinedButton(
                onClick = {
                    try {
                        val intent = Intent(Settings.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS)
                        context.startActivity(intent)
                    } catch (e: Exception) {
                        val intent = Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS).apply {
                            data = Uri.fromParts("package", context.packageName, null)
                        }
                        context.startActivity(intent)
                    }
                },
                shape = RoundedCornerShape(10.dp),
                colors = ButtonDefaults.outlinedButtonColors(contentColor = Blue400),
                modifier = Modifier.fillMaxWidth().height(48.dp)
            ) {
                Icon(Icons.Default.OpenInNew, contentDescription = null, modifier = Modifier.size(16.dp))
                Spacer(modifier = Modifier.width(8.dp))
                Text("Open Battery Optimization Settings")
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Device State & Counts
            Text("DEVICE IDENTIFIERS & QUEUE STATUS", style = MaterialTheme.typography.labelSmall, color = Slate400, fontWeight = FontWeight.Bold)
            Spacer(modifier = Modifier.height(8.dp))
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(14.dp),
                colors = CardDefaults.cardColors(containerColor = Slate800)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    DetailRow(label = "Device ID", value = uiState.deviceId)
                    DetailRow(label = "Platform", value = "Android ${Build.VERSION.RELEASE} (SDK ${Build.VERSION.SDK_INT})")
                    DetailRow(label = "Scheduled Alarms in Room", value = "${uiState.scheduledEventsCount} active")
                    DetailRow(label = "Pending Offline ACKs", value = "${uiState.pendingAcksCount} in queue")
                    DetailRow(label = "Last Sync Time", value = uiState.lastSyncTime)
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Event Diagnostics Timeline
            if (uiState.recentTimeline.isNotEmpty()) {
                Text("EVENT LIFECYCLE DIAGNOSTICS TIMELINE", style = MaterialTheme.typography.labelSmall, color = Slate400, fontWeight = FontWeight.Bold)
                Spacer(modifier = Modifier.height(8.dp))
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(14.dp),
                    colors = CardDefaults.cardColors(containerColor = Slate800)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        uiState.recentTimeline.forEachIndexed { index, step ->
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Surface(
                                        color = Green500.copy(alpha = 0.2f),
                                        shape = CircleShape,
                                        modifier = Modifier.size(24.dp)
                                    ) {
                                        Box(contentAlignment = Alignment.Center) {
                                            Icon(Icons.Default.CheckCircle, contentDescription = null, tint = Green500, modifier = Modifier.size(14.dp))
                                        }
                                    }
                                    Spacer(modifier = Modifier.width(10.dp))
                                    Text(step.stage, color = Color.White, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                                }
                                Text(step.timestamp, color = Slate400, fontSize = 12.sp)
                            }
                            if (index < uiState.recentTimeline.size - 1) {
                                Divider(
                                    color = Slate700,
                                    modifier = Modifier.padding(vertical = 8.dp, horizontal = 12.dp)
                                )
                            }
                        }
                    }
                }
                Spacer(modifier = Modifier.height(24.dp))
            }

            // Test 10s Background Alarm Button
            Text("END-TO-END BACKGROUND ACCEPTANCE TEST", style = MaterialTheme.typography.labelSmall, color = Slate400, fontWeight = FontWeight.Bold)
            Spacer(modifier = Modifier.height(8.dp))

            Button(
                onClick = { viewModel.scheduleTestAlarm {} },
                colors = ButtonDefaults.buttonColors(containerColor = Orange500),
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier.fillMaxWidth().height(52.dp)
            ) {
                Icon(Icons.Default.Schedule, contentDescription = null, tint = Color.White, modifier = Modifier.size(20.dp))
                Spacer(modifier = Modifier.width(8.dp))
                Text("Schedule Exact Wakeup Test (10s)", fontSize = 15.sp, fontWeight = FontWeight.Bold)
            }

            if (uiState.testAlarmScheduledAt != null) {
                Spacer(modifier = Modifier.height(10.dp))
                Surface(
                    color = Green500.copy(alpha = 0.15f),
                    shape = RoundedCornerShape(8.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text(
                        text = "Alarm set for ${uiState.testAlarmScheduledAt}! Close app & lock screen to verify exact wakeup and Mandatory Receive UI.",
                        color = Green500,
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Medium,
                        modifier = Modifier.padding(12.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(60.dp))
        }
    }
}

@Composable
fun StatusRow(
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    title: String,
    isOk: Boolean,
    okText: String,
    badText: String
) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Icon(icon, contentDescription = null, tint = Slate400, modifier = Modifier.size(20.dp))
            Spacer(modifier = Modifier.width(10.dp))
            Text(title, color = Color.White, fontWeight = FontWeight.Medium, fontSize = 14.sp)
        }

        Surface(
            color = (if (isOk) Green500 else Red500).copy(alpha = 0.15f),
            shape = RoundedCornerShape(6.dp)
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
            ) {
                Icon(
                    imageVector = if (isOk) Icons.Default.CheckCircle else Icons.Default.ErrorOutline,
                    contentDescription = null,
                    tint = if (isOk) Green500 else Red500,
                    modifier = Modifier.size(14.dp)
                )
                Spacer(modifier = Modifier.width(4.dp))
                Text(
                    text = if (isOk) okText else badText,
                    color = if (isOk) Green500 else Red500,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold
                )
            }
        }
    }
}
