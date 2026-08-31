package com.example.organizationalert.core.alarm

import android.content.Context
import android.os.Build
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import android.util.Log

/**
 * Dedicated alarm vibration — repeating pattern until stopped.
 */
class AlarmVibrationController(context: Context) {

    private val vibrator: Vibrator? = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
        val manager = context.getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as VibratorManager
        manager.defaultVibrator
    } else {
        @Suppress("DEPRECATION")
        context.getSystemService(Context.VIBRATOR_SERVICE) as Vibrator
    }

    @Synchronized
    fun start() {
        val vib = vibrator ?: return
        if (!vib.hasVibrator()) return

        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                val effect = VibrationEffect.createWaveform(ALARM_PATTERN, 0)
                vib.vibrate(effect)
            } else {
                @Suppress("DEPRECATION")
                vib.vibrate(ALARM_PATTERN, 0)
            }
            Log.d(TAG, "[ALARM_VIBRATION] Started alarm vibration pattern")
        } catch (e: Exception) {
            Log.e(TAG, "[ALARM_VIBRATION] Failed to start vibration", e)
        }
    }

    @Synchronized
    fun stop() {
        try {
            vibrator?.cancel()
            Log.d(TAG, "[ALARM_VIBRATION] Stopped")
        } catch (e: Exception) {
            Log.w(TAG, "[ALARM_VIBRATION] Error stopping vibration", e)
        }
    }

    companion object {
        private const val TAG = "AlarmVibrationController"
        private val ALARM_PATTERN = longArrayOf(0, 800, 400, 800, 400, 1200)
    }
}
