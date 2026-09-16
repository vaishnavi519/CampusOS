import { Link } from 'react-router-dom';

/** The CampusOS wordmark. The serif face is used here and nowhere functional. */
export function Brand({ to, className }) {
  const content = (
    <>
      <span className="brand__mark" aria-hidden="true">
        C
      </span>
      <span className="brand__name">
        Campus<em>OS</em>
      </span>
    </>
  );

  if (to) {
    return (
      <Link to={to} className={['brand', className].filter(Boolean).join(' ')}>
        {content}
      </Link>
    );
  }

  return (
    <span className={['brand', className].filter(Boolean).join(' ')}>
      {content}
    </span>
  );
}
