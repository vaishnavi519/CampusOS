import { useState } from 'react';

import { generatedLogo } from '../../utils/generatedLogo.js';

const base = {
  width: '100%',
  height: '100%',
  minHeight: 80,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: '#fff',
  borderRadius: 'inherit',
  padding: '10%',
};

/**
 * Event cover art: the club's real logo when available, else an
 * auto-generated monogram mark in the app's own palette.
 */
export function Cover({ name = 'Event', logoUrl }) {
  const [failed, setFailed] = useState(false);
  const src = logoUrl && !failed ? logoUrl : generatedLogo(name);

  return (
    <div style={base} aria-label={`${name} cover`}>
      <img
        src={src}
        alt=""
        loading="lazy"
        onError={() => setFailed(true)}
        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
      />
    </div>
  );
}
