# Organization Alert System — Development Walkthrough

**Last updated:** 2026-08-31  
**Maintained by:** Update this file on **every** code or behavior change (see `.cursor/rules/development-walkthrough.mdc`).

**Scope:** Full stack — `backend/` (Express + MongoDB + Socket.IO) and `native-app/` (Kotlin + Jetpack Compose).

---

## About this document

This is the **single overall walkthrough of what we developed** — not a feature checklist alone.

It describes:

- **What** the system is and **why** it is structured this way  
- **How** data and alarms flow from backend → device → user → ACK  
- **Where** code, config, tests, and deeper docs live  
- **What** is done, **what** is partial, and **what** is still limited  

Use it to onboard, review architecture, or verify that a change was documented.

---

## Table of contents

1. [Repository structure](#1-repository-structure)
2. [What we built](#2-what-we-built)
3. [Development phases](#3-development-phases)
4. [Architecture principles](#4-architecture-principles)
5. [Quick start](#5-quick-start)
6. [System at a glance](#6-system-at-a-glance)
7. [Backend](#7-backend)
8. [Android app](#8-android-app)
9. [Alarm & ringing system](#9-alarm--ringing-system)
10. [Sync, scheduling & offline behavior](#10-sync-scheduling--offline-behavior)
11. [Acknowledgement & dismiss pipeline](#11-acknowledgement--dismiss-pipeline)
12. [Architecture audit remediation](#12-architecture-audit-remediation)
13. [UI & navigation](#13-ui--navigation)
14. [Security & configuration](#14-security--configuration)
15. [Tests & validation](#15-tests--validation)
16. [Known limitations](#16-known-limitations)
17. [Related documentation](#17-related-documentation)
18. [Implementation checklist](#18-implementation-checklist)
19. [Change log](#19-change-log)

---

## 1. Repository structure

```text
dnd/
├── DEVELOPMENT_WALKTHROUGH.md    ← this file (canonical project walkthrough)
├── backend/                      ← Node.js API, scheduler, sockets, MongoDB
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/             ← alert, broadcast, scheduler, push
│   │   ├── models/
│   │   ├── routes/
│   │   ├── socket/
│   │   └── validators/
│   └── tests/
└── native-app/                   ← Android Kotlin client
    ├── app/src/main/java/com/example/organizationalert/
    │   ├── core/                 ← alarm, sync, ack, scheduling, network, db
    │   ├── ui/                   ← Compose screens + neo design system
    │   ├── receiver/             ← AlarmManager receivers, boot, push
    │   └── data/repository/
    ├── ALARM_SYSTEM.md           ← deep dive: ringing stack
    ├── ARCHITECTURE_FINAL.md     ← three-system architecture
    └── AUDIT_REPORT.md           ← gap analysis + remediation source
```

---

## 2. What we built

An **organization alert and reminder platform** for groups of users:

| Layer | Responsibility |
|-------|----------------|
| **Backend** | Source of truth: orgs, users, groups, alerts, events, deliveries, devices. Runs scheduler and real-time broadcast. |
| **Android app** | Offline-capable executor: syncs schedule, registers `AlarmManager` alarms, rings like an alarm clock, mandatory ACK/DISMISS, retries when offline. |

**Problem solved:** Teams need reliable scheduled reminders and immediate broadcasts to groups, with proof of delivery/acknowledgement, working when the network drops **after** sync.

**Explicit non-goals (by design):**

- Android app does **not** bundle Firebase SDK (optional server-side FCM only).
- Immediate delivery to a **killed** process is best-effort without FCM.

---

## 3. Development phases

| Phase | Focus | Outcome |
|-------|--------|---------|
| **1 — Foundation** | Backend CRUD, sync API, Room cache, basic Compose UI | Org/user/group/alert management end-to-end |
| **2 — Local scheduling** | `AlertScheduler`, reconciliation, boot recovery | Scheduled alerts fire offline |
| **3 — Alarm UX** | `AlarmEngine`, FGS, full-screen receive | Notification-shade-first → true alarm ringing |
| **4 — Event track** | Events API, `EventAlarmScheduler`, mandatory receive | Second scheduling path + ACK pipeline |
| **5 — Audit hardening** | 9 remediation items (ACK retry, version, timezone, FCM hook, etc.) | Production-aligned architecture |
| **6 — UI refresh** | Neomorphic design system, History/Schedule screens | Partial modern UI rollout |
| **7 — Ongoing** | Device validation matrix, remaining UI screens | See [Known limitations](#16-known-limitations) |

---

## 4. Architecture principles

1. **Backend decides WHAT and WHEN (canonical instant); Android executes locally** once synced.  
2. **Backend scheduler is NOT the alarm executor** — no socket broadcast at scheduled fire time; ONCE alerts are never auto-completed on server tick.  
3. **Android calculates delay** — `ScheduleTimeCalculator`: `scheduledAt - deviceNow` → `AlarmManager` absolute RTC trigger.  
4. **Idempotent sync → reconcile → schedule** — no duplicate alarms on repeated sync.  
5. **Offline-first ACK** — local commit first, `WorkManager` retries network.  
6. **Two delivery modes** — Mode 1 (pre-synced) vs Mode 2 (immediate); never conflate guarantees.  
7. **Versioned alerts** — server `version` + client reconcile cancels obsolete alarms (19:00 → 22:00).  
8. **Stale alarm protection** — receiver validates version + trigger before ring.

---

## 5. Quick start

### Backend

```bash
cd backend
pnpm install          # or npm install
cp .env.example .env  # if present; set MONGODB_URI, PORT
pnpm dev              # or npm run dev
```

Default API: `http://localhost:5000`  
Health check: `GET /api/health`

### Android app

```bash
cd native-app
./gradlew assembleDebug
./gradlew installDebug   # device/emulator connected
```

On first launch: **Setup** → enter server URL → select organization & user → **Connect & Sync**.

---

## 6. System at a glance

```text
                    ┌──────────────────────────┐
                    │        BACKEND           │
                    │ Source of truth          │
                    │ scheduledAt (UTC)        │
                    │ version, recurrence, TZ  │
                    └────────────┬─────────────┘
                                 │ SYNC
                                 ▼
                    ┌──────────────────────────┐
                    │      ANDROID ROOM        │
                    └────────────┬─────────────┘
                                 ▼
                    ┌──────────────────────────┐
                    │ SCHEDULE RECONCILIATION  │
                    │ ScheduleTimeCalculator   │
                    │ delay = scheduledAt - now│
                    └────────────┬─────────────┘
                                 ▼
                    ┌──────────────────────────┐
                    │      ALARMMANAGER        │
                    └────────────┬─────────────┘
                                 ▼
              Receiver → AlarmEngine → Ringing → ACK queue
```

**Backend scheduler:** advances **recurring metadata only** (optional sync fingerprint). Does **not** ring devices or complete ONCE alerts.

**Two delivery modes** (see `native-app/DELIVERY_ANALYSIS.md`):

| Mode | Description | Execution offline? | Process dead (scheduled)? | Process dead (immediate)? |
|------|-------------|-------------------|---------------------------|---------------------------|
| **Mode 1 — Pre-synchronized** | Synced to Room + AlarmManager registered | Yes — no network at fire time | Yes — OS alarm fires receiver (OEM/Doze caveats) | N/A |
| **Mode 2 — Immediate** | Socket.IO + optional FCM server | No | N/A | **Not guaranteed** without FCM/wake transport |

**Terminology:** Do **not** say “works when app is killed” unconditionally. Distinguish **scheduled execution** (Mode 1) from **immediate delivery** (Mode 2).

**Delivery guarantee ≠ execution guarantee.** HTTP/sync delivery to Room ≠ alarm rang. ACK ≠ receipt.

---

## Verification status model

Use honest labels in this document:

| Label | Meaning |
|-------|---------|
| `IMPLEMENTED` | Code exists |
| `UNIT TESTED` | JVM/backend tests cover logic |
| `PARTIALLY VERIFIED` | Some manual/device evidence |
| `BEST-EFFORT` | Platform-dependent, no hard guarantee |
| `PLATFORM-LIMITED` | Android/OEM restrictions apply |
| `NOT YET VERIFIED` | No test evidence |

Full assessment: `native-app/FINAL_PRODUCTION_VERIFICATION.md`

---

## 7. Backend

### 7.1 Core domain

| Area | What it does | Key paths |
|------|--------------|-----------|
| **Organizations** | Multi-tenant root entity | `src/models/Organization.js`, `src/routes/organization.routes.js` |
| **Users** | Members with roles (`ADMIN`, `MEMBER`) | `src/models/User.js`, `src/routes/user.routes.js` |
| **Groups** | Dynamic membership; alerts target groups | `src/models/Group.js`, `src/routes/group.routes.js` |
| **Alerts** | Scheduled reminders with recurrence | `src/models/Alert.js`, `src/routes/alert.routes.js` |
| **Events** | Mandatory receive / scheduled event track | `src/models/Event.js`, `src/routes/event.routes.js` |
| **Alert deliveries** | Per-user delivery & ACK state | `src/models/AlertDelivery.js` |
| **Devices** | Device registration + optional push tokens | `src/models/Device.js`, `src/routes/device.routes.js` |

### 7.2 Alert lifecycle

1. **Create** — `POST /api/alerts` with title, message, group, `scheduledAt`, `repeatType` (`ONCE` / `DAILY` / `WEEKLY`), priority, optional `timezoneId`, optional `recipientUserIds`.
2. **Update** — `PUT /api/alerts/:id`; increments `version` on each update.
3. **Enable / disable** — `POST /api/alerts/:id/enable` · `POST /api/alerts/:id/disable`
4. **Manual trigger** — `POST /api/alerts/:id/trigger`
5. **Immediate broadcast** — `POST /api/alerts/broadcast-now`
6. **Acknowledge** — `POST /api/alerts/:id/acknowledge` with `{ userId }`
7. **Dismiss** — `POST /api/alerts/:id/dismiss` with `{ userId }`
8. **History / upcoming** — `GET /api/alerts/history` · `GET /api/alerts/upcoming`

**Scheduler** (`src/services/scheduler.service.js`): evaluates due alerts, updates times, increments `occurrenceCount`, calls `BroadcastService`.

### 7.3 Event lifecycle

| Endpoint | Purpose |
|----------|---------|
| `GET /api/events/sync` | Device delta sync |
| `POST /api/events` | Create event |
| `GET /api/events/:id` | Fetch single event |
| `POST /api/events/:id/receive` | Idempotent receive ACK |
| `POST /api/events/:id/dismiss` | Dismiss event |

### 7.4 Real-time (Socket.IO)

Rooms: `organization:{id}`, `group:{id}`, `user:{id}`.

| Event | When emitted |
|-------|--------------|
| `alert:triggered` | Scheduled alert fires |
| `alert:broadcast` | Immediate broadcast |
| `alert:updated` | Alert edited on server |
| `alert:acknowledged` | User ACKs |

`BroadcastService` resolves current members, filters `recipientUserIds`, emits to group + user rooms, optional FCM via `push.service.js`.

### 7.5 Bulk sync

`GET /api/sync?userId=&organizationId=` — atomic payload for Android `SyncManager`.

### 7.6 Optional services & validation

| Service | Env variable | When unset |
|---------|--------------|------------|
| API key auth | `API_KEY` | Auth disabled |
| FCM push | `FCM_SERVER_KEY` | Push skipped |
| Scheduler tick | `SCHEDULER_INTERVAL_MS` | ~1s default |

Validators enforce `recipientUserIds` and `timezoneId` on create, update, broadcast-now.

---

## 8. Android app

### 8.1 Screens & navigation

| Screen | Route | Purpose |
|--------|-------|---------|
| Splash | `/splash` | Session → Dashboard or Setup |
| Setup | `/setup` | Server URL, org/user, initial sync |
| Dashboard | `/dashboard` | Status, next alert, quick actions |
| Alerts | `/alerts` | Filterable list |
| Alert details | `/alerts/{id}` | View, ACK, trigger, edit, delete |
| Create/edit alert | `/alerts/create` · `/alerts/edit/{id}` | Alert form |
| Groups / Users | `/groups`, `/users` | CRUD + members |
| Schedules | `/schedules` | Upcoming (neo UI) |
| History | `/history` | Past alerts (neo UI) |
| Settings | `/settings` | Profile, sync, disconnect |
| Diagnostics | `/diagnostics` | Debug / health |

Wide layout → sidebar; phone → bottom nav (`NavBars.kt`, `NavGraph.kt`).

### 8.2 Room database (v4)

| Table | Purpose |
|-------|---------|
| `organizations`, `users`, `groups` | Synced structure |
| `alerts` | + `version`, `timezoneId`, `recipientUserIdsJson`, `occurrenceCount` |
| `alert_deliveries` | Delivery / ACK per user |
| `events` | Event track |
| `ack_queue` | Offline ACK/dismiss retry |
| `device_registration` | Device identity |

### 8.3 Core modules

| Module | Role |
|--------|------|
| `SyncManager` | Full sync + triggers unified reconcile |
| `AlarmSyncCoordinator` | Post-sync alert + event alarm reconcile |
| `SocketManager` | Live broadcasts |
| `DeviceRegistrationManager` | Register device with backend |
| `ResilientAckWorker` / `PeriodicSyncWorker` | Background retry & poll |

### 8.4 Receivers

`AlertBroadcastReceiver`, `EventAlarmReceiver`, `BootCompletedReceiver`, `TimezoneChangeReceiver`, `PushAlarmReceiver`.

---

## 9. Alarm & ringing system

Detail: `native-app/ALARM_SYSTEM.md`

| Component | Role |
|-----------|------|
| `AlarmEngine` | Orchestration, dedupe, eligibility |
| `AlarmRingingService` | FGS audio + vibration |
| `AlarmEligibilityChecker` | Group, broadcaster, recipient rules |
| `PresentationEngine` + `ImmediateEventStore` | Immediate path; persist before ring |
| `MandatoryReceiveActivity` | Full-screen ACK / DISMISS over lock screen |

**Immediate:** Socket/push → persist → eligibility → ring → ACK/dismiss → queue → backend.

**Scheduled:** Sync → Room → `AlarmManager` → receiver → ring → recurrence in alert `timezoneId` → `occurrenceCount++`.

---

## 10. Sync, scheduling & offline behavior

`SyncManager` flow:

1. `GET /api/sync` → upsert entities  
2. `GET /api/events/sync` → upsert events  
3. `AlarmSyncCoordinator.reconcileAfterSync()` — alerts (version, timezone, recipients) + events  

`AlertReconciliationService` is idempotent — repeated sync does not duplicate alarms.

---

## 11. Acknowledgement & dismiss pipeline

| Action | Android | Queue | API |
|--------|---------|-------|-----|
| Event receive | `markReceived()` | `RECEIVE` | `POST /api/events/:id/receive` |
| Event dismiss | `markDismissed()` | `DISMISS` | `POST /api/events/:id/dismiss` |
| Alert ACK | `markAlertAcknowledged()` | `ALERT_ACK` | `POST /api/alerts/:id/acknowledge` |
| Alert dismiss | `markAlertDismissed()` | `ALERT_DISMISS` | `POST /api/alerts/:id/dismiss` |

`ResilientAckWorker` flushes when network is available (exponential backoff).

---

## 12. Architecture audit remediation

From `native-app/AUDIT_REPORT.md` — all nine items implemented:

| # | Item | Summary |
|---|------|---------|
| 1 | Alert ACK offline retry | WorkManager queue |
| 2 | Immediate alarm persist/dedupe | `ImmediateEventStore` |
| 3 | Targeted recipients | `recipientUserIds` end-to-end |
| 4 | Optional FCM | `push.service.js` + `PushAlarmReceiver` |
| 5 | Alert version reschedule | Server `version` + client reconcile |
| 6 | DISMISS API | Alert + event dismiss routes |
| 7 | Business timezone | `timezoneId` + `RecurrenceHelper` |
| 8 | Occurrence tracking | `occurrenceCount` local + server |
| 9 | Unified scheduling | `AlarmSyncCoordinator` |

---

## 13. UI & navigation

Neomorphic system: `ui/neo/` (`NeoTokens`, `NeoElevation`, `NeoComponents`).

**Migrated:** Dashboard, Alerts, Groups, Users, History, Schedule, Settings (partial), shell.  
**Pending:** Setup, Splash, Diagnostics, some detail forms.

---

## 14. Security & configuration

See backend `.env`: `PORT`, `MONGODB_URI`, `API_KEY`, `FCM_SERVER_KEY`, `SCHEDULER_INTERVAL_MS`.

Android: server URL + device ID in `UserPreferences`; no Firebase SDK in app.

---

## 15. Tests & validation

- **Backend:** `npm test` — 52 tests (integration + socket)  
- **Android:** `./gradlew testDebugUnitTest` — reconciliation, recurrence, eligibility, timezone  
- **Device:** `native-app/DEVICE_VALIDATION_GATE.md`, `scripts/emulator-runner.sh`

---

## 16. Known limitations

1. Immediate alerts to dead process need Socket or FCM.  
2. Exact alarms may be inexact if permission denied (Android 12+).  
3. OEM battery savers can delay alarms.  
4. Neomorphic UI incomplete on some screens.  
5. Physical device matrix not fully CI-signed-off.

---

## 17. Related documentation

| Document | Topic |
|----------|-------|
| `native-app/ALARM_SYSTEM.md` | Ringing stack |
| `native-app/ARCHITECTURE_FINAL.md` | Three-system model |
| `native-app/DELIVERY_ANALYSIS.md` | Mode 1 vs Mode 2 |
| `native-app/EVENT_STATE_MACHINE.md` | Event states |
| `native-app/AUDIT_REPORT.md` | Gap analysis |
| `backend/README.md` | API setup |

---

## 18. Implementation checklist (with verification status)

| Item | Status |
|------|--------|
| Full-stack org alert platform | IMPLEMENTED |
| Mode 1 scheduled offline execution | IMPLEMENTED · UNIT TESTED · DEVICE VALIDATION PENDING |
| Mode 2 immediate (foreground) | IMPLEMENTED · BEST-EFFORT |
| Mode 2 immediate (dead process) | PLATFORM-LIMITED · ORANGE without verified FCM |
| Alarm ringing UX (not notification-first) | IMPLEMENTED |
| Offline ACK/dismiss | IMPLEMENTED · UNIT TESTED |
| Audit remediation (9/9) | IMPLEMENTED |
| Versioned schedule reconcile (19:00→22:00) | IMPLEMENTED · UNIT TESTED |
| Recipient + broadcaster rules | IMPLEMENTED · server ACK auth hardened |
| Neomorphic UI | PARTIALLY IMPLEMENTED |
| Physical device matrix | NOT YET VERIFIED |

---

## 19. Change log

| Date | Area | Summary |
|------|------|---------|
| 2026-08-31 | Architecture | **Scheduled alarm ownership correction:** backend stores canonical UTC `scheduledAt`; Android `ScheduleTimeCalculator` computes delay from device clock; `AlarmManager` executes locally. Backend scheduler no longer broadcasts at fire time; ONCE alerts not auto-completed on server tick. Stale-alarm guards in `AlertBroadcastReceiver`. |
| 2026-08-31 | Docs + security | Master architecture alignment: `FINAL_PRODUCTION_VERIFICATION.md`, reliability terminology, alert ACK authorization |
| 2026-08-31 | Docs | Created development walkthrough; Cursor rule `.cursor/rules/development-walkthrough.mdc` |
| 2026-08-31 | Architecture | Audit items 1–9: ACK retry, dedupe, recipients, FCM hook, version, dismiss, timezone, occurrence, `AlarmSyncCoordinator` |
| 2026-08-31 | Android UI | Neomorphic design system + History/Schedule screens (partial) |
| 2026-08-31 | Alarm | `AlarmEngine` ringing stack replacing notification-first delivery |

*Append a row whenever you change behavior, APIs, schema, UI, config, or tests.*
