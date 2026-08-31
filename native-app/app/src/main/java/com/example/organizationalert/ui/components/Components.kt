package com.example.organizationalert.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Alarm
import androidx.compose.material.icons.filled.ChevronRight
import androidx.compose.material.icons.filled.ErrorOutline
import androidx.compose.material.icons.filled.Group
import androidx.compose.material.icons.filled.NotificationsActive
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Repeat
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.organizationalert.core.scheduling.TimezoneHelper
import com.example.organizationalert.core.socket.SocketConnectionState
import com.example.organizationalert.domain.model.Alert
import com.example.organizationalert.domain.model.AlertStatus
import com.example.organizationalert.domain.model.Group
import com.example.organizationalert.domain.model.Priority
import com.example.organizationalert.domain.model.RepeatType
import com.example.organizationalert.domain.model.User
import com.example.organizationalert.domain.model.UserRole
import com.example.organizationalert.ui.theme.Amber500
import com.example.organizationalert.ui.theme.Blue400
import com.example.organizationalert.ui.theme.Blue500
import com.example.organizationalert.ui.theme.Green500
import com.example.organizationalert.ui.theme.Orange500
import com.example.organizationalert.ui.theme.Purple500
import com.example.organizationalert.ui.theme.Red500
import com.example.organizationalert.ui.theme.Slate400
import com.example.organizationalert.ui.theme.Slate600
import com.example.organizationalert.ui.theme.Slate700
import com.example.organizationalert.ui.neo.LocalNeoColors
import com.example.organizationalert.ui.neo.NeoCard
import com.example.organizationalert.ui.neo.NeoEmptyState
import com.example.organizationalert.ui.neo.neoInset
import com.example.organizationalert.ui.neo.neoRaised

@Composable
fun PriorityBadge(priority: Priority) {
    val (bgColor, textColor) = when (priority) {
        Priority.URGENT -> Red500.copy(alpha = 0.15f) to Red500
        Priority.HIGH -> Orange500.copy(alpha = 0.15f) to Orange500
        Priority.NORMAL -> Blue500.copy(alpha = 0.15f) to Blue400
        Priority.LOW -> Slate400.copy(alpha = 0.15f) to Slate400
    }

    Surface(
        color = bgColor,
        shape = RoundedCornerShape(6.dp)
    ) {
        Text(
            text = priority.name,
            color = textColor,
            fontSize = 11.sp,
            fontWeight = FontWeight.Bold,
            modifier = Modifier.padding(horizontal = 7.dp, vertical = 3.dp)
        )
    }
}

@Composable
fun StatusBadge(status: AlertStatus) {
    val (bgColor, textColor) = when (status) {
        AlertStatus.SCHEDULED -> Blue500.copy(alpha = 0.15f) to Blue400
        AlertStatus.TRIGGERED -> Green500.copy(alpha = 0.15f) to Green500
        AlertStatus.COMPLETED -> Green500.copy(alpha = 0.15f) to Green500
        AlertStatus.DISABLED -> Slate400.copy(alpha = 0.15f) to Slate400
        AlertStatus.CANCELLED -> Red500.copy(alpha = 0.15f) to Red500
        AlertStatus.MISSED -> Amber500.copy(alpha = 0.15f) to Amber500
    }

    Surface(
        color = bgColor,
        shape = RoundedCornerShape(6.dp)
    ) {
        Text(
            text = status.name,
            color = textColor,
            fontSize = 11.sp,
            fontWeight = FontWeight.Medium,
            modifier = Modifier.padding(horizontal = 7.dp, vertical = 3.dp)
        )
    }
}

@Composable
fun RepeatBadge(repeatType: RepeatType) {
    if (repeatType == RepeatType.ONCE) return

    Surface(
        color = Purple500.copy(alpha = 0.15f),
        shape = RoundedCornerShape(6.dp)
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
        ) {
            Icon(
                imageVector = Icons.Default.Repeat,
                contentDescription = null,
                tint = Purple500,
                modifier = Modifier.size(12.dp)
            )
            Spacer(modifier = Modifier.width(3.dp))
            Text(
                text = repeatType.name,
                color = Purple500,
                fontSize = 11.sp,
                fontWeight = FontWeight.SemiBold
            )
        }
    }
}

@Composable
fun ConnectionStatusBadge(state: SocketConnectionState) {
    val (dotColor, text) = when (state) {
        SocketConnectionState.CONNECTED -> Green500 to "Connected"
        SocketConnectionState.CONNECTING -> Amber500 to "Connecting..."
        SocketConnectionState.DISCONNECTED -> Slate400 to "Offline (Local Only)"
        SocketConnectionState.ERROR -> Red500 to "Connection Error"
    }

    Surface(
        color = LocalNeoColors.current.surfaceRaised,
        shape = RoundedCornerShape(16.dp)
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier.padding(horizontal = 10.dp, vertical = 5.dp)
        ) {
            Box(
                modifier = Modifier
                    .size(8.dp)
                    .clip(CircleShape)
                    .background(dotColor)
            )
            Spacer(modifier = Modifier.width(6.dp))
            Text(
                text = text,
                color = MaterialTheme.colorScheme.onSurface,
                fontSize = 12.sp,
                fontWeight = FontWeight.Medium
            )
        }
    }
}

@Composable
fun NextAlertCard(
    alert: Alert?,
    onClick: () -> Unit
) {
    val neo = LocalNeoColors.current
    NeoCard(modifier = Modifier.fillMaxWidth(), onClick = if (alert != null) onClick else null) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Default.NotificationsActive,
                        contentDescription = null,
                        tint = Blue400,
                        modifier = Modifier.size(20.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "NEXT SCHEDULED ALERT",
                        style = MaterialTheme.typography.labelSmall,
                        color = Blue400,
                        fontWeight = FontWeight.Bold
                    )
                }
                if (alert != null) {
                    PriorityBadge(priority = alert.priority)
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            if (alert != null) {
                Text(
                    text = alert.title,
                    style = MaterialTheme.typography.titleLarge,
                    color = MaterialTheme.colorScheme.onSurface,
                    fontWeight = FontWeight.Bold,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = alert.message,
                    style = MaterialTheme.typography.bodyMedium,
                    color = Slate400,
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis
                )
                Spacer(modifier = Modifier.height(14.dp))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Default.Alarm,
                            contentDescription = null,
                            tint = MaterialTheme.colorScheme.onSurface,
                            modifier = Modifier.size(16.dp)
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        val triggerTime = alert.nextTriggerAt ?: alert.scheduledAt
                        Text(
                            text = TimezoneHelper.formatUserFriendly(triggerTime),
                            style = MaterialTheme.typography.bodyMedium,
                            fontWeight = FontWeight.SemiBold,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                    }
                    RepeatBadge(repeatType = alert.repeatType)
                }
            } else {
                Text(
                    text = "No upcoming alerts scheduled",
                    style = MaterialTheme.typography.bodyLarge,
                    color = Slate400
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = "All scheduled reminders have been executed or none are active.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = Slate600
                )
            }
    }
}

@Composable
fun AlertCard(
    alert: Alert,
    onClick: () -> Unit
) {
    NeoCard(modifier = Modifier.fillMaxWidth(), onClick = onClick) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = alert.title,
                    style = MaterialTheme.typography.titleMedium,
                    color = MaterialTheme.colorScheme.onSurface,
                    fontWeight = FontWeight.SemiBold,
                    modifier = Modifier.weight(1f),
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
                PriorityBadge(priority = alert.priority)
            }

            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = alert.message,
                style = MaterialTheme.typography.bodyMedium,
                color = Slate400,
                maxLines = 2,
                overflow = TextOverflow.Ellipsis
            )

            Spacer(modifier = Modifier.height(10.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    StatusBadge(status = alert.status)
                    RepeatBadge(repeatType = alert.repeatType)
                }

                Text(
                    text = TimezoneHelper.formatTimeOnly(alert.nextTriggerAt ?: alert.scheduledAt),
                    style = MaterialTheme.typography.bodyMedium,
                    fontWeight = FontWeight.Bold,
                    color = Blue400
                )
            }
    }
}

@Composable
fun GroupCard(
    group: Group,
    onClick: () -> Unit
) {
    NeoCard(modifier = Modifier.fillMaxWidth(), onClick = onClick) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Surface(
                color = Blue500.copy(alpha = 0.15f),
                shape = CircleShape,
                modifier = Modifier.size(44.dp)
            ) {
                Box(contentAlignment = Alignment.Center) {
                    Icon(
                        imageVector = Icons.Default.Group,
                        contentDescription = null,
                        tint = Blue400,
                        modifier = Modifier.size(24.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.width(14.dp))

            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = group.name,
                    style = MaterialTheme.typography.titleMedium,
                    color = MaterialTheme.colorScheme.onSurface,
                    fontWeight = FontWeight.SemiBold
                )
                if (group.description.isNotBlank()) {
                    Text(
                        text = group.description,
                        style = MaterialTheme.typography.bodyMedium,
                        color = Slate400,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                }
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = "${group.memberIds.size} Members",
                    style = MaterialTheme.typography.labelSmall,
                    color = Blue400
                )
            }

            Icon(
                imageVector = Icons.Default.ChevronRight,
                contentDescription = null,
                tint = Slate600
            )
        }
    }
}

@Composable
fun UserCard(
    user: User,
    onClick: () -> Unit
) {
    NeoCard(modifier = Modifier.fillMaxWidth(), onClick = onClick) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Surface(
                color = if (user.role == UserRole.ADMIN) Purple500.copy(alpha = 0.15f) else Slate700,
                shape = CircleShape,
                modifier = Modifier.size(40.dp)
            ) {
                Box(contentAlignment = Alignment.Center) {
                    Icon(
                        imageVector = Icons.Default.Person,
                        contentDescription = null,
                        tint = if (user.role == UserRole.ADMIN) Purple500 else Slate400,
                        modifier = Modifier.size(20.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.width(12.dp))

            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = user.name,
                    style = MaterialTheme.typography.titleMedium,
                    color = MaterialTheme.colorScheme.onSurface,
                    fontWeight = FontWeight.SemiBold
                )
                Text(
                    text = user.email,
                    style = MaterialTheme.typography.bodyMedium,
                    color = Slate400
                )
            }

            Surface(
                color = if (user.role == UserRole.ADMIN) Purple500.copy(alpha = 0.15f) else Slate700,
                shape = RoundedCornerShape(6.dp)
            ) {
                Text(
                    text = user.role.name,
                    color = if (user.role == UserRole.ADMIN) Purple500 else Slate400,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.padding(horizontal = 6.dp, vertical = 3.dp)
                )
            }
        }
    }
}

@Composable
fun EmptyStateView(
    title: String,
    subtitle: String,
    modifier: Modifier = Modifier,
    actionLabel: String? = null,
    onAction: (() -> Unit)? = null
) {
    NeoEmptyState(
        title = title,
        message = subtitle,
        actionLabel = actionLabel,
        onAction = onAction,
        modifier = modifier.padding(vertical = 8.dp)
    )
}

@Composable
fun LoadingView(message: String = "Loading...") {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .padding(32.dp),
        contentAlignment = Alignment.Center
    ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            CircularProgressIndicator(
                color = Blue500,
                modifier = Modifier.size(36.dp)
            )
            Spacer(modifier = Modifier.height(12.dp))
            Text(
                text = message,
                style = MaterialTheme.typography.bodyMedium,
                color = Slate400
            )
        }
    }
}

@Composable
fun ErrorBanner(
    message: String,
    onRetry: (() -> Unit)? = null
) {
    Surface(
        color = Red500.copy(alpha = 0.12f),
        shape = RoundedCornerShape(10.dp),
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 8.dp)
    ) {
        Row(
            modifier = Modifier.padding(12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                imageVector = Icons.Default.ErrorOutline,
                contentDescription = null,
                tint = Red500,
                modifier = Modifier.size(20.dp)
            )
            Spacer(modifier = Modifier.width(10.dp))
            Text(
                text = message,
                style = MaterialTheme.typography.bodyMedium,
                color = Red500,
                modifier = Modifier.weight(1f)
            )
            if (onRetry != null) {
                Button(
                    onClick = onRetry,
                    colors = ButtonDefaults.buttonColors(containerColor = Red500),
                    shape = RoundedCornerShape(6.dp),
                    modifier = Modifier.padding(start = 8.dp)
                ) {
                    Text("Retry", fontSize = 12.sp)
                }
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
        Text(text = label, style = MaterialTheme.typography.bodyMedium, color = LocalNeoColors.current.textMuted)
        Text(
            text = value,
            style = MaterialTheme.typography.bodyMedium,
            color = LocalNeoColors.current.textPrimary,
            fontWeight = FontWeight.SemiBold
        )
    }
}
