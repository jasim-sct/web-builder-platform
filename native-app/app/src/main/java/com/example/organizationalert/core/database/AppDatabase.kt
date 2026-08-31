package com.example.organizationalert.core.database

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import androidx.room.TypeConverters
import com.example.organizationalert.core.database.dao.AckQueueDao
import com.example.organizationalert.core.database.dao.AlertDao
import com.example.organizationalert.core.database.dao.AlertDeliveryDao
import com.example.organizationalert.core.database.dao.DeviceDao
import com.example.organizationalert.core.database.dao.EventDao
import com.example.organizationalert.core.database.dao.GroupDao
import com.example.organizationalert.core.database.dao.OrganizationDao
import com.example.organizationalert.core.database.dao.UserDao
import com.example.organizationalert.core.database.entity.AckQueueEntity
import com.example.organizationalert.core.database.entity.AlertDeliveryEntity
import com.example.organizationalert.core.database.entity.AlertEntity
import com.example.organizationalert.core.database.entity.DeviceRegistrationEntity
import com.example.organizationalert.core.database.entity.EventEntity
import com.example.organizationalert.core.database.entity.GroupEntity
import com.example.organizationalert.core.database.entity.OrganizationEntity
import com.example.organizationalert.core.database.entity.UserEntity

@Database(
    entities = [
        OrganizationEntity::class,
        UserEntity::class,
        GroupEntity::class,
        AlertEntity::class,
        AlertDeliveryEntity::class,
        EventEntity::class,
        AckQueueEntity::class,
        DeviceRegistrationEntity::class
    ],
    version = 3,
    exportSchema = false
)
@TypeConverters(Converters::class)
abstract class AppDatabase : RoomDatabase() {
    abstract fun organizationDao(): OrganizationDao
    abstract fun userDao(): UserDao
    abstract fun groupDao(): GroupDao
    abstract fun alertDao(): AlertDao
    abstract fun alertDeliveryDao(): AlertDeliveryDao
    abstract fun eventDao(): EventDao
    abstract fun ackQueueDao(): AckQueueDao
    abstract fun deviceDao(): DeviceDao

    companion object {
        @Volatile
        private var INSTANCE: AppDatabase? = null

        fun getInstance(context: Context): AppDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    AppDatabase::class.java,
                    "organization_alert_db"
                )
                    .addMigrations(MIGRATION_1_2, MIGRATION_2_3)
                    .build()
                INSTANCE = instance
                instance
            }
        }
    }
}
