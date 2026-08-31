package com.example.organizationalert.core.preferences

import android.content.Context
import android.content.SharedPreferences
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

class UserPreferences(context: Context) {
    private val prefs: SharedPreferences =
        context.getSharedPreferences("org_alert_prefs", Context.MODE_PRIVATE)

    private val _serverUrlFlow = MutableStateFlow(getServerUrl())
    val serverUrlFlow: StateFlow<String> = _serverUrlFlow.asStateFlow()

    private val _userIdFlow = MutableStateFlow(getUserId())
    val userIdFlow: StateFlow<String?> = _userIdFlow.asStateFlow()

    private val _orgIdFlow = MutableStateFlow(getOrganizationId())
    val orgIdFlow: StateFlow<String?> = _orgIdFlow.asStateFlow()

    private val _isConfiguredFlow = MutableStateFlow(isConfigured())
    val isConfiguredFlow: StateFlow<Boolean> = _isConfiguredFlow.asStateFlow()

    fun getServerUrl(): String = prefs.getString(KEY_SERVER_URL, DEFAULT_SERVER_URL) ?: DEFAULT_SERVER_URL

    fun setServerUrl(url: String) {
        prefs.edit().putString(KEY_SERVER_URL, url).apply()
        _serverUrlFlow.value = url
    }

    fun getUserId(): String? = prefs.getString(KEY_USER_ID, null)

    fun setUserId(userId: String?) {
        prefs.edit().putString(KEY_USER_ID, userId).apply()
        _userIdFlow.value = userId
        _isConfiguredFlow.value = isConfigured()
    }

    fun getUserName(): String = prefs.getString(KEY_USER_NAME, "User") ?: "User"

    fun setUserName(name: String) {
        prefs.edit().putString(KEY_USER_NAME, name).apply()
    }

    fun getUserEmail(): String = prefs.getString(KEY_USER_EMAIL, "") ?: ""

    fun setUserEmail(email: String) {
        prefs.edit().putString(KEY_USER_EMAIL, email).apply()
    }

    fun getUserRole(): String = prefs.getString(KEY_USER_ROLE, "MEMBER") ?: "MEMBER"

    fun setUserRole(role: String) {
        prefs.edit().putString(KEY_USER_ROLE, role).apply()
    }

    fun getOrganizationId(): String? = prefs.getString(KEY_ORG_ID, null)

    fun setOrganizationId(orgId: String?) {
        prefs.edit().putString(KEY_ORG_ID, orgId).apply()
        _orgIdFlow.value = orgId
        _isConfiguredFlow.value = isConfigured()
    }

    fun getOrganizationName(): String = prefs.getString(KEY_ORG_NAME, "Organization") ?: "Organization"

    fun setOrganizationName(name: String) {
        prefs.edit().putString(KEY_ORG_NAME, name).apply()
    }

    fun isSoundEnabled(): Boolean = prefs.getBoolean(KEY_SOUND_ENABLED, true)

    fun setSoundEnabled(enabled: Boolean) {
        prefs.edit().putBoolean(KEY_SOUND_ENABLED, enabled).apply()
    }

    fun isVibrationEnabled(): Boolean = prefs.getBoolean(KEY_VIBRATION_ENABLED, true)

    fun setVibrationEnabled(enabled: Boolean) {
        prefs.edit().putBoolean(KEY_VIBRATION_ENABLED, enabled).apply()
    }

    fun getLastSyncTime(): Long = prefs.getLong(KEY_LAST_SYNC_TIME, 0L)

    fun setLastSyncTime(timestamp: Long) {
        prefs.edit().putLong(KEY_LAST_SYNC_TIME, timestamp).apply()
    }

    fun getOrCreateDeviceId(): String {
        val existing = prefs.getString(KEY_DEVICE_ID, null)
        if (!existing.isNullOrBlank()) return existing
        val generated = "android_${java.util.UUID.randomUUID()}"
        prefs.edit().putString(KEY_DEVICE_ID, generated).apply()
        return generated
    }

    fun isConfigured(): Boolean {
        return !getUserId().isNullOrBlank() && !getOrganizationId().isNullOrBlank()
    }

    fun clearSession() {
        prefs.edit()
            .remove(KEY_USER_ID)
            .remove(KEY_USER_NAME)
            .remove(KEY_USER_EMAIL)
            .remove(KEY_USER_ROLE)
            .remove(KEY_ORG_ID)
            .remove(KEY_ORG_NAME)
            .remove(KEY_LAST_SYNC_TIME)
            .apply()
        _userIdFlow.value = null
        _orgIdFlow.value = null
        _isConfiguredFlow.value = false
    }

    companion object {
        const val DEFAULT_SERVER_URL = "http://10.0.2.2:5000"
        private const val KEY_SERVER_URL = "server_url"
        private const val KEY_USER_ID = "user_id"
        private const val KEY_USER_NAME = "user_name"
        private const val KEY_USER_EMAIL = "user_email"
        private const val KEY_USER_ROLE = "user_role"
        private const val KEY_ORG_ID = "org_id"
        private const val KEY_ORG_NAME = "org_name"
        private const val KEY_SOUND_ENABLED = "sound_enabled"
        private const val KEY_VIBRATION_ENABLED = "vibration_enabled"
        private const val KEY_LAST_SYNC_TIME = "last_sync_time"
        private const val KEY_DEVICE_ID = "device_id"

        @Volatile
        private var INSTANCE: UserPreferences? = null

        fun getInstance(context: Context): UserPreferences {
            return INSTANCE ?: synchronized(this) {
                val instance = UserPreferences(context.applicationContext)
                INSTANCE = instance
                instance
            }
        }
    }
}
