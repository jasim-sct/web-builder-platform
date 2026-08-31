package com.example.organizationalert.core.database

import androidx.room.TypeConverter
import com.example.organizationalert.domain.model.AlarmType
import com.example.organizationalert.domain.model.AlertStatus
import com.example.organizationalert.domain.model.DeliveryStatus
import com.example.organizationalert.domain.model.Priority
import com.example.organizationalert.domain.model.RepeatType
import com.example.organizationalert.domain.model.UserRole
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import java.time.Instant

class Converters {
    private val gson = Gson()

    @TypeConverter
    fun fromTimestamp(value: Long?): Instant? {
        return value?.let { Instant.ofEpochMilli(it) }
    }

    @TypeConverter
    fun dateToTimestamp(instant: Instant?): Long? {
        return instant?.toEpochMilli()
    }

    @TypeConverter
    fun fromStringList(value: String?): List<String> {
        if (value.isNullOrEmpty()) return emptyList()
        val listType = object : TypeToken<List<String>>() {}.type
        return gson.fromJson(value, listType) ?: emptyList()
    }

    @TypeConverter
    fun toStringList(list: List<String>?): String {
        return gson.toJson(list ?: emptyList<String>())
    }

    @TypeConverter
    fun fromPriority(value: String?): Priority = Priority.fromString(value)

    @TypeConverter
    fun toPriority(priority: Priority?): String = (priority ?: Priority.NORMAL).name

    @TypeConverter
    fun fromRepeatType(value: String?): RepeatType = RepeatType.fromString(value)

    @TypeConverter
    fun toRepeatType(repeatType: RepeatType?): String = (repeatType ?: RepeatType.ONCE).name

    @TypeConverter
    fun fromAlertStatus(value: String?): AlertStatus = AlertStatus.fromString(value)

    @TypeConverter
    fun toAlertStatus(status: AlertStatus?): String = (status ?: AlertStatus.SCHEDULED).name

    @TypeConverter
    fun fromUserRole(value: String?): UserRole = UserRole.fromString(value)

    @TypeConverter
    fun toUserRole(role: UserRole?): String = (role ?: UserRole.MEMBER).name

    @TypeConverter
    fun fromDeliveryStatus(value: String?): DeliveryStatus = DeliveryStatus.fromString(value)

    @TypeConverter
    fun toDeliveryStatus(status: DeliveryStatus?): String = (status ?: DeliveryStatus.DELIVERED).name

    @TypeConverter
    fun fromEventStatus(value: String?): com.example.organizationalert.core.database.entity.EventStatus =
        com.example.organizationalert.core.database.entity.EventStatus.fromString(value)

    @TypeConverter
    fun toEventStatus(status: com.example.organizationalert.core.database.entity.EventStatus?): String =
        (status ?: com.example.organizationalert.core.database.entity.EventStatus.SCHEDULED).name

    @TypeConverter
    fun fromQueueStatus(value: String?): com.example.organizationalert.core.database.entity.QueueStatus =
        com.example.organizationalert.core.database.entity.QueueStatus.fromString(value)

    @TypeConverter
    fun toQueueStatus(status: com.example.organizationalert.core.database.entity.QueueStatus?): String =
        (status ?: com.example.organizationalert.core.database.entity.QueueStatus.PENDING).name

    @TypeConverter
    fun fromAckStatus(value: String?): com.example.organizationalert.core.database.entity.AckStatus =
        com.example.organizationalert.core.database.entity.AckStatus.fromString(value)

    @TypeConverter
    fun toAckStatus(status: com.example.organizationalert.core.database.entity.AckStatus?): String =
        (status ?: com.example.organizationalert.core.database.entity.AckStatus.PENDING).name

    @TypeConverter
    fun fromAlarmType(value: String?): AlarmType = AlarmType.fromString(value)

    @TypeConverter
    fun toAlarmType(alarmType: AlarmType?): String = (alarmType ?: AlarmType.SCHEDULED_ALARM).name
}


