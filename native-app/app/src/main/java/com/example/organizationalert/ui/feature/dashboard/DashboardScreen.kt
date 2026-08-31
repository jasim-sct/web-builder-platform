package com.example.organizationalert.ui.feature.dashboard

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
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
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AddAlert
import androidx.compose.material.icons.filled.Campaign
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
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
import com.example.organizationalert.core.preferences.UserPreferences
import com.example.organizationalert.core.socket.SocketConnectionState
import com.example.organizationalert.core.socket.SocketManager
import com.example.organizationalert.core.sync.SyncManager
import com.example.organizationalert.core.sync.SyncState
import com.example.organizationalert.data.repository.AlertRepository
import com.example.organizationalert.data.repository.GroupRepository
import com.example.organizationalert.domain.model.Alert
import com.example.organizationalert.domain.model.AlertStatus
import com.example.organizationalert.domain.model.Group
import com.example.organizationalert.domain.model.UserRole
import com.example.organizationalert.ui.components.AlertCard
import com.example.organizationalert.ui.components.ConnectionStatusBadge
import com.example.organizationalert.ui.components.EmptyStateView
import com.example.organizationalert.ui.components.GroupCard
import com.example.organizationalert.ui.components.NextAlertCard
import com.example.organizationalert.ui.neo.LocalNeoColors
import com.example.organizationalert.ui.neo.NeoMetricTile
import com.example.organizationalert.ui.neo.NeoPrimaryButton
import com.example.organizationalert.ui.neo.NeoScreenBackground
import com.example.organizationalert.ui.neo.neoBackgroundColor
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import java.time.Instant
import java.time.LocalDate
import java.time.ZoneId
import javax.inject.Inject

data class DashboardUiState(
    val userName: String = "User",
    val userRole: UserRole = UserRole.MEMBER,
    val organizationName: String = "Organization",
    val totalAlerts: Int = 0,
    val activeAlerts: Int = 0,
    val totalCustomers: Int = 0,
    val nextAlert: Alert? = null,
    val todayAlerts: List<Alert> = emptyList(),
    val upcomingAlerts: List<Alert> = emptyList(),
    val activeGroups: List<Group> = emptyList(),
    val socketState: SocketConnectionState = SocketConnectionState.DISCONNECTED,
    val isSyncing: Boolean = false,
    val syncMessage: String? = null
)

@HiltViewModel
class DashboardViewModel @Inject constructor(
    private val alertRepository: AlertRepository,
    private val groupRepository: GroupRepository,
    private val preferences: UserPreferences,
    private val socketManager: SocketManager,
    private val syncManager: SyncManager
) : ViewModel() {

    val uiState: StateFlow<DashboardUiState> = combine(
        alertRepository.allAlerts,
        groupRepository.activeGroups,
        socketManager.connectionState,
        syncManager.syncState
    ) { alerts, groups, socketState, syncState ->
        val now = Instant.now()
        val today = LocalDate.now()
        val zone = ZoneId.systemDefault()

        val nextUpcoming = alerts
            .filter { it.isEnabled && (it.nextTriggerAt ?: it.scheduledAt).isAfter(now) }
            .minByOrNull { it.nextTriggerAt ?: it.scheduledAt }

        val todayList = alerts.filter { alert ->
            val triggerInstant = alert.nextTriggerAt ?: alert.scheduledAt
            val alertDate = triggerInstant.atZone(zone).toLocalDate()
            alertDate == today
        }

        val upcomingList = alerts.filter { alert ->
            val triggerInstant = alert.nextTriggerAt ?: alert.scheduledAt
            val alertDate = triggerInstant.atZone(zone).toLocalDate()
            alertDate.isAfter(today)
        }

        DashboardUiState(
            userName = preferences.getUserName(),
            userRole = UserRole.fromString(preferences.getUserRole()),
            organizationName = preferences.getOrganizationName(),
            totalAlerts = alerts.size,
            activeAlerts = alerts.count { it.isEnabled && it.status == AlertStatus.SCHEDULED },
            totalCustomers = 0,
            nextAlert = nextUpcoming,
            todayAlerts = todayList,
            upcomingAlerts = upcomingList,
            activeGroups = groups,
            socketState = socketState,
            isSyncing = syncState is SyncState.Syncing,
            syncMessage = when (syncState) {
                is SyncState.Success -> syncState.message
                is SyncState.Error -> syncState.message
                else -> null
            }
        )
    }.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5000),
        initialValue = DashboardUiState(
            userName = preferences.getUserName(),
            organizationName = preferences.getOrganizationName()
        )
    )

    fun refresh() {
        viewModelScope.launch {
            syncManager.performFullSync()
        }
    }
}

@Composable
fun DashboardScreen(
    viewModel: DashboardViewModel,
    onNavigateToAlertDetails: (String) -> Unit,
    onNavigateToCreateAlert: () -> Unit,
    onNavigateToAlertsList: () -> Unit,
    onNavigateToGroupDetails: (String) -> Unit,
    onNavigateToGroupsList: () -> Unit
) {
    val uiState by viewModel.uiState.collectAsState()

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Slate900)
    ) {
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 20.dp)
        ) {
            // Header: Greeting & Status
            item {
                Spacer(modifier = Modifier.height(16.dp))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(
                            text = "Good day, ${uiState.userName}",
                            style = MaterialTheme.typography.headlineMedium,
                            color = MaterialTheme.colorScheme.onSurface,
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            text = uiState.organizationName,
                            style = MaterialTheme.typography.bodyMedium,
                            color = Slate400
                        )
                    }

                    IconButton(
                        onClick = { viewModel.refresh() },
                        enabled = !uiState.isSyncing
                    ) {
                        if (uiState.isSyncing) {
                            CircularProgressIndicator(
                                color = Blue500,
                                modifier = Modifier.size(22.dp),
                                strokeWidth = 2.dp
                            )
                        } else {
                            Icon(
                                imageVector = Icons.Default.Refresh,
                                contentDescription = "Sync",
                                tint = Slate400
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(12.dp))
                ConnectionStatusBadge(state = uiState.socketState)
                Spacer(modifier = Modifier.height(20.dp))
            }

            // Spotlight: Next Alert Card
            item {
                NextAlertCard(
                    alert = uiState.nextAlert,
                    onClick = { uiState.nextAlert?.let { onNavigateToAlertDetails(it.id) } }
                )
                Spacer(modifier = Modifier.height(20.dp))
            }

            // Quick Action Buttons
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Button(
                        onClick = onNavigateToCreateAlert,
                        colors = ButtonDefaults.buttonColors(containerColor = Blue500),
                        shape = RoundedCornerShape(10.dp),
                        modifier = Modifier
                            .weight(1f)
                            .height(44.dp)
                    ) {
                        Icon(Icons.Default.AddAlert, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("New Alert", fontSize = 13.sp, fontWeight = FontWeight.Bold)
                    }

                    Button(
                        onClick = onNavigateToCreateAlert,
                        colors = ButtonDefaults.buttonColors(containerColor = Red500),
                        shape = RoundedCornerShape(10.dp),
                        modifier = Modifier
                            .weight(1f)
                            .height(44.dp)
                    ) {
                        Icon(Icons.Default.Campaign, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("Broadcast", fontSize = 13.sp, fontWeight = FontWeight.Bold)
                    }
                }
                Spacer(modifier = Modifier.height(24.dp))
            }

            // Section: Today's Alerts
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Today's Alerts (${uiState.todayAlerts.size})",
                        style = MaterialTheme.typography.titleMedium,
                        color = MaterialTheme.colorScheme.onSurface,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = "View All",
                        style = MaterialTheme.typography.labelSmall,
                        color = Blue500,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.clickable(onClick = onNavigateToAlertsList)
                    )
                }
                Spacer(modifier = Modifier.height(10.dp))
            }

            if (uiState.todayAlerts.isEmpty()) {
                item {
                    EmptyStateView(
                        title = "No alerts due today",
                        subtitle = "Check upcoming scheduled alerts below",
                        modifier = Modifier.padding(vertical = 12.dp)
                    )
                }
            } else {
                items(uiState.todayAlerts.take(4)) { alert ->
                    AlertCard(
                        alert = alert,
                        onClick = { onNavigateToAlertDetails(alert.id) }
                    )
                    Spacer(modifier = Modifier.height(10.dp))
                }
            }

            // Section: Active Groups
            item {
                Spacer(modifier = Modifier.height(16.dp))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Active Groups (${uiState.activeGroups.size})",
                        style = MaterialTheme.typography.titleMedium,
                        color = MaterialTheme.colorScheme.onSurface,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = "Manage",
                        style = MaterialTheme.typography.labelSmall,
                        color = Blue500,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.clickable(onClick = onNavigateToGroupsList)
                    )
                }
                Spacer(modifier = Modifier.height(10.dp))
            }

            if (uiState.activeGroups.isEmpty()) {
                item {
                    EmptyStateView(
                        title = "No groups available",
                        subtitle = "Create groups to target alerts",
                        modifier = Modifier.padding(vertical = 12.dp)
                    )
                }
            } else {
                items(uiState.activeGroups.take(3)) { group ->
                    GroupCard(
                        group = group,
                        onClick = { onNavigateToGroupDetails(group.id) }
                    )
                    Spacer(modifier = Modifier.height(10.dp))
                }
            }

            item {
                Spacer(modifier = Modifier.height(28.dp))
            }
        }
    }
}
