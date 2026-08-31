package com.example.organizationalert.ui.feature.setup

import android.util.Log
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
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Dns
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Sync
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ExposedDropdownMenuBox
import androidx.compose.material3.ExposedDropdownMenuDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.organizationalert.core.network.ApiClient
import com.example.organizationalert.core.network.dto.OrganizationDto
import com.example.organizationalert.core.network.dto.UserDto
import com.example.organizationalert.core.preferences.UserPreferences
import com.example.organizationalert.core.socket.SocketManager
import com.example.organizationalert.core.sync.SyncManager
import com.example.organizationalert.ui.components.ErrorBanner
import com.example.organizationalert.ui.theme.Blue500
import com.example.organizationalert.ui.theme.Green500
import com.example.organizationalert.ui.theme.Slate400
import com.example.organizationalert.ui.theme.Slate700
import com.example.organizationalert.ui.theme.Slate800
import com.example.organizationalert.ui.theme.Slate900
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class SetupUiState(
    val serverUrl: String = "http://10.0.2.2:5000",
    val organizations: List<OrganizationDto> = emptyList(),
    val users: List<UserDto> = emptyList(),
    val selectedOrganization: OrganizationDto? = null,
    val selectedUser: UserDto? = null,
    val isLoading: Boolean = false,
    val isTestingConnection: Boolean = false,
    val isConnected: Boolean = false,
    val errorMessage: String? = null
)

@HiltViewModel
class SetupViewModel @Inject constructor(
    private val preferences: UserPreferences,
    private val syncManager: SyncManager,
    private val socketManager: SocketManager
) : ViewModel() {

    private val _uiState = MutableStateFlow(
        SetupUiState(serverUrl = preferences.getServerUrl())
    )
    val uiState: StateFlow<SetupUiState> = _uiState.asStateFlow()

    init {
        testAndFetchMetadata(_uiState.value.serverUrl)
    }

    fun updateServerUrl(url: String) {
        _uiState.value = _uiState.value.copy(serverUrl = url, errorMessage = null)
    }

    fun testAndFetchMetadata(serverUrl: String) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isTestingConnection = true, errorMessage = null)
            try {
                val api = ApiClient.getService(serverUrl)
                val healthRes = api.checkHealth()
                if (!healthRes.isSuccessful) {
                    throw Exception("Backend unreachable: HTTP ${healthRes.code()}")
                }

                val orgsRes = api.getOrganizations(isActive = true)
                val orgs = orgsRes.body()?.data ?: emptyList()

                val usersRes = api.getUsers(isActive = true)
                val users = usersRes.body()?.data ?: emptyList()

                val selectedOrg = orgs.firstOrNull()
                val filteredUsers = if (selectedOrg != null) {
                    users.filter { it.getOrgIdString() == selectedOrg.id }
                } else users

                _uiState.value = _uiState.value.copy(
                    isTestingConnection = false,
                    isConnected = true,
                    organizations = orgs,
                    users = users,
                    selectedOrganization = selectedOrg,
                    selectedUser = filteredUsers.firstOrNull()
                )
            } catch (e: Exception) {
                Log.e("SetupViewModel", "Connection test failed", e)
                _uiState.value = _uiState.value.copy(
                    isTestingConnection = false,
                    isConnected = false,
                    errorMessage = "Failed to connect to backend: ${e.message}"
                )
            }
        }
    }

    fun selectOrganization(org: OrganizationDto) {
        val usersForOrg = _uiState.value.users.filter { it.getOrgIdString() == org.id }
        _uiState.value = _uiState.value.copy(
            selectedOrganization = org,
            selectedUser = usersForOrg.firstOrNull()
        )
    }

    fun selectUser(user: UserDto) {
        _uiState.value = _uiState.value.copy(selectedUser = user)
    }

    fun connectAndSync(onSuccess: () -> Unit) {
        val state = _uiState.value
        val org = state.selectedOrganization
        val user = state.selectedUser

        if (org == null || user == null) {
            _uiState.value = _uiState.value.copy(errorMessage = "Please select an organization and a user")
            return
        }

        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, errorMessage = null)
            try {
                preferences.setServerUrl(state.serverUrl)
                preferences.setOrganizationId(org.id)
                preferences.setOrganizationName(org.name)
                preferences.setUserId(user.id)
                preferences.setUserName(user.name)
                preferences.setUserEmail(user.email)
                preferences.setUserRole(user.role)

                // Trigger atomic sync
                val syncResult = syncManager.performFullSync()
                if (syncResult.isSuccess) {
                    // Connect Socket.IO
                    socketManager.connect()
                    _uiState.value = _uiState.value.copy(isLoading = false)
                    onSuccess()
                } else {
                    throw syncResult.exceptionOrNull() ?: Exception("Sync failed")
                }
            } catch (e: Exception) {
                Log.e("SetupViewModel", "Connect & Sync failed", e)
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    errorMessage = "Synchronization error: ${e.message}"
                )
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SetupScreen(
    viewModel: SetupViewModel,
    onConnected: () -> Unit
) {
    val uiState by viewModel.uiState.collectAsState()
    val scrollState = rememberScrollState()

    var orgDropdownExpanded by remember { mutableStateOf(false) }
    var userDropdownExpanded by remember { mutableStateOf(false) }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Slate900)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(24.dp)
                .verticalScroll(scrollState),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Spacer(modifier = Modifier.height(20.dp))

            Surface(
                color = Blue500.copy(alpha = 0.15f),
                shape = RoundedCornerShape(16.dp),
                modifier = Modifier.size(56.dp)
            ) {
                Box(contentAlignment = Alignment.Center) {
                    Icon(
                        imageVector = Icons.Default.Dns,
                        contentDescription = null,
                        tint = Blue500,
                        modifier = Modifier.size(32.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            Text(
                text = "Server Configuration",
                style = MaterialTheme.typography.headlineMedium,
                color = MaterialTheme.colorScheme.onSurface,
                fontWeight = FontWeight.Bold
            )

            Text(
                text = "Connect device to Organization Alert backend",
                style = MaterialTheme.typography.bodyMedium,
                color = Slate400
            )

            Spacer(modifier = Modifier.height(24.dp))

            if (uiState.errorMessage != null) {
                ErrorBanner(message = uiState.errorMessage!!)
                Spacer(modifier = Modifier.height(12.dp))
            }

            // Server URL card
            Card(
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = Slate800),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(18.dp)) {
                    Text(
                        text = "BACKEND SERVER URL",
                        style = MaterialTheme.typography.labelSmall,
                        color = Slate400,
                        fontWeight = FontWeight.Bold
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    OutlinedTextField(
                        value = uiState.serverUrl,
                        onValueChange = { viewModel.updateServerUrl(it) },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true,
                        placeholder = { Text("http://10.0.2.2:5000", color = Slate400) },
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = Blue500,
                            unfocusedBorderColor = Slate700,
                            focusedTextColor = Color.White,
                            unfocusedTextColor = Color.White
                        )
                    )

                    Spacer(modifier = Modifier.height(12.dp))

                    Button(
                        onClick = { viewModel.testAndFetchMetadata(uiState.serverUrl) },
                        enabled = !uiState.isTestingConnection,
                        colors = ButtonDefaults.buttonColors(containerColor = Slate700),
                        shape = RoundedCornerShape(8.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        if (uiState.isTestingConnection) {
                            CircularProgressIndicator(
                                color = Color.White,
                                modifier = Modifier.size(16.dp),
                                strokeWidth = 2.dp
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text("Connecting...")
                        } else {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(Icons.Default.Sync, contentDescription = null, modifier = Modifier.size(16.dp))
                                Spacer(modifier = Modifier.width(6.dp))
                                Text("Test Connection & Fetch Data")
                            }
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Organization & User Selection
            Card(
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = Slate800),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(18.dp)) {
                    // Organization selector
                    Text(
                        text = "ORGANIZATION",
                        style = MaterialTheme.typography.labelSmall,
                        color = Slate400,
                        fontWeight = FontWeight.Bold
                    )
                    Spacer(modifier = Modifier.height(8.dp))

                    ExposedDropdownMenuBox(
                        expanded = orgDropdownExpanded,
                        onExpandedChange = { orgDropdownExpanded = !orgDropdownExpanded }
                    ) {
                        OutlinedTextField(
                            value = uiState.selectedOrganization?.name ?: "Select Organization",
                            onValueChange = {},
                            readOnly = true,
                            trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = orgDropdownExpanded) },
                            leadingIcon = { Icon(Icons.Default.Business, contentDescription = null, tint = Slate400) },
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
                            expanded = orgDropdownExpanded,
                            onDismissRequest = { orgDropdownExpanded = false }
                        ) {
                            uiState.organizations.forEach { org ->
                                DropdownMenuItem(
                                    text = { Text(org.name) },
                                    onClick = {
                                        viewModel.selectOrganization(org)
                                        orgDropdownExpanded = false
                                    }
                                )
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    // User selector
                    Text(
                        text = "USER / PARTICIPANT",
                        style = MaterialTheme.typography.labelSmall,
                        color = Slate400,
                        fontWeight = FontWeight.Bold
                    )
                    Spacer(modifier = Modifier.height(8.dp))

                    val usersForOrg = uiState.users.filter {
                        uiState.selectedOrganization == null || it.getOrgIdString() == uiState.selectedOrganization!!.id
                    }

                    ExposedDropdownMenuBox(
                        expanded = userDropdownExpanded,
                        onExpandedChange = { userDropdownExpanded = !userDropdownExpanded }
                    ) {
                        OutlinedTextField(
                            value = uiState.selectedUser?.let { "${it.name} (${it.role})" } ?: "Select User",
                            onValueChange = {},
                            readOnly = true,
                            trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = userDropdownExpanded) },
                            leadingIcon = { Icon(Icons.Default.Person, contentDescription = null, tint = Slate400) },
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
                            expanded = userDropdownExpanded,
                            onDismissRequest = { userDropdownExpanded = false }
                        ) {
                            usersForOrg.forEach { user ->
                                DropdownMenuItem(
                                    text = { Text("${user.name} (${user.role}) - ${user.email}") },
                                    onClick = {
                                        viewModel.selectUser(user)
                                        userDropdownExpanded = false
                                    }
                                )
                            }
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Connect & Sync button
            Button(
                onClick = { viewModel.connectAndSync(onConnected) },
                enabled = !uiState.isLoading && uiState.selectedUser != null && uiState.selectedOrganization != null,
                colors = ButtonDefaults.buttonColors(containerColor = Blue500),
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .height(52.dp)
            ) {
                if (uiState.isLoading) {
                    CircularProgressIndicator(
                        color = Color.White,
                        modifier = Modifier.size(20.dp),
                        strokeWidth = 2.dp
                    )
                    Spacer(modifier = Modifier.width(10.dp))
                    Text("Synchronizing Alerts & Alarms...", fontSize = 16.sp, fontWeight = FontWeight.Bold)
                } else {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.CheckCircle, contentDescription = null, modifier = Modifier.size(20.dp))
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("Connect & Start", fontSize = 16.sp, fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    }
}
