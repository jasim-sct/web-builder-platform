package com.example.organizationalert.core.scheduling

import android.util.Log
import com.example.organizationalert.domain.model.Alert
import com.example.organizationalert.domain.model.AlertStatus
import java.time.Instant

data class AlertReconciliationResult(
    val scheduledCount: Int,
    val cancelledCount: Int,
    val unchangedCount: Int,
    val skippedPastCount: Int
)

class AlertReconciliationService(
    private val scheduler: AlertScheduler
) {

    /**
     * Reconciles current local alerts against incoming server alerts.
     * Idempotent: Running multiple times results in the exact same alarm state.
     */
    fun reconcile(
        currentLocalAlerts: List<Alert>,
        incomingServerAlerts: List<Alert>,
        now: Instant = Instant.now()
    ): AlertReconciliationResult {
        Log.d(TAG, "[RECONCILE] Starting reconciliation. Local count=${currentLocalAlerts.size}, Server count=${incomingServerAlerts.size}")

        var scheduledCount = 0
        var cancelledCount = 0
        var unchangedCount = 0
        var skippedPastCount = 0

        val localAlertsMap = currentLocalAlerts.associateBy { it.id }
        val serverAlertsMap = incomingServerAlerts.associateBy { it.id }

        // 1. Process server alerts
        for (serverAlert in incomingServerAlerts) {
            val localAlert = localAlertsMap[serverAlert.id]

            val isFuture = (serverAlert.nextTriggerAt ?: serverAlert.scheduledAt).isAfter(now)
            val shouldBeScheduled = serverAlert.isEnabled &&
                    serverAlert.status == AlertStatus.SCHEDULED &&
                    isFuture

            if (shouldBeScheduled) {
                // Check if already correctly scheduled locally with same trigger time
                val needsReschedule = localAlert == null ||
                        localAlert.nextTriggerAt != serverAlert.nextTriggerAt ||
                        localAlert.scheduledAt != serverAlert.scheduledAt ||
                        localAlert.status != serverAlert.status ||
                        localAlert.isEnabled != serverAlert.isEnabled ||
                        localAlert.version != serverAlert.version

                if (needsReschedule) {
                    // Cancel previous alarm to avoid duplicate and schedule current
                    scheduler.cancelAlert(serverAlert.id)
                    val scheduled = scheduler.scheduleAlert(serverAlert)
                    if (scheduled) scheduledCount++
                } else {
                    unchangedCount++
                }
            } else {
                // Should not be scheduled: cancel any existing local alarm
                if (localAlert != null && (localAlert.status == AlertStatus.SCHEDULED && localAlert.isEnabled)) {
                    scheduler.cancelAlert(serverAlert.id)
                    cancelledCount++
                }
                if (!isFuture && serverAlert.status == AlertStatus.SCHEDULED) {
                    skippedPastCount++
                }
            }
        }

        // 2. Identify local alerts deleted from server entirely
        for (localAlert in currentLocalAlerts) {
            if (!serverAlertsMap.containsKey(localAlert.id)) {
                scheduler.cancelAlert(localAlert.id)
                cancelledCount++
            }
        }

        val result = AlertReconciliationResult(
            scheduledCount = scheduledCount,
            cancelledCount = cancelledCount,
            unchangedCount = unchangedCount,
            skippedPastCount = skippedPastCount
        )

        Log.d(
            TAG,
            "[RECONCILE] Reconciliation finished: Scheduled=$scheduledCount, Cancelled=$cancelledCount, Unchanged=$unchangedCount, SkippedPast=$skippedPastCount"
        )
        return result
    }

    companion object {
        private const val TAG = "AlertReconciliation"
    }
}
