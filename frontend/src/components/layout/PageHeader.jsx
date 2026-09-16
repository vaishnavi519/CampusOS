import { Link } from 'react-router-dom';

import { Icon } from '../ui/Icon.jsx';
import { usePublishPageMeta } from '../../context/PageMetaContext.jsx';

/**
 * Standard page heading. Also publishes the page title (and its parent, on
 * detail screens) to the top bar and the document title.
 */
export function PageHeader({ title, description, parent, actions, children }) {
  usePublishPageMeta(title, parent);

  return (
    <header className="page-head">
      <div className="page-head__text">
        {parent ? (
          <Link
            to={parent.to}
            className="row text-muted"
            style={{ fontSize: 'var(--fs-13)', marginBottom: 6 }}
          >
            <Icon name="arrow-left" size={14} />
            {parent.label}
          </Link>
        ) : null}

        <h1 className="page-head__title">{title}</h1>
        {description ? <p className="page-head__desc">{description}</p> : null}
        {children}
      </div>

      {actions ? <div className="page-head__actions">{actions}</div> : null}
    </header>
  );
}
