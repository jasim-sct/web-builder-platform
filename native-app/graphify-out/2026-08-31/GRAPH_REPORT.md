# Graph Report - native-app  (2026-08-31)

## Corpus Check
- 87 files · ~46,468 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 971 nodes · 2101 edges · 64 communities (56 shown, 8 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 2 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `8dc5cabd`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- ApiService
- AlarmType
- Converters
- Priority
- DiagnosticsScreen.kt
- AlarmRingingService
- FINAL_PRODUCTION_VERIFICATION
- GroupsScreens.kt
- UserPreferences
- Screen
- AlertEntity
- EventEntity
- NeoComponents.kt
- FINAL_VERIFICATION_REPORT: Adversarial Reliability & Platform Audit
- SyncManager.kt
- AppDatabase
- DashboardScreen.kt
- emulator-runner.sh
- Dp
- Group
- AckManager.kt
- AlertDeliveryEntity
- SocketManager
- Entities.kt
- AlertReconciliationService
- RepeatType
- AlertsScreens.kt
- GroupEntity
- UserEntity
- AlertAlarmIdGenerator
- Alarm / Ringing System — Architecture & Validation
- QueueStatus
- EventStatus
- SetupScreen.kt
- NavGraph.kt
- AUDIT_REPORT: Native Android Background Event & Mandatory Receive System
- Native Android Organization Alert & Reminder Application (Kotlin)
- EventDto
- EventAlarmScheduler
- Alert
- AckQueueDao
- EventDaos.kt
- AlertScheduler
- Receivers.kt
- AlertFilter
- HistoryScreen.kt
- 🧩 Architectural Component Descriptions
- AckStatus
- DELIVERY_ANALYSIS: Server → Device Delivery in a Firebase-Free Architecture
- EVENT_STATE_MACHINE: Decoupled Lifecycle & Transport States
- PresentationEngine
- CROSS_CHECK_REPORT: Comprehensive Verification & Reality Alignment
- AlarmSyncCoordinator
- ScheduleView
- gradlew
- PHYSICAL_DEVICE_RESULTS: Hardware Testing Matrix & Latency Validation
- ANDROID_PERMISSION_MATRIX: Background Execution & Permissions
- AppDatabase.kt
- BACKGROUND_TEST_MATRIX: Real-World Device States & Acceptance Verification

## God Nodes (most connected - your core abstractions)
1. `UserPreferences` - 69 edges
2. `AppDatabase` - 41 edges
3. `ApiService` - 40 edges
4. `ApiResponseDto` - 39 edges
5. `Priority` - 37 edges
6. `EventStatus` - 30 edges
7. `EventEntity` - 30 edges
8. `Alert` - 29 edges
9. `Converters` - 23 edges
10. `AlertStatus` - 23 edges

## Surprising Connections (you probably didn't know these)
- `AlertApplication` --references--> `NotificationHelper`  [EXTRACTED]
  app/src/main/java/com/example/organizationalert/AlertApplication.kt → app/src/main/java/com/example/organizationalert/core/notifications/NotificationHelper.kt
- `AlertApplication` --references--> `UserPreferences`  [EXTRACTED]
  app/src/main/java/com/example/organizationalert/AlertApplication.kt → app/src/main/java/com/example/organizationalert/core/preferences/UserPreferences.kt
- `AlertApplication` --references--> `SocketManager`  [EXTRACTED]
  app/src/main/java/com/example/organizationalert/AlertApplication.kt → app/src/main/java/com/example/organizationalert/core/socket/SocketManager.kt
- `MainActivity` --references--> `UserPreferences`  [EXTRACTED]
  app/src/main/java/com/example/organizationalert/MainActivity.kt → app/src/main/java/com/example/organizationalert/core/preferences/UserPreferences.kt
- `MandatoryReceiveActivity` --references--> `AckManager`  [EXTRACTED]
  app/src/main/java/com/example/organizationalert/ui/feature/receive/MandatoryReceiveActivity.kt → app/src/main/java/com/example/organizationalert/core/ack/AckManager.kt

## Import Cycles
- None detected.

## Communities (64 total, 8 thin omitted)

### Community 0 - "ApiService"
Cohesion: 0.07
Nodes (23): ApiClient, ApiService, com, AcknowledgeRequest, AlertDeliveryDto, AlertDto, ApiResponseDto, BroadcastNowRequest (+15 more)

### Community 1 - "AlarmType"
Cohesion: 0.07
Nodes (19): AlarmEligibilityChecker, AlarmEngine, Context, AlarmStopReason, ACKNOWLEDGED, DISMISSED, ERROR, SUPERSEDED (+11 more)

### Community 2 - "Converters"
Cohesion: 0.06
Nodes (16): Converters, TypeToken, com, AlertStatus, CANCELLED, COMPLETED, DISABLED, MISSED (+8 more)

### Community 3 - "Priority"
Cohesion: 0.08
Nodes (22): Context, NotificationHelper, Priority, HIGH, LOW, NORMAL, URGENT, Bundle (+14 more)

### Community 4 - "DiagnosticsScreen.kt"
Cohesion: 0.09
Nodes (16): TimezoneHelper, DetailRow(), DiagnosticsScreen(), DiagnosticsUiState, DiagnosticsViewModel, androidx, StateFlow, ViewModel (+8 more)

### Community 5 - "AlarmRingingService"
Cohesion: 0.11
Nodes (13): AlarmAudioController, AlarmRingingService, Context, Intent, AlarmVibrationController, AudioFocusRequest, IBinder, MediaPlayer (+5 more)

### Community 6 - "FINAL_PRODUCTION_VERIFICATION"
Cohesion: 0.06
Nodes (29): adb Helpers (optional), Device Validation Gate (Production Gate), Final verdict progression, Gate Test — 16 Steps, Prerequisites, Record Results, Remaining code gates (before `PRODUCTION READY`), 10. Database Verification (+21 more)

### Community 7 - "GroupsScreens.kt"
Cohesion: 0.16
Nodes (18): User, EmptyStateView(), UserCard(), CreateEditGroupScreen(), GroupDetailsScreen(), GroupsListScreen(), GroupsViewModel, StateFlow (+10 more)

### Community 8 - "UserPreferences"
Cohesion: 0.08
Nodes (4): Context, StateFlow, UserPreferences, SharedPreferences

### Community 9 - "Screen"
Cohesion: 0.08
Nodes (17): AlertDetails, AlertsList, CreateEditAlert, CreateEditGroup, CreateEditUser, Dashboard, Diagnostics, GroupDetails (+9 more)

### Community 10 - "AlertEntity"
Cohesion: 0.14
Nodes (3): AlertDao, Flow, AlertEntity

### Community 11 - "EventEntity"
Cohesion: 0.14
Nodes (4): EventDao, com, Flow, EventEntity

### Community 12 - "NeoComponents.kt"
Cohesion: 0.20
Nodes (19): formatScheduleDate(), StateFlow, ViewModel, ScheduleScreen(), ScheduleViewModel, androidx, Color, Modifier (+11 more)

### Community 13 - "FINAL_VERIFICATION_REPORT: Adversarial Reliability & Platform Audit"
Cohesion: 0.10
Nodes (20): 10. Permission Verification, 11. Concurrency Verification, 12. Firebase Dependency Audit, 13. Build Verification, 14. Automated Tests, 15. Physical Device Tests, 16. OEM Limitations, 17. Known Android Limitations (+12 more)

### Community 14 - "SyncManager.kt"
Cohesion: 0.15
Nodes (12): AlertApplication, DeviceRegistrationManager, Context, RegisterDeviceRequest, Error, Idle, StateFlow, Success (+4 more)

### Community 15 - "AppDatabase"
Cohesion: 0.20
Nodes (5): AppDatabase, AppModule, com, Context, ImmediateEventStore

### Community 16 - "DashboardScreen.kt"
Cohesion: 0.22
Nodes (16): AlertCard(), ConnectionStatusBadge(), GroupCard(), Modifier, NextAlertCard(), PriorityBadge(), RepeatBadge(), StatusBadge() (+8 more)

### Community 17 - "emulator-runner.sh"
Cohesion: 0.20
Nodes (16): accel_args(), adb_cmd(), configure_avd_cold_boot(), configure_avd_performance(), ensure_avd(), gpu_args(), install_apk(), launch_app() (+8 more)

### Community 18 - "Dp"
Cohesion: 0.19
Nodes (13): AppNavRail(), NavItem, Color, Modifier, neoBackgroundColor(), neoFloating(), neoInset(), neoRaised() (+5 more)

### Community 19 - "Group"
Cohesion: 0.19
Nodes (4): GroupRepository, Result, UserRepository, Group

### Community 20 - "AckManager.kt"
Cohesion: 0.30
Nodes (7): AckManager, Context, Result, ResilientAckWorker, AckQueueEntity, ReceiveEventRequest, CoroutineWorker

### Community 21 - "AlertDeliveryEntity"
Cohesion: 0.17
Nodes (4): AlertDeliveryDao, AlertDeliveryEntity, Result, AlertDelivery

### Community 22 - "SocketManager"
Cohesion: 0.19
Nodes (8): StateFlow, SocketConnectionState, CONNECTED, CONNECTING, DISCONNECTED, ERROR, SocketManager, Socket

### Community 23 - "Entities.kt"
Cohesion: 0.19
Nodes (5): OrganizationDao, OrganizationEntity, Membership, Organization, SyncData

### Community 24 - "AlertReconciliationService"
Cohesion: 0.23
Nodes (3): AlertReconciliationResult, AlertReconciliationService, AlertReconciliationServiceTest

### Community 25 - "RepeatType"
Cohesion: 0.16
Nodes (6): RecurrenceHelper, RepeatType, DAILY, ONCE, WEEKLY, RecurrenceHelperTest

### Community 26 - "AlertsScreens.kt"
Cohesion: 0.29
Nodes (7): AlertDetailsScreen(), AlertsListUiState, AlertsViewModel, CreateEditAlertScreen(), DetailRow(), StateFlow, ViewModel

### Community 29 - "AlertAlarmIdGenerator"
Cohesion: 0.15
Nodes (3): AlertAlarmIdGenerator, AlertAlarmIdGeneratorTest, EventAlarmSchedulerTest

### Community 30 - "Alarm / Ringing System — Architecture & Validation"
Cohesion: 0.17
Nodes (11): Alarm / Ringing System — Architecture & Validation, Android Platform Restrictions, Changed / Created Files, Flows, Immediate alarm, Not Claimed Without Device Testing, Overview, Reboot recovery (+3 more)

### Community 31 - "QueueStatus"
Cohesion: 0.17
Nodes (7): QueueStatus, FAILED, IN_PROGRESS, PENDING, SUCCESS, EventLifecycleStateTest, OfflineAckQueueTest

### Community 32 - "EventStatus"
Cohesion: 0.17
Nodes (11): EventStatus, CANCELLED, DISMISSED, EXPIRED, MISSED, PRESENTATION_BLOCKED, PRESENTED, RECEIVED (+3 more)

### Community 33 - "SetupScreen.kt"
Cohesion: 0.32
Nodes (6): ErrorBanner(), StateFlow, ViewModel, SetupScreen(), SetupUiState, SetupViewModel

### Community 34 - "NavGraph.kt"
Cohesion: 0.36
Nodes (8): AppBottomBar(), AlertsListScreen(), ViewModel, SplashScreen(), SplashViewModel, AppNavHostContent(), AppNavigation(), NavHostController

### Community 35 - "AUDIT_REPORT: Native Android Background Event & Mandatory Receive System"
Cohesion: 0.20
Nodes (9): A. Correct Implementations, AUDIT_REPORT: Native Android Background Event & Mandatory Receive System, B. Incorrect Assumptions & Overstated Claims, C. Missing Functionality, D. Android Platform Risks & Mitigations, E. Google Play Policy Risks, 📋 Executive Summary, F. Reliability & Concurrency Risks (+1 more)

### Community 36 - "Native Android Organization Alert & Reminder Application (Kotlin)"
Cohesion: 0.20
Nodes (9): 📱 Application Screens, 🌟 Core Architecture & Zero-Firebase Guarantee, Emulator (script), Manual device steps, Native Android Organization Alert & Reminder Application (Kotlin), 📋 Physical Device Acceptance Test Procedure, ⚡ Real-Time Socket.IO vs Local Scheduling, 🛠️ Technology Stack (+1 more)

### Community 38 - "EventAlarmScheduler"
Cohesion: 0.39
Nodes (3): EventAlarmScheduler, Context, ReconciliationResult

### Community 39 - "Alert"
Cohesion: 0.47
Nodes (3): AlertRepository, Flow, Alert

### Community 42 - "AlertScheduler"
Cohesion: 0.39
Nodes (3): AlertScheduler, Context, Intent

### Community 43 - "Receivers.kt"
Cohesion: 0.46
Nodes (5): AlertBroadcastReceiver, BootCompletedReceiver, BroadcastReceiver, Context, Intent

### Community 44 - "AlertFilter"
Cohesion: 0.25
Nodes (7): AlertFilter, ALL, CANCELLED, COMPLETED, TODAY, TOMORROW, UPCOMING

### Community 45 - "HistoryScreen.kt"
Cohesion: 0.46
Nodes (7): HistoryItem, historyLabelAndTime(), HistoryScreen(), HistoryViewModel, StateFlow, ViewModel, NeoEmptyState()

### Community 46 - "🧩 Architectural Component Descriptions"
Cohesion: 0.25
Nodes (7): 1. System A — Remote Event Delivery Layer, 2. System B — Local Event Scheduling Layer, 3. System C — Device → Backend Acknowledgement Pipeline, 🧩 Architectural Component Descriptions, ARCHITECTURE_FINAL: Native Android Background Event & Mandatory Receive System, 🔒 Security & Idempotency Guarantees, 🏛️ System Overview

### Community 47 - "AckStatus"
Cohesion: 0.29
Nodes (6): AckStatus, CONFIRMED, FAILED, NOT_REQUIRED, PENDING, SENDING

### Community 48 - "DELIVERY_ANALYSIS: Server → Device Delivery in a Firebase-Free Architecture"
Cohesion: 0.29
Nodes (6): 🏛️ Android OS Background Execution Rules (API 26+), ⚖️ Architectural Verdict & Recommendations, 📋 Comprehensive Platform Capability Matrix, 🎯 Critical Architectural Question, DELIVERY_ANALYSIS: Server → Device Delivery in a Firebase-Free Architecture, 📊 Dual-Mode Delivery Model

### Community 49 - "EVENT_STATE_MACHINE: Decoupled Lifecycle & Transport States"
Cohesion: 0.29
Nodes (6): 🔄 1. Event Lifecycle State Machine (Local Display), 📡 2. Acknowledgement Transport State Machine (Network Delivery), EVENT_STATE_MACHINE: Decoupled Lifecycle & Transport States, 🎯 Key Design Rule: Complete State Orthogonality, Valid ACK Transport States:, Valid Event Lifecycle States:

### Community 51 - "CROSS_CHECK_REPORT: Comprehensive Verification & Reality Alignment"
Cohesion: 0.33
Nodes (5): CROSS_CHECK_REPORT: Comprehensive Verification & Reality Alignment, 🔍 Section I: Document Claim vs. Actual Implementation vs. Android Reality, 🎯 Section II: Direct Answer to the Core Architectural Question, 🔒 Section III: Decoupled Three-System Architecture, The Technical Reality:

### Community 53 - "ScheduleView"
Cohesion: 0.40
Nodes (5): ScheduleView, AGENDA, DAY, MONTH, WEEK

### Community 54 - "gradlew"
Cohesion: 0.60
Nodes (3): gradlew script, die(), warn()

### Community 55 - "PHYSICAL_DEVICE_RESULTS: Hardware Testing Matrix & Latency Validation"
Cohesion: 0.40
Nodes (4): 📱 Hardware & OS Validation Matrix, ⏱️ Latency Calculation Breakdown, Observations:, PHYSICAL_DEVICE_RESULTS: Hardware Testing Matrix & Latency Validation

### Community 56 - "ANDROID_PERMISSION_MATRIX: Background Execution & Permissions"
Cohesion: 0.50
Nodes (3): ANDROID_PERMISSION_MATRIX: Background Execution & Permissions, 📋 Comprehensive Permission Matrix, 🔄 Permission Revocation Handling Workflow

### Community 58 - "BACKGROUND_TEST_MATRIX: Real-World Device States & Acceptance Verification"
Cohesion: 0.50
Nodes (3): BACKGROUND_TEST_MATRIX: Real-World Device States & Acceptance Verification, 📱 Comprehensive Test Matrix, ⏱️ Latency Measurement Guidelines for Physical Device Acceptance Testing

## Knowledge Gaps
- **167 isolated node(s):** `ACKNOWLEDGED`, `DISMISSED`, `SUPERSEDED`, `ERROR`, `SCHEDULED` (+162 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `UserPreferences` connect `UserPreferences` to `ApiService`, `AlarmType`, `SetupScreen.kt`, `Priority`, `DiagnosticsScreen.kt`, `NavGraph.kt`, `GroupsScreens.kt`, `Receivers.kt`, `SyncManager.kt`, `AppDatabase`, `DashboardScreen.kt`, `PresentationEngine`, `AckManager.kt`, `SocketManager`, `AlertsScreens.kt`?**
  _High betweenness centrality (0.140) - this node is a cross-community bridge._
- **Why does `Priority` connect `Priority` to `ApiService`, `AlarmType`, `Converters`, `DiagnosticsScreen.kt`, `Alert`, `Receivers.kt`, `SyncManager.kt`, `AppDatabase`, `AckStatus`, `DashboardScreen.kt`, `SocketManager`, `Entities.kt`, `AlertReconciliationService`, `AlertsScreens.kt`, `AlertAlarmIdGenerator`, `QueueStatus`?**
  _High betweenness centrality (0.089) - this node is a cross-community bridge._
- **Why does `AppDatabase` connect `AppDatabase` to `ApiService`, `AlarmType`, `Priority`, `DiagnosticsScreen.kt`, `AlertEntity`, `EventEntity`, `SyncManager.kt`, `AckManager.kt`, `AlertDeliveryEntity`, `SocketManager`, `Entities.kt`, `GroupEntity`, `UserEntity`, `EventAlarmScheduler`, `AckQueueDao`, `EventDaos.kt`, `Receivers.kt`, `HistoryScreen.kt`, `PresentationEngine`, `AlarmSyncCoordinator`, `AppDatabase.kt`?**
  _High betweenness centrality (0.067) - this node is a cross-community bridge._
- **What connects `ACKNOWLEDGED`, `DISMISSED`, `SUPERSEDED` to the rest of the system?**
  _167 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `ApiService` be split into smaller, more focused modules?**
  _Cohesion score 0.07126207126207126 - nodes in this community are weakly interconnected._
- **Should `AlarmType` be split into smaller, more focused modules?**
  _Cohesion score 0.07272727272727272 - nodes in this community are weakly interconnected._
- **Should `Converters` be split into smaller, more focused modules?**
  _Cohesion score 0.0595959595959596 - nodes in this community are weakly interconnected._