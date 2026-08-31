# ANDROID_PERMISSION_MATRIX: Background Execution & Permissions

**Target Platforms:** Android 12 (API 31), Android 13 (API 33), Android 14 (API 34), Android 15 (API 35)  

---

## 📋 Comprehensive Permission Matrix

| Permission | API Introduced | Protection Level | Purpose | If Granted | If Denied / Revoked | Fallback / Mitigation |
|---|---|---|---|---|---|---|
| `POST_NOTIFICATIONS` | API 33 (Android 13) | Runtime (`dangerous`) | Display notifications, heads-up banners, and channel alerts. | Full notification display with sound & vibration. | Notifications suppressed by OS. | Diagnostic flags `NOTIFICATION_BLOCKED`. App guides user to Settings. |
| `SCHEDULE_EXACT_ALARM` | API 31 (Android 12) | Normal / AppOps | Request exact alarm delivery via `AlarmManager`. | Exact wakeup at scheduled instant. | OS may delay alarm delivery to maintenance window. | Fallback to `setAndAllowWhileIdle()`. Listen to `ACTION_SCHEDULE_EXACT_ALARM_PERMISSION_STATE_CHANGED`. |
| `USE_EXACT_ALARM` | API 33 (Android 13) | Normal | Auto-granted exact alarm capability for Clock/Alarm apps. | Exact alarm granted on install. | Subject to Google Play policy verification. | Declared in Manifest for enterprise alarm profiles. |
| `RECEIVE_BOOT_COMPLETED` | API 1 | Normal | Restore alarms from Room DB upon device boot. | Alarms restored automatically on boot. | Alarms not restored until user launches app. | Declared in Manifest. |
| `USE_FULL_SCREEN_INTENT` | API 29 (Android 10) | Special / Runtime in API 34 | Launch full-screen Activity over lockscreen for mandatory events. | `MandatoryReceiveActivity` presents over lockscreen. | OS downgrades to high-priority Heads-Up Banner. | Heads-up banner includes direct `RECEIVE` action button. |
| `WAKE_LOCK` | API 1 | Normal | Keep CPU awake briefly in BroadcastReceiver. | Smooth synchronous execution in `goAsync()`. | OS may suspend process before Room commit. | Managed internally via `goAsync()`. |
| `VIBRATE` | API 1 | Normal | Haptic feedback on alerts. | Vibration active. | Visual alert only. | Declared in Manifest. |

---

## 🔄 Permission Revocation Handling Workflow

```text
User revokes SCHEDULE_EXACT_ALARM in Settings
                    │
                    ▼
Android OS broadcasts ACTION_SCHEDULE_EXACT_ALARM_PERMISSION_STATE_CHANGED
                    │
                    ▼
TimezoneChangeReceiver / ExactAlarmPermissionReceiver catches broadcast
                    │
                    ▼
Queries AlarmManager.canScheduleExactAlarms()
                    │
   ├── If TRUE  ➔ Reconciles and schedules all future events via setExactAndAllowWhileIdle()
   └── If FALSE ➔ Reconciles and schedules fallback via setAndAllowWhileIdle() + updates Diagnostics
```
