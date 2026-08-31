package com.example.organizationalert.ui.feature.settings

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
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Business
import androidx.compose.material.icons.filled.Dns
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.Logout
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Sync
import androidx.compose.material.icons.filled.Vibration
import androidx.compose.material.icons.filled.VolumeUp
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Switch
import androidx.compose.material3.SwitchDefaults
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.organizationalert.core.notifications.NotificationHelper
import com.example.organizationalert.core.preferences.UserPreferences
import com.example.organizationalert.core.scheduling.TimezoneHelper
import com.example.organizationalert.core.socket.SocketManager
import com.example.organizationalert.core.sync.SyncManager
import com.example.organizationalert.core.sync.SyncState
import com.example.organizationalert.ui.components.DetailRow
import com.example.organizationalert.ui.theme.Blue400
import com.example.organizationalert.ui.theme.Blue500
import com.example.organizationalert.ui.theme.Red500
import com.example.organizationalert.ui.theme.Slate400
import com.example.organizationalert.ui.theme.Slate700
import com.example.organizationalert.ui.theme.Slate800
import com.example.organizationalert.ui.neo.LocalNeoColors
import com.example.organizationalert.ui.neo.NeoPrimaryButton
import com.example.organizationalert.ui.neo.NeoScreenBackground
import com.example.organizationalert.ui.neo.NeoSettingsCard
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import java.time.Instant
import javax.inject.Inject

data class SettingsUiState(
    val serverUrl: String = "",
    val organizationName: String = "",
    val userName: String = "",
    val userEmail: String = "",
    val userRole: String = "",
    val isSoundEnabled: Boolean = true,
    val isVibrationEnabled: Boolean = true,
    val lastSyncTime: String = "Never",
    val isSyncing: Boolean = false
)

@HiltViewModel
class SettingsViewModel @Inject constructor(
    private val preferences: UserPreferences,
    private val notificationHelper: NotificationHelper,
    private val syncManager: SyncManager,
    private val socketManager: SocketManager
) : ViewModel() {

    private val _uiState = MutableStateFlow(loadCurrentSettings())
    val uiState: StateFlow<SettingsUiState> = _uiState.asStateFlow()

    private fun loadCurrentSettings(): SettingsUiState {
        val lastSyncMillis = preferences.getLastSyncTime()
        val lastSyncStr = if (lastSyncMillis > 0) {
            TimezoneHelper.formatUserFriendly(Instant.ofEpochMilli(lastSyncMillis))
        } else "Never"

        return SettingsUiState(
            serverUrl = preferences.getServerUrl(),
            organizationName = preferences.getOrganizationName(),
            userName = preferences.getUserName(),
            userEmail = preferences.getUserEmail(),
            userRole = preferences.getUserRole(),
            isSoundEnabled = preferences.isSoundEnabled(),
            isVibrationEnabled = preferences.isVibrationEnabled(),
            lastSyncTime = lastSyncStr,
            isSyncing = syncManager.syncState.value is SyncState.Syncing
        )
    }

    fun toggleSound(enabled: Boolean) {
        preferences.setSoundEnabled(enabled)
        _uiState.value = _uiState.value.copy(isSoundEnabled = enabled)
    }

    fun toggleVibration(enabled: Boolean) {
        preferences.setVibrationEnabled(enabled)
        _uiState.value = _uiState.value.copy(isVibrationEnabled = enabled)
    }

    fun testNotification() {
        notificationHelper.showTestNotification()
    }

    fun syncNow() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isSyncing = true)
            syncManager.performFullSync()
            _uiState.value = loadCurrentSettings().copy(isSyncing = false)
        }
    }

    fun disconnectSession(onSuccess: () -> Unit) {
        socketManager.disconnect()
        preferences.clearSession()
        onSuccess()
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SettingsScreen(
    viewModel: SettingsViewModel,
    onNavigateToSetup: () -> Unit,
    onNavigateToDiagnostics: () -> Unit
) {
    val uiState by viewModel.uiState.collectAsState()

    val neo = LocalNeoColors.current

    NeoScreenBackground {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 20.dp)
                .verticalScroll(rememberScrollState())
        ) {
            Spacer(modifier = Modifier.height(12.dp))

            NeoPrimaryButton(
                text = "Device Diagnostics",
                onClick = onNavigateToDiagnostics,
                modifier = Modifier.fillMaxWidth()
            )

            Spacer(modifier = Modifier.height(16.dp))

            // User & Organization Profile Card
            Text("USER & ORGANIZATION PROFILE", style = MaterialTheme.typography.labelSmall, color = Slate400, fontWeight = FontWeight.Bold)
            Spacer(modifier = Modifier.height(8.dp))
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(14.dp),
                colors = CardDefaults.cardColors(containerColor = Slate800)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    DetailRow(label = "User", value = "${uiState.userName} (${uiState.userRole})")
                    DetailRow(label = "Email", value = uiState.userEmail)
                    DetailRow(label = "Organization", value = uiState.organizationName)
                    DetailRow(label = "Server URL", value = uiState.serverUrl)
                    DetailRow(label = "Last Sync", value = uiState.lastSyncTime)
                }
            }


            Spacer(modifier = Modifier.height(20.dp))

            // Notification Preferences Card
            Text("NOTIFICATION PREFERENCES", style = MaterialTheme.typography.labelSmall, color = Slate400, fontWeight = FontWeight.Bold)
            Spacer(modifier = Modifier.height(8.dp))
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(14.dp),
                colors = CardDefaults.cardColors(containerColor = Slate800)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Default.VolumeUp, contentDescription = null, tint = Slate400)
                            Spacer(modifier = Modifier.width(10.dp))
                            Text("Alert Sound", color = Color.White, fontWeight = FontWeight.SemiBold)
                        }
                        Switch(
                            checked = uiState.isSoundEnabled,
                            onCheckedChange = { viewModel.toggleSound(it) },
                            colors = SwitchDefaults.colors(checkedThumbColor = Blue500)
                        )
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Default.Vibration, contentDescription = null, tint = Slate400)
                            Spacer(modifier = Modifier.width(10.dp))
                            Text("Vibration", color = Color.White, fontWeight = FontWeight.SemiBold)
                        }
                        Switch(
                            checked = uiState.isVibrationEnabled,
                            onCheckedChange = { viewModel.toggleVibration(it) },
                            colors = SwitchDefaults.colors(checkedThumbColor = Blue500)
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(20.dp))

            // Actions: Test Notification & Sync Now
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                OutlinedButton(
                    onClick = { viewModel.testNotification() },
                    shape = RoundedCornerShape(10.dp),
                    colors = ButtonDefaults.outlinedButtonColors(contentColor = Color.White),
                    modifier = Modifier.weight(1f).height(48.dp)
                ) {
                    Icon(Icons.Default.Notifications, contentDescription = null, modifier = Modifier.size(18.dp))
                    Spacer(modifier = Modifier.width(6.dp))
                    Text("Test Notification", fontSize = 13.sp)
                }

                Button(
                    onClick = { viewModel.syncNow() },
                    enabled = !uiState.isSyncing,
                    shape = RoundedCornerShape(10.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = Blue500),
                    modifier = Modifier.weight(1f).height(48.dp)
                ) {
                    if (uiState.isSyncing) {
                        CircularProgressIndicator(color = Color.White, modifier = Modifier.size(16.dp), strokeWidth = 2.dp)
                    } else {
                        Icon(Icons.Default.Sync, contentDescription = null, modifier = Modifier.size(18.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("Sync Now", fontSize = 13.sp)
                    }
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Disconnect / Switch Session
            Button(
                onClick = {
                    viewModel.disconnectSession {
                        onNavigateToSetup()
                    }
                },
                shape = RoundedCornerShape(10.dp),
                colors = ButtonDefaults.buttonColors(containerColor = Slate700),
                modifier = Modifier.fillMaxWidth().height(48.dp)
            ) {
                Icon(Icons.Default.Logout, contentDescription = null, tint = Red500, modifier = Modifier.size(18.dp))
                Spacer(modifier = Modifier.width(8.dp))
                Text("Disconnect & Reconfigure", color = Red500, fontWeight = FontWeight.Bold)
            }

            Spacer(modifier = Modifier.height(24.dp))

            // About Architecture Info
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(14.dp),
                colors = CardDefaults.cardColors(containerColor = Slate800)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.Info, contentDescription = null, tint = Blue400, modifier = Modifier.size(18.dp))
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("System Architecture", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                    }
                    Spacer(modifier = Modifier.height(6.dp))
                    Text(
                        text = "• Native Kotlin + Jetpack Compose\n• Local Android AlarmManager Scheduling\n• Zero Firebase / FCM dependency\n• Express.js Backend + Socket.IO live sync\n• Offline persistent Room Database",
                        color = Slate400,
                        fontSize = 12.sp,
                        lineHeight = 18.sp
                    )
                }
            }

            Spacer(modifier = Modifier.height(80.dp))
        }
    }
}
