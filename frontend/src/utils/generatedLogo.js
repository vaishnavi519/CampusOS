/**
 * Deterministic placeholder logo for a club/event with no real artwork.
 * Same name always produces the same mark, in the app's own palette rather
 * than an arbitrary color, so it reads as part of the brand rather than a
 * stand-in.
 */

const PALETTE = [
  '#8b4938', // accent (brick)
  '#262624', // ink
  '#2e6a40', // success
  '#86560f', // warning
  '#4a5a6b', // slate (identity-adjacent, not a status color)
];

function hash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i += 1) {
    h = (h * 31 + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function initialsOf(name = '') {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join('') || '?';
}

/** SVG data URI: rounded square, brand-palette fill, centered monogram. */
export function generatedLogo(name) {
  const h = hash(name);
  const fill = PALETTE[h % PALETTE.length];
  const mark = initialsOf(name);
  const fontSize = mark.length > 1 ? 34 : 40;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96">
    <rect width="96" height="96" rx="20" fill="${fill}"/>
    <text x="48" y="48" text-anchor="middle" dominant-baseline="central"
      font-family="'IBM Plex Sans', 'Segoe UI', sans-serif" font-weight="700"
      font-size="${fontSize}" fill="#faf9f7">${mark}</text>
  </svg>`;

  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
