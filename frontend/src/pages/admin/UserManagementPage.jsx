import { useMemo, useState } from 'react';

import { PageHeader } from '../../components/layout/PageHeader.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Panel } from '../../components/ui/Panel.jsx';
import {
  AsyncSection,
  EmptyState,
  ListSkeleton,
} from '../../components/ui/States.jsx';
import { FilterSelect, SearchInput } from '../../components/ui/Toolbar.jsx';
import { useAsync, useDebouncedValue } from '../../hooks/index.js';
import { userService } from '../../services/index.js';
import { ROLE_LABELS, ROLES } from '../../utils/constants.js';
import { formatDate, initials } from '../../utils/format.js';

const ROLE_OPTIONS = [
  { value: 'all', label: 'All roles' },
  ...Object.values(ROLES).map((role) => ({
    value: role,
    label: ROLE_LABELS[role],
  })),
];

/**
 * Account management.
 *
 * No endpoint for this is documented, so there is no live implementation — in
 * live mode the service raises NotImplementedError and AsyncSection renders the
 * "waiting on backend" notice. The screen is real in demo mode so the flow can
 * be shown end to end. See BACKEND_INTEGRATION.md.
 */
export function UserManagementPage() {
  const [query, setQuery] = useState('');
  const [role, setRole] = useState('all');
  const search = useDebouncedValue(query, 200);

  const users = useAsync(() => userService.listUsers(), []);

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (users.data ?? []).filter((user) => {
      if (role !== 'all' && user.role !== role) return false;
      if (!term) return true;
      return (
        user.name?.toLowerCase().includes(term) ||
        user.email?.toLowerCase().includes(term)
      );
    });
  }, [users.data, search, role]);

  const total = users.data?.length ?? 0;

  return (
    <>
      <PageHeader
        title="Accounts"
        description="Everyone with access to CampusOS, and the role each account holds."
      />

      {total > 0 ? (
        <div
          className="row-wrap"
          style={{ marginBottom: 'var(--sp-4)', gap: 'var(--sp-3)' }}
        >
          <SearchInput
            value={query}
            onChange={setQuery}
            label="Search accounts"
            placeholder="Search by name or email"
            className="spacer"
          />
          <FilterSelect
            label="Filter by role"
            value={role}
            onChange={setRole}
            options={ROLE_OPTIONS}
          />
        </div>
      ) : null}

      <Panel flush>
        <AsyncSection
          loading={users.loading}
          error={users.error}
          onRetry={users.refetch}
          skeleton={<ListSkeleton rows={5} />}
          isEmpty={visible.length === 0}
          empty={
            total === 0 ? (
              <EmptyState
                icon="users"
                title="No accounts"
                description="Accounts appear here as people register for CampusOS."
              />
            ) : (
              <EmptyState
                icon="search"
                title="No matching accounts"
                description="Try a different name, email or role filter."
              />
            )
          }
        >
          <div className="record-list">
            {visible.map((user) => (
              <div className="record" key={user.id}>
                <span className="club-monogram" aria-hidden="true">
                  {initials(user.name)}
                </span>

                <div className="record__body">
                  <p className="record__title">{user.name}</p>
                  <p className="record__meta">
                    <span>{user.email}</span>
                    <span className="record__meta-sep">
                      Joined {formatDate(user.created_at)}
                    </span>
                  </p>
                  {user.role === ROLES.STUDENT ? (
                    <p className="record__meta">
                      {user.memberships} club memberships ·{' '}
                      {user.registrations} registrations
                    </p>
                  ) : user.role === ROLES.CLUB_ADMIN ? (
                    <p className="record__meta">
                      Administers {user.clubs_administered}{' '}
                      {user.clubs_administered === 1 ? 'club' : 'clubs'}
                    </p>
                  ) : null}
                </div>

                <div className="record__aside">
                  <Badge>{ROLE_LABELS[user.role] ?? user.role}</Badge>
                </div>
              </div>
            ))}
          </div>
        </AsyncSection>
      </Panel>
    </>
  );
}
