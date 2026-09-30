import { useNavigate } from 'react-router-dom';

import { PageHeader } from '../../components/layout/PageHeader.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Button } from '../../components/ui/Button.jsx';
import {
  DetailList,
  Panel,
  PanelBody,
} from '../../components/ui/Panel.jsx';
import { AsyncSection, ListSkeleton } from '../../components/ui/States.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
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
        title="Your profile"
        description="Manage your CampusOS account."
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
              <div className="profile-head">
                <span className="avatar avatar--lg" aria-hidden="true">
                  {initials(record?.name)}
                </span>
                <div style={{ minWidth: 0 }}>
                  <h2 className="profile-head__name">
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

      </div>
    </>
  );
}
