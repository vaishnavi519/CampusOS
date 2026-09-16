import { Brand } from '../components/layout/Brand.jsx';
import { Button } from '../components/ui/Button.jsx';
import { useDocumentTitle } from '../hooks/index.js';

const ROLE_SUMMARY = [
  {
    title: 'Students',
    body: 'Find clubs worth joining, track membership requests, and register for published events.',
  },
  {
    title: 'Club administrators',
    body: 'Manage members, draft events, and send them up for faculty approval.',
  },
  {
    title: 'Faculty coordinators',
    body: 'Review what clubs propose and approve events before anyone can register.',
  },
  {
    title: 'Registrar',
    body: 'Publish approved events to the campus calendar.',
  },
];

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
          <p className="landing__eyebrow">Campus operations</p>
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

        <div className="landing__roles">
          {ROLE_SUMMARY.map((role) => (
            <section className="landing__role" key={role.title}>
              <h2>{role.title}</h2>
              <p>{role.body}</p>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
