import { useNavigate } from 'react-router-dom';

import { PageHeader } from '../../components/layout/PageHeader.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Button } from '../../components/ui/Button.jsx';
import {
  DetailList,
  Panel,
  PanelBody,
  PanelHeader,
} from '../../components/ui/Panel.jsx';
import { Alert, AsyncSection, ListSkeleton } from '../../components/ui/States.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useDataSource } from '../../context/DataSourceContext.jsx';
import { useAsync } from '../../hooks/index.js';
import { authService } from '../../services/index.js';
import { ROLE_LABELS } from '../../utils/constants.js';
import { formatDate, initials, orPlaceholder } from '../../utils/format.js';

/**
 * Shows exactly what the backend stores about the account — id, name, email,
 * role and creation date. Nothing else is invented to fill the page.
 */
export function ProfilePage() {
  const { user, signOut } = useAuth();
  const { isDemo, useLiveApi, useDemoData, resetDemoData } = useDataSource();
  const navigate = useNavigate();

  const profile = useAsync(() => authService.getProfile(), []);
  const record = profile.data ?? user;

  const handleSignOut = () => {
    signOut();
    navigate('/login', { replace: true });
  };

  return (
    <>
      <PageHeader
        title="Profile"
        description="Your CampusOS account."
        actions={
          <Button icon="log-out" onClick={handleSignOut}>
            Sign out
          </Button>
        }
      />

      <div className="stack">
        <Panel>
          <PanelBody>
            <AsyncSection
              loading={profile.loading && !user}
              error={profile.error}
              onRetry={profile.refetch}
              skeleton={<ListSkeleton rows={2} />}
            >
              <div className="row" style={{ gap: 'var(--sp-4)', marginBottom: 'var(--sp-5)' }}>
                <span className="avatar avatar--lg" aria-hidden="true">
                  {initials(record?.name)}
                </span>
                <div style={{ minWidth: 0 }}>
                  <h2 style={{ fontSize: 'var(--fs-18)' }}>
                    {orPlaceholder(record?.name)}
                  </h2>
                  <p className="text-muted" style={{ fontSize: 'var(--fs-14)' }}>
                    {orPlaceholder(record?.email)}
                  </p>
                </div>
              </div>

              <DetailList
                items={[
                  {
                    term: 'Role',
                    value: (
                      <Badge tone="accent">
                        {ROLE_LABELS[record?.role] ?? orPlaceholder(record?.role)}
                      </Badge>
                    ),
                  },
                  {
                    term: 'Account number',
                    value: (
                      <span className="num">
                        {orPlaceholder(record?.id)}
                      </span>
                    ),
                  },
                  {
                    term: 'Member since',
                    value: record?.created_at
                      ? formatDate(record.created_at)
                      : 'Not specified',
                  },
                ]}
              />
            </AsyncSection>
          </PanelBody>
        </Panel>

        <Panel>
          <PanelHeader title="Data source" />
          <PanelBody className="stack">
            <p className="text-secondary" style={{ fontSize: 'var(--fs-14)', maxWidth: '68ch' }}>
              {isDemo
                ? 'CampusOS is reading sample data stored in this browser. Nothing you do is sent to the server.'
                : 'CampusOS is reading from the live backend. Features whose endpoints do not exist yet will say so on the screen that needs them.'}
            </p>

            <div className="row-wrap">
              {isDemo ? (
                <>
                  <Button icon="database" onClick={useLiveApi}>
                    Connect to live API
                  </Button>
                  <Button variant="ghost" icon="refresh" onClick={resetDemoData}>
                    Reset demo data
                  </Button>
                </>
              ) : (
                <Button icon="database" onClick={useDemoData}>
                  Switch to demo data
                </Button>
              )}
            </div>

            <Alert tone="neutral">
              Switching data source signs you out, because credentials are not
              shared between the demo dataset and the live server.
            </Alert>
          </PanelBody>
        </Panel>
      </div>
    </>
  );
}
