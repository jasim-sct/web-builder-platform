package com.example.organizationalert.ui.feature.schedule

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.organizationalert.core.scheduling.TimezoneHelper
import com.example.organizationalert.data.repository.AlertRepository
import com.example.organizationalert.domain.model.Alert
import com.example.organizationalert.ui.components.AlertCard
import com.example.organizationalert.ui.neo.LocalNeoColors
import com.example.organizationalert.ui.neo.NeoEmptyState
import com.example.organizationalert.ui.neo.NeoFilterChip
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

enum class ScheduleView { DAY, WEEK, MONTH, AGENDA }

@HiltViewModel
class ScheduleViewModel @Inject constructor(
    alertRepository: AlertRepository
) : ViewModel() {
    val upcomingAlerts: StateFlow<List<Alert>> = alertRepository.allAlerts
        .map { alerts ->
            val now = Instant.now()
            alerts
                .filter { it.isEnabled && (it.nextTriggerAt ?: it.scheduledAt).isAfter(now.minusSeconds(3600)) }
                .sortedBy { it.nextTriggerAt ?: it.scheduledAt }
        }
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())
}

@Composable
fun ScheduleScreen(
    viewModel: ScheduleViewModel,
    onNavigateToAlertDetails: (String) -> Unit
) {
    val alerts by viewModel.upcomingAlerts.collectAsState()
    val neo = LocalNeoColors.current
    var selectedView by remember { mutableStateOf(ScheduleView.AGENDA) }

    NeoScreenBackground {
        Column(Modifier.fillMaxSize()) {
            LazyRow(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp, vertical = 12.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                items(ScheduleView.entries) { view ->
                    NeoFilterChip(
                        label = view.name.lowercase().replaceFirstChar { it.uppercase() },
                        selected = selectedView == view,
                        onClick = { selectedView = view }
                    )
                }
            }

            if (alerts.isEmpty()) {
                NeoEmptyState(
                    title = "No scheduled alerts",
                    message = "Upcoming alerts will appear on your schedule.",
                    modifier = Modifier.padding(20.dp)
                )
            } else {
                val zone = ZoneId.systemDefault()
                val grouped = alerts.groupBy { (it.nextTriggerAt ?: it.scheduledAt).atZone(zone).toLocalDate() }

                LazyColumn(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(horizontal = 20.dp),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    grouped.forEach { (date, dayAlerts) ->
                        item {
                            Text(
                                text = formatScheduleDate(date),
                                style = MaterialTheme.typography.titleSmall,
                                color = neo.textMuted,
                                fontWeight = FontWeight.SemiBold,
                                modifier = Modifier.padding(vertical = 8.dp)
                            )
                        }
                        items(dayAlerts, key = { it.id }) { alert ->
                            AlertCard(alert = alert, onClick = { onNavigateToAlertDetails(alert.id) })
                        }
                    }
                    item { Spacer(Modifier.height(72.dp)) }
                }
            }
        }
    }
}

private fun formatScheduleDate(date: LocalDate): String {
    val today = LocalDate.now()
    return when (date) {
        today -> "Today"
        today.plusDays(1) -> "Tomorrow"
        else -> date.toString()
    }
}
