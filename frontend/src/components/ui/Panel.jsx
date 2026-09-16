import { Link } from 'react-router-dom';

/** Bordered surface used for grouped content. Not every section needs one. */
export function Panel({ children, className, flush = false, ...rest }) {
  return (
    <section
      className={['panel', flush ? 'panel--flush' : '', className]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {children}
    </section>
  );
}

export function PanelHeader({ title, action, children }) {
  return (
    <header className="panel__header">
      {title ? <h2 className="panel__title">{title}</h2> : null}
      {children}
      {action ? <div style={{ marginLeft: 'auto' }}>{action}</div> : null}
    </header>
  );
}

export function PanelBody({ children, className }) {
  return (
    <div className={['panel__body', className].filter(Boolean).join(' ')}>
      {children}
    </div>
  );
}

export function PanelFooter({ children }) {
  return <footer className="panel__footer">{children}</footer>;
}

/** Section heading with an optional "see all" link. Lighter than a Panel. */
export function SectionHeader({ title, to, linkLabel = 'View all', children }) {
  return (
    <header className="section-head">
      <h2 className="section-head__title">{title}</h2>
      {children}
      {to ? (
        <Link className="section-head__link" to={to}>
          {linkLabel}
        </Link>
      ) : null}
    </header>
  );
}

/** Label/value pairs shared by every detail screen. */
export function DetailList({ items }) {
  return (
    <dl className="detail-list">
      {items.map((item) => (
        <div key={item.term}>
          <dt className="detail-list__term">{item.term}</dt>
          <dd className="detail-list__value">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
