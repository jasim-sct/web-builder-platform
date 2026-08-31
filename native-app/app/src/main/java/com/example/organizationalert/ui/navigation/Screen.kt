package com.example.organizationalert.ui.navigation

sealed class Screen(val route: String) {
    object Splash : Screen("splash")
    object Setup : Screen("setup")
    object Dashboard : Screen("dashboard")
    object AlertsList : Screen("alerts")
    object AlertDetails : Screen("alerts/{alertId}") {
        fun createRoute(alertId: String) = "alerts/$alertId"
    }
    object CreateEditAlert : Screen("alerts_create_edit?alertId={alertId}") {
        fun createRoute(alertId: String? = null) = if (alertId != null) "alerts_create_edit?alertId=$alertId" else "alerts_create_edit"
    }
    object GroupsList : Screen("groups")
    object GroupDetails : Screen("groups/{groupId}") {
        fun createRoute(groupId: String) = "groups/$groupId"
    }
    object CreateEditGroup : Screen("groups_create_edit?groupId={groupId}") {
        fun createRoute(groupId: String? = null) = if (groupId != null) "groups_create_edit?groupId=$groupId" else "groups_create_edit"
    }
    object UsersList : Screen("users")
    object UserDetails : Screen("users/{userId}") {
        fun createRoute(userId: String) = "users/$userId"
    }
    object CreateEditUser : Screen("users_create_edit?userId={userId}") {
        fun createRoute(userId: String? = null) = if (userId != null) "users_create_edit?userId=$userId" else "users_create_edit"
    }
    object Settings : Screen("settings")
    object Diagnostics : Screen("diagnostics")
}

