package com.example.organizationalert.ui.feature.groups

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
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.Group
import androidx.compose.material.icons.filled.PersonAdd
import androidx.compose.material.icons.filled.PersonRemove
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ExposedDropdownMenuBox
import androidx.compose.material3.ExposedDropdownMenuDefaults
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
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
import com.example.organizationalert.data.repository.AlertRepository
import com.example.organizationalert.data.repository.GroupRepository
import com.example.organizationalert.data.repository.UserRepository
import com.example.organizationalert.domain.model.Group
import com.example.organizationalert.domain.model.User
import com.example.organizationalert.domain.model.UserRole
import com.example.organizationalert.ui.components.AlertCard
import com.example.organizationalert.ui.components.EmptyStateView
import com.example.organizationalert.ui.components.GroupCard
import com.example.organizationalert.ui.components.UserCard
import com.example.organizationalert.ui.theme.Blue400
import com.example.organizationalert.ui.theme.Blue500
import com.example.organizationalert.ui.theme.Red500
import com.example.organizationalert.ui.theme.Slate400
import com.example.organizationalert.ui.theme.Slate700
import com.example.organizationalert.ui.theme.Slate800
import com.example.organizationalert.ui.theme.Slate900
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class GroupsViewModel @Inject constructor(
    private val groupRepository: GroupRepository,
    private val userRepository: UserRepository,
    private val alertRepository: AlertRepository,
    private val preferences: UserPreferences
) : ViewModel() {

    val groups: StateFlow<List<Group>> = groupRepository.activeGroups
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val allUsers: StateFlow<List<User>> = userRepository.allUsers
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val isAdmin: Boolean = preferences.getUserRole() == UserRole.ADMIN.name

    fun getGroupById(id: String) = groupRepository.getGroupById(id)

    fun getAlertsForGroup(groupId: String) = alertRepository.allAlerts
        .map { list -> list.filter { it.groupId == groupId } }

    fun addMember(groupId: String, userId: String, onResult: (Boolean) -> Unit) {
        viewModelScope.launch {
            val res = groupRepository.addMember(groupId, userId)
            onResult(res.isSuccess)
        }
    }

    fun removeMember(groupId: String, userId: String, onResult: (Boolean) -> Unit) {
        viewModelScope.launch {
            val res = groupRepository.removeMember(groupId, userId)
            onResult(res.isSuccess)
        }
    }

    fun saveGroup(groupId: String?, name: String, description: String, onSuccess: () -> Unit) {
        viewModelScope.launch {
            val res = if (groupId != null) {
                groupRepository.updateGroup(groupId, name, description)
            } else {
                groupRepository.createGroup(name, description, emptyList())
            }
            if (res.isSuccess) onSuccess()
        }
    }

    fun deleteGroup(groupId: String, onSuccess: () -> Unit) {
        viewModelScope.launch {
            val res = groupRepository.deleteGroup(groupId)
            if (res.isSuccess) onSuccess()
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun GroupsListScreen(
    viewModel: GroupsViewModel,
    onNavigateToGroupDetails: (String) -> Unit,
    onNavigateToCreateGroup: () -> Unit
) {
    val groups by viewModel.groups.collectAsState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Groups", fontWeight = FontWeight.Bold, color = Color.White) },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Slate900)
            )
        },
        floatingActionButton = {
            FloatingActionButton(
                onClick = onNavigateToCreateGroup,
                containerColor = Blue500,
                contentColor = Color.White
            ) {
                Icon(Icons.Default.Add, contentDescription = "Create Group")
            }
        },
        containerColor = Slate900
    ) { padding ->
        if (groups.isEmpty()) {
            EmptyStateView(
                title = "No groups available",
                subtitle = "Create a group to organize users and target alerts",
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding)
            )
        } else {
            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding)
                    .padding(horizontal = 16.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                item { Spacer(modifier = Modifier.height(4.dp)) }
                items(groups) { group ->
                    GroupCard(
                        group = group,
                        onClick = { onNavigateToGroupDetails(group.id) }
                    )
                }
                item { Spacer(modifier = Modifier.height(72.dp)) }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun GroupDetailsScreen(
    groupId: String,
    viewModel: GroupsViewModel,
    onNavigateBack: () -> Unit,
    onNavigateToEdit: (String) -> Unit,
    onNavigateToAlertDetails: (String) -> Unit,
    onNavigateToUserDetails: (String) -> Unit
) {
    val groupState by viewModel.getGroupById(groupId).collectAsState(initial = null)
    val groupAlerts by viewModel.getAlertsForGroup(groupId).collectAsState(initial = emptyList())
    val allUsers by viewModel.allUsers.collectAsState()

    var showAddMemberDialog by remember { mutableStateOf(false) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Group Details", fontWeight = FontWeight.Bold, color = Color.White) },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = Color.White)
                    }
                },
                actions = {
                    IconButton(onClick = { onNavigateToEdit(groupId) }) {
                        Icon(Icons.Default.Edit, contentDescription = "Edit", tint = Blue400)
                    }
                    IconButton(onClick = {
                        viewModel.deleteGroup(groupId) { onNavigateBack() }
                    }) {
                        Icon(Icons.Default.Delete, contentDescription = "Delete", tint = Red500)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Slate900)
            )
        },
        floatingActionButton = {
            FloatingActionButton(
                onClick = { showAddMemberDialog = true },
                containerColor = Blue500,
                contentColor = Color.White
            ) {
                Icon(Icons.Default.PersonAdd, contentDescription = "Add Participant")
            }
        },
        containerColor = Slate900
    ) { padding ->
        val group = groupState
        if (group == null) {
            Box(modifier = Modifier.fillMaxSize().padding(padding), contentAlignment = Alignment.Center) {
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

                Text(
                    text = group.name,
                    style = MaterialTheme.typography.headlineMedium,
                    color = Color.White,
                    fontWeight = FontWeight.Bold
                )

                if (group.description.isNotBlank()) {
                    Spacer(modifier = Modifier.height(6.dp))
                    Text(
                        text = group.description,
                        style = MaterialTheme.typography.bodyLarge,
                        color = Slate400
                    )
                }

                Spacer(modifier = Modifier.height(20.dp))

                // Group Members Section
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Members (${group.members.size})",
                        style = MaterialTheme.typography.titleMedium,
                        color = Color.White,
                        fontWeight = FontWeight.Bold
                    )
                    TextButton(onClick = { showAddMemberDialog = true }) {
                        Icon(Icons.Default.PersonAdd, contentDescription = null, tint = Blue400, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Add Member", color = Blue400, fontSize = 13.sp)
                    }
                }

                Spacer(modifier = Modifier.height(8.dp))

                if (group.members.isEmpty()) {
                    EmptyStateView(
                        title = "No participants yet",
                        subtitle = "Add members to target them with group alerts"
                    )
                } else {
                    group.members.forEach { member ->
                        Card(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 4.dp),
                            shape = RoundedCornerShape(10.dp),
                            colors = CardDefaults.cardColors(containerColor = Slate800)
                        ) {
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(12.dp),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Column(modifier = Modifier.weight(1f).clickable { onNavigateToUserDetails(member.id) }) {
                                    Text(member.name, color = Color.White, fontWeight = FontWeight.SemiBold)
                                    Text(member.email, color = Slate400, fontSize = 12.sp)
                                }

                                IconButton(onClick = {
                                    viewModel.removeMember(groupId, member.id) {}
                                }) {
                                    Icon(Icons.Default.PersonRemove, contentDescription = "Remove", tint = Red500)
                                }
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(24.dp))

                // Upcoming Alerts for this group
                Text(
                    text = "Upcoming Alerts (${groupAlerts.size})",
                    style = MaterialTheme.typography.titleMedium,
                    color = Color.White,
                    fontWeight = FontWeight.Bold
                )

                Spacer(modifier = Modifier.height(10.dp))

                if (groupAlerts.isEmpty()) {
                    EmptyStateView(
                        title = "No alerts for this group",
                        subtitle = "Alerts created for this group will appear here"
                    )
                } else {
                    groupAlerts.forEach { alert ->
                        AlertCard(alert = alert, onClick = { onNavigateToAlertDetails(alert.id) })
                        Spacer(modifier = Modifier.height(8.dp))
                    }
                }

                Spacer(modifier = Modifier.height(80.dp))
            }
        }
    }

    // Add Member Dialog
    if (showAddMemberDialog) {
        val nonMembers = allUsers.filter { user -> groupState?.memberIds?.contains(user.id) == false }
        var selectedUserToAdd by remember { mutableStateOf<User?>(nonMembers.firstOrNull()) }
        var dropdownExpanded by remember { mutableStateOf(false) }

        AlertDialog(
            onDismissRequest = { showAddMemberDialog = false },
            title = { Text("Add Participant to Group", color = Color.White, fontWeight = FontWeight.Bold) },
            text = {
                Column {
                    if (nonMembers.isEmpty()) {
                        Text("All users are already in this group.", color = Slate400)
                    } else {
                        Text("Select a user to add:", color = Slate400, fontSize = 13.sp)
                        Spacer(modifier = Modifier.height(8.dp))

                        ExposedDropdownMenuBox(
                            expanded = dropdownExpanded,
                            onExpandedChange = { dropdownExpanded = !dropdownExpanded }
                        ) {
                            OutlinedTextField(
                                value = selectedUserToAdd?.let { "${it.name} (${it.email})" } ?: "Select",
                                onValueChange = {},
                                readOnly = true,
                                trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = dropdownExpanded) },
                                modifier = Modifier.menuAnchor().fillMaxWidth(),
                                colors = OutlinedTextFieldDefaults.colors(
                                    focusedBorderColor = Blue500,
                                    unfocusedBorderColor = Slate700,
                                    focusedTextColor = Color.White,
                                    unfocusedTextColor = Color.White
                                )
                            )

                            ExposedDropdownMenu(
                                expanded = dropdownExpanded,
                                onDismissRequest = { dropdownExpanded = false }
                            ) {
                                nonMembers.forEach { user ->
                                    DropdownMenuItem(
                                        text = { Text("${user.name} (${user.email})") },
                                        onClick = {
                                            selectedUserToAdd = user
                                            dropdownExpanded = false
                                        }
                                    )
                                }
                            }
                        }
                    }
                }
            },
            confirmButton = {
                if (selectedUserToAdd != null) {
                    Button(
                        onClick = {
                            selectedUserToAdd?.let { user ->
                                viewModel.addMember(groupId, user.id) {
                                    showAddMemberDialog = false
                                }
                            }
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = Blue500)
                    ) {
                        Text("Add")
                    }
                }
            },
            dismissButton = {
                TextButton(onClick = { showAddMemberDialog = false }) {
                    Text("Cancel", color = Slate400)
                }
            },
            containerColor = Slate800
        )
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CreateEditGroupScreen(
    groupId: String?,
    viewModel: GroupsViewModel,
    onNavigateBack: () -> Unit
) {
    val groupState by viewModel.getGroupById(groupId ?: "").collectAsState(initial = null)

    var name by remember { mutableStateOf("") }
    var description by remember { mutableStateOf("") }

    remember(groupState) {
        groupState?.let {
            name = it.name
            description = it.description
        }
        null
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(if (groupId != null) "Edit Group" else "Create Group", fontWeight = FontWeight.Bold, color = Color.White) },
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
                .padding(20.dp)
        ) {
            Spacer(modifier = Modifier.height(12.dp))

            Text("GROUP NAME", style = MaterialTheme.typography.labelSmall, color = Slate400, fontWeight = FontWeight.Bold)
            Spacer(modifier = Modifier.height(6.dp))
            OutlinedTextField(
                value = name,
                onValueChange = { name = it },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true,
                placeholder = { Text("e.g. Engineering Team", color = Slate400) },
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = Blue500,
                    unfocusedBorderColor = Slate700,
                    focusedTextColor = Color.White,
                    unfocusedTextColor = Color.White
                )
            )

            Spacer(modifier = Modifier.height(16.dp))

            Text("DESCRIPTION", style = MaterialTheme.typography.labelSmall, color = Slate400, fontWeight = FontWeight.Bold)
            Spacer(modifier = Modifier.height(6.dp))
            OutlinedTextField(
                value = description,
                onValueChange = { description = it },
                modifier = Modifier.fillMaxWidth().height(100.dp),
                placeholder = { Text("Describe group purpose...", color = Slate400) },
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = Blue500,
                    unfocusedBorderColor = Slate700,
                    focusedTextColor = Color.White,
                    unfocusedTextColor = Color.White
                )
            )

            Spacer(modifier = Modifier.height(28.dp))

            Button(
                onClick = {
                    viewModel.saveGroup(groupId, name, description, onNavigateBack)
                },
                enabled = name.isNotBlank(),
                colors = ButtonDefaults.buttonColors(containerColor = Blue500),
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier.fillMaxWidth().height(50.dp)
            ) {
                Text(if (groupId != null) "Update Group" else "Create Group", fontSize = 16.sp, fontWeight = FontWeight.Bold)
            }
        }
    }
}
