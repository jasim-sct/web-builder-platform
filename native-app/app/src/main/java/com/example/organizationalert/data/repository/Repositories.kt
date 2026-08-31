package com.example.organizationalert.data.repository

import android.util.Log
import com.example.organizationalert.core.database.AppDatabase
import com.example.organizationalert.core.database.entity.AlertEntity
import com.example.organizationalert.core.database.entity.GroupEntity
import com.example.organizationalert.core.database.entity.UserEntity
import com.example.organizationalert.core.network.ApiClient
import com.example.organizationalert.core.network.dto.AcknowledgeRequest
import com.example.organizationalert.core.network.dto.BroadcastNowRequest
import com.example.organizationalert.core.network.dto.CreateAlertRequest
import com.example.organizationalert.core.network.dto.CreateGroupRequest
import com.example.organizationalert.core.network.dto.CreateUserRequest
import com.example.organizationalert.core.network.dto.UpdateAlertRequest
import com.example.organizationalert.core.network.dto.UpdateGroupRequest
import com.example.organizationalert.core.network.dto.UpdateUserRequest
import com.example.organizationalert.core.preferences.UserPreferences
import com.example.organizationalert.core.scheduling.AlertScheduler
import com.example.organizationalert.core.scheduling.TimezoneHelper
import com.example.organizationalert.core.socket.SocketManager
import com.example.organizationalert.core.sync.SyncManager
import com.example.organizationalert.domain.model.Alert
import com.example.organizationalert.domain.model.AlertDelivery
import com.example.organizationalert.domain.model.AlertStatus
import com.example.organizationalert.domain.model.Group
import com.example.organizationalert.domain.model.Organization
import com.example.organizationalert.domain.model.Priority
import com.example.organizationalert.domain.model.RepeatType
import com.example.organizationalert.domain.model.User
import com.example.organizationalert.domain.model.UserRole
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.withContext
import java.time.Instant

class AlertRepository(
    private val database: AppDatabase,
    private val preferences: UserPreferences,
    private val scheduler: AlertScheduler,
    private val socketManager: SocketManager
) {
    val allAlerts: Flow<List<Alert>> = database.alertDao().getAllAlerts()
        .map { list -> list.map { it.toDomain() } }

    fun getAlertById(id: String): Flow<Alert?> = database.alertDao().getAlertById(id)
        .map { it?.toDomain() }

    fun getUpcomingAlerts(): Flow<List<Alert>> {
        return database.alertDao().getUpcomingAlerts(Instant.now())
            .map { list -> list.map { it.toDomain() } }
    }

    fun getNextUpcomingAlert(): Flow<Alert?> {
        return database.alertDao().getNextUpcomingAlert(Instant.now())
            .map { it?.toDomain() }
    }

    fun getDeliveriesByAlert(alertId: String): Flow<List<AlertDelivery>> {
        return database.alertDeliveryDao().getDeliveriesByAlert(alertId)
            .map { list -> list.map { it.toDomain() } }
    }

    suspend fun createAlert(
        title: String,
        message: String,
        groupId: String,
        scheduledAt: Instant,
        repeatType: RepeatType,
        priority: Priority
    ): Result<Alert> = withContext(Dispatchers.IO) {
        try {
            val orgId = preferences.getOrganizationId() ?: throw IllegalStateException("Organization missing")
            val userId = preferences.getUserId()
            val api = ApiClient.getService(preferences.getServerUrl())

            val req = CreateAlertRequest(
                title = title,
                message = message,
                organizationId = orgId,
                groupId = groupId,
                scheduledAt = TimezoneHelper.formatInstantToIso(scheduledAt),
                repeatType = repeatType.name,
                priority = priority.name,
                isEnabled = true,
                createdBy = userId
            )

            val res = api.createAlert(req)
            if (!res.isSuccessful || res.body()?.data == null) {
                return@withContext Result.failure(Exception(res.body()?.message ?: "Failed to create alert"))
            }

            val alertDto = res.body()!!.data!!
            val alert = Alert(
                id = alertDto.id,
                title = alertDto.title,
                message = alertDto.message,
                organizationId = alertDto.getOrgIdString(),
                groupId = alertDto.getGroupIdString(),
                groupName = alertDto.getGroupNameString(),
                scheduledAt = TimezoneHelper.parseIsoToInstant(alertDto.scheduledAt) ?: scheduledAt,
                repeatType = RepeatType.fromString(alertDto.repeatType),
                priority = Priority.fromString(alertDto.priority),
                status = AlertStatus.fromString(alertDto.status),
                isEnabled = alertDto.isEnabled,
                createdBy = alertDto.getCreatedByIdString(),
                creatorName = alertDto.getCreatorNameString(),
                lastTriggeredAt = TimezoneHelper.parseIsoToInstant(alertDto.lastTriggeredAt),
                nextTriggerAt = TimezoneHelper.parseIsoToInstant(alertDto.nextTriggerAt),
                version = alertDto.version,
                createdAt = TimezoneHelper.parseIsoToInstant(alertDto.createdAt) ?: Instant.now(),
                updatedAt = TimezoneHelper.parseIsoToInstant(alertDto.updatedAt) ?: Instant.now()
            )

            database.alertDao().insertOrUpdate(AlertEntity.fromDomain(alert))
            scheduler.scheduleAlert(alert)

            Result.success(alert)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun updateAlert(
        id: String,
        title: String,
        message: String,
        groupId: String,
        scheduledAt: Instant,
        repeatType: RepeatType,
        priority: Priority
    ): Result<Alert> = withContext(Dispatchers.IO) {
        try {
            val api = ApiClient.getService(preferences.getServerUrl())
            val req = UpdateAlertRequest(
                title = title,
                message = message,
                groupId = groupId,
                scheduledAt = TimezoneHelper.formatInstantToIso(scheduledAt),
                repeatType = repeatType.name,
                priority = priority.name
            )

            val res = api.updateAlert(id, req)
            if (!res.isSuccessful || res.body()?.data == null) {
                return@withContext Result.failure(Exception(res.body()?.message ?: "Failed to update alert"))
            }

            val alertDto = res.body()!!.data!!
            val alert = Alert(
                id = alertDto.id,
                title = alertDto.title,
                message = alertDto.message,
                organizationId = alertDto.getOrgIdString(),
                groupId = alertDto.getGroupIdString(),
                groupName = alertDto.getGroupNameString(),
                scheduledAt = TimezoneHelper.parseIsoToInstant(alertDto.scheduledAt) ?: scheduledAt,
                repeatType = RepeatType.fromString(alertDto.repeatType),
                priority = Priority.fromString(alertDto.priority),
                status = AlertStatus.fromString(alertDto.status),
                isEnabled = alertDto.isEnabled,
                createdBy = alertDto.getCreatedByIdString(),
                creatorName = alertDto.getCreatorNameString(),
                lastTriggeredAt = TimezoneHelper.parseIsoToInstant(alertDto.lastTriggeredAt),
                nextTriggerAt = TimezoneHelper.parseIsoToInstant(alertDto.nextTriggerAt),
                version = alertDto.version,
                createdAt = TimezoneHelper.parseIsoToInstant(alertDto.createdAt) ?: Instant.now(),
                updatedAt = TimezoneHelper.parseIsoToInstant(alertDto.updatedAt) ?: Instant.now()
            )

            database.alertDao().insertOrUpdate(AlertEntity.fromDomain(alert))
            scheduler.cancelAlert(alert.id)
            scheduler.scheduleAlert(alert)

            Result.success(alert)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun deleteAlert(id: String): Result<Unit> = withContext(Dispatchers.IO) {
        try {
            val api = ApiClient.getService(preferences.getServerUrl())
            scheduler.cancelAlert(id)
            val res = api.deleteAlert(id)
            if (res.isSuccessful) {
                database.alertDao().deleteById(id)
                Result.success(Unit)
            } else {
                Result.failure(Exception(res.body()?.message ?: "Failed to delete alert"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun acknowledgeAlert(alertId: String): Result<Unit> = withContext(Dispatchers.IO) {
        try {
            val userId = preferences.getUserId() ?: throw IllegalStateException("User ID not found")
            val api = ApiClient.getService(preferences.getServerUrl())

            socketManager.acknowledgeAlert(alertId, userId)
            val res = api.acknowledgeAlert(alertId, AcknowledgeRequest(userId))

            val now = Instant.now()
            database.alertDeliveryDao().markAcknowledged(alertId, userId, now)

            if (res.isSuccessful) {
                Result.success(Unit)
            } else {
                Result.failure(Exception(res.body()?.message ?: "Acknowledgement failed on server"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun broadcastNow(
        title: String,
        message: String,
        groupId: String,
        priority: Priority = Priority.URGENT
    ): Result<Unit> = withContext(Dispatchers.IO) {
        try {
            val orgId = preferences.getOrganizationId() ?: throw IllegalStateException("Organization missing")
            val userId = preferences.getUserId()
            val api = ApiClient.getService(preferences.getServerUrl())

            val req = BroadcastNowRequest(
                title = title,
                message = message,
                organizationId = orgId,
                groupId = groupId,
                priority = priority.name,
                createdBy = userId
            )

            val res = api.broadcastNow(req)
            if (res.isSuccessful) {
                Result.success(Unit)
            } else {
                Result.failure(Exception(res.body()?.message ?: "Broadcast failed"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun triggerAlertImmediately(id: String): Result<Unit> = withContext(Dispatchers.IO) {
        try {
            val api = ApiClient.getService(preferences.getServerUrl())
            val res = api.triggerAlert(id)
            if (res.isSuccessful) {
                Result.success(Unit)
            } else {
                Result.failure(Exception(res.body()?.message ?: "Trigger failed"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}

class GroupRepository(
    private val database: AppDatabase,
    private val preferences: UserPreferences
) {
    val activeGroups: Flow<List<Group>> = combine(
        database.groupDao().getAllActiveGroups(),
        database.userDao().getAllUsers()
    ) { groupEntities, userEntities ->
        val users = userEntities.map { it.toDomain() }
        groupEntities.map { it.toDomain(users) }
    }

    fun getGroupById(id: String): Flow<Group?> = combine(
        database.groupDao().getGroupById(id),
        database.userDao().getAllUsers()
    ) { groupEntity, userEntities ->
        val users = userEntities.map { it.toDomain() }
        groupEntity?.toDomain(users)
    }

    suspend fun createGroup(
        name: String,
        description: String,
        memberIds: List<String>
    ): Result<Group> = withContext(Dispatchers.IO) {
        try {
            val orgId = preferences.getOrganizationId() ?: throw IllegalStateException("Organization missing")
            val api = ApiClient.getService(preferences.getServerUrl())

            val req = CreateGroupRequest(
                name = name,
                description = description,
                organizationId = orgId,
                members = memberIds
            )

            val res = api.createGroup(req)
            if (!res.isSuccessful || res.body()?.data == null) {
                return@withContext Result.failure(Exception(res.body()?.message ?: "Failed to create group"))
            }

            val groupDto = res.body()!!.data!!
            val group = Group(
                id = groupDto.id,
                name = groupDto.name,
                description = groupDto.description ?: "",
                organizationId = groupDto.getOrgIdString(),
                memberIds = groupDto.extractMemberIds(),
                isActive = groupDto.isActive,
                createdAt = TimezoneHelper.parseIsoToInstant(groupDto.createdAt) ?: Instant.now(),
                updatedAt = TimezoneHelper.parseIsoToInstant(groupDto.updatedAt) ?: Instant.now()
            )

            database.groupDao().insertOrUpdate(GroupEntity.fromDomain(group))
            Result.success(group)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun updateGroup(
        id: String,
        name: String,
        description: String
    ): Result<Unit> = withContext(Dispatchers.IO) {
        try {
            val api = ApiClient.getService(preferences.getServerUrl())
            val res = api.updateGroup(id, UpdateGroupRequest(name = name, description = description))
            if (res.isSuccessful) {
                Result.success(Unit)
            } else {
                Result.failure(Exception(res.body()?.message ?: "Failed to update group"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun deleteGroup(id: String): Result<Unit> = withContext(Dispatchers.IO) {
        try {
            val api = ApiClient.getService(preferences.getServerUrl())
            val res = api.deleteGroup(id)
            if (res.isSuccessful) {
                database.groupDao().deleteById(id)
                Result.success(Unit)
            } else {
                Result.failure(Exception(res.body()?.message ?: "Failed to delete group"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun addMember(groupId: String, userId: String): Result<Unit> = withContext(Dispatchers.IO) {
        try {
            val api = ApiClient.getService(preferences.getServerUrl())
            val res = api.addMember(groupId, userId)
            if (res.isSuccessful) {
                val groupDto = res.body()?.data
                if (groupDto != null) {
                    val group = Group(
                        id = groupDto.id,
                        name = groupDto.name,
                        description = groupDto.description ?: "",
                        organizationId = groupDto.getOrgIdString(),
                        memberIds = groupDto.extractMemberIds(),
                        isActive = groupDto.isActive
                    )
                    database.groupDao().insertOrUpdate(GroupEntity.fromDomain(group))
                }
                Result.success(Unit)
            } else {
                Result.failure(Exception(res.body()?.message ?: "Failed to add member"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun removeMember(groupId: String, userId: String): Result<Unit> = withContext(Dispatchers.IO) {
        try {
            val api = ApiClient.getService(preferences.getServerUrl())
            val res = api.removeMember(groupId, userId)
            if (res.isSuccessful) {
                val groupDto = res.body()?.data
                if (groupDto != null) {
                    val group = Group(
                        id = groupDto.id,
                        name = groupDto.name,
                        description = groupDto.description ?: "",
                        organizationId = groupDto.getOrgIdString(),
                        memberIds = groupDto.extractMemberIds(),
                        isActive = groupDto.isActive
                    )
                    database.groupDao().insertOrUpdate(GroupEntity.fromDomain(group))
                }
                Result.success(Unit)
            } else {
                Result.failure(Exception(res.body()?.message ?: "Failed to remove member"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}

class UserRepository(
    private val database: AppDatabase,
    private val preferences: UserPreferences
) {
    val allUsers: Flow<List<User>> = database.userDao().getAllUsers()
        .map { list -> list.map { it.toDomain() } }

    fun getUserById(id: String): Flow<User?> = database.userDao().getUserById(id)
        .map { it?.toDomain() }

    suspend fun createUser(
        name: String,
        email: String,
        phone: String,
        role: UserRole
    ): Result<User> = withContext(Dispatchers.IO) {
        try {
            val orgId = preferences.getOrganizationId() ?: throw IllegalStateException("Organization missing")
            val api = ApiClient.getService(preferences.getServerUrl())

            val req = CreateUserRequest(
                name = name,
                email = email,
                phone = phone,
                role = role.name,
                organizationId = orgId
            )

            val res = api.createUser(req)
            if (!res.isSuccessful || res.body()?.data == null) {
                return@withContext Result.failure(Exception(res.body()?.message ?: "Failed to create user"))
            }

            val userDto = res.body()!!.data!!
            val user = User(
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

            database.userDao().insertOrUpdate(UserEntity.fromDomain(user))
            Result.success(user)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun updateUser(
        id: String,
        name: String,
        phone: String,
        role: UserRole,
        isActive: Boolean
    ): Result<Unit> = withContext(Dispatchers.IO) {
        try {
            val api = ApiClient.getService(preferences.getServerUrl())
            val res = api.updateUser(
                id,
                UpdateUserRequest(name = name, phone = phone, role = role.name, isActive = isActive)
            )
            if (res.isSuccessful) {
                Result.success(Unit)
            } else {
                Result.failure(Exception(res.body()?.message ?: "Failed to update user"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun deleteUser(id: String): Result<Unit> = withContext(Dispatchers.IO) {
        try {
            val api = ApiClient.getService(preferences.getServerUrl())
            val res = api.deleteUser(id)
            if (res.isSuccessful) {
                database.userDao().deleteById(id)
                Result.success(Unit)
            } else {
                Result.failure(Exception(res.body()?.message ?: "Failed to delete user"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
