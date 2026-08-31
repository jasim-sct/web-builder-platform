package com.example.organizationalert.ui.feature.history

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
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.organizationalert.core.database.AppDatabase
import com.example.organizationalert.core.database.entity.EventEntity
import com.example.organizationalert.core.database.entity.EventStatus
import com.example.organizationalert.core.scheduling.TimezoneHelper
import com.example.organizationalert.ui.neo.LocalNeoColors
import com.example.organizationalert.ui.neo.NeoCard
import com.example.organizationalert.ui.neo.NeoEmptyState
import com.example.organizationalert.ui.neo.NeoScreenBackground
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.stateIn
import java.time.Instant
import java.time.LocalDate
import java.time.ZoneId
import javax.inject.Inject

data class HistoryItem(
    val event: EventEntity,
    val actionLabel: String,
    val timestamp: Instant
)

@HiltViewModel
class HistoryViewModel @Inject constructor(
    database: AppDatabase
) : ViewModel() {
    val items: StateFlow<List<HistoryItem>> = database.eventDao().getAllEvents()
        .map { events ->
            events.mapNotNull { event ->
                val (label, time) = historyLabelAndTime(event) ?: return@mapNotNull null
                HistoryItem(event, label, time)
            }.sortedByDescending { it.timestamp }
        }
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())
}

private fun historyLabelAndTime(event: EventEntity): Pair<String, Instant>? {
    return when (event.status) {
        EventStatus.TRIGGERED, EventStatus.RINGING -> "Alert triggered" to (event.triggeredAt ?: event.scheduledAt)
        EventStatus.RECEIVED -> "Alert acknowledged" to (event.receivedAt ?: event.triggeredAt ?: event.scheduledAt)
        EventStatus.DISMISSED -> "Alert dismissed" to (event.dismissedAt ?: event.receivedAt ?: event.scheduledAt)
        EventStatus.CANCELLED -> "Alert cancelled" to event.scheduledAt
        EventStatus.EXPIRED, EventStatus.MISSED -> "Alert missed" to (event.triggeredAt ?: event.scheduledAt)
        EventStatus.PRESENTED -> "Alert presented" to (event.presentedAt ?: event.displayedAt ?: event.scheduledAt)
        else -> null
    }
}

@Composable
fun HistoryScreen(
    viewModel: HistoryViewModel,
    onNavigateToAlert: (String) -> Unit
) {
    val items by viewModel.items.collectAsState()
    val neo = LocalNeoColors.current
    val zone = ZoneId.systemDefault()
    val today = LocalDate.now(zone)

    val grouped = items.groupBy { it.timestamp.atZone(zone).toLocalDate() }

    NeoScreenBackground {
        if (items.isEmpty()) {
            NeoEmptyState(
                title = "No history yet",
                message = "Activity from triggered and acknowledged alerts will appear here.",
                modifier = Modifier.padding(20.dp)
            )
        } else {
            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(horizontal = 20.dp, vertical = 12.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                grouped.forEach { (date, dayItems) ->
                    item(key = "header-$date") {
                        val header = when {
                            date == today -> "Today"
                            date == today.minusDays(1) -> "Yesterday"
                            else -> date.toString()
                        }
                        Text(
                            text = header,
                            style = MaterialTheme.typography.titleSmall,
                            color = neo.textMuted,
                            fontWeight = FontWeight.SemiBold,
                            modifier = Modifier.padding(vertical = 8.dp)
                        )
                    }
                    items(dayItems, key = { "${it.event.eventId}-${it.actionLabel}" }) { item ->
                        NeoCard(onClick = { onNavigateToAlert(item.event.eventId) }) {
                            Row(verticalAlignment = Alignment.Top) {
                                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                    Text(
                                        text = TimezoneHelper.formatTimeOnly(item.timestamp),
                                        style = MaterialTheme.typography.labelSmall,
                                        color = neo.textMuted
                                    )
                                    Spacer(Modifier.height(6.dp))
                                    Box(
                                        Modifier
                                            .size(8.dp)
                                            .clip(CircleShape)
                                            .background(neo.primary.copy(alpha = 0.85f))
                                    )
                                }
                                Spacer(Modifier.width(12.dp))
                                Column(Modifier.weight(1f)) {
                                    Text(
                                        text = item.actionLabel,
                                        style = MaterialTheme.typography.bodyMedium,
                                        color = neo.textPrimary,
                                        fontWeight = FontWeight.SemiBold
                                    )
                                    Text(
                                        text = item.event.title,
                                        style = MaterialTheme.typography.bodySmall,
                                        color = neo.textSecondary
                                    )
                                }
                            }
                        }
                    }
                }
                item { Spacer(Modifier.height(72.dp)) }
            }
        }
    }
}
