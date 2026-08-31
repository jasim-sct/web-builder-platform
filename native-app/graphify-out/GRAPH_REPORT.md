# Graph Report - native-app  (2026-08-31)

## Corpus Check
- 89 files · ~47,904 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1009 nodes · 2162 edges · 70 communities (60 shown, 10 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 2 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `8dc5cabd`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- ApiService
- AlarmEngine
- Converters
- NotificationHelper
- TimezoneHelper
- AlarmRingingService
- Device Validation Gate (Production Gate)
- NavGraph.kt
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
- Alert
- AckManager.kt
- FINAL PRODUCTION VERIFICATION
- SocketManager
- Priority
- AlertReconciliationService
- RepeatType
- AlertsScreens.kt
- GroupsScreens.kt
- DiagnosticsScreen.kt
- AlertAlarmIdGenerator
- Alarm / Ringing System — Architecture & Validation
- QueueStatus
- EventStatus
- SetupScreen.kt
- SettingsScreen.kt
- AUDIT_REPORT: Native Android Background Event & Mandatory Receive System
- Native Android Organization Alert & Reminder Application (Kotlin)
- EventDto
- EventAlarmScheduler
- UserRole
- AckQueueDao
- EventEntities.kt
- AlertScheduler
- Receivers.kt
- AlertStatus
- EventReceivers.kt
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
- AlarmEligibilityLogicTest
- BACKGROUND_TEST_MATRIX: Real-World Device States & Acceptance Verification
- AlarmStopReason
- AlarmType
- DeliveryStatus
- PushAlarmReceiver.kt
- .createAlert
- RecurrenceHelperTest

## God Nodes (most connected - your core abstractions)
1. `UserPreferences` - 69 edges
2. `AppDatabase` - 41 edges
3. `ApiService` - 40 edges
4. `ApiResponseDto` - 39 edges
5. `Priority` - 38 edges
6. `Alert` - 38 edges
7. `EventStatus` - 30 edges
8. `EventEntity` - 30 edges
9. `FINAL PRODUCTION VERIFICATION` - 28 edges
10. `RepeatType` - 25 edges

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

## Communities (70 total, 10 thin omitted)

### Community 0 - "ApiService"
Cohesion: 0.07
Nodes (23): ApiClient, ApiService, com, AcknowledgeRequest, AlertDeliveryDto, AlertDto, ApiResponseDto, BroadcastNowRequest (+15 more)

### Community 1 - "AlarmEngine"
Cohesion: 0.27
Nodes (4): AlarmEligibilityChecker, AlarmEngine, Context, AlarmTrigger

### Community 3 - "NotificationHelper"
Cohesion: 0.12
Nodes (12): AlarmAudioController, Context, NotificationHelper, Bundle, ComponentActivity, Intent, MainActivity, NeoThemeProvider() (+4 more)

### Community 4 - "TimezoneHelper"
Cohesion: 0.13
Nodes (8): TimezoneHelper, HistoryItem, historyLabelAndTime(), HistoryScreen(), HistoryViewModel, StateFlow, ViewModel, TimezoneHelperTest

### Community 5 - "AlarmRingingService"
Cohesion: 0.16
Nodes (9): AlarmRingingService, Context, Intent, AlarmVibrationController, IBinder, Notification, PowerManager, Service (+1 more)

### Community 6 - "Device Validation Gate (Production Gate)"
Cohesion: 0.20
Nodes (9): adb Helpers (optional), Business scenario tests (device required), Device Validation Gate (Production Gate), Final verdict progression, Gate Test — 16 Steps, Prerequisites, Record Results, Remaining code gates (before `PRODUCTION READY`) (+1 more)

### Community 7 - "NavGraph.kt"
Cohesion: 0.17
Nodes (20): DetailRow(), EmptyStateView(), Modifier, AppBottomBar(), AlertsListScreen(), GroupsListScreen(), ViewModel, SplashScreen() (+12 more)

### Community 8 - "UserPreferences"
Cohesion: 0.08
Nodes (4): Context, StateFlow, UserPreferences, SharedPreferences

### Community 9 - "Screen"
Cohesion: 0.08
Nodes (17): AlertDetails, AlertsList, CreateEditAlert, CreateEditGroup, CreateEditUser, Dashboard, Diagnostics, GroupDetails (+9 more)

### Community 10 - "AlertEntity"
Cohesion: 0.05
Nodes (15): Context, AlertDao, AlertDeliveryDao, GroupDao, Flow, OrganizationDao, UserDao, AlertDeliveryEntity (+7 more)

### Community 11 - "EventEntity"
Cohesion: 0.15
Nodes (4): EventDao, com, Flow, EventEntity

### Community 12 - "NeoComponents.kt"
Cohesion: 0.20
Nodes (20): formatScheduleDate(), StateFlow, ViewModel, ScheduleScreen(), ScheduleViewModel, androidx, Modifier, NeoAppShell() (+12 more)

### Community 13 - "FINAL_VERIFICATION_REPORT: Adversarial Reliability & Platform Audit"
Cohesion: 0.10
Nodes (20): 10. Permission Verification, 11. Concurrency Verification, 12. Firebase Dependency Audit, 13. Build Verification, 14. Automated Tests, 15. Physical Device Tests, 16. OEM Limitations, 17. Known Android Limitations (+12 more)

### Community 14 - "SyncManager.kt"
Cohesion: 0.15
Nodes (12): AlertApplication, DeviceRegistrationManager, Context, RegisterDeviceRequest, Error, Idle, StateFlow, Success (+4 more)

### Community 15 - "AppDatabase"
Cohesion: 0.22
Nodes (5): android, AppDatabase, AppModule, com, Context

### Community 16 - "DashboardScreen.kt"
Cohesion: 0.15
Nodes (22): SocketConnectionState, CONNECTED, CONNECTING, DISCONNECTED, ERROR, AlertCard(), ConnectionStatusBadge(), GroupCard() (+14 more)

### Community 17 - "emulator-runner.sh"
Cohesion: 0.20
Nodes (16): accel_args(), adb_cmd(), configure_avd_cold_boot(), configure_avd_performance(), ensure_avd(), gpu_args(), install_apk(), launch_app() (+8 more)

### Community 18 - "Dp"
Cohesion: 0.22
Nodes (11): AppNavRail(), NavItem, Color, Modifier, neoFloating(), neoInset(), neoRaised(), NeoColorScheme (+3 more)

### Community 19 - "Alert"
Cohesion: 0.08
Nodes (13): AlertReconciliationResult, ScheduleTimeCalculator, AlertRepository, GroupRepository, Flow, Result, UserRepository, Alert (+5 more)

### Community 20 - "AckManager.kt"
Cohesion: 0.30
Nodes (7): AckManager, Context, Result, ResilientAckWorker, AckQueueEntity, ReceiveEventRequest, CoroutineWorker

### Community 21 - "FINAL PRODUCTION VERIFICATION"
Cohesion: 0.05
Nodes (40): 10. Exact Alarm Handling, 11. Full-Screen Alarm Handling, 12. Audio/Ringing Behavior, 13. Sync/Reconciliation, 14. Duplicate Prevention, 15. ACK/Dismiss Reliability, 16. Recipient Security, 17. Group Membership Semantics (+32 more)

### Community 22 - "SocketManager"
Cohesion: 0.36
Nodes (3): StateFlow, SocketManager, Socket

### Community 23 - "Priority"
Cohesion: 0.20
Nodes (10): Priority, HIGH, LOW, NORMAL, URGENT, AlarmRingingScreen(), Bundle, ComponentActivity (+2 more)

### Community 25 - "RepeatType"
Cohesion: 0.22
Nodes (5): RecurrenceHelper, RepeatType, DAILY, ONCE, WEEKLY

### Community 26 - "AlertsScreens.kt"
Cohesion: 0.15
Nodes (14): AlertDetailsScreen(), AlertFilter, ALL, CANCELLED, COMPLETED, TODAY, TOMORROW, UPCOMING (+6 more)

### Community 27 - "GroupsScreens.kt"
Cohesion: 0.29
Nodes (7): CreateEditGroupScreen(), GroupDetailsScreen(), GroupsViewModel, StateFlow, ViewModel, NeoDetailScaffold(), NeoPageHeader()

### Community 28 - "DiagnosticsScreen.kt"
Cohesion: 0.33
Nodes (8): DiagnosticsScreen(), DiagnosticsUiState, DiagnosticsViewModel, androidx, StateFlow, ViewModel, StatusRow(), TimelineStep

### Community 29 - "AlertAlarmIdGenerator"
Cohesion: 0.15
Nodes (3): AlertAlarmIdGenerator, AlertAlarmIdGeneratorTest, EventAlarmSchedulerTest

### Community 30 - "Alarm / Ringing System — Architecture & Validation"
Cohesion: 0.17
Nodes (11): Alarm / Ringing System — Architecture & Validation, Android Platform Restrictions, Changed / Created Files, Flows, Immediate alarm, Not Claimed Without Device Testing, Overview, Reboot recovery (+3 more)

### Community 31 - "QueueStatus"
Cohesion: 0.22
Nodes (6): QueueStatus, FAILED, IN_PROGRESS, PENDING, SUCCESS, OfflineAckQueueTest

### Community 32 - "EventStatus"
Cohesion: 0.12
Nodes (12): EventStatus, CANCELLED, DISMISSED, EXPIRED, MISSED, PRESENTATION_BLOCKED, PRESENTED, RECEIVED (+4 more)

### Community 33 - "SetupScreen.kt"
Cohesion: 0.32
Nodes (6): ErrorBanner(), StateFlow, ViewModel, SetupScreen(), SetupUiState, SetupViewModel

### Community 34 - "SettingsScreen.kt"
Cohesion: 0.33
Nodes (5): StateFlow, ViewModel, SettingsScreen(), SettingsUiState, SettingsViewModel

### Community 35 - "AUDIT_REPORT: Native Android Background Event & Mandatory Receive System"
Cohesion: 0.20
Nodes (9): A. Correct Implementations, AUDIT_REPORT: Native Android Background Event & Mandatory Receive System, B. Incorrect Assumptions & Overstated Claims, C. Missing Functionality, D. Android Platform Risks & Mitigations, E. Google Play Policy Risks, 📋 Executive Summary, F. Reliability & Concurrency Risks (+1 more)

### Community 36 - "Native Android Organization Alert & Reminder Application (Kotlin)"
Cohesion: 0.20
Nodes (9): 📱 Application Screens, 🌟 Core Architecture & Zero-Firebase Guarantee, Emulator (script), Manual device steps, Native Android Organization Alert & Reminder Application (Kotlin), 📋 Physical Device Acceptance Test Procedure, ⚡ Real-Time Socket.IO vs Local Scheduling, 🛠️ Technology Stack (+1 more)

### Community 38 - "EventAlarmScheduler"
Cohesion: 0.39
Nodes (3): EventAlarmScheduler, Context, ReconciliationResult

### Community 39 - "UserRole"
Cohesion: 0.22
Nodes (4): TypeToken, UserRole, ADMIN, MEMBER

### Community 42 - "AlertScheduler"
Cohesion: 0.33
Nodes (3): AlertScheduler, Context, Intent

### Community 43 - "Receivers.kt"
Cohesion: 0.46
Nodes (5): AlertBroadcastReceiver, BootCompletedReceiver, BroadcastReceiver, Context, Intent

### Community 44 - "AlertStatus"
Cohesion: 0.20
Nodes (7): AlertStatus, CANCELLED, COMPLETED, DISABLED, MISSED, SCHEDULED, TRIGGERED

### Community 45 - "EventReceivers.kt"
Cohesion: 0.46
Nodes (5): EventAlarmReceiver, BroadcastReceiver, Context, Intent, TimezoneChangeReceiver

### Community 46 - "🧩 Architectural Component Descriptions"
Cohesion: 0.25
Nodes (7): 1. System A — Remote Event Delivery Layer, 2. System B — Local Event Scheduling Layer, 3. System C — Device → Backend Acknowledgement Pipeline, 🧩 Architectural Component Descriptions, ARCHITECTURE_FINAL: Native Android Background Event & Mandatory Receive System, 🔒 Security & Idempotency Guarantees, 🏛️ System Overview

### Community 47 - "AckStatus"
Cohesion: 0.17
Nodes (7): AckStatus, CONFIRMED, FAILED, NOT_REQUIRED, PENDING, SENDING, EventLifecycleStateTest

### Community 48 - "DELIVERY_ANALYSIS: Server → Device Delivery in a Firebase-Free Architecture"
Cohesion: 0.25
Nodes (7): 🏛️ Android OS Background Execution Rules (API 26+), ⚖️ Architectural Verdict & Recommendations, 📋 Comprehensive Platform Capability Matrix, 🎯 Critical Architectural Question, DELIVERY_ANALYSIS: Server → Device Delivery in a Firebase-Free Architecture, 📦 Delivery vs Execution (do not conflate), 📊 Dual-Mode Delivery Model

### Community 49 - "EVENT_STATE_MACHINE: Decoupled Lifecycle & Transport States"
Cohesion: 0.29
Nodes (6): 🔄 1. Event Lifecycle State Machine (Local Execution), 📡 2. Acknowledgement Transport State Machine (Network Delivery), EVENT_STATE_MACHINE: Decoupled Lifecycle & Transport States, 🎯 Key Design Rule: Three Orthogonal Dimensions, Valid ACK Transport States:, Valid Event Lifecycle States:

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

### Community 64 - "AlarmStopReason"
Cohesion: 0.29
Nodes (5): AlarmStopReason, ACKNOWLEDGED, DISMISSED, ERROR, SUPERSEDED

### Community 65 - "AlarmType"
Cohesion: 0.29
Nodes (3): AlarmType, IMMEDIATE_ALARM, SCHEDULED_ALARM

### Community 66 - "DeliveryStatus"
Cohesion: 0.29
Nodes (3): DeliveryStatus, ACKNOWLEDGED, DELIVERED

### Community 67 - "PushAlarmReceiver.kt"
Cohesion: 0.53
Nodes (4): BroadcastReceiver, Context, Intent, PushAlarmReceiver

## Knowledge Gaps
- **186 isolated node(s):** `ACKNOWLEDGED`, `DISMISSED`, `SUPERSEDED`, `ERROR`, `SCHEDULED` (+181 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **10 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `UserPreferences` connect `UserPreferences` to `ApiService`, `AlarmEngine`, `NotificationHelper`, `NavGraph.kt`, `SyncManager.kt`, `AppDatabase`, `DashboardScreen.kt`, `AckManager.kt`, `SocketManager`, `Priority`, `AlertReconciliationService`, `AlertsScreens.kt`, `GroupsScreens.kt`, `DiagnosticsScreen.kt`, `EventStatus`, `SetupScreen.kt`, `SettingsScreen.kt`, `AlertScheduler`, `Receivers.kt`, `EventReceivers.kt`, `PresentationEngine`?**
  _High betweenness centrality (0.149) - this node is a cross-community bridge._
- **Why does `Priority` connect `Priority` to `ApiService`, `Converters`, `NotificationHelper`, `AlertEntity`, `SyncManager.kt`, `DashboardScreen.kt`, `Alert`, `SocketManager`, `AlertReconciliationService`, `AlertsScreens.kt`, `DiagnosticsScreen.kt`, `AlertAlarmIdGenerator`, `QueueStatus`, `EventStatus`, `UserRole`, `EventEntities.kt`, `Receivers.kt`, `EventReceivers.kt`, `AlarmStopReason`, `DeliveryStatus`, `PushAlarmReceiver.kt`?**
  _High betweenness centrality (0.073) - this node is a cross-community bridge._
- **Why does `AppDatabase` connect `AppDatabase` to `ApiService`, `AlarmEngine`, `TimezoneHelper`, `AlertEntity`, `EventEntity`, `SyncManager.kt`, `AckManager.kt`, `Priority`, `AlertReconciliationService`, `DiagnosticsScreen.kt`, `EventStatus`, `EventAlarmScheduler`, `AckQueueDao`, `EventEntities.kt`, `AlertScheduler`, `Receivers.kt`, `EventReceivers.kt`, `PresentationEngine`, `AlarmSyncCoordinator`, `PushAlarmReceiver.kt`?**
  _High betweenness centrality (0.070) - this node is a cross-community bridge._
- **What connects `ACKNOWLEDGED`, `DISMISSED`, `SUPERSEDED` to the rest of the system?**
  _186 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `ApiService` be split into smaller, more focused modules?**
  _Cohesion score 0.07126207126207126 - nodes in this community are weakly interconnected._
- **Should `NotificationHelper` be split into smaller, more focused modules?**
  _Cohesion score 0.12183908045977011 - nodes in this community are weakly interconnected._
- **Should `TimezoneHelper` be split into smaller, more focused modules?**
  _Cohesion score 0.12631578947368421 - nodes in this community are weakly interconnected._