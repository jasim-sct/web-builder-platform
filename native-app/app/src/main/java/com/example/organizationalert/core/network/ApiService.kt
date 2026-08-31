package com.example.organizationalert.core.network

import com.example.organizationalert.core.network.dto.AcknowledgeRequest
import com.example.organizationalert.core.network.dto.AlertDeliveryDto
import com.example.organizationalert.core.network.dto.AlertDto
import com.example.organizationalert.core.network.dto.ApiResponseDto
import com.example.organizationalert.core.network.dto.BroadcastNowRequest
import com.example.organizationalert.core.network.dto.CreateAlertRequest
import com.example.organizationalert.core.network.dto.CreateGroupRequest
import com.example.organizationalert.core.network.dto.CreateUserRequest
import com.example.organizationalert.core.network.dto.GroupDto
import com.example.organizationalert.core.network.dto.OrganizationDto
import com.example.organizationalert.core.network.dto.SyncResponseDto
import com.example.organizationalert.core.network.dto.UpdateAlertRequest
import com.example.organizationalert.core.network.dto.UpdateGroupRequest
import com.example.organizationalert.core.network.dto.UpdateUserRequest
import com.example.organizationalert.core.network.dto.UserDto
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.DELETE
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.PUT
import retrofit2.http.Path
import retrofit2.http.Query

interface ApiService {

    // Health
    @GET("/api/health")
    suspend fun checkHealth(): Response<ApiResponseDto<Map<String, Any>>>

    // Sync
    @GET("/api/sync")
    suspend fun getSyncData(
        @Query("userId") userId: String? = null,
        @Query("organizationId") organizationId: String? = null
    ): Response<ApiResponseDto<SyncResponseDto>>

    // Organizations
    @GET("/api/organizations")
    suspend fun getOrganizations(
        @Query("isActive") isActive: Boolean? = null
    ): Response<ApiResponseDto<List<OrganizationDto>>>

    @GET("/api/organizations/{id}")
    suspend fun getOrganizationById(
        @Path("id") id: String
    ): Response<ApiResponseDto<OrganizationDto>>

    @POST("/api/organizations")
    suspend fun createOrganization(
        @Body body: Map<String, String>
    ): Response<ApiResponseDto<OrganizationDto>>

    // Users
    @GET("/api/users")
    suspend fun getUsers(
        @Query("organizationId") organizationId: String? = null,
        @Query("role") role: String? = null,
        @Query("isActive") isActive: Boolean? = null
    ): Response<ApiResponseDto<List<UserDto>>>

    @GET("/api/users/{id}")
    suspend fun getUserById(
        @Path("id") id: String
    ): Response<ApiResponseDto<UserDto>>

    @POST("/api/users")
    suspend fun createUser(
        @Body request: CreateUserRequest
    ): Response<ApiResponseDto<UserDto>>

    @PUT("/api/users/{id}")
    suspend fun updateUser(
        @Path("id") id: String,
        @Body request: UpdateUserRequest
    ): Response<ApiResponseDto<UserDto>>

    @DELETE("/api/users/{id}")
    suspend fun deleteUser(
        @Path("id") id: String
    ): Response<ApiResponseDto<Map<String, Any>>>

    // Groups
    @GET("/api/groups")
    suspend fun getGroups(
        @Query("organizationId") organizationId: String? = null,
        @Query("isActive") isActive: Boolean? = null
    ): Response<ApiResponseDto<List<GroupDto>>>

    @GET("/api/groups/{id}")
    suspend fun getGroupById(
        @Path("id") id: String
    ): Response<ApiResponseDto<GroupDto>>

    @POST("/api/groups")
    suspend fun createGroup(
        @Body request: CreateGroupRequest
    ): Response<ApiResponseDto<GroupDto>>

    @PUT("/api/groups/{id}")
    suspend fun updateGroup(
        @Path("id") id: String,
        @Body request: UpdateGroupRequest
    ): Response<ApiResponseDto<GroupDto>>

    @DELETE("/api/groups/{id}")
    suspend fun deleteGroup(
        @Path("id") id: String
    ): Response<ApiResponseDto<Map<String, Any>>>

    @POST("/api/groups/{id}/members/{userId}")
    suspend fun addMember(
        @Path("id") groupId: String,
        @Path("userId") userId: String
    ): Response<ApiResponseDto<GroupDto>>

    @DELETE("/api/groups/{id}/members/{userId}")
    suspend fun removeMember(
        @Path("id") groupId: String,
        @Path("userId") userId: String
    ): Response<ApiResponseDto<GroupDto>>

    // Alerts
    @GET("/api/alerts")
    suspend fun getAlerts(
        @Query("organizationId") organizationId: String? = null,
        @Query("groupId") groupId: String? = null,
        @Query("status") status: String? = null,
        @Query("priority") priority: String? = null
    ): Response<ApiResponseDto<List<AlertDto>>>

    @GET("/api/alerts/upcoming")
    suspend fun getUpcomingAlerts(
        @Query("organizationId") organizationId: String? = null,
        @Query("groupId") groupId: String? = null
    ): Response<ApiResponseDto<List<AlertDto>>>

    @GET("/api/alerts/history")
    suspend fun getAlertHistory(
        @Query("organizationId") organizationId: String? = null,
        @Query("groupId") groupId: String? = null
    ): Response<ApiResponseDto<List<AlertDto>>>

    @GET("/api/alerts/{id}")
    suspend fun getAlertById(
        @Path("id") id: String
    ): Response<ApiResponseDto<AlertDto>>

    @POST("/api/alerts")
    suspend fun createAlert(
        @Body request: CreateAlertRequest
    ): Response<ApiResponseDto<AlertDto>>

    @PUT("/api/alerts/{id}")
    suspend fun updateAlert(
        @Path("id") id: String,
        @Body request: UpdateAlertRequest
    ): Response<ApiResponseDto<AlertDto>>

    @DELETE("/api/alerts/{id}")
    suspend fun deleteAlert(
        @Path("id") id: String
    ): Response<ApiResponseDto<Map<String, Any>>>

    @POST("/api/alerts/{id}/enable")
    suspend fun enableAlert(
        @Path("id") id: String
    ): Response<ApiResponseDto<AlertDto>>

    @POST("/api/alerts/{id}/disable")
    suspend fun disableAlert(
        @Path("id") id: String
    ): Response<ApiResponseDto<AlertDto>>

    @POST("/api/alerts/{id}/trigger")
    suspend fun triggerAlert(
        @Path("id") id: String
    ): Response<ApiResponseDto<Map<String, Any>>>

    @POST("/api/alerts/broadcast")
    suspend fun broadcastNow(
        @Body request: BroadcastNowRequest
    ): Response<ApiResponseDto<Map<String, Any>>>

    @POST("/api/alerts/{id}/acknowledge")
    suspend fun acknowledgeAlert(
        @Path("id") id: String,
        @Body request: AcknowledgeRequest
    ): Response<ApiResponseDto<AlertDeliveryDto>>

    @POST("/api/alerts/{id}/dismiss")
    suspend fun dismissAlert(
        @Path("id") id: String,
        @Body request: AcknowledgeRequest
    ): Response<ApiResponseDto<AlertDeliveryDto>>

    @GET("/api/alerts/{id}/deliveries")
    suspend fun getAlertDeliveries(
        @Path("id") id: String
    ): Response<ApiResponseDto<List<AlertDeliveryDto>>>

    // Device Management
    @POST("/api/devices/register")
    suspend fun registerDevice(
        @Body request: com.example.organizationalert.core.network.dto.RegisterDeviceRequest
    ): Response<ApiResponseDto<Map<String, Any>>>

    @POST("/api/devices/{id}/heartbeat")
    suspend fun sendDeviceHeartbeat(
        @Path("id") id: String
    ): Response<ApiResponseDto<Map<String, Any>>>

    // Background Event Synchronization & Receipt
    @GET("/api/events/sync")
    suspend fun syncEvents(
        @Query("userId") userId: String? = null,
        @Query("organizationId") organizationId: String? = null,
        @Query("deviceId") deviceId: String? = null
    ): Response<ApiResponseDto<com.example.organizationalert.core.network.dto.SyncEventsResponseDto>>

    @POST("/api/events")
    suspend fun createEvent(
        @Body request: com.example.organizationalert.core.network.dto.CreateEventRequest
    ): Response<ApiResponseDto<com.example.organizationalert.core.network.dto.EventDto>>

    @POST("/api/events/{id}/receive")
    suspend fun receiveEvent(
        @Path("id") id: String,
        @Body request: com.example.organizationalert.core.network.dto.ReceiveEventRequest
    ): Response<ApiResponseDto<com.example.organizationalert.core.network.dto.EventDto>>

    @POST("/api/events/{id}/dismiss")
    suspend fun dismissEvent(
        @Path("id") id: String,
        @Body request: com.example.organizationalert.core.network.dto.ReceiveEventRequest
    ): Response<ApiResponseDto<com.example.organizationalert.core.network.dto.EventDto>>
}

