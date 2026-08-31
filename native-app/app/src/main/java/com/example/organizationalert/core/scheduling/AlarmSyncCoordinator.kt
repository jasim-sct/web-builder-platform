package com.example.organizationalert.core.scheduling

import android.util.Log
import com.example.organizationalert.core.database.AppDatabase
import com.example.organizationalert.domain.model.Alert

/**
 * Single entry point for post-sync local alarm reconciliation (alerts + events).
 */
class AlarmSyncCoordinator(
    private val alertReconciliationService: AlertReconciliationService,
    private val alertScheduler: AlertScheduler,
    private val eventAlarmScheduler: EventAlarmScheduler
) {

    data class ReconcileResult(
        val alertScheduled: Int,
        val alertCancelled: Int,
        val eventScheduled: Int,
        val eventCancelled: Int
    )

    suspend fun reconcileAfterSync(
        database: AppDatabase,
        existingLocalAlerts: List<Alert>,
        incomingServerAlerts: List<Alert>,
        cancelledEventIds: List<String> = emptyList()
    ): ReconcileResult {
        val alertResult = alertReconciliationService.reconcile(
            currentLocalAlerts = existingLocalAlerts,
            incomingServerAlerts = incomingServerAlerts
        )

        var eventCancelled = 0
        cancelledEventIds.forEach { eventId ->
            if (eventAlarmScheduler.cancelEvent(eventId)) {
                eventCancelled++
            }
        }

        val eventResult = eventAlarmScheduler.reconcileScheduledEvents(database)

        Log.d(
            TAG,
            "[RECONCILE_ALL] alerts scheduled=${alertResult.scheduledCount} cancelled=${alertResult.cancelledCount}; " +
                "events scheduled=${eventResult.scheduledCount} cancelled=${eventResult.cancelledCount + eventCancelled}"
        )

        return ReconcileResult(
            alertScheduled = alertResult.scheduledCount,
            alertCancelled = alertResult.cancelledCount,
            eventScheduled = eventResult.scheduledCount,
            eventCancelled = eventResult.cancelledCount + eventCancelled
        )
    }

    companion object {
        private const val TAG = "AlarmSyncCoordinator"

        @Volatile
        private var INSTANCE: AlarmSyncCoordinator? = null

        fun getInstance(
            alertReconciliationService: AlertReconciliationService,
            alertScheduler: AlertScheduler,
            eventAlarmScheduler: EventAlarmScheduler
        ): AlarmSyncCoordinator {
            return INSTANCE ?: synchronized(this) {
                INSTANCE ?: AlarmSyncCoordinator(
                    alertReconciliationService,
                    alertScheduler,
                    eventAlarmScheduler
                ).also { INSTANCE = it }
            }
        }
    }
}
