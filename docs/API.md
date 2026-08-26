# API Documentation

Base URL: `NEXT_PUBLIC_API_URL` (e.g. `http://localhost:4000`)

All responses use this envelope:

**Success**
```json
{ "success": true, "data": { } }
```

**Error**
```json
{ "success": false, "error": { "code": "UNAUTHORIZED", "message": "Authentication required" } }
```

All protected endpoints require header:
```
Authorization: Bearer <supabase_access_token>
```

Rate limits (configurable in `backend/src/config/rateLimit.config.js`):
- Auth-adjacent endpoints: 5 requests / 15 min / user-or-IP
- General API endpoints: 100 requests / 15 min / user-or-IP

---

## Auth

### GET /api/auth/me
Auth: Required (any role)

Returns the authenticated user as resolved server-side (role is re-read from the database, never trusted from the client).

**Response**
```json
{ "success": true, "data": { "user": { "id": "...", "email": "...", "role": "citizen", "isActive": true, "isVerified": false } } }
```

**Errors**: `401 UNAUTHORIZED`, `401 INVALID_TOKEN`, `403 ACCOUNT_DISABLED`

---

## Profile

### GET /api/users/profile
Auth: Required — Roles: any

Returns the caller's full profile row.

### PUT /api/users/profile
Auth: Required — Roles: any (own profile only)

**Request body**
```json
{ "full_name": "Jane Doe", "phone": "+1...", "organization": "..." }
```
`role` and `is_verified` are never accepted here — attempting to set them has no effect (application layer ignores them, and a database trigger rejects any direct attempt to change `role` outside the admin path).

### POST /api/users/role-upgrade-request
Auth: Required — Roles: any

The only path from `citizen` toward `authority` / `hospital` / `admin`. Creates a `pending` row in `role_upgrade_requests` for an admin to review — does **not** change the caller's role.

**Request body**
```json
{ "requestedRole": "authority", "organization": "City Emergency Dept", "justification": "..." }
```

**Errors**: `400 VALIDATION_ERROR`

---

## Incidents

### GET /api/incidents
Auth: Required — Roles: any (results scoped: citizens see only their own reports; authority/admin/rescuer/volunteer see all)

### POST /api/incidents
Auth: Required — Roles: `citizen`, `authority`, `admin`

**Request body**
```json
{ "title": "Flooded underpass", "description": "...", "severity": "medium", "latitude": 19.2, "longitude": 72.9 }
```

**Errors**: `400 VALIDATION_ERROR`, `403 FORBIDDEN`

---

## Rescue Teams

### GET /api/rescue-teams
Auth: Required — Roles: `authority`, `admin`, `rescuer`

### POST /api/rescue-teams
Auth: Required — Roles: `authority`, `admin`

**Request body**
```json
{ "teamName": "Team 5", "leadUserId": "uuid-or-null" }
```

---

## Hospitals

### GET /api/hospitals
Auth: Required — Roles: `authority`, `admin`, `hospital`, `rescuer`

### PUT /api/hospitals/:id
Auth: Required — Roles: `hospital` (only the record they manage), `admin` (any record)

**Request body**
```json
{ "total_beds": 120, "available_beds": 24, "icu_available": 3 }
```

**Errors**: `403 FORBIDDEN` (hospital user attempting to update a record they don't manage), `404 NOT_FOUND`

---

## Shelters

### GET /api/shelters
Auth: Required — Roles: any (citizens need this to find nearby shelters)

### POST /api/shelters
Auth: Required — Roles: `authority`, `admin`, `volunteer`

**Request body**
```json
{ "name": "Community Hall — Sector 4", "capacity": 200, "latitude": 19.2, "longitude": 72.9 }
```

---

## Common Error Codes

| Code | HTTP Status | Meaning |
|---|---|---|
| `UNAUTHORIZED` | 401 | No/malformed bearer token |
| `INVALID_TOKEN` | 401 | Token failed Supabase verification (expired/revoked) |
| `PROFILE_NOT_FOUND` | 401 | Token valid but no matching profile row |
| `ACCOUNT_DISABLED` | 403 | `profiles.is_active = false` |
| `FORBIDDEN` | 403 | Authenticated, but role not permitted for this action |
| `VALIDATION_ERROR` | 400 | Request body failed validation |
| `RATE_LIMITED` | 429 | Too many requests in the current window |
| `NOT_FOUND` | 404 | Resource or route does not exist |
| `INTERNAL_ERROR` | 500 | Unexpected server error |
