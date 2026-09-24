import { Brand } from './Brand.jsx';

const FLOW = [
  {
    title: 'Clubs publish an event',
    detail: 'A club administrator drafts it and submits it for review.',
  },
  {
    title: 'Faculty approves it',
    detail: 'The coordinator checks the date, venue and eligibility.',
  },
  {
    title: 'The registrar publishes it',
    detail: 'Only then does it appear to students for registration.',
  },
];

/**
 * Two-pane auth frame matching the reference composition: a form panel and a
 * large campus image panel with overlaid copy.
 */
export function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="auth">
      <section className="auth__panel">
        <div className="auth__panel-inner">
          <Brand to="/" className="auth__brand" />
          <h2 className="auth__title">{title}</h2>
          <p className="auth__subtitle">{subtitle}</p>
          {children}
          {footer ? <p className="auth__switch">{footer}</p> : null}
        </div>
      </section>

      <aside className="auth__visual" aria-label="Campus feature imagery">
        <div className="auth__visual-tag">Campus network</div>

        <div className="auth__visual-copy">
          <h3>A more connected campus.</h3>
          <p>
            Empowering student communities, collaborative spaces, and university
            life across departments.
          </p>
        </div>
      </aside>
    </div>
  );
}
