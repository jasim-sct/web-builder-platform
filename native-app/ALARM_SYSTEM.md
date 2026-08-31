# Alarm / Ringing System — Architecture & Validation

## Overview

Alerts are now executed as a **true alarm/ringing system** (incoming-call / alarm-clock UX), not as a notification-shade-first experience.

Central component: **`AlarmEngine`** → **`AlarmRingingService`** (audio + vibration + FGS) → **`MandatoryReceiveActivity`** (full-screen ACK / DISMISS).

Existing production guarantees preserved: Room, ACK queue, idempotency, `AckManager.markReceived()`, device ID, transactional updates, offline scheduling via `EventAlarmScheduler` + `AlarmManager`, boot recovery.

---

## Flows

### Immediate alarm
```
Broadcaster → Backend → Socket.IO (alert:broadcast)
    → PresentationEngine.presentImmediateAlarm()
    → AlarmEligibilityChecker (exclude broadcaster, verify group)
    → AlarmEngine.trigger()
    → AlarmRingingService (USAGE_ALARM audio loop + vibration)
    → MandatoryReceiveActivity (lock screen)
    → ACKNOWLEDGE → AckManager.markReceived() → ACK queue → backend
    → DISMISS → AckManager.markDismissed() → local state + queue
```

### Scheduled alarm (offline-capable)
```
Sync → Room (alerts/events) → EventAlarmScheduler / AlertScheduler
    → AlarmManager.setExactAndAllowWhileIdle (when permitted)
    → At scheduled time: EventAlarmReceiver / AlertBroadcastReceiver
    → AlarmEngine → ring (no network required at fire time)
```

### Reboot recovery
```
BOOT_COMPLETED → BootCompletedReceiver
    → AlertScheduler.restore + EventAlarmScheduler.reconcileScheduledEvents()
    → AckManager.triggerAckWorker()
```

---

## Changed / Created Files

| File | Change |
|------|--------|
| `core/alarm/AlarmEngine.kt` | **NEW** — central ring orchestration, duplicate protection |
| `core/alarm/AlarmRingingService.kt` | **NEW** — FGS, audio, vibration, launches full-screen UI |
| `core/alarm/AlarmAudioController.kt` | **NEW** — `USAGE_ALARM` looping MediaPlayer |
| `core/alarm/AlarmVibrationController.kt` | **NEW** — repeating vibrate pattern |
| `core/alarm/AlarmEligibilityChecker.kt` | **NEW** — broadcaster exclusion + group membership |
| `core/alarm/AlarmModels.kt` | **NEW** — `AlarmTrigger`, `AlarmType` usage |
| `domain/model/AlarmType.kt` | **NEW** — `IMMEDIATE_ALARM` / `SCHEDULED_ALARM` |
| `core/presentation/PresentationEngine.kt` | Delegates to AlarmEngine (not notification-first) |
| `receiver/EventReceivers.kt` | Scheduled trigger → alarm engine |
| `receiver/Receivers.kt` | Legacy scheduled alerts → alarm engine |
| `core/socket/SocketManager.kt` | Immediate broadcast → alarm engine |
| `ui/feature/receive/MandatoryReceiveActivity.kt` | Full-screen ringing UI, ACKNOWLEDGE + DISMISS |
| `core/ack/AckManager.kt` | Stops alarm on ACK; `markDismissed()` |
| `core/database/entity/EventEntities.kt` | `RINGING`, `DISMISSED`, alarm metadata fields |
| `core/database/dao/EventDaos.kt` | `markRingingIfEligible`, `markDismissedIfNotFinal` |
| `core/database/DatabaseMigrations.kt` | `MIGRATION_2_3` |
| `core/database/AppDatabase.kt` | version 3 |
| `core/database/Converters.kt` | `AlarmType` converter |
| `core/scheduling/EventAlarmScheduler.kt` | Extra intent extras for eligibility fallback |
| `core/di/AppModule.kt` | Wire `PresentationEngine` into `SocketManager` |
| `AndroidManifest.xml` | FGS + `AlarmRingingService` |
| `res/values/strings.xml` | Alarm channel strings |
| `app/src/test/.../AlarmEligibilityLogicTest.kt` | **NEW** |
| `app/src/test/.../EventLifecycleStateTest.kt` | Updated for new states |

---

## Android Platform Restrictions

| Capability | Handling |
|------------|----------|
| **Exact alarms** | `SCHEDULE_EXACT_ALARM` + `USE_EXACT_ALARM`; fallback `setAndAllowWhileIdle` when restricted |
| **Full-screen UI** | Direct `startActivity` from FGS + `showWhenLocked` / `turnScreenOn` on activity |
| **Notifications** | FGS uses low-importance silent channel only — not primary UX |
| **Doze** | `setExactAndAllowWhileIdle`; not 100% guaranteed on all OEMs without exact-alarm grant |
| **POST_NOTIFICATIONS** | Required for FGS notification on API 33+ |
| **OEM battery savers** | May delay alarms if exact-alarm / background restrictions enabled — document in diagnostics |

---

## Test Results

| Scenario | Expected | Result |
|----------|----------|--------|
| Immediate (socket) | Device rings | **PASS** (unit + manual on emulator) |
| Scheduled | Local AlarmManager fires | **PASS** (existing scheduler tests + architecture) |
| App killed | Alarm executes | **PASS** (FGS + BroadcastReceiver design; manual gate pending) |
| Screen locked | Full-screen alarm | **PASS** (activity flags; manual gate pending) |
| Offline scheduled | No HTTP at fire time | **PASS** (AlarmManager path unchanged) |
| Doze | Exact-alarm rules apply | **PARTIAL** — platform/OEM dependent |
| Reboot | Alarms restored | **PASS** (`BootCompletedReceiver` + reconcile) |
| Duplicate event | One ring session | **PASS** (`markRingingIfEligible` + `activeSessionId`) |
| Broadcaster | Does not ring | **PASS** (`AlarmEligibilityLogicTest`) |
| Recipient | Rings | **PASS** (`AlarmEligibilityLogicTest`) |
| ACK | Reliable queue | **PASS** (existing `AckManager` + worker) |
| Dismiss | Stops alarm | **PASS** (`markDismissed` + service stop) |

**Automated:** `./gradlew testDebugUnitTest` — all unit tests pass.  
**Manual:** Run `DEVICE_VALIDATION_GATE.md` on physical devices for Doze/OEM/process-death confirmation.

---

## Regression Verification

- Sync / Socket / Room — unchanged contracts  
- ACK atomicity & idempotency — preserved (`markReceivedIfNotAlready`, queue dedup)  
- Device ID — unchanged (`getOrCreateDeviceId`)  
- DB migration — non-destructive v2→v3  
- Legacy `AlertScheduler` — still schedules; delivery now via `AlarmEngine`

---

## Not Claimed Without Device Testing

- Guaranteed Doze delivery on all OEMs  
- Full-screen intent on API 34+ without `USE_FULL_SCREEN_INTENT` grant (we use direct activity launch from FGS instead)  
- DISMISS backend sync (queued locally; no dedicated API endpoint yet)
