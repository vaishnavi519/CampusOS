import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';

import * as attendance from './attendance.js';
import * as auth from './auth.js';
import * as clubs from './clubs.js';
import * as events from './events.js';
import * as notifications from './notifications.js';
import * as recommendations from './recommendations.js';
import * as registrations from './registrations.js';
import * as reports from './reports.js';
import * as stats from './stats.js';
import { setToken } from './client.js';

/**
 * Asserts the live layer against the documented CampusOS API contract.
 *
 * `fetch` is stubbed, so nothing here needs a running backend — what is being
 * verified is the part the frontend is responsible for: the HTTP method, the
 * path below /api, the request body, and the bearer token. If the backend
 * contract changes, these are the tests that should fail first.
 */

let calls = [];

/** Queue of responses; each call shifts one off. */
let queued = [];

function respondWith(payload, { status = 200 } = {}) {
  queued.push({ payload, status });
}

globalThis.fetch = async (url, options = {}) => {
  calls.push({
    url,
    method: options.method ?? 'GET',
    headers: options.headers ?? {},
    body: options.body ? JSON.parse(options.body) : undefined,
  });

  const next = queued.shift() ?? { payload: { success: true }, status: 200 };
  return {
    ok: next.status >= 200 && next.status < 300,
    status: next.status,
    headers: { get: () => 'application/json' },
    json: async () => next.payload,
    text: async () => JSON.stringify(next.payload),
  };
};

const lastCall = () => calls[calls.length - 1];
const callTo = (path) => calls.find((call) => call.url.endsWith(path));

beforeEach(() => {
  calls = [];
  queued = [];
  setToken(null);
});

describe('auth endpoints', () => {
  it('POSTs /auth/login without a token and unwraps the envelope', async () => {
    respondWith({ success: true, token: 'jwt-value', user: { id: 6, role: 'STUDENT' } });

    const result = await auth.login({
      email: 'student@example.com',
      password: 'Password@123',
    });

    assert.equal(lastCall().method, 'POST');
    assert.equal(lastCall().url, '/api/auth/login');
    assert.deepEqual(lastCall().body, {
      email: 'student@example.com',
      password: 'Password@123',
    });
    assert.equal(lastCall().headers.Authorization, undefined);
    assert.equal(result.token, 'jwt-value');
    assert.equal(result.user.role, 'STUDENT');
  });

  it('POSTs /auth/register with name, email, password and role', async () => {
    respondWith({ success: true, message: 'User registered successfully' });

    await auth.register({
      name: 'John Doe',
      email: 'student@example.com',
      password: 'Password@123',
      role: 'STUDENT',
    });

    assert.equal(lastCall().url, '/api/auth/register');
    assert.deepEqual(Object.keys(lastCall().body).sort(), [
      'email',
      'name',
      'password',
      'role',
    ]);
  });

  it('sends the bearer token on GET /auth/profile', async () => {
    setToken('jwt-value');
    respondWith({ success: true, user: { id: 6, role: 'STUDENT' } });

    await auth.getProfile();

    assert.equal(lastCall().url, '/api/auth/profile');
    assert.equal(lastCall().headers.Authorization, 'Bearer jwt-value');
  });
});

describe('club endpoints', () => {
  it('GETs /clubs publicly', async () => {
    setToken('jwt-value');
    respondWith({ success: true, clubs: [{ id: 1, name: 'Coding Club' }] });

    const result = await clubs.listClubs();

    assert.equal(lastCall().url, '/api/clubs');
    assert.equal(lastCall().headers.Authorization, undefined);
    assert.equal(result[0].name, 'Coding Club');
  });

  it('POSTs /clubs/:id/join with no body', async () => {
    respondWith({ success: true });
    await clubs.joinClub(7);

    assert.equal(lastCall().method, 'POST');
    assert.equal(lastCall().url, '/api/clubs/7/join');
    assert.equal(lastCall().body, undefined);
  });

  it('returns an empty list rather than undefined when clubs is absent', async () => {
    respondWith({ success: true });
    assert.deepEqual(await clubs.listClubs(), []);
  });
});

describe('event endpoints', () => {
  it('GETs /events and keeps the documented field names', async () => {
    respondWith({
      success: true,
      events: [{ id: 1, title: 'Campus Tech Workshop', status: 'PUBLISHED' }],
    });

    const result = await events.listPublishedEvents();

    assert.equal(lastCall().url, '/api/events');
    assert.equal(result[0].status, 'PUBLISHED');
  });

  it('POSTs /events with the documented body', async () => {
    respondWith({ success: true, event: { id: 3, status: 'DRAFT' } });

    const event = await events.createEvent({
      club_id: 7,
      title: 'AI Workshop',
      description: 'Introduction to AI',
      event_date: '2026-10-01',
      event_time: '10:00:00',
      venue: 'Seminar Hall',
      capacity: 50,
      eligibility: 'All students',
    });

    assert.equal(lastCall().method, 'POST');
    assert.equal(lastCall().url, '/api/events');
    assert.equal(lastCall().body.club_id, 7);
    assert.equal(lastCall().body.event_date, '2026-10-01');
    assert.equal(event.status, 'DRAFT');
  });

  it('PATCHes submit, approve and publish with no body', async () => {
    respondWith({ success: true });
    await events.submitEvent(3);
    assert.equal(lastCall().method, 'PATCH');
    assert.equal(lastCall().url, '/api/events/3/submit');
    assert.equal(lastCall().body, undefined);

    respondWith({ success: true });
    await events.approveEvent(3);
    assert.equal(lastCall().url, '/api/events/3/approve');
    assert.equal(lastCall().body, undefined);

    respondWith({ success: true });
    await events.publishEvent(3);
    assert.equal(lastCall().url, '/api/events/3/publish');
    assert.equal(lastCall().body, undefined);
  });

  it('PATCHes reject with rejection_reason', async () => {
    respondWith({ success: true });

    await events.rejectEvent(3, 'Venue information needs to be revised.');

    assert.equal(lastCall().method, 'PATCH');
    assert.equal(lastCall().url, '/api/events/3/reject');
    assert.deepEqual(lastCall().body, {
      rejection_reason: 'Venue information needs to be revised.',
    });
  });

  it('refuses to send an empty rejection reason', async () => {
    await assert.rejects(
      () => events.rejectEvent(3, '   '),
      (error) => error.status === 400,
    );
    assert.equal(calls.length, 0);
  });

  it('GETs /events/pending for the faculty queue', async () => {
    respondWith({ success: true, events: [] });
    await events.listPendingEvents();
    assert.equal(lastCall().url, '/api/events/pending');
  });

  it('shares one /events request between concurrent callers', async () => {
    respondWith({ success: true, events: [{ id: 1, capacity: 50 }] });

    const [a, b, c] = await Promise.all([
      events.listPublishedEvents(),
      events.listPublishedEvents(),
      events.getPublishedEvent(1),
    ]);

    assert.equal(calls.filter((call) => call.url === '/api/events').length, 1);
    assert.deepEqual(a, b);
    assert.equal(c.id, 1);
  });

  it('refetches once the shared request has settled', async () => {
    respondWith({ success: true, events: [] });
    await events.listPublishedEvents();
    respondWith({ success: true, events: [] });
    await events.listPublishedEvents();

    assert.equal(calls.filter((call) => call.url === '/api/events').length, 2);
  });
});

describe('registration endpoints', () => {
  it('POSTs /events/:id/register with no body', async () => {
    respondWith({ success: true });
    await registrations.registerForEvent(1);

    assert.equal(lastCall().method, 'POST');
    assert.equal(lastCall().url, '/api/events/1/register');
    assert.equal(lastCall().body, undefined);
  });

  it('PATCHes /registrations/:registrationId/cancel', async () => {
    respondWith({ success: true });
    await registrations.cancelRegistration(12);

    assert.equal(lastCall().method, 'PATCH');
    assert.equal(lastCall().url, '/api/registrations/12/cancel');
  });

  it('GETs /my-registrations and exposes the row id under both names', async () => {
    respondWith({
      success: true,
      registrations: [{ id: 1, event_id: 1, status: 'REGISTERED' }],
    });
    respondWith({ success: true, events: [] });

    const rows = await registrations.listMyRegistrations();

    assert.ok(callTo('/api/my-registrations'));
    assert.equal(rows[0].registration_id, 1);
    assert.equal(rows[0].id, 1);
    assert.equal(rows[0].status, 'REGISTERED');
  });

  it('fills display fields from the published event list', async () => {
    respondWith({
      success: true,
      registrations: [{ id: 1, event_id: 1, status: 'REGISTERED' }],
    });
    respondWith({
      success: true,
      events: [
        {
          id: 1,
          title: 'Campus Tech Workshop',
          event_date: '2026-10-01',
          venue: 'Seminar Hall',
          club_name: 'Coding Club',
        },
      ],
    });

    const [row] = await registrations.listMyRegistrations();

    assert.equal(row.title, 'Campus Tech Workshop');
    assert.equal(row.venue, 'Seminar Hall');
    assert.equal(row.club_name, 'Coding Club');
  });

  it('leaves display fields null rather than inventing them', async () => {
    respondWith({
      success: true,
      registrations: [{ id: 9, event_id: 99, status: 'REGISTERED' }],
    });
    respondWith({ success: true, events: [] });

    const [row] = await registrations.listMyRegistrations();

    assert.equal(row.title, null);
    assert.equal(row.venue, null);
  });

  it('reports capacity without a seats-taken count a student cannot read', async () => {
    respondWith({ success: true, events: [{ id: 1, capacity: 50 }] });

    const capacity = await registrations.getEventCapacity(1);

    assert.equal(capacity.capacity, 50);
    assert.equal(capacity.taken, null);
  });

  it('GETs /events/:id/registrations for a club admin', async () => {
    respondWith({
      success: true,
      registrations: [
        { id: 4, student_id: 6, student_name: 'John Doe', status: 'REGISTERED' },
      ],
    });

    const result = await registrations.listEventRegistrations(1);

    assert.equal(lastCall().url, '/api/events/1/registrations');
    assert.equal(result.registrations[0].registration_id, 4);
    assert.equal(result.registrations[0].student_id, 6);
  });
});

describe('attendance endpoints', () => {
  it('POSTs /events/:id/attendance with student_id and status', async () => {
    respondWith({ success: true });

    await attendance.markAttendance(1, { student_id: 6, status: 'PRESENT' });

    assert.equal(lastCall().method, 'POST');
    assert.equal(lastCall().url, '/api/events/1/attendance');
    assert.deepEqual(lastCall().body, { student_id: 6, status: 'PRESENT' });
  });

  it('GETs /events/:id/attendance', async () => {
    respondWith({
      success: true,
      attendance: [{ student_id: 6, status: 'PRESENT' }],
    });

    const rows = await attendance.listAttendance(1);

    assert.equal(lastCall().method, 'GET');
    assert.equal(lastCall().url, '/api/events/1/attendance');
    assert.equal(rows[0].status, 'PRESENT');
  });
});

describe('notification endpoints', () => {
  it('normalises is_read 0/1 into a boolean', async () => {
    respondWith({
      success: true,
      notifications: [
        { id: 1, title: 'Test Notification', type: 'GENERAL', is_read: 0 },
        { id: 2, title: 'Read one', type: 'GENERAL', is_read: 1 },
      ],
    });

    const rows = await notifications.listNotifications();

    assert.equal(lastCall().url, '/api/notifications');
    assert.equal(rows.find((row) => row.id === 1).read, false);
    assert.equal(rows.find((row) => row.id === 2).read, true);
  });

  it('accepts `message` as the body text the backend sends', async () => {
    respondWith({
      success: true,
      notifications: [{ id: 1, title: 'T', message: 'Long text', is_read: 0 }],
    });

    const [row] = await notifications.listNotifications();
    assert.equal(row.body, 'Long text');
  });

  it('PATCHes /notifications/:id/read', async () => {
    respondWith({ success: true });
    await notifications.markRead(1);

    assert.equal(lastCall().method, 'PATCH');
    assert.equal(lastCall().url, '/api/notifications/1/read');
  });

  it('counts unread from the list, since no count endpoint exists', async () => {
    respondWith({
      success: true,
      notifications: [
        { id: 1, is_read: 0 },
        { id: 2, is_read: 0 },
        { id: 3, is_read: 1 },
      ],
    });

    assert.equal(await notifications.countUnread(), 2);
  });

  it('marks all read one at a time and reports how many succeeded', async () => {
    respondWith({
      success: true,
      notifications: [
        { id: 1, is_read: 0 },
        { id: 2, is_read: 0 },
        { id: 3, is_read: 1 },
      ],
    });
    respondWith({ success: true });
    respondWith({ success: true });

    const result = await notifications.markAllRead();

    assert.equal(result.updated, 2);
    assert.ok(callTo('/api/notifications/1/read'));
    assert.ok(callTo('/api/notifications/2/read'));
    assert.equal(callTo('/api/notifications/3/read'), undefined);
  });
});

describe('report, recommendation and statistics endpoints', () => {
  it('GETs /reports/my-participation and echoes the summary', async () => {
    respondWith({
      success: true,
      summary: { total_registered: 1, total_attended: 1 },
      report: [{ event_id: 1, attendance_status: 'PRESENT' }],
    });

    const result = await reports.getMyParticipation();

    assert.equal(lastCall().url, '/api/reports/my-participation');
    assert.equal(result.summary.total_registered, 1);
    assert.equal(result.report[0].attendance_status, 'PRESENT');
  });

  it('defaults the participation summary to zero, never to undefined', async () => {
    respondWith({ success: true });
    const result = await reports.getMyParticipation();

    assert.equal(result.summary.total_registered, 0);
    assert.deepEqual(result.report, []);
  });

  it('GETs /recommendations and surfaces event_id as the link id', async () => {
    respondWith({
      success: true,
      recommendations: [
        { event_id: 1, title: 'Campus Tech Workshop', club_name: 'Coding Club' },
      ],
    });

    const rows = await recommendations.listRecommendations();

    assert.equal(lastCall().url, '/api/recommendations');
    assert.equal(rows[0].id, 1);
    assert.equal(rows[0].event_id, 1);
  });

  it('GETs /stats/platform, not the retired /admin/statistics', async () => {
    respondWith({
      success: true,
      statistics: {
        total_users: 4,
        total_clubs: 7,
        total_events: 2,
        total_registrations: 1,
        total_attendance: 1,
      },
    });

    const figures = await stats.getPlatformStats();

    assert.equal(lastCall().url, '/api/stats/platform');
    assert.equal(figures.total_users, 4);
    assert.equal(figures.total_clubs, 7);
  });
});

describe('error handling', () => {
  it('turns a 409 into an ApiError carrying the server message', async () => {
    respondWith(
      { success: false, message: 'You have already registered' },
      { status: 409 },
    );

    await assert.rejects(
      () => registrations.registerForEvent(1),
      (error) =>
        error.status === 409 && error.message === 'You have already registered',
    );
  });

  it('falls back to a readable message when the server sends none', async () => {
    respondWith({ success: false }, { status: 403 });

    await assert.rejects(
      () => events.approveEvent(3),
      (error) => error.isForbidden && error.message.length > 0,
    );
  });
});
