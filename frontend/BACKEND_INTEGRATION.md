# Backend integration notes

For the backend developer. Three parts: what the frontend already consumes,
what it still needs, and where the supplied API documentation and the Express
code in this repository disagree.

Nothing in here has been invented in code — every "needed" endpoint below is
currently a `NotImplementedError` in live mode, and the screen that needs it
says so on the page rather than showing fake data.

Last reconciled against the CampusOS API documentation dated 24 Sep 2026.

---

## 0. ⚠️ The documentation and this repository do not match

The API documentation describes endpoints that **do not exist in `backend/` on
this branch**. `backend/routes/` contains only `auth`, `clubs`, `events` and
`test`.

Documented but absent from the code here:

| Method | Endpoint | Role |
| --- | --- | --- |
| PATCH | `/api/events/:id/reject` | FACULTY_COORDINATOR |
| POST | `/api/events/:id/register` | STUDENT |
| GET | `/api/my-registrations` | STUDENT |
| PATCH | `/api/registrations/:registrationId/cancel` | STUDENT |
| GET | `/api/events/:id/registrations` | CLUB_ADMIN |
| POST | `/api/events/:id/attendance` | CLUB_ADMIN |
| GET | `/api/events/:id/attendance` | CLUB_ADMIN |
| GET | `/api/notifications` | any |
| PATCH | `/api/notifications/:id/read` | any |
| GET | `/api/reports/my-participation` | STUDENT |
| GET | `/api/recommendations` | STUDENT |
| GET | `/api/stats/platform` | SYSTEM_ADMIN |

`origin/backend` has commits beyond the one merged here, so these very likely
exist upstream and simply have not been merged into this branch. **The frontend
has been written against the documented contract**, on the basis that the
documentation is the current contract. If any path, body or response shape
differs from what actually ships, the change belongs in `src/services/api/` and
nowhere else — see §4.

`src/services/api/contract.test.js` asserts the method, path and body the
frontend sends for every endpoint above. Run `npm test` to check the frontend
against the contract without needing a running backend.

### Two direct conflicts

1. **`POST /api/clubs` body.** The documentation gives `{ name, description }`.
   `clubController.createClub` returns **400** unless `name`, `category` *and*
   `faculty_coordinator_id` are all present. The documented request would fail
   against this code. The frontend sends `name`, `description`, `category`, and
   `faculty_coordinator_id` when one can be chosen — so it works either way —
   but there is no endpoint that lists faculty coordinators to choose from
   (§3.3). Please confirm which body is correct.

2. **The documentation is a highlight list, not a full contract.** It omits
   `GET /api/clubs/:id`, `GET /api/clubs/my-clubs`, `POST /api/clubs/:id/join`
   and `GET /api/clubs/:id/members`, all of which exist in the code and are
   already used by the student screens. Absence from the document has therefore
   not been treated as proof an endpoint is missing.

---

## 1. Endpoints already integrated

| Method | Endpoint | Role | Used by |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | — | Register |
| POST | `/api/auth/login` | — | Sign in |
| GET | `/api/auth/profile` | any | Profile, session restore |
| GET | `/api/clubs` | public | Browse clubs |
| GET | `/api/clubs/:id` | public | Club details |
| POST | `/api/clubs/:id/join` | STUDENT | Join club |
| GET | `/api/clubs/my-clubs` | STUDENT | My clubs |
| GET | `/api/clubs/:id/members` | CLUB_ADMIN | Club members / join requests |
| POST | `/api/clubs` | CLUB_ADMIN | Create club |
| GET | `/api/events` | public | Browse events, event details |
| POST | `/api/events` | CLUB_ADMIN | Create event |
| PATCH | `/api/events/:id/submit` | CLUB_ADMIN | Submit for approval |
| GET | `/api/events/pending` | FACULTY_COORDINATOR | Approval queue |
| PATCH | `/api/events/:id/approve` | FACULTY_COORDINATOR | Approve event |
| PATCH | `/api/events/:id/reject` | FACULTY_COORDINATOR | Reject with reason |
| PATCH | `/api/events/:id/publish` | SYSTEM_ADMIN | Publish event |
| POST | `/api/events/:id/register` | STUDENT | Register for event |
| GET | `/api/my-registrations` | STUDENT | My registrations, dashboard |
| PATCH | `/api/registrations/:registrationId/cancel` | STUDENT | Cancel registration |
| GET | `/api/events/:id/registrations` | CLUB_ADMIN | Attendee list |
| POST | `/api/events/:id/attendance` | CLUB_ADMIN | Mark attendance |
| GET | `/api/events/:id/attendance` | CLUB_ADMIN | Read attendance back |
| GET | `/api/notifications` | any | Notifications, unread badge |
| PATCH | `/api/notifications/:id/read` | any | Mark read |
| GET | `/api/reports/my-participation` | STUDENT | My participation |
| GET | `/api/recommendations` | STUDENT | Recommended events |
| GET | `/api/stats/platform` | SYSTEM_ADMIN | Platform statistics |

### Assumptions the frontend makes about these

- **Envelopes are unwrapped in the service layer.** Screens see plain objects,
  never `{ success, ... }`.
- **`GET /api/my-registrations` rows are thin.** The documented row is
  `{ id, event_id, status }`. The registration screens need a title, date,
  venue and club name, so those are filled from `GET /api/events` when the
  registration row does not carry them. A field that resolves to neither stays
  `null` and renders as "Not specified" — it is never invented. If the endpoint
  already JOINs `events`, those values win and no second request is wasted.
- **`is_read` is normalised to a boolean `read`.** MySQL sends 0/1. Both
  `body` and `message` are accepted as the notification's long text.
- **There is no bulk mark-read.** "Mark all as read" issues one
  `PATCH /notifications/:id/read` per unread row.
- **There is no unread-count endpoint.** The badge counts the list.
- **Seats remaining is hidden from students.** Seats taken is only knowable
  through `GET /api/events/:id/registrations`, which is CLUB_ADMIN-only, so the
  student event screen shows capacity but not a remaining count rather than
  guessing at one.
- **Attendance has one source of truth: the backend.** After every mark the
  list is refetched rather than patched locally.
- **Club membership is `PENDING` on join.** The UI shows "Request pending" and
  never "Joined" until the backend reports `APPROVED`.
- **Students only ever treat `status === "PUBLISHED"` as a visible event.**

---

## 2. Things worth fixing in the backend

Reported, not changed — the frontend branch does not touch `backend/`.

1. **`server.js` requires `./routes/eventroutes`, the file is `eventRoutes.js`.**
   Works on Windows (case-insensitive filesystem), throws `MODULE_NOT_FOUND` on
   Linux/macOS/CI.
2. **`eventRoutes.js` registers `PATCH /:id/publish` twice** — once for
   `SYSTEM_ADMIN`, once for `FACULTY_COORDINATOR`. Express matches the first, so
   the faculty route is dead code. This happens to agree with the documentation,
   which lists publish as SYSTEM_ADMIN. The duplicate should still be deleted.
3. **`POST /api/auth/register` accepts any role, including `SYSTEM_ADMIN`.**
   Anyone can self-register as a system administrator. The frontend only offers
   Student and Club administrator, but that is cosmetic — the endpoint is open.
   Consider restricting self-service registration to `STUDENT` (and possibly
   `CLUB_ADMIN`) and provisioning staff accounts separately.

---

## 3. Endpoints still needed

Six screens have no endpoint to call. Each is listed with what the frontend
already expects, so a response shaped this way needs no UI change at all.

### 3.1 A club admin's own events

    GET /api/events/my-events        Role: CLUB_ADMIN

Every event belonging to a club the caller administers, **in all statuses**.
`GET /api/events` is `PUBLISHED`-only, so a club admin currently cannot see
their own drafts. Needed by *My events* and the club admin dashboard.

    { "success": true, "events": [ {
        "id": 3, "club_id": 7, "club_name": "Coding Club",
        "title": "AI Workshop", "description": "…",
        "event_date": "2026-10-01", "event_time": "10:00:00",
        "venue": "Seminar Hall", "capacity": 50, "eligibility": "All students",
        "status": "DRAFT", "rejection_reason": null,
        "registration_count": 12
    } ] }

`rejection_reason` matters: a club admin needs to read why faculty returned an
event. `registration_count` saves one request per row.

### 3.2 Approved events awaiting publication

    GET /api/events/approved         Role: SYSTEM_ADMIN

Events with `status = 'APPROVED'`. Same row shape as §3.1. Without it the
System Administrator has nothing to publish — `GET /api/events` returns only
events that are already published.

### 3.3 Faculty coordinator lookup

    GET /api/users/coordinators      Role: CLUB_ADMIN

    { "success": true, "coordinators": [ { "id": 3, "name": "Dr. N. Kulkarni" } ] }

`POST /api/clubs` requires `faculty_coordinator_id` in the code in this repo,
but nothing exposes the list of valid ids. Either add this, or confirm that the
documented `{ name, description }` body is correct and the column is nullable.

### 3.4 Review a membership request

    PATCH /api/memberships/:membershipId    Role: CLUB_ADMIN
    { "status": "APPROVED" }                       // or "REJECTED"

`GET /api/clubs/:id/members` already returns `membership_id` for each row, so
only the decision endpoint is missing. Should 403 unless the caller administers
that club. Needed by *Club members*, and it is the step that unblocks the whole
student membership flow — students currently apply and stay `PENDING` forever.

### 3.5 Clubs owned by a club admin

    GET /api/clubs/my-clubs?role=admin   — or —   GET /api/clubs/administered

Clubs where `admin_id` is the caller. `GET /api/clubs/my-clubs` is currently
STUDENT-only and returns memberships, not ownership.

    { "success": true, "clubs": [ {
        "id": 1, "name": "Coding Club", "description": "…",
        "category": "Technical", "faculty_coordinator_id": 3,
        "status": "APPROVED", "member_count": 24, "pending_count": 3
    } ] }

`member_count` / `pending_count` are conveniences; the screen works without
them, showing a dash instead.

### 3.6 A single event, in any status

    GET /api/events/:id              Role: any (scoped by status)

Published events to anyone; draft, pending, approved and rejected ones to the
owning club admin, the faculty coordinator and the system administrator. The
event detail and faculty review screens currently select from a list because
this does not exist, which means a direct link to a non-published event cannot
be opened.

### 3.7 Account management (no equivalent documented)

    GET /api/users                   Role: SYSTEM_ADMIN

The §7 *User / Account Management* screen has nothing at all to call.

    { "success": true, "users": [
        { "id": 6, "name": "John Doe", "email": "…",
          "role": "STUDENT", "created_at": "…" }
    ] }

### Deferred: announcements

The documentation states announcements were deferred and no API was
implemented. Nothing has been built for them, no endpoint has been invented,
and no other screen is blocked by their absence.

---

## 4. What the frontend does while these are missing

- The service layer declares each gap in `src/services/index.js` with the text
  shown to the user.
- In **live** mode the call rejects with `NotImplementedError` and the screen
  renders "‹feature› is not available yet" plus the note above.
- In **demo** mode the same call is served from the in-browser dataset, and a
  banner states that demo data is in use.

When an endpoint ships, the only change needed is adding the function to the
matching module in `src/services/api/` and deleting its entry from the
`pending` map. No page component changes.
