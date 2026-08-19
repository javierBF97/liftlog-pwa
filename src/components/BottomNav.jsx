import { IconList, IconCalc } from './icons';
import { t } from '../lib/i18n';

const TABS = [
  { id: 'exercises', label: () => t('nav.log'), Icon: IconList },
  { id: 'calc', label: () => t('nav.calc'), Icon: IconCalc },
];

export default function BottomNav({ active, onChange }) {
  return (
    <nav className="bottom-nav">
      {TABS.map((t) => (
        <button
          key={t.id}
          className={active === t.id ? 'nav-btn active' : 'nav-btn'}
          onClick={() => onChange(t.id)}
        >
          <t.Icon size={22} />
          <span>{t.label()}</span>
        </button>
      ))}
    </nav>
  );
}
