import { useState, useRef, useEffect } from 'react';
import PlateChips from './PlateChips';
import { IconEdit } from './icons';

// Standard competition plate colors + a few extras for fractional/change plates.
const PALETTE = [
  '#c0291f', '#2f5fc4', '#e8b800', '#1f9e4a', '#f5f5f5',
  '#222831', '#e8731f', '#7a3fb0', '#6b7177', '#f3e79b',
];

function hslToHex(h, s, l) {
  s /= 100; l /= 100;
  const k = (n) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const hx = (x) => Math.round(255 * x).toString(16).padStart(2, '0');
  return `#${hx(f(0))}${hx(f(8))}${hx(f(4))}`;
}

// Shade grid: one row per hue, columns from light to dark, plus a grey row.
const GRID_HUES = [0, 25, 45, 90, 140, 175, 205, 240, 280, 320];
const GRID_LIGHTS = [82, 68, 54, 44, 32, 22];
const SHADE_ROWS = [
  ...GRID_HUES.map((h) => GRID_LIGHTS.map((l) => hslToHex(h, 72, l))),
  [100, 82, 64, 46, 28, 0].map((l) => hslToHex(0, 0, l)),
];

// Compact picker: a single swatch showing the current color; clicking it opens
// a popover with the standard plate presets plus a shade grid to build any
// colour (no native colour dialog, which was too fiddly).
function ColorPicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  const norm = (value || '').toLowerCase();
  const cellBtn = (c) => (
    <button
      key={c}
      type="button"
      role="option"
      aria-label={`Color ${c}`}
      aria-selected={norm === c.toLowerCase()}
      onClick={() => { onChange(c); setOpen(false); }}
      style={{
        width: 24, height: 24, borderRadius: 6, padding: 0, cursor: 'pointer',
        background: c,
        border: norm === c.toLowerCase() ? '3px solid var(--accent)' : '1px solid var(--border)',
      }}
    />
  );

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        type="button"
        aria-label="Color del disco"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        style={{
          width: 36, height: 36, borderRadius: '50%', padding: 0, cursor: 'pointer',
          background: value, border: '1px solid var(--border)',
          boxShadow: '0 0 0 2px var(--accent-soft)',
        }}
      />
      {open && (
        <div
          role="listbox"
          aria-label="Colores"
          style={{
            position: 'absolute', zIndex: 20, top: 44, left: 0,
            display: 'flex', flexDirection: 'column', gap: 12,
            padding: 12, background: 'var(--surface)',
            border: '1px solid var(--border)', borderRadius: 12,
            boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
          }}
        >
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', maxWidth: 168 }}>
            {PALETTE.map(cellBtn)}
          </div>
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {SHADE_ROWS.map((row, i) => (
              <div key={i} style={{ display: 'flex', gap: 4 }}>
                {row.map(cellBtn)}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function PlatesManager({ plates, onAdd, onRemove, onUpdate = () => {} }) {
  const [weight, setWeight] = useState('');
  const [color, setColor] = useState(PALETTE[0]);
  const [droppable, setDroppable] = useState(true);

  const [editId, setEditId] = useState(null);
  const [eWeight, setEWeight] = useState('');
  const [eColor, setEColor] = useState(PALETTE[0]);
  const [eDroppable, setEDroppable] = useState(true);

  function add(e) {
    e.preventDefault();
    const w = parseFloat(weight);
    if (!(w > 0)) return;
    onAdd({ weight: w, color, droppable });
    setWeight('');
  }

  function startEdit(p) {
    setEditId(p.id);
    setEWeight(String(p.weight));
    setEColor(p.color);
    setEDroppable(p.droppable);
  }
  function saveEdit(e) {
    e.preventDefault();
    const w = parseFloat(eWeight);
    if (!(w > 0)) return;
    onUpdate(editId, { weight: w, color: eColor, droppable: eDroppable });
    setEditId(null);
  }

  return (
    <div className="metric" style={{ marginTop: 12 }}>
      <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 10 }}>Discos disponibles</div>
      <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 12px' }}>
        {[...plates].sort((a, b) => b.weight - a.weight).map((p) => (
          editId === p.id ? (
            <li key={p.id} style={{ padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
              <form onSubmit={saveEdit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
                  <ColorPicker value={eColor} onChange={setEColor} />
                  <label className="field" style={{ flex: 1, marginBottom: 0, minWidth: 100 }}>Peso (kg)
                    <input type="number" inputMode="decimal" value={eWeight} onChange={(e) => setEWeight(e.target.value)} autoFocus />
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--muted)' }}>
                    <input type="checkbox" checked={eDroppable} onChange={(e) => setEDroppable(e.target.checked)} /> tirable
                  </label>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn primary" type="submit">Guardar</button>
                  <button className="btn" type="button" onClick={() => setEditId(null)}>Cancelar</button>
                </div>
              </form>
            </li>
          ) : (
            <li key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0' }}>
              <PlateChips perSide={[p.weight]} plates={plates} />
              <span style={{ flex: 1 }}>{p.weight} kg {p.droppable ? '' : '· no tirable'}</span>
              <button className="act edit" aria-label="Editar disco" onClick={() => startEdit(p)}><IconEdit size={14} /></button>
              <button className="icon-btn" aria-label="Eliminar disco" onClick={() => onRemove(p.id)}>×</button>
            </li>
          )
        ))}
      </ul>

      <form onSubmit={add} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <ColorPicker value={color} onChange={setColor} />
          <label className="field" style={{ flex: 1, marginBottom: 0, minWidth: 100 }}>Peso del disco (kg)
            <input type="number" inputMode="decimal" value={weight} onChange={(e) => setWeight(e.target.value)} />
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--muted)' }}>
            <input type="checkbox" checked={droppable} onChange={(e) => setDroppable(e.target.checked)} /> tirable
          </label>
        </div>
        <button className="btn primary" type="submit" style={{ alignSelf: 'flex-start' }}>Añadir disco</button>
      </form>
    </div>
  );
}
