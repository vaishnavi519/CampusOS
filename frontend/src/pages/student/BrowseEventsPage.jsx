import { useMemo, useState } from 'react';

import { EventRecord } from '../../components/events/EventRecord.jsx';
import { PageHeader } from '../../components/layout/PageHeader.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Panel } from '../../components/ui/Panel.jsx';
import {
  AsyncSection,
  EmptyState,
  ListSkeleton,
} from '../../components/ui/States.jsx';
import {
  FilterSelect,
  PillFilter,
  SearchInput,
  Tabs,
} from '../../components/ui/Toolbar.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useAsync, useDebouncedValue } from '../../hooks/index.js';
import { eventService, registrationService } from '../../services/index.js';
import { REGISTRATION_STATUS, ROLES } from '../../utils/constants.js';
import { isPastDate, pluralize } from '../../utils/format.js';

const WHEN_TABS = [
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'past', label: 'Past' },
  { value: 'all', label: 'All' },
];

const SORTS = [
  { value: 'date-asc', label: 'Date — soonest first' },
  { value: 'date-desc', label: 'Date — latest first' },
  { value: 'title', label: 'Title — A to Z' },
];

export function BrowseEventsPage() {
  const { role } = useAuth();

  const [query, setQuery] = useState('');
  const [club, setClub] = useState('all');
  const [when, setWhen] = useState('upcoming');
  const [sort, setSort] = useState('date-asc');

  const debouncedQuery = useDebouncedValue(query, 180);

  const events = useAsync(() => eventService.listPublishedEvents(), []);

  // Registration state is demo-only for now; a failure here must not stop the
  // list from rendering.
  const registrations = useAsync(
    () => registrationService.listMyRegistrations().catch(() => []),
    [],
    { enabled: role === ROLES.STUDENT },
  );

  const registeredEventIds = useMemo(() => {
    const set = new Set();
    for (const row of registrations.data ?? []) {
      if (row.status !== REGISTRATION_STATUS.CANCELLED) set.add(row.event_id);
    }
    return set;
  }, [registrations.data]);

  const clubOptions = useMemo(() => {
    const found = new Map();
    for (const event of events.data ?? []) {
      if (event.club_id) found.set(String(event.club_id), event.club_name);
    }
    return [
      { value: 'all', label: 'All' },
      ...[...found.entries()]
        .sort((a, b) => a[1].localeCompare(b[1]))
        .map(([value, label]) => ({ value, label })),
    ];
  }, [events.data]);

  const counts = useMemo(() => {
    const rows = events.data ?? [];
    const past = rows.filter((event) => isPastDate(event.event_date)).length;
    return { upcoming: rows.length - past, past, all: rows.length };
  }, [events.data]);

  const visible = useMemo(() => {
    const needle = debouncedQuery.trim().toLowerCase();

    const filtered = (events.data ?? []).filter((event) => {
      if (club !== 'all' && String(event.club_id) !== club) return false;

      const past = isPastDate(event.event_date);
      if (when === 'upcoming' && past) return false;
      if (when === 'past' && !past) return false;

      if (!needle) return true;
      return [event.title, event.venue, event.club_name, event.description]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(needle));
    });

    const sorted = [...filtered];
    if (sort === 'title') {
      sorted.sort((a, b) => a.title.localeCompare(b.title));
    } else {
      sorted.sort((a, b) => {
        const compared = String(a.event_date).localeCompare(String(b.event_date));
        const byDate =
          compared !== 0
            ? compared
            : String(a.event_time).localeCompare(String(b.event_time));
        return sort === 'date-desc' ? -byDate : byDate;
      });
    }
    return sorted;
  }, [events.data, debouncedQuery, club, when, sort]);

  const filtered = Boolean(debouncedQuery.trim()) || club !== 'all';

  return (
    <>
      <PageHeader
        title="Explore events"
        description="Workshops, competitions, seminars and more."
      />

      <div style={{ marginBottom: 'var(--sp-4)' }}>
        <Tabs
          label="Filter events by date"
          value={when}
          onChange={setWhen}
          items={WHEN_TABS.map((tab) => ({ ...tab, count: counts[tab.value] }))}
        />
      </div>

      <div className="toolbar">
        <SearchInput
          className="toolbar__search"
          label="Search events"
          placeholder="Search events…"
          value={query}
          onChange={setQuery}
        />
        <FilterSelect
          label="Sort events"
          value={sort}
          onChange={setSort}
          options={SORTS}
        />
        <div className="spacer" />
        {events.data ? (
          <p className="toolbar__result-count" role="status">
            {pluralize(visible.length, 'event')}
          </p>
        ) : null}
      </div>

      <div className="toolbar toolbar--pills">
        <PillFilter
          label="Filter by club"
          value={club}
          onChange={setClub}
          options={clubOptions}
        />
      </div>

      <Panel flush>
        <AsyncSection
          loading={events.loading}
          error={events.error}
          onRetry={events.refetch}
          skeleton={<ListSkeleton rows={5} />}
          isEmpty={visible.length === 0}
          empty={
            filtered ? (
              <EmptyState
                icon="search"
                title="No events match those filters"
                description="Try a different search term, or clear the club filter."
                action={
                  <Button
                    onClick={() => {
                      setQuery('');
                      setClub('all');
                    }}
                  >
                    Clear filters
                  </Button>
                }
              />
            ) : when === 'past' ? (
              <EmptyState
                icon="calendar"
                title="No past events"
                description="Events that have already taken place will be listed here."
              />
            ) : (
              <EmptyState
                icon="calendar"
                title="Nothing published yet"
                description="Events appear here once a club has had them approved and the registrar has published them."
              />
            )
          }
        >
          <div className="record-list">
            {visible.map((event) => (
              <EventRecord
                key={event.id}
                event={event}
                to={`/app/events/${event.id}`}
                aside={
                  registeredEventIds.has(event.id) ? (
                    <Badge tone="success" glyph="check">
                      Registered
                    </Badge>
                  ) : null
                }
              />
            ))}
          </div>
        </AsyncSection>
      </Panel>
    </>
  );
}
