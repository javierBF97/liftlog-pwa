import { TYPE_IDS, EXERCISE_TYPES } from '../lib/types';

export default function TypeSelector({ value, onChange }) {
  return (
    <div className="field">Tipo
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {TYPE_IDS.map((id) => (
          <button
            key={id}
            type="button"
            className={value === id ? 'chip on' : 'chip'}
            onClick={() => onChange(id)}
          >
            {EXERCISE_TYPES[id].emoji} {EXERCISE_TYPES[id].label}
          </button>
        ))}
      </div>
    </div>
  );
}
