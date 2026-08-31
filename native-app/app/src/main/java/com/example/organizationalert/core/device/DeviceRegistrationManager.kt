package com.example.organizationalert.core.device

import android.content.Context
import android.content.pm.PackageManager
import android.os.Build
import android.util.Log
import com.example.organizationalert.core.network.ApiClient
import com.example.organizationalert.core.network.dto.RegisterDeviceRequest
import com.example.organizationalert.core.preferences.UserPreferences
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.time.ZoneId
import java.util.Locale
import java.util.concurrent.atomic.AtomicBoolean

class DeviceRegistrationManager(
    private val context: Context,
    private val preferences: UserPreferences
) {
    private val registeredThisSession = AtomicBoolean(false)

    suspend fun registerIfNeeded() = withContext(Dispatchers.IO) {
        if (!preferences.isConfigured()) return@withContext
        if (!registeredThisSession.compareAndSet(false, true)) return@withContext

        val userId = preferences.getUserId()
        if (userId.isNullOrBlank()) {
            registeredThisSession.set(false)
            return@withContext
        }

        val request = RegisterDeviceRequest(
            userId = userId,
            deviceId = preferences.getOrCreateDeviceId(),
            platform = "ANDROID",
            appVersion = getAppVersion(),
            osVersion = Build.VERSION.RELEASE,
            timezone = ZoneId.systemDefault().id,
            locale = Locale.getDefault().toLanguageTag()
        )

        try {
            val response = ApiClient.getService(preferences.getServerUrl()).registerDevice(request)
            if (response.isSuccessful) {
                Log.d(TAG, "Device registered: deviceId=${request.deviceId}, userId=$userId")
            } else {
                Log.w(TAG, "Device registration failed: HTTP ${response.code()} ${response.message()}")
                registeredThisSession.set(false)
            }
        } catch (e: Exception) {
            Log.e(TAG, "Device registration failed", e)
            registeredThisSession.set(false)
        }
    }

    private fun getAppVersion(): String {
        return try {
            @Suppress("DEPRECATION")
            val info = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                context.packageManager.getPackageInfo(
                    context.packageName,
                    PackageManager.PackageInfoFlags.of(0)
                )
            } else {
                context.packageManager.getPackageInfo(context.packageName, 0)
            }
            info.versionName ?: "1.0.0"
        } catch (e: Exception) {
            "1.0.0"
        }
    }

    companion object {
        private const val TAG = "DeviceRegistrationManager"

        @Volatile
        private var INSTANCE: DeviceRegistrationManager? = null

        fun getInstance(context: Context, preferences: UserPreferences): DeviceRegistrationManager {
            return INSTANCE ?: synchronized(this) {
                val instance = DeviceRegistrationManager(context.applicationContext, preferences)
                INSTANCE = instance
                instance
            }
        }
    }
}
