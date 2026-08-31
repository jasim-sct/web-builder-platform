package com.example.organizationalert.ui.neo

import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.composed
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp

fun Modifier.neoRaised(
    cornerRadius: Dp = 16.dp,
    spec: NeoShadowSpec = NeoShadows.medium,
    fillColor: Color? = null
): Modifier = composed {
    val neo = LocalNeoColors.current
    val bg = fillColor ?: neo.surfaceRaised
    val density = LocalDensity.current
    val r = with(density) { cornerRadius.toPx() }
    val off = with(density) { spec.offset.toPx() }
    val blur = with(density) { spec.blur.toPx() }

    this
        .clip(RoundedCornerShape(cornerRadius))
        .drawBehind {
            drawRoundRect(
                color = neo.shadowDark.copy(alpha = spec.darkAlpha),
                topLeft = Offset(off * 0.6f, off * 0.6f),
                size = Size(size.width, size.height),
                cornerRadius = CornerRadius(r)
            )
            drawRoundRect(
                color = neo.shadowLight.copy(alpha = spec.lightAlpha),
                topLeft = Offset(-off * 0.35f, -off * 0.35f),
                size = Size(size.width, size.height),
                cornerRadius = CornerRadius(r)
            )
            drawRoundRect(
                color = bg,
                size = Size(size.width, size.height),
                cornerRadius = CornerRadius(r)
            )
        }
}

fun Modifier.neoInset(
    cornerRadius: Dp = 12.dp,
    fillColor: Color? = null
): Modifier = composed {
    val neo = LocalNeoColors.current
    val bg = fillColor ?: neo.surfacePressed
    val density = LocalDensity.current
    val r = with(density) { cornerRadius.toPx() }

    this
        .clip(RoundedCornerShape(cornerRadius))
        .drawBehind {
            drawRoundRect(
                color = bg,
                size = Size(size.width, size.height),
                cornerRadius = CornerRadius(r)
            )
            drawRoundRect(
                color = neo.shadowDark.copy(alpha = 0.2f),
                size = Size(size.width, size.height),
                cornerRadius = CornerRadius(r),
                style = Stroke(width = 1.2f)
            )
            drawRoundRect(
                color = neo.shadowLight.copy(alpha = 0.35f),
                topLeft = Offset(1f, 1f),
                size = Size(size.width - 2f, size.height - 2f),
                cornerRadius = CornerRadius(r - 1f),
                style = Stroke(width = 1f)
            )
        }
}

fun Modifier.neoFloating(cornerRadius: Dp = 20.dp): Modifier = composed {
    neoRaised(
        cornerRadius = cornerRadius,
        spec = NeoShadows.floating,
        fillColor = LocalNeoColors.current.surfaceFloating
    )
}

@Composable
fun neoBackgroundColor(): Color = LocalNeoColors.current.background
