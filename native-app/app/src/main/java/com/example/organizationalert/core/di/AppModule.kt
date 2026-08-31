package com.example.organizationalert.core.di

import android.content.Context
import com.example.organizationalert.core.database.AppDatabase
import com.example.organizationalert.core.notifications.NotificationHelper
import com.example.organizationalert.core.preferences.UserPreferences
import com.example.organizationalert.core.scheduling.AlertReconciliationService
import com.example.organizationalert.core.scheduling.AlertScheduler
import com.example.organizationalert.core.socket.SocketManager
import com.example.organizationalert.core.sync.SyncManager
import com.example.organizationalert.data.repository.AlertRepository
import com.example.organizationalert.data.repository.GroupRepository
import com.example.organizationalert.data.repository.UserRepository
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object AppModule {

    @Provides
    @Singleton
    fun provideAppDatabase(@ApplicationContext context: Context): AppDatabase {
        return AppDatabase.getInstance(context)
    }

    @Provides
    @Singleton
    fun provideUserPreferences(@ApplicationContext context: Context): UserPreferences {
        return UserPreferences.getInstance(context)
    }

    @Provides
    @Singleton
    fun provideNotificationHelper(@ApplicationContext context: Context): NotificationHelper {
        return NotificationHelper.getInstance(context)
    }

    @Provides
    @Singleton
    fun provideAlertScheduler(@ApplicationContext context: Context): AlertScheduler {
        return AlertScheduler.getInstance(context)
    }

    @Provides
    @Singleton
    fun provideAlertReconciliationService(scheduler: AlertScheduler): AlertReconciliationService {
        return AlertReconciliationService(scheduler)
    }

    @Provides
    @Singleton
    fun provideSyncManager(
        database: AppDatabase,
        preferences: UserPreferences,
        scheduler: AlertScheduler,
        reconciliationService: AlertReconciliationService
    ): SyncManager {
        return SyncManager.getInstance(database, preferences, scheduler, reconciliationService)
    }

    @Provides
    @Singleton
    fun providePresentationEngine(
        @ApplicationContext context: Context,
        database: AppDatabase
    ): com.example.organizationalert.core.presentation.PresentationEngine {
        return com.example.organizationalert.core.presentation.PresentationEngine.getInstance(context, database)
    }

    @Provides
    @Singleton
    fun provideSocketManager(
        preferences: UserPreferences,
        presentationEngine: com.example.organizationalert.core.presentation.PresentationEngine,
        syncManager: SyncManager
    ): SocketManager {
        return SocketManager.getInstance(preferences, presentationEngine) {
            CoroutineScope(Dispatchers.IO).launch {
                syncManager.performFullSync()
            }
        }
    }

    @Provides
    @Singleton
    fun provideAlertRepository(
        database: AppDatabase,
        preferences: UserPreferences,
        scheduler: AlertScheduler,
        socketManager: SocketManager
    ): AlertRepository {
        return AlertRepository(database, preferences, scheduler, socketManager)
    }

    @Provides
    @Singleton
    fun provideGroupRepository(
        database: AppDatabase,
        preferences: UserPreferences
    ): GroupRepository {
        return GroupRepository(database, preferences)
    }

    @Provides
    @Singleton
    fun provideUserRepository(
        database: AppDatabase,
        preferences: UserPreferences
    ): UserRepository {
        return UserRepository(database, preferences)
    }

    @Provides
    @Singleton
    fun provideEventAlarmScheduler(@ApplicationContext context: Context): com.example.organizationalert.core.scheduling.EventAlarmScheduler {
        return com.example.organizationalert.core.scheduling.EventAlarmScheduler.getInstance(context)
    }

    @Provides
    @Singleton
    fun provideAckManager(
        @ApplicationContext context: Context,
        database: AppDatabase,
        preferences: UserPreferences
    ): com.example.organizationalert.core.ack.AckManager {
        return com.example.organizationalert.core.ack.AckManager.getInstance(context, database, preferences)
    }
}

