package com.example.organizationalert.ui.theme

import android.app.Activity
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat
import com.example.organizationalert.ui.neo.NeoColorScheme
import com.example.organizationalert.ui.neo.NeoThemeProvider

@Composable
fun OrganizationAlertAppTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val neo = if (darkTheme) NeoColorScheme.dark() else NeoColorScheme.light()

    val colorScheme = if (darkTheme) {
        darkColorScheme(
            primary = neo.primary,
            onPrimary = Color.White,
            background = neo.background,
            onBackground = neo.textPrimary,
            surface = neo.surfaceRaised,
            onSurface = neo.textPrimary,
            surfaceVariant = neo.surfacePressed,
            onSurfaceVariant = neo.textSecondary,
            error = neo.danger,
            onError = Color.White
        )
    } else {
        lightColorScheme(
            primary = neo.primary,
            onPrimary = Color.White,
            background = neo.background,
            onBackground = neo.textPrimary,
            surface = neo.surfaceRaised,
            onSurface = neo.textPrimary,
            surfaceVariant = neo.surfacePressed,
            onSurfaceVariant = neo.textSecondary,
            error = neo.danger,
            onError = Color.White
        )
    }

    val view = LocalView.current
    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as Activity).window
            window.statusBarColor = neo.background.toArgb()
            window.navigationBarColor = neo.background.toArgb()
            WindowCompat.getInsetsController(window, view).isAppearanceLightStatusBars = !darkTheme
        }
    }

    NeoThemeProvider(darkTheme = darkTheme) {
        MaterialTheme(
            colorScheme = colorScheme,
            typography = Typography,
            content = content
        )
    }
}
