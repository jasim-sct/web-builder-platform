package com.example.organizationalert.core.network.dto

import com.google.gson.annotations.SerializedName

data class ApiResponseDto<T>(
    @SerializedName("success") val success: Boolean,
    @SerializedName("message") val message: String? = null,
    @SerializedName("data") val data: T? = null,
    @SerializedName("errors") val errors: List<String>? = null
)

data class SyncResponseDto(
    @SerializedName("version") val version: Int = 1,
    @SerializedName("serverTime") val serverTime: String,
    @SerializedName("user") val user: UserDto?,
    @SerializedName("organization") val organization: OrganizationDto?,
    @SerializedName("groups") val groups: List<GroupDto> = emptyList(),
    @SerializedName("memberships") val memberships: List<MembershipDto> = emptyList(),
    @SerializedName("alerts") val alerts: List<AlertDto> = emptyList(),
    @SerializedName("deliveries") val deliveries: List<AlertDeliveryDto> = emptyList()
)

data class OrganizationDto(
    @SerializedName("_id") val id: String,
    @SerializedName("name") val name: String,
    @SerializedName("description") val description: String? = "",
    @SerializedName("createdBy") val createdBy: String? = null,
    @SerializedName("isActive") val isActive: Boolean = true,
    @SerializedName("createdAt") val createdAt: String? = null,
    @SerializedName("updatedAt") val updatedAt: String? = null
)

data class UserDto(
    @SerializedName("_id") val id: String,
    @SerializedName("name") val name: String,
    @SerializedName("email") val email: String,
    @SerializedName("phone") val phone: String? = "",
    @SerializedName("role") val role: String = "MEMBER",
    @SerializedName("organizationId") val organizationId: Any? = null,
    @SerializedName("isActive") val isActive: Boolean = true,
    @SerializedName("createdAt") val createdAt: String? = null,
    @SerializedName("updatedAt") val updatedAt: String? = null
) {
    fun getOrgIdString(): String {
        return when (organizationId) {
            is String -> organizationId
            is Map<*, *> -> (organizationId["_id"] ?: organizationId["id"])?.toString() ?: ""
            else -> organizationId?.toString() ?: ""
        }
    }
}

data class GroupDto(
    @SerializedName("_id") val id: String,
    @SerializedName("name") val name: String,
    @SerializedName("description") val description: String? = "",
    @SerializedName("organizationId") val organizationId: Any? = null,
    @SerializedName("members") val members: List<Any> = emptyList(),
    @SerializedName("isActive") val isActive: Boolean = true,
    @SerializedName("createdAt") val createdAt: String? = null,
    @SerializedName("updatedAt") val updatedAt: String? = null
) {
    fun getOrgIdString(): String {
        return when (organizationId) {
            is String -> organizationId
            is Map<*, *> -> (organizationId["_id"] ?: organizationId["id"])?.toString() ?: ""
            else -> organizationId?.toString() ?: ""
        }
    }

    fun extractMemberIds(): List<String> {
        return members.mapNotNull { item ->
            when (item) {
                is String -> item
                is Map<*, *> -> (item["_id"] ?: item["id"])?.toString()
                else -> item.toString()
            }
        }
    }
}

data class AlertDto(
    @SerializedName("_id") val id: String,
    @SerializedName("title") val title: String,
    @SerializedName("message") val message: String,
    @SerializedName("organizationId") val organizationId: Any? = null,
    @SerializedName("groupId") val groupId: Any? = null,
    @SerializedName("scheduledAt") val scheduledAt: String,
    @SerializedName("repeatType") val repeatType: String = "ONCE",
    @SerializedName("priority") val priority: String = "NORMAL",
    @SerializedName("status") val status: String = "SCHEDULED",
    @SerializedName("isEnabled") val isEnabled: Boolean = true,
    @SerializedName("createdBy") val createdBy: Any? = null,
    @SerializedName("lastTriggeredAt") val lastTriggeredAt: String? = null,
    @SerializedName("nextTriggerAt") val nextTriggerAt: String? = null,
    @SerializedName("version") val version: Int = 1,
    @SerializedName("timezoneId") val timezoneId: String? = "UTC",
    @SerializedName("recipientUserIds") val recipientUserIds: List<String>? = null,
    @SerializedName("occurrenceCount") val occurrenceCount: Int = 0,
    @SerializedName("createdAt") val createdAt: String? = null,
    @SerializedName("updatedAt") val updatedAt: String? = null
) {
    fun getOrgIdString(): String {
        return when (organizationId) {
            is String -> organizationId
            is Map<*, *> -> (organizationId["_id"] ?: organizationId["id"])?.toString() ?: ""
            else -> organizationId?.toString() ?: ""
        }
    }

    fun getGroupIdString(): String {
        return when (groupId) {
            is String -> groupId
            is Map<*, *> -> (groupId["_id"] ?: groupId["id"])?.toString() ?: ""
            else -> groupId?.toString() ?: ""
        }
    }

    fun getGroupNameString(): String? {
        return if (groupId is Map<*, *>) {
            groupId["name"]?.toString()
        } else null
    }

    fun getCreatedByIdString(): String? {
        return when (createdBy) {
            is String -> createdBy
            is Map<*, *> -> (createdBy["_id"] ?: createdBy["id"])?.toString()
            else -> createdBy?.toString()
        }
    }

    fun getCreatorNameString(): String? {
        return if (createdBy is Map<*, *>) {
            createdBy["name"]?.toString()
        } else null
    }
}

data class AlertDeliveryDto(
    @SerializedName("_id") val id: String? = null,
    @SerializedName("alertId") val alertId: String,
    @SerializedName("userId") val userId: Any? = null,
    @SerializedName("organizationId") val organizationId: String? = null,
    @SerializedName("status") val status: String = "DELIVERED",
    @SerializedName("deliveredAt") val deliveredAt: String? = null,
    @SerializedName("acknowledgedAt") val acknowledgedAt: String? = null
) {
    fun getUserIdString(): String {
        return when (userId) {
            is String -> userId
            is Map<*, *> -> (userId["_id"] ?: userId["id"])?.toString() ?: ""
            else -> userId?.toString() ?: ""
        }
    }

    fun getUserName(): String? {
        return if (userId is Map<*, *>) userId["name"]?.toString() else null
    }

    fun getUserEmail(): String? {
        return if (userId is Map<*, *>) userId["email"]?.toString() else null
    }
}

data class MembershipDto(
    @SerializedName("groupId") val groupId: String,
    @SerializedName("userId") val userId: String
)

// Request bodies
data class CreateUserRequest(
    val name: String,
    val email: String,
    val phone: String? = null,
    val role: String = "MEMBER",
    val organizationId: String
)

data class UpdateUserRequest(
    val name: String? = null,
    val phone: String? = null,
    val role: String? = null,
    val isActive: Boolean? = null
)

data class CreateGroupRequest(
    val name: String,
    val description: String? = null,
    val organizationId: String,
    val members: List<String> = emptyList()
)

data class UpdateGroupRequest(
    val name: String? = null,
    val description: String? = null,
    val isActive: Boolean? = null
)

data class CreateAlertRequest(
    val title: String,
    val message: String,
    val organizationId: String,
    val groupId: String,
    val scheduledAt: String,
    val repeatType: String = "ONCE",
    val priority: String = "NORMAL",
    val isEnabled: Boolean = true,
    val createdBy: String? = null
)

data class UpdateAlertRequest(
    val title: String? = null,
    val message: String? = null,
    val groupId: String? = null,
    val scheduledAt: String? = null,
    val repeatType: String? = null,
    val priority: String? = null,
    val isEnabled: Boolean? = null,
    val status: String? = null
)

data class BroadcastNowRequest(
    val title: String,
    val message: String,
    val organizationId: String,
    val groupId: String,
    val priority: String = "URGENT",
    val createdBy: String? = null
)

data class AcknowledgeRequest(
    val userId: String
)

// Background Event DTOs
data class EventDto(
    @SerializedName("_id") val id: String? = null,
    @SerializedName("eventId") val eventId: String,
    @SerializedName("organizationId") val organizationId: Any? = null,
    @SerializedName("groupId") val groupId: Any? = null,
    @SerializedName("userId") val userId: Any? = null,
    @SerializedName("type") val type: String = "ALERT",
    @SerializedName("title") val title: String,
    @SerializedName("message") val message: String,
    @SerializedName("payload") val payload: Any? = null,
    @SerializedName("priority") val priority: String = "NORMAL",
    @SerializedName("requiresReceive") val requiresReceive: Boolean = true,
    @SerializedName("status") val status: String = "SCHEDULED",
    @SerializedName("scheduledAt") val scheduledAt: String,
    @SerializedName("expiresAt") val expiresAt: String? = null,
    @SerializedName("createdAt") val createdAt: String? = null,
    @SerializedName("createdBy") val createdBy: Any? = null,
    @SerializedName("version") val version: Int = 1
) {
    fun getOrgIdString(): String {
        return when (organizationId) {
            is String -> organizationId
            is Map<*, *> -> (organizationId["_id"] ?: organizationId["id"])?.toString() ?: ""
            else -> organizationId?.toString() ?: ""
        }
    }

    fun getGroupIdString(): String? {
        return when (groupId) {
            is String -> groupId
            is Map<*, *> -> (groupId["_id"] ?: groupId["id"])?.toString()
            else -> groupId?.toString()
        }
    }

    fun getGroupNameString(): String? {
        return if (groupId is Map<*, *>) groupId["name"]?.toString() else null
    }

    fun getUserIdString(): String? {
        return when (userId) {
            is String -> userId
            is Map<*, *> -> (userId["_id"] ?: userId["id"])?.toString()
            else -> userId?.toString()
        }
    }

    fun getCreatedByIdString(): String? {
        return when (createdBy) {
            is String -> createdBy
            is Map<*, *> -> (createdBy["_id"] ?: createdBy["id"])?.toString()
            else -> createdBy?.toString()
        }
    }

    fun getCreatorNameString(): String? {
        return if (createdBy is Map<*, *>) createdBy["name"]?.toString() else null
    }

    fun payloadToString(): String {
        return when (payload) {
            null -> "{}"
            is String -> payload
            else -> com.google.gson.Gson().toJson(payload)
        }
    }
}

data class SyncEventsResponseDto(
    @SerializedName("serverTime") val serverTime: String,
    @SerializedName("version") val version: Int = 1,
    @SerializedName("events") val events: List<EventDto> = emptyList()
)

data class RegisterDeviceRequest(
    val userId: String,
    val deviceId: String,
    val installationId: String? = null,
    val pushToken: String? = null,
    val platform: String = "ANDROID",
    val appVersion: String = "1.0.0",
    val osVersion: String? = null,
    val timezone: String? = null,
    val locale: String? = null
)

data class ReceiveEventRequest(
    val userId: String?,
    val deviceId: String,
    val receivedAt: String
)

data class CreateEventRequest(
    val eventId: String? = null,
    val organizationId: String,
    val groupId: String? = null,
    val userId: String? = null,
    val type: String = "ALERT",
    val title: String,
    val message: String,
    val priority: String = "NORMAL",
    val requiresReceive: Boolean = true,
    val scheduledAt: String,
    val expiresAt: String? = null,
    val createdBy: String? = null
)

