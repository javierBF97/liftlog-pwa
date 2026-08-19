import { IconList, IconCalc } from './icons';

const TABS = [
  { id: 'exercises', label: 'Registro', Icon: IconList },
  { id: 'calc', label: 'Calculadoras', Icon: IconCalc },
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
          <span>{t.label}</span>
        </button>
      ))}
    </nav>
  );
}
