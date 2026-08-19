import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ExercisesPage from './ExercisesPage';
import { STORAGE_KEY } from '../lib/storage';

beforeEach(() => localStorage.clear());

function seed(exercises) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, exercises }));
}
const ex = (name, entries = []) => ({
  id: name, name, createdAt: '2026-01-01T00:00:00.000Z', entries,
});

describe('Registro (ExercisesPage)', () => {
  it('adds a record via the add button and shows the e1RM pill', async () => {
    render(<ExercisesPage />);
    await userEvent.click(screen.getByRole('button', { name: /nuevo registro/i }));
    await userEvent.type(screen.getByLabelText(/ejercicio/i), 'Back Squat');
    await userEvent.type(screen.getByLabelText(/peso/i), '100');
    await userEvent.type(screen.getByLabelText(/reps/i), '5');
    await userEvent.click(screen.getByRole('button', { name: /^guardar$/i }));
    expect(screen.getByText('Back Squat')).toBeInTheDocument();
    expect(screen.getByText(/e1RM 117 kg/i)).toBeInTheDocument();
  });

  it('saves into an existing exercise instead of duplicating (case-insensitive)', async () => {
    seed([ex('Back Squat', [{ id: 'e0', date: '2026-06-01', weight: 90, reps: 5 }])]);
    render(<ExercisesPage />);
    await userEvent.click(screen.getByRole('button', { name: /nuevo registro/i }));
    await userEvent.type(screen.getByLabelText(/ejercicio/i), 'back squat');
    await userEvent.type(screen.getByLabelText(/peso/i), '110');
    await userEvent.type(screen.getByLabelText(/reps/i), '3');
    await userEvent.click(screen.getByRole('button', { name: /^guardar$/i }));
    expect(screen.getAllByText(/^back squat$/i)).toHaveLength(1);
    expect(screen.getByText(/e1RM 121 kg/i)).toBeInTheDocument();
  });

  it('adds a record to an existing exercise from its own + button', async () => {
    seed([ex('Deadlift')]);
    render(<ExercisesPage />);
    expect(screen.getByText(/sin registros/i)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /añadir registro a deadlift/i }));
    await userEvent.type(screen.getByLabelText(/peso/i), '120');
    await userEvent.type(screen.getByLabelText(/reps/i), '3');
    await userEvent.click(screen.getByRole('button', { name: /guardar registro/i }));
    expect(screen.getByText(/e1RM 132 kg/i)).toBeInTheDocument();
  });

  it('shows the search bar only after tapping the search button', async () => {
    seed([ex('Back Squat'), ex('Deadlift'), ex('Front Squat')]);
    render(<ExercisesPage />);
    expect(screen.queryByPlaceholderText(/buscar/i)).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /buscar/i }));
    await userEvent.type(screen.getByPlaceholderText(/buscar/i), 'squat');
    expect(screen.getByText('Back Squat')).toBeInTheDocument();
    expect(screen.getByText('Front Squat')).toBeInTheDocument();
    expect(screen.queryByText('Deadlift')).not.toBeInTheDocument();
  });

  it('keeps the active search filter when opening a row\'s quick-add', async () => {
    seed([ex('Echo Bike'), ex('Back Squat'), ex('Deadlift')]);
    render(<ExercisesPage />);
    await userEvent.click(screen.getByRole('button', { name: /buscar/i }));
    await userEvent.type(screen.getByPlaceholderText(/buscar/i), 'echo');
    expect(screen.queryByText('Back Squat')).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /añadir registro a echo bike/i }));
    // The list must stay filtered: the other exercises do not reappear.
    expect(screen.queryByText('Back Squat')).not.toBeInTheDocument();
    expect(screen.queryByText('Deadlift')).not.toBeInTheDocument();
    expect(screen.getByText('Echo Bike')).toBeInTheDocument();
  });

  it('reveals import/export under the settings gear', async () => {
    render(<ExercisesPage />);
    expect(screen.queryByRole('button', { name: /exportar/i })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /ajustes/i }));
    expect(screen.getByRole('button', { name: /exportar/i })).toBeInTheDocument();
  });

  it('collapses an open per-exercise form when the general add is opened', async () => {
    seed([ex('Deadlift')]);
    render(<ExercisesPage />);
    await userEvent.click(screen.getByRole('button', { name: /añadir registro a deadlift/i }));
    expect(screen.getAllByLabelText(/peso/i)).toHaveLength(1);
    await userEvent.click(screen.getByRole('button', { name: /nuevo registro/i }));
    expect(screen.getAllByLabelText(/peso/i)).toHaveLength(1);
  });

  it('lists exercises with the most recent record first', () => {
    seed([
      ex('Old', [{ id: 'o', date: '2026-05-01', weight: 50, reps: 5 }]),
      ex('New', [{ id: 'n', date: '2026-06-15', weight: 50, reps: 5 }]),
    ]);
    render(<ExercisesPage />);
    const html = document.body.textContent;
    expect(html.indexOf('New')).toBeLessThan(html.indexOf('Old'));
  });

  it('creates a carry exercise and shows its máx pill', async () => {
    render(<ExercisesPage />);
    await userEvent.click(screen.getByRole('button', { name: /nuevo registro/i }));
    await userEvent.type(screen.getByLabelText(/ejercicio/i), 'Yoke');
    await userEvent.click(screen.getByRole('button', { name: /^🛷 carry$/i }));
    await userEvent.type(screen.getByLabelText(/peso/i), '100');
    await userEvent.type(screen.getByLabelText(/distancia/i), '20');
    await userEvent.click(screen.getByRole('button', { name: /^guardar$/i }));
    expect(screen.getByText('Yoke')).toBeInTheDocument();
    expect(screen.getByText(/máx 100 kg/i)).toBeInTheDocument();
  });
});
