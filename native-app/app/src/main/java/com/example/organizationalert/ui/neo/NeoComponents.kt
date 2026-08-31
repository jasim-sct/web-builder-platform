package com.example.organizationalert.ui.neo

import androidx.compose.animation.core.animateDpAsState
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.collectIsPressedAsState
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.RowScope
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.ChevronRight
import androidx.compose.material.icons.filled.Menu
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.outlined.TrendingUp
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.DrawerValue
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalNavigationDrawer
import androidx.compose.material3.Text
import androidx.compose.material3.rememberDrawerState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.role
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.organizationalert.ui.components.NAV_ITEMS
import com.example.organizationalert.ui.navigation.Screen
import kotlinx.coroutines.launch

@Composable
fun NeoThemeProvider(
    darkTheme: Boolean = false,
    content: @Composable () -> Unit
) {
    val scheme = if (darkTheme) NeoColorScheme.dark() else NeoColorScheme.light()
    CompositionLocalProvider(LocalNeoColors provides scheme, content = content)
}

@Composable
fun NeoScreenBackground(modifier: Modifier = Modifier, content: @Composable () -> Unit) {
    val neo = LocalNeoColors.current
    Box(modifier = modifier.fillMaxSize().background(neo.background)) {
        content()
    }
}

@Composable
fun NeoMetricTile(
    title: String,
    value: String,
    subtitle: String? = null,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    accentColor: Color = LocalNeoColors.current.primary
) {
    val interaction = remember { MutableInteractionSource() }
    val pressed by interaction.collectIsPressedAsState()
    val elevation by animateDpAsState(if (pressed) 2.dp else 6.dp, label = "tileElev")

    Box(
        modifier = modifier
            .neoRaised(
                cornerRadius = 18.dp,
                spec = if (pressed) NeoShadows.inset else NeoShadows.medium
            )
            .clickable(interactionSource = interaction, indication = null, onClick = onClick)
            .semantics { role = Role.Button; contentDescription = "$title, $value" }
            .padding(18.dp)
    ) {
        Column {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = title,
                    style = MaterialTheme.typography.labelSmall,
                    color = LocalNeoColors.current.textMuted,
                    fontWeight = FontWeight.SemiBold
                )
                Icon(
                    Icons.Default.ChevronRight,
                    contentDescription = null,
                    tint = accentColor.copy(alpha = 0.7f),
                    modifier = Modifier.size(18.dp)
                )
            }
            Spacer(Modifier.height(10.dp))
            Text(
                text = value,
                fontSize = 32.sp,
                fontWeight = FontWeight.Bold,
                color = LocalNeoColors.current.textPrimary
            )
            if (!subtitle.isNullOrBlank()) {
                Spacer(Modifier.height(6.dp))
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        Icons.Outlined.TrendingUp,
                        contentDescription = null,
                        tint = LocalNeoColors.current.success,
                        modifier = Modifier.size(14.dp)
                    )
                    Spacer(Modifier.width(4.dp))
                    Text(
                        text = subtitle,
                        style = MaterialTheme.typography.bodySmall,
                        color = LocalNeoColors.current.textSecondary
                    )
                }
            }
        }
    }
}

@Composable
fun NeoPrimaryButton(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    enabled: Boolean = true,
    leadingIcon: ImageVector? = null
) {
    val neo = LocalNeoColors.current
    val interaction = remember { MutableInteractionSource() }
    val pressed by interaction.collectIsPressedAsState()

    Box(
        modifier = modifier
            .then(
                if (enabled) {
                    Modifier.neoRaised(
                        cornerRadius = 14.dp,
                        spec = if (pressed) NeoShadows.inset else NeoShadows.soft,
                        fillColor = if (pressed) neo.primaryActive else neo.primary
                    )
                } else {
                    Modifier
                        .clip(RoundedCornerShape(14.dp))
                        .background(neo.surfacePressed.copy(alpha = 0.6f))
                }
            )
            .clickable(
                enabled = enabled,
                interactionSource = interaction,
                indication = null,
                onClick = onClick
            )
            .semantics { role = Role.Button }
            .padding(horizontal = 20.dp, vertical = 14.dp),
        contentAlignment = Alignment.Center
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            if (leadingIcon != null) {
                Icon(leadingIcon, contentDescription = null, tint = Color.White, modifier = Modifier.size(18.dp))
                Spacer(Modifier.width(8.dp))
            }
            Text(
                text = text,
                color = if (enabled) Color.White else neo.textMuted,
                fontWeight = FontWeight.SemiBold,
                fontSize = 15.sp
            )
        }
    }
}

@Composable
fun NeoSecondaryButton(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    val interaction = remember { MutableInteractionSource() }
    val pressed by interaction.collectIsPressedAsState()
    Box(
        modifier = modifier
            .neoRaised(
                cornerRadius = 14.dp,
                spec = if (pressed) NeoShadows.inset else NeoShadows.soft
            )
            .clickable(interactionSource = interaction, indication = null, onClick = onClick)
            .padding(horizontal = 18.dp, vertical = 12.dp),
        contentAlignment = Alignment.Center
    ) {
        Text(
            text = text,
            color = LocalNeoColors.current.textPrimary,
            fontWeight = FontWeight.Medium
        )
    }
}

@Composable
fun NeoSearchField(
    value: String,
    onValueChange: (String) -> Unit,
    placeholder: String,
    modifier: Modifier = Modifier
) {
    androidx.compose.material3.TextField(
        value = value,
        onValueChange = onValueChange,
        placeholder = {
            Text(placeholder, color = LocalNeoColors.current.textMuted)
        },
        leadingIcon = {
            Icon(Icons.Default.Search, contentDescription = "Search", tint = LocalNeoColors.current.textMuted)
        },
        singleLine = true,
        modifier = modifier
            .fillMaxWidth()
            .neoInset(cornerRadius = 14.dp),
        colors = androidx.compose.material3.TextFieldDefaults.colors(
            focusedContainerColor = Color.Transparent,
            unfocusedContainerColor = Color.Transparent,
            disabledContainerColor = Color.Transparent,
            focusedIndicatorColor = Color.Transparent,
            unfocusedIndicatorColor = Color.Transparent,
            cursorColor = LocalNeoColors.current.primary,
            focusedTextColor = LocalNeoColors.current.textPrimary,
            unfocusedTextColor = LocalNeoColors.current.textPrimary
        )
    )
}

@Composable
fun NeoCard(
    onClick: (() -> Unit)? = null,
    modifier: Modifier = Modifier,
    content: @Composable ColumnScope.() -> Unit
) {
    val interaction = remember { MutableInteractionSource() }
    val pressed by interaction.collectIsPressedAsState()
    val clickMod = if (onClick != null) {
        Modifier.clickable(interactionSource = interaction, indication = null, onClick = onClick)
    } else Modifier

    Column(
        modifier = modifier
            .neoRaised(
                cornerRadius = 16.dp,
                spec = if (pressed && onClick != null) NeoShadows.inset else NeoShadows.soft
            )
            .then(clickMod)
            .padding(16.dp),
        content = content
    )
}

@Composable
fun NeoEmptyState(
    title: String,
    message: String,
    actionLabel: String? = null,
    onAction: (() -> Unit)? = null,
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier
            .fillMaxWidth()
            .neoRaised(cornerRadius = 20.dp)
            .padding(28.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(title, style = MaterialTheme.typography.titleLarge, color = LocalNeoColors.current.textPrimary)
        Spacer(Modifier.height(8.dp))
        Text(
            message,
            style = MaterialTheme.typography.bodyMedium,
            color = LocalNeoColors.current.textSecondary,
            modifier = Modifier.padding(horizontal = 8.dp)
        )
        if (actionLabel != null && onAction != null) {
            Spacer(Modifier.height(20.dp))
            NeoPrimaryButton(text = actionLabel, onClick = onAction)
        }
    }
}

@Composable
fun NeoPageHeader(
    title: String,
    subtitle: String? = null,
    onBack: (() -> Unit)? = null,
    actions: @Composable RowScope.() -> Unit = {}
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 20.dp, vertical = 12.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        if (onBack != null) {
            IconButton(onClick = onBack) {
                Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back", tint = LocalNeoColors.current.textSecondary)
            }
            Spacer(Modifier.width(4.dp))
        }
        Column(modifier = Modifier.weight(1f)) {
            Text(title, style = MaterialTheme.typography.headlineMedium, color = LocalNeoColors.current.textPrimary, fontWeight = FontWeight.Bold)
            if (!subtitle.isNullOrBlank()) {
                Text(subtitle, style = MaterialTheme.typography.bodySmall, color = LocalNeoColors.current.textMuted)
            }
        }
        actions()
    }
}

@Composable
fun NeoTopBar(
    title: String,
    organizationName: String?,
    onMenuClick: (() -> Unit)?,
    onNotificationsClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Row(
        modifier = modifier
            .fillMaxWidth()
            .neoRaised(cornerRadius = 0.dp, spec = NeoShadows.soft)
            .padding(horizontal = 12.dp, vertical = 10.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        if (onMenuClick != null) {
            IconButton(onClick = onMenuClick) {
                Icon(Icons.Default.Menu, contentDescription = "Menu", tint = LocalNeoColors.current.textSecondary)
            }
        }
        Column(modifier = Modifier.weight(1f)) {
            Text(title, fontWeight = FontWeight.Bold, color = LocalNeoColors.current.textPrimary, fontSize = 18.sp)
            if (!organizationName.isNullOrBlank()) {
                Text(organizationName, fontSize = 12.sp, color = LocalNeoColors.current.textMuted, maxLines = 1, overflow = TextOverflow.Ellipsis)
            }
        }
        IconButton(onClick = onNotificationsClick) {
            Icon(Icons.Default.Notifications, contentDescription = "Notifications", tint = LocalNeoColors.current.textSecondary)
        }
    }
}

@Composable
fun NeoSidebar(
    currentRoute: String?,
    isAdmin: Boolean,
    onNavigate: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    val neo = LocalNeoColors.current
    val items = NAV_ITEMS.filter { !it.isAdminOnly || isAdmin }

    Column(
        modifier = modifier
            .width(220.dp)
            .fillMaxSize()
            .background(neo.background)
            .padding(16.dp)
    ) {
        Text("OrgAlert", fontWeight = FontWeight.Bold, fontSize = 20.sp, color = neo.primary)
        Text("Enterprise", fontSize = 12.sp, color = neo.textMuted)
        Spacer(Modifier.height(24.dp))
        items.forEach { item ->
            val selected = currentRoute == item.route
            val label = when (item.route) {
                Screen.UsersList.route -> "Customers"
                else -> item.title
            }
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .then(
                        if (selected) Modifier.neoInset(cornerRadius = 12.dp)
                        else Modifier.clip(RoundedCornerShape(12.dp))
                    )
                    .clickable { onNavigate(item.route) }
                    .padding(horizontal = 14.dp, vertical = 12.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                if (selected) {
                    Box(
                        Modifier
                            .size(4.dp, 20.dp)
                            .background(neo.accentIndicator, RoundedCornerShape(2.dp))
                    )
                    Spacer(Modifier.width(10.dp))
                }
                Icon(
                    item.icon,
                    contentDescription = null,
                    tint = if (selected) neo.primary else neo.textMuted,
                    modifier = Modifier.size(20.dp)
                )
                Spacer(Modifier.width(12.dp))
                Text(
                    label,
                    color = if (selected) neo.textPrimary else neo.textSecondary,
                    fontWeight = if (selected) FontWeight.SemiBold else FontWeight.Normal
                )
            }
            Spacer(Modifier.height(4.dp))
        }
    }
}

@Composable
fun NeoAppShell(
    currentRoute: String?,
    isAdmin: Boolean,
    isTablet: Boolean,
    organizationName: String?,
    title: String,
    onNavigate: (String) -> Unit,
    onNotificationsClick: () -> Unit = {},
    bottomBar: @Composable () -> Unit = {},
    content: @Composable (PaddingValues) -> Unit
) {
    val drawerState = rememberDrawerState(DrawerValue.Closed)
    val scope = rememberCoroutineScope()

    ModalNavigationDrawer(
        drawerState = drawerState,
        gesturesEnabled = !isTablet,
        drawerContent = {
            NeoSidebar(currentRoute, isAdmin, onNavigate, Modifier.fillMaxSize())
        }
    ) {
        NeoScreenBackground {
            Column(Modifier.fillMaxSize()) {
                if (!isTablet) {
                    NeoTopBar(
                        title = title,
                        organizationName = organizationName,
                        onMenuClick = { scope.launch { drawerState.open() } },
                        onNotificationsClick = onNotificationsClick
                    )
                }
                Row(Modifier.weight(1f)) {
                    if (isTablet) {
                        NeoSidebar(currentRoute, isAdmin, onNavigate)
                    }
                    Box(Modifier.weight(1f)) {
                        content(PaddingValues(0.dp))
                    }
                }
                bottomBar()
            }
        }
    }
}

@Composable
fun NeoSkeletonBlock(
    height: androidx.compose.ui.unit.Dp,
    modifier: Modifier = Modifier
) {
    Box(
        modifier = modifier
            .fillMaxWidth()
            .height(height)
            .neoInset(cornerRadius = 12.dp)
    )
}

@Composable
fun NeoLoadingColumn(itemCount: Int = 4) {
    LazyColumn(
        modifier = Modifier.fillMaxSize().padding(20.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        items(itemCount) {
            NeoSkeletonBlock(height = 72.dp)
        }
    }
}
