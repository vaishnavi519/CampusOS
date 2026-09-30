import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

import { ClubMark } from '../../components/clubs/ClubCard.jsx';
import { EventRecord } from '../../components/events/EventRecord.jsx';
import { PageHeader } from '../../components/layout/PageHeader.jsx';
import { StatusBadge } from '../../components/ui/Badge.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { DetailHero } from '../../components/ui/DetailHero.jsx';
import {
  DetailList,
  Panel,
  PanelBody,
  PanelHeader,
} from '../../components/ui/Panel.jsx';
import {
  Alert,
  AsyncSection,
  EmptyState,
  ListSkeleton,
} from '../../components/ui/States.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { useAsync } from '../../hooks/index.js';
import { clubService, eventService } from '../../services/index.js';
import { NotImplementedError } from '../../services/errors.js';
import { MEMBERSHIP_STATUS, ROLES } from '../../utils/constants.js';
import { formatDate, orPlaceholder } from '../../utils/format.js';
import { membershipStatus as describeMembership } from '../../utils/status.js';

export function ClubDetailsPage() {
  const { clubId } = useParams();
  const { role } = useAuth();
  const toast = useToast();
  const [joining, setJoining] = useState(false);

  const club = useAsync(() => clubService.getClub(clubId), [clubId]);

  const memberships = useAsync(
    () => clubService.listMyMemberships().catch(() => []),
    [clubId],
    { enabled: role === ROLES.STUDENT },
  );

  // Published events are public, so the club's upcoming programme can be shown
  // without any club-scoped endpoint.
  const events = useAsync(() => eventService.listPublishedEvents(), []);

  const membership = useMemo(
    () =>
      (memberships.data ?? []).find(
        (row) => String(row.club_id) === String(clubId),
      ) ?? null,
    [memberships.data, clubId],
  );

  const clubEvents = useMemo(
    () =>
      (events.data ?? []).filter(
        (event) => String(event.club_id) === String(clubId),
      ),
    [events.data, clubId],
  );

  const handleJoin = async () => {
    setJoining(true);
    try {
      await clubService.joinClub(clubId);
      toast.success('Membership request sent.');
      await memberships.refetch();
    } catch (error) {
      if (error instanceof NotImplementedError) toast.error(error.message);
      else if (error.status === 409) {
        toast.info('You have already applied to this club.');
        await memberships.refetch();
      } else toast.error(error.message);
    } finally {
      setJoining(false);
    }
  };

  if (club.loading || club.error) {
    return (
      <>
        <PageHeader
          title={club.loading ? 'Loading club' : 'Club'}
          parent={{ label: 'Browse clubs', to: '/app/clubs' }}
        />
        <Panel>
          <AsyncSection
            loading={club.loading}
            error={club.error}
            onRetry={club.refetch}
            skeleton={<ListSkeleton rows={3} />}
          />
        </Panel>
      </>
    );
  }

  const record = club.data;
  const canJoin = role === ROLES.STUDENT && !membership;

  return (
    <>
      <PageHeader
        title={record.name}
        parent={{ label: 'Back to clubs', to: '/app/clubs' }}
        titleHidden
      />

      <DetailHero
        name={record.name}
        lead={<ClubMark club={record} size="lg" />}
        meta={
          <>
            {record.category ? <span>{record.category}</span> : null}
            {record.created_at ? (
              <span className="record__meta-sep">
                Registered {formatDate(record.created_at)}
              </span>
            ) : null}
            {record.website ? (
              <a
                className="record__meta-sep"
                href={record.website}
                target="_blank"
                rel="noreferrer"
              >
                Official page ↗
              </a>
            ) : null}
          </>
        }
        action={
          canJoin ? (
            <Button variant="secondary" loading={joining} onClick={handleJoin}>
              Request to join
            </Button>
          ) : membership ? (
            <StatusBadge kind="membership" status={membership.status} />
          ) : null
        }
      />

      {membership ? (
        <Alert
          tone={
            membership.status === MEMBERSHIP_STATUS.APPROVED
              ? 'success'
              : membership.status === MEMBERSHIP_STATUS.REJECTED
                ? 'danger'
                : 'warning'
          }
          className="stack"
        >
          {describeMembership(membership.status).hint}{' '}
          {membership.status === MEMBERSHIP_STATUS.PENDING
            ? `Requested on ${formatDate(membership.applied_at)}.`
            : membership.reviewed_at
              ? `Reviewed on ${formatDate(membership.reviewed_at)}.`
              : ''}
        </Alert>
      ) : null}

      <div className="stack" style={{ marginTop: 'var(--sp-5)' }}>
        <Panel>
          <PanelHeader title="About this club" />
          <PanelBody className="stack">
            <p style={{ fontSize: 'var(--fs-14)', maxWidth: '70ch' }}>
              {record.description ?? 'No description has been added yet.'}
            </p>

            <DetailList
              items={[
                { term: 'Category', value: orPlaceholder(record.category) },
                {
                  term: 'Registered on',
                  value: formatDate(record.created_at),
                },
                {
                  term: 'Club status',
                  value: orPlaceholder(record.status),
                },
              ]}
            />
          </PanelBody>
        </Panel>

        <Panel flush>
          <PanelHeader title="Upcoming events from this club" />
          <AsyncSection
            loading={events.loading}
            error={events.error}
            onRetry={events.refetch}
            skeleton={<ListSkeleton rows={2} />}
            isEmpty={clubEvents.length === 0}
            empty={
              <EmptyState
                icon="calendar"
                title="No published events"
                description="This club has not published any events yet. Published events appear here once the registrar releases them."
              />
            }
          >
            <div className="record-list">
              {clubEvents.map((event) => (
                <EventRecord
                  key={event.id}
                  event={event}
                  to={`/app/events/${event.id}`}
                />
              ))}
            </div>
          </AsyncSection>
        </Panel>
      </div>
    </>
  );
}
