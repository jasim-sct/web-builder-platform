package com.example.organizationalert.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CalendarMonth
import androidx.compose.material.icons.filled.Dashboard
import androidx.compose.material.icons.filled.Group
import androidx.compose.material.icons.filled.History
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material.icons.filled.People
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material3.Icon
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.organizationalert.ui.navigation.Screen
import com.example.organizationalert.ui.neo.LocalNeoColors
import com.example.organizationalert.ui.neo.NeoShadows
import com.example.organizationalert.ui.neo.neoRaised

data class NavItem(
    val title: String,
    val route: String,
    val icon: ImageVector,
    val isAdminOnly: Boolean = false
)

val SIDEBAR_NAV_ITEMS = listOf(
    NavItem("Dashboard", Screen.Dashboard.route, Icons.Default.Dashboard),
    NavItem("Alerts", Screen.AlertsList.route, Icons.Default.Notifications),
    NavItem("Schedules", Screen.Schedule.route, Icons.Default.CalendarMonth),
    NavItem("Groups", Screen.GroupsList.route, Icons.Default.Group),
    NavItem("Customers", Screen.UsersList.route, Icons.Default.People, isAdminOnly = true),
    NavItem("History", Screen.History.route, Icons.Default.History),
    NavItem("Settings", Screen.Settings.route, Icons.Default.Settings)
)

val BOTTOM_NAV_ITEMS = listOf(
    NavItem("Home", Screen.Dashboard.route, Icons.Default.Dashboard),
    NavItem("Alerts", Screen.AlertsList.route, Icons.Default.Notifications),
    NavItem("Groups", Screen.GroupsList.route, Icons.Default.Group),
    NavItem("Settings", Screen.Settings.route, Icons.Default.Settings)
)

/** @deprecated Use SIDEBAR_NAV_ITEMS */
val NAV_ITEMS = SIDEBAR_NAV_ITEMS

@Composable
fun AppBottomBar(
    currentRoute: String?,
    isAdmin: Boolean,
    onNavigate: (String) -> Unit
) {
    val neo = LocalNeoColors.current
    val items = BOTTOM_NAV_ITEMS

    NavigationBar(
        containerColor = neo.background,
        tonalElevation = 0.dp,
        modifier = Modifier
            .neoRaised(cornerRadius = 0.dp, spec = NeoShadows.soft)
            .height(72.dp)
    ) {
        items.forEach { item ->
            val selected = currentRoute == item.route
            NavigationBarItem(
                selected = selected,
                onClick = { onNavigate(item.route) },
                icon = {
                    Icon(
                        item.icon,
                        contentDescription = item.title,
                        modifier = if (selected) {
                            Modifier
                                .clip(RoundedCornerShape(10.dp))
                                .background(neo.surfacePressed)
                                .padding(6.dp)
                                .size(22.dp)
                        } else {
                            Modifier.size(22.dp)
                        }
                    )
                },
                label = {
                    Text(
                        item.title,
                        fontSize = 11.sp,
                        fontWeight = if (selected) FontWeight.SemiBold else FontWeight.Normal
                    )
                },
                colors = NavigationBarItemDefaults.colors(
                    selectedIconColor = neo.primary,
                    selectedTextColor = neo.primary,
                    indicatorColor = androidx.compose.ui.graphics.Color.Transparent,
                    unselectedIconColor = neo.textMuted,
                    unselectedTextColor = neo.textMuted
                )
            )
        }
    }
}

@Composable
fun AppNavRail(
    currentRoute: String?,
    isAdmin: Boolean,
    onNavigate: (String) -> Unit
) {
    com.example.organizationalert.ui.neo.NeoSidebar(
        currentRoute = currentRoute,
        isAdmin = isAdmin,
        onNavigate = onNavigate
    )
}
