# ARCHITECTURE_FINAL: Native Android Background Event & Mandatory Receive System

**Date:** 2026-08-31  
**Architecture Classification:** Three-Tier Decoupled Event Scheduling & Acknowledgement Engine  

---

## 🏛️ System Overview

The system is decoupled into three independent, loosely-coupled architectural systems:

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        SYSTEM A: REMOTE DELIVERY                       │
│                                                                        │
│   [Backend Event Engine] ──(REST Sync / Socket)──► [Android Client]   │
└────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     SYSTEM B: LOCAL EVENT SCHEDULING                   │
│                                                                        │
│   [Room Database] ──► [AlarmManager] ──► [EventAlarmReceiver]          │
│                                                   │                    │
│                                                   ▼                    │
│                                          [PresentationEngine]          │
│                                           ├── Full-Screen UI           │
│                                           └── Heads-Up Banner          │
└────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼ User taps RECEIVE (✓)
┌────────────────────────────────────────────────────────────────────────┐
│                   SYSTEM C: DEVICE → BACKEND ACK PIPELINE              │
│                                                                        │
│   [Local Room Commit] ──► [AckQueue] ──► [WorkManager] ──► [Backend]  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🧩 Architectural Component Descriptions

### 1. System A — Remote Event Delivery Layer
* **Responsibility**: Ingest events created on the backend into the device's persistent store.
* **Transports**:
  - `GET /api/events/sync`: Atomic sync endpoint returning server events, versioning, and server timestamp.
  - `Socket.IO`: Real-time broadcast channel active when the application is open or foreground-cached.
  - `PeriodicSyncWorker`: WorkManager job that queries `/api/events/sync` at OS-scheduled intervals.

### 2. System B — Local Event Scheduling Layer
* **Responsibility**: Autonomous, offline-capable event execution independent of process life or network state.
* **Components**:
  - `Room Database (`EventEntity`)`: Local source of truth.
  - `EventAlarmScheduler`: Requests exact alarm from Android OS via `AlarmManager.setExactAndAllowWhileIdle(RTC_WAKEUP, scheduledAt, pendingIntent)`.
  - `EventAlarmReceiver`: BroadcastReceiver invoked by Android kernel timer when `scheduledAt` is reached.
  - `PresentationEngine`: Evaluates lock state (`KeyguardManager.isKeyguardLocked`) and priority (`MANDATORY`, `CRITICAL`, `HIGH`, `NORMAL`). Dispatches full-screen `MandatoryReceiveActivity` over lockscreen or posts rich Heads-Up notification banner.
  - `BootCompletedReceiver`: Restores and reconciles all active future alarms from Room after device reboot.
  - `TimezoneChangeReceiver`: Re-calculates and re-registers alarms upon system clock or timezone modification.

### 3. System C — Device → Backend Acknowledgement Pipeline
* **Responsibility**: Resilient, offline-first acknowledgement delivery with guaranteed at-least-once confirmation.
* **Components**:
  - `MandatoryReceiveActivity` / Notification Action: Single action **RECEIVE (✓)**.
  - `AckManager`: Atomic local transaction marking `EventEntity.status = RECEIVED` and inserting into `AckQueueEntity` before dismissing UI immediately.
  - `ResilientAckWorker`: WorkManager `CoroutineWorker` configured with `NetworkType.CONNECTED` constraint and exponential backoff (`15s * attemptCount`).
  - `POST /api/events/:id/receive`: Idempotent backend endpoint verifying device and user authorization.

---

## 🔒 Security & Idempotency Guarantees

1. **Deterministic Hashing**: Request codes generated via MD5 bit-packing on `eventId` prevent duplicate PendingIntents.
2. **Idempotent Acknowledgement**: Backend records `(userId, deviceId)` in `receivedBy` array. Repeated requests return HTTP 200 without duplicate side-effects.
3. **Scoped Device Ownership**: Device registration validates that the device belongs to the authenticated user and organization.
