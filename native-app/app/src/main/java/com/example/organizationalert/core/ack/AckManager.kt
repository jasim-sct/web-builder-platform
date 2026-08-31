package com.example.organizationalert.core.ack

import android.content.Context
import android.util.Log
import androidx.core.app.NotificationManagerCompat
import androidx.room.withTransaction
import androidx.work.BackoffPolicy
import androidx.work.Constraints
import androidx.work.CoroutineWorker
import androidx.work.ExistingWorkPolicy
import androidx.work.NetworkType
import androidx.work.OneTimeWorkRequestBuilder
import androidx.work.WorkManager
import androidx.work.WorkerParameters
import com.example.organizationalert.core.alarm.AlarmEngine
import com.example.organizationalert.core.alarm.AlarmStopReason
import com.example.organizationalert.core.database.AppDatabase
import com.example.organizationalert.core.database.entity.AckQueueEntity
import com.example.organizationalert.core.database.entity.AckStatus
import com.example.organizationalert.core.database.entity.EventStatus
import com.example.organizationalert.core.database.entity.QueueStatus
import com.example.organizationalert.core.network.ApiClient
import com.example.organizationalert.core.network.dto.AcknowledgeRequest
import com.example.organizationalert.core.network.dto.ReceiveEventRequest
import com.example.organizationalert.core.preferences.UserPreferences
import com.example.organizationalert.core.socket.SocketManager
import com.example.organizationalert.core.scheduling.TimezoneHelper
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.time.Instant
import java.time.temporal.ChronoUnit
import java.util.concurrent.TimeUnit

class AckManager(
    private val context: Context,
    private val database: AppDatabase,
    private val preferences: UserPreferences,
    private val socketManager: SocketManager? = null
) {

    /**
     * Marks an event as RECEIVED immediately in local Room database,
     * enqueues ACK in the persistent AckQueue, and schedules WorkManager to flush it.
     * Idempotent: repeated calls for the same event do not create duplicate queue rows.
     */
    suspend fun markReceived(eventId: String): Boolean = withContext(Dispatchers.IO) {
        val now = Instant.now()
        val userId = preferences.getUserId()
        val deviceId = preferences.getOrCreateDeviceId()

        Log.d(TAG, "[USER_RECEIVE] User tapped RECEIVE for eventId=$eventId at $now")

        try {
            NotificationManagerCompat.from(context).cancel(eventId.hashCode())
            AlarmEngine.getInstance(context, database, preferences)
                .stop(eventId, AlarmStopReason.ACKNOWLEDGED)

            database.withTransaction {
                val existing = database.eventDao().getEventByEventIdDirect(eventId)
                if (existing == null) {
                    Log.w(TAG, "[ACK_FAILED] Event not found locally: $eventId")
                    return@withTransaction
                }

                if (existing.status == EventStatus.RECEIVED) {
                    Log.d(TAG, "[USER_RECEIVE] Event already RECEIVED (idempotent): $eventId")
                    return@withTransaction
                }

                database.eventDao().markReceivedIfNotAlready(
                    eventId = eventId,
                    status = EventStatus.RECEIVED,
                    ackStatus = AckStatus.PENDING,
                    receivedAt = now
                )

                val existingAck = database.ackQueueDao().getAckByEventId(eventId)
                if (existingAck == null) {
                    val ackEntry = AckQueueEntity(
                        eventId = eventId,
                        action = "RECEIVE",
                        userId = userId,
                        deviceId = deviceId,
                        receivedAt = now,
                        status = QueueStatus.PENDING,
                        retryCount = 0,
                        nextRetryAt = now,
                        createdAt = now
                    )
                    database.ackQueueDao().enqueueAck(ackEntry)
                    Log.d(TAG, "[ACK_QUEUED] Enqueued ACK for eventId=$eventId in local database")
                } else {
                    Log.d(TAG, "[ACK_QUEUED] ACK already queued for eventId=$eventId (idempotent)")
                }
            }

            val eventAfter = database.eventDao().getEventByEventIdDirect(eventId)
            if (eventAfter == null) {
                return@withContext false
            }

            if (eventAfter.status == EventStatus.RECEIVED) {
                triggerAckWorker(context)
                true
            } else {
                false
            }
        } catch (e: Exception) {
            Log.e(TAG, "[ACK_FAILED] Error marking event received", e)
            false
        }
    }

    /**
     * Stops ringing and records local dismissal. Queues DISMISS action when backend sync is needed.
     */
    suspend fun markDismissed(eventId: String): Boolean = withContext(Dispatchers.IO) {
        val now = Instant.now()
        val userId = preferences.getUserId()
        val deviceId = preferences.getOrCreateDeviceId()

        try {
            AlarmEngine.getInstance(context, database, preferences)
                .stop(eventId, AlarmStopReason.DISMISSED)

            database.withTransaction {
                val existing = database.eventDao().getEventByEventIdDirect(eventId)
                if (existing == null) {
                    Log.w(TAG, "[DISMISS] Event not found locally: $eventId")
                    return@withTransaction
                }
                if (existing.status == EventStatus.DISMISSED || existing.status == EventStatus.RECEIVED) {
                    return@withTransaction
                }
                database.eventDao().markDismissedIfNotFinal(
                    eventId = eventId,
                    status = EventStatus.DISMISSED,
                    dismissedAt = now
                )
                val existingAck = database.ackQueueDao().getAckByEventId(eventId)
                if (existingAck == null) {
                    database.ackQueueDao().enqueueAck(
                        AckQueueEntity(
                            eventId = eventId,
                            action = "DISMISS",
                            userId = userId,
                            deviceId = deviceId,
                            receivedAt = now,
                            status = QueueStatus.PENDING,
                            nextRetryAt = now
                        )
                    )
                }
            }
            triggerAckWorker(context)
            true
        } catch (e: Exception) {
            Log.e(TAG, "[DISMISS] Error marking dismissed", e)
            false
        }
    }

    suspend fun markAlertDismissed(alertId: String): Boolean = withContext(Dispatchers.IO) {
        val userId = preferences.getUserId()
        val deviceId = preferences.getOrCreateDeviceId()
        if (userId.isNullOrBlank()) return@withContext false

        val now = Instant.now()
        try {
            AlarmEngine.getInstance(context, database, preferences)
                .stop(alertId, AlarmStopReason.DISMISSED)

            database.withTransaction {
                val existingAck = database.ackQueueDao().getAckByEventId(alertId)
                if (existingAck == null) {
                    database.ackQueueDao().enqueueAck(
                        AckQueueEntity(
                            eventId = alertId,
                            action = ACTION_ALERT_DISMISS,
                            userId = userId,
                            deviceId = deviceId,
                            receivedAt = now,
                            status = QueueStatus.PENDING,
                            nextRetryAt = now
                        )
                    )
                }
            }
            triggerAckWorker(context)
            true
        } catch (e: Exception) {
            Log.e(TAG, "[ALERT_DISMISS] Error", e)
            false
        }
    }

    /**
     * Alert-based session ACK (sessionId = alertId, no EventEntity in Room).
     * Stops alarm, persists local delivery state when possible, emits socket + REST ACK.
     * Idempotent: skips network when delivery is already acknowledged locally.
     */
    suspend fun markAlertAcknowledged(alertId: String): Boolean = withContext(Dispatchers.IO) {
        val userId = preferences.getUserId()
        val deviceId = preferences.getOrCreateDeviceId()
        if (userId.isNullOrBlank()) {
            Log.w(TAG, "[ALERT_ACK] User ID missing for alertId=$alertId")
            return@withContext false
        }

        val now = Instant.now()
        Log.d(TAG, "[ALERT_ACK] User tapped ACKNOWLEDGE for alertId=$alertId at $now")

        try {
            NotificationManagerCompat.from(context).cancel(alertId.hashCode())
            AlarmEngine.getInstance(context, database, preferences)
                .stop(alertId, AlarmStopReason.ACKNOWLEDGED)

            database.withTransaction {
                val alreadyAcknowledged = database.alertDeliveryDao()
                    .getAcknowledgedAt(alertId, userId)
                if (alreadyAcknowledged != null) {
                    Log.d(TAG, "[ALERT_ACK] Alert already acknowledged (idempotent): $alertId")
                    return@withTransaction
                }

                database.alertDeliveryDao().markAcknowledged(alertId, userId, now)

                val existingAck = database.ackQueueDao().getAckByEventId(alertId)
                if (existingAck == null) {
                    database.ackQueueDao().enqueueAck(
                        AckQueueEntity(
                            eventId = alertId,
                            action = ACTION_ALERT_ACK,
                            userId = userId,
                            deviceId = deviceId,
                            receivedAt = now,
                            status = QueueStatus.PENDING,
                            retryCount = 0,
                            nextRetryAt = now,
                            createdAt = now
                        )
                    )
                    Log.d(TAG, "[ALERT_ACK] Queued offline-capable ACK for alertId=$alertId")
                }
            }

            triggerAckWorker(context)
            true
        } catch (e: Exception) {
            Log.e(TAG, "[ALERT_ACK] Error acknowledging alert", e)
            false
        }
    }

    companion object {
        private const val TAG = "AckManager"
        const val WORK_NAME_ACK = "resilient_ack_work"
        const val ACTION_ALERT_ACK = "ALERT_ACK"
        const val ACTION_ALERT_DISMISS = "ALERT_DISMISS"

        fun triggerAckWorker(context: Context) {
            val constraints = Constraints.Builder()
                .setRequiredNetworkType(NetworkType.CONNECTED)
                .build()

            val request = OneTimeWorkRequestBuilder<ResilientAckWorker>()
                .setConstraints(constraints)
                .setBackoffCriteria(BackoffPolicy.EXPONENTIAL, 15, TimeUnit.SECONDS)
                .build()

            WorkManager.getInstance(context.applicationContext).enqueueUniqueWork(
                WORK_NAME_ACK,
                ExistingWorkPolicy.REPLACE,
                request
            )
        }

        @Volatile
        private var INSTANCE: AckManager? = null

        fun getInstance(
            context: Context,
            database: AppDatabase,
            preferences: UserPreferences,
            socketManager: SocketManager? = null
        ): AckManager {
            return INSTANCE ?: synchronized(this) {
                val instance = AckManager(
                    context.applicationContext,
                    database,
                    preferences,
                    socketManager
                )
                INSTANCE = instance
                instance
            }
        }
    }
}

/**
 * Resilient background worker that flushes offline ACK queue entries to backend.
 */
class ResilientAckWorker(
    appContext: Context,
    workerParams: WorkerParameters
) : CoroutineWorker(appContext, workerParams) {

    override suspend fun doWork(): Result = withContext(Dispatchers.IO) {
        val database = AppDatabase.getInstance(applicationContext)
        val preferences = UserPreferences.getInstance(applicationContext)
        val serverUrl = preferences.getServerUrl()

        val pendingAcks = database.ackQueueDao().getPendingAcks()
        if (pendingAcks.isEmpty()) {
            Log.d(TAG, "[ACK_WORKER] No pending ACKs in queue")
            return@withContext Result.success()
        }

        Log.d(TAG, "[ACK_WORKER] Flushing ${pendingAcks.size} pending ACKs to server...")
        val api = ApiClient.getService(serverUrl)

        var hasFailures = false

        for (ack in pendingAcks) {
            try {
                when (ack.action) {
                    AckManager.ACTION_ALERT_ACK -> {
                        Log.d(TAG, "[ACK_SENT] Sending alert ACK for alertId=${ack.eventId}...")
                        val response = api.acknowledgeAlert(
                            ack.eventId,
                            AcknowledgeRequest(ack.userId ?: "")
                        )
                        if (response.isSuccessful) {
                            Log.d(TAG, "[ACK_CONFIRMED] Server confirmed alert ACK for ${ack.eventId}")
                            database.ackQueueDao().deleteById(ack.id)
                        } else {
                            Log.w(TAG, "[ACK_FAILED] Alert ACK HTTP ${response.code()} for ${ack.eventId}")
                            hasFailures = true
                            val nextRetry = Instant.now().plus(
                                Math.min(300L, (ack.retryCount + 1) * 15L),
                                ChronoUnit.SECONDS
                            )
                            database.ackQueueDao().updateRetry(ack.id, QueueStatus.FAILED, nextRetry)
                        }
                    }
                    AckManager.ACTION_ALERT_DISMISS -> {
                        val response = api.dismissAlert(
                            ack.eventId,
                            AcknowledgeRequest(ack.userId ?: "")
                        )
                        if (response.isSuccessful) {
                            database.ackQueueDao().deleteById(ack.id)
                        } else {
                            hasFailures = true
                            val nextRetry = Instant.now().plus(15, ChronoUnit.SECONDS)
                            database.ackQueueDao().updateRetry(ack.id, QueueStatus.FAILED, nextRetry)
                        }
                    }
                    "DISMISS" -> {
                        val response = api.dismissEvent(ack.eventId, ReceiveEventRequest(
                            userId = ack.userId,
                            deviceId = ack.deviceId,
                            receivedAt = TimezoneHelper.formatInstantToIso(ack.receivedAt)
                        ))
                        if (response.isSuccessful) {
                            database.ackQueueDao().deleteById(ack.id)
                        } else {
                            hasFailures = true
                            val nextRetry = Instant.now().plus(15, ChronoUnit.SECONDS)
                            database.ackQueueDao().updateRetry(ack.id, QueueStatus.FAILED, nextRetry)
                        }
                    }
                    else -> {
                        database.eventDao().updateAckStatus(ack.eventId, AckStatus.SENDING)
                        Log.d(TAG, "[ACK_SENT] Sending event ACK for eventId=${ack.eventId}...")
                        val req = ReceiveEventRequest(
                            userId = ack.userId,
                            deviceId = ack.deviceId,
                            receivedAt = TimezoneHelper.formatInstantToIso(ack.receivedAt)
                        )
                        val response = api.receiveEvent(ack.eventId, req)
                        if (response.isSuccessful) {
                            Log.d(TAG, "[ACK_CONFIRMED] Server confirmed ACK for eventId=${ack.eventId}")
                            database.eventDao().markAcknowledged(
                                eventId = ack.eventId,
                                ackStatus = AckStatus.CONFIRMED,
                                acknowledgedAt = Instant.now()
                            )
                            database.ackQueueDao().deleteById(ack.id)
                        } else {
                            val code = response.code()
                            Log.w(TAG, "[ACK_FAILED] Server returned HTTP $code for eventId=${ack.eventId}")
                            hasFailures = true
                            database.eventDao().updateAckStatus(ack.eventId, AckStatus.FAILED)
                            val nextRetry = Instant.now().plus(
                                Math.min(300L, (ack.retryCount + 1) * 15L),
                                ChronoUnit.SECONDS
                            )
                            database.ackQueueDao().updateRetry(ack.id, QueueStatus.FAILED, nextRetry)
                        }
                    }
                }
            } catch (e: Exception) {
                Log.e(TAG, "[ACK_FAILED] Network exception for ${ack.eventId} action=${ack.action}", e)
                hasFailures = true
                if (ack.action == "RECEIVE") {
                    database.eventDao().updateAckStatus(ack.eventId, AckStatus.FAILED)
                }
                val nextRetry = Instant.now().plus(15, ChronoUnit.SECONDS)
                database.ackQueueDao().updateRetry(ack.id, QueueStatus.FAILED, nextRetry)
            }
        }

        if (hasFailures) {
            Result.retry()
        } else {
            Result.success()
        }
    }

    companion object {
        private const val TAG = "ResilientAckWorker"
    }
}
