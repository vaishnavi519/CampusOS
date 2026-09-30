function getInitials(name = '') {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join('');
}

export function Cover({ name = 'Event' }) {
  const initials = getInitials(name);

  return (
    <div
      className="event-cover"
      aria-label={`${name} cover`}
      style={{
        width: '100%',
        height: '100%',
        minHeight: 80,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background:
          'linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #ec4899 100%)',
        color: '#fff',
        fontSize: 24,
        fontWeight: 700,
        letterSpacing: 1,
        borderRadius: 'inherit',
      }}
    >
      {initials || 'EV'}
    </div>
  );
}