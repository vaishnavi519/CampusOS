import { PageHeader } from '../../components/layout/PageHeader.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Icon } from '../../components/ui/Icon.jsx';
import { Panel, PanelBody, PanelHeader } from '../../components/ui/Panel.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { ROLES, ROLE_LABELS } from '../../utils/constants.js';

/**
 * Landing page for roles whose workspace has not been built yet.
 *
 * It says plainly what is coming rather than showing disabled controls, and
 * still gives access to the screens that do work for every signed-in user.
 */
const PLANNED = {
  [ROLES.CLUB_ADMIN]: [
    'Your clubs and their membership requests',
    'Create and edit events',
    'Submit an event for faculty approval',
    'See who registered for each event',
  ],
  [ROLES.FACULTY_COORDINATOR]: [
    'Events waiting for your approval',
    'Full event details before you decide',
    'Approve or return an event to the club',
  ],
  [ROLES.SYSTEM_ADMIN]: [
    'Events approved by faculty and ready to publish',
    'Publish an event to the campus calendar',
  ],
};

export function WorkspacePendingPage() {
  const { user, role } = useAuth();
  const planned = PLANNED[role] ?? [];

  return (
    <>
      <PageHeader
        title={`${ROLE_LABELS[role] ?? 'Your'} workspace`}
        description={`Signed in as ${user?.email}. This workspace is still being built.`}
      />

      <div className="stack">
        <Panel>
          <PanelHeader title="Coming to this workspace" />
          <PanelBody>
            <ul className="stack" style={{ gap: 'var(--sp-2)' }}>
              {planned.map((item) => (
                <li
                  key={item}
                  className="row"
                  style={{ alignItems: 'flex-start', gap: 'var(--sp-2)' }}
                >
                  <Icon
                    name="dot"
                    size={7}
                    className="text-muted"
                    style={{ marginTop: 9 }}
                  />
                  <span style={{ fontSize: 'var(--fs-14)' }}>{item}</span>
                </li>
              ))}
            </ul>
          </PanelBody>
        </Panel>

        <Panel>
          <PanelHeader title="Available to you now" />
          <PanelBody className="stack">
            <p
              className="text-secondary"
              style={{ fontSize: 'var(--fs-14)', maxWidth: '66ch' }}
            >
              Club and event listings are public, so you can browse them with
              your account today.
            </p>
            <div className="row-wrap">
              <Button to="/app/clubs" icon="clubs">
                Browse clubs
              </Button>
              <Button to="/app/events" icon="calendar">
                Browse events
              </Button>
              <Button to="/app/notifications" icon="bell">
                Notifications
              </Button>
            </div>
          </PanelBody>
        </Panel>
      </div>
    </>
  );
}
