package com.example.organizationalert.ui.feature.alerts

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
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Alarm
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Campaign
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.Group
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.PriorityHigh
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ExposedDropdownMenuBox
import androidx.compose.material3.ExposedDropdownMenuDefaults
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Switch
import androidx.compose.material3.SwitchDefaults
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.organizationalert.core.preferences.UserPreferences
import com.example.organizationalert.core.scheduling.TimezoneHelper
import com.example.organizationalert.data.repository.AlertRepository
import com.example.organizationalert.data.repository.GroupRepository
import com.example.organizationalert.domain.model.Alert
import com.example.organizationalert.domain.model.AlertDelivery
import com.example.organizationalert.domain.model.AlertStatus
import com.example.organizationalert.domain.model.DeliveryStatus
import com.example.organizationalert.domain.model.Group
import com.example.organizationalert.domain.model.Priority
import com.example.organizationalert.domain.model.RepeatType
import com.example.organizationalert.domain.model.UserRole
import com.example.organizationalert.ui.components.AlertCard
import com.example.organizationalert.ui.components.EmptyStateView
import com.example.organizationalert.ui.components.ErrorBanner
import com.example.organizationalert.ui.components.PriorityBadge
import com.example.organizationalert.ui.components.RepeatBadge
import com.example.organizationalert.ui.components.StatusBadge
import com.example.organizationalert.ui.theme.Blue400
import com.example.organizationalert.ui.theme.Blue500
import com.example.organizationalert.ui.theme.Green500
import com.example.organizationalert.ui.theme.Orange500
import com.example.organizationalert.ui.theme.Purple500
import com.example.organizationalert.ui.theme.Red500
import com.example.organizationalert.ui.theme.Slate400
import com.example.organizationalert.ui.theme.Slate600
import com.example.organizationalert.ui.theme.Slate700
import com.example.organizationalert.ui.theme.Slate800
import com.example.organizationalert.ui.theme.Slate900
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import java.time.Instant
import java.time.LocalDate
import java.time.LocalTime
import java.time.ZoneId
import javax.inject.Inject

enum class AlertFilter {
    ALL,
    TODAY,
    TOMORROW,
    UPCOMING,
    COMPLETED,
    CANCELLED
}

data class AlertsListUiState(
    val alerts: List<Alert> = emptyList(),
    val filteredAlerts: List<Alert> = emptyList(),
    val selectedFilter: AlertFilter = AlertFilter.ALL,
    val isAdmin: Boolean = false,
    val isLoading: Boolean = false,
    val errorMessage: String? = null
)

@HiltViewModel
class AlertsViewModel @Inject constructor(
    private val alertRepository: AlertRepository,
    private val groupRepository: GroupRepository,
    private val preferences: UserPreferences
) : ViewModel() {

    private val _selectedFilter = MutableStateFlow(AlertFilter.ALL)
    private val _errorMessage = MutableStateFlow<String?>(null)
    private val _isLoading = MutableStateFlow(false)

    val listUiState: StateFlow<AlertsListUiState> = combine(
        alertRepository.allAlerts,
        _selectedFilter,
        _isLoading,
        _errorMessage
    ) { alerts, filter, isLoading, errorMsg ->
        val zone = ZoneId.systemDefault()
        val today = LocalDate.now()
        val tomorrow = today.plusDays(1)

        val filtered = when (filter) {
            AlertFilter.ALL -> alerts
            AlertFilter.TODAY -> alerts.filter {
                val trigger = it.nextTriggerAt ?: it.scheduledAt
                trigger.atZone(zone).toLocalDate() == today
            }
            AlertFilter.TOMORROW -> alerts.filter {
                val trigger = it.nextTriggerAt ?: it.scheduledAt
                trigger.atZone(zone).toLocalDate() == tomorrow
            }
            AlertFilter.UPCOMING -> alerts.filter {
                it.isEnabled && (it.nextTriggerAt ?: it.scheduledAt).isAfter(Instant.now())
            }
            AlertFilter.COMPLETED -> alerts.filter {
                it.status == AlertStatus.COMPLETED || it.status == AlertStatus.TRIGGERED
            }
            AlertFilter.CANCELLED -> alerts.filter {
                it.status == AlertStatus.CANCELLED || it.status == AlertStatus.DISABLED
            }
        }

        AlertsListUiState(
            alerts = alerts,
            filteredAlerts = filtered,
            selectedFilter = filter,
            isAdmin = preferences.getUserRole() == UserRole.ADMIN.name,
            isLoading = isLoading,
            errorMessage = errorMsg
        )
    }.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5000),
        initialValue = AlertsListUiState()
    )

    fun setFilter(filter: AlertFilter) {
        _selectedFilter.value = filter
    }

    fun getAlertById(id: String) = alertRepository.getAlertById(id)

    fun getDeliveries(alertId: String) = alertRepository.getDeliveriesByAlert(alertId)

    val activeGroups: StateFlow<List<Group>> = groupRepository.activeGroups
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    fun acknowledgeAlert(alertId: String, onResult: (Boolean) -> Unit) {
        viewModelScope.launch {
            val res = alertRepository.acknowledgeAlert(alertId)
            onResult(res.isSuccess)
        }
    }

    fun triggerImmediately(alertId: String, onResult: (Boolean) -> Unit) {
        viewModelScope.launch {
            val res = alertRepository.triggerAlertImmediately(alertId)
            onResult(res.isSuccess)
        }
    }

    fun deleteAlert(alertId: String, onResult: (Boolean) -> Unit) {
        viewModelScope.launch {
            val res = alertRepository.deleteAlert(alertId)
            onResult(res.isSuccess)
        }
    }

    fun saveAlert(
        alertId: String?,
        title: String,
        message: String,
        groupId: String,
        scheduledAt: Instant,
        repeatType: RepeatType,
        priority: Priority,
        isBroadcastImmediately: Boolean,
        onSuccess: () -> Unit
    ) {
        viewModelScope.launch {
            _isLoading.value = true
            _errorMessage.value = null
            try {
                if (isBroadcastImmediately) {
                    val res = alertRepository.broadcastNow(
                        title = title,
                        message = message,
                        groupId = groupId,
                        priority = priority
                    )
                    if (res.isSuccess) onSuccess() else throw res.exceptionOrNull() ?: Exception("Broadcast failed")
                } else if (alertId != null) {
                    val res = alertRepository.updateAlert(
                        id = alertId,
                        title = title,
                        message = message,
                        groupId = groupId,
                        scheduledAt = scheduledAt,
                        repeatType = repeatType,
                        priority = priority
                    )
                    if (res.isSuccess) onSuccess() else throw res.exceptionOrNull() ?: Exception("Update failed")
                } else {
                    val res = alertRepository.createAlert(
                        title = title,
                        message = message,
                        groupId = groupId,
                        scheduledAt = scheduledAt,
                        repeatType = repeatType,
                        priority = priority
                    )
                    if (res.isSuccess) onSuccess() else throw res.exceptionOrNull() ?: Exception("Create failed")
                }
            } catch (e: Exception) {
                _errorMessage.value = e.message ?: "Failed to save alert"
            } finally {
                _isLoading.value = false
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AlertsListScreen(
    viewModel: AlertsViewModel,
    onNavigateToAlertDetails: (String) -> Unit,
    onNavigateToCreateAlert: () -> Unit
) {
    val uiState by viewModel.listUiState.collectAsState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = "Alerts & Reminders",
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Slate900)
            )
        },
        floatingActionButton = {
            FloatingActionButton(
                onClick = onNavigateToCreateAlert,
                containerColor = Blue500,
                contentColor = Color.White
            ) {
                Icon(Icons.Default.Add, contentDescription = "Create Alert")
            }
        },
        containerColor = Slate900
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
        ) {
            // Filter chips horizontal scroll
            LazyRow(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 8.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                items(AlertFilter.entries.toTypedArray()) { filter ->
                    val selected = uiState.selectedFilter == filter
                    FilterChip(
                        selected = selected,
                        onClick = { viewModel.setFilter(filter) },
                        label = { Text(filter.name.replace("_", " ")) },
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = Blue500,
                            selectedLabelColor = Color.White,
                            containerColor = Slate800,
                            labelColor = Slate400
                        )
                    )
                }
            }

            if (uiState.filteredAlerts.isEmpty()) {
                EmptyStateView(
                    title = "No alerts found",
                    subtitle = "No alerts match the selected filter criteria",
                    modifier = Modifier.padding(top = 40.dp)
                )
            } else {
                LazyColumn(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(horizontal = 16.dp),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    item { Spacer(modifier = Modifier.height(4.dp)) }
                    items(uiState.filteredAlerts) { alert ->
                        AlertCard(
                            alert = alert,
                            onClick = { onNavigateToAlertDetails(alert.id) }
                        )
                    }
                    item { Spacer(modifier = Modifier.height(72.dp)) }
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AlertDetailsScreen(
    alertId: String,
    viewModel: AlertsViewModel,
    onNavigateBack: () -> Unit,
    onNavigateToEdit: (String) -> Unit
) {
    val alertState by viewModel.getAlertById(alertId).collectAsState(initial = null)
    val deliveries by viewModel.getDeliveries(alertId).collectAsState(initial = emptyList())
    var isAcknowledging by remember { mutableStateOf(false) }
    var isTriggering by remember { mutableStateOf(false) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Alert Details", fontWeight = FontWeight.Bold, color = Color.White) },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = Color.White)
                    }
                },
                actions = {
                    IconButton(onClick = { onNavigateToEdit(alertId) }) {
                        Icon(Icons.Default.Edit, contentDescription = "Edit", tint = Blue400)
                    }
                    IconButton(onClick = {
                        viewModel.deleteAlert(alertId) { onNavigateBack() }
                    }) {
                        Icon(Icons.Default.Delete, contentDescription = "Delete", tint = Red500)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Slate900)
            )
        },
        containerColor = Slate900
    ) { padding ->
        val alert = alertState
        if (alert == null) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding),
                contentAlignment = Alignment.Center
            ) {
                CircularProgressIndicator(color = Blue500)
            }
        } else {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding)
                    .padding(horizontal = 20.dp)
                    .verticalScroll(rememberScrollState())
            ) {
                Spacer(modifier = Modifier.height(12.dp))

                // Title & Priority
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = alert.title,
                        style = MaterialTheme.typography.headlineMedium,
                        color = Color.White,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.weight(1f)
                    )
                    PriorityBadge(priority = alert.priority)
                }

                Spacer(modifier = Modifier.height(8.dp))

                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    StatusBadge(status = alert.status)
                    RepeatBadge(repeatType = alert.repeatType)
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Message card
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(14.dp),
                    colors = CardDefaults.cardColors(containerColor = Slate800)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text(
                            text = "MESSAGE",
                            style = MaterialTheme.typography.labelSmall,
                            color = Slate400,
                            fontWeight = FontWeight.Bold
                        )
                        Spacer(modifier = Modifier.height(6.dp))
                        Text(
                            text = alert.message,
                            style = MaterialTheme.typography.bodyLarge,
                            color = Color.White
                        )
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                // Schedule details
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(14.dp),
                    colors = CardDefaults.cardColors(containerColor = Slate800)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        DetailRow(label = "Target Group", value = alert.groupName ?: alert.groupId)
                        DetailRow(
                            label = "Scheduled For",
                            value = TimezoneHelper.formatUserFriendly(alert.scheduledAt)
                        )
                        if (alert.nextTriggerAt != null) {
                            DetailRow(
                                label = "Next Alarm Trigger",
                                value = TimezoneHelper.formatUserFriendly(alert.nextTriggerAt)
                            )
                        }
                        if (alert.lastTriggeredAt != null) {
                            DetailRow(
                                label = "Last Triggered",
                                value = TimezoneHelper.formatUserFriendly(alert.lastTriggeredAt)
                            )
                        }
                        if (alert.creatorName != null) {
                            DetailRow(label = "Created By", value = alert.creatorName)
                        }
                    }
                }

                Spacer(modifier = Modifier.height(20.dp))

                // Action buttons: Acknowledge & Trigger Now
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Button(
                        onClick = {
                            isAcknowledging = true
                            viewModel.acknowledgeAlert(alert.id) { isAcknowledging = false }
                        },
                        enabled = !isAcknowledging,
                        colors = ButtonDefaults.buttonColors(containerColor = Green500),
                        shape = RoundedCornerShape(10.dp),
                        modifier = Modifier
                            .weight(1f)
                            .height(48.dp)
                    ) {
                        Icon(Icons.Default.Check, contentDescription = null, modifier = Modifier.size(18.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("Acknowledge", fontSize = 14.sp, fontWeight = FontWeight.Bold)
                    }

                    Button(
                        onClick = {
                            isTriggering = true
                            viewModel.triggerImmediately(alert.id) { isTriggering = false }
                        },
                        enabled = !isTriggering,
                        colors = ButtonDefaults.buttonColors(containerColor = Slate700),
                        shape = RoundedCornerShape(10.dp),
                        modifier = Modifier
                            .weight(1f)
                            .height(48.dp)
                    ) {
                        Icon(Icons.Default.PlayArrow, contentDescription = null, modifier = Modifier.size(18.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("Trigger Now", fontSize = 14.sp, fontWeight = FontWeight.Bold)
                    }
                }

                Spacer(modifier = Modifier.height(28.dp))
            }
        }
    }
}

@Composable
fun DetailRow(label: String, value: String) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp),
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Text(text = label, style = MaterialTheme.typography.bodyMedium, color = Slate400)
        Text(text = value, style = MaterialTheme.typography.bodyMedium, color = Color.White, fontWeight = FontWeight.SemiBold)
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CreateEditAlertScreen(
    alertId: String?,
    viewModel: AlertsViewModel,
    onNavigateBack: () -> Unit
) {
    val activeGroups by viewModel.activeGroups.collectAsState()
    val alertState by viewModel.getAlertById(alertId ?: "").collectAsState(initial = null)

    var title by remember { mutableStateOf("") }
    var message by remember { mutableStateOf("") }
    var selectedGroup by remember { mutableStateOf<Group?>(null) }
    var priority by remember { mutableStateOf(Priority.NORMAL) }
    var repeatType by remember { mutableStateOf(RepeatType.ONCE) }
    var isBroadcastImmediately by remember { mutableStateOf(false) }

    var groupDropdownExpanded by remember { mutableStateOf(false) }
    var priorityDropdownExpanded by remember { mutableStateOf(false) }
    var repeatDropdownExpanded by remember { mutableStateOf(false) }

    // Pre-populate if editing
    remember(alertState) {
        alertState?.let {
            title = it.title
            message = it.message
            priority = it.priority
            repeatType = it.repeatType
            selectedGroup = activeGroups.find { g -> g.id == it.groupId }
        }
        null
    }

    if (selectedGroup == null && activeGroups.isNotEmpty()) {
        selectedGroup = activeGroups.first()
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = if (alertId != null) "Edit Alert" else "Create Alert",
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )
                },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = Color.White)
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

            // Broadcast Immediately Switch
            if (alertId == null) {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = Slate800)
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(14.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Default.Campaign, contentDescription = null, tint = Red500)
                            Spacer(modifier = Modifier.width(10.dp))
                            Column {
                                Text("Broadcast Immediately", style = MaterialTheme.typography.titleMedium, color = Color.White)
                                Text("Dispatch immediately via Socket.IO", style = MaterialTheme.typography.labelSmall, color = Slate400)
                            }
                        }
                        Switch(
                            checked = isBroadcastImmediately,
                            onCheckedChange = { isBroadcastImmediately = it },
                            colors = SwitchDefaults.colors(checkedThumbColor = Red500)
                        )
                    }
                }
                Spacer(modifier = Modifier.height(14.dp))
            }

            // Title
            Text("TITLE", style = MaterialTheme.typography.labelSmall, color = Slate400, fontWeight = FontWeight.Bold)
            Spacer(modifier = Modifier.height(6.dp))
            OutlinedTextField(
                value = title,
                onValueChange = { title = it },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true,
                placeholder = { Text("e.g. Daily Standup", color = Slate400) },
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = Blue500,
                    unfocusedBorderColor = Slate700,
                    focusedTextColor = Color.White,
                    unfocusedTextColor = Color.White
                )
            )

            Spacer(modifier = Modifier.height(14.dp))

            // Message
            Text("MESSAGE", style = MaterialTheme.typography.labelSmall, color = Slate400, fontWeight = FontWeight.Bold)
            Spacer(modifier = Modifier.height(6.dp))
            OutlinedTextField(
                value = message,
                onValueChange = { message = it },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(100.dp),
                placeholder = { Text("Enter alert details...", color = Slate400) },
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = Blue500,
                    unfocusedBorderColor = Slate700,
                    focusedTextColor = Color.White,
                    unfocusedTextColor = Color.White
                )
            )

            Spacer(modifier = Modifier.height(14.dp))

            // Target Group
            Text("TARGET GROUP", style = MaterialTheme.typography.labelSmall, color = Slate400, fontWeight = FontWeight.Bold)
            Spacer(modifier = Modifier.height(6.dp))
            ExposedDropdownMenuBox(
                expanded = groupDropdownExpanded,
                onExpandedChange = { groupDropdownExpanded = !groupDropdownExpanded }
            ) {
                OutlinedTextField(
                    value = selectedGroup?.name ?: "Select Group",
                    onValueChange = {},
                    readOnly = true,
                    trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = groupDropdownExpanded) },
                    leadingIcon = { Icon(Icons.Default.Group, contentDescription = null, tint = Slate400) },
                    modifier = Modifier
                        .menuAnchor()
                        .fillMaxWidth(),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = Blue500,
                        unfocusedBorderColor = Slate700,
                        focusedTextColor = Color.White,
                        unfocusedTextColor = Color.White
                    )
                )

                ExposedDropdownMenu(
                    expanded = groupDropdownExpanded,
                    onDismissRequest = { groupDropdownExpanded = false }
                ) {
                    activeGroups.forEach { group ->
                        DropdownMenuItem(
                            text = { Text(group.name) },
                            onClick = {
                                selectedGroup = group
                                groupDropdownExpanded = false
                            }
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            // Priority Selector
            Text("PRIORITY", style = MaterialTheme.typography.labelSmall, color = Slate400, fontWeight = FontWeight.Bold)
            Spacer(modifier = Modifier.height(6.dp))
            ExposedDropdownMenuBox(
                expanded = priorityDropdownExpanded,
                onExpandedChange = { priorityDropdownExpanded = !priorityDropdownExpanded }
            ) {
                OutlinedTextField(
                    value = priority.name,
                    onValueChange = {},
                    readOnly = true,
                    trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = priorityDropdownExpanded) },
                    leadingIcon = { Icon(Icons.Default.PriorityHigh, contentDescription = null, tint = Slate400) },
                    modifier = Modifier
                        .menuAnchor()
                        .fillMaxWidth(),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = Blue500,
                        unfocusedBorderColor = Slate700,
                        focusedTextColor = Color.White,
                        unfocusedTextColor = Color.White
                    )
                )

                ExposedDropdownMenu(
                    expanded = priorityDropdownExpanded,
                    onDismissRequest = { priorityDropdownExpanded = false }
                ) {
                    Priority.entries.forEach { p ->
                        DropdownMenuItem(
                            text = { Text(p.name) },
                            onClick = {
                                priority = p
                                priorityDropdownExpanded = false
                            }
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            // Repeat Type
            if (!isBroadcastImmediately) {
                Text("RECURRENCE", style = MaterialTheme.typography.labelSmall, color = Slate400, fontWeight = FontWeight.Bold)
                Spacer(modifier = Modifier.height(6.dp))
                ExposedDropdownMenuBox(
                    expanded = repeatDropdownExpanded,
                    onExpandedChange = { repeatDropdownExpanded = !repeatDropdownExpanded }
                ) {
                    OutlinedTextField(
                        value = repeatType.name,
                        onValueChange = {},
                        readOnly = true,
                        trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = repeatDropdownExpanded) },
                        leadingIcon = { Icon(Icons.Default.Alarm, contentDescription = null, tint = Slate400) },
                        modifier = Modifier
                            .menuAnchor()
                            .fillMaxWidth(),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = Blue500,
                            unfocusedBorderColor = Slate700,
                            focusedTextColor = Color.White,
                            unfocusedTextColor = Color.White
                        )
                    )

                    ExposedDropdownMenu(
                        expanded = repeatDropdownExpanded,
                        onDismissRequest = { repeatDropdownExpanded = false }
                    ) {
                        RepeatType.entries.forEach { r ->
                            DropdownMenuItem(
                                text = { Text(r.name) },
                                onClick = {
                                    repeatType = r
                                    repeatDropdownExpanded = false
                                }
                            )
                        }
                    }
                }
                Spacer(modifier = Modifier.height(24.dp))
            }

            // Save / Schedule Button
            Button(
                onClick = {
                    val group = selectedGroup ?: return@Button
                    val scheduledTime = Instant.now().plusSeconds(300) // Default 5 mins ahead for demo
                    viewModel.saveAlert(
                        alertId = alertId,
                        title = title,
                        message = message,
                        groupId = group.id,
                        scheduledAt = scheduledTime,
                        repeatType = repeatType,
                        priority = priority,
                        isBroadcastImmediately = isBroadcastImmediately,
                        onSuccess = onNavigateBack
                    )
                },
                enabled = title.isNotBlank() && message.isNotBlank() && selectedGroup != null,
                colors = ButtonDefaults.buttonColors(
                    containerColor = if (isBroadcastImmediately) Red500 else Blue500
                ),
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .height(50.dp)
            ) {
                Text(
                    text = if (isBroadcastImmediately) "Broadcast Now" else if (alertId != null) "Update Alert" else "Schedule Alert",
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold
                )
            }

            Spacer(modifier = Modifier.height(32.dp))
        }
    }
}
