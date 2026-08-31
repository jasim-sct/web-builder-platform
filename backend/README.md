# Organization Alert & Reminder System Backend

A robust, modular, real-time Node.js & Express backend for managing organizations, users, dynamic group memberships, scheduled reminders, immediate alerts, and real-time Socket.IO broadcasts.

---

## 🌟 Features

* **Layered Architecture:** Controllers, Services, Models, Sockets, and Middlewares cleanly separated.
* **Centralized Alert Design:** Alerts target Groups dynamically. Changing group membership instantly reflects in future alert dispatches without modifying existing alert records.
* **Recurrence metadata (server):** Optional interval tick advances DAILY/WEEKLY `nextTriggerAt` for sync — **does not ring devices**. ONCE alerts are executed only on Android after sync.
* **Real-Time WebSockets:** Socket.IO for immediate broadcasts and live dashboard updates.
* **Delivery & Acknowledgement Tracking:** Records deliveries per participant and enables acknowledgment via REST or WebSockets.
* **Comprehensive Automated Test Suite:** Integrated with Jest, Supertest, and `mongodb-memory-server` for zero-setup execution.

---

## 🏛️ Architecture Overview

```text
Flutter Android / Web Client
          │
          │ (REST API & Socket.IO Events)
          ▼
      Express.js HTTP & WebSocket Server
          │
    ┌─────┴─────────────────────┐
    │                           │
 REST API Handlers        Socket.IO Manager
 (Controllers & Services)  (Rooms: Org / Group / User)
    │                           │
    └─────────────┬─────────────┘
                  │
        Centralized Services
   (Alert / Broadcast / Scheduler)
                  │
                  ▼
         Dynamic Group Resolver
       (Current Active Members)
                  │
                  ▼
          MongoDB (Mongoose)
   (Org, User, Group, Alert, Delivery)
```

---

## 🚀 Installation & Setup

### 1. Prerequisites

* **Node.js**: v18+ (tested on Node v24)
* **Package Manager**: `pnpm` (or `npm`)
* **MongoDB**: Local/Remote MongoDB instance (not required for tests, as `mongodb-memory-server` is built-in)

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Environment Configuration

The backend reads configuration from `.env` in development/production and `.env.test` during test execution.

Example `.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/organization-alert-system
NODE_ENV=development
SCHEDULER_INTERVAL_MS=1000
API_KEY=your-secret-api-key
```

### API Authentication

When `API_KEY` is set, all `/api/*` routes require the `X-API-Key` header matching that value. `/api/health` is always public. If `API_KEY` is unset (typical for local dev/tests), auth is disabled.

Socket clients must pass the same key via handshake `auth.apiKey`, the `X-API-Key` header, or `apiKey` in the `identify` payload when `API_KEY` is configured.

---

## 🏃 Running the Application

### Development Mode (Hot Reload)

```bash
pnpm run dev
```

### Production Mode

```bash
pnpm start
```

### Health Check

```http
GET http://localhost:5000/api/health
```

Example Response:
```json
{
  "success": true,
  "message": "Backend is healthy",
  "data": {
    "status": "UP",
    "uptime": "12.45s",
    "timestamp": "2026-08-31T06:00:00.000Z",
    "database": "connected",
    "env": "development"
  }
}
```

---

## 🧪 Testing & Coverage

Run the complete integration test suite:

```bash
pnpm test
```

Generate test coverage report:

```bash
pnpm run test:coverage
```

The test suite covers:
1. Organization CRUD & validation
2. User management, role assignment, and organization isolation
3. Group management and membership changes
4. Centralized group membership dynamic recipient resolution
5. Alert creation, scheduled triggering, recurrence (ONCE, DAILY, WEEKLY), and enabling/disabling
6. Direct broadcast (`/api/alerts/broadcast`) and immediate trigger (`/api/alerts/:id/trigger`)
7. Socket.IO room joins, group-targeted broadcasts, and acknowledgements

---

## 📚 REST API Reference

### Organizations (`/api/organizations`)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/organizations` | Create an organization |
| `GET` | `/api/organizations` | List organizations (supports `?isActive=`) |
| `GET` | `/api/organizations/:id` | Get organization details |
| `PUT` | `/api/organizations/:id` | Update organization details |
| `DELETE` | `/api/organizations/:id` | Delete an organization |

### Users (`/api/users`)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/users` | Create a user (`ADMIN` or `MEMBER`) |
| `GET` | `/api/users` | List users (`?organizationId=&role=&isActive=`) |
| `GET` | `/api/users/:id` | Get user details |
| `PUT` | `/api/users/:id` | Update user details or deactivate |
| `DELETE` | `/api/users/:id` | Delete a user |

### Groups (`/api/groups`)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/groups` | Create a group in an organization |
| `GET` | `/api/groups` | List groups (`?organizationId=&isActive=`) |
| `GET` | `/api/groups/:id` | Get group details with populated members |
| `PUT` | `/api/groups/:id` | Update group |
| `DELETE` | `/api/groups/:id` | Delete group |
| `GET` | `/api/groups/:id/members` | Get current group members |
| `POST` | `/api/groups/:id/members/:userId` | Add participant to group |
| `DELETE` | `/api/groups/:id/members/:userId` | Remove participant from group |

### Alerts (`/api/alerts`)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/alerts` | Create a scheduled alert |
| `GET` | `/api/alerts` | List alerts (`?organizationId=&groupId=&status=&priority=&date=`) |
| `GET` | `/api/alerts/upcoming` | List upcoming scheduled alerts |
| `GET` | `/api/alerts/history` | List triggered / completed alert history |
| `POST` | `/api/alerts/broadcast` | Broadcast an immediate alert to a group |
| `GET` | `/api/alerts/:id` | Get single alert details |
| `PUT` | `/api/alerts/:id` | Update alert details/schedule |
| `DELETE` | `/api/alerts/:id` | Delete alert and delivery records |
| `POST` | `/api/alerts/:id/enable` | Enable alert |
| `POST` | `/api/alerts/:id/disable` | Disable alert |
| `POST` | `/api/alerts/:id/trigger` | Manually trigger alert immediately |
| `POST` | `/api/alerts/:id/acknowledge` | Acknowledge alert receipt (`{ userId }`) |
| `GET` | `/api/alerts/:id/deliveries` | Get deliveries and acknowledgments for an alert |

---

## ⚡ Socket.IO Reference

### Server Connection & Identification

Connect client to Socket.IO and send the `identify` event:

```javascript
const socket = io("http://localhost:5000", {
  auth: { apiKey: process.env.API_KEY }, // when API_KEY is configured
});

// Identify on connection
socket.emit("identify", { userId: "<USER_ID>" }, (response) => {
  console.log("Joined rooms:", response.data.rooms);
});
```

### Client → Server Events

* `identify`: `{ userId: "..." }` — Joins `user:{userId}`, `organization:{orgId}`, and all groups user belongs to.
* `join:group`: `{ groupId: "..." }` — Explicitly join a group room.
* `leave:group`: `{ groupId: "..." }` — Explicitly leave a group room.
* `alert:acknowledge`: `{ alertId: "...", userId: "..." }` — Acknowledge an alert.

### Server → Client Events

* `alert:triggered`: Emitted to `group:{groupId}` when a scheduled or manual trigger occurs.
* `alert:broadcast`: Emitted to `group:{groupId}` on immediate broadcast.
* `alert:updated`: Emitted to `group:{groupId}` when an alert is edited.

#### Payload Example (`alert:triggered` / `alert:broadcast`):

```json
{
  "alertId": "65e0a123...",
  "title": "Sprint Daily Standup",
  "message": "Standup starting in Google Meet.",
  "priority": "HIGH",
  "groupId": "65e0a456...",
  "organizationId": "65e0a789...",
  "repeatType": "DAILY",
  "status": "SCHEDULED",
  "triggeredAt": "2026-08-31T10:00:00.000Z",
  "recipientCount": 5
}
```

---

## 🔁 Recurrence Logic

| Type | Behavior on Trigger |
|---|---|
| `ONCE` | Transitions status to `COMPLETED`, `nextTriggerAt` becomes `null`. |
| `DAILY` | Dispatches alert, calculates `nextTriggerAt = next day at UTC time`, status remains `SCHEDULED`. |
| `WEEKLY` | Dispatches alert, calculates `nextTriggerAt = next week at UTC time`, status remains `SCHEDULED`. |

---

## 🔒 Centralized Group Membership Behavior

Alerts reference only the `groupId`, never static arrays of users. When an alert is triggered (by schedule or manually):
1. Group membership is resolved in real time.
2. Only currently active members receive the Socket event and generate delivery records.
3. Adding or removing members dynamically alters who receives future alerts without editing the alert itself.
