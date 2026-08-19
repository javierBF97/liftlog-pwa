import { useState } from 'react';
import { TYPE_FIELDS, parseEntry } from '../lib/entryForm';
import TimeSelect from './TimeSelect';

const today = () => new Date().toISOString().slice(0, 10);

export default function EntryFields({ type, initial, onChange }) {
  const [raw, setRaw] = useState(() => initial ?? ({
    date: today(),
    modality: type === 'gymnastics' ? 'unbroken' : undefined,
  }));

  function set(key, value) {
    const next = { ...raw, [key]: value };
    setRaw(next);
    onChange(parseEntry(type, next));
  }

  const fields = TYPE_FIELDS[type] ?? TYPE_FIELDS.strength;

  return (
    <>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {fields.map((f) => {
          if (f.showIf && !f.showIf(raw)) return null;
          if (f.kind === 'modality') {
            return (
              <label key={f.key} className="field" style={{ flex: 1, minWidth: 120 }}>{f.label}
                <select value={raw.modality ?? 'unbroken'} onChange={(e) => set('modality', e.target.value)}>
                  <option value="unbroken">Unbroken</option>
                  <option value="accumulated">Acumuladas</option>
                </select>
              </label>
            );
          }
          if (f.kind === 'time') {
            return (
              <div key={f.key} className="field" style={{ flex: 1, minWidth: 160 }}>
                <span>{f.label}</span>
                <TimeSelect value={raw[f.key] ?? ''} onChange={(v) => set(f.key, v)} />
              </div>
            );
          }
          return (
            <label key={f.key} className="field" style={{ flex: 1, minWidth: 90 }}>{f.label}
              <input
                type={f.kind === 'time' ? 'text' : 'number'}
                inputMode={f.kind === 'int' ? 'numeric' : 'decimal'}
                placeholder={f.kind === 'time' ? 'mm:ss' : undefined}
                value={raw[f.key] ?? ''}
                onChange={(e) => set(f.key, e.target.value)}
              />
            </label>
          );
        })}
      </div>
      <label className="field">Fecha
        <input type="date" value={raw.date} onChange={(e) => set('date', e.target.value)} />
      </label>
    </>
  );
}
