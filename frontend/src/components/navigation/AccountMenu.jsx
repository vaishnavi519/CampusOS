import { Link, useNavigate } from 'react-router-dom';

import { Icon } from '../ui/Icon.jsx';
import { Menu, MenuItem, MenuLabel, MenuLink, MenuSeparator } from '../ui/Menu.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { ROLE_LABELS } from '../../utils/constants.js';
import { initials } from '../../utils/format.js';

/** Identity, data-source switch and sign-out — the sidebar footer control. */
export function AccountMenu() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const handleSignOut = () => {
    signOut();
    navigate('/login', { replace: true });
  };

  return (
    <Menu
      align="end"
      trigger={(props) => (
        <button type="button" className="account" {...props}>
          <span className="avatar" aria-hidden="true">
            {initials(user.name)}
          </span>
          <span className="account__text">
            <span className="account__name">{user.name}</span>
            <span className="account__role">
              {ROLE_LABELS[user.role] ?? user.role}
            </span>
          </span>
          <Icon name="chevron-down" size={15} className="text-muted" />
        </button>
      )}
    >
      <MenuLabel>Signed in as {user.email}</MenuLabel>

      <MenuLink>
        <Link to="/app/profile">
          <Icon name="user" size={16} />
          Profile
        </Link>
      </MenuLink>

      <MenuSeparator />

      <MenuItem onClick={handleSignOut}>
        <Icon name="log-out" size={16} />
        Sign out
      </MenuItem>
    </Menu>
  );
}
