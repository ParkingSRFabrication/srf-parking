# SR FABRICATION — System Requirements Specification (SRS)
## Railway Station Vehicle Parking Management System

---

## 1. Executive Summary & Purpose
This document outlines the formal business and software requirements for the **SR FABRICATION Railway Station Vehicle Parking Management System**. The application is engineered for commercial parking contractors operating at Indian railway stations to manage high-throughput vehicle entry/exit token workflows, 24-hour tariff computations, monthly commuter passes, financial reporting, and administrative controls.

---

## 2. Stakeholders & User Personas

### 2.1 Parking Operator (Booth Operator)
- **Role**: Operates entry/exit POS terminals, mobile tablets, and desktop workstations at entry/exit gates.
- **Key Responsibilities**:
  - Issue parking entry tokens to incoming vehicles within seconds.
  - Scan entry tokens or search vehicle numbers on exit.
  - Collect parking fees via Cash, UPI, or Card.
  - Issue and renew monthly parking passes for daily commuters.
  - Reprint receipts for customers upon request.
- **Authentication**: Quick 4-digit MPIN or Username/Password.

### 2.2 System Administrator
- **Role**: Oversees complete financial collections, station tariffs, and booth staff.
- **Key Responsibilities**:
  - Configure category tariffs (24-hour slabs, hourly rates, fixed fees).
  - Manage operator accounts and credential resets.
  - Review live occupancy, gross revenue, refunds, and net collections.
  - Generate daily, monthly, and custom financial audit reports.
  - Export database records and review immutable audit logs.
- **Authentication**: High-security password authentication with lockout protection.

---

## 3. Functional Requirements

### 3.1 Authentication & Access Control (FR-01)
- **FR-01.1**: The system must support role-based access control (Admin and Operator).
- **FR-01.2**: Operators can authenticate using a 4-digit MPIN or standard password.
- **FR-01.3**: Accounts must automatically lock for 15 minutes after 5 consecutive failed login attempts to prevent brute-force attacks.
- **FR-01.4**: All passwords and MPINs must be securely hashed using bcrypt prior to database storage.
- **FR-01.5**: JWT tokens (Access and Refresh) with HttpOnly secure cookie and Authorization header options must be used for session management.

### 3.2 Vehicle Entry Processing (FR-02)
- **FR-02.1**: The system must support vehicle categories: Bike, Car, Auto, Bus, Cycle, Truck, Tempo, Other, and cloakroom categories: Helmet, Locker.
- **FR-02.2**: Vehicle registration inputs must be sanitized, trimmed, and converted to uppercase.
- **FR-02.3**: Duplicate entry prevention: The system must check if a vehicle already has an active open session (`INSIDE`) and reject duplicate entry with a clear warning showing the existing token number.
- **FR-02.4**: Pass holder check: When creating an entry token, the system must detect active monthly passes for that vehicle and attach pass coverage.
- **FR-02.5**: Collision-safe token numbers must be generated (e.g., `SRF-YYYYMMDD-0001`).
- **FR-02.6**: An immutable tariff snapshot must be attached to the token at the time of entry to prevent future tariff edits from altering historical open sessions.
- **FR-02.7**: Instant entry receipt generation with thermal POS print formatting and a verifiable QR code.

### 3.3 Vehicle Exit Processing & Tariff Engine (FR-03)
- **FR-03.1**: Rapid lookup by token number, vehicle registration number, or camera-based QR code scanning.
- **FR-03.2**: 24-Hour Whole-Session Daily Billing Rule:
  $$\text{billableDays} = \max(1, \lceil \text{elapsedMilliseconds} / 86,400,000 \rceil)$$
  - Duration $\le$ 24 hours: 1 billable day.
  - Duration 24 hours 1 minute: 2 billable days.
  - Duration 48 hours: 2 billable days.
  - Duration 48 hours 1 minute: 3 billable days.
- **FR-03.3**: Active monthly pass holders must be charged ₹0 on exit with status `EXEMPT_PASS`.
- **FR-03.4**: Payment collection support for Cash, UPI, Card, and Other modes.
- **FR-03.5**: State transition (`INSIDE` $\to$ `EXITED`) must be conditional and idempotent, strictly rejecting duplicate exit calls.
- **FR-03.6**: Final exit receipt generation with payment breakdown.

### 3.4 Monthly Commuter Passes (FR-04)
- **FR-04.1**: Issue passes for 1-month, 6-month, and 12-month durations with calendar-month arithmetic in `Asia/Kolkata` timezone.
- **FR-04.2**: Prevent duplicate active passes for the same vehicle.
- **FR-04.3**: Renewal workflow that extends validity while preserving complete renewal history.
- **FR-04.4**: Visual alert indicator for passes expiring within 5 days.

### 3.5 Financial & Operational Reporting (FR-05)
- **FR-05.1**: Live dashboard calculating metrics dynamically from actual database records (no hardcoded metrics).
- **FR-05.2**: Clean separation between gross billed amounts, refunds, and net collections.
- **FR-05.3**: Distinct accounting between parking revenue and monthly pass revenue.
- **FR-05.4**: Date range filtering (Today, Yesterday, Custom, Month) and CSV data exports.

### 3.6 Audit Logging (FR-06)
- **FR-06.1**: Immutable audit logging for all logins, token creations, exits, pass actions, tariff updates, and configuration changes.
- **FR-06.2**: Passwords, MPINs, and secrets must never be written to audit logs.

---

## 4. Non-Functional Requirements
- **Performance**: Token generation and lookup responses under 150ms.
- **Security**: OWASP compliance, Helmet HTTP headers, CORS whitelisting, rate limiting.
- **Reliability**: Graceful shutdown, database auto-reconnect, zero data loss.
- **Usability**: Fully responsive desktop and mobile interface with high-contrast touch buttons.
