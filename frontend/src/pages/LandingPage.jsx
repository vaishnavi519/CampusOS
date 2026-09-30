import { Brand } from '../components/layout/Brand.jsx';
import { Button } from '../components/ui/Button.jsx';
import { useDocumentTitle } from '../hooks/index.js';

export function LandingPage() {
  useDocumentTitle('Campus club and event management');

  return (
    <div className="landing">
      <header className="landing__bar">
        <Brand to="/" />

        <div className="spacer" />

        <Button to="/login" variant="ghost" size="sm">
          Sign in
        </Button>

        <Button to="/register" variant="primary" size="sm">
          Create account
        </Button>
      </header>

      <main className="landing__main">
        <div className="landing__hero">
          <p className="landing__eyebrow"></p>

          <h1 className="landing__title">
            Clubs, members and events — with the approvals attached.
          </h1>

          <p className="landing__lede">
            CampusOS is where student clubs register their members and propose
            events, faculty coordinators sign them off, and the registrar
            publishes them. Everything a student sees has already been through
            that chain.
          </p>

          <div className="landing__actions">
            <Button to="/register" variant="primary" size="lg">
              Create an account
            </Button>

            <Button to="/login" size="lg">
              Sign in
            </Button>
          </div>
        </div>

        <div className="landing__image" />
      </main>
    </div>
  );
}