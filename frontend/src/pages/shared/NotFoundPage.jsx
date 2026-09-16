import { Brand } from '../../components/layout/Brand.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useDocumentTitle } from '../../hooks/index.js';
import { ROLE_HOME } from '../../utils/constants.js';

export function NotFoundPage() {
  const { isAuthenticated, role } = useAuth();
  useDocumentTitle('Page not found');

  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'grid',
        placeItems: 'center',
        padding: 'var(--sp-6)',
      }}
    >
      <div style={{ textAlign: 'center', maxWidth: '44ch' }}>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Brand />
        </div>

        <h1 style={{ marginTop: 'var(--sp-6)', fontSize: 'var(--fs-20)' }}>
          We could not find that page
        </h1>
        <p
          className="text-muted"
          style={{ marginTop: 6, fontSize: 'var(--fs-14)' }}
        >
          The link may be out of date, or the page may have moved.
        </p>

        <div
          className="row"
          style={{ justifyContent: 'center', marginTop: 'var(--sp-5)' }}
        >
          <Button
            variant="primary"
            to={isAuthenticated ? (ROLE_HOME[role] ?? '/app') : '/'}
          >
            {isAuthenticated ? 'Back to your dashboard' : 'Back to the homepage'}
          </Button>
        </div>
      </div>
    </div>
  );
}
