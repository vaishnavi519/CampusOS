import { useMemo, useState } from 'react';

import { ClubCard } from '../../components/clubs/ClubCard.jsx';
import { PageHeader } from '../../components/layout/PageHeader.jsx';
import { Button } from '../../components/ui/Button.jsx';
import {
  AsyncSection,
  CardSkeleton,
  EmptyState,
} from '../../components/ui/States.jsx';
import { PillFilter, SearchInput } from '../../components/ui/Toolbar.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { useAsync, useDebouncedValue } from '../../hooks/index.js';
import { clubService } from '../../services/index.js';
import { NotImplementedError } from '../../services/errors.js';
import { ROLES } from '../../utils/constants.js';
import { pluralize } from '../../utils/format.js';

export function BrowseClubsPage() {
  const { role } = useAuth();
  const toast = useToast();

  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [joining, setJoining] = useState(null);

  const debouncedQuery = useDebouncedValue(query, 180);

  const clubs = useAsync(() => clubService.listClubs(), []);

  // Memberships decide what the join control says. Students only.
  const memberships = useAsync(
    () => clubService.listMyMemberships().catch(() => []),
    [],
    { enabled: role === ROLES.STUDENT },
  );

  const membershipByClub = useMemo(() => {
    const map = new Map();
    for (const row of memberships.data ?? []) map.set(row.club_id, row.status);
    return map;
  }, [memberships.data]);

  const categories = useMemo(() => {
    const found = new Set(
      (clubs.data ?? []).map((club) => club.category).filter(Boolean),
    );
    return [
      { value: 'all', label: 'All' },
      ...[...found].sort().map((value) => ({ value, label: value })),
    ];
  }, [clubs.data]);

  const visible = useMemo(() => {
    const needle = debouncedQuery.trim().toLowerCase();
    return (clubs.data ?? []).filter((club) => {
      if (category !== 'all' && club.category !== category) return false;
      if (!needle) return true;
      return (
        club.name.toLowerCase().includes(needle) ||
        (club.description ?? '').toLowerCase().includes(needle) ||
        (club.category ?? '').toLowerCase().includes(needle)
      );
    });
  }, [clubs.data, debouncedQuery, category]);

  const handleJoin = async (club) => {
    setJoining(club.id);
    try {
      await clubService.joinClub(club.id);
      toast.success(`Request sent to ${club.name}.`);
      await memberships.refetch();
    } catch (error) {
      if (error instanceof NotImplementedError) toast.error(error.message);
      else if (error.status === 409) {
        toast.info('You have already applied to this club.');
        await memberships.refetch();
      } else toast.error(error.message);
    } finally {
      setJoining(null);
    }
  };

  const filtered = Boolean(debouncedQuery.trim()) || category !== 'all';

  return (
    <>
      <PageHeader
        title="Discover clubs"
        description="Find communities that match your interests."
      />

      <div className="toolbar">
        <SearchInput
          className="toolbar__search"
          label="Search clubs"
          placeholder="Search clubs…"
          value={query}
          onChange={setQuery}
        />
        <div className="spacer" />
        {clubs.data ? (
          <p className="toolbar__result-count" role="status">
            {pluralize(visible.length, 'club')}
            {filtered ? ` of ${clubs.data.length}` : ''}
          </p>
        ) : null}
      </div>

      <div className="toolbar toolbar--pills">
        <PillFilter
          label="Filter by category"
          value={category}
          onChange={setCategory}
          options={categories}
        />
      </div>

      <AsyncSection
        loading={clubs.loading}
        error={clubs.error}
        onRetry={clubs.refetch}
        skeleton={<CardSkeleton count={6} />}
        isEmpty={visible.length === 0}
        empty={
          filtered ? (
            <EmptyState
              icon="search"
              title="No clubs match those filters"
              description="Try a different search term or clear the category filter."
              action={
                <Button
                  onClick={() => {
                    setQuery('');
                    setCategory('all');
                  }}
                >
                  Clear filters
                </Button>
              }
            />
          ) : (
            <EmptyState
              title="No clubs have been registered yet"
              description="Once a club administrator registers a club it will appear here."
            />
          )
        }
      >
        <div className="club-grid">
          {visible.map((club) => (
            <ClubCard
              key={club.id}
              club={club}
              to={`/app/clubs/${club.id}`}
              membershipStatus={membershipByClub.get(club.id)}
              action={
                role === ROLES.STUDENT && !membershipByClub.has(club.id) ? (
                  <Button
                    size="sm"
                    variant="secondary"
                    loading={joining === club.id}
                    onClick={() => handleJoin(club)}
                  >
                    Join club
                  </Button>
                ) : (
                  <Button size="sm" variant="ghost" to={`/app/clubs/${club.id}`}>
                    Details
                  </Button>
                )
              }
            />
          ))}
        </div>
      </AsyncSection>
    </>
  );
}
