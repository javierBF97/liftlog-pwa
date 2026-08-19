import { useState } from 'react';
import { breakdown } from '../lib/plates';
import PlateChips from './PlateChips';

export default function PlateCalc({ bar, plates }) {
  const [weight, setWeight] = useState('');
  const w = parseFloat(weight);
  const result = Number.isFinite(w) ? breakdown(w, bar, plates) : null;

  return (
    <div>
      <label className="field">Peso objetivo (kg)
        <input type="number" inputMode="decimal" value={weight} onChange={(e) => setWeight(e.target.value)} />
      </label>
      {result && (
        <div className="metric" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 10 }}>Por lado</div>
          <div style={{ marginBottom: 10 }}><PlateChips perSide={result.perSide} plates={plates} /></div>
          <div style={{ fontSize: 14, fontWeight: 600 }}>
            {result.exact ? `Total ${result.loaded} kg · exacto` : `≈ ${result.loaded} kg (lo cargable más cercano)`}
          </div>
        </div>
      )}
    </div>
  );
}
