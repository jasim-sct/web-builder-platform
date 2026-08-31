# CROSS_CHECK_REPORT: Comprehensive Verification & Reality Alignment

**Date:** 2026-08-31  
**Lead Auditor:** Senior Android Platform & Reliability Architecture Engineering  

---

## 🔍 Section I: Document Claim vs. Actual Implementation vs. Android Reality

| # | Document Claim | Actual Codebase Implementation | Current Android OS Reality (API 31–35) | Required Action / Status |
|---|---|---|---|---|
| **1** | *"Exact millisecond execution guaranteed"* | Uses `AlarmManager.setExactAndAllowWhileIdle()` | Android OS timer wheel and Doze wakeups have inherent jitter (10ms to several seconds). | **CORRECTED**: Phrased as "scheduled for requested instant using exact alarm facility, subject to OS delivery". |
| **2** | *"Works 100% when application process is killed for new remote backend events (Firebase-Free)"* | Sockets die on process termination; sync is on launch / WorkManager periodic sync | Without FCM high-priority push, Android **does not wake dead processes** for remote HTTP pushes. Sockets require living process. | **CORRECTED**: Clearly separate **Mode 1 (Pre-synchronized Local Scheduling)** (100% offline & process-dead capable) from **Mode 2 (Unplanned remote events)** (Best effort on active app / periodic sync). |
| **3** | *"Single status enum covers both display and acknowledgement"* | Conflated display lifecycle and network ACK state | An offline user can receive an event locally while server ACK remains pending. | **RESOLVED**: Separated into `EventStatus` (`SCHEDULED`, `TRIGGERED`, `PRESENTED`, `PRESENTATION_BLOCKED`, `RECEIVED`, `EXPIRED`, `CANCELLED`, `MISSED`) and `AckStatus` (`NOT_REQUIRED`, `PENDING`, `SENDING`, `CONFIRMED`, `FAILED`). |
| **4** | *"Full-screen intent always turns on screen"* | `MandatoryReceiveActivity` requests `setShowWhenLocked(true)` and `setTurnScreenOn(true)` | Android 14+ restricts `USE_FULL_SCREEN_INTENT`. If ungranted, OS downgrades to high-priority heads-up banner. | **RESOLVED**: Verified heads-up fallback with direct **RECEIVE (✓)** action button. |
| **5** | *"setAndAllowWhileIdle() is an exact alarm fallback"* | `EventAlarmScheduler.kt` used inexact `setAndAllowWhileIdle()` when `canScheduleExactAlarms()` was false | Inexact alarms are batched by the OS. | **RESOLVED**: Mark `EXACT_ALARM_RESTRICTED` in Diagnostics and document clearly that fallback is inexact. |
| **6** | *"Separate reconciliation algorithms in Boot and Timezone receivers"* | Receivers duplicated custom scheduling loops | Redundant and prone to divergence. | **RESOLVED**: Centralized in `EventAlarmScheduler.reconcileScheduledEvents()`. |
| **7** | *"Force-stopped apps can trigger alarms"* | None | Force stop suppresses all pending alarms and receivers until user launches app. | **DOCUMENTED**: Hard OS invariant. |

---

## 🎯 Section II: Direct Answer to the Core Architectural Question

> **"How does a NEW backend-created event reach an Android device when the application UI is closed AND the application process is dead, while Firebase/FCM is forbidden?"**

### The Technical Reality:
1. **Under Firebase-Free Constraint**:
   - Android OS does **not** allow an arbitrary external server to send a raw TCP packet to wake up a dead process or penetrate deep Doze mode without a registered system push service (Google Play Services / FCM).
   - Any raw WebSocket or TCP listener is destroyed when the process is killed by the OS or user.
2. **System Behavior Under This Constraint**:
   - **Mode 1 (Pre-synchronized Events)**: **SUPPORTED & HIGH RELIABILITY**. Events scheduled in advance sync to Room and register with `AlarmManager`. The OS kernel wakes the device at `scheduledAt` completely offline without needing network or a live process.
   - **Mode 2 (Unplanned Remote Events while Dead)**: **NOT REAL-TIME GUARANTEED**. Delivery occurs when the user next opens the app or when `WorkManager` runs an OS-scheduled periodic sync window (≥ 15 min, subject to Doze maintenance windows).

---

## 🔒 Section III: Decoupled Three-System Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                 SYSTEM A: REMOTE DELIVERY                   │
│   • Socket.IO: Live active broadcast (Best Effort)          │
│   • REST Sync: Atomic state ingestion on app launch         │
│   • WorkManager Periodic Sync: Best-effort reconciliation   │
└─────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│              SYSTEM B: LOCAL EVENT SCHEDULING               │
│   • Room Database (EventEntity)                             │
│   • Centralized EventAlarmScheduler.reconcileScheduledEvents│
│   • AlarmManager.setExactAndAllowWhileIdle(RTC_WAKEUP)      │
│   • EventAlarmReceiver -> PresentationEngine                │
│   • MandatoryReceiveActivity (RECEIVE-only UX)              │
└─────────────────────────────────────────────────────────────┘
                               │
                               ▼ User taps RECEIVE (✓)
┌─────────────────────────────────────────────────────────────┐
│               SYSTEM C: ACKNOWLEDGEMENT PIPELINE            │
│   • Room Atomic Commit: Event=RECEIVED, Ack=PENDING         │
│   • UI Dismisses Instantly (Zero Network Blocking)          │
│   • Persistent AckQueue (AckQueueEntity)                    │
│   • WorkManager (ResilientAckWorker with Connected constraint│
│   • Idempotent POST /api/events/:id/receive (HTTP 200)      │
│   • Room Commit: Ack=CONFIRMED                              │
└─────────────────────────────────────────────────────────────┘
```
