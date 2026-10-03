

const MITWPU_BASE = 'https://mitwpu.edu.in';
const MITWPU_IMG = `${MITWPU_BASE}/uploads/images`;

const rawClubs = [
  ['Aatman', 'Social', 'A wellness collective running mindfulness and peer-support initiatives.', 'Aatman.webp', '/aatman'],
  ['ACM Club', 'Technical', 'Student chapter of the Association for Computing Machinery.', 'ACM.webp', '/acm-club'],
  ['AlChE', 'Technical', 'Student chapter of the American Institute of Chemical Engineers.', 'AlChE.webp', '/AlChE'],
  ['ASME', 'Technical', 'Student chapter of the American Society of Mechanical Engineers.', 'ASME.webp', '/asme'],
  ['Avyanna Club', 'Environmental', 'Campus sustainability and environmental-awareness initiatives.', 'Avyanna_club.webp', '/avyanna-club'],
  ['BAJA SAE', 'Technical', 'Student engineering team designing and building an all-terrain vehicle.', 'BAJA_SAE.webp', '/baja-sae'],
  ['Banking Forum', 'Professional', 'Activities focused on banking and financial services.', 'Banking_Forum.webp', '/banking-forum'],
  ['CESA', 'Professional', 'Civil Engineering Students Association activities.', 'CESA.webp', '/cesa'],
  ['Chalchitra', 'Cultural', 'Student filmmaking, screenplay writing and film screenings.', 'Chalchitra.webp', '/chalchitra'],
  ['CHEM-E-CAR', 'Technical', 'Student team developing chemically powered vehicles.', 'Team-Chem-E-car.webp', '/chem-e-car'],
  ['COSMOS', 'Technical', 'Science and astronomy activities.', 'COSMOS.webp', '/cosmos'],
  ['CSI', 'Technical', 'Computer Society of India student chapter.', 'CSI.webp', '/csi'],
  ['E-Sports Squad Up', 'Sports', 'Competitive esports activities and tournaments.', 'E-Sports-Squad_Up.webp', '/e-sports-squad-up'],
  ['Ferrocement Society of India – Student Chapter', 'Technical', 'Student activities exploring ferrocement construction.', 'Ferrocement_society.webp', '/ferrocement-society-of-india-student-chapter'],
  ['Finance Forum', 'Entrepreneurship', 'Finance, markets and financial education activities.', 'Finance_Forum.webp', '/finance-forum'],
  ['Finfluencers', 'Entrepreneurship', 'Financial literacy and personal finance awareness.', 'Finfluencers.webp', '/finfluencers'],
  ['Indradhanu Club', 'Cultural', 'Cultural diversity and cross-cultural campus activities.', 'INDRADHANU_CLUB.webp', '/indradhanu-club'],
  ['INIT – Cloud Club', 'Technical', 'Cloud computing learning and practical activities.', 'INIT-Cloud Club.webp', '/init-cloud-club'],
  ['Innovation Hub Club', 'Entrepreneurship', 'Student innovation, ideation and startup activities.', 'Innovation_Hub_Club.webp', '/innovation-hub-club'],
  ['Melodic', 'Cultural', 'Music, bands and live performances.', 'Melodic.webp', '/melodic'],
  ['MIT-WPU Sports', 'Sports', 'University sports teams and tournaments.', 'MIT-WPU-Sports.webp', '/mit-wpu-sports'],
  ['MIT-WPU Adventure Club', 'Sports', 'Outdoor adventure and trekking activities.', 'Adventure_sports_club.webp', '/life-wpu/adventure-club/about-adventure-club'],
  ['MIT-WPU Cultural Club', 'Cultural', 'Cultural performances and university festivals.', 'MIT-WPU_Cultural_Club.webp', '/mit-wpu-cultural-club'],
  ['National Service Scheme', 'Social', 'Community service and volunteering initiatives.', 'National_service_scheme.webp', '/national-service-scheme'],
  ['Ninox Nature', 'Environmental', 'Nature, ecology and conservation activities.', 'NINOX_NATURE.webp', '/ninox-nature'],
  ['Numerates Club', 'Technical', 'Mathematics and problem-solving activities.', 'numerates.webp', '/nummerates-club'],
  ['Rowing Club', 'Sports', 'Collegiate rowing and training activities.', 'Rowing_Club.webp', '/rowing-club'],
  ['Society of Women Engineers', 'Professional', 'Engineering mentorship and networking activities.', 'Society_of_Women_Engineers.webp', '/society-of-women-engineers'],
  ['SwasthERA – HM Club', 'Social', 'Health management and wellness awareness activities.', 'SwasthERA_HM_Club.webp', '/swasthaera'],
  ['Team DART SoMe', 'Technical', 'Student autonomous vehicle and robotics projects.', 'Team_DART_SoMe.webp', '/team-dart'],
  ['Team Prokarters', 'Technical', 'Student go-kart engineering and racing projects.', 'TEAM_PROKARTERS.webp', '/team-prokarters'],
  ['Team Skytroopers SoMe', 'Technical', 'Student aerospace and UAV projects.', 'Team_Skytroopers.webp', '/team-skytroopers'],
  ['TEDx MIT-WPU', 'Cultural', 'University TEDx events and speaker programmes.', 'TEDxMIT-WPU.webp', '/tedxmit-wpu'],
  ['Udaan Sports Club', 'Sports', 'Athletic training and inter-departmental sports activities.', 'Udaan-Sports_Club.webp', '/udaan'],
  ['UMED Social Club', 'Social', 'Community engagement and volunteering activities.', 'UMED_Social_Club.webp', '/umed-social-club'],
  ['Unnati Research Club', 'Technical', 'Undergraduate research and academic activities.', 'Unnati-research.webp', '/unnati'],
  ['Utkarsh – The Business Club', 'Entrepreneurship', 'Business learning, case studies and simulations.', 'Utkarsh-The Business-Club.webp', '/utkarsh-the-buiness-club'],
  ['Vegapod Hyperloop', 'Technical', 'Student hyperloop technology and engineering projects.', 'Vegapod_Hyper_Loop.webp', '/vegapod-hyperloop'],
  ['Writers Web Club', 'Literary', 'Creative writing, literary activities and debates.', 'Writers_Web-Club.webp', '/writers-web'],
  ['Young Democrates Club', 'Social', 'Civic engagement, debates and discussion activities.', 'Young_Democrates.webp', '/young-democrates'],
];

export const CLUB_CATALOGUE = rawClubs.map(
  ([name, category, description, logoFile, path], index) => ({
    id: index + 1,
    name,
    description,
    category,
    logo_url: `${MITWPU_IMG}/${encodeURI(logoFile)}`,
    website: `${MITWPU_BASE}${path}`,
  })
);

export const buildSeed = () => ({
  version: 4,
  users: [],
  clubs: CLUB_CATALOGUE,
  memberships: [],
  events: [],
  registrations: [],
  attendance: [],
  notifications: [],
  credentials: {},
});

export const DEMO_ACCOUNTS = [];
export const DEMO_PASSWORD = '';