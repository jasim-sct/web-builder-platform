package com.example.organizationalert.core.sync

import android.util.Log
import com.example.organizationalert.core.database.AppDatabase
import com.example.organizationalert.core.device.DeviceRegistrationManager
import com.example.organizationalert.core.database.entity.AlertDeliveryEntity
import com.example.organizationalert.core.database.entity.AlertEntity
import com.example.organizationalert.core.database.entity.EventEntity
import com.example.organizationalert.core.database.entity.EventStatus
import com.example.organizationalert.core.database.entity.GroupEntity
import com.example.organizationalert.core.database.entity.OrganizationEntity
import com.example.organizationalert.core.database.entity.UserEntity
import com.example.organizationalert.core.network.ApiClient
import com.example.organizationalert.core.network.dto.EventDto
import com.example.organizationalert.core.network.dto.SyncResponseDto
import com.example.organizationalert.core.preferences.UserPreferences
import com.example.organizationalert.core.scheduling.AlertReconciliationService
import com.example.organizationalert.core.scheduling.AlertScheduler
import com.example.organizationalert.core.scheduling.EventAlarmScheduler
import com.example.organizationalert.core.scheduling.TimezoneHelper
import com.example.organizationalert.domain.model.Alert
import com.example.organizationalert.domain.model.AlertStatus
import com.example.organizationalert.domain.model.DeliveryStatus
import com.example.organizationalert.domain.model.Priority
import com.example.organizationalert.domain.model.RepeatType
import com.example.organizationalert.domain.model.UserRole
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.withContext
import java.time.Instant

sealed class SyncState {
    object Idle : SyncState()
    object Syncing : SyncState()
    data class Success(val message: String, val timestamp: Instant) : SyncState()
    data class Error(val message: String, val error: Throwable? = null) : SyncState()
}

class SyncManager(
    private val database: AppDatabase,
    private val preferences: UserPreferences,
    private val scheduler: AlertScheduler,
    private val reconciliationService: AlertReconciliationService,
    private val deviceRegistrationManager: DeviceRegistrationManager,
    private val eventAlarmScheduler: EventAlarmScheduler
) {

    private val _syncState = MutableStateFlow<SyncState>(SyncState.Idle)
    val syncState: StateFlow<SyncState> = _syncState.asStateFlow()

    /**
     * Executes atomic single round-trip full synchronization.
     */
    suspend fun performFullSync(): Result<SyncResponseDto> = withContext(Dispatchers.IO) {
        val serverUrl = preferences.getServerUrl()
        val userId = preferences.getUserId()
        val orgId = preferences.getOrganizationId()

        if (userId.isNullOrBlank() && orgId.isNullOrBlank()) {
            val err = "Cannot sync: No user or organization configured"
            _syncState.value = SyncState.Error(err)
            return@withContext Result.failure(IllegalStateException(err))
        }

        _syncState.value = SyncState.Syncing
        Log.d(TAG, "[SYNC] Starting full sync with server: $serverUrl (userId=$userId, orgId=$orgId)")

        try {
            val api = ApiClient.getService(serverUrl)
            val response = api.getSyncData(userId = userId, organizationId = orgId)

            if (!response.isSuccessful || response.body()?.data == null) {
                val errorMsg = response.body()?.message ?: "Sync request failed with HTTP ${response.code()}"
                Log.e(TAG, "[SYNC] Server error: $errorMsg")
                _syncState.value = SyncState.Error(errorMsg)
                return@withContext Result.failure(Exception(errorMsg))
            }

            val syncData = response.body()!!.data!!

            // 1. Persist Organization
            syncData.organization?.let { orgDto ->
                database.organizationDao().insertOrUpdate(
                    OrganizationEntity(
                        id = orgDto.id,
                        name = orgDto.name,
                        description = orgDto.description ?: "",
                        createdBy = orgDto.createdBy,
                        isActive = orgDto.isActive,
                        createdAt = TimezoneHelper.parseIsoToInstant(orgDto.createdAt) ?: Instant.now(),
                        updatedAt = TimezoneHelper.parseIsoToInstant(orgDto.updatedAt) ?: Instant.now()
                    )
                )
                preferences.setOrganizationName(orgDto.name)
            }

            // 2. Persist User
            syncData.user?.let { userDto ->
                database.userDao().insertOrUpdate(
                    UserEntity(
                        id = userDto.id,
                        name = userDto.name,
                        email = userDto.email,
                        phone = userDto.phone ?: "",
                        role = UserRole.fromString(userDto.role),
                        organizationId = userDto.getOrgIdString(),
                        isActive = userDto.isActive,
                        createdAt = TimezoneHelper.parseIsoToInstant(userDto.createdAt) ?: Instant.now(),
                        updatedAt = TimezoneHelper.parseIsoToInstant(userDto.updatedAt) ?: Instant.now()
                    )
                )
                preferences.setUserName(userDto.name)
                preferences.setUserEmail(userDto.email)
                preferences.setUserRole(userDto.role)
            }

            // 3. Persist Groups
            val groupEntities = syncData.groups.map { g ->
                GroupEntity(
                    id = g.id,
                    name = g.name,
                    description = g.description ?: "",
                    organizationId = g.getOrgIdString(),
                    memberIds = g.extractMemberIds(),
                    isActive = g.isActive,
                    createdAt = TimezoneHelper.parseIsoToInstant(g.createdAt) ?: Instant.now(),
                    updatedAt = TimezoneHelper.parseIsoToInstant(g.updatedAt) ?: Instant.now()
                )
            }
            if (groupEntities.isNotEmpty()) {
                database.groupDao().insertOrUpdateAll(groupEntities)
            }

            // 4. Persist Alerts & Deliveries
            val alertEntities = syncData.alerts.map { a ->
                AlertEntity(
                    id = a.id,
                    title = a.title,
                    message = a.message,
                    organizationId = a.getOrgIdString(),
                    groupId = a.getGroupIdString(),
                    groupName = a.getGroupNameString(),
                    scheduledAt = TimezoneHelper.parseIsoToInstant(a.scheduledAt) ?: Instant.now(),
                    repeatType = RepeatType.fromString(a.repeatType),
                    priority = Priority.fromString(a.priority),
                    status = AlertStatus.fromString(a.status),
                    isEnabled = a.isEnabled,
                    createdBy = a.getCreatedByIdString(),
                    creatorName = a.getCreatorNameString(),
                    lastTriggeredAt = TimezoneHelper.parseIsoToInstant(a.lastTriggeredAt),
                    nextTriggerAt = TimezoneHelper.parseIsoToInstant(a.nextTriggerAt),
                    version = a.version,
                    createdAt = TimezoneHelper.parseIsoToInstant(a.createdAt) ?: Instant.now(),
                    updatedAt = TimezoneHelper.parseIsoToInstant(a.updatedAt) ?: Instant.now()
                )
            }

            // Fetch current local alerts for reconciliation before updating database
            val existingLocalAlerts = database.alertDao().getAllFutureScheduledAlerts().map { it.toDomain() }

            if (alertEntities.isNotEmpty()) {
                database.alertDao().insertOrUpdateAll(alertEntities)
            }

            val deliveryEntities = syncData.deliveries.map { d ->
                AlertDeliveryEntity(
                    id = d.id ?: "${d.alertId}_${d.getUserIdString()}",
                    alertId = d.alertId,
                    userId = d.getUserIdString(),
                    organizationId = d.organizationId ?: orgId ?: "",
                    status = DeliveryStatus.fromString(d.status),
                    deliveredAt = TimezoneHelper.parseIsoToInstant(d.deliveredAt) ?: Instant.now(),
                    acknowledgedAt = TimezoneHelper.parseIsoToInstant(d.acknowledgedAt),
                    userName = d.getUserName(),
                    userEmail = d.getUserEmail()
                )
            }
            if (deliveryEntities.isNotEmpty()) {
                database.alertDeliveryDao().insertOrUpdateAll(deliveryEntities)
            }

            // 5. Reconcile alarms with Android AlarmManager
            val serverDomainAlerts = alertEntities.map { it.toDomain() }
            val reconcileResult = reconciliationService.reconcile(
                currentLocalAlerts = existingLocalAlerts,
                incomingServerAlerts = serverDomainAlerts
            )

            // 6. Sync Events & reconcile event alarms
            val deviceId = preferences.getOrCreateDeviceId()
            val eventsResponse = api.syncEvents(
                userId = userId,
                organizationId = orgId,
                deviceId = deviceId
            )

            var eventCount = 0
            var eventScheduledCount = 0
            var eventCancelledCount = 0

            if (eventsResponse.isSuccessful && eventsResponse.body()?.data != null) {
                val syncInstant = Instant.now()
                val eventEntities = eventsResponse.body()!!.data!!.events.map {
                    it.toEntity(syncInstant, orgId ?: "")
                }
                eventCount = eventEntities.size

                if (eventEntities.isNotEmpty()) {
                    database.eventDao().insertOrUpdateAll(eventEntities)
                }

                eventEntities
                    .filter { it.status == EventStatus.CANCELLED }
                    .forEach { event ->
                        if (eventAlarmScheduler.cancelEvent(event.eventId)) {
                            eventCancelledCount++
                        }
                    }

                val eventReconcileResult = eventAlarmScheduler.reconcileScheduledEvents(database)
                eventScheduledCount = eventReconcileResult.scheduledCount
                eventCancelledCount += eventReconcileResult.cancelledCount

                Log.d(
                    TAG,
                    "[SYNC] Events: $eventCount synced, $eventScheduledCount scheduled, $eventCancelledCount cancelled"
                )
            } else {
                val eventError = eventsResponse.body()?.message
                    ?: "Event sync failed with HTTP ${eventsResponse.code()}"
                Log.w(TAG, "[SYNC] $eventError")
            }

            val now = Instant.now()
            preferences.setLastSyncTime(now.toEpochMilli())

            val successMsg = buildString {
                append("Synchronized: ${alertEntities.size} alerts (${reconcileResult.scheduledCount} scheduled, ${reconcileResult.cancelledCount} cancelled)")
                if (eventCount > 0 || eventsResponse.isSuccessful) {
                    append(", $eventCount events ($eventScheduledCount scheduled, $eventCancelledCount cancelled)")
                }
            }
            Log.d(TAG, "[SYNC] $successMsg")
            _syncState.value = SyncState.Success(successMsg, now)

            try {
                deviceRegistrationManager.registerIfNeeded()
            } catch (e: Exception) {
                Log.w(TAG, "[SYNC] Device registration failed (non-fatal)", e)
            }

            Result.success(syncData)
        } catch (e: Exception) {
            Log.e(TAG, "[SYNC] Synchronization failed", e)
            _syncState.value = SyncState.Error(e.message ?: "Sync error", e)
            Result.failure(e)
        }
    }

    companion object {
        private const val TAG = "SyncManager"

        @Volatile
        private var INSTANCE: SyncManager? = null

        fun getInstance(
            database: AppDatabase,
            preferences: UserPreferences,
            scheduler: AlertScheduler,
            reconciliationService: AlertReconciliationService,
            deviceRegistrationManager: DeviceRegistrationManager,
            eventAlarmScheduler: EventAlarmScheduler
        ): SyncManager {
            return INSTANCE ?: synchronized(this) {
                val instance = SyncManager(
                    database,
                    preferences,
                    scheduler,
                    reconciliationService,
                    deviceRegistrationManager,
                    eventAlarmScheduler
                )
                INSTANCE = instance
                instance
            }
        }

        private fun EventDto.toEntity(syncInstant: Instant, orgIdFallback: String): EventEntity {
            val scheduledInstant = TimezoneHelper.parseIsoToInstant(scheduledAt) ?: syncInstant
            return EventEntity(
                id = eventId,
                eventId = eventId,
                userId = getUserIdString(),
                organizationId = getOrgIdString().ifBlank { orgIdFallback },
                groupId = getGroupIdString(),
                groupName = getGroupNameString(),
                type = type,
                broadcasterId = getCreatedByIdString(),
                broadcasterName = getCreatorNameString(),
                title = title,
                message = message,
                payload = payloadToString(),
                priority = Priority.fromString(priority),
                requiresReceive = requiresReceive,
                status = EventStatus.fromString(status),
                createdAt = TimezoneHelper.parseIsoToInstant(createdAt) ?: syncInstant,
                syncedAt = syncInstant,
                scheduledAt = scheduledInstant,
                scheduledAtUtc = scheduledInstant,
                expiresAt = TimezoneHelper.parseIsoToInstant(expiresAt),
                serverVersion = version
            )
        }
    }
}
