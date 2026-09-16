import { NavLink } from 'react-router-dom';

import { Brand } from '../layout/Brand.jsx';
import { Icon } from '../ui/Icon.jsx';
import { AccountMenu } from './AccountMenu.jsx';
import { navigationFor } from './navConfig.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useNotifications } from '../../context/NotificationContext.jsx';

export function Sidebar({ open, onNavigate, id }) {
  const { role } = useAuth();
  const { unreadCount } = useNotifications();
  const sections = navigationFor(role);

  return (
    <aside
      id={id}
      className={['shell__sidebar', open ? 'is-open' : ''].filter(Boolean).join(' ')}
      aria-label="Primary"
    >
      <div className="sidebar__head">
        <Brand to="/app" />
      </div>

      <nav className="sidebar__nav">
        {sections.map((section, index) => (
          <div className="sidebar__section" key={section.label ?? `section-${index}`}>
            {section.label ? (
              <p className="sidebar__section-label">{section.label}</p>
            ) : null}

            {section.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={onNavigate}
                className={({ isActive }) =>
                  ['nav-link', isActive ? 'is-active' : ''].filter(Boolean).join(' ')
                }
              >
                <Icon name={item.icon} size={17} className="nav-link__icon" />
                <span>{item.label}</span>

                {item.badge === 'unread' && unreadCount > 0 ? (
                  <span className="count-pill nav-link__badge">
                    {unreadCount > 99 ? '99+' : unreadCount}
                    <span className="visually-hidden"> unread</span>
                  </span>
                ) : null}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar__foot">
        <AccountMenu />
      </div>
    </aside>
  );
}
