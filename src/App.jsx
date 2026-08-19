import { useState } from 'react';
import BottomNav from './components/BottomNav';
import ExercisesPage from './pages/ExercisesPage';
import CalculatorsPage from './pages/CalculatorsPage';

export default function App() {
  const [tab, setTab] = useState('exercises');
  return (
    <div className="app">
      <main className="content">
        {tab === 'exercises' && <ExercisesPage />}
        {tab === 'calc' && <CalculatorsPage />}
      </main>
      <BottomNav active={tab} onChange={setTab} />
    </div>
  );
}
