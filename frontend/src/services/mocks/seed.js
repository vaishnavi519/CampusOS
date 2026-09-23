import {
  ATTENDANCE_STATUS,
  EVENT_STATUS,
  MEMBERSHIP_STATUS,
  REGISTRATION_STATUS,
  ROLES,
} from '../../utils/constants.js';

/**
 * Sample dataset for demo mode.
 *
 * DEMO CONTENT ONLY — none of this is real and none of it reaches the backend.
 * Shapes mirror the MySQL rows the Express controllers return so screens built
 * against demo mode work unchanged against the live API.
 */

const DAY = 86400000;

const isoDate = (offsetDays) => {
  const date = new Date(Date.now() + offsetDays * DAY);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
};

const isoTimestamp = (offsetDays, hoursOffset = 0) =>
  new Date(Date.now() + offsetDays * DAY + hoursOffset * 3600000).toISOString();

/** Every demo account shares this password. Shown on the sign-in screen. */
export const DEMO_PASSWORD = 'campus123';

export function buildSeed() {
  const users = [
    {
      id: 1,
      name: 'Riya Sharma',
      email: 'riya.sharma@campus.edu',
      role: ROLES.STUDENT,
      created_at: isoTimestamp(-420),
    },
    {
      id: 2,
      name: 'Arjun Mehta',
      email: 'arjun.mehta@campus.edu',
      role: ROLES.CLUB_ADMIN,
      created_at: isoTimestamp(-500),
    },
    {
      id: 3,
      name: 'Dr. Neha Kulkarni',
      email: 'neha.kulkarni@campus.edu',
      role: ROLES.FACULTY_COORDINATOR,
      created_at: isoTimestamp(-900),
    },
    {
      id: 4,
      name: 'Registrar Office',
      email: 'admin@campus.edu',
      role: ROLES.SYSTEM_ADMIN,
      created_at: isoTimestamp(-1200),
    },
    {
      id: 5,
      name: 'Kabir Nair',
      email: 'kabir.nair@campus.edu',
      role: ROLES.STUDENT,
      created_at: isoTimestamp(-300),
    },
    {
      id: 6,
      name: 'Ananya Deshpande',
      email: 'ananya.deshpande@campus.edu',
      role: ROLES.STUDENT,
      created_at: isoTimestamp(-260),
    },
    {
      id: 7,
      name: 'Imran Qureshi',
      email: 'imran.qureshi@campus.edu',
      role: ROLES.STUDENT,
      created_at: isoTimestamp(-180),
    },
    {
      id: 8,
      name: 'Prof. Sanjay Rao',
      email: 'sanjay.rao@campus.edu',
      role: ROLES.FACULTY_COORDINATOR,
      created_at: isoTimestamp(-800),
    },
  ];

  const clubs = [
    {
      id: 1,
      name: 'Computer Society',
      description:
        'Weekly problem-solving sessions, an annual hackathon, and open-source contribution drives. Open to all departments.',
      category: 'Technical',
      admin_id: 2,
      faculty_coordinator_id: 3,
      status: 'APPROVED',
      created_at: isoTimestamp(-410),
    },
    {
      id: 2,
      name: 'Robotics and Automation Cell',
      description:
        'Builds competition robots for national events and runs the embedded systems lab on Saturdays.',
      category: 'Technical',
      admin_id: 2,
      faculty_coordinator_id: 8,
      status: 'APPROVED',
      created_at: isoTimestamp(-365),
    },
    {
      id: 3,
      name: 'Dramatics Society',
      description:
        'Stage productions each semester, plus improv workshops and the inter-college one-act festival.',
      category: 'Cultural',
      admin_id: 5,
      faculty_coordinator_id: 3,
      status: 'APPROVED',
      created_at: isoTimestamp(-330),
    },
    {
      id: 4,
      name: 'National Service Scheme Unit',
      description:
        'Village outreach camps, blood donation drives and campus sustainability projects.',
      category: 'Social Service',
      admin_id: 6,
      faculty_coordinator_id: 8,
      status: 'APPROVED',
      created_at: isoTimestamp(-290),
    },
    {
      id: 5,
      name: 'Finance and Investment Cell',
      description:
        'Equity research reading group, a mock trading league, and sessions with alumni working in markets.',
      category: 'Entrepreneurship',
      admin_id: 7,
      faculty_coordinator_id: 3,
      status: 'APPROVED',
      created_at: isoTimestamp(-210),
    },
    {
      id: 6,
      name: 'Athletics Club',
      description:
        'Track and field training, the annual sports meet, and inter-departmental tournaments.',
      category: 'Sports',
      admin_id: 5,
      faculty_coordinator_id: 8,
      status: 'APPROVED',
      created_at: isoTimestamp(-150),
    },
    {
      id: 7,
      name: 'Literary Circle',
      description:
        'Fortnightly book discussions, the campus magazine, and the annual debate tournament.',
      category: 'Literary',
      admin_id: 6,
      faculty_coordinator_id: 3,
      status: 'APPROVED',
      created_at: isoTimestamp(-95),
    },
  ];

  const memberships = [
    {
      id: 1,
      club_id: 1,
      student_id: 1,
      status: MEMBERSHIP_STATUS.APPROVED,
      applied_at: isoTimestamp(-120),
      reviewed_at: isoTimestamp(-118),
    },
    {
      id: 2,
      club_id: 3,
      student_id: 1,
      status: MEMBERSHIP_STATUS.PENDING,
      applied_at: isoTimestamp(-4),
      reviewed_at: null,
    },
    {
      id: 3,
      club_id: 5,
      student_id: 1,
      status: MEMBERSHIP_STATUS.REJECTED,
      applied_at: isoTimestamp(-60),
      reviewed_at: isoTimestamp(-55),
    },
    {
      id: 4,
      club_id: 1,
      student_id: 5,
      status: MEMBERSHIP_STATUS.APPROVED,
      applied_at: isoTimestamp(-200),
      reviewed_at: isoTimestamp(-199),
    },
    {
      id: 5,
      club_id: 1,
      student_id: 6,
      status: MEMBERSHIP_STATUS.PENDING,
      applied_at: isoTimestamp(-2),
      reviewed_at: null,
    },
    {
      id: 6,
      club_id: 1,
      student_id: 7,
      status: MEMBERSHIP_STATUS.APPROVED,
      applied_at: isoTimestamp(-90),
      reviewed_at: isoTimestamp(-88),
    },
    {
      id: 7,
      club_id: 2,
      student_id: 7,
      status: MEMBERSHIP_STATUS.PENDING,
      applied_at: isoTimestamp(-1),
      reviewed_at: null,
    },
  ];

  const events = [
    {
      id: 1,
      club_id: 1,
      title: 'Autumn Hackathon 2025',
      description:
        'A 24-hour build sprint. Teams of up to four. Themes are announced at the opening briefing; hardware is available from the lab on request. Meals provided.',
      event_date: isoDate(9),
      event_time: '09:00:00',
      venue: 'Central Computing Lab, Block C',
      capacity: 120,
      eligibility: 'Second year and above, all departments',
      status: EVENT_STATUS.PUBLISHED,
      created_by: 2,
      created_at: isoTimestamp(-25),
    },
    {
      id: 2,
      club_id: 3,
      title: 'One-Act Play Festival',
      description:
        'Six student-written one-act plays performed across a single evening, followed by an audience vote.',
      event_date: isoDate(16),
      event_time: '17:30:00',
      venue: 'Main Auditorium',
      capacity: 300,
      eligibility: 'Open to all students and staff',
      status: EVENT_STATUS.PUBLISHED,
      created_by: 5,
      created_at: isoTimestamp(-18),
    },
    {
      id: 3,
      club_id: 4,
      title: 'Blood Donation Camp',
      description:
        'Run with the district blood bank. Bring a photo ID. Donors must be over 18 and above 50 kg.',
      event_date: isoDate(3),
      event_time: '10:00:00',
      venue: 'Health Centre, Ground Floor',
      capacity: 80,
      eligibility: 'Open to all students and staff',
      status: EVENT_STATUS.PUBLISHED,
      created_by: 6,
      created_at: isoTimestamp(-11),
    },
    {
      id: 4,
      club_id: 5,
      title: 'Markets Reading Group: Valuation Basics',
      description:
        'First of four sessions on discounted cash flow. Reading circulated a week in advance.',
      event_date: isoDate(6),
      event_time: '16:00:00',
      venue: 'Seminar Hall B',
      capacity: 40,
      eligibility: 'Members of the Finance and Investment Cell',
      status: EVENT_STATUS.PUBLISHED,
      created_by: 7,
      created_at: isoTimestamp(-9),
    },
    {
      id: 5,
      club_id: 6,
      title: 'Inter-Departmental Athletics Meet',
      description:
        'Track events across the morning, field events after lunch. Register through your department representative if you are competing.',
      event_date: isoDate(21),
      event_time: '07:00:00',
      venue: 'University Sports Ground',
      capacity: 500,
      eligibility: 'Open to all students',
      status: EVENT_STATUS.PUBLISHED,
      created_by: 5,
      created_at: isoTimestamp(-30),
    },
    {
      id: 6,
      club_id: 7,
      title: 'Annual Debate Tournament',
      description:
        'British parliamentary format, four preliminary rounds and a final. Teams of two.',
      event_date: isoDate(-12),
      event_time: '09:30:00',
      venue: 'Seminar Hall A',
      capacity: 64,
      eligibility: 'Open to all students',
      status: EVENT_STATUS.PUBLISHED,
      created_by: 6,
      created_at: isoTimestamp(-60),
    },
    {
      id: 7,
      club_id: 2,
      title: 'Line-Follower Robot Workshop',
      description:
        'Hands-on session covering sensor calibration and PID tuning. Kits shared between pairs.',
      event_date: isoDate(13),
      event_time: '14:00:00',
      venue: 'Embedded Systems Lab, Room 402',
      capacity: 30,
      eligibility: 'Members of the Robotics and Automation Cell',
      status: EVENT_STATUS.PENDING_APPROVAL,
      created_by: 2,
      created_at: isoTimestamp(-3),
    },
    {
      id: 8,
      club_id: 1,
      title: 'Open Source Contribution Drive',
      description:
        'Guided first contributions to maintained projects. Bring a laptop with git configured.',
      event_date: isoDate(27),
      event_time: '11:00:00',
      venue: 'Central Computing Lab, Block C',
      capacity: 60,
      eligibility: 'Open to all students',
      status: EVENT_STATUS.PENDING_APPROVAL,
      created_by: 2,
      created_at: isoTimestamp(-2),
    },
    {
      id: 9,
      club_id: 1,
      title: 'Alumni Panel: Working in Systems Engineering',
      description:
        'Four alumni discuss the first three years of their careers. Audience questions for the last half hour.',
      event_date: isoDate(34),
      event_time: '15:00:00',
      venue: 'Seminar Hall B',
      capacity: 90,
      eligibility: 'Final year students',
      status: EVENT_STATUS.APPROVED,
      created_by: 2,
      created_at: isoTimestamp(-14),
    },
    {
      id: 10,
      club_id: 4,
      title: 'Campus Tree Census',
      description:
        'Mapping and tagging every tree on campus as part of the sustainability audit.',
      event_date: isoDate(19),
      event_time: '08:00:00',
      venue: 'Assemble at the Library Steps',
      capacity: 50,
      eligibility: 'Open to all students',
      status: EVENT_STATUS.APPROVED,
      created_by: 6,
      created_at: isoTimestamp(-8),
    },
    {
      id: 11,
      club_id: 2,
      title: 'Robotics Lab Orientation',
      description: null,
      event_date: isoDate(40),
      event_time: '10:30:00',
      venue: 'Embedded Systems Lab, Room 402',
      capacity: 25,
      eligibility: null,
      status: EVENT_STATUS.DRAFT,
      created_by: 2,
      created_at: isoTimestamp(-1),
    },
    {
      id: 12,
      club_id: 1,
      title: 'Competitive Programming Ladder — Round 5',
      description:
        'Two-hour individual contest. Editorial discussion immediately afterwards.',
      event_date: isoDate(11),
      event_time: '18:00:00',
      venue: 'Central Computing Lab, Block C',
      capacity: 100,
      eligibility: 'Open to all students',
      status: EVENT_STATUS.REJECTED,
      created_by: 2,
      created_at: isoTimestamp(-16),
      rejection_reason:
        'Clashes with the departmental practical examination scheduled the same evening. Please propose another date.',
    },
  ];

  // Seeded registrations for the demo student plus enough others to make
  // capacity numbers move.
  const registrations = [
    {
      id: 1,
      event_id: 1,
      student_id: 1,
      status: REGISTRATION_STATUS.REGISTERED,
      registered_at: isoTimestamp(-20),
    },
    {
      id: 2,
      event_id: 3,
      student_id: 1,
      status: REGISTRATION_STATUS.REGISTERED,
      registered_at: isoTimestamp(-7),
    },
    {
      id: 3,
      event_id: 6,
      student_id: 1,
      status: REGISTRATION_STATUS.REGISTERED,
      registered_at: isoTimestamp(-40),
    },
    {
      id: 4,
      event_id: 2,
      student_id: 1,
      status: REGISTRATION_STATUS.CANCELLED,
      registered_at: isoTimestamp(-15),
      cancelled_at: isoTimestamp(-5),
    },
    {
      id: 5,
      event_id: 1,
      student_id: 5,
      status: REGISTRATION_STATUS.REGISTERED,
      registered_at: isoTimestamp(-19),
    },
    {
      id: 6,
      event_id: 1,
      student_id: 6,
      status: REGISTRATION_STATUS.REGISTERED,
      registered_at: isoTimestamp(-18),
    },
    {
      id: 7,
      event_id: 1,
      student_id: 7,
      status: REGISTRATION_STATUS.REGISTERED,
      registered_at: isoTimestamp(-17),
    },
    {
      id: 8,
      event_id: 4,
      student_id: 5,
      status: REGISTRATION_STATUS.REGISTERED,
      registered_at: isoTimestamp(-6),
    },
    {
      id: 9,
      event_id: 3,
      student_id: 7,
      status: REGISTRATION_STATUS.REGISTERED,
      registered_at: isoTimestamp(-6),
    },
  ];

  const notifications = [
    {
      id: 1,
      user_id: 1,
      type: 'EVENT_PUBLISHED',
      title: 'Autumn Hackathon 2025 is open for registration',
      body: 'The Computer Society published a new event on 9 days from now. 120 seats available.',
      link: '/app/events/1',
      read: false,
      created_at: isoTimestamp(0, -3),
    },
    {
      id: 2,
      user_id: 1,
      type: 'MEMBERSHIP_SUBMITTED',
      title: 'Membership request sent to Dramatics Society',
      body: 'Your request is waiting for the club administrator to review it.',
      link: '/app/clubs/3',
      read: false,
      created_at: isoTimestamp(-4),
    },
    {
      id: 3,
      user_id: 1,
      type: 'REGISTRATION_CONFIRMED',
      title: 'You are registered for Blood Donation Camp',
      body: 'Bring a photo ID. Health Centre, Ground Floor.',
      link: '/app/registrations',
      read: true,
      created_at: isoTimestamp(-7),
    },
    {
      id: 4,
      user_id: 1,
      type: 'MEMBERSHIP_REJECTED',
      title: 'Finance and Investment Cell declined your request',
      body: 'Intake for this semester has closed. Requests reopen in January.',
      link: '/app/clubs/5',
      read: true,
      created_at: isoTimestamp(-55),
    },
    {
      id: 5,
      user_id: 2,
      type: 'EVENT_REJECTED',
      title: 'Competitive Programming Ladder — Round 5 was rejected',
      body: 'Clashes with the departmental practical examination scheduled the same evening.',
      link: '/club-admin/events/12',
      read: false,
      created_at: isoTimestamp(-16),
    },
    {
      id: 6,
      user_id: 2,
      type: 'MEMBERSHIP_REQUEST',
      title: 'Ananya Deshpande asked to join Computer Society',
      body: 'One membership request is waiting for review.',
      link: '/club-admin/clubs/1/members',
      read: false,
      created_at: isoTimestamp(-2),
    },
    {
      id: 7,
      user_id: 3,
      type: 'EVENT_SUBMITTED',
      title: 'Two events are waiting for your approval',
      body: 'Line-Follower Robot Workshop and Open Source Contribution Drive.',
      link: '/faculty/pending',
      read: false,
      created_at: isoTimestamp(-2),
    },
    {
      id: 8,
      user_id: 4,
      type: 'EVENT_APPROVED',
      title: 'Two approved events are ready to publish',
      body: 'Alumni Panel and Campus Tree Census have cleared faculty approval.',
      link: '/admin/approved',
      read: false,
      created_at: isoTimestamp(-8),
    },
  ];

  // Attendance is recorded per (event, student) by the organising club.
  const attendance = [
    {
      id: 1,
      event_id: 6,
      student_id: 1,
      status: ATTENDANCE_STATUS.PRESENT,
      marked_at: isoTimestamp(-38),
    },
    {
      id: 2,
      event_id: 6,
      student_id: 5,
      status: ATTENDANCE_STATUS.ABSENT,
      marked_at: isoTimestamp(-38),
    },
  ];

  return {
    version: 2,
    users,
    clubs,
    memberships,
    events,
    registrations,
    attendance,
    notifications,
    // Passwords for accounts created during a demo session, keyed by user id.
    // Seeded accounts all use DEMO_PASSWORD.
    credentials: {},
  };
}

export const DEMO_ACCOUNTS = [
  { email: 'riya.sharma@campus.edu', role: ROLES.STUDENT, name: 'Riya Sharma' },
  { email: 'arjun.mehta@campus.edu', role: ROLES.CLUB_ADMIN, name: 'Arjun Mehta' },
  {
    email: 'neha.kulkarni@campus.edu',
    role: ROLES.FACULTY_COORDINATOR,
    name: 'Dr. Neha Kulkarni',
  },
  { email: 'admin@campus.edu', role: ROLES.SYSTEM_ADMIN, name: 'Registrar Office' },
];
