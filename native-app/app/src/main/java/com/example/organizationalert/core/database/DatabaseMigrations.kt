package com.example.organizationalert.core.database

import androidx.room.migration.Migration
import androidx.sqlite.db.SupportSQLiteDatabase

/**
 * v1: organizations, users, groups, alerts, alert_deliveries
 * v2: + events, ack_queue, devices (mandatory RECEIVE / offline ACK pipeline)
 */
val MIGRATION_1_2 = object : Migration(1, 2) {
    override fun migrate(db: SupportSQLiteDatabase) {
        db.execSQL(
            """
            CREATE TABLE IF NOT EXISTS `events` (
                `id` TEXT NOT NULL,
                `eventId` TEXT NOT NULL,
                `userId` TEXT,
                `organizationId` TEXT NOT NULL,
                `groupId` TEXT,
                `groupName` TEXT,
                `type` TEXT NOT NULL,
                `title` TEXT NOT NULL,
                `message` TEXT NOT NULL,
                `payload` TEXT NOT NULL,
                `priority` TEXT NOT NULL,
                `requiresReceive` INTEGER NOT NULL,
                `status` TEXT NOT NULL,
                `ackStatus` TEXT NOT NULL,
                `createdAt` INTEGER NOT NULL,
                `syncedAt` INTEGER NOT NULL,
                `scheduledAt` INTEGER NOT NULL,
                `scheduledAtUtc` INTEGER NOT NULL,
                `timezoneId` TEXT NOT NULL,
                `triggeredAt` INTEGER,
                `displayedAt` INTEGER,
                `presentedAt` INTEGER,
                `receivedAt` INTEGER,
                `acknowledgedAt` INTEGER,
                `ackConfirmedAt` INTEGER,
                `expiresAt` INTEGER,
                `retryCount` INTEGER NOT NULL,
                `lastAttemptAt` INTEGER,
                `lastError` TEXT,
                `serverVersion` INTEGER NOT NULL,
                `localVersion` INTEGER NOT NULL,
                PRIMARY KEY(`id`)
            )
            """.trimIndent()
        )
        db.execSQL("CREATE UNIQUE INDEX IF NOT EXISTS `index_events_eventId` ON `events` (`eventId`)")
        db.execSQL("CREATE INDEX IF NOT EXISTS `index_events_status_scheduledAt` ON `events` (`status`, `scheduledAt`)")
        db.execSQL("CREATE INDEX IF NOT EXISTS `index_events_ackStatus` ON `events` (`ackStatus`)")
        db.execSQL("CREATE INDEX IF NOT EXISTS `index_events_priority` ON `events` (`priority`)")
        db.execSQL("CREATE INDEX IF NOT EXISTS `index_events_organizationId` ON `events` (`organizationId`)")

        db.execSQL(
            """
            CREATE TABLE IF NOT EXISTS `ack_queue` (
                `id` INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
                `eventId` TEXT NOT NULL,
                `action` TEXT NOT NULL,
                `userId` TEXT,
                `deviceId` TEXT NOT NULL,
                `receivedAt` INTEGER NOT NULL,
                `payload` TEXT NOT NULL,
                `status` TEXT NOT NULL,
                `retryCount` INTEGER NOT NULL,
                `nextRetryAt` INTEGER NOT NULL,
                `lastAttemptAt` INTEGER,
                `lastError` TEXT,
                `createdAt` INTEGER NOT NULL
            )
            """.trimIndent()
        )
        db.execSQL("CREATE INDEX IF NOT EXISTS `index_ack_queue_eventId_status` ON `ack_queue` (`eventId`, `status`)")
        db.execSQL("CREATE INDEX IF NOT EXISTS `index_ack_queue_nextRetryAt` ON `ack_queue` (`nextRetryAt`)")

        db.execSQL(
            """
            CREATE TABLE IF NOT EXISTS `devices` (
                `deviceId` TEXT NOT NULL,
                `userId` TEXT NOT NULL,
                `installationId` TEXT NOT NULL,
                `platform` TEXT NOT NULL,
                `appVersion` TEXT NOT NULL,
                `osVersion` TEXT NOT NULL,
                `timezone` TEXT NOT NULL,
                `isRegistered` INTEGER NOT NULL,
                `lastRegisteredAt` INTEGER NOT NULL,
                PRIMARY KEY(`deviceId`)
            )
            """.trimIndent()
        )
    }
}

/**
 * v3: alarm/ringing session fields on events table
 */
val MIGRATION_2_3 = object : Migration(2, 3) {
    override fun migrate(db: SupportSQLiteDatabase) {
        db.execSQL("ALTER TABLE `events` ADD COLUMN `alarmType` TEXT NOT NULL DEFAULT 'SCHEDULED_ALARM'")
        db.execSQL("ALTER TABLE `events` ADD COLUMN `broadcasterId` TEXT")
        db.execSQL("ALTER TABLE `events` ADD COLUMN `broadcasterName` TEXT")
        db.execSQL("ALTER TABLE `events` ADD COLUMN `vibrationEnabled` INTEGER NOT NULL DEFAULT 1")
        db.execSQL("ALTER TABLE `events` ADD COLUMN `dismissedAt` INTEGER")
        db.execSQL("ALTER TABLE `events` ADD COLUMN `ringingStartedAt` INTEGER")
    }
}
