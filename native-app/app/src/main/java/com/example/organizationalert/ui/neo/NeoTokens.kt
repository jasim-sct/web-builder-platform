package com.example.organizationalert.ui.neo

import androidx.compose.runtime.Immutable
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp

@Immutable
data class NeoColorScheme(
    val background: Color,
    val surface: Color,
    val surfaceRaised: Color,
    val surfacePressed: Color,
    val surfaceFloating: Color,
    val textPrimary: Color,
    val textSecondary: Color,
    val textMuted: Color,
    val primary: Color,
    val primaryHover: Color,
    val primaryActive: Color,
    val success: Color,
    val warning: Color,
    val danger: Color,
    val info: Color,
    val shadowLight: Color,
    val shadowDark: Color,
    val borderSubtle: Color,
    val accentIndicator: Color
) {
    companion object {
        fun light() = NeoColorScheme(
            background = Color(0xFFE8ECF3),
            surface = Color(0xFFEDF1F7),
            surfaceRaised = Color(0xFFF2F5FA),
            surfacePressed = Color(0xFFDDE3EE),
            surfaceFloating = Color(0xFFF7F9FC),
            textPrimary = Color(0xFF1E293B),
            textSecondary = Color(0xFF475569),
            textMuted = Color(0xFF64748B),
            primary = Color(0xFF4F6EF7),
            primaryHover = Color(0xFF3D5CE5),
            primaryActive = Color(0xFF334FC4),
            success = Color(0xFF10B981),
            warning = Color(0xFFF59E0B),
            danger = Color(0xFFEF4444),
            info = Color(0xFF3B82F6),
            shadowLight = Color(0xFFFFFFFF),
            shadowDark = Color(0xFFB8C4D9),
            borderSubtle = Color(0xFFD5DCE8),
            accentIndicator = Color(0xFF4F6EF7)
        )

        fun dark() = NeoColorScheme(
            background = Color(0xFF1A1F2B),
            surface = Color(0xFF222836),
            surfaceRaised = Color(0xFF2A3142),
            surfacePressed = Color(0xFF1C2230),
            surfaceFloating = Color(0xFF2E3548),
            textPrimary = Color(0xFFF1F5F9),
            textSecondary = Color(0xFFCBD5E1),
            textMuted = Color(0xFF94A3B8),
            primary = Color(0xFF6B8AFF),
            primaryHover = Color(0xFF5A79F0),
            primaryActive = Color(0xFF4A68DE),
            success = Color(0xFF34D399),
            warning = Color(0xFFFBBF24),
            danger = Color(0xFFF87171),
            info = Color(0xFF60A5FA),
            shadowLight = Color(0xFF3A4258),
            shadowDark = Color(0xFF0D1118),
            borderSubtle = Color(0xFF3A4258),
            accentIndicator = Color(0xFF6B8AFF)
        )
    }
}

@Immutable
data class NeoShadowSpec(
    val offset: Dp,
    val blur: Dp,
    val lightAlpha: Float,
    val darkAlpha: Float
)

object NeoShadows {
    val soft = NeoShadowSpec(3.dp, 8.dp, 0.55f, 0.18f)
    val medium = NeoShadowSpec(5.dp, 14.dp, 0.65f, 0.22f)
    val raised = NeoShadowSpec(7.dp, 18.dp, 0.7f, 0.28f)
    val inset = NeoShadowSpec(2.dp, 6.dp, 0.35f, 0.25f)
    val floating = NeoShadowSpec(10.dp, 28.dp, 0.75f, 0.35f)
}

val LocalNeoColors = staticCompositionLocalOf { NeoColorScheme.light() }
