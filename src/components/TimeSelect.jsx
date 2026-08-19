import { t } from '../lib/i18n';

const MINS = Array.from({ length: 91 }, (_, i) => i); // 0..90
const SECS = Array.from({ length: 60 }, (_, i) => i); // 0..59

// Time picker as two dropdowns (minutes / seconds), no keyboard entry.
// value: "m:ss" string (or ''). onChange emits "m:ss".
export default function TimeSelect({ value, onChange }) {
  let m = 0;
  let s = 0;
  if (typeof value === 'string' && value.includes(':')) {
    const [mm, ss] = value.split(':');
    m = parseInt(mm, 10) || 0;
    s = parseInt(ss, 10) || 0;
  }
  const emit = (nm, ns) => onChange(`${nm}:${String(ns).padStart(2, '0')}`);
  const sel = { padding: '10px 8px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)', fontSize: 16 };
  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
      <select aria-label={t('time.minutes')} value={m} onChange={(e) => emit(Number(e.target.value), s)} style={sel}>
        {MINS.map((n) => <option key={n} value={n}>{n}</option>)}
      </select>
      <span style={{ color: 'var(--muted)', fontSize: 13 }}>{t('time.min')}</span>
      <select aria-label={t('time.seconds')} value={s} onChange={(e) => emit(m, Number(e.target.value))} style={sel}>
        {SECS.map((n) => <option key={n} value={n}>{String(n).padStart(2, '0')}</option>)}
      </select>
      <span style={{ color: 'var(--muted)', fontSize: 13 }}>{t('time.sec')}</span>
    </div>
  );
}
