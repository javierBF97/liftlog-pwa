import { useState, useSyncExternalStore } from 'react';
import { subscribe, getLang } from './lib/i18n';
import BottomNav from './components/BottomNav';
import ExercisesPage from './pages/ExercisesPage';
import CalculatorsPage from './pages/CalculatorsPage';

export default function App() {
  const [tab, setTab] = useState('exercises');
  // Remount the tree when the language changes so every t() re-evaluates.
  const lang = useSyncExternalStore(subscribe, getLang);
  return (
    <div className="app" key={lang}>
      <main className="content">
        {tab === 'exercises' && <ExercisesPage />}
        {tab === 'calc' && <CalculatorsPage />}
      </main>
      <BottomNav active={tab} onChange={setTab} />
    </div>
  );
}
