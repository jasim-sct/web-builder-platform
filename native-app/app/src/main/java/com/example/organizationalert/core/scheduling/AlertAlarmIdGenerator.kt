package com.example.organizationalert.core.scheduling

import java.nio.charset.StandardCharsets
import java.security.MessageDigest

/**
 * Generates deterministic, stable integer requestCodes for AlarmManager.
 * Prevents duplicate alarms and ensures exact cancellation matching.
 */
object AlertAlarmIdGenerator {

    /**
     * Generates a stable positive 31-bit integer requestCode for an alert ID.
     */
    fun generateRequestCode(alertId: String): Int {
        if (alertId.isBlank()) return 0
        try {
            val md = MessageDigest.getInstance("MD5")
            val hashBytes = md.digest(alertId.toByteArray(StandardCharsets.UTF_8))
            // Take first 4 bytes and convert to positive integer
            var result = 0
            for (i in 0 until 4) {
                result = (result shl 8) or (hashBytes[i].toInt() and 0xFF)
            }
            return result and 0x7FFFFFFF
        } catch (e: Exception) {
            return (alertId.hashCode() and 0x7FFFFFFF)
        }
    }
}
