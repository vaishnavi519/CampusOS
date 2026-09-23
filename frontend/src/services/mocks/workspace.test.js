import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';

import * as attendance from './attendance.js';
import * as auth from './auth.js';
import * as recommendations from './recommendations.js';
import * as registrations from './registrations.js';
import * as reports from './reports.js';
import * as stats from './stats.js';
import * as users from './users.js';
import { clearSession } from './session.js';
import { resetStore, snapshot } from './store.js';
import { DEMO_PASSWORD } from './seed.js';
import { ATTENDANCE_STATUS, REGISTRATION_STATUS } from '../../utils/constants.js';

/**
 * Covers the demo layer behind the role workspaces: attendance, participation
 * reporting, recommendations, platform statistics and account management.
 *
 * Each of these mirrors an API the screens call, so the role restrictions and
 * the aggregate figures are asserted here rather than discovered in the UI.
 */

const STUDENT = 'riya.sharma@campus.edu';
const OTHER_STUDENT = 'kabir.nair@campus.edu';
const CLUB_ADMIN = 'arjun.mehta@campus.edu';
const FACULTY = 'neha.kulkarni@campus.edu';
const REGISTRAR = 'admin@campus.edu';

const signIn = (email) => auth.login({ email, password: DEMO_PASSWORD });

/** An event the signed-in club admin owns that already has registrations. */
function ownedEventWithRegistrations(adminId) {
  const { events, clubs, registrations: rows } = snapshot();
  const ownedClubIds = clubs
    .filter((club) => club.admin_id === adminId)
    .map((club) => club.id);

  return events.find(
    (event) =>
      ownedClubIds.includes(event.club_id) &&
      rows.some((row) => row.event_id === event.id),
  );
}

beforeEach(() => {
  clearSession();
  resetStore();
});

describe('attendance', () => {
  it('marks a registered student present and reads it back', async () => {
    const { user } = await signIn(CLUB_ADMIN);
    const event = ownedEventWithRegistrations(user.id);
    const [registration] = snapshot().registrations.filter(
      (row) => row.event_id === event.id,
    );

    await attendance.markAttendance(event.id, {
      student_id: registration.student_id,
      status: ATTENDANCE_STATUS.PRESENT,
    });

    const rows = await attendance.listAttendance(event.id);
    const marked = rows.find(
      (row) => row.student_id === registration.student_id,
    );
    assert.equal(marked.status, ATTENDANCE_STATUS.PRESENT);
  });

  it('updates rather than duplicates when a student is re-marked', async () => {
    const { user } = await signIn(CLUB_ADMIN);
    const event = ownedEventWithRegistrations(user.id);
    const [registration] = snapshot().registrations.filter(
      (row) => row.event_id === event.id,
    );

    await attendance.markAttendance(event.id, {
      student_id: registration.student_id,
      status: ATTENDANCE_STATUS.PRESENT,
    });
    await attendance.markAttendance(event.id, {
      student_id: registration.student_id,
      status: ATTENDANCE_STATUS.ABSENT,
    });

    const rows = await attendance.listAttendance(event.id);
    const forStudent = rows.filter(
      (row) => row.student_id === registration.student_id,
    );
    assert.equal(forStudent.length, 1);
    assert.equal(forStudent[0].status, ATTENDANCE_STATUS.ABSENT);
  });

  it('rejects a student who is not registered for the event', async () => {
    const { user } = await signIn(CLUB_ADMIN);
    const event = ownedEventWithRegistrations(user.id);

    await assert.rejects(
      () =>
        attendance.markAttendance(event.id, {
          student_id: 9999,
          status: ATTENDANCE_STATUS.PRESENT,
        }),
      (error) => error.status === 400,
    );
  });

  it('rejects a status the contract does not define', async () => {
    const { user } = await signIn(CLUB_ADMIN);
    const event = ownedEventWithRegistrations(user.id);
    const [registration] = snapshot().registrations.filter(
      (row) => row.event_id === event.id,
    );

    await assert.rejects(
      () =>
        attendance.markAttendance(event.id, {
          student_id: registration.student_id,
          status: 'MAYBE',
        }),
      (error) => error.status === 400,
    );
  });

  it('refuses a club admin who does not administer the event', async () => {
    await signIn(CLUB_ADMIN);
    const { clubs, events } = snapshot();
    const foreign = events.find((event) => {
      const club = clubs.find((row) => row.id === event.club_id);
      return club && club.admin_id !== 2;
    });

    await assert.rejects(
      () => attendance.listAttendance(foreign.id),
      (error) => error.status === 404,
    );
  });

  it('refuses a student outright', async () => {
    await signIn(STUDENT);
    await assert.rejects(
      () => attendance.listAttendance(1),
      (error) => error.status === 403,
    );
  });
});

describe('participation report', () => {
  it('counts only non-cancelled registrations', async () => {
    const { user } = await signIn(STUDENT);
    const active = snapshot().registrations.filter(
      (row) =>
        row.student_id === user.id &&
        row.status !== REGISTRATION_STATUS.CANCELLED,
    );

    const { summary, report } = await reports.getMyParticipation();
    assert.equal(summary.total_registered, active.length);
    assert.equal(report.length, active.length);
  });

  it('reports attendance that a club marked', async () => {
    const admin = await signIn(CLUB_ADMIN);
    const event = ownedEventWithRegistrations(admin.user.id);
    const registration = snapshot().registrations.find(
      (row) =>
        row.event_id === event.id &&
        row.status !== REGISTRATION_STATUS.CANCELLED,
    );

    await attendance.markAttendance(event.id, {
      student_id: registration.student_id,
      status: ATTENDANCE_STATUS.PRESENT,
    });

    const owner = snapshot().users.find(
      (row) => row.id === registration.student_id,
    );
    await signIn(owner.email);

    const { report } = await reports.getMyParticipation();
    const row = report.find((item) => item.event_id === event.id);
    assert.equal(row.attendance_status, ATTENDANCE_STATUS.PRESENT);
  });

  it('never counts attendance above registrations', async () => {
    await signIn(STUDENT);
    const { summary } = await reports.getMyParticipation();
    assert.ok(summary.total_attended <= summary.total_registered);
  });

  it('is student-only', async () => {
    await signIn(FACULTY);
    await assert.rejects(
      () => reports.getMyParticipation(),
      (error) => error.status === 403,
    );
  });
});

describe('recommendations', () => {
  it('never recommends an event the student already registered for', async () => {
    const { user } = await signIn(STUDENT);
    const registered = new Set(
      snapshot()
        .registrations.filter(
          (row) =>
            row.student_id === user.id &&
            row.status !== REGISTRATION_STATUS.CANCELLED,
        )
        .map((row) => row.event_id),
    );

    const rows = await recommendations.listRecommendations();
    assert.ok(rows.every((row) => !registered.has(row.event_id)));
  });

  it('only recommends published events', async () => {
    await signIn(STUDENT);
    const { events } = snapshot();
    const rows = await recommendations.listRecommendations();

    for (const row of rows) {
      const event = events.find((item) => item.id === row.event_id);
      assert.equal(event.status, 'PUBLISHED');
    }
  });

  it('carries an id the event route can link to', async () => {
    await signIn(OTHER_STUDENT);
    const rows = await recommendations.listRecommendations();
    assert.ok(rows.every((row) => row.id === row.event_id));
  });

  it('is student-only', async () => {
    await signIn(REGISTRAR);
    await assert.rejects(
      () => recommendations.listRecommendations(),
      (error) => error.status === 403,
    );
  });
});

describe('platform statistics', () => {
  it('reports the store totals', async () => {
    await signIn(REGISTRAR);
    const state = snapshot();
    const figures = await stats.getPlatformStats();

    assert.equal(figures.total_users, state.users.length);
    assert.equal(figures.total_clubs, state.clubs.length);
    assert.equal(figures.total_events, state.events.length);
  });

  it('excludes cancelled registrations from the total', async () => {
    await signIn(REGISTRAR);
    const state = snapshot();
    const figures = await stats.getPlatformStats();

    assert.ok(figures.total_registrations < state.registrations.length);
  });

  it('is system-admin-only', async () => {
    await signIn(CLUB_ADMIN);
    await assert.rejects(
      () => stats.getPlatformStats(),
      (error) => error.status === 403,
    );
  });
});

describe('account management', () => {
  it('lists every account for a system administrator', async () => {
    await signIn(REGISTRAR);
    const rows = await users.listUsers();
    assert.equal(rows.length, snapshot().users.length);
    assert.ok(rows.every((row) => row.email && row.role));
  });

  it('is system-admin-only', async () => {
    await signIn(STUDENT);
    await assert.rejects(
      () => users.listUsers(),
      (error) => error.status === 403,
    );
  });
});

describe('cancelling a registration', () => {
  it('frees the seat and is reflected in the student report', async () => {
    const { user } = await signIn(STUDENT);
    const before = await registrations.listMyRegistrations();
    const active = before.find(
      (row) => row.status !== REGISTRATION_STATUS.CANCELLED,
    );

    await registrations.cancelRegistration(active.registration_id);

    const { summary } = await reports.getMyParticipation();
    const stillActive = snapshot().registrations.filter(
      (row) =>
        row.student_id === user.id &&
        row.status !== REGISTRATION_STATUS.CANCELLED,
    );
    assert.equal(summary.total_registered, stillActive.length);
  });
});
