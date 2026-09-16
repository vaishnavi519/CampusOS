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
 * Two-pane frame for sign-in and registration. The left pane explains the
 * approval chain, which is the part of CampusOS people most often get wrong.
 * It is hidden below 900px rather than stacked, so the form stays above the fold.
 */
export function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="auth">
      <section className="auth__aside">
        <Brand />

        <div className="auth__aside-body">
          <h1 className="auth__headline">
            Every club, every event, one approval trail.
          </h1>
          <p className="auth__lede">
            CampusOS keeps club membership and event scheduling in one place, so
            students see what is actually happening and staff can see who
            approved it.
          </p>

          <ol className="auth__flow">
            {FLOW.map((step, index) => (
              <li className="auth__flow-step" key={step.title}>
                <span className="auth__flow-index" aria-hidden="true">
                  {index + 1}
                </span>
                <span>
                  <strong>{step.title}</strong> — {step.detail}
                </span>
              </li>
            ))}
          </ol>
        </div>

        <p className="auth__foot">
          Campus club and event management · Academic project build
        </p>
      </section>

      <section className="auth__panel">
        <div className="auth__panel-inner">
          <Brand to="/" />
          <h2 className="auth__title">{title}</h2>
          <p className="auth__subtitle">{subtitle}</p>
          {children}
          {footer ? <p className="auth__switch">{footer}</p> : null}
        </div>
      </section>
    </div>
  );
}
