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
import com.example.organizationalert.core.network.dto.ReceiveEventRequest
import com.example.organizationalert.core.preferences.UserPreferences
import com.example.organizationalert.core.scheduling.TimezoneHelper
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.time.Instant
import java.time.temporal.ChronoUnit
import java.util.concurrent.TimeUnit

class AckManager(
    private val context: Context,
    private val database: AppDatabase,
    private val preferences: UserPreferences
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

    companion object {
        private const val TAG = "AckManager"
        const val WORK_NAME_ACK = "resilient_ack_work"

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

        fun getInstance(context: Context, database: AppDatabase, preferences: UserPreferences): AckManager {
            return INSTANCE ?: synchronized(this) {
                val instance = AckManager(context.applicationContext, database, preferences)
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
                database.eventDao().updateAckStatus(ack.eventId, AckStatus.SENDING)
                Log.d(TAG, "[ACK_SENT] Sending ACK for eventId=${ack.eventId}...")
                val req = ReceiveEventRequest(
                    userId = ack.userId,
                    deviceId = ack.deviceId,
                    receivedAt = TimezoneHelper.formatInstantToIso(ack.receivedAt)
                )

                val response = if (ack.action == "DISMISS") {
                    // Local dismissal already persisted; no dedicated backend contract yet.
                    null
                } else {
                    api.receiveEvent(ack.eventId, req)
                }
                if (ack.action == "DISMISS") {
                    Log.d(TAG, "[ACK_CONFIRMED] Dismiss recorded locally for eventId=${ack.eventId}")
                    database.ackQueueDao().deleteById(ack.id)
                    continue
                }
                if (response != null && response.isSuccessful) {
                    Log.d(TAG, "[ACK_CONFIRMED] Server confirmed ACK for eventId=${ack.eventId}")

                    database.eventDao().markAcknowledged(
                        eventId = ack.eventId,
                        ackStatus = AckStatus.CONFIRMED,
                        acknowledgedAt = Instant.now()
                    )

                    database.ackQueueDao().deleteById(ack.id)
                } else {
                    val code = response?.code() ?: -1
                    Log.w(TAG, "[ACK_FAILED] Server returned HTTP $code for eventId=${ack.eventId}")
                    hasFailures = true
                    database.eventDao().updateAckStatus(ack.eventId, AckStatus.FAILED)
                    val nextRetry = Instant.now().plus(
                        Math.min(300L, (ack.retryCount + 1) * 15L),
                        ChronoUnit.SECONDS
                    )
                    database.ackQueueDao().updateRetry(ack.id, QueueStatus.FAILED, nextRetry)
                }
            } catch (e: Exception) {
                Log.e(TAG, "[ACK_FAILED] Network exception sending ACK for eventId=${ack.eventId}", e)
                hasFailures = true
                database.eventDao().updateAckStatus(ack.eventId, AckStatus.FAILED)
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
