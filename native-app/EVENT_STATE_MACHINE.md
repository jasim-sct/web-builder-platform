# EVENT_STATE_MACHINE: Decoupled Lifecycle & Transport States

**Date:** 2026-08-31  

---

## 🔄 1. Event Lifecycle State Machine (Local Execution)

The **Event Lifecycle State** tracks local execution on the device (not network delivery):

```mermaid
stateDiagram-v2
    [*] --> SCHEDULED: Persisted in Room DB
    SCHEDULED --> TRIGGERED: AlarmManager fires
    TRIGGERED --> RINGING: AlarmEngine claims session
    RINGING --> PRESENTED: Full-screen / alarm UI shown
    TRIGGERED --> PRESENTATION_BLOCKED: Ineligible or permission denied
    PRESENTED --> RECEIVED: User ACKNOWLEDGE
    PRESENTED --> DISMISSED: User DISMISS
    SCHEDULED --> CANCELLED: Cancelled by backend
    SCHEDULED --> EXPIRED: expiresAt before trigger
    RINGING --> EXPIRED: expiresAt during ring
    RECEIVED --> [*]
    DISMISSED --> [*]
```

### Valid Event Lifecycle States:
* `SCHEDULED` — future `scheduledAt`; AlarmManager registered.
* `TRIGGERED` — receiver woke; about to ring.
* `RINGING` — `AlarmEngine` claimed session; audio/FGS active.
* `PRESENTED` — UI displayed (legacy; may overlap RINGING).
* `PRESENTATION_BLOCKED` — suppressed (ineligible, expired, permissions).
* `RECEIVED` / `DISMISSED` — user terminal actions.
* `EXPIRED` / `CANCELLED` — system/admin terminal states.

**Alarm ≠ notification.** Critical path is ring + full-screen UI, not notification-shade-only.

---

## 📡 2. Acknowledgement Transport State Machine (Network Delivery)

The **ACK Transport State** tracks the delivery of the user's receipt confirmation to the backend:

```mermaid
stateDiagram-v2
    [*] --> NOT_REQUIRED: Event does not require acknowledgement
    [*] --> PENDING: User pressed RECEIVE (offline or online)
    PENDING --> SENDING: ResilientAckWorker Started
    SENDING --> CONFIRMED: Backend returned HTTP 200 OK
    SENDING --> FAILED: Network error / HTTP 5xx
    FAILED --> SENDING: Exponential Backoff Retry (WorkManager)
    CONFIRMED --> [*]
```

### Valid ACK Transport States:
* `NOT_REQUIRED`: Informational broadcast not requiring receipt.
* `PENDING`: Enqueued in Room `ack_queue`, waiting for `WorkManager` execution.
* `SENDING`: Currently in-flight over HTTP.
* `CONFIRMED`: Backend confirmed receipt and updated database.
* `FAILED`: Network failed; waiting for backoff timer (`attemptCount * 15s`).

---

## 🎯 Key Design Rule: Three Orthogonal Dimensions

Do not conflate:

| Dimension | Examples | Stored as |
|-----------|----------|-----------|
| **Delivery (sync)** | Event reached Room | `syncedAt`, server sync |
| **Execution** | SCHEDULED → RINGING | `EventStatus` |
| **ACK transport** | PENDING → CONFIRMED | `AckStatus` + `ack_queue` |

Normal offline ACK:

```text
EventStatus = RECEIVED
AckStatus   = PENDING
```

Backend must not treat HTTP sync alone as “alarm rang” — only explicit ACK/receive endpoints after user action.
