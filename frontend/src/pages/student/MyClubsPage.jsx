import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { PageHeader } from '../../components/layout/PageHeader.jsx';
import { StatusBadge } from '../../components/ui/Badge.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Panel } from '../../components/ui/Panel.jsx';
import {
  AsyncSection,
  EmptyState,
  ListSkeleton,
} from '../../components/ui/States.jsx';
import { Tabs } from '../../components/ui/Toolbar.jsx';
import { useAsync } from '../../hooks/index.js';
import { clubService } from '../../services/index.js';
import { MEMBERSHIP_STATUS } from '../../utils/constants.js';
import { formatDate, initials, orPlaceholder } from '../../utils/format.js';

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: MEMBERSHIP_STATUS.APPROVED, label: 'Member' },
  { value: MEMBERSHIP_STATUS.PENDING, label: 'Pending' },
  { value: MEMBERSHIP_STATUS.REJECTED, label: 'Not accepted' },
];

export function MyClubsPage() {
  const [filter, setFilter] = useState('all');
  const memberships = useAsync(() => clubService.listMyMemberships(), []);

  const rows = useMemo(() => memberships.data ?? [], [memberships.data]);

  const counts = useMemo(() => {
    const tally = { all: rows.length };
    for (const row of rows) tally[row.status] = (tally[row.status] ?? 0) + 1;
    return tally;
  }, [rows]);

  const visible = useMemo(
    () => (filter === 'all' ? rows : rows.filter((row) => row.status === filter)),
    [rows, filter],
  );

  return (
    <>
      <PageHeader
        title="My clubs"
        description="Clubs you belong to, and requests still waiting on a club administrator."
        actions={
          <Button to="/app/clubs" icon="search">
            Browse clubs
          </Button>
        }
      />

      {rows.length > 0 ? (
        <div style={{ marginBottom: 'var(--sp-4)' }}>
          <Tabs
            label="Filter memberships by status"
            value={filter}
            onChange={setFilter}
            items={FILTERS.map((item) => ({
              ...item,
              count: counts[item.value] ?? 0,
            }))}
          />
        </div>
      ) : null}

      <Panel flush>
        <AsyncSection
          loading={memberships.loading}
          error={memberships.error}
          onRetry={memberships.refetch}
          skeleton={<ListSkeleton rows={3} />}
          isEmpty={visible.length === 0}
          empty={
            rows.length === 0 ? (
              <EmptyState
                icon="membership"
                title="You have not joined any clubs"
                description="Browse the clubs on campus and send a request to the ones you want to join."
                action={
                  <Button variant="primary" to="/app/clubs">
                    Browse clubs
                  </Button>
                }
              />
            ) : (
              <EmptyState
                icon="filter"
                title="Nothing with that status"
                description="Choose a different tab to see your other memberships."
              />
            )
          }
        >
          <div className="record-list">
            {visible.map((row) => (
              <Link
                key={row.membership_id}
                className="record"
                to={`/app/clubs/${row.club_id}`}
              >
                <span className="club-monogram" aria-hidden="true">
                  {initials(row.name)}
                </span>

                <div className="record__body">
                  <p className="record__title">{row.name}</p>
                  <p className="record__meta">
                    <span>{orPlaceholder(row.category)}</span>
                    <span className="record__meta-sep">
                      Requested {formatDate(row.applied_at)}
                    </span>
                    {row.reviewed_at ? (
                      <span className="record__meta-sep">
                        Reviewed {formatDate(row.reviewed_at)}
                      </span>
                    ) : null}
                  </p>
                </div>

                <div className="record__aside">
                  <StatusBadge kind="membership" status={row.status} />
                </div>
              </Link>
            ))}
          </div>
        </AsyncSection>
      </Panel>
    </>
  );
}
