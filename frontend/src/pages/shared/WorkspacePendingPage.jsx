import { PageHeader } from '../../components/layout/PageHeader.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Panel, PanelBody, PanelHeader } from '../../components/ui/Panel.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { ROLE_HOME, ROLE_LABELS } from '../../utils/constants.js';

/**
 * Fallback for a signed-in user whose role has no workspace of its own.
 *
 * Every role CampusOS defines now has one (see ROLE_HOME), so this is reached
 * only if the backend returns a role the frontend does not know about. It says
 * so plainly and still offers the screens that work for any signed-in user,
 * rather than dropping someone into a workspace meant for a different role.
 */
export function WorkspacePendingPage() {
  const { user, role } = useAuth();
  const home = ROLE_HOME[role];

  return (
    <>
      <PageHeader
        title={`${ROLE_LABELS[role] ?? 'Your'} workspace`}
        description={`Signed in as ${user?.email ?? 'your account'}.`}
      />

      <div className="stack">
        {home ? (
          <Panel>
            <PanelHeader title="Your workspace has moved" />
            <PanelBody className="stack">
              <p style={{ fontSize: 'var(--fs-14)', maxWidth: '66ch' }}>
                Everything for your role now lives on its own dashboard.
              </p>
              <div>
                <Button variant="primary" to={home}>
                  Go to my dashboard
                </Button>
              </div>
            </PanelBody>
          </Panel>
        ) : (
          <Panel>
            <PanelHeader title="No workspace for this role" />
            <PanelBody>
              <p
                className="text-secondary"
                style={{ fontSize: 'var(--fs-14)', maxWidth: '66ch' }}
              >
                Your account has the role{' '}
                <strong>{role ?? 'unknown'}</strong>, which this version of
                CampusOS does not have a workspace for. The shared screens below
                still work.
              </p>
            </PanelBody>
          </Panel>
        )}

        <Panel>
          <PanelHeader title="Shared campus access" />
          <PanelBody className="stack">
            <p
              className="text-secondary"
              style={{ fontSize: 'var(--fs-14)', maxWidth: '66ch' }}
            >
              Club and event listings are open to every signed-in account.
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
              <Button to="/app/profile" icon="user">
                Profile
              </Button>
            </div>
          </PanelBody>
        </Panel>
      </div>
    </>
  );
}
