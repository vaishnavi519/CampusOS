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
import { initials, orPlaceholder } from '../../utils/format.js';

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

                  <p
                    className="text-muted"
                    style={{ fontSize: 'var(--fs-14)' }}
                  >
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
                        {ROLE_LABELS[record?.role] ??
                          orPlaceholder(record?.role)}
                      </Badge>
                    ),
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