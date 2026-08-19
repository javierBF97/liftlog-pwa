import { useState } from 'react';
import { estimate1RM } from '../lib/oneRm';
import { loadBar, saveBar, addPlate, removePlate, updatePlate, loadState, saveState } from '../lib/storage';
import PercentTable from '../components/PercentTable';
import RmTable from '../components/RmTable';
import PlateCalc from '../components/PlateCalc';
import PlatesManager from '../components/PlatesManager';

function BarSelector({ bar, onBar }) {
  const [custom, setCustom] = useState('');
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '12px 0', fontSize: 13, color: 'var(--muted)', flexWrap: 'wrap' }}>
      Barra:
      <button className={bar === 20 ? 'chip on' : 'chip'} onClick={() => onBar(20)}>20</button>
      <button className={bar === 15 ? 'chip on' : 'chip'} onClick={() => onBar(15)}>15</button>
      <input type="number" inputMode="decimal" placeholder="a medida" value={custom}
        onChange={(e) => { setCustom(e.target.value); const n = parseFloat(e.target.value); if (n > 0) onBar(n); }}
        style={{ width: 90 }} />
    </div>
  );
}

export default function CalculatorsPage() {
  const [mode, setMode] = useState('pct'); // 'pct' | 'rm' | 'plates'
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const [oneRm, setOneRm] = useState(null);
  const [showPlates, setShowPlates] = useState(false);
  const [bar, setBar] = useState(loadBar());
  // Owns the plate set (read fresh on mount, so it reflects imports). Persists
  // changes by merging into the stored state.
  const [plates, setPlates] = useState(() => loadState().plates);

  function persistPlates(next) {
    setPlates(next);
    saveState({ ...loadState(), plates: next });
  }
  function setBarPersist(kg) { setBar(kg); saveBar(kg); }
  function calculate(e) {
    e.preventDefault();
    const w = parseFloat(weight); const r = parseInt(reps, 10);
    if (!(w > 0) || !(r > 0)) return;
    setOneRm(estimate1RM(w, r));
  }

  return (
    <div>
      <h1>Calculadoras</h1>
      <div style={{ display: 'flex', justifyContent: 'center', margin: '16px 0' }}>
        <div className="segmented lg">
          <button className={mode === 'pct' ? 'seg active' : 'seg'} onClick={() => setMode('pct')}>%</button>
          <button className={mode === 'rm' ? 'seg active' : 'seg'} onClick={() => setMode('rm')}>RM</button>
          <button className={mode === 'plates' ? 'seg active' : 'seg'} onClick={() => setMode('plates')}>Discos</button>
        </div>
      </div>

      {mode === 'plates' ? (
        <>
          <BarSelector bar={bar} onBar={setBarPersist} />
          <PlateCalc bar={bar} plates={plates} />
          <PlatesManager
            plates={plates}
            onAdd={(p) => persistPlates(addPlate({ plates }, p).plates)}
            onRemove={(id) => persistPlates(removePlate({ plates }, id).plates)}
            onUpdate={(id, p) => persistPlates(updatePlate({ plates }, id, p).plates)}
          />
        </>
      ) : (
        <>
          <form onSubmit={calculate}>
            <div style={{ display: 'flex', gap: 10 }}>
              <label className="field" style={{ flex: 1 }}>Peso (kg)
                <input type="number" inputMode="decimal" value={weight} onChange={(e) => { setWeight(e.target.value); setOneRm(null); }} />
              </label>
              <label className="field" style={{ flex: 1 }}>Reps
                <input type="number" inputMode="numeric" value={reps} onChange={(e) => { setReps(e.target.value); setOneRm(null); }} />
              </label>
            </div>
            <button className="btn primary block" type="submit">Calcular</button>
          </form>
          {oneRm !== null && (
            <>
              <p>1RM estimado: <strong>{Math.round(oneRm)} kg</strong></p>
              <BarSelector bar={bar} onBar={setBarPersist} />
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--muted)', marginBottom: 12 }}>
                <input type="checkbox" checked={showPlates} onChange={(e) => setShowPlates(e.target.checked)} /> Mostrar discos
              </label>
              {mode === 'pct'
                ? <PercentTable oneRm={oneRm} showPlates={showPlates} bar={bar} plates={plates} />
                : <RmTable oneRm={oneRm} showPlates={showPlates} bar={bar} plates={plates} />}
            </>
          )}
        </>
      )}
    </div>
  );
}
