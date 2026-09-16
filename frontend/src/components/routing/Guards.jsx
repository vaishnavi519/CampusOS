import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { Spinner } from '../ui/Spinner.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { ROLE_HOME } from '../../utils/constants.js';

/**
 * Route guards.
 *
 * These are a UX affordance, not a security boundary — the backend remains the
 * authority on what a role may do. They keep users out of screens that would
 * only 403 on them, and preserve the destination across a sign-in.
 */

function FullPageSpinner({ label }) {
  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'grid',
        placeItems: 'center',
        color: 'var(--c-text-muted)',
      }}
    >
      <Spinner size={22} label={label} />
    </div>
  );
}

/** Requires a signed-in user. */
export function RequireAuth() {
  const { isAuthenticated, isChecking } = useAuth();
  const location = useLocation();

  if (isChecking) return <FullPageSpinner label="Restoring your session" />;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

/** Requires one of `roles`; anyone else is sent to their own home. */
export function RequireRole({ roles }) {
  const { isAuthenticated, isChecking, role } = useAuth();
  const location = useLocation();

  if (isChecking) return <FullPageSpinner label="Restoring your session" />;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!roles.includes(role)) {
    return <Navigate to={ROLE_HOME[role] ?? '/workspace'} replace />;
  }

  return <Outlet />;
}

/** Keeps signed-in users away from the sign-in and registration screens. */
export function RedirectIfAuthenticated({ children }) {
  const { isAuthenticated, isChecking, role } = useAuth();

  if (isChecking) return <FullPageSpinner label="Restoring your session" />;
  if (isAuthenticated) {
    return <Navigate to={ROLE_HOME[role] ?? '/workspace'} replace />;
  }

  return children;
}
