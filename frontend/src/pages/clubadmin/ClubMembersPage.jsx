import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

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
import { useToast } from '../../context/ToastContext.jsx';
import { useAsync } from '../../hooks/index.js';
import { clubService } from '../../services/index.js';
import { MEMBERSHIP_STATUS } from '../../utils/constants.js';
import { formatDate, initials } from '../../utils/format.js';

const TABS = [
  { value: MEMBERSHIP_STATUS.PENDING, label: 'Requests' },
  { value: MEMBERSHIP_STATUS.APPROVED, label: 'Members' },
  { value: MEMBERSHIP_STATUS.REJECTED, label: 'Declined' },
];

/**
 * GET /api/clubs/:id/members — the roster and the join-request queue for one
 * club. Approving or declining a request needs an endpoint that does not exist
 * yet; the buttons surface that plainly instead of failing silently.
 */
export function ClubMembersPage() {
  const { clubId } = useParams();
  const toast = useToast();

  const [tab, setTab] = useState(MEMBERSHIP_STATUS.PENDING);
  const [working, setWorking] = useState(null);

  const data = useAsync(() => clubService.listClubMembers(clubId), [clubId]);

  const members = useMemo(() => data.data?.members ?? [], [data.data]);
  const club = data.data?.club;

  const grouped = useMemo(() => {
    const result = {
      [MEMBERSHIP_STATUS.PENDING]: [],
      [MEMBERSHIP_STATUS.APPROVED]: [],
      [MEMBERSHIP_STATUS.REJECTED]: [],
    };
    for (const member of members) {
      (result[member.status] ?? result[MEMBERSHIP_STATUS.PENDING]).push(member);
    }
    return result;
  }, [members]);

  const visible = grouped[tab] ?? [];

  const review = async (member, decision) => {
    setWorking(`${member.membership_id}-${decision}`);
    try {
      await clubService.reviewMembership(member.membership_id, decision);
      toast.success(
        decision === 'approve'
          ? `${member.student_name} is now a member.`
          : `${member.student_name}'s request was declined.`,
      );
      await data.refetch();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setWorking(null);
    }
  };

  return (
    <>
      <PageHeader
        title={club?.name ? `${club.name} members` : 'Club members'}
        description="Approve or decline join requests, and see who is already a member."
        parent={{ label: 'My clubs', to: '/club-admin/clubs' }}
      />

      {members.length > 0 ? (
        <div style={{ marginBottom: 'var(--sp-4)' }}>
          <Tabs
            label="Filter members"
            value={tab}
            onChange={setTab}
            items={TABS.map((item) => ({
              ...item,
              count: grouped[item.value].length,
            }))}
          />
        </div>
      ) : null}

      <Panel flush>
        <AsyncSection
          loading={data.loading}
          error={data.error}
          onRetry={data.refetch}
          skeleton={<ListSkeleton rows={3} />}
          isEmpty={visible.length === 0}
          empty={
            members.length === 0 ? (
              <EmptyState
                icon="membership"
                title="No one has applied yet"
                description="Join requests from students will appear here for review."
              />
            ) : (
              <EmptyState
                icon="filter"
                title="Nothing in this tab"
                description="Choose another tab to see the rest of this club's members."
              />
            )
          }
        >
          <div className="record-list">
            {visible.map((member) => (
              <div className="record" key={member.membership_id}>
                <span className="club-monogram" aria-hidden="true">
                  {initials(member.student_name)}
                </span>

                <div className="record__body">
                  <p className="record__title">{member.student_name}</p>
                  <p className="record__meta">
                    <span>{member.student_email}</span>
                    <span className="record__meta-sep">
                      Applied {formatDate(member.applied_at)}
                    </span>
                    {member.reviewed_at ? (
                      <span className="record__meta-sep">
                        Reviewed {formatDate(member.reviewed_at)}
                      </span>
                    ) : null}
                  </p>
                </div>

                <div className="record__aside row-wrap">
                  <StatusBadge kind="membership" status={member.status} />
                  {member.status === MEMBERSHIP_STATUS.PENDING ? (
                    <>
                      <Button
                        size="sm"
                        variant="primary"
                        loading={working === `${member.membership_id}-approve`}
                        disabled={Boolean(working)}
                        onClick={() => review(member, 'approve')}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        loading={working === `${member.membership_id}-reject`}
                        disabled={Boolean(working)}
                        onClick={() => review(member, 'reject')}
                      >
                        Decline
                      </Button>
                    </>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </AsyncSection>
      </Panel>
    </>
  );
}
