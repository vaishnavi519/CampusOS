export function DetailHero({
  title,
  subtitle,
  meta,
  image,
  children,
}) {
  return (
    <section className="detail-hero">
      {image ? (
        <div className="detail-hero__image">
          <img src={image} alt="" />
        </div>
      ) : null}

      <div className="detail-hero__content">
        {subtitle ? (
          <p className="detail-hero__subtitle">{subtitle}</p>
        ) : null}

        <h1 className="detail-hero__title">{title}</h1>

        {meta ? (
          <div className="detail-hero__meta">{meta}</div>
        ) : null}

        {children ? (
          <div className="detail-hero__actions">{children}</div>
        ) : null}
      </div>
    </section>
  );
}