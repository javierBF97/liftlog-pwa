import { useState } from 'react';
import { breakdown } from '../lib/plates';
import { t } from '../lib/i18n';
import PlateChips from './PlateChips';

export default function PlateCalc({ bar, plates }) {
  const [weight, setWeight] = useState('');
  const w = parseFloat(weight);
  const result = Number.isFinite(w) ? breakdown(w, bar, plates) : null;

  return (
    <div>
      <label className="field">{t('plate.target')}
        <input type="number" inputMode="decimal" value={weight} onChange={(e) => setWeight(e.target.value)} />
      </label>
      {result && (
        <div className="metric" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 10 }}>{t('plate.perSide')}</div>
          <div style={{ marginBottom: 10 }}><PlateChips perSide={result.perSide} plates={plates} /></div>
          <div style={{ fontSize: 14, fontWeight: 600 }}>
            {result.exact ? t('plate.exact', { kg: result.loaded }) : t('plate.closest', { kg: result.loaded })}
          </div>
        </div>
      )}
    </div>
  );
}
