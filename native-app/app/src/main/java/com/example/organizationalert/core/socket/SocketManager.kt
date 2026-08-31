package com.example.organizationalert.core.socket

import android.util.Log
import com.example.organizationalert.core.network.ApiClient
import com.example.organizationalert.core.presentation.PresentationEngine
import com.example.organizationalert.core.preferences.UserPreferences
import com.example.organizationalert.domain.model.Priority
import io.socket.client.IO
import io.socket.client.Socket
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import org.json.JSONObject

enum class SocketConnectionState {
    DISCONNECTED,
    CONNECTING,
    CONNECTED,
    ERROR
}

class SocketManager(
    private val preferences: UserPreferences,
    private val presentationEngine: PresentationEngine,
    private val onSyncTriggerRequested: () -> Unit
) {
    private var socket: Socket? = null
    private val scope = CoroutineScope(Dispatchers.IO)

    private val _connectionState = MutableStateFlow(SocketConnectionState.DISCONNECTED)
    val connectionState: StateFlow<SocketConnectionState> = _connectionState.asStateFlow()

    fun connect() {
        val serverUrl = preferences.getServerUrl()
        val userId = preferences.getUserId()

        if (userId.isNullOrBlank()) {
            Log.d(TAG, "[SOCKET] Cannot connect: User not configured")
            return
        }

        try {
            disconnect()

            val cleanUrl = ApiClient.getCleanSocketUrl(serverUrl)
            val opts = IO.Options().apply {
                reconnection = true
                reconnectionAttempts = Int.MAX_VALUE
                reconnectionDelay = 1000
                reconnectionDelayMax = 5000
                timeout = 10000
                transports = arrayOf("websocket", "polling")
            }

            Log.d(TAG, "[SOCKET] Connecting to $cleanUrl for user $userId")
            _connectionState.value = SocketConnectionState.CONNECTING

            socket = IO.socket(cleanUrl, opts).apply {
                on(Socket.EVENT_CONNECT) {
                    Log.d(TAG, "[SOCKET] Connected! Emitting identify...")
                    _connectionState.value = SocketConnectionState.CONNECTED
                    emitIdentify(userId)
                }

                on(Socket.EVENT_DISCONNECT) {
                    Log.d(TAG, "[SOCKET] Disconnected")
                    _connectionState.value = SocketConnectionState.DISCONNECTED
                }

                on(Socket.EVENT_CONNECT_ERROR) { args ->
                    val err = args.getOrNull(0)?.toString() ?: "Unknown error"
                    Log.e(TAG, "[SOCKET] Connection error: $err")
                    _connectionState.value = SocketConnectionState.ERROR
                }

                on("identified") { args ->
                    Log.d(TAG, "[SOCKET] Identify acknowledged by backend: ${args.getOrNull(0)}")
                }

                // 1. Live broadcast alert event
                on("alert:broadcast") { args ->
                    handleIncomingAlert(args, isImmediateBroadcast = true)
                }

                // 2. Alert triggered event (from scheduler/manual trigger)
                on("alert:triggered") { args ->
                    handleIncomingAlert(args, isImmediateBroadcast = false)
                }

                // 3. Alert updated event
                on("alert:updated") { args ->
                    Log.d(TAG, "[SOCKET] Alert updated event received: ${args.getOrNull(0)}")
                    scope.launch {
                        onSyncTriggerRequested()
                    }
                }

                // 4. Group / membership changed
                on("group:updated") { args ->
                    Log.d(TAG, "[SOCKET] Group updated event received: ${args.getOrNull(0)}")
                    scope.launch {
                        onSyncTriggerRequested()
                    }
                }

                connect()
            }
        } catch (e: Exception) {
            Log.e(TAG, "[SOCKET] Failed to initialize socket", e)
            _connectionState.value = SocketConnectionState.ERROR
        }
    }

    private fun emitIdentify(userId: String) {
        try {
            val json = JSONObject().apply {
                put("userId", userId)
            }
            socket?.emit("identify", json)
            Log.d(TAG, "[SOCKET] Emitted identify payload: $json")
        } catch (e: Exception) {
            Log.e(TAG, "[SOCKET] Failed to emit identify", e)
        }
    }

    private fun handleIncomingAlert(args: Array<Any>, isImmediateBroadcast: Boolean) {
        try {
            val payload = args.getOrNull(0) ?: return
            Log.d(TAG, "[SOCKET] Received alert payload: $payload (isImmediate=$isImmediateBroadcast)")

            val json = when (payload) {
                is JSONObject -> payload
                is String -> JSONObject(payload)
                else -> JSONObject(payload.toString())
            }

            val alertId = json.optString("alertId", json.optString("id", ""))
            val title = json.optString("title", "Incoming Alarm")
            val message = json.optString("message", "")
            val priorityStr = json.optString("priority", "NORMAL")
            val priority = Priority.fromString(priorityStr)
            val groupId = json.optString("groupId", null)?.takeIf { it.isNotBlank() }
            val groupName = json.optString("groupName", null)?.takeIf { it.isNotBlank() }
            val broadcasterId = json.optString("createdBy", json.optString("broadcasterId", null))
                ?.takeIf { it.isNotBlank() }
            val broadcasterName = json.optString("creatorName", json.optString("broadcasterName", null))
                ?.takeIf { it.isNotBlank() }
            val recipientUserIds = json.optJSONArray("recipientUserIds")?.let { arr ->
                (0 until arr.length()).mapNotNull { i -> arr.optString(i).takeIf { it.isNotBlank() } }
            }?.takeIf { it.isNotEmpty() }

            if (isImmediateBroadcast) {
                presentationEngine.presentImmediateAlarm(
                    sessionId = alertId.ifBlank { "broadcast_${System.currentTimeMillis()}" },
                    title = title,
                    message = message,
                    priority = priority,
                    groupId = groupId,
                    groupName = groupName,
                    broadcasterId = broadcasterId,
                    broadcasterName = broadcasterName,
                    recipientUserIds = recipientUserIds
                )
            }

            // Trigger sync to update local Room cache and reconcile alarms
            scope.launch {
                onSyncTriggerRequested()
            }
        } catch (e: Exception) {
            Log.e(TAG, "[SOCKET] Error processing incoming alert", e)
        }
    }

    fun acknowledgeAlert(alertId: String, userId: String) {
        try {
            val json = JSONObject().apply {
                put("alertId", alertId)
                put("userId", userId)
            }
            socket?.emit("alert:acknowledge", json)
            Log.d(TAG, "[SOCKET] Emitted alert:acknowledge: $json")
        } catch (e: Exception) {
            Log.e(TAG, "[SOCKET] Error emitting alert:acknowledge", e)
        }
    }

    fun disconnect() {
        try {
            socket?.disconnect()
            socket?.off()
            socket = null
            _connectionState.value = SocketConnectionState.DISCONNECTED
        } catch (e: Exception) {
            Log.e(TAG, "[SOCKET] Error disconnecting", e)
        }
    }

    companion object {
        private const val TAG = "SocketManager"

        @Volatile
        private var INSTANCE: SocketManager? = null

        fun getInstance(
            preferences: UserPreferences,
            presentationEngine: PresentationEngine,
            onSyncTriggerRequested: () -> Unit
        ): SocketManager {
            return INSTANCE ?: synchronized(this) {
                val instance = SocketManager(preferences, presentationEngine, onSyncTriggerRequested)
                INSTANCE = instance
                instance
            }
        }
    }
}
