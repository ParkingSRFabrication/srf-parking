# SR FABRICATION — REST API Reference
## Railway Station Vehicle Parking Management System

Base URL: `http://localhost:5000/api` (Local) / `https://api.yourdomain.com/api` (Production)

---

## 1. Authentication & Security Headers

All protected endpoints require an authorization token via either:
1. **HTTP Authorization Header**: `Authorization: Bearer <JWT_ACCESS_TOKEN>`
2. **HttpOnly Cookie**: Automatically sent by browser via cookie named `srf_access_token`.

### Standard Success Response:
```json
{
  "success": true,
  "data": { ... }
}
```

### Standard Error Response:
```json
{
  "success": false,
  "message": "Descriptive human-readable error explanation",
  "errors": [ ... ]
}
```

---

## 2. API Endpoints

### 2.1 Authentication
#### `POST /api/auth/login`
- **Rate Limit**: 15 attempts / 15 minutes per IP. Locks account after 5 consecutive failures.
- **Request Body (Password)**:
  ```json
  {
    "username": "admin",
    "password": "Admin@1234"
  }
  ```
- **Request Body (4-Digit MPIN)**:
  ```json
  {
    "username": "OP-001",
    "mpin": "4321"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Login successful",
    "token": "eyJhbGciOiJIUzI1NiIsInR...",
    "user": {
      "_id": "6704...",
      "username": "admin",
      "operatorId": "ADM-001",
      "name": "Suresh Rao",
      "role": "admin"
    }
  }
  ```

#### `GET /api/auth/me`
- Returns profile of currently authenticated user.

#### `POST /api/auth/logout`
- Revokes session and clears cookies.

---

### 2.2 Parking Operations
#### `POST /api/parking/entries`
- Creates a new entry token.
- **Request Body**:
  ```json
  {
    "vehicleNumber": "MH12AB1234",
    "vehicleType": "bike",
    "customerPhone": "9876543210",
    "notes": "Helmet left on handle"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Vehicle entry token created successfully",
    "token": {
      "tokenNumber": "SRF-20261009-0001",
      "vehicleNumber": "MH12AB1234",
      "vehicleType": "bike",
      "entryTime": "2026-10-09T08:30:00.000Z",
      "status": "INSIDE"
    }
  }
  ```

#### `GET /api/parking/lookup?query=MH12AB1234`
- Lookups active session by token number, vehicle registration, or scanned QR code.
- Calculates live elapsed duration, whole-session billable days, and charge preview.

#### `POST /api/parking/tokens/:id/exit`
- Completes vehicle exit and records settlement payment.
- **Request Body**:
  ```json
  {
    "paymentMethod": "CASH",
    "paymentReference": "CASH-REC-01"
  }
  ```

#### `POST /api/parking/tokens/:id/cancel`
- Cancels an unexited token with mandatory reason.

#### `GET /api/parking/tokens`
- Paginated repository with filters: `search`, `status`, `vehicleType`, `startDate`, `endDate`.

---

### 2.3 Monthly Commuter Passes
#### `POST /api/passes`
- Issues a new monthly pass.
- **Request Body**:
  ```json
  {
    "vehicleNumber": "KA03MG4567",
    "vehicleType": "car",
    "customerName": "Rajesh Iyer",
    "customerPhone": "9876543213",
    "durationMonths": 1,
    "startDate": "2026-10-09",
    "amount": 600,
    "paymentMethod": "UPI",
    "paymentReference": "UPI/2026/88992211"
  }
  ```

#### `POST /api/passes/:id/renew`
- Extends an existing pass for 1, 6, or 12 months, preserving historical validity dates.

---

### 2.4 Reports & Analytics
#### `GET /api/reports/summary`
- Returns live operational summary (occupancy, entries today, exits today, net collections).

#### `GET /api/reports/detailed`
- Returns detailed accounting breakdown by date range and payment mode.

---

### 2.5 Tariffs & Administration (Admin Only)
#### `GET /api/tariffs`
- Lists active category tariffs.

#### `POST /api/tariffs/preview`
- Interactive scenario calculator simulation.

#### `GET /api/backup/export`
- Exports entire database state as JSON for administrative archives.
