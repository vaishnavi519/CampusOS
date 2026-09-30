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
 * against the local mock services work unchanged across refreshes.
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

  // Real MIT-WPU student clubs, scraped from https://mitwpu.edu.in/life-wpu/clubs.
  // admin_id is pinned to the single CLUB_ADMIN demo account (Arjun Mehta);
  // faculty_coordinator_id alternates between the two FACULTY_COORDINATOR accounts.
  const MITWPU_BASE = 'https://mitwpu.edu.in';
  const MITWPU_IMG = `${MITWPU_BASE}/uploads/images`;

  const rawClubs = [
    ['Aatman', 'Social', 'A wellness collective running mindfulness, peer-support and mental-health awareness initiatives on campus.', 'Aatman.webp', '/aatman'],
    ['ACM Club', 'Technical', 'The MIT-WPU student chapter of the Association for Computing Machinery — competitive programming, tech talks and coding bootcamps.', 'ACM.webp', '/acm-club'],
    ['AlChE', 'Technical', 'Student chapter of the American Institute of Chemical Engineers, running process-design competitions and industry talks.', 'AlChE.webp', '/AlChE'],
    ['ASME', 'Technical', 'Student chapter of the American Society of Mechanical Engineers, covering design projects and mechanical engineering workshops.', 'ASME.webp', '/asme'],
    ['Avyanna Club', 'Environmental', 'Campus sustainability and environmental-awareness drives, tree plantations and eco-education initiatives.', 'Avyanna_club.webp', '/avyanna-club'],
    ['BAJA SAE', 'Technical', 'Designs and builds an all-terrain vehicle each year to compete at BAJA SAE India.', 'BAJA_SAE.webp', '/baja-sae'],
    ['Banking Forum', 'Professional', 'Sessions, case studies and mentorship focused on careers in banking and financial services.', 'Banking_Forum.webp', '/banking-forum'],
    ['CESA', 'Professional', 'Civil Engineering Students’ Association — site visits, technical workshops and structural-design events.', 'CESA.webp', '/cesa'],
    ['Chalchitra', 'Cultural', 'The campus filmmaking club — short films, screenplay writing and screenings.', 'Chalchitra.webp', '/chalchitra'],
    ['CHEM-E-CAR', 'Technical', 'Designs a chemically-powered shoebox car to compete in the AIChE Chem-E-Car competition.', 'Team-Chem-E-car.webp', '/chem-e-car'],
    ['COSMOS', 'Technical', 'A science and astronomy club running stargazing nights, quizzes and STEM outreach.', 'COSMOS.webp', '/cosmos'],
    ['CSI', 'Technical', 'The MIT-WPU chapter of the Computer Society of India — hackathons, workshops and technical seminars.', 'CSI.webp', '/csi'],
    ['E-Sports Squad Up', 'Sports', 'Organises and competes in inter-collegiate esports tournaments across popular competitive titles.', 'E-Sports-Squad_Up.webp', '/e-sports-squad-up'],
    ['Ferrocement Society of India – Student Chapter', 'Technical', 'Explores ferrocement construction techniques through demonstrations and structural projects.', 'Ferrocement_society.webp', '/ferrocement-society-of-india-student-chapter'],
    ['Finance Forum', 'Entrepreneurship', 'Equity research, a mock trading league and sessions with alumni working in markets.', 'Finance_Forum.webp', '/finance-forum'],
    ['Finfluencers', 'Entrepreneurship', 'Financial literacy content and campaigns aimed at making personal finance approachable for students.', 'Finfluencers.webp', '/finfluencers'],
    ['Indradhanu Club', 'Cultural', 'Celebrates cultural diversity on campus through festivals, exhibitions and cross-cultural exchange events.', 'INDRADHANU_CLUB.webp', '/indradhanu-club'],
    ['INIT – Cloud Club', 'Technical', 'Cloud computing study group covering AWS/Azure/GCP fundamentals, certifications and hands-on labs.', 'INIT-Cloud Club.webp', '/init-cloud-club'],
    ['Innovation Hub Club', 'Entrepreneurship', 'Supports student startups and prototypes with mentorship, ideation sprints and pitch events.', 'Innovation_Hub_Club.webp', '/innovation-hub-club'],
    ['Melodic', 'Cultural', 'The campus music society — bands, open mics and performances at university events.', 'Melodic.webp', '/melodic'],
    ['MIT-WPU Sports', 'Sports', 'Coordinates inter-collegiate sports teams and campus-wide tournaments across multiple disciplines.', 'MIT-WPU-Sports.webp', '/mit-wpu-sports'],
    ['MIT-WPU Adventure Club', 'Sports', 'Treks, expeditions and outdoor adventure activities for students who like to get off campus.', 'Adventure_sports_club.webp', '/life-wpu/adventure-club/about-adventure-club'],
    ['MIT-WPU Cultural Club', 'Cultural', 'Stage productions, dance, drama and the university’s flagship cultural festivals.', 'MIT-WPU_Cultural_Club.webp', '/mit-wpu-cultural-club'],
    ['National Service Scheme', 'Social', 'Village outreach camps, blood donation drives and community-service projects under the NSS charter.', 'National_service_scheme.webp', '/national-service-scheme'],
    ['Ninox Nature', 'Environmental', 'A nature and ecology club running birdwatching walks, biodiversity surveys and conservation drives.', 'NINOX_NATURE.webp', '/ninox-nature'],
    ['Numerates Club', 'Technical', 'A mathematics club for problem-solving circles, olympiad prep and applied-math talks.', 'numerates.webp', '/nummerates-club'],
    ['Rowing Club', 'Sports', 'Trains and competes in collegiate rowing regattas.', 'Rowing_Club.webp', '/rowing-club'],
    ['Society of Women Engineers', 'Professional', 'Supports and mentors women in engineering through talks, networking and outreach programmes.', 'Society_of_Women_Engineers.webp', '/society-of-women-engineers'],
    ['SwasthERA – HM Club', 'Social', 'Health-management focused club running wellness camps and public-health awareness drives.', 'SwasthERA_HM_Club.webp', '/swasthaera'],
    ['Team DART SoMe', 'Technical', 'Designs autonomous and semi-autonomous vehicles for national robotics competitions.', 'Team_DART_SoMe.webp', '/team-dart'],
    ['Team Prokarters', 'Technical', 'Builds and races go-karts, competing in national kart-racing events.', 'TEAM_PROKARTERS.webp', '/team-prokarters'],
    ['Team Skytroopers SoMe', 'Technical', 'An aerospace design team building UAVs and competing in national drone/aero competitions.', 'Team_Skytroopers.webp', '/team-skytroopers'],
    ['TEDx MIT-WPU', 'Cultural', 'Runs the university’s independently organised TEDx event under the banner "ideas worth spreading".', 'TEDxMIT-WPU.webp', '/tedxmit-wpu'],
    ['Udaan Sports Club', 'Sports', 'Athletic training, the annual sports meet, and inter-departmental tournaments.', 'Udaan-Sports_Club.webp', '/udaan'],
    ['UMED Social Club', 'Social', 'Community-engagement projects connecting students with local outreach and volunteering opportunities.', 'UMED_Social_Club.webp', '/umed-social-club'],
    ['Unnati Research Club', 'Technical', 'Encourages undergraduate research through reading groups, paper-writing support and research showcases.', 'Unnati-research.webp', '/unnati'],
    ['Utkarsh – The Business Club', 'Entrepreneurship', 'Case-study competitions, business simulations and networking with industry professionals.', 'Utkarsh-The Business-Club.webp', '/utkarsh-the-buiness-club'],
    ['Vegapod Hyperloop', 'Technical', 'Designs a hyperloop pod prototype to compete in international hyperloop-technology competitions.', 'Vegapod_Hyper_Loop.webp', '/vegapod-hyperloop'],
    ['Writers Web Club', 'Literary', 'Fortnightly writing circles, the campus literary magazine, and the annual debate tournament.', 'Writers_Web-Club.webp', '/writers-web'],
    ['Young Democrates Club', 'Social', 'Encourages civic and political engagement among students through debates and discussion forums.', 'Young_Democrates_Club.webp', '/young-democrates'],
  ];

  const clubs = rawClubs.map(([name, category, description, logoFile, path], index) => ({
    id: index + 1,
    name,
    description,
    category,
    logo_url: `${MITWPU_IMG}/${encodeURI(logoFile)}`,
    website: `${MITWPU_BASE}${path}`,
    admin_id: 2,
    faculty_coordinator_id: index % 2 === 0 ? 3 : 8,
    status: 'APPROVED',
    created_at: isoTimestamp(-410 + index * 3),
  }));

  // Handy id lookups for the demo memberships/events/notifications below,
  // kept by name so the list above can be reordered freely.
  const clubIdByName = Object.fromEntries(clubs.map((club) => [club.name, club.id]));
  const ACM = clubIdByName['ACM Club'];
  const BAJA = clubIdByName['BAJA SAE'];
  const CULTURAL = clubIdByName['MIT-WPU Cultural Club'];
  const NSS = clubIdByName['National Service Scheme'];
  const FINANCE = clubIdByName['Finance Forum'];
  const UDAAN = clubIdByName['Udaan Sports Club'];
  const WRITERS = clubIdByName['Writers Web Club'];

  const memberships = [
    {
      id: 1,
      club_id: ACM,
      student_id: 1,
      status: MEMBERSHIP_STATUS.APPROVED,
      applied_at: isoTimestamp(-120),
      reviewed_at: isoTimestamp(-118),
    },
    {
      id: 2,
      club_id: CULTURAL,
      student_id: 1,
      status: MEMBERSHIP_STATUS.PENDING,
      applied_at: isoTimestamp(-4),
      reviewed_at: null,
    },
    {
      id: 3,
      club_id: FINANCE,
      student_id: 1,
      status: MEMBERSHIP_STATUS.REJECTED,
      applied_at: isoTimestamp(-60),
      reviewed_at: isoTimestamp(-55),
    },
    {
      id: 4,
      club_id: ACM,
      student_id: 5,
      status: MEMBERSHIP_STATUS.APPROVED,
      applied_at: isoTimestamp(-200),
      reviewed_at: isoTimestamp(-199),
    },
    {
      id: 5,
      club_id: ACM,
      student_id: 6,
      status: MEMBERSHIP_STATUS.PENDING,
      applied_at: isoTimestamp(-2),
      reviewed_at: null,
    },
    {
      id: 6,
      club_id: ACM,
      student_id: 7,
      status: MEMBERSHIP_STATUS.APPROVED,
      applied_at: isoTimestamp(-90),
      reviewed_at: isoTimestamp(-88),
    },
    {
      id: 7,
      club_id: BAJA,
      student_id: 7,
      status: MEMBERSHIP_STATUS.PENDING,
      applied_at: isoTimestamp(-1),
      reviewed_at: null,
    },
  ];

  const events = [
    {
      id: 1,
      club_id: ACM,
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
      club_id: CULTURAL,
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
      club_id: NSS,
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
      club_id: FINANCE,
      title: 'Markets Reading Group: Valuation Basics',
      description:
        'First of four sessions on discounted cash flow. Reading circulated a week in advance.',
      event_date: isoDate(6),
      event_time: '16:00:00',
      venue: 'Seminar Hall B',
      capacity: 40,
      eligibility: 'Members of the Finance Forum',
      status: EVENT_STATUS.PUBLISHED,
      created_by: 7,
      created_at: isoTimestamp(-9),
    },
    {
      id: 5,
      club_id: UDAAN,
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
      club_id: WRITERS,
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
      club_id: BAJA,
      title: 'Line-Follower Robot Workshop',
      description:
        'Hands-on session covering sensor calibration and PID tuning. Kits shared between pairs.',
      event_date: isoDate(13),
      event_time: '14:00:00',
      venue: 'Embedded Systems Lab, Room 402',
      capacity: 30,
      eligibility: 'Members of BAJA SAE',
      status: EVENT_STATUS.PENDING_APPROVAL,
      created_by: 2,
      created_at: isoTimestamp(-3),
    },
    {
      id: 8,
      club_id: ACM,
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
      club_id: ACM,
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
      club_id: NSS,
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
      club_id: BAJA,
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
      club_id: ACM,
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
      body: 'The ACM Club published a new event on 9 days from now. 120 seats available.',
      link: '/app/events/1',
      read: false,
      created_at: isoTimestamp(0, -3),
    },
    {
      id: 2,
      user_id: 1,
      type: 'MEMBERSHIP_SUBMITTED',
      title: 'Membership request sent to MIT-WPU Cultural Club',
      body: 'Your request is waiting for the club administrator to review it.',
      link: `/app/clubs/${CULTURAL}`,
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
      title: 'Finance Forum declined your request',
      body: 'Intake for this semester has closed. Requests reopen in January.',
      link: `/app/clubs/${FINANCE}`,
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
      title: 'Ananya Deshpande asked to join ACM Club',
      body: 'One membership request is waiting for review.',
      link: `/club-admin/clubs/${ACM}/members`,
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
    version: 3,
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
