package com.example.organizationalert.core.presentation

import com.example.organizationalert.core.database.AppDatabase
import com.example.organizationalert.core.database.entity.EventEntity
import com.example.organizationalert.core.database.entity.EventStatus
import com.example.organizationalert.core.preferences.UserPreferences
import com.example.organizationalert.domain.model.AlarmType
import com.example.organizationalert.domain.model.Priority
import java.time.Instant

/**
 * Persists immediate broadcast sessions locally so ACK/dedupe works like scheduled events.
 */
object ImmediateEventStore {

    suspend fun upsertImmediateEvent(
        database: AppDatabase,
        preferences: UserPreferences,
        sessionId: String,
        title: String,
        message: String,
        priority: Priority,
        groupId: String?,
        groupName: String?,
        broadcasterId: String?,
        broadcasterName: String?
    ): EventEntity? {
        val existing = database.eventDao().getEventByEventIdDirect(sessionId)
        if (existing != null && existing.status in TERMINAL_OR_RINGING) {
            return null
        }

        val now = Instant.now()
        val orgId = preferences.getOrganizationId() ?: ""
        val entity = EventEntity(
            id = sessionId,
            eventId = sessionId,
            userId = null,
            organizationId = orgId,
            groupId = groupId,
            groupName = groupName,
            alarmType = AlarmType.IMMEDIATE_ALARM,
            broadcasterId = broadcasterId,
            broadcasterName = broadcasterName,
            title = title,
            message = message,
            priority = priority,
            requiresReceive = true,
            status = EventStatus.TRIGGERED,
            createdAt = now,
            syncedAt = now,
            scheduledAt = now,
            triggeredAt = now
        )
        database.eventDao().insertOrUpdate(entity)
        return entity
    }

    private val TERMINAL_OR_RINGING = setOf(
        EventStatus.RINGING,
        EventStatus.RECEIVED,
        EventStatus.DISMISSED,
        EventStatus.PRESENTED
    )
}
