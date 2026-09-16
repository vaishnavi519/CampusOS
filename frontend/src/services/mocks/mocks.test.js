import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';

import * as auth from './auth.js';
import * as clubs from './clubs.js';
import * as events from './events.js';
import * as notifications from './notifications.js';
import * as registrations from './registrations.js';
import { clearSession } from './session.js';
import { resetStore, snapshot } from './store.js';
import { DEMO_PASSWORD } from './seed.js';
import {
  EVENT_STATUS,
  MEMBERSHIP_STATUS,
  REGISTRATION_STATUS,
} from '../../utils/constants.js';

/**
 * Exercises the demo data layer the UI is built against.
 *
 * These are the flows the screens depend on — joining a club, registering for
 * an event, and the draft -> pending -> approved -> published lifecycle — so a
 * regression here would break the UI in a way the build cannot catch.
 * Run with `npm test`.
 */

const STUDENT = 'riya.sharma@campus.edu';
const CLUB_ADMIN = 'arjun.mehta@campus.edu';
const FACULTY = 'neha.kulkarni@campus.edu';
const REGISTRAR = 'admin@campus.edu';

const signIn = (email) => auth.login({ email, password: DEMO_PASSWORD });

beforeEach(() => {
  clearSession();
  resetStore();
});

describe('authentication', () => {
  it('signs in a seeded account and returns its role', async () => {
    const { token, user } = await signIn(STUDENT);
    assert.ok(token);
    assert.equal(user.email, STUDENT);
    assert.equal(user.role, 'STUDENT');
  });

  it('rejects a wrong password with 401', async () => {
    await assert.rejects(
      () => auth.login({ email: STUDENT, password: 'wrong' }),
      (error) => error.status === 401,
    );
  });

  it('rejects a duplicate registration with 409, as the backend does', async () => {
    await assert.rejects(
      () =>
        auth.register({
          name: 'Someone Else',
          email: STUDENT,
          password: 'password123',
          role: 'STUDENT',
        }),
      (error) => error.status === 409,
    );
  });

  it('falls back to STUDENT for an unknown role', async () => {
    const user = await auth.register({
      name: 'New Person',
      email: 'new.person@campus.edu',
      password: 'password123',
      role: 'SUPERUSER',
    });
    assert.equal(user.role, 'STUDENT');
  });

  it('signs in an account created during the session', async () => {
    await auth.register({
      name: 'New Person',
      email: 'new.person@campus.edu',
      password: 'password123',
    });
    const { user } = await auth.login({
      email: 'new.person@campus.edu',
      password: 'password123',
    });
    assert.equal(user.name, 'New Person');
  });
});

describe('authorisation', () => {
  it('refuses club-admin endpoints to a student with 403', async () => {
    await signIn(STUDENT);
    await assert.rejects(
      () => clubs.listAdminClubs(),
      (error) => error.status === 403,
    );
  });

  it('refuses student endpoints when nobody is signed in with 401', async () => {
    await assert.rejects(
      () => clubs.listMyMemberships(),
      (error) => error.status === 401,
    );
  });
});

describe('club membership', () => {
  it('creates a pending request and shows it in my clubs', async () => {
    await signIn(STUDENT);

    const before = await clubs.listMyMemberships();
    const target = (await clubs.listClubs()).find(
      (club) => !before.some((row) => row.club_id === club.id),
    );

    await clubs.joinClub(target.id);

    const after = await clubs.listMyMemberships();
    const created = after.find((row) => row.club_id === target.id);

    assert.equal(after.length, before.length + 1);
    assert.equal(created.status, MEMBERSHIP_STATUS.PENDING);
    assert.equal(created.name, target.name);
  });

  it('refuses a second request for the same club with 409', async () => {
    await signIn(STUDENT);
    const target = (await clubs.listClubs())[0];
    await clubs.joinClub(target.id).catch(() => {});

    await assert.rejects(
      () => clubs.joinClub(target.id),
      (error) => error.status === 409,
    );
  });

  it('notifies both the student and the club admin', async () => {
    await signIn(STUDENT);
    const target = (await clubs.listClubs()).find((club) => club.id === 6);
    await clubs.joinClub(target.id);

    const mine = await notifications.listNotifications();
    assert.equal(mine[0].type, 'MEMBERSHIP_SUBMITTED');

    const adminId = snapshot().clubs.find((c) => c.id === 6).admin_id;
    const forAdmin = snapshot().notifications.filter(
      (row) => row.user_id === adminId && row.type === 'MEMBERSHIP_REQUEST',
    );
    assert.ok(forAdmin.length > 0);
  });

  it('approves a request and moves the member to APPROVED', async () => {
    await signIn(CLUB_ADMIN);
    const { members } = await clubs.listClubMembers(1);
    const pending = members.find(
      (row) => row.status === MEMBERSHIP_STATUS.PENDING,
    );

    const updated = await clubs.reviewMembership(pending.membership_id, 'approve');

    assert.equal(updated.status, MEMBERSHIP_STATUS.APPROVED);
    assert.ok(updated.reviewed_at);
  });

  it('refuses to review the same request twice', async () => {
    await signIn(CLUB_ADMIN);
    const { members } = await clubs.listClubMembers(1);
    const pending = members.find(
      (row) => row.status === MEMBERSHIP_STATUS.PENDING,
    );

    await clubs.reviewMembership(pending.membership_id, 'reject');
    await assert.rejects(
      () => clubs.reviewMembership(pending.membership_id, 'approve'),
      (error) => error.status === 400,
    );
  });
});

describe('event lifecycle', () => {
  it('lists published events only, with the club name joined on', async () => {
    const published = await events.listPublishedEvents();
    assert.ok(published.length > 0);
    assert.ok(published.every((event) => event.status === EVENT_STATUS.PUBLISHED));
    assert.ok(published.every((event) => typeof event.club_name === 'string'));
  });

  it('creates an event as DRAFT and carries it through to PUBLISHED', async () => {
    await signIn(CLUB_ADMIN);
    const created = await events.createEvent({
      club_id: 1,
      title: 'Test Event',
      description: 'Created by the smoke test.',
      event_date: '2030-01-15',
      event_time: '10:00:00',
      venue: 'Seminar Hall B',
      capacity: 25,
      eligibility: 'Open to all students',
    });
    assert.equal(created.status, EVENT_STATUS.DRAFT);

    await events.submitEvent(created.id);
    assert.equal(
      snapshot().events.find((row) => row.id === created.id).status,
      EVENT_STATUS.PENDING_APPROVAL,
    );

    await signIn(FACULTY);
    const pending = await events.listPendingEvents();
    assert.ok(pending.some((row) => row.id === created.id));

    await events.approveEvent(created.id);
    assert.equal(
      snapshot().events.find((row) => row.id === created.id).status,
      EVENT_STATUS.APPROVED,
    );

    await signIn(REGISTRAR);
    await events.publishEvent(created.id);
    assert.equal(
      snapshot().events.find((row) => row.id === created.id).status,
      EVENT_STATUS.PUBLISHED,
    );

    const published = await events.listPublishedEvents();
    assert.ok(published.some((row) => row.id === created.id));
  });

  it('refuses to create an event for a club the admin does not own', async () => {
    await signIn(CLUB_ADMIN);
    await assert.rejects(
      () =>
        events.createEvent({
          club_id: 3,
          title: 'Not mine',
          event_date: '2030-01-15',
          event_time: '10:00:00',
          venue: 'Anywhere',
          capacity: 10,
        }),
      (error) => error.status === 403,
    );
  });

  it('refuses to publish an event that faculty has not approved', async () => {
    await signIn(REGISTRAR);
    const draft = snapshot().events.find(
      (row) => row.status === EVENT_STATUS.DRAFT,
    );
    await assert.rejects(
      () => events.publishEvent(draft.id),
      (error) => error.status === 400,
    );
  });

  it('refuses to submit an event that is not a draft', async () => {
    await signIn(CLUB_ADMIN);
    const pendingEvent = snapshot().events.find(
      (row) => row.status === EVENT_STATUS.PENDING_APPROVAL && row.club_id === 1,
    );
    await assert.rejects(
      () => events.submitEvent(pendingEvent.id),
      (error) => error.status === 400,
    );
  });

  it('rejects a pending event with a reason and notifies the club admin', async () => {
    await signIn(FACULTY);
    const [pending] = await events.listPendingEvents();
    await events.rejectEvent(pending.id, 'Venue is double booked.');

    const row = snapshot().events.find((item) => item.id === pending.id);
    assert.equal(row.status, EVENT_STATUS.REJECTED);
    assert.equal(row.rejection_reason, 'Venue is double booked.');

    const clubAdminId = snapshot().clubs.find(
      (club) => club.id === row.club_id,
    ).admin_id;
    assert.ok(
      snapshot().notifications.some(
        (item) => item.user_id === clubAdminId && item.type === 'EVENT_REJECTED',
      ),
    );
  });
});

describe('event registration', () => {
  it('registers a student and reflects the seat in capacity', async () => {
    await signIn(STUDENT);

    const before = await registrations.getEventCapacity(5);
    const created = await registrations.registerForEvent(5);
    const after = await registrations.getEventCapacity(5);

    assert.equal(created.status, REGISTRATION_STATUS.REGISTERED);
    assert.equal(after.taken, before.taken + 1);
  });

  it('refuses a duplicate registration with 409', async () => {
    await signIn(STUDENT);
    await registrations.registerForEvent(5);
    await assert.rejects(
      () => registrations.registerForEvent(5),
      (error) => error.status === 409,
    );
  });

  it('waitlists once the event is full', async () => {
    await signIn(STUDENT);
    // Event 4 holds 40 seats; fill it so the next registration overflows.
    const state = snapshot();
    const event = state.events.find((row) => row.id === 4);
    event.capacity = 1;

    const created = await registrations.registerForEvent(4);
    assert.equal(created.status, REGISTRATION_STATUS.WAITLISTED);
  });

  it('cancels a registration and frees the seat', async () => {
    await signIn(STUDENT);
    const created = await registrations.registerForEvent(5);
    const before = await registrations.getEventCapacity(5);

    const cancelled = await registrations.cancelRegistration(created.id);
    const after = await registrations.getEventCapacity(5);

    assert.equal(cancelled.status, REGISTRATION_STATUS.CANCELLED);
    assert.equal(after.taken, before.taken - 1);
  });

  it('refuses registration for an event that is not published', async () => {
    await signIn(STUDENT);
    const draft = snapshot().events.find(
      (row) => row.status === EVENT_STATUS.DRAFT,
    );
    await assert.rejects(
      () => registrations.registerForEvent(draft.id),
      (error) => error.status === 400,
    );
  });

  it('shows a club admin who registered for their event', async () => {
    await signIn(CLUB_ADMIN);
    const { event, registrations: rows } =
      await registrations.listEventRegistrations(1);

    assert.equal(event.id, 1);
    assert.ok(rows.length > 0);
    assert.ok(rows.every((row) => row.student_email.includes('@')));
  });
});

describe('notifications', () => {
  it('marks a single notification as read', async () => {
    await signIn(STUDENT);
    const [first] = await notifications.listNotifications();
    assert.equal(first.read, false);

    await notifications.markRead(first.id);
    assert.equal(await notifications.countUnread(), 1);
  });

  it('marks everything read and drops the unread count to zero', async () => {
    await signIn(STUDENT);
    await notifications.markAllRead();
    assert.equal(await notifications.countUnread(), 0);
  });

  it('never leaks another user notifications', async () => {
    await signIn(STUDENT);
    const mine = await notifications.listNotifications();
    assert.ok(mine.every((row) => row.user_id === 1));
  });
});
