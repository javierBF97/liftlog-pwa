import { DEFAULT_PLATES } from '../lib/plates';

// Readable text color for a given background, by perceived luminance — so custom
// plate colors stay legible too.
function textOn(hex) {
  const h = String(hex).replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  if ([r, g, b].some(Number.isNaN)) return '#fff';
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.6 ? '#222' : '#fff';
}

export default function PlateChips({ perSide, plates = DEFAULT_PLATES }) {
  if (!perSide.length) return <span className="muted-sm">—</span>;
  const colorOf = (w) => (plates.find((p) => p.weight === w)?.color ?? '#6b7177');
  return (
    <span style={{ display: 'inline-flex', gap: 3, flexWrap: 'wrap' }}>
      {perSide.map((w, i) => {
        const c = colorOf(w);
        return (
          <span
            key={`${w}-${i}`}
            style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              minWidth: 24, height: 20, borderRadius: 5, padding: '0 5px',
              fontSize: 11, fontWeight: 600, background: c, color: textOn(c),
            }}
          >
            {String(w)}
          </span>
        );
      })}
    </span>
  );
}
