# FINAL PRODUCTION VERIFICATION

**Date:** 2026-08-31  
**Scope:** `/home/sct/dnd/backend` + `/home/sct/dnd/native-app`  
**Method:** Code inspection, existing unit/integration tests, architecture doc cross-check. **No new physical-device runs in this pass.**

---

## 1. Executive Summary

The Organization Alert System implements a **dual-mode reliability model**:

| Mode | Guarantee class |
|------|-----------------|
| **Mode 1 — Pre-synchronized scheduled** | Local execution after successful sync + AlarmManager registration. **Does not require internet at fire time.** Platform-limited (exact alarms, Doze, OEM). |
| **Mode 2 — Immediate urgent** | Real-time when process + transport available. **Not guaranteed** to dead/killed process without FCM or equivalent wake transport. |

**Overall readiness:** `PRODUCTION CANDIDATE — YELLOW/ORANGE` — core paths implemented and unit-tested; full device/OEM matrix **NOT YET VERIFIED** for all scenarios.

---

## 2. Actual Architecture

**Scheduled (Mode 1):** Backend stores canonical UTC `scheduledAt` (+ `timezoneId` for recurrence). Android syncs → `ScheduleTimeCalculator` computes `delay = scheduledAt - now()` → `AlarmManager.setExactAndAllowWhileIdle(RTC_WAKEUP, triggerMillis)`. **No backend contact at fire time.**

**Backend scheduler:** Optional recurrence metadata advance for DAILY/WEEKLY sync fingerprints only. Does **not** broadcast, does **not** complete ONCE alerts, does **not** ring devices.

**Immediate (Mode 2):** Unchanged — Socket.IO / optional FCM → persist → ring.

---

## 3. Scheduled Alarm Guarantees

| Claim | Status | Evidence |
|-------|--------|----------|
| Fires without network after local schedule | **IMPLEMENTED** | `EventAlarmReceiver` / `AlertBroadcastReceiver` → `AlarmEngine`; no HTTP in path |
| Survives UI closed | **IMPLEMENTED** | AlarmManager PendingIntent |
| Survives process killed (not force-stop) | **PLATFORM-LIMITED** | OS delivers broadcast; OEM/Doze may delay |
| Schedule edit cancels old alarm | **IMPLEMENTED** | `AlertReconciliationService` compares version/times → `cancelAlert` → `scheduleAlert` |
| 19:00→22:00 override rings once at 22:00 | **IMPLEMENTED (unit)** | Version + `nextTriggerAt` reconcile; **device scenario NOT VERIFIED** |
| Recurrence DAILY/WEEKLY in business TZ | **IMPLEMENTED (unit)** | `RecurrenceHelper` + `timezoneId` in `AlertBroadcastReceiver` |

**Classification:** `GREEN` logic / `YELLOW` device validation

---

## 4. Immediate Alarm Guarantees

| Scenario | Status |
|----------|--------|
| App foreground + socket connected | **IMPLEMENTED** — `SocketManager` → `PresentationEngine` |
| App background, process alive | **BEST-EFFORT** — socket may stay connected |
| Process dead, no FCM | **NOT GUARANTEED** — requires sync/launch/FCM |
| Process dead, FCM configured + token | **ORANGE** — `push.service.js` + `PushAlarmReceiver`; end-to-end **NOT VERIFIED** |

**Classification:** Foreground `GREEN/YELLOW`; dead-process `ORANGE` without verified FCM

---

## 5. Transport vs Execution

| Layer | Meaning | Authoritative on |
|-------|---------|------------------|
| **Delivery (sync)** | Event/alert reached Room | Backend sync + client ingest |
| **Execution (schedule)** | AlarmManager registered | Android reconciliation |
| **Execution (ring)** | Audio + FGS + full-screen UI | `AlarmEngine` / `AlarmRingingService` |
| **ACK transport** | User action reached backend | `AckQueue` + `ResilientAckWorker` |

Backend HTTP delivery record ≠ alarm rang. Client must report ACK after user interaction.

---

## 6. Offline Behavior

| Action | Offline behavior | Status |
|--------|------------------|--------|
| Scheduled fire | Local AlarmManager | **IMPLEMENTED** |
| User ACK | Local Room + queue | **IMPLEMENTED** |
| ACK sync | WorkManager retry | **IMPLEMENTED** |
| New immediate alert | Not received until transport | **BY DESIGN** |

---

## 7. Process Death Behavior

### Scheduled (Mode 1)
Already-registered `AlarmManager` alarm can wake `BroadcastReceiver` when process was killed (not force-stopped). Path: `EventAlarmReceiver` / `AlertBroadcastReceiver` → `AlarmEngine`.

### Immediate (Mode 2)
Dead process requires FCM/push or next sync/launch. Socket alone **cannot** wake.

**Do not document:** “Works when app is killed” without Mode qualifier.

---

## 8. Doze Behavior

Uses `setExactAndAllowWhileIdle` when permitted; falls back to `setAndAllowWhileIdle` with log `[EXACT_ALARM_RESTRICTED]`.

**Classification:** `ORANGE` — platform/OEM dependent; **NOT VERIFIED** on full OEM matrix in this pass.

---

## 9. Reboot Recovery

`BootCompletedReceiver`:
1. Loads future alerts from Room → `AlertScheduler.scheduleAlert`
2. `EventAlarmScheduler.reconcileScheduledEvents`
3. Triggers `AckManager` worker

Deterministic request codes via `AlertAlarmIdGenerator` (MD5 of id).

**Classification:** `YELLOW` — implemented; limited device evidence in `PHYSICAL_DEVICE_RESULTS.md`

---

## 10. Exact Alarm Handling

| Check | Implementation |
|-------|----------------|
| `canScheduleExactAlarms()` | `EventAlarmScheduler.canScheduleExact()` |
| Exact API | `setExactAndAllowWhileIdle` |
| Fallback | `setAndAllowWhileIdle` + warning log |
| User visibility | `DiagnosticsScreen` shows exact-alarm capability |

When exact alarms unavailable: app **does not** claim exact timing; uses best-effort inexact path.

---

## 11. Full-Screen Alarm Handling

Path: `AlarmRingingService` (FGS) → `MandatoryReceiveActivity` with `showWhenLocked` / `turnScreenOn`.

API 34+ full-screen intent permission probed; FGS direct activity launch is primary path.

**Classification:** `YELLOW` — **NOT VERIFIED** on all API 34+ OEM builds in this pass.

---

## 12. Audio/Ringing Behavior

`AlarmAudioController` (USAGE_ALARM), `AlarmVibrationController`, `AlarmRingingService` single `activeSessionId`, `AlarmEngine.stop()` on ACK/DISMISS.

Duplicate session guarded by mutex + `markRingingIfEligible`.

**Classification:** `GREEN` unit logic / `YELLOW` device audio edge cases (DND, silent)

---

## 13. Sync/Reconciliation

`SyncManager` → `AlarmSyncCoordinator.reconcileAfterSync()`:
- Compares `version`, `timezoneId`, `recipientUserIds`, times, status
- Cancels obsolete → registers current
- Idempotent (unit: `AlertReconciliationServiceTest`)

---

## 14. Duplicate Prevention

| Source | Mechanism |
|--------|-----------|
| Repeated sync | Reconciliation + deterministic PendingIntent codes |
| Socket + sync + boot | `ImmediateEventStore` terminal states; `markRingingIfEligible`; `activeSessionId` |
| Same event 3 transports | Persist-first + duplicate suppression in `AlarmEngine` |

**Classification:** `GREEN` unit-tested logic

---

## 15. ACK/Dismiss Reliability

Atomic Room transaction in `AckManager` (`withTransaction`). Queue actions: `RECEIVE`, `DISMISS`, `ALERT_ACK`, `ALERT_DISMISS`. Worker exponential backoff.

User stops alarm **before** network confirms.

**Classification:** `GREEN`

---

## 16. Recipient Security

| Path | Server enforcement |
|------|-------------------|
| Broadcast | `BroadcastService` resolves group members + `recipientUserIds` |
| Event receive | Org check in `event.controller.js` |
| Alert ACK/dismiss | `assertUserCanActOnAlert()` — org + group + recipient list |
| Client eligibility | `AlarmEligibilityChecker` — broadcaster excluded |

**Gap:** No JWT — `userId` still from request body (mitigated by server-side membership checks). **P0:** session/JWT auth.

---

## 17. Group Membership Semantics

| Type | Who receives |
|------|--------------|
| **Immediate broadcast** | Current active group members at **broadcast time** (server `BroadcastService`) |
| **Scheduled alert ring** | Members per **last sync** group data + `recipientUserIds` at **execution time** (`AlarmEligibilityChecker`) |
| **Targeted list** | Intersection of group members and `recipientUserIds` when list non-empty |

If membership changes between sync and fire, device uses **cached** group until next sync.

---

## 18. Event Expiration

`expiresAt` checked in: `EventAlarmScheduler`, `EventAlarmReceiver`, `PresentationEngine.presentEvent`, backend `receiveEvent`.

Expired events marked `EXPIRED`; do not ring.

Stale immediate after days offline: sync may deliver expired event → blocked at presentation.

---

## 19. Timezone Handling

`timezoneId` on Alert (default UTC). `RecurrenceHelper.calculateNextOccurrence(..., zoneId)` in `AlertBroadcastReceiver`.

`TimezoneChangeReceiver` triggers reconcile.

**Classification:** `GREEN` unit tests / `YELLOW` DST edge cases on device

---

## 20. Device Registration

`UserPreferences.getOrCreateDeviceId()` — stable UUID persisted. `DeviceRegistrationManager` registers on start + post-sync. Backend upsert by `deviceId`.

---

## 21. Multi-Device Behavior

**Current behavior:** Each registered device syncs independently. Alert rings on **all devices** where:
- Same user session configured, AND
- Eligibility passes (group/recipient)

**Not implemented:** primary-device-only or ring-on-first-device. Document as **limitation**.

---

## 22. Test Evidence

| Suite | Result | Date |
|-------|--------|------|
| Backend Jest (52 tests) | **PASS** | 2026-08-31 |
| Android `testDebugUnitTest` | **PASS** | 2026-08-31 |
| Physical device matrix (§40) | **NOT COMPLETE** | — |
| Shop closing 19→22 scenario | **NOT VERIFIED on device** | — |
| Urgent broadcast scenario | **NOT VERIFIED on device** | — |

`PHYSICAL_DEVICE_RESULTS.md` contains **limited** samples — not full matrix sign-off.

---

## 23. Known Android/OEM Limitations

- Force-stop clears alarms until next app launch/sync  
- Exact alarm permission denial → inexact scheduling  
- Doze / App Standby may delay delivery  
- OEM battery savers (Samsung, Xiaomi, etc.)  
- Full-screen / background activity launch restrictions API 34+

---

## 24. Remaining Risks

| Risk | Severity |
|------|----------|
| No JWT — body `userId` trust | High (mitigated partially) |
| Dead-process immediate without FCM | High (documented) |
| Incomplete physical validation | High |
| Cached group membership on scheduled ring | Medium |
| Multi-device duplicate ring | Medium (by design today) |

---

## 25. Production Readiness Assessment

| Capability | Classification |
|------------|----------------|
| Scheduled offline alarm (Mode 1) | **YELLOW** |
| Immediate foreground alarm (Mode 2) | **YELLOW** |
| Immediate dead-process alarm | **ORANGE** (FCM unverified) / **RED** without FCM |
| Offline ACK | **GREEN** |
| Duplicate prevention | **GREEN** |
| Boot recovery | **YELLOW** |
| Versioned schedule reconcile | **GREEN** |
| Recipient authorization | **YELLOW** (no JWT) |
| OEM reliability | **ORANGE** |
| Physical device validation | **RED** (incomplete matrix) |

**Verdict:** Suitable for controlled pilot with documented limits. **Not** unconditional production-ready for guaranteed immediate dead-process delivery.

---

## Architectural Verification (Questions 1–10)

### Q1 — Synced 18:00 for 22:00, then offline/killed/Doze?

**Yes (Mode 1, platform-limited).** Path: `AlarmManager` → `AlertBroadcastReceiver`/`EventAlarmReceiver` → `AlarmEngine` → `AlarmRingingService`. No network in receiver path.

### Q2 — Urgent event, process dead?

**Nothing wakes without FCM/push or user opening app.** Socket dead. Optional: `push.service.js` → device `pushToken` → must reach `PushAlarmReceiver` (not verified E2E).

### Q3 — Socket.IO alone for immediate guarantee?

**No.** Documented in `DELIVERY_ANALYSIS.md`.

### Q4 — Same event via Socket + FCM + sync?

**One ring:** `ImmediateEventStore` + `markRingingIfEligible` + `activeSessionId` mutex.

### Q5 — 19:00 changed to 22:00 after 19:00 alarm registered?

**Old cancelled:** `AlertReconciliationService` detects `version`/`nextTriggerAt` change → `scheduler.cancelAlert` → `scheduleAlert` with new time.

### Q6 — After reboot?

`BootCompletedReceiver` reschedules from Room; deterministic request codes prevent duplicates. **Idempotent.**

### Q7 — ACK offline?

Local `withTransaction` → `ACK_PENDING` → `ResilientAckWorker` when online.

### Q8 — User A ACK user B?

**Blocked server-side** for events (org check). Alerts: `assertUserCanActOnAlert` (org + group + recipients). **Without JWT, forged userId still a risk if attacker knows IDs.**

### Q9 — Broadcaster receives own urgent alarm?

**No** — `AlarmEligibilityChecker` excludes `broadcasterId == currentUserId` on all client ring paths.

### Q10 — Expired immediate rings days later?

**Blocked** if `expiresAt` set — scheduler, receiver, `PresentationEngine`, backend receive.

---

## Files Modified (scheduling ownership correction)

| File | Change |
|------|--------|
| `backend/src/services/scheduler.service.js` | No broadcast at fire time; ONCE skipped; DAILY/WEEKLY metadata only |
| `native-app/.../ScheduleTimeCalculator.kt` | **NEW** — central delay/next-occurrence math |
| `native-app/.../AlertScheduler.kt` | Uses calculator; logs delay; intent carries version+trigger |
| `native-app/.../AlertReconciliationService.kt` | Resolves next trigger locally before schedule |
| `native-app/.../Receivers.kt` | Stale alarm guard (version/trigger mismatch) |
| `native-app/.../ScheduleTimeCalculatorTest.kt` | **NEW** — 3h delay, 19→22, daily TZ tests |
| `backend/tests/integration/scheduler.test.js` | Reflects new server scheduler role |
