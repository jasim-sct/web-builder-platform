# Device Validation Gate (Production Gate)

**Status target:** `PRODUCTION CANDIDATE — PENDING REAL-DEVICE VALIDATION`

This is the **real production gate** for the Firebase-free, offline-first mandatory RECEIVE path.  
Run on **at least two physical Android devices** (different OEMs if possible), including **locked screen**, **Doze/idle**, and **offline** scenarios.

> **Architectural truth:** Events **already synchronized to Room** do **not** require internet at trigger time.  
> Firebase/FCM is only relevant for **brand-new** events that never reached the device before the process died.

---

## Prerequisites

- Backend running (`http://<LAN_IP>:5000` on device, or `http://10.0.2.2:5000` on emulator)
- App installed (debug or release)
- Diagnostics screen accessible
- `adb` available for log capture (optional but recommended)

```bash
# From native-app/
./scripts/emulator-runner.sh --launch   # emulator path
# OR install APK on physical device via Android Studio / adb install
```

---

## Gate Test — 16 Steps

| Step | Action | Pass criteria |
|------|--------|---------------|
| 1 | Create event on backend (scheduled **2–5 min** ahead, `requiresReceive: true`) | HTTP 201, `eventId` returned |
| 2 | Open app → Connect → Sync (or wait for socket + sync) | Sync succeeds |
| 3 | Confirm event in Room | Diagnostics shows scheduled count ≥ 1, or inspect via debug |
| 4 | Confirm AlarmManager registration | Log: `[EVENT_SCHEDULED]` for `eventId`; Diagnostics `EXACT_ALARM_AVAILABLE` or `EXACT_ALARM_RESTRICTED` |
| 5 | Close app UI | App not in foreground |
| 6 | Swipe app from Recents (process may be killed) | — |
| 7 | Lock device screen | Keyguard active |
| 8 | Enable Doze / leave device idle (or `adb shell dumpsys deviceidle force-idle` on debug builds) | Device idle |
| 9 | Disable Wi-Fi and mobile data | Fully offline |
| 10 | Wait until **scheduled time** | — |
| 11 | Alarm fires | Log: `[ALARM_TRIGGERED]`; notification or full-screen UI appears |
| 12 | Verify presentation | Heads-up and/or full-screen (if `FULL_SCREEN_ALLOWED`); RECEIVE action visible |
| 13 | Tap **RECEIVE** | UI dismisses; local state `EventStatus=RECEIVED`, `AckStatus=PENDING` |
| 14 | Re-enable internet | Network connected |
| 15 | WorkManager flushes ACK | Log: `[ACK_CONFIRMED]`; queue item removed |
| 16 | Backend receipt | Single `receivedBy` entry for user+device; idempotent on repeat |

---

## adb Helpers (optional)

```bash
# Watch alarm / presentation / ACK logs
adb logcat -s EventAlarmScheduler EventAlarmReceiver PresentationEngine AckManager ResilientAckWorker

# Force Doze (may require eng/userdebug)
adb shell dumpsys deviceidle force-idle
adb shell dumpsys deviceidle unforce

# Check exact alarm permission (API 31+)
adb shell cmd alarm get-config
```

---

## Required Device Validation Matrix

Do **not** mark PASS without recorded evidence.

| Scenario | Mode | Expected | Evidence status |
|----------|------|----------|-----------------|
| App foreground | 1/2 | Alarm rings | NOT YET VERIFIED |
| App background | 1/2 | Alarm rings | NOT YET VERIFIED |
| UI closed | 1 | Scheduled alarm | NOT YET VERIFIED |
| Process killed | 1 | Scheduled alarm (not force-stop) | PARTIALLY VERIFIED (see PHYSICAL_DEVICE_RESULTS) |
| Process killed | 2 | **Not guaranteed** without FCM | DOCUMENTED |
| Screen locked | 1/2 | Full-screen alarm | NOT YET VERIFIED |
| Internet OFF | 1 | Scheduled alarm | NOT YET VERIFIED |
| Doze | 1 | Alarm (platform-limited) | NOT YET VERIFIED |
| Reboot | 1 | Rescheduled idempotently | PARTIALLY VERIFIED |
| Timezone changed | 1 | Recalculated | NOT YET VERIFIED |
| Schedule 19:00→22:00 | 1 | Only 22:00 rings | UNIT TESTED · DEVICE PENDING |
| Duplicate sync | 1 | One alarm | UNIT TESTED |
| Duplicate event (socket+sync) | 2 | One execution | UNIT TESTED |
| Offline ACK | 1/2 | Local ACK + retry | UNIT TESTED |
| Broadcaster | 2 | No alarm | UNIT TESTED |
| Recipient | 1/2 | Alarm | UNIT TESTED |
| Expired event | 2 | No stale ring | IMPLEMENTED |

### Business scenario tests (device required)

| Scenario | Steps | Pass criteria |
|----------|-------|---------------|
| **Shop closing override** | Default 19:00; exception 22:00; sync 18:00; offline/killed until 22:00 | No ring at 19:00; ring at 22:00 |
| **Daily report reminder** | DAILY 20:30 Asia/Kolkata; ACK offline | Ring at 20:30; ACK_PENDING → backend |
| **Urgent product issue** | Manager broadcasts; Staff A/B/C targeted | Manager silent; staff ring independently |

---

## Record Results

| Device | Android API | OEM | Exact alarm | Notifications | Full-screen | Offline RECEIVE | ACK to backend | Result |
|--------|-------------|-----|-------------|---------------|-------------|-----------------|----------------|--------|
| | | | | | | | | PASS / FAIL |

---

## Remaining code gates (before `PRODUCTION READY`)

| Priority | Item | Status |
|----------|------|--------|
| P0 | JWT/session auth — derive `userId` server-side | **TODO** |
| P0 | This device validation matrix | **TODO** |
| P1 | Room migrations (no destructive upgrade) | **DONE** (`MIGRATION_1_2`) |
| P1 | Consolidate `AlertScheduler` → `EventAlarmScheduler` | **TODO** |
| P2 | Remove unused `firebase-admin` | **DONE** |

---

## Final verdict progression

```text
READY WITH LIMITATIONS
        ↓
PRODUCTION CANDIDATE — PENDING REAL-DEVICE VALIDATION   ← current
        ↓
PRODUCTION READY   (after P0 auth + device gate pass + scheduler consolidation)
```
