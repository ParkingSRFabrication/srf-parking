# SR FABRICATION — Database Architecture & Data Dictionary
## Railway Station Vehicle Parking Management System

---

## 1. Overview & Data Philosophy
The system utilizes **MongoDB** via the **Mongoose** Object-Document Mapper (ODM). All models are designed for high throughput, data integrity, auditability, and financial precision.

### Key Data Principles:
- **Historical Immutability**: Historical financial records and tariff snapshots are preserved so rate updates never silently alter past bills.
- **Integer & Fixed-Precision Currency**: All monetary transactions are calculated in Indian Rupees (INR) with 2-decimal rounding.
- **Atomic State Transitions**: Vehicle exit transitions (`INSIDE` $\to$ `EXITED`) are guarded against duplicate concurrent checkouts.
- **Normalized Registration Numbers**: Vehicle registration numbers are trimmed, normalized without whitespace, and uppercased for consistent indexing.

---

## 2. Collections & Schemas

### 2.1 `users`
Stores system administrators and parking booth operators.
| Field | Type | Description | Index |
|---|---|---|---|
| `_id` | ObjectId | Primary Key | Yes |
| `username` | String | Lowercase unique username | Unique |
| `operatorId` | String | Uppercase unique booth identifier (e.g. `ADM-001`, `OP-001`) | Unique |
| `name` | String | Full employee/contractor name | No |
| `role` | String | `admin` \| `operator` | Index |
| `passwordHash` | String | bcrypt hashed password | No |
| `mpinHash` | String | bcrypt hashed 4-digit MPIN (nullable) | No |
| `assignedLocation` | ObjectId | Ref to `parkingLocations` | No |
| `permissions` | [String] | Array of granular privileges | No |
| `isActive` | Boolean | Account status | Index |
| `loginAttempts` | Number | Counter for brute-force tracking | No |
| `lockUntil` | Date | Timestamp until which account is locked | No |
| `lastLoginAt` | Date | Timestamp of last successful session | No |

### 2.2 `parkingTokens`
Authoritative record for single-entry vehicle parking sessions.
| Field | Type | Description | Index |
|---|---|---|---|
| `_id` | ObjectId | Primary Key | Yes |
| `tokenNumber` | String | Unique token (e.g. `SRF-20261009-0001`) | Unique |
| `vehicleNumber` | String | Normalized registration number | Index |
| `vehicleType` | String | `bike`, `car`, `auto`, `cycle`, etc. | Index |
| `customerPhone` | String | Customer mobile number | No |
| `status` | String | `INSIDE` \| `EXITED` \| `CANCELLED` | Index |
| `entryTime` | Date | Authoritative server clock entry timestamp | Index |
| `exitTime` | Date | Authoritative exit timestamp | Index |
| `durationMinutes` | Number | Total elapsed session duration | No |
| `billableUnits` | Number | Whole-session days or billable hours | No |
| `amountBilled` | Number | Gross calculated fee in INR | No |
| `amountPaid` | Number | Collected fee in INR | No |
| `paymentStatus` | String | `UNPAID`, `PAID`, `EXEMPT_PASS`, `CANCELLED` | Index |
| `paymentMethod` | String | `CASH`, `UPI`, `CARD`, `PASS`, `NONE` | No |
| `tariffSnapshot` | Object | Embedded tariff rates at moment of entry | No |
| `coveredByPass` | ObjectId | Ref to `monthlyPasses` if pass holder | No |
| `entryOperator` | ObjectId | Ref to `users` | No |
| `exitOperator` | ObjectId | Ref to `users` | No |

**Compound Indexes**:
- `{ vehicleNumber: 1, status: 1 }` — Enables instant verification of open sessions.
- `{ entryTime: 1, status: 1 }` — Optimizes daily entry queries.
- `{ exitTime: 1, paymentStatus: 1 }` — Accelerates daily exit revenue reporting.

### 2.3 `monthlyPasses`
Commuter parking passes with calendar-month arithmetic.
| Field | Type | Description | Index |
|---|---|---|---|
| `_id` | ObjectId | Primary Key | Yes |
| `passNumber` | String | Unique pass identifier (e.g. `SRF-PASS-20261009-0001`) | Unique |
| `vehicleNumber` | String | Normalized vehicle registration | Index |
| `vehicleType` | String | Category type | Index |
| `customerName` | String | Commuter name | No |
| `customerPhone` | String | Commuter phone | No |
| `durationMonths` | Number | Duration: `1`, `6`, or `12` | No |
| `startDate` | Date | Inclusive start date | No |
| `expiryDate` | Date | Inclusive expiry date (end of day 23:59:59.999) | Index |
| `amount` | Number | Collected pass fee in INR | No |
| `status` | String | `ACTIVE` \| `EXPIRED` \| `CANCELLED` | Index |
| `issuedBy` | ObjectId | Ref to `users` | No |
| `renewalHistory` | [Object] | Preserves all previous extensions and payments | No |

### 2.4 `tariffs`
Configurable category parking rate policies.
| Field | Type | Description | Index |
|---|---|---|---|
| `_id` | ObjectId | Primary Key | Yes |
| `category` | String | Category (`bike`, `car`, `auto`, etc.) | Index |
| `name` | String | Tariff policy name | No |
| `billingMethod` | String | `24_hour_daily`, `hourly`, `fixed` | No |
| `firstSlabAmount` | Number | Rate for first period/day | No |
| `additionalDayAmount` | Number | Rate for each subsequent 24-hour period | No |
| `hourlyAmount` | Number | Rate per hour for hourly categories | No |
| `freeGraceMinutes` | Number | Free turnaround window | No |
| `isActive` | Boolean | Rule active state | Index |

### 2.5 `payments`
Individual financial settlement transactions.
| Field | Type | Description | Index |
|---|---|---|---|
| `_id` | ObjectId | Primary Key | Yes |
| `paymentId` | String | Unique reference (e.g. `PAY-20261009-...`) | Unique |
| `type` | String | `PARKING_TOKEN` \| `MONTHLY_PASS` | Index |
| `amount` | Number | INR amount collected | No |
| `method` | String | `CASH`, `UPI`, `CARD`, `OTHER` | Index |
| `status` | String | `COMPLETED`, `REFUNDED`, `REVERSED` | Index |
| `transactionReference` | String | External UTR / bank receipt reference | No |
| `idempotencyKey` | String | Duplicate submission protection token | Unique, Sparse |
| `operator` | ObjectId | Ref to `users` | No |
| `createdAt` | Date | Timestamp of financial settlement | Index |

### 2.6 `auditLogs`
Immutable security and administrative log trail.
| Field | Type | Description | Index |
|---|---|---|---|
| `_id` | ObjectId | Primary Key | Yes |
| `actor` | ObjectId | Ref to `users` (nullable for system actions) | No |
| `actorName` | String | Name of actor at event time | No |
| `actorRole` | String | Role of actor | No |
| `action` | String | Event name (`LOGIN_SUCCESS`, `TOKEN_CREATED`, etc.) | Index |
| `entityType` | String | Affected entity | Index |
| `entityId` | String | Identifier of affected entity | No |
| `details` | Object | Sanitized before/after snapshot (secrets omitted) | No |
| `ipAddress` | String | Client IP address | No |
| `createdAt` | Date | Event timestamp | Index |

---

## 3. Data Retention & Archival
- **Tokens and Payments**: Kept permanently for statutory tax and railway contractor accounting audits.
- **Audit Logs**: Retained indefinitely with read-only access.
- **Passes**: Preserved across renewals; expired passes remain in the database for vehicle history tracking.
