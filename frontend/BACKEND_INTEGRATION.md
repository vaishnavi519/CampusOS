# Backend integration notes

For the backend developer. Two parts: what the frontend already consumes, and
what it needs next.

Nothing in here has been invented in code — every "needed" endpoint below is
currently a `NotImplementedError` in live mode, and the screen that needs it says
so on the page rather than showing fake data.

---

## 1. Endpoints already integrated

Read from the controllers, not assumed.

| Method | Endpoint | Role | Used by |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | — | Register |
| POST | `/api/auth/login` | — | Sign in |
| GET | `/api/auth/profile` | any | Profile, session restore |
| GET | `/api/clubs` | public | Browse clubs |
| GET | `/api/clubs/:id` | public | Club details |
| POST | `/api/clubs/:id/join` | STUDENT | Join club |
| GET | `/api/clubs/my-clubs` | STUDENT | My clubs |
| GET | `/api/clubs/:id/members` | CLUB_ADMIN | (club admin screens, next phase) |
| POST | `/api/clubs` | CLUB_ADMIN | (club admin screens, next phase) |
| GET | `/api/events` | public | Browse events, event details |
| POST | `/api/events` | CLUB_ADMIN | (club admin screens, next phase) |
| PATCH | `/api/events/:id/submit` | CLUB_ADMIN | (club admin screens, next phase) |
| GET | `/api/events/pending` | FACULTY_COORDINATOR | (faculty screens, next phase) |
| PATCH | `/api/events/:id/approve` | FACULTY_COORDINATOR | (faculty screens, next phase) |
| PATCH | `/api/events/:id/publish` | SYSTEM_ADMIN | (registrar screens, next phase) |

### Frontend assumptions about these

- Responses are `{ success, ...payload }`; the client unwraps the payload.
- `events.event_date` arrives as a UTC-midnight ISO string and `event_time` as
  `"HH:MM:SS"`. The frontend parses the date from its Y-M-D parts so the local
  timezone cannot shift an event a day backwards.
- `GET /api/events` returns **published events only** and includes `club_name`.
- `POST /api/auth/login` returns `{ token, user }`; the JWT payload is
  `{ id, role }` with a 1-day expiry.
- `POST /api/auth/register` returns the user but **no token**, so the frontend
  follows it with a real login call.

---

## 2. Things worth fixing in the backend

Reported, not changed — the frontend branch does not touch `backend/`.

1. **`server.js` requires `./routes/eventroutes`, the file is `eventRoutes.js`.**
   Works on Windows (case-insensitive filesystem), throws `MODULE_NOT_FOUND` on
   Linux/macOS/CI.
2. **`eventRoutes.js` registers `PATCH /:id/publish` twice** — once for
   `SYSTEM_ADMIN`, once for `FACULTY_COORDINATOR`. Express matches the first, so
   the faculty route is dead code. The frontend treats publish as SYSTEM_ADMIN.
3. **`POST /api/auth/register` accepts any role, including `SYSTEM_ADMIN`.**
   Anyone can self-register as a system administrator. The frontend only offers
   Student and Club administrator, but that is cosmetic — the endpoint is open.
   Consider restricting self-service registration to `STUDENT` (and possibly
   `CLUB_ADMIN`) and provisioning staff accounts separately.
4. **There is no `GET /api/events/:id`.** The event detail screen currently reads
   the published list and selects client-side, which cannot show draft, pending
   or approved events.

---

## 3. Endpoints needed next

Listed in the order the remaining screens need them.

### 3.1 Reject an event

```
FEATURE:   Faculty coordinator returns an event to the club
METHOD:    PATCH
ENDPOINT:  /api/events/:id/reject
AUTH:      Bearer, role FACULTY_COORDINATOR
REQUEST:   { "reason": "string, optional" }
RESPONSE:  { "success": true, "message": "Event rejected" }
ERRORS:    404 event not found · 400 event is not PENDING_APPROVAL · 403 wrong role
FRONTEND:  Needs a REJECTED value in events.status, and a rejection_reason column
           surfaced on the event so the club admin can see why. The UI already
           renders both.
```

### 3.2 A club admin's own events

```
FEATURE:   "My events" for a club administrator
METHOD:    GET
ENDPOINT:  /api/events/my-events
AUTH:      Bearer, role CLUB_ADMIN
RESPONSE:  { "success": true, "events": [ <event row incl. club_name and status> ] }
ERRORS:    403 wrong role
FRONTEND:  Must include every status (DRAFT → PUBLISHED), because the club admin
           screen groups by status. GET /api/events cannot serve this — it is
           published-only.
```

### 3.3 Approved events awaiting publication

```
FEATURE:   Registrar's publish queue
METHOD:    GET
ENDPOINT:  /api/events/approved
AUTH:      Bearer, role SYSTEM_ADMIN
RESPONSE:  { "success": true, "events": [ <event row incl. club_name> ] }
ERRORS:    403 wrong role
FRONTEND:  Mirrors GET /api/events/pending, filtered to status = 'APPROVED'.
```

### 3.4 Single event

```
FEATURE:   Event detail for non-published events
METHOD:    GET
ENDPOINT:  /api/events/:id
AUTH:      Bearer; published events may stay public
RESPONSE:  { "success": true, "event": { …, "club_name": "…" } }
ERRORS:    404 · 403 when the caller may not see a non-published event
FRONTEND:  Replaces the current list-and-filter workaround.
```

### 3.5 Review a membership request

```
FEATURE:   Club admin approves or rejects a join request
METHOD:    PATCH
ENDPOINT:  /api/clubs/:clubId/members/:membershipId
AUTH:      Bearer, role CLUB_ADMIN, own club only
REQUEST:   { "status": "APPROVED" | "REJECTED" }
RESPONSE:  { "success": true, "membership": { …, "status", "reviewed_at" } }
ERRORS:    404 not found / not your club · 400 already reviewed · 403 wrong role
FRONTEND:  club_memberships already has status and reviewed_at; nothing new is
           needed in the schema.
```

### 3.6 Clubs owned by a club admin

```
FEATURE:   "My clubs" for a club administrator
METHOD:    GET
ENDPOINT:  /api/clubs/administered
AUTH:      Bearer, role CLUB_ADMIN
RESPONSE:  { "success": true, "clubs": [ { …club, "member_count", "pending_count" } ] }
ERRORS:    403 wrong role
FRONTEND:  The counts are optional; the frontend can derive them from the members
           endpoint if they are expensive, but one round trip is cheaper.
```

### 3.7 Faculty coordinator lookup

```
FEATURE:   Choosing a faculty coordinator when registering a club
METHOD:    GET
ENDPOINT:  /api/users/coordinators
AUTH:      Bearer, role CLUB_ADMIN
RESPONSE:  { "success": true, "users": [ { "id", "name", "email" } ] }
ERRORS:    403 wrong role
FRONTEND:  POST /api/clubs requires faculty_coordinator_id, and there is
           currently no way for the UI to discover a valid id. Must not expose
           anything beyond id, name and email.
```

### 3.8 Event registration

The largest gap. The whole student registration flow is demo-only today.

```
FEATURE:   Student registers for a published event
METHOD:    POST
ENDPOINT:  /api/events/:id/register
AUTH:      Bearer, role STUDENT
REQUEST:   (no body)
RESPONSE:  { "success": true, "registration": { "id", "event_id", "status",
             "registered_at" } }
ERRORS:    404 event not found · 400 event is not PUBLISHED · 409 already
           registered · 403 not eligible
FRONTEND:  Assumes status is REGISTERED, or WAITLISTED when the event is at
           capacity. If waitlisting is out of scope, return 409 when full and
           the UI will present it as "event full".
```

```
FEATURE:   Student's own registrations
METHOD:    GET
ENDPOINT:  /api/events/my-registrations
AUTH:      Bearer, role STUDENT
RESPONSE:  { "success": true, "registrations": [ { "registration_id", "event_id",
             "status", "registered_at", "cancelled_at", "title", "event_date",
             "event_time", "venue", "club_id", "club_name" } ] }
FRONTEND:  The joined event/club fields keep the page to one request. Without
           them the UI would need N+1 lookups.
```

```
FEATURE:   Cancel a registration
METHOD:    PATCH (or DELETE)
ENDPOINT:  /api/events/registrations/:id/cancel
AUTH:      Bearer, role STUDENT, own registration only
RESPONSE:  { "success": true, "registration": { "status": "CANCELLED", "cancelled_at" } }
ERRORS:    404 · 400 already cancelled · 403 not yours
FRONTEND:  The Cancel button is hidden entirely in live mode until this exists —
           it is not shown-then-broken.
```

```
FEATURE:   Attendees for a club admin's event
METHOD:    GET
ENDPOINT:  /api/events/:id/registrations
AUTH:      Bearer, role CLUB_ADMIN, own club only
RESPONSE:  { "success": true, "event": { "id", "title", "capacity", "club_name" },
             "registrations": [ { "registration_id", "student_id", "student_name",
             "student_email", "status", "registered_at" } ] }
ERRORS:    404 not found / not your club · 403 wrong role
```

```
FEATURE:   Seats remaining on an event
NEEDED:    Either a `registered_count` field on every event row returned by
           GET /api/events, or a dedicated capacity endpoint.
FRONTEND:  Capacity is shown today from events.capacity alone; "N of M seats
           remaining" stays hidden until a count is available.
```

### 3.9 Notifications

```
FEATURE:   In-app notifications
METHOD:    GET / PATCH
ENDPOINTS: GET   /api/notifications              -> the signed-in user's notifications
           PATCH /api/notifications/:id/read     -> mark one read
           PATCH /api/notifications/read-all     -> mark all read
AUTH:      Bearer, any role
RESPONSE:  { "success": true, "notifications": [ { "id", "type", "title", "body",
             "link", "read", "created_at" } ] }
FRONTEND:  `type` is shown as a humanised label, so any SCREAMING_SNAKE value
           works. `link` is an in-app path and may be null. Needs a
           notifications table. Events that should raise one: membership
           requested / reviewed, event submitted / approved / rejected /
           published, registration confirmed.
```

---

## 4. What the frontend does while these are missing

- The service layer declares each gap in `src/services/index.js` with the text
  shown to the user.
- In **live** mode the call rejects with `NotImplementedError` and the screen
  renders "‹feature› is not available yet" plus the note above.
- In **demo** mode the same call is served from the in-browser dataset, and a
  banner states that demo data is in use.

When an endpoint ships, the only change needed is adding the function to the
matching module in `src/services/api/` and deleting its entry from the `pending`
map. No page component changes.
