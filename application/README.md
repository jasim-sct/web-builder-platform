# Organization Alert & Reminder System — Flutter Android Client

A lightweight, responsive, real-time Flutter Android application for the **Organization Alert & Reminder System**. The client connects directly to the Node.js + Express + MongoDB + Socket.IO backend for live broadcasts, recurring reminders, participant management, and acknowledgment tracking.

---

## 🌟 Key Features

* **Real-Time Live Alerts**: Persistent Socket.IO connection automatically joins scoped rooms (`organization:{id}`, `group:{id}`, `user:{id}`) and displays active alert overlays immediately upon dispatch.
* **Alert Feedback System**: Bundled sound effects (`assets/audio/alert.mp3`) and haptic vibration feedback for normal and urgent alerts.
* **Role-Aware Workflows**:
  * **Admin**: Manage participants (create/edit/delete/deactivate), create/manage groups, schedule recurring alerts (`ONCE`, `DAILY`, `WEEKLY`), trigger alerts immediately, broadcast urgent alerts to groups, and inspect delivery acknowledgements.
  * **Member**: View assigned groups, see upcoming reminders, receive real-time alerts, acknowledge alerts with one tap, and review alert history.
* **Dynamic Group Resolution**: Centralized alert targeting resolves current active group participants at trigger time without static user copying.
* **Clean Architecture**: Layered with Riverpod state management, Dio REST client, GoRouter navigation shell, and Material 3 design.

---

## 🏛️ Architecture

```text
Flutter UI (Widgets & Screens)
            │
      Riverpod State
(Auth, Users, Groups, Alerts, Socket)
      ┌─────┴─────────────────────┐
      │                           │
  Dio REST Client           Socket.IO Client
 (HTTP Endpoints)           (Live Events & Rooms)
      │                           │
      └─────────────┬─────────────┘
                    │
            Express.js Backend
         (REST API + WebSockets)
                    │
            MongoDB Database
```

---

## 📱 Getting Started & Installation

### 1. Prerequisites

* **Flutter SDK**: `>=3.3.0`
* **Dart SDK**: `>=3.3.0`
* **Backend Running**: Node.js backend running on port `5000` (from `../backend`)

### 2. Install Dependencies

```bash
cd application
flutter pub get
```

### 3. Backend Host Configuration

By default, the application connects to:
* **Android Emulator**: `http://10.0.2.2:5000`
* **Desktop / Web**: `http://localhost:5000`

To connect from a **physical Android device**:
1. Open the application and tap the ⚙️ **Settings icon** on the Sign In or Profile screen.
2. Enter your machine's local Wi-Fi IP address (e.g., `http://192.168.1.50:5000`).
3. Tap **Save & Refresh**.

---

## 🏃 Running the Application

### Launch on Android Emulator or Device:

```bash
flutter run
```

### Run Tests:

```bash
flutter test
```

### Analyze Code Quality:

```bash
flutter analyze
```

### Build Android Release APK:

```bash
flutter build apk --release
```

The output APK will be located at:
`build/app/outputs/flutter-apk/app-release.apk`

---

## ⚡ Socket.IO Real-Time Events

### Client → Server
* `identify`: `{ userId: "..." }` — Connects socket session and automatically joins user and group rooms.
* `alert:acknowledge`: `{ alertId: "...", userId: "..." }` — Emits real-time receipt confirmation.

### Server → Client
* `alert:triggered`: Received when a scheduled or manual trigger fires for a group the user belongs to.
* `alert:broadcast`: Received when an urgent broadcast is dispatched.
* `alert:updated`: Received when an existing alert definition is edited.

---

## 📂 Project Structure

```text
lib/
├── core/
│   ├── config/       # API endpoints & app constants
│   ├── constants/    # Status, Priority, Role constants
│   ├── network/      # Dio ApiClient, SocketClient, ApiException
│   ├── router/       # GoRouter configuration & role shells
│   ├── services/     # AlertFeedbackService & AlertSoundService
│   ├── storage/      # LocalStorage session manager
│   ├── theme/        # Material 3 colors, typography, theme
│   └── utils/        # DateFormatter & Validators
├── features/
│   ├── alerts/       # List, Details, Create, Edit, Broadcast, Sockets
│   ├── auth/         # Login, User Picker, Splash Screen
│   ├── dashboard/    # Admin & Member Dashboards
│   ├── groups/       # Group list, details, member assignment
│   ├── profile/      # Profile & server configuration
│   └── users/        # Participant directory & CRUD
├── models/           # Organization, User, Group, Alert, Delivery
├── shared/           # Reusable UI widgets, badges, dialogs, states
├── app.dart          # Root widget with active alert overlay
└── main.dart         # App entry point with ProviderScope
```
