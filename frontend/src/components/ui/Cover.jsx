import { initials } from '../../utils/format.js';

const PALETTE = [
  ['#f3d9c9', '#d97b5f'],
  ['#dfeac8', '#729356'],
  ['#dfe6ff', '#5c72d8'],
  ['#f6dfc8', '#b87942'],
  ['#d9ebf1', '#4d7f96'],
  ['#f1dfe8', '#9b5d8a'],
];

function hashString(value) {
  return [...String(value ?? '')].reduce(
    (total, char) => total + char.charCodeAt(0),
    0,
  );
}

export function Cover({ name, className }) {
  const palette = PALETTE[hashString(name) % PALETTE.length];
  const [from, to] = palette;

  return (
    <span
      className={['cover', className].filter(Boolean).join(' ')}
      aria-hidden="true"
      style={{
        background: `linear-gradient(135deg, ${from} 0%, ${to} 100%)`,
      }}
    >
      {initials(name)}
    </span>
  );
}
