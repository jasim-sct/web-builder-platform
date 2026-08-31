package com.example.organizationalert.ui.navigation

import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalConfiguration
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavHostController
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.navArgument
import com.example.organizationalert.core.notifications.NotificationHelper
import com.example.organizationalert.core.preferences.UserPreferences
import com.example.organizationalert.domain.model.UserRole
import com.example.organizationalert.ui.components.AppBottomBar
import com.example.organizationalert.ui.components.AppNavRail
import com.example.organizationalert.ui.feature.alerts.AlertDetailsScreen
import com.example.organizationalert.ui.feature.alerts.AlertsListScreen
import com.example.organizationalert.ui.feature.alerts.AlertsViewModel
import com.example.organizationalert.ui.feature.alerts.CreateEditAlertScreen
import com.example.organizationalert.ui.feature.dashboard.DashboardScreen
import com.example.organizationalert.ui.feature.dashboard.DashboardViewModel
import com.example.organizationalert.ui.feature.groups.CreateEditGroupScreen
import com.example.organizationalert.ui.feature.groups.GroupDetailsScreen
import com.example.organizationalert.ui.feature.groups.GroupsListScreen
import com.example.organizationalert.ui.feature.groups.GroupsViewModel
import com.example.organizationalert.ui.feature.settings.SettingsScreen
import com.example.organizationalert.ui.feature.settings.SettingsViewModel
import com.example.organizationalert.ui.feature.setup.SetupScreen
import com.example.organizationalert.ui.feature.setup.SetupViewModel
import com.example.organizationalert.ui.feature.splash.SplashScreen
import com.example.organizationalert.ui.feature.splash.SplashViewModel
import com.example.organizationalert.ui.feature.users.CreateEditUserScreen
import com.example.organizationalert.ui.feature.users.UserDetailsScreen
import com.example.organizationalert.ui.feature.users.UsersListScreen
import com.example.organizationalert.ui.feature.users.UsersViewModel
import com.example.organizationalert.ui.theme.Slate900

@Composable
fun AppNavigation(
    navController: NavHostController,
    preferences: UserPreferences,
    initialAlertId: String? = null
) {
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry?.destination?.route

    val isConfigured = preferences.isConfigured()
    val isAdmin = preferences.getUserRole() == UserRole.ADMIN.name

    val isTopLevelScreen = currentRoute in listOf(
        Screen.Dashboard.route,
        Screen.AlertsList.route,
        Screen.GroupsList.route,
        Screen.UsersList.route,
        Screen.Settings.route
    )

    val configuration = LocalConfiguration.current
    val isTablet = configuration.screenWidthDp >= 600

    Scaffold(
        bottomBar = {
            if (isTopLevelScreen && !isTablet) {
                AppBottomBar(
                    currentRoute = currentRoute,
                    isAdmin = isAdmin,
                    onNavigate = { route ->
                        navController.navigate(route) {
                            popUpTo(Screen.Dashboard.route) { saveState = true }
                            launchSingleTop = true
                            restoreState = true
                        }
                    }
                )
            }
        },
        containerColor = Slate900
    ) { padding ->
        Row(modifier = Modifier.fillMaxSize()) {
            if (isTopLevelScreen && isTablet) {
                AppNavRail(
                    currentRoute = currentRoute,
                    isAdmin = isAdmin,
                    onNavigate = { route ->
                        navController.navigate(route) {
                            popUpTo(Screen.Dashboard.route) { saveState = true }
                            launchSingleTop = true
                            restoreState = true
                        }
                    }
                )
            }

            val startDestination = if (!initialAlertId.isNullOrBlank()) {
                Screen.AlertDetails.createRoute(initialAlertId)
            } else {
                Screen.Splash.route
            }

            NavHost(
                navController = navController,
                startDestination = startDestination,
                modifier = Modifier
                    .fillMaxSize()
                    .padding(if (isTopLevelScreen && !isTablet) padding else androidx.compose.foundation.layout.PaddingValues(0.dp))
            ) {
                // Splash
                composable(Screen.Splash.route) {
                    val viewModel: SplashViewModel = hiltViewModel()
                    SplashScreen(
                        viewModel = viewModel,
                        onNavigateToDashboard = {
                            navController.navigate(Screen.Dashboard.route) {
                                popUpTo(Screen.Splash.route) { inclusive = true }
                            }
                        },
                        onNavigateToSetup = {
                            navController.navigate(Screen.Setup.route) {
                                popUpTo(Screen.Splash.route) { inclusive = true }
                            }
                        }
                    )
                }

                // Setup
                composable(Screen.Setup.route) {
                    val viewModel: SetupViewModel = hiltViewModel()
                    SetupScreen(
                        viewModel = viewModel,
                        onConnected = {
                            navController.navigate(Screen.Dashboard.route) {
                                popUpTo(Screen.Setup.route) { inclusive = true }
                            }
                        }
                    )
                }

                // Dashboard
                composable(Screen.Dashboard.route) {
                    val viewModel: DashboardViewModel = hiltViewModel()
                    DashboardScreen(
                        viewModel = viewModel,
                        onNavigateToAlertDetails = { id -> navController.navigate(Screen.AlertDetails.createRoute(id)) },
                        onNavigateToCreateAlert = { navController.navigate(Screen.CreateEditAlert.createRoute()) },
                        onNavigateToAlertsList = { navController.navigate(Screen.AlertsList.route) },
                        onNavigateToGroupDetails = { id -> navController.navigate(Screen.GroupDetails.createRoute(id)) },
                        onNavigateToGroupsList = { navController.navigate(Screen.GroupsList.route) }
                    )
                }

                // Alerts List
                composable(Screen.AlertsList.route) {
                    val viewModel: AlertsViewModel = hiltViewModel()
                    AlertsListScreen(
                        viewModel = viewModel,
                        onNavigateToAlertDetails = { id -> navController.navigate(Screen.AlertDetails.createRoute(id)) },
                        onNavigateToCreateAlert = { navController.navigate(Screen.CreateEditAlert.createRoute()) }
                    )
                }

                // Alert Details
                composable(
                    route = Screen.AlertDetails.route,
                    arguments = listOf(navArgument("alertId") { type = NavType.StringType })
                ) { backStack ->
                    val alertId = backStack.arguments?.getString("alertId") ?: ""
                    val viewModel: AlertsViewModel = hiltViewModel()
                    AlertDetailsScreen(
                        alertId = alertId,
                        viewModel = viewModel,
                        onNavigateBack = { navController.popBackStack() },
                        onNavigateToEdit = { id -> navController.navigate(Screen.CreateEditAlert.createRoute(id)) }
                    )
                }

                // Create / Edit Alert
                composable(
                    route = Screen.CreateEditAlert.route,
                    arguments = listOf(navArgument("alertId") {
                        type = NavType.StringType
                        nullable = true
                        defaultValue = null
                    })
                ) { backStack ->
                    val alertId = backStack.arguments?.getString("alertId")
                    val viewModel: AlertsViewModel = hiltViewModel()
                    CreateEditAlertScreen(
                        alertId = alertId,
                        viewModel = viewModel,
                        onNavigateBack = { navController.popBackStack() }
                    )
                }

                // Groups List
                composable(Screen.GroupsList.route) {
                    val viewModel: GroupsViewModel = hiltViewModel()
                    GroupsListScreen(
                        viewModel = viewModel,
                        onNavigateToGroupDetails = { id -> navController.navigate(Screen.GroupDetails.createRoute(id)) },
                        onNavigateToCreateGroup = { navController.navigate(Screen.CreateEditGroup.createRoute()) }
                    )
                }

                // Group Details
                composable(
                    route = Screen.GroupDetails.route,
                    arguments = listOf(navArgument("groupId") { type = NavType.StringType })
                ) { backStack ->
                    val groupId = backStack.arguments?.getString("groupId") ?: ""
                    val viewModel: GroupsViewModel = hiltViewModel()
                    GroupDetailsScreen(
                        groupId = groupId,
                        viewModel = viewModel,
                        onNavigateBack = { navController.popBackStack() },
                        onNavigateToEdit = { id -> navController.navigate(Screen.CreateEditGroup.createRoute(id)) },
                        onNavigateToAlertDetails = { id -> navController.navigate(Screen.AlertDetails.createRoute(id)) },
                        onNavigateToUserDetails = { id -> navController.navigate(Screen.UserDetails.createRoute(id)) }
                    )
                }

                // Create / Edit Group
                composable(
                    route = Screen.CreateEditGroup.route,
                    arguments = listOf(navArgument("groupId") {
                        type = NavType.StringType
                        nullable = true
                        defaultValue = null
                    })
                ) { backStack ->
                    val groupId = backStack.arguments?.getString("groupId")
                    val viewModel: GroupsViewModel = hiltViewModel()
                    CreateEditGroupScreen(
                        groupId = groupId,
                        viewModel = viewModel,
                        onNavigateBack = { navController.popBackStack() }
                    )
                }

                // Users List
                composable(Screen.UsersList.route) {
                    val viewModel: UsersViewModel = hiltViewModel()
                    UsersListScreen(
                        viewModel = viewModel,
                        onNavigateToUserDetails = { id -> navController.navigate(Screen.UserDetails.createRoute(id)) },
                        onNavigateToCreateUser = { navController.navigate(Screen.CreateEditUser.createRoute()) }
                    )
                }

                // User Details
                composable(
                    route = Screen.UserDetails.route,
                    arguments = listOf(navArgument("userId") { type = NavType.StringType })
                ) { backStack ->
                    val userId = backStack.arguments?.getString("userId") ?: ""
                    val viewModel: UsersViewModel = hiltViewModel()
                    UserDetailsScreen(
                        userId = userId,
                        viewModel = viewModel,
                        onNavigateBack = { navController.popBackStack() },
                        onNavigateToEdit = { id -> navController.navigate(Screen.CreateEditUser.createRoute(id)) }
                    )
                }

                // Create / Edit User
                composable(
                    route = Screen.CreateEditUser.route,
                    arguments = listOf(navArgument("userId") {
                        type = NavType.StringType
                        nullable = true
                        defaultValue = null
                    })
                ) { backStack ->
                    val userId = backStack.arguments?.getString("userId")
                    val viewModel: UsersViewModel = hiltViewModel()
                    CreateEditUserScreen(
                        userId = userId,
                        viewModel = viewModel,
                        onNavigateBack = { navController.popBackStack() }
                    )
                }

                // Settings
                composable(Screen.Settings.route) {
                    val viewModel: SettingsViewModel = hiltViewModel()
                    SettingsScreen(
                        viewModel = viewModel,
                        onNavigateToSetup = {
                            navController.navigate(Screen.Setup.route) {
                                popUpTo(0) { inclusive = true }
                            }
                        },
                        onNavigateToDiagnostics = {
                            navController.navigate(Screen.Diagnostics.route)
                        }
                    )
                }

                // Diagnostics (Device & Background Status)
                composable(Screen.Diagnostics.route) {
                    val viewModel: com.example.organizationalert.ui.feature.diagnostics.DiagnosticsViewModel = hiltViewModel()
                    com.example.organizationalert.ui.feature.diagnostics.DiagnosticsScreen(
                        viewModel = viewModel,
                        onNavigateBack = { navController.popBackStack() }
                    )
                }
            }
        }
    }
}
