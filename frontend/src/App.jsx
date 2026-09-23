import { Navigate, Route, Routes } from 'react-router-dom';

import { AppLayout } from './components/layout/AppLayout.jsx';
import {
  RedirectIfAuthenticated,
  RequireAuth,
  RequireRole,
} from './components/routing/Guards.jsx';

import { LandingPage } from './pages/LandingPage.jsx';
import { LoginPage } from './pages/auth/LoginPage.jsx';
import { RegisterPage } from './pages/auth/RegisterPage.jsx';

import { NotFoundPage } from './pages/shared/NotFoundPage.jsx';
import { NotificationsPage } from './pages/shared/NotificationsPage.jsx';
import { ProfilePage } from './pages/shared/ProfilePage.jsx';
import { WorkspacePendingPage } from './pages/shared/WorkspacePendingPage.jsx';

import { BrowseClubsPage } from './pages/student/BrowseClubsPage.jsx';
import { BrowseEventsPage } from './pages/student/BrowseEventsPage.jsx';
import { ClubDetailsPage } from './pages/student/ClubDetailsPage.jsx';
import { EventDetailsPage } from './pages/student/EventDetailsPage.jsx';
import { MyClubsPage } from './pages/student/MyClubsPage.jsx';
import { MyRegistrationsPage } from './pages/student/MyRegistrationsPage.jsx';
import { ParticipationPage } from './pages/student/ParticipationPage.jsx';
import { RecommendationsPage } from './pages/student/RecommendationsPage.jsx';
import { StudentDashboardPage } from './pages/student/StudentDashboardPage.jsx';

import { ClubAdminDashboardPage } from './pages/clubadmin/ClubAdminDashboardPage.jsx';
import { ClubMembersPage } from './pages/clubadmin/ClubMembersPage.jsx';
import { EventRegistrationsPage } from './pages/clubadmin/EventRegistrationsPage.jsx';
import { ManageClubsPage } from './pages/clubadmin/ManageClubsPage.jsx';
import { ManageEventsPage } from './pages/clubadmin/ManageEventsPage.jsx';

import { FacultyDashboardPage } from './pages/faculty/FacultyDashboardPage.jsx';
import { PendingEventDetailsPage } from './pages/faculty/PendingEventDetailsPage.jsx';
import { PendingEventsPage } from './pages/faculty/PendingEventsPage.jsx';

import { AdminDashboardPage } from './pages/admin/AdminDashboardPage.jsx';
import { ApprovedEventsPage } from './pages/admin/ApprovedEventsPage.jsx';
import { PlatformStatsPage } from './pages/admin/PlatformStatsPage.jsx';
import { UserManagementPage } from './pages/admin/UserManagementPage.jsx';

import { ROLES } from './utils/constants.js';

/**
 * Routes.
 *
 * Club and event browsing, notifications and profile are open to any signed-in
 * user — the underlying endpoints are public or user-scoped. Everything else
 * sits under the route prefix its role owns, matching ROLE_HOME.
 */
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />

      <Route
        path="/login"
        element={
          <RedirectIfAuthenticated>
            <LoginPage />
          </RedirectIfAuthenticated>
        }
      />
      <Route
        path="/register"
        element={
          <RedirectIfAuthenticated>
            <RegisterPage />
          </RedirectIfAuthenticated>
        }
      />

      <Route element={<RequireAuth />}>
        <Route element={<AppLayout />}>
          {/* Open to every signed-in role */}
          <Route path="/app/clubs" element={<BrowseClubsPage />} />
          <Route path="/app/clubs/:clubId" element={<ClubDetailsPage />} />
          <Route path="/app/events" element={<BrowseEventsPage />} />
          <Route path="/app/events/:eventId" element={<EventDetailsPage />} />
          <Route path="/app/notifications" element={<NotificationsPage />} />
          <Route path="/app/profile" element={<ProfilePage />} />
          <Route path="/workspace" element={<WorkspacePendingPage />} />

          {/* Student */}
          <Route element={<RequireRole roles={[ROLES.STUDENT]} />}>
            <Route path="/app" element={<StudentDashboardPage />} />
            <Route path="/app/my-clubs" element={<MyClubsPage />} />
            <Route path="/app/registrations" element={<MyRegistrationsPage />} />
            <Route
              path="/app/recommendations"
              element={<RecommendationsPage />}
            />
            <Route path="/app/participation" element={<ParticipationPage />} />
          </Route>

          {/* Club administrator */}
          <Route element={<RequireRole roles={[ROLES.CLUB_ADMIN]} />}>
            <Route path="/club-admin" element={<ClubAdminDashboardPage />} />
            <Route path="/club-admin/clubs" element={<ManageClubsPage />} />
            <Route
              path="/club-admin/clubs/:clubId/members"
              element={<ClubMembersPage />}
            />
            <Route path="/club-admin/events" element={<ManageEventsPage />} />
            <Route
              path="/club-admin/events/:eventId/registrations"
              element={<EventRegistrationsPage />}
            />
          </Route>

          {/* Faculty coordinator */}
          <Route element={<RequireRole roles={[ROLES.FACULTY_COORDINATOR]} />}>
            <Route path="/faculty" element={<FacultyDashboardPage />} />
            <Route path="/faculty/pending" element={<PendingEventsPage />} />
            <Route
              path="/faculty/pending/:eventId"
              element={<PendingEventDetailsPage />}
            />
          </Route>

          {/* System administrator */}
          <Route element={<RequireRole roles={[ROLES.SYSTEM_ADMIN]} />}>
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/approved" element={<ApprovedEventsPage />} />
            <Route path="/admin/statistics" element={<PlatformStatsPage />} />
            <Route path="/admin/users" element={<UserManagementPage />} />
          </Route>
        </Route>
      </Route>

      {/* Legacy/alias paths */}
      <Route path="/dashboard" element={<Navigate to="/app" replace />} />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
