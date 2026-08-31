# AUDIT_REPORT: Native Android Background Event & Mandatory Receive System

**Date:** 2026-08-31  
**Target Systems:**  
* Android Kotlin Native Application (`/home/sct/dnd/native-app`)  
* Express.js + MongoDB Backend (`/home/sct/dnd/backend`)  
**Auditor:** Senior Android Platform & Reliability Architecture Engineering  

> **Post-audit status (2026-08-31):** Remediation items 1–9 implemented. Current guarantees and evidence: `FINAL_PRODUCTION_VERIFICATION.md`. Living walkthrough: `../DEVELOPMENT_WALKTHROUGH.md`.

---

## 📋 Executive Summary

The existing codebase provides a solid, zero-Firebase foundation utilizing **Room, AlarmManager (`setExactAndAllowWhileIdle`), BroadcastReceivers, WorkManager, and Jetpack Compose**.

However, deep technical auditing against Android 12 (API 31), Android 13 (API 33), Android 14 (API 34), and Android 15 reveals critical areas where **platform assumptions are too strong**, **terminology makes unrealistic promises (e.g. "exact millisecond execution")**, **remote event delivery without FCM is misunderstood**, and **event lifecycle state is conflated with network acknowledgement state**.

This audit report identifies all gaps, establishes accurate platform behavior, and outlines the precise architectural hardening required.

---

## A. Correct Implementations

The following components are architecturally sound and correctly implemented:

1. **Local Alarm Wakeup via `AlarmManager`**:
   - Uses `RTC_WAKEUP` with `setExactAndAllowWhileIdle()` on Android 6.0+ (API 23+) and `setExact()` on older versions.
   - Request codes are generated deterministically from `eventId` using MD5 bit-packing (`AlertAlarmIdGenerator`), preventing collision and enabling reliable cancellation.
2. **Reboot Recovery via `BootCompletedReceiver`**:
   - Listens for `ACTION_BOOT_COMPLETED`, `ACTION_MY_PACKAGE_REPLACED`, and `android.intent.action.QUICKBOOT_POWERON`.
   - Reconstructs and re-registers all active future schedules from the local Room database.
3. **Offline-First Room Persistence**:
   - All events and deliveries are committed locally before attempting network operations.
   - Single source of truth for all local scheduling.
4. **Resilient Offline Acknowledgement via `WorkManager`**:
   - `AckManager` enqueues ACK items into `AckQueueEntity` and triggers `ResilientAckWorker` with `NetworkType.CONNECTED` constraint and exponential backoff.
5. **Mandatory Receive Interaction Design**:
   - `MandatoryReceiveActivity` presents an urgent, call-like UI with a single **RECEIVE (✓)** button (no decline, cancel, or reject options).
   - Window flags and Activity APIs use `setShowWhenLocked(true)` and `setTurnScreenOn(true)` correctly.
6. **Backend Idempotency**:
   - `POST /api/events/:id/receive` records receipts in `receivedBy` using `(userId, deviceId)` deduplication.

---

## B. Incorrect Assumptions & Overstated Claims

| Claim / Assumption in Existing Docs/Code | Actual Android Platform Reality | Correction Required |
|---|---|---|
| *"Fires at the exact millisecond required"* | Android OS `AlarmManager` does not guarantee millisecond precision. Under Doze mode, CPU wake locks, and system load, alarm delivery typically fluctuates by **10ms to several seconds**. | Replace with: **"scheduled for the requested wall-clock/instant time, with delivery as close as Android permits"**. |
| *"Works 100% when application process has been killed for new backend events (Firebase-Free)"* | Without FCM high-priority push, a dead Android process **cannot be awakened instantaneously** by a remote backend HTTP call. WebSockets die when the process dies; periodic sync is subject to WorkManager intervals (15+ min) and Doze maintenance windows. | Clearly differentiate **Mode 1 (Pre-synchronized events)** (100% autonomous local wakeup via `AlarmManager`) from **Mode 2 (Unplanned remote events)** (Best-effort periodic sync / socket while active). |
| *"Full-screen intent always turns on the screen on Android 14+"* | Android 14 (API 34) restricts `USE_FULL_SCREEN_INTENT` to calling and alarm app categories by default. For general enterprise/alert apps, the OS may downgrade to a high-priority heads-up banner unless the user grants special access in Settings. | Implement graceful fallback to heads-up banner and add diagnostic check for full-screen intent permission. |
| *"Single event status enum represents both display and ACK state"* | Conflating `RECEIVED` with `ACKNOWLEDGED` creates ambiguity when the user taps RECEIVE while offline. | Split state into **Event Lifecycle Status** (`SCHEDULED`, `TRIGGERED`, `PRESENTED`, `RECEIVED`, `EXPIRED`, `CANCELLED`) and **ACK Transport Status** (`NOT_REQUIRED`, `PENDING`, `SENDING`, `CONFIRMED`, `FAILED`). |

---

## C. Missing Functionality

1. **Explicit System Separation**:
   - Clear architectural boundary between:
     - **System A**: Remote Event Delivery (`Backend -> Transport -> Device`)
     - **System B**: Local Event Scheduling (`Room -> AlarmManager -> Receiver`)
     - **System C**: Device -> Backend Acknowledgement (`AckQueue -> WorkManager -> Backend`)
2. **Exact Alarm Permission State Change Receiver**:
   - Android 12+ sends `ACTION_SCHEDULE_EXACT_ALARM_PERMISSION_STATE_CHANGED` when the user grants or revokes exact alarm permission in Settings. The app must catch this broadcast to re-schedule pending alarms immediately.
3. **Notification Permission Revocation Handling**:
   - If `POST_NOTIFICATIONS` is revoked on Android 13+, the presentation engine must record `PRESENTATION_FAILED / NOTIFICATION_BLOCKED` rather than assuming successful presentation.
4. **Timezone ID & Wall-Clock vs Instant Representation**:
   - Events must store `timezoneId` and `scheduledAtUtc` to accurately distinguish between fixed UTC instants and recurring local wall-clock schedules when the user crosses timezones.
5. **Backend Security & Authorization Verification**:
   - `POST /api/events/:id/receive` must verify that the requesting device and user belong to the event's target organization/group before recording the acknowledgement.
6. **Detailed Diagnostics Timeline & Latency Metrics**:
   - Diagnostics screen needs an end-to-end event timing breakdown (`CREATED` → `SYNCED` → `STORED` → `SCHEDULED` → `ALARM_TRIGGERED` → `PRESENTED` → `RECEIVED` → `ACK_CONFIRMED`) with measured latencies.

---

## D. Android Platform Risks & Mitigations

| Android OS Version / Feature | Risk | Mitigation Strategy |
|---|---|---|
| **Android 12 (API 31)** | `SCHEDULE_EXACT_ALARM` can be revoked by user. | Check `alarmManager.canScheduleExactAlarms()`. If false, schedule with `setAndAllowWhileIdle()` fallback and flag in Diagnostics. Listen to permission change broadcast. |
| **Android 13 (API 33)** | `POST_NOTIFICATIONS` runtime permission required. | Check `NotificationManagerCompat.areNotificationsEnabled()`. Prompt user during onboarding / diagnostics. |
| **Android 14 (API 34)** | `USE_FULL_SCREEN_INTENT` permission restricted. | Pre-declare in Manifest; provide high-priority Heads-Up Notification fallback with direct `RECEIVE` action button. |
| **Doze Mode & Standby Buckets** | Device throttles CPU and network when stationary on battery. | Use `AlarmManager.setExactAndAllowWhileIdle()` to wake CPU briefly; perform immediate local Room/Presentation work synchronously with `goAsync()`; defer network ACK via WorkManager. |
| **OEM Task Killers (Xiaomi, Oppo, Vivo, Samsung)** | Aggressive background process termination prevents alarms from firing if auto-start is disabled. | Provide OEM battery optimization guide and intent triggers in Diagnostics screen. |
| **Force Stop** | Hard OS rule: disables all alarms and receivers until manual relaunch. | Explicitly document as a platform limitation; do not make impossible guarantees. |

---

## E. Google Play Policy Risks

1. **`USE_EXACT_ALARM` vs `SCHEDULE_EXACT_ALARM`**:
   - Google Play policy restricts `USE_EXACT_ALARM` strictly to Alarm, Clock, and Calendar apps. For organizational alert/reminder applications, `SCHEDULE_EXACT_ALARM` must be requested or configured, and the app must handle runtime denial gracefully.
2. **`USE_FULL_SCREEN_INTENT`**:
   - Must be justified under calling or critical alarm use cases. If not permitted, the app gracefully degrades to heads-up notifications.

---

## F. Reliability & Concurrency Risks

1. **Duplicate Alarm Triggering**:
   - Resolved: `AlertAlarmIdGenerator` produces unique, deterministic 31-bit integers for each `eventId`, eliminating duplicate pending intents.
2. **Race Condition during Offline RECEIVE**:
   - Resolved: `AckManager` performs an atomic Room transaction: updates `EventEntity.status = RECEIVED` and inserts an `AckQueueEntity` record, before triggering `ResilientAckWorker`.
3. **Multi-Device Concurrent Acknowledgement**:
   - If User operates Phone A and Tablet B, and Phone A acknowledges `EVT-100`, Tablet B's next sync or socket event updates local state to `RECEIVED` without triggering duplicate alarms.

---

## G. Recommended Modifications Matrix

| # | Problem | Current Behavior | Recommended Behavior | Implementation Required |
|---|---|---|---|---|
| 1 | Overstated exact millisecond claims | Documentation claims "exact millisecond" precision | Accurate phrasing: "scheduled for requested instant, delivered as close as Android permits" | Update docs, comments, diagnostics |
| 2 | Blurring remote delivery mechanisms | Unclear how dead processes receive remote events without FCM | Explicitly define Mode 1 (Pre-synchronized) vs Mode 2 (Unplanned remote event) | Create `DELIVERY_ANALYSIS.md` & update sync docs |
| 3 | Conflated Event & ACK states | `EventStatus` contains both `RECEIVED` and `ACKNOWLEDGED` | Separate `EventStatus` (lifecycle) from `AckStatus` (network transport) | Update `EventEntities.kt` and `EventDaos.kt` |
| 4 | Exact alarm permission revocation | Revocation not dynamically monitored | Register broadcast receiver for `ACTION_SCHEDULE_EXACT_ALARM_PERMISSION_STATE_CHANGED` | Add receiver & update `EventAlarmScheduler.kt` |
| 5 | Diagnostics timing visibility | Only shows simple status badges | Detailed event diagnostics timeline with stage latencies | Upgrade `DiagnosticsScreen.kt` & ViewModel |
| 6 | Backend authorization | `receiveEvent` endpoint does not check user authorization against event scope | Verify user/device belongs to event organization | Update `event.controller.js` |
