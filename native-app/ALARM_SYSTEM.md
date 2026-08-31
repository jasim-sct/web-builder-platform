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
Sync → Room → ScheduleTimeCalculator (delay = scheduledAt - now)
    → AlertScheduler / EventAlarmScheduler → AlarmManager (RTC_WAKEUP absolute millis)
    → At scheduled time: EventAlarmReceiver / AlertBroadcastReceiver
    → Stale guard (version + trigger) → AlarmEngine → ring (no network)
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

## Test Results (honest status — do not mark PASS without device evidence)

| Scenario | Expected | Status |
|----------|----------|--------|
| Immediate (socket, foreground) | Device rings | IMPLEMENTED · NOT YET VERIFIED on full device matrix |
| Scheduled (AlarmManager) | Local fire | IMPLEMENTED · UNIT TESTED |
| Process killed — **scheduled** | OS delivers broadcast | PLATFORM-LIMITED · DEVICE VALIDATION PENDING |
| Process killed — **immediate** | Requires FCM/sync | NOT GUARANTEED without wake transport |
| Screen locked | Full-screen alarm | IMPLEMENTED · DEVICE VALIDATION PENDING |
| Offline scheduled | No HTTP at fire time | IMPLEMENTED · UNIT TESTED |
| Doze | Exact-alarm rules | PLATFORM-LIMITED · NOT YET VERIFIED |
| Reboot | Alarms restored idempotently | IMPLEMENTED · PARTIALLY VERIFIED |
| Duplicate event | One ring session | IMPLEMENTED · UNIT TESTED |
| Broadcaster exclusion | Does not ring | IMPLEMENTED · UNIT TESTED |
| Recipient | Rings | IMPLEMENTED · UNIT TESTED |
| ACK offline | Durable queue | IMPLEMENTED · UNIT TESTED |
| Dismiss | Stops + sync | IMPLEMENTED · backend `POST .../dismiss` |

**Automated:** `./gradlew testDebugUnitTest` — unit tests pass.  
**Manual:** `DEVICE_VALIDATION_GATE.md` + `FINAL_PRODUCTION_VERIFICATION.md`

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
- Full-screen intent on API 34+ without grant (FGS direct activity launch is primary path)  
- Immediate delivery to force-stopped or long-dead process without FCM  
- Unconditional “app killed” guarantee — only **Mode 1 scheduled** applies
