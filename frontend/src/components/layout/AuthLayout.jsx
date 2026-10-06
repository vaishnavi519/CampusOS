import { Brand } from './Brand.jsx';

/**
 * Two-pane authentication layout with a clean image panel.
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

          {footer ? (
            <p className="auth__switch">{footer}</p>
          ) : null}
        </div>
      </section>

      <aside
        className="auth__visual"
        aria-label="Campus imagery"
      />
    </div>
  );
}