# Native Android Organization Alert & Reminder Application (Kotlin)

A modern, lightweight, responsive **native Android application in Kotlin** built for an Organization Alert, Reminder, Group, and User Management System.

Built with **Jetpack Compose, MVVM Architecture, Room Database, Retrofit, Socket.IO, Android AlarmManager, and BroadcastReceivers**.

---

## 🌟 Core Architecture & Zero-Firebase Guarantee

```text
┌─────────────────────────────────────────────────────────────┐
│                    EXPRESS.JS BACKEND                       │
│           (Source of Truth: Orgs, Users, Groups, Alerts)    │
└──────────────────────────────┬──────────────────────────────┘
                               │
               ┌───────────────┴───────────────┐
               │                               │
        REST API (GET /api/sync)       Socket.IO Real-Time
               │                               │
               └───────────────┬───────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                  NATIVE KOTLIN ANDROID APP                  │
│                                                             │
│   1. Synchronization Engine (SyncManager)                   │
│   2. Room Local Database (Offline Cache & State)            │
│   3. Alarm Reconciliation Engine (Idempotent Scheduler)     │
│   4. Android AlarmManager (Exact Alarm Registration)        │
└──────────────────────────────┬──────────────────────────────┘
                               │
            ┌──────────────────┴──────────────────┐
            ▼                                     ▼
┌───────────────────────┐             ┌───────────────────────┐
│ Android OS Triggers   │             │ Device Reboot         │
│ AlarmManager Alarm    │             │ ACTION_BOOT_COMPLETED │
└───────────┬───────────┘             └───────────┬───────────┘
            ▼                                     ▼
┌───────────────────────┐             ┌───────────────────────┐
│ AlertBroadcastReceiver│             │ BootCompletedReceiver │
│ / EventAlarmReceiver  │             │ + reconcile           │
└───────────┬───────────┘             └───────────┬───────────┘
            ▼                                     ▼
┌───────────────────────┐             ┌───────────────────────┐
│ AlarmEngine           │             │ Restore from Room     │
│ → AlarmRingingService │             │ (idempotent)          │
│ → MandatoryReceive UI │             └───────────────────────┘
└───────────┬───────────┘
            ▼
┌───────────────────────┐
│ ACK / DISMISS         │
│ AckManager + queue    │
└───────────────────────┘
```

> **Mode 1:** After sync + AlarmManager registration, scheduled execution does not require internet.  
> **Mode 2:** Socket.IO is not guaranteed to a dead process without FCM.

> **Key Architectural Principle**:
> The backend decides **WHAT** and **WHEN** the alert should happen.
> The Android device receives that schedule and becomes responsible for **executing the scheduled alert locally**.
> Once an alert has been synchronized, it fires reliably even if:
> * **Internet = OFF**
> * **App = Closed / Minimized**
> * **App = Removed from Recents**

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Language** | Kotlin 1.9+ |
| **UI Framework** | Jetpack Compose + Material 3 |
| **Architecture** | MVVM (Model-View-ViewModel) + Clean Architecture |
| **Local Database** | Android Room Database (Entities, DAOs, TypeConverters) |
| **Networking** | Retrofit 2 + OkHttp (Logging Interceptors, Timeouts) |
| **Real-Time WebSockets**| Socket.IO Java Client (`io.socket:socket.io-client:2.1.1`) |
| **Scheduling** | Android `AlarmManager` (`setExactAndAllowWhileIdle`) |
| **Execution** | `AlertBroadcastReceiver` + `BootCompletedReceiver` |
| **Notifications** | `NotificationManager` + Custom Notification Channels (Urgent, Important, Normal) |
| **Dependency Injection** | Hilt |
| **Audio & Vibration** | Bundled notification sound (`res/raw/alert_sound.mp3`) + Vibration patterns |

---

## 📱 Application Screens

1. **Splash Screen**: Checks user session and server configuration, navigates to Setup or Dashboard.
2. **Setup / Connection Screen**: Server URL input, Test connection button, Organization and User selectors, Connect & Synchronize button.
3. **Dashboard Screen**:
   - Live Connection Status pill (● Connected / ● Offline / Connecting).
   - **Next Scheduled Alert** spotlight card with countdown and scheduled time.
   - Quick action buttons: **New Alert**, **Broadcast**, **Sync Now**.
   - Today's Alerts section.
   - Upcoming Alerts section.
   - Active Groups overview.
4. **Alerts Management (`AlertsListScreen` & `AlertDetailsScreen`)**:
   - Filter chips: All, Today, Tomorrow, Upcoming, Completed, Cancelled.
   - Full Alert Details with **Acknowledge**, **Trigger Now**, **Edit**, and **Delete**.
5. **Create / Edit Alert Screen**:
   - Title, message, target group dropdown, priority selector, recurrence selector (`ONCE`, `DAILY`, `WEEKLY`), and immediate broadcast switch.
6. **Group Management (`GroupsListScreen` & `GroupDetailsScreen`)**:
   - Manage groups, view members, add participants, remove participants, view upcoming alerts.
7. **User Management (`UsersListScreen` & `UserDetailsScreen`)**:
   - Admin user management: list, create, edit user roles (`ADMIN` / `MEMBER`), view assigned groups.
8. **Settings Screen (`SettingsScreen`)**:
   - Current profile, Server URL, Notification sound toggle, Vibration toggle, **Test Notification** button, **Sync Now**, Disconnect/Switch user session.

---

## ⚡ Real-Time Socket.IO vs Local Scheduling

| Feature | Mechanism | Offline Behavior | Process Terminated Behavior |
|---|---|---|---|
| **Scheduled Alerts & Reminders** | `AlarmManager` + `AlarmEngine` | ✅ Fires locally after sync (Mode 1) | ✅ OS alarm can wake receiver (platform-limited; not force-stop) |
| **Immediate Live Broadcast** | `Socket.IO` (+ optional FCM server) | ❌ Requires live connection | ❌ **Not guaranteed** — process must be alive or FCM must wake |
| **Live Updates / Edits** | `Socket.IO` (`alert:updated`) | Reconciles upon reconnection | Reconciles upon next app launch/sync |
| **Reboot Restoration** | `BootCompletedReceiver` + `Room` | ✅ Fully restored from local Room cache | ✅ Automatically restores future alarms |

---

## 🧪 Unit & Integration Tests

The project includes unit and integration tests located in `app/src/test/java/com/example/organizationalert/`:

1. **`AlertAlarmIdGeneratorTest`**: Verifies deterministic, stable request codes and collision resistance.
2. **`RecurrenceHelperTest`**: Validates `DAILY`, `WEEKLY`, and `ONCE` calculations across timezone boundaries.
3. **`AlertReconciliationServiceTest`**: Validates idempotent reconciliation:
   - Scheduling new future alerts
   - Cancelling deleted/disabled alerts
   - Re-scheduling modified alerts
   - Preventing duplicate alarms on repeated sync runs
   - Skipping past alerts
4. **`TimezoneHelperTest`**: Validates ISO 8601 parsing, formatting, and timezone-aware conversions.

---

## 📋 Physical Device Acceptance Test Procedure

To verify on an Android device:

### Emulator (script)

From `native-app/`:

```bash
# Start emulator and wait until boot completes
./scripts/emulator-runner.sh

# Boot emulator, build, install debug APK
./scripts/emulator-runner.sh --install

# Boot, install, and launch the app
./scripts/emulator-runner.sh --launch

# Stop the running emulator
./scripts/emulator-runner.sh --stop

# Fix "adb: device offline" (reset adb + cold boot)
./scripts/emulator-runner.sh --reset --launch

# If AVD is corrupted
./scripts/emulator-runner.sh --reset --wipe-data --launch
```

Environment overrides (optional):

```bash
export ANDROID_HOME=~/Android/Sdk
export AVD_NAME=Pixel_API_34
./scripts/emulator-runner.sh --launch
```

On hosts without KVM (`/dev/kvm`), the script uses `-no-accel`. Boot can take **5–15 minutes**. `device offline` warnings during boot are normal until the emulator fully starts.

**If the emulator keeps failing**, use a **physical Android device** (recommended for production validation):

```bash
adb devices
cd native-app && ./gradlew installDebug
adb shell am start -n com.example.organizationalert/.MainActivity
```

### Manual device steps

1. **Setup**: Connect the device and configure the backend URL (`http://<YOUR_LAN_IP>:5000` or `http://10.0.2.2:5000` on emulator).
2. **Select User & Connect**: Tap **Connect & Start**. App performs atomic sync via `GET /api/sync` and registers all future alarms with `AlarmManager`.
3. **Create a Scheduled Alert**: Create an alert scheduled 2 minutes in the future.
4. **Close & Terminate**: Close the application and swipe it away from Android Recent Apps.
5. **Turn off Wi-Fi/Data (Optional)**: Disable device internet to verify offline independence.
6. **Trigger Time**: Wait for the scheduled time. Android OS triggers `AlertBroadcastReceiver` -> Notification appears with custom audio and vibration.
7. **Notification Tap**: Tap notification -> Opens `MainActivity` and navigates directly to `AlertDetailsScreen`.
