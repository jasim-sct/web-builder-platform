package com.example.organizationalert.core.database.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import com.example.organizationalert.core.database.entity.AlertDeliveryEntity
import com.example.organizationalert.core.database.entity.AlertEntity
import com.example.organizationalert.core.database.entity.GroupEntity
import com.example.organizationalert.core.database.entity.OrganizationEntity
import com.example.organizationalert.core.database.entity.UserEntity
import kotlinx.coroutines.flow.Flow
import java.time.Instant

@Dao
interface OrganizationDao {
    @Query("SELECT * FROM organizations WHERE id = :id LIMIT 1")
    fun getOrganizationById(id: String): Flow<OrganizationEntity?>

    @Query("SELECT * FROM organizations LIMIT 1")
    suspend fun getActiveOrganization(): OrganizationEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertOrUpdate(org: OrganizationEntity)

    @Query("DELETE FROM organizations")
    suspend fun clear()
}

@Dao
interface UserDao {
    @Query("SELECT * FROM users WHERE id = :id LIMIT 1")
    fun getUserById(id: String): Flow<UserEntity?>

    @Query("SELECT * FROM users WHERE organizationId = :orgId ORDER BY name ASC")
    fun getUsersByOrg(orgId: String): Flow<List<UserEntity>>

    @Query("SELECT * FROM users ORDER BY name ASC")
    fun getAllUsers(): Flow<List<UserEntity>>

    @Query("SELECT * FROM users WHERE id IN (:ids)")
    suspend fun getUsersByIds(ids: List<String>): List<UserEntity>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertOrUpdate(user: UserEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertOrUpdateAll(users: List<UserEntity>)

    @Query("DELETE FROM users WHERE id = :id")
    suspend fun deleteById(id: String)

    @Query("DELETE FROM users")
    suspend fun clear()
}

@Dao
interface GroupDao {
    @Query("SELECT * FROM groups WHERE id = :id LIMIT 1")
    fun getGroupById(id: String): Flow<GroupEntity?>

    @Query("SELECT * FROM groups WHERE organizationId = :orgId AND isActive = 1 ORDER BY name ASC")
    fun getGroupsByOrg(orgId: String): Flow<List<GroupEntity>>

    @Query("SELECT * FROM groups WHERE isActive = 1 ORDER BY name ASC")
    fun getAllActiveGroups(): Flow<List<GroupEntity>>

    @Query("SELECT * FROM groups WHERE id = :id LIMIT 1")
    suspend fun getGroupByIdDirect(id: String): GroupEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertOrUpdate(group: GroupEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertOrUpdateAll(groups: List<GroupEntity>)

    @Query("DELETE FROM groups WHERE id = :id")
    suspend fun deleteById(id: String)

    @Query("DELETE FROM groups")
    suspend fun clear()
}

@Dao
interface AlertDao {
    @Query("SELECT * FROM alerts ORDER BY scheduledAt DESC")
    fun getAllAlerts(): Flow<List<AlertEntity>>

    @Query("SELECT * FROM alerts WHERE id = :id LIMIT 1")
    fun getAlertById(id: String): Flow<AlertEntity?>

    @Query("SELECT * FROM alerts WHERE id = :id LIMIT 1")
    suspend fun getAlertByIdDirect(id: String): AlertEntity?

    @Query("SELECT * FROM alerts WHERE isEnabled = 1 AND status = 'SCHEDULED' AND nextTriggerAt > :currentTime ORDER BY nextTriggerAt ASC")
    fun getUpcomingAlerts(currentTime: Instant): Flow<List<AlertEntity>>

    @Query("SELECT * FROM alerts WHERE isEnabled = 1 AND status = 'SCHEDULED' AND nextTriggerAt IS NOT NULL ORDER BY nextTriggerAt ASC")
    suspend fun getAllFutureScheduledAlerts(): List<AlertEntity>

    @Query("SELECT * FROM alerts WHERE isEnabled = 1 AND status = 'SCHEDULED' AND nextTriggerAt > :currentTime ORDER BY nextTriggerAt ASC LIMIT 1")
    fun getNextUpcomingAlert(currentTime: Instant): Flow<AlertEntity?>

    @Query("SELECT * FROM alerts WHERE groupId = :groupId ORDER BY scheduledAt DESC")
    fun getAlertsByGroup(groupId: String): Flow<List<AlertEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertOrUpdate(alert: AlertEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertOrUpdateAll(alerts: List<AlertEntity>)

    @Query("UPDATE alerts SET status = :status, lastTriggeredAt = :lastTriggered, nextTriggerAt = :nextTrigger WHERE id = :id")
    suspend fun updateExecution(id: String, status: String, lastTriggered: Instant?, nextTrigger: Instant?)

    @Query("UPDATE alerts SET occurrenceCount = occurrenceCount + 1 WHERE id = :id")
    suspend fun incrementOccurrenceCount(id: String)

    @Query("DELETE FROM alerts WHERE id = :id")
    suspend fun deleteById(id: String)

    @Query("DELETE FROM alerts WHERE id NOT IN (:validIds)")
    suspend fun deleteOrphanedAlerts(validIds: List<String>)

    @Query("DELETE FROM alerts")
    suspend fun clear()
}

@Dao
interface AlertDeliveryDao {
    @Query("SELECT * FROM alert_deliveries WHERE userId = :userId ORDER BY deliveredAt DESC")
    fun getDeliveriesByUser(userId: String): Flow<List<AlertDeliveryEntity>>

    @Query("SELECT * FROM alert_deliveries WHERE alertId = :alertId ORDER BY deliveredAt DESC")
    fun getDeliveriesByAlert(alertId: String): Flow<List<AlertDeliveryEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertOrUpdate(delivery: AlertDeliveryEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertOrUpdateAll(deliveries: List<AlertDeliveryEntity>)

    @Query("SELECT acknowledgedAt FROM alert_deliveries WHERE alertId = :alertId AND userId = :userId LIMIT 1")
    suspend fun getAcknowledgedAt(alertId: String, userId: String): Instant?

    @Query("UPDATE alert_deliveries SET status = 'ACKNOWLEDGED', acknowledgedAt = :acknowledgedAt WHERE alertId = :alertId AND userId = :userId")
    suspend fun markAcknowledged(alertId: String, userId: String, acknowledgedAt: Instant)

    @Query("DELETE FROM alert_deliveries")
    suspend fun clear()
}
