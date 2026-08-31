# Proguard rules for Room, Retrofit, Socket.IO, Coroutines
-keepclassmembers class * extends androidx.room.RoomDatabase {
    <init>();
}
-keep class * extends androidx.room.RoomDatabase
-dontwarn io.socket.**
-keep class io.socket.** { *; }
