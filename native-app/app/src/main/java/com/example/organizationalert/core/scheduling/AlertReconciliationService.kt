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
        now: Instant = ScheduleTimeCalculator.now()
    ): AlertReconciliationResult {
        Log.d(TAG, "[RECONCILE] Starting reconciliation. Local count=${currentLocalAlerts.size}, Server count=${incomingServerAlerts.size}")

        var scheduledCount = 0
        var cancelledCount = 0
        var unchangedCount = 0
        var skippedPastCount = 0

        val localAlertsMap = currentLocalAlerts.associateBy { it.id }
        val serverAlertsMap = incomingServerAlerts.associateBy { it.id }

        for (serverAlert in incomingServerAlerts) {
            val localAlert = localAlertsMap[serverAlert.id]
            val resolvedTrigger = ScheduleTimeCalculator.resolveNextTriggerInstant(serverAlert, now)
            val shouldBeScheduled = resolvedTrigger != null &&
                serverAlert.isEnabled &&
                serverAlert.status == AlertStatus.SCHEDULED

            if (shouldBeScheduled) {
                val alertToSchedule = serverAlert.copy(nextTriggerAt = resolvedTrigger)
                val localResolvedTrigger = localAlert?.let {
                    ScheduleTimeCalculator.resolveNextTriggerInstant(it, now)
                }

                val needsReschedule = localAlert == null ||
                        localResolvedTrigger != resolvedTrigger ||
                        localAlert.scheduledAt != serverAlert.scheduledAt ||
                        localAlert.status != serverAlert.status ||
                        localAlert.isEnabled != serverAlert.isEnabled ||
                        localAlert.version != serverAlert.version ||
                        localAlert.timezoneId != serverAlert.timezoneId ||
                        localAlert.recipientUserIds != serverAlert.recipientUserIds

                if (needsReschedule) {
                    scheduler.cancelAlert(serverAlert.id)
                    val scheduled = scheduler.scheduleAlert(alertToSchedule)
                    if (scheduled) scheduledCount++
                } else {
                    unchangedCount++
                }
            } else {
                if (localAlert != null && localAlert.isEnabled && localAlert.status == AlertStatus.SCHEDULED) {
                    scheduler.cancelAlert(serverAlert.id)
                    cancelledCount++
                }
                if (resolvedTrigger == null && serverAlert.status == AlertStatus.SCHEDULED) {
                    skippedPastCount++
                }
            }
        }

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
            "[RECONCILE] Finished: Scheduled=$scheduledCount, Cancelled=$cancelledCount, " +
                "Unchanged=$unchangedCount, SkippedPast=$skippedPastCount"
        )
        return result
    }

    companion object {
        private const val TAG = "AlertReconciliation"
    }
}
