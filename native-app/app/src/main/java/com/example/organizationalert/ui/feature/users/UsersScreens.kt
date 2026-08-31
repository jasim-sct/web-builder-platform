package com.example.organizationalert.ui.feature.users

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
import androidx.compose.material.icons.filled.Email
import androidx.compose.material.icons.filled.Group
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Phone
import androidx.compose.material.icons.filled.Security
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
import com.example.organizationalert.data.repository.GroupRepository
import com.example.organizationalert.data.repository.UserRepository
import com.example.organizationalert.domain.model.User
import com.example.organizationalert.domain.model.UserRole
import com.example.organizationalert.ui.components.DetailRow
import com.example.organizationalert.ui.components.EmptyStateView
import com.example.organizationalert.ui.components.UserCard
import com.example.organizationalert.ui.theme.Blue400
import com.example.organizationalert.ui.theme.Blue500
import com.example.organizationalert.ui.theme.Green500
import com.example.organizationalert.ui.theme.Purple500
import com.example.organizationalert.ui.theme.Red500
import com.example.organizationalert.ui.theme.Slate400
import com.example.organizationalert.ui.theme.Slate700
import com.example.organizationalert.ui.theme.Slate800
import com.example.organizationalert.ui.neo.LocalNeoColors
import com.example.organizationalert.ui.neo.NeoDetailScaffold
import com.example.organizationalert.ui.neo.NeoFab
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class UsersViewModel @Inject constructor(
    private val userRepository: UserRepository,
    private val groupRepository: GroupRepository
) : ViewModel() {

    val users: StateFlow<List<User>> = userRepository.allUsers
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    fun getUserById(id: String) = userRepository.getUserById(id)

    fun getUserGroups(userId: String) = groupRepository.activeGroups
        .map { list -> list.filter { it.memberIds.contains(userId) } }

    fun saveUser(
        userId: String?,
        name: String,
        email: String,
        phone: String,
        role: UserRole,
        isActive: Boolean,
        onSuccess: () -> Unit
    ) {
        viewModelScope.launch {
            val res = if (userId != null) {
                userRepository.updateUser(userId, name, phone, role, isActive)
            } else {
                userRepository.createUser(name, email, phone, role)
            }
            if (res.isSuccess) onSuccess()
        }
    }

    fun deleteUser(userId: String, onSuccess: () -> Unit) {
        viewModelScope.launch {
            val res = userRepository.deleteUser(userId)
            if (res.isSuccess) onSuccess()
        }
    }
}

@Composable
fun UsersListScreen(
    viewModel: UsersViewModel,
    onNavigateToUserDetails: (String) -> Unit,
    onNavigateToCreateUser: () -> Unit
) {
    val users by viewModel.users.collectAsState()

    Box(Modifier.fillMaxSize()) {
        if (users.isEmpty()) {
            EmptyStateView(
                title = "No customers found",
                subtitle = "Add participants to assign them to groups and alerts",
                modifier = Modifier
                    .fillMaxSize()
                    .padding(20.dp)
            )
        } else {
            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(horizontal = 20.dp, vertical = 12.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                items(users) { user ->
                    UserCard(
                        user = user,
                        onClick = { onNavigateToUserDetails(user.id) }
                    )
                }
                item { Spacer(modifier = Modifier.height(88.dp)) }
            }
        }
        NeoFab(
            onClick = onNavigateToCreateUser,
            contentDescription = "Create Customer",
            modifier = Modifier
                .align(Alignment.BottomEnd)
                .padding(20.dp)
        )
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun UserDetailsScreen(
    userId: String,
    viewModel: UsersViewModel,
    onNavigateBack: () -> Unit,
    onNavigateToEdit: (String) -> Unit
) {
    val userState by viewModel.getUserById(userId).collectAsState(initial = null)
    val userGroups by viewModel.getUserGroups(userId).collectAsState(initial = emptyList())

    NeoDetailScaffold(
        title = "Customer Details",
        onNavigateBack = onNavigateBack,
        actions = {
            IconButton(onClick = { onNavigateToEdit(userId) }) {
                Icon(Icons.Default.Edit, contentDescription = "Edit", tint = LocalNeoColors.current.primary)
            }
            IconButton(onClick = {
                viewModel.deleteUser(userId) { onNavigateBack() }
            }) {
                Icon(Icons.Default.Delete, contentDescription = "Delete", tint = LocalNeoColors.current.danger)
            }
        }
    ) { padding ->
        val user = userState
        if (user == null) {
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
                Spacer(modifier = Modifier.height(16.dp))

                Row(verticalAlignment = Alignment.CenterVertically) {
                    Surface(
                        color = if (user.role == UserRole.ADMIN) Purple500.copy(alpha = 0.15f) else Slate700,
                        shape = CircleShape,
                        modifier = Modifier.size(56.dp)
                    ) {
                        Box(contentAlignment = Alignment.Center) {
                            Icon(
                                imageVector = Icons.Default.Person,
                                contentDescription = null,
                                tint = if (user.role == UserRole.ADMIN) Purple500 else Slate400,
                                modifier = Modifier.size(32.dp)
                            )
                        }
                    }
                    Spacer(modifier = Modifier.width(14.dp))
                    Column {
                        Text(user.name, style = MaterialTheme.typography.headlineMedium, color = Color.White, fontWeight = FontWeight.Bold)
                        Text(user.email, style = MaterialTheme.typography.bodyMedium, color = Slate400)
                    }
                }

                Spacer(modifier = Modifier.height(24.dp))

                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(14.dp),
                    colors = CardDefaults.cardColors(containerColor = Slate800)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        DetailRow(label = "Role", value = user.role.name)
                        DetailRow(label = "Phone", value = user.phone.ifBlank { "Not provided" })
                        DetailRow(label = "Status", value = if (user.isActive) "Active" else "Inactive")
                    }
                }

                Spacer(modifier = Modifier.height(24.dp))

                Text("Assigned Groups (${userGroups.size})", style = MaterialTheme.typography.titleMedium, color = Color.White, fontWeight = FontWeight.Bold)
                Spacer(modifier = Modifier.height(8.dp))

                if (userGroups.isEmpty()) {
                    EmptyStateView(
                        title = "Not assigned to any group",
                        subtitle = "Add this participant to groups to receive targeted alerts"
                    )
                } else {
                    userGroups.forEach { group ->
                        Card(
                            modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp),
                            shape = RoundedCornerShape(10.dp),
                            colors = CardDefaults.cardColors(containerColor = Slate800)
                        ) {
                            Row(
                                modifier = Modifier.fillMaxWidth().padding(12.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Icon(Icons.Default.Group, contentDescription = null, tint = Blue400, modifier = Modifier.size(20.dp))
                                Spacer(modifier = Modifier.width(10.dp))
                                Text(group.name, color = Color.White, fontWeight = FontWeight.SemiBold)
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(40.dp))
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CreateEditUserScreen(
    userId: String?,
    viewModel: UsersViewModel,
    onNavigateBack: () -> Unit
) {
    val userState by viewModel.getUserById(userId ?: "").collectAsState(initial = null)

    var name by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var phone by remember { mutableStateOf("") }
    var role by remember { mutableStateOf(UserRole.MEMBER) }
    var isActive by remember { mutableStateOf(true) }
    var roleDropdownExpanded by remember { mutableStateOf(false) }

    remember(userState) {
        userState?.let {
            name = it.name
            email = it.email
            phone = it.phone
            role = it.role
            isActive = it.isActive
        }
        null
    }

    NeoDetailScaffold(
        title = if (userId != null) "Edit Customer" else "Create Customer",
        onNavigateBack = onNavigateBack
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(20.dp)
                .verticalScroll(rememberScrollState())
        ) {
            Spacer(modifier = Modifier.height(12.dp))

            Text("FULL NAME", style = MaterialTheme.typography.labelSmall, color = Slate400, fontWeight = FontWeight.Bold)
            Spacer(modifier = Modifier.height(6.dp))
            OutlinedTextField(
                value = name,
                onValueChange = { name = it },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true,
                placeholder = { Text("e.g. Jasim Ahmed", color = Slate400) },
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = Blue500,
                    unfocusedBorderColor = Slate700,
                    focusedTextColor = Color.White,
                    unfocusedTextColor = Color.White
                )
            )

            Spacer(modifier = Modifier.height(14.dp))

            Text("EMAIL ADDRESS", style = MaterialTheme.typography.labelSmall, color = Slate400, fontWeight = FontWeight.Bold)
            Spacer(modifier = Modifier.height(6.dp))
            OutlinedTextField(
                value = email,
                onValueChange = { email = it },
                enabled = userId == null,
                modifier = Modifier.fillMaxWidth(),
                singleLine = true,
                placeholder = { Text("user@organization.com", color = Slate400) },
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = Blue500,
                    unfocusedBorderColor = Slate700,
                    focusedTextColor = Color.White,
                    unfocusedTextColor = Color.White
                )
            )

            Spacer(modifier = Modifier.height(14.dp))

            Text("PHONE NUMBER (OPTIONAL)", style = MaterialTheme.typography.labelSmall, color = Slate400, fontWeight = FontWeight.Bold)
            Spacer(modifier = Modifier.height(6.dp))
            OutlinedTextField(
                value = phone,
                onValueChange = { phone = it },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true,
                placeholder = { Text("+1 555-0199", color = Slate400) },
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = Blue500,
                    unfocusedBorderColor = Slate700,
                    focusedTextColor = Color.White,
                    unfocusedTextColor = Color.White
                )
            )

            Spacer(modifier = Modifier.height(14.dp))

            Text("ROLE", style = MaterialTheme.typography.labelSmall, color = Slate400, fontWeight = FontWeight.Bold)
            Spacer(modifier = Modifier.height(6.dp))
            ExposedDropdownMenuBox(
                expanded = roleDropdownExpanded,
                onExpandedChange = { roleDropdownExpanded = !roleDropdownExpanded }
            ) {
                OutlinedTextField(
                    value = role.name,
                    onValueChange = {},
                    readOnly = true,
                    trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = roleDropdownExpanded) },
                    leadingIcon = { Icon(Icons.Default.Security, contentDescription = null, tint = Slate400) },
                    modifier = Modifier.menuAnchor().fillMaxWidth(),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = Blue500,
                        unfocusedBorderColor = Slate700,
                        focusedTextColor = Color.White,
                        unfocusedTextColor = Color.White
                    )
                )

                ExposedDropdownMenu(
                    expanded = roleDropdownExpanded,
                    onDismissRequest = { roleDropdownExpanded = false }
                ) {
                    UserRole.entries.forEach { r ->
                        DropdownMenuItem(
                            text = { Text(r.name) },
                            onClick = {
                                role = r
                                roleDropdownExpanded = false
                            }
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(28.dp))

            Button(
                onClick = {
                    viewModel.saveUser(userId, name, email, phone, role, isActive, onNavigateBack)
                },
                enabled = name.isNotBlank() && email.isNotBlank(),
                colors = ButtonDefaults.buttonColors(containerColor = Blue500),
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier.fillMaxWidth().height(50.dp)
            ) {
                Text(if (userId != null) "Update User" else "Create User", fontSize = 16.sp, fontWeight = FontWeight.Bold)
            }
        }
    }
}
