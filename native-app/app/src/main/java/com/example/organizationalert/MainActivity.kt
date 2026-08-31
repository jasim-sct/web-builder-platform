package com.example.organizationalert

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import android.util.Log
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.core.content.ContextCompat
import androidx.navigation.compose.rememberNavController
import com.example.organizationalert.core.notifications.NotificationHelper
import com.example.organizationalert.core.preferences.UserPreferences
import com.example.organizationalert.ui.navigation.AppNavigation
import com.example.organizationalert.ui.theme.OrganizationAlertAppTheme
import dagger.hilt.android.AndroidEntryPoint
import javax.inject.Inject

@AndroidEntryPoint
class MainActivity : ComponentActivity() {

    @Inject
    lateinit var preferences: UserPreferences

    private val requestNotificationPermissionLauncher =
        registerForActivityResult(ActivityResultContracts.RequestPermission()) { isGranted: Boolean ->
            if (isGranted) {
                Log.d(TAG, "Notification permission granted by user")
            } else {
                Log.w(TAG, "Notification permission denied by user")
            }
        }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        checkAndRequestNotificationPermissions()

        val alertIdFromIntent = extractAlertId(intent)

        setContent {
            OrganizationAlertAppTheme {
                val navController = rememberNavController()
                AppNavigation(
                    navController = navController,
                    preferences = preferences,
                    initialAlertId = alertIdFromIntent
                )
            }
        }
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        setIntent(intent)
        val alertId = extractAlertId(intent)
        if (!alertId.isNullOrBlank()) {
            setContent {
                OrganizationAlertAppTheme {
                    val navController = rememberNavController()
                    AppNavigation(
                        navController = navController,
                        preferences = preferences,
                        initialAlertId = alertId
                    )
                }
            }
        }
    }

    private fun extractAlertId(intent: Intent?): String? {
        return intent?.getStringExtra(NotificationHelper.EXTRA_ALERT_ID)
    }

    private fun checkAndRequestNotificationPermissions() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            val permissionStatus = ContextCompat.checkSelfPermission(
                this,
                Manifest.permission.POST_NOTIFICATIONS
            )
            if (permissionStatus != PackageManager.PERMISSION_GRANTED) {
                requestNotificationPermissionLauncher.launch(Manifest.permission.POST_NOTIFICATIONS)
            }
        }
    }

    companion object {
        private const val TAG = "MainActivity"
    }
}
