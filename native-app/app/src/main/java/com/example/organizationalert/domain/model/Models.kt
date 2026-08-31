package com.example.organizationalert.domain.model

import java.time.Instant

data class Organization(
    val id: String,
    val name: String,
    val description: String = "",
    val createdBy: String? = null,
    val isActive: Boolean = true,
    val createdAt: Instant = Instant.now(),
    val updatedAt: Instant = Instant.now()
)

data class User(
    val id: String,
    val name: String,
    val email: String,
    val phone: String = "",
    val role: UserRole = UserRole.MEMBER,
    val organizationId: String,
    val isActive: Boolean = true,
    val createdAt: Instant = Instant.now(),
    val updatedAt: Instant = Instant.now()
)

data class Group(
    val id: String,
    val name: String,
    val description: String = "",
    val organizationId: String,
    val memberIds: List<String> = emptyList(),
    val members: List<User> = emptyList(),
    val isActive: Boolean = true,
    val createdAt: Instant = Instant.now(),
    val updatedAt: Instant = Instant.now()
)

data class Alert(
    val id: String,
    val title: String,
    val message: String,
    val organizationId: String,
    val groupId: String,
    val groupName: String? = null,
    val scheduledAt: Instant,
    val repeatType: RepeatType = RepeatType.ONCE,
    val priority: Priority = Priority.NORMAL,
    val status: AlertStatus = AlertStatus.SCHEDULED,
    val isEnabled: Boolean = true,
    val createdBy: String? = null,
    val creatorName: String? = null,
    val lastTriggeredAt: Instant? = null,
    val nextTriggerAt: Instant? = null,
    val version: Int = 1,
    val timezoneId: String = "UTC",
    val recipientUserIds: List<String> = emptyList(),
    val occurrenceCount: Int = 0,
    val createdAt: Instant = Instant.now(),
    val updatedAt: Instant = Instant.now()
)

data class AlertDelivery(
    val id: String,
    val alertId: String,
    val userId: String,
    val organizationId: String,
    val status: DeliveryStatus = DeliveryStatus.DELIVERED,
    val deliveredAt: Instant = Instant.now(),
    val acknowledgedAt: Instant? = null,
    val userName: String? = null,
    val userEmail: String? = null
)

data class Membership(
    val groupId: String,
    val userId: String
)

data class SyncData(
    val version: Int,
    val serverTime: Instant,
    val user: User?,
    val organization: Organization?,
    val groups: List<Group>,
    val memberships: List<Membership>,
    val alerts: List<Alert>,
    val deliveries: List<AlertDelivery>
)
