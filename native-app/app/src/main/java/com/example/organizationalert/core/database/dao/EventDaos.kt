package com.example.organizationalert.core.database.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import com.example.organizationalert.core.database.entity.AckQueueEntity
import com.example.organizationalert.core.database.entity.DeviceRegistrationEntity
import com.example.organizationalert.core.database.entity.EventEntity
import com.example.organizationalert.core.database.entity.EventStatus
import com.example.organizationalert.core.database.entity.QueueStatus
import kotlinx.coroutines.flow.Flow
import java.time.Instant

@Dao
interface EventDao {
    @Query("SELECT * FROM events ORDER BY scheduledAt DESC")
    fun getAllEvents(): Flow<List<EventEntity>>

    @Query("SELECT * FROM events WHERE eventId = :eventId LIMIT 1")
    fun getEventByEventId(eventId: String): Flow<EventEntity?>

    @Query("SELECT * FROM events WHERE eventId = :eventId LIMIT 1")
    suspend fun getEventByEventIdDirect(eventId: String): EventEntity?

    @Query("SELECT * FROM events WHERE status = 'SCHEDULED' AND scheduledAt > :now ORDER BY scheduledAt ASC")
    fun getUpcomingScheduledEvents(now: Instant): Flow<List<EventEntity>>

    @Query("SELECT * FROM events WHERE status = 'SCHEDULED' ORDER BY scheduledAt ASC")
    suspend fun getAllFutureScheduledEvents(): List<EventEntity>

    @Query("SELECT * FROM events WHERE status = 'SCHEDULED' AND scheduledAt > :now ORDER BY scheduledAt ASC LIMIT 1")
    fun getNextPendingEvent(now: Instant): Flow<EventEntity?>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertOrUpdate(event: EventEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertOrUpdateAll(events: List<EventEntity>)

    @Query("UPDATE events SET status = :status, ringingStartedAt = :ringingStartedAt WHERE eventId = :eventId AND status IN ('SCHEDULED', 'TRIGGERED')")
    suspend fun markRingingIfEligible(
        eventId: String,
        status: EventStatus,
        ringingStartedAt: Instant
    ): Int

    @Query("UPDATE events SET status = :status, dismissedAt = :dismissedAt WHERE eventId = :eventId AND status IN ('RINGING', 'TRIGGERED', 'PRESENTED')")
    suspend fun markDismissedIfNotFinal(
        eventId: String,
        status: EventStatus,
        dismissedAt: Instant
    ): Int

    @Query("UPDATE events SET status = :status, triggeredAt = :triggeredAt WHERE eventId = :eventId")
    suspend fun markTriggered(eventId: String, status: EventStatus, triggeredAt: Instant)

    @Query("UPDATE events SET status = :status, displayedAt = :displayedAt WHERE eventId = :eventId")
    suspend fun markDisplayed(eventId: String, status: EventStatus, displayedAt: Instant)

    @Query("UPDATE events SET ackStatus = :ackStatus WHERE eventId = :eventId")
    suspend fun updateAckStatus(
        eventId: String,
        ackStatus: com.example.organizationalert.core.database.entity.AckStatus
    )

    @Query("UPDATE events SET status = :status, ackStatus = :ackStatus, receivedAt = :receivedAt WHERE eventId = :eventId AND status != 'RECEIVED'")
    suspend fun markReceivedIfNotAlready(
        eventId: String,
        status: EventStatus,
        ackStatus: com.example.organizationalert.core.database.entity.AckStatus,
        receivedAt: Instant
    )

    @Query("UPDATE events SET ackStatus = :ackStatus, acknowledgedAt = :acknowledgedAt WHERE eventId = :eventId")
    suspend fun markAcknowledged(
        eventId: String,
        ackStatus: com.example.organizationalert.core.database.entity.AckStatus,
        acknowledgedAt: Instant
    )

    @Query("UPDATE events SET status = :status, lastError = :error WHERE eventId = :eventId")
    suspend fun markPresentationBlocked(eventId: String, status: EventStatus, error: String)

    @Query("DELETE FROM events WHERE eventId = :eventId")
    suspend fun deleteByEventId(eventId: String)

    @Query("DELETE FROM events")
    suspend fun clear()
}


@Dao
interface AckQueueDao {
    @Query("SELECT * FROM ack_queue WHERE status = 'PENDING' OR status = 'FAILED' ORDER BY nextRetryAt ASC")
    suspend fun getPendingAcks(): List<AckQueueEntity>

    @Query("SELECT * FROM ack_queue WHERE eventId = :eventId LIMIT 1")
    suspend fun getAckByEventId(eventId: String): AckQueueEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun enqueueAck(ack: AckQueueEntity): Long

    @Query("UPDATE ack_queue SET status = :status, retryCount = retryCount + 1, nextRetryAt = :nextRetryAt WHERE id = :id")
    suspend fun updateRetry(id: Long, status: QueueStatus, nextRetryAt: Instant)

    @Query("DELETE FROM ack_queue WHERE id = :id")
    suspend fun deleteById(id: Long)

    @Query("DELETE FROM ack_queue WHERE eventId = :eventId")
    suspend fun deleteByEventId(eventId: String)

    @Query("SELECT COUNT(*) FROM ack_queue WHERE status = 'PENDING'")
    fun getPendingCount(): Flow<Int>
}

@Dao
interface DeviceDao {
    @Query("SELECT * FROM devices LIMIT 1")
    suspend fun getDeviceRegistration(): DeviceRegistrationEntity?

    @Query("SELECT * FROM devices LIMIT 1")
    fun getDeviceRegistrationFlow(): Flow<DeviceRegistrationEntity?>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun saveDeviceRegistration(device: DeviceRegistrationEntity)

    @Query("DELETE FROM devices")
    suspend fun clear()
}
