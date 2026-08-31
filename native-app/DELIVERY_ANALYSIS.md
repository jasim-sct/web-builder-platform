# DELIVERY_ANALYSIS: Server → Device Delivery in a Firebase-Free Architecture

**Date:** 2026-08-31  
**Author:** Senior Android Platform & Systems Architecture  

---

## 🎯 Critical Architectural Question

> **"How does a brand-new backend event reach an Android device when the application UI is closed and the process is dead, under a 100% Firebase-free constraint?"**

This document provides a factual, platform-grounded analysis of Android OS background execution behavior, contrasting what is mathematically and technically **GUARANTEED**, what is **BEST EFFORT**, and what is **NOT POSSIBLE ON ANDROID**.

---

## 🏛️ Android OS Background Execution Rules (API 26+)

Since Android 8.0 (API 26) and deepened through Android 12–15:
1. **No Background Services**: Apps cannot start background services when in the background (`IllegalStateException`).
2. **Sockets Die with the Process**: Raw TCP / WebSocket connections (`SocketManager`) terminate when the application process is killed by the user or reclaimed by the OS low-memory killer (LMK).
3. **Doze Mode Shuts Down Network**: In deep Doze (screen off, stationary, on battery), the OS cuts network access except during brief maintenance windows.
4. **Alarms Wake CPU, Not Network**: `AlarmManager` with `setExactAndAllowWhileIdle()` wakes the CPU to execute a `BroadcastReceiver`, but it does **not** grant immediate network access during Doze.

---

## 📊 Dual-Mode Delivery Model

To remain 100% compliant with Android platform rules without fake hacks or battery drains, the system operates across **two distinct modes**:

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ MODE 1: PRE-SYNCHRONIZED EVENT                                              │
│                                                                             │
│ [Backend]                                                                   │
│    │ Creates Event (scheduledAt = future instant)                          │
│    ▼                                                                        │
│ [Device Sync]                                                               │
│    │ Occurs while app was previously open, background periodic sync, etc. │
│    ▼                                                                        │
│ [Room Database]                                                             │
│    │ Status = SCHEDULED                                                     │
│    ▼                                                                        │
│ [AlarmManager]                                                              │
│    │ setExactAndAllowWhileIdle(RTC_WAKEUP, scheduledAt)                     │
│    ▼                                                                        │
│ [Device Idle / App UI Closed / Process Dead / Screen Locked]                │
│    │                                                                        │
│    ▼ At scheduledAt                                                         │
│ [EventAlarmReceiver Wakes OS] ➔ [PresentationEngine] ➔ [MandatoryReceive UI]│
│                                                                             │
│ STATUS: PLATFORM-SUPPORTED & OFFLINE-CAPABLE                               │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ MODE 2: UNPLANNED / IMMEDIATE REMOTE EVENT WHILE DEAD                       │
│                                                                             │
│ [Backend]                                                                   │
│    │ Creates Emergency Event (scheduledAt = NOW)                            │
│    ▼                                                                        │
│ [Device State]                                                              │
│    ├── If App in Foreground / Background Alive:                             │
│    │   └── Socket.IO delivers event within ~50ms [BEST EFFORT REAL-TIME]    │
│    └── If App Process is Dead & Firebase-Free:                              │
│        └── Delivery occurs upon next WorkManager Periodic Sync / App Launch │
│                                                                             │
│ STATUS: CONDITIONAL (FCM is required by Android for dead-process wakeup)    │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 📋 Comprehensive Platform Capability Matrix

| Delivery Scenario | Platform Mechanism | Reliability Classification | Explanation |
|---|---|---|---|
| **Pre-Scheduled Event (App Closed / Dead / Locked)** | `Room` + `AlarmManager.setExactAndAllowWhileIdle()` | **PLATFORM-SUPPORTED / HIGH RELIABILITY** | The OS AlarmManager holds the wakeup intent in kernel timer wheel. It wakes the CPU, boots app process into `EventAlarmReceiver`, and displays UI without internet. |
| **Pre-Scheduled Event (Offline / No Wi-Fi / No Cell)** | `Room` + `AlarmManager.setExactAndAllowWhileIdle()` | **PLATFORM-SUPPORTED / OFFLINE CAPABLE** | Requires zero network. Triggers locally from Room database. |
| **New Event (App in Foreground / Active)** | `Socket.IO` Gateway | **BEST EFFORT (~50–200ms)** | Active TCP socket receives event immediately. |
| **New Event (App Minimized / Background Alive)** | `Socket.IO` / Foreground Receiver | **BEST EFFORT (~100–500ms)** | Process is alive in cached state; socket receives message until OS reclaims connection. |
| **New Event (App Dead, Firebase-Free)** | `WorkManager` Periodic Sync (`GET /api/events/sync`) | **PERIODIC / BEST EFFORT (≥ 15 min)** | Android OS does not provide an incoming remote push mechanism for dead processes other than Google Play services (FCM). WorkManager polls periodically during maintenance windows. |
| **User Force-Stops App** | None (OS Invariant) | **NOT POSSIBLE UNDER ANDROID PLATFORM RESTRICTIONS** | Android disables all alarms, receivers, and workers until user manually clicks app icon. |

---

## 📦 Delivery vs Execution (do not conflate)

| Term | Meaning |
|------|---------|
| **Delivery** | Backend data reached device storage (sync/socket/push ingest into Room) |
| **Execution** | AlarmManager fired and/or `AlarmEngine` started audio + full-screen UI |
| **ACK** | User explicitly acknowledged/dismissed; synced to backend via queue |

HTTP “delivered” or sync success **does not** mean the alarm rang. Only `RINGING` → user ACK proves execution.

---

## ⚖️ Architectural Verdict & Recommendations

1. **Keep Zero-Firebase Architecture**:
   - For organizational alerts, shift schedules, reminders, and planned emergency drills (which represent >95% of enterprise use cases), **Mode 1 (Pre-synchronized Local Scheduling)** is **high-reliability, zero-battery-drain, and immune to network outages**.
2. **Transparent Platform Documentation**:
   - Never claim that an immediate unplanned push can awaken a dead Android phone without a cloud push transport (FCM/UnifiedPush).
3. **Optimized Resilient Sync**:
   - Combine WebSocket for live active use with periodic WorkManager sync (`GET /api/events/sync`) and boot restoration for resilient recovery.
