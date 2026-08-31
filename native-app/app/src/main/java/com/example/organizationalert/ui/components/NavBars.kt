package com.example.organizationalert.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.RowScope
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
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
import com.example.organizationalert.ui.neo.neoInset
import com.example.organizationalert.ui.neo.neoRaised

data class NavItem(
    val title: String,
    val route: String,
    val icon: ImageVector,
    val isAdminOnly: Boolean = false
)

val NAV_ITEMS = listOf(
    NavItem("Dashboard", Screen.Dashboard.route, androidx.compose.material.icons.Icons.Default.Dashboard),
    NavItem("Alerts", Screen.AlertsList.route, androidx.compose.material.icons.Icons.Default.Notifications),
    NavItem("Groups", Screen.GroupsList.route, androidx.compose.material.icons.Icons.Default.Group),
    NavItem("Customers", Screen.UsersList.route, androidx.compose.material.icons.Icons.Default.People, isAdminOnly = true),
    NavItem("Settings", Screen.Settings.route, androidx.compose.material.icons.Icons.Default.Settings)
)

@Composable
fun AppBottomBar(
    currentRoute: String?,
    isAdmin: Boolean,
    onNavigate: (String) -> Unit
) {
    val neo = LocalNeoColors.current
    val items = NAV_ITEMS.filter { !it.isAdminOnly || isAdmin }

    NavigationBar(
        containerColor = neo.background,
        tonalElevation = 0.dp,
        modifier = Modifier
            .neoRaised(cornerRadius = 0.dp, spec = com.example.organizationalert.ui.neo.NeoShadows.soft)
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
                        modifier = if (selected) Modifier
                            .clip(RoundedCornerShape(10.dp))
                            .background(neo.surfacePressed)
                            .padding(6.dp)
                            .size(22.dp) else Modifier.size(22.dp)
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
