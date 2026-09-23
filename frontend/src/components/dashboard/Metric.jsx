/**
 * One figure on a dashboard.
 *
 * `unavailable` renders an em dash rather than a zero — a number the backend
 * could not supply must never be shown as a real count of nothing.
 */
export function Metric({ value, label, loading, unavailable, hint }) {
  const missing = value === undefined || value === null;

  return (
    <div className="metric">
      <p className="metric__value">
        {loading ? (
          <span
            className="skeleton"
            style={{ display: 'block', width: 38, height: 26 }}
          />
        ) : unavailable || missing ? (
          <span className="text-muted" style={{ fontSize: 'var(--fs-18)' }}>
            —
          </span>
        ) : (
          value
        )}
      </p>
      <p className="metric__label">{label}</p>
      {hint ? <p className="metric__hint">{hint}</p> : null}
    </div>
  );
}

/** Row of metrics. Wraps on narrow screens via the shared .metric-row grid. */
export function MetricRow({ children }) {
  return <div className="metric-row">{children}</div>;
}
