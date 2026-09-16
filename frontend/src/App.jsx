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
import { StudentDashboardPage } from './pages/student/StudentDashboardPage.jsx';

import { ROLES } from './utils/constants.js';

/**
 * Routes.
 *
 * Club and event browsing, notifications and profile are open to any signed-in
 * user — the underlying endpoints are public or user-scoped. Screens that only
 * make sense for a student are behind a role guard.
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

          {/* Student-only */}
          <Route element={<RequireRole roles={[ROLES.STUDENT]} />}>
            <Route path="/app" element={<StudentDashboardPage />} />
            <Route path="/app/my-clubs" element={<MyClubsPage />} />
            <Route
              path="/app/registrations"
              element={<MyRegistrationsPage />}
            />
          </Route>
        </Route>
      </Route>

      {/* Legacy/alias paths */}
      <Route path="/dashboard" element={<Navigate to="/app" replace />} />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
