export function DetailHero({ name, lead, meta, action }) {
  return (
    <header className="detail-hero">
      {lead ? <div className="detail-hero__media">{lead}</div> : null}

      <div className="detail-hero__body">
        <h2 className="detail-hero__title">{name}</h2>
        {meta ? <div className="detail-hero__meta">{meta}</div> : null}
      </div>

      {action ? <div className="detail-hero__action">{action}</div> : null}
    </header>
  );
}
