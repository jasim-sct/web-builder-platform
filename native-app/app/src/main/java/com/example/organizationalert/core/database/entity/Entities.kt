package com.example.organizationalert.core.database.entity

import androidx.room.Entity
import androidx.room.Index
import androidx.room.PrimaryKey
import com.example.organizationalert.domain.model.Alert
import com.example.organizationalert.domain.model.AlertDelivery
import com.example.organizationalert.domain.model.AlertStatus
import com.example.organizationalert.domain.model.DeliveryStatus
import com.example.organizationalert.domain.model.Group
import com.example.organizationalert.domain.model.Organization
import com.example.organizationalert.domain.model.Priority
import com.example.organizationalert.domain.model.RepeatType
import com.example.organizationalert.domain.model.User
import com.example.organizationalert.domain.model.UserRole
import java.time.Instant

@Entity(tableName = "organizations")
data class OrganizationEntity(
    @PrimaryKey val id: String,
    val name: String,
    val description: String,
    val createdBy: String?,
    val isActive: Boolean,
    val createdAt: Instant,
    val updatedAt: Instant
) {
    fun toDomain(): Organization = Organization(
        id = id,
        name = name,
        description = description,
        createdBy = createdBy,
        isActive = isActive,
        createdAt = createdAt,
        updatedAt = updatedAt
    )

    companion object {
        fun fromDomain(org: Organization): OrganizationEntity = OrganizationEntity(
            id = org.id,
            name = org.name,
            description = org.description,
            createdBy = org.createdBy,
            isActive = org.isActive,
            createdAt = org.createdAt,
            updatedAt = org.updatedAt
        )
    }
}

@Entity(
    tableName = "users",
    indices = [Index(value = ["email", "organizationId"], unique = true)]
)
data class UserEntity(
    @PrimaryKey val id: String,
    val name: String,
    val email: String,
    val phone: String,
    val role: UserRole,
    val organizationId: String,
    val isActive: Boolean,
    val createdAt: Instant,
    val updatedAt: Instant
) {
    fun toDomain(): User = User(
        id = id,
        name = name,
        email = email,
        phone = phone,
        role = role,
        organizationId = organizationId,
        isActive = isActive,
        createdAt = createdAt,
        updatedAt = updatedAt
    )

    companion object {
        fun fromDomain(user: User): UserEntity = UserEntity(
            id = user.id,
            name = user.name,
            email = user.email,
            phone = user.phone,
            role = user.role,
            organizationId = user.organizationId,
            isActive = user.isActive,
            createdAt = user.createdAt,
            updatedAt = user.updatedAt
        )
    }
}

@Entity(
    tableName = "groups",
    indices = [Index(value = ["organizationId"])]
)
data class GroupEntity(
    @PrimaryKey val id: String,
    val name: String,
    val description: String,
    val organizationId: String,
    val memberIds: List<String>,
    val isActive: Boolean,
    val createdAt: Instant,
    val updatedAt: Instant
) {
    fun toDomain(users: List<User> = emptyList()): Group = Group(
        id = id,
        name = name,
        description = description,
        organizationId = organizationId,
        memberIds = memberIds,
        members = users.filter { it.id in memberIds },
        isActive = isActive,
        createdAt = createdAt,
        updatedAt = updatedAt
    )

    companion object {
        fun fromDomain(group: Group): GroupEntity = GroupEntity(
            id = group.id,
            name = group.name,
            description = group.description,
            organizationId = group.organizationId,
            memberIds = group.memberIds,
            isActive = group.isActive,
            createdAt = group.createdAt,
            updatedAt = group.updatedAt
        )
    }
}

@Entity(
    tableName = "alerts",
    indices = [
        Index(value = ["organizationId"]),
        Index(value = ["groupId"]),
        Index(value = ["status", "isEnabled", "nextTriggerAt"])
    ]
)
data class AlertEntity(
    @PrimaryKey val id: String,
    val title: String,
    val message: String,
    val organizationId: String,
    val groupId: String,
    val groupName: String?,
    val scheduledAt: Instant,
    val repeatType: RepeatType,
    val priority: Priority,
    val status: AlertStatus,
    val isEnabled: Boolean,
    val createdBy: String?,
    val creatorName: String?,
    val lastTriggeredAt: Instant?,
    val nextTriggerAt: Instant?,
    val version: Int,
    val createdAt: Instant,
    val updatedAt: Instant
) {
    fun toDomain(): Alert = Alert(
        id = id,
        title = title,
        message = message,
        organizationId = organizationId,
        groupId = groupId,
        groupName = groupName,
        scheduledAt = scheduledAt,
        repeatType = repeatType,
        priority = priority,
        status = status,
        isEnabled = isEnabled,
        createdBy = createdBy,
        creatorName = creatorName,
        lastTriggeredAt = lastTriggeredAt,
        nextTriggerAt = nextTriggerAt,
        version = version,
        createdAt = createdAt,
        updatedAt = updatedAt
    )

    companion object {
        fun fromDomain(alert: Alert): AlertEntity = AlertEntity(
            id = alert.id,
            title = alert.title,
            message = alert.message,
            organizationId = alert.organizationId,
            groupId = alert.groupId,
            groupName = alert.groupName,
            scheduledAt = alert.scheduledAt,
            repeatType = alert.repeatType,
            priority = alert.priority,
            status = alert.status,
            isEnabled = alert.isEnabled,
            createdBy = alert.createdBy,
            creatorName = alert.creatorName,
            lastTriggeredAt = alert.lastTriggeredAt,
            nextTriggerAt = alert.nextTriggerAt,
            version = alert.version,
            createdAt = alert.createdAt,
            updatedAt = alert.updatedAt
        )
    }
}

@Entity(
    tableName = "alert_deliveries",
    indices = [
        Index(value = ["alertId", "userId"], unique = true),
        Index(value = ["userId"])
    ]
)
data class AlertDeliveryEntity(
    @PrimaryKey val id: String,
    val alertId: String,
    val userId: String,
    val organizationId: String,
    val status: DeliveryStatus,
    val deliveredAt: Instant,
    val acknowledgedAt: Instant?,
    val userName: String?,
    val userEmail: String?
) {
    fun toDomain(): AlertDelivery = AlertDelivery(
        id = id,
        alertId = alertId,
        userId = userId,
        organizationId = organizationId,
        status = status,
        deliveredAt = deliveredAt,
        acknowledgedAt = acknowledgedAt,
        userName = userName,
        userEmail = userEmail
    )

    companion object {
        fun fromDomain(delivery: AlertDelivery): AlertDeliveryEntity = AlertDeliveryEntity(
            id = delivery.id,
            alertId = delivery.alertId,
            userId = delivery.userId,
            organizationId = delivery.organizationId,
            status = delivery.status,
            deliveredAt = delivery.deliveredAt,
            acknowledgedAt = delivery.acknowledgedAt,
            userName = delivery.userName,
            userEmail = delivery.userEmail
        )
    }
}
