import { TYPE_IDS, EXERCISE_TYPES, labelFor } from '../lib/types';
import { t } from '../lib/i18n';

export default function TypeSelector({ value, onChange }) {
  return (
    <div className="field">{t('field.type')}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {TYPE_IDS.map((id) => (
          <button
            key={id}
            type="button"
            className={value === id ? 'chip on' : 'chip'}
            onClick={() => onChange(id)}
          >
            {EXERCISE_TYPES[id].emoji} {labelFor(id)}
          </button>
        ))}
      </div>
    </div>
  );
}
