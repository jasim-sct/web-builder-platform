# BACKGROUND_TEST_MATRIX: Real-World Device States & Acceptance Verification

**Date:** 2026-08-31  

---

## 📱 Comprehensive Test Matrix

| # | Test Scenario | Device Initial State | Action / Stimulus | Expected Behavior | Verification Criterion |
|---|---|---|---|---|---|
| **1** | Foreground Alert | App in foreground, screen unlocked | Pre-scheduled alarm triggers | Heads-up banner or dialog appears with sound + vibration | Status moves to `TRIGGERED` ➔ `PRESENTED`. |
| **2** | Background Alert | App in background (Home screen), screen on | Pre-scheduled alarm triggers | High-priority Heads-up notification appears with **RECEIVE (✓)** action | User can tap RECEIVE from notification bar. |
| **3** | Process Dead & Locked | App swiped away / killed via task manager, screen locked | Pre-scheduled alarm triggers | `AlarmManager` wakes OS, turns screen on, displays `MandatoryReceiveActivity` over lockscreen | Full-screen UI displays with single **RECEIVE** button. |
| **4** | Doze Mode Wakeup | Device on battery, stationary, screen off > 30 min | Pre-scheduled alarm triggers | `setExactAndAllowWhileIdle()` wakes CPU; screen turns on with Mandatory Receive UI | Alarm executes close to scheduled instant. |
| **5** | Offline Receive | Wi-Fi and Mobile Data disabled | User taps **RECEIVE** | Local DB transitions to `RECEIVED`; UI dismisses immediately; ACK enqueued in `ack_queue` | User never waits for spinner/network. |
| **6** | Offline ➔ Online Recovery | Network restored after offline receive | Network returns online | `WorkManager` `ResilientAckWorker` activates, flushes ACK to `POST /api/events/:id/receive` | Backend confirms ACK; `AckQueue` item deleted; status moves to `CONFIRMED`. |
| **7** | Device Reboot Recovery | Pre-scheduled event in future; device rebooted | System reboots to lockscreen | `BootCompletedReceiver` loads active events from Room and re-registers `AlarmManager` alarms | Alarm fires at scheduled instant after reboot. |
| **8** | Timezone Change | Event scheduled at 15:00 local time; timezone changed | User switches timezone in Settings | `TimezoneChangeReceiver` catches `ACTION_TIMEZONE_CHANGED`, recalculates triggers, and re-registers alarms | Alarms adjust accurately. |
| **9** | Notification Permission Denied | `POST_NOTIFICATIONS` denied in Settings | Pre-scheduled alarm triggers | `PresentationEngine` detects denial, logs `PRESENTATION_BLOCKED`, and records warning in Diagnostics | App handles denial gracefully without crashing. |
| **10** | Exact Alarm Revoked | `SCHEDULE_EXACT_ALARM` revoked in App Settings | User revokes permission | App uses `setAndAllowWhileIdle()` fallback; Diagnostics displays `EXACT_ALARM_RESTRICTED` | App schedules fallback alarm. |
| **11** | Duplicate RECEIVE Taps | User taps RECEIVE multiple times rapidly | Rapid multi-tap | Local Room transaction is idempotent; Backend returns HTTP 200 without duplicate records | Single ACK record in backend `receivedBy`. |
| **12** | Multi-Device Sync | User has Device A and Device B | Device A taps RECEIVE | Backend records receipt; Device B syncs or receives socket update and updates state | Both devices show received status. |
| **13** | Force Stop Limitation | User goes to Settings ➔ Force Stop | Pre-scheduled alarm time arrives | Android OS suppresses all alarms and receivers until user clicks app icon | Explicitly documented as hard OS invariant. |

---

## ⏱️ Latency Measurement Guidelines for Physical Device Acceptance Testing

When conducting physical testing on Android 13/14/15 devices, record the following timestamps in the Diagnostics screen:

* $T_0$: `createdAt` (Backend Event Creation)
* $T_1$: `syncedAt` (Client Sync Time)
* $T_2$: `scheduledAt` (Scheduled Trigger Instant)
* $T_3$: `triggeredAt` (Actual Alarm Wakeup Time)
* $T_4$: `presentedAt` (UI Presentation Timestamp)
* $T_5$: `receivedAt` (User Tapped RECEIVE)
* $T_6$: `ackConfirmedAt` (Backend Confirmed Receipt)

**Computed Latencies:**
* Alarm Delivery Latency = $T_3 - T_2$ (Target: $\le 1.5\text{s}$ under active Doze)
* Presentation Latency = $T_4 - T_3$ (Target: $\le 150\text{ms}$)
* User Interaction Latency = $T_5 - T_4$ (Human response time)
* Network ACK Latency = $T_6 - T_5$ (Target: $\le 800\text{ms}$ when online)
