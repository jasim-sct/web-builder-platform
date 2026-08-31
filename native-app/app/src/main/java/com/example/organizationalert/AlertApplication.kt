package com.example.organizationalert

import android.app.Application
import android.util.Log
import com.example.organizationalert.core.device.DeviceRegistrationManager
import com.example.organizationalert.core.notifications.NotificationHelper
import com.example.organizationalert.core.preferences.UserPreferences
import com.example.organizationalert.core.socket.SocketManager
import com.example.organizationalert.core.sync.SyncManager
import dagger.hilt.android.HiltAndroidApp
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltAndroidApp
class AlertApplication : Application() {

    @Inject
    lateinit var notificationHelper: NotificationHelper

    @Inject
    lateinit var userPreferences: UserPreferences

    @Inject
    lateinit var socketManager: SocketManager

    @Inject
    lateinit var syncManager: SyncManager

    @Inject
    lateinit var deviceRegistrationManager: DeviceRegistrationManager

    override fun onCreate() {
        super.onCreate()
        Log.d(TAG, "Initializing Organization Alert Application...")

        // Create notification channels
        notificationHelper.createNotificationChannels()

        // If user session exists, start Socket.IO and trigger initial background sync
        if (userPreferences.isConfigured()) {
            socketManager.connect()
            CoroutineScope(Dispatchers.IO).launch {
                try {
                    deviceRegistrationManager.registerIfNeeded()
                } catch (e: Exception) {
                    Log.w(TAG, "Device registration failed during app startup (non-fatal)", e)
                }
                try {
                    syncManager.performFullSync()
                } catch (e: Exception) {
                    Log.e(TAG, "Initial sync failed during app startup", e)
                }
            }
        }
    }

    companion object {
        private const val TAG = "AlertApplication"
    }
}
