import { Button } from './Button.jsx';
import { Icon } from './Icon.jsx';
import { NotImplementedError } from '../../services/errors.js';

/* -- Alert --------------------------------------------------------------- */

const ALERT_ICONS = {
  neutral: 'info',
  info: 'info',
  success: 'check-circle',
  warning: 'alert-triangle',
  danger: 'alert-circle',
};

export function Alert({ tone = 'neutral', title, children, action, className }) {
  return (
    <div
      className={[
        'alert',
        tone !== 'neutral' ? `alert--${tone}` : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      role={tone === 'danger' ? 'alert' : 'status'}
    >
      <Icon name={ALERT_ICONS[tone] ?? 'info'} size={16} className="alert__icon" />
      <div className="alert__body spacer">
        {title ? <p className="alert__title">{title}</p> : null}
        {children ? <div>{children}</div> : null}
      </div>
      {action ? <div style={{ flex: 'none' }}>{action}</div> : null}
    </div>
  );
}

/* -- Empty --------------------------------------------------------------- */

export function EmptyState({
  icon = 'inbox',
  title,
  description,
  action,
  className,
}) {
  return (
    <div className={['state', className].filter(Boolean).join(' ')}>
      <Icon name={icon} size={24} className="text-muted" />
      <p className="state__title">{title}</p>
      {description ? <p className="state__desc">{description}</p> : null}
      {action ? <div className="state__actions">{action}</div> : null}
    </div>
  );
}

/* -- Error --------------------------------------------------------------- */

/**
 * Renders a failure the user can understand and, where sensible, retry.
 * A NotImplementedError is shown as a backend gap, not as a malfunction.
 */
export function ErrorState({ error, onRetry, className }) {
  if (error instanceof NotImplementedError) {
    return <PendingBackendNotice error={error} className={className} />;
  }

  const retryable = error?.isRetryable ?? true;

  return (
    <div className={['state', className].filter(Boolean).join(' ')}>
      <Icon name="alert-circle" size={24} className="text-muted" />
      <p className="state__title">
        {error?.isForbidden
          ? 'You do not have access to this'
          : error?.isNotFound
            ? 'Not found'
            : 'Unable to load this page'}
      </p>
      <p className="state__desc">
        {error?.message ?? 'Something went wrong. Please try again.'}
      </p>
      {onRetry && retryable ? (
        <div className="state__actions">
          <Button icon="refresh" onClick={onRetry}>
            Try again
          </Button>
        </div>
      ) : null}
    </div>
  );
}

/** Shown wherever a screen depends on an endpoint the backend has not built. */
export function PendingBackendNotice({ error, className }) {
  return (
    <div className={['state', className].filter(Boolean).join(' ')}>
      <Icon name="database" size={24} className="text-muted" />
      <p className="state__title">
        {error?.feature ?? 'This feature'} is not available yet
      </p>
      <p className="state__desc">
        {error?.note ??
          'This feature is not available yet.'}
      </p>
    </div>
  );
}

/* -- Loading ------------------------------------------------------------- */

export function Skeleton({ width = '100%', height = 14, className, style }) {
  return (
    <span
      className={['skeleton', className].filter(Boolean).join(' ')}
      style={{ display: 'block', width, height, ...style }}
    />
  );
}

/** Row-shaped placeholder matching the record list layout. */
export function ListSkeleton({ rows = 4 }) {
  return (
    <div aria-hidden="true">
      {Array.from({ length: rows }, (_, index) => (
        <div
          key={index}
          style={{
            display: 'flex',
            gap: 16,
            padding: 16,
            borderBottom: '1px solid var(--c-border)',
          }}
        >
          <Skeleton width={46} height={44} />
          <div style={{ flex: 1, display: 'grid', gap: 8 }}>
            <Skeleton width={`${52 + ((index * 11) % 28)}%`} height={15} />
            <Skeleton width={`${34 + ((index * 7) % 22)}%`} height={12} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton({ count = 6 }) {
  return (
    <div className="club-grid" aria-hidden="true">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="club-card">
          <div className="club-card__head">
            <Skeleton width={34} height={34} />
            <div style={{ flex: 1, display: 'grid', gap: 7 }}>
              <Skeleton width="70%" height={15} />
              <Skeleton width="40%" height={11} />
            </div>
          </div>
          <div style={{ display: 'grid', gap: 7 }}>
            <Skeleton height={11} />
            <Skeleton width="85%" height={11} />
          </div>
          <Skeleton width={96} height={28} />
        </div>
      ))}
    </div>
  );
}

/**
 * The standard loading → error → empty → content sequence.
 * Pages describe each state once instead of re-implementing the branching.
 */
export function AsyncSection({
  loading,
  error,
  onRetry,
  isEmpty = false,
  skeleton,
  empty,
  children,
}) {
  if (loading) {
    return skeleton ?? <ListSkeleton />;
  }
  if (error) {
    return <ErrorState error={error} onRetry={onRetry} />;
  }
  if (isEmpty) {
    return empty ?? <EmptyState title="Nothing here yet" />;
  }
  return children;
}
