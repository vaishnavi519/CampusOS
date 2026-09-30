import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';

import { Sidebar } from '../navigation/Sidebar.jsx';
import { Icon } from '../ui/Icon.jsx';
import { useNotifications } from '../../context/NotificationContext.jsx';
import { usePageMetaValue } from '../../context/PageMetaContext.jsx';
import { useMediaQuery } from '../../hooks/index.js';

const SIDEBAR_ID = 'primary-navigation';

/** The signed-in shell: sidebar, top bar, and the routed page. */
export function AppLayout() {
  const [navOpen, setNavOpen] = useState(false);
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const location = useLocation();
  const navigate = useNavigate();
  const { unreadCount } = useNotifications();
  const { title, parent } = usePageMetaValue();

  /* Close the drawer on navigation and whenever the layout goes wide. */
  useEffect(() => setNavOpen(false), [location.pathname]);
  useEffect(() => {
    if (isDesktop) setNavOpen(false);
  }, [isDesktop]);

  /* Each route change starts at the top of the page. */
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="shell">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>

      <Sidebar
        id={SIDEBAR_ID}
        open={navOpen}
        onNavigate={() => setNavOpen(false)}
      />

      {navOpen && !isDesktop ? (
        <button
          type="button"
          className="sidebar-scrim"
          aria-label="Close navigation"
          onClick={() => setNavOpen(false)}
        />
      ) : null}

      <div className="shell__main">
        <header className="topbar">
          <button
            type="button"
            className="icon-btn nav-toggle"
            onClick={() => setNavOpen((open) => !open)}
            aria-label="Open navigation"
            aria-expanded={navOpen}
            aria-controls={SIDEBAR_ID}
          >
            <Icon name="menu" size={19} />
          </button>

          <nav className="topbar__crumbs" aria-label="Breadcrumb">
            {parent ? (
              <>
                <Link to={parent.to}>{parent.label}</Link>
                <Icon name="chevron-right" size={13} />
              </>
            ) : null}
            <span className="topbar__crumb-current">{title}</span>
          </nav>

          <div className="topbar__actions">
            <button
              type="button"
              className="icon-btn"
              onClick={() => navigate('/app/notifications')}
              aria-label={
                unreadCount > 0
                  ? `Notifications, ${unreadCount} unread`
                  : 'Notifications'
              }
            >
              <Icon name="bell" size={18} />
              {unreadCount > 0 ? <span className="icon-btn__dot" /> : null}
            </button>
          </div>
        </header>

        <main className="shell__content" id="main-content" tabIndex={-1}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
