import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ExercisesPage from './ExercisesPage';
import { STORAGE_KEY } from '../lib/storage';
import { setLang } from '../lib/i18n';

beforeEach(() => {
  localStorage.clear();
  setLang('en');
});

function seed(exercises) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, exercises }));
}
const ex = (name, entries = []) => ({
  id: name, name, createdAt: '2026-01-01T00:00:00.000Z', entries,
});

describe('Registro (ExercisesPage)', () => {
  it('adds a record via the add button and shows the e1RM pill', async () => {
    render(<ExercisesPage />);
    await userEvent.click(screen.getByRole('button', { name: /new record/i }));
    await userEvent.type(screen.getByLabelText(/exercise/i), 'Back Squat');
    await userEvent.type(screen.getByLabelText(/weight/i), '100');
    await userEvent.type(screen.getByLabelText(/reps/i), '5');
    await userEvent.click(screen.getByRole('button', { name: /^save$/i }));
    expect(screen.getByText('Back Squat')).toBeInTheDocument();
    expect(screen.getByText(/e1RM 113 kg/i)).toBeInTheDocument();
  });

  it('saves into an existing exercise instead of duplicating (case-insensitive)', async () => {
    seed([ex('Back Squat', [{ id: 'e0', date: '2026-06-01', weight: 90, reps: 5 }])]);
    render(<ExercisesPage />);
    await userEvent.click(screen.getByRole('button', { name: /new record/i }));
    await userEvent.type(screen.getByLabelText(/exercise/i), 'back squat');
    await userEvent.type(screen.getByLabelText(/weight/i), '110');
    await userEvent.type(screen.getByLabelText(/reps/i), '3');
    await userEvent.click(screen.getByRole('button', { name: /^save$/i }));
    expect(screen.getAllByText(/^back squat$/i)).toHaveLength(1);
    expect(screen.getByText(/e1RM 116 kg/i)).toBeInTheDocument();
  });

  it('adds a record to an existing exercise from its own + button', async () => {
    seed([ex('Deadlift')]);
    render(<ExercisesPage />);
    // Deadlift has no records yet, so it only shows up once search is open.
    await userEvent.click(screen.getByRole('button', { name: /search/i }));
    expect(screen.getByText(/no records/i)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /add record to deadlift/i }));
    await userEvent.type(screen.getByLabelText(/weight/i), '120');
    await userEvent.type(screen.getByLabelText(/reps/i), '3');
    await userEvent.click(screen.getByRole('button', { name: /save record/i }));
    expect(screen.getByText(/e1RM 127 kg/i)).toBeInTheDocument();
  });

  it('shows the search bar only after tapping the search button', async () => {
    seed([ex('Back Squat'), ex('Deadlift'), ex('Front Squat')]);
    render(<ExercisesPage />);
    expect(screen.queryByPlaceholderText(/search/i)).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /search/i }));
    await userEvent.type(screen.getByPlaceholderText(/search/i), 'squat');
    expect(screen.getByText('Back Squat')).toBeInTheDocument();
    expect(screen.getByText('Front Squat')).toBeInTheDocument();
    expect(screen.queryByText('Deadlift')).not.toBeInTheDocument();
  });

  it('keeps the active search filter when opening a row\'s quick-add', async () => {
    seed([ex('Echo Bike'), ex('Back Squat'), ex('Deadlift')]);
    render(<ExercisesPage />);
    await userEvent.click(screen.getByRole('button', { name: /search/i }));
    await userEvent.type(screen.getByPlaceholderText(/search/i), 'echo');
    expect(screen.queryByText('Back Squat')).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /add record to echo bike/i }));
    // The list must stay filtered: the other exercises do not reappear.
    expect(screen.queryByText('Back Squat')).not.toBeInTheDocument();
    expect(screen.queryByText('Deadlift')).not.toBeInTheDocument();
    expect(screen.getByText('Echo Bike')).toBeInTheDocument();
  });

  it('reveals import/export under the settings gear', async () => {
    render(<ExercisesPage />);
    expect(screen.queryByRole('button', { name: /export/i })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /settings/i }));
    expect(screen.getByRole('button', { name: /export/i })).toBeInTheDocument();
  });

  it('collapses an open per-exercise form when the general add is opened', async () => {
    seed([ex('Deadlift')]);
    render(<ExercisesPage />);
    // Deadlift has no records yet, so it only shows up once search is open.
    await userEvent.click(screen.getByRole('button', { name: /search/i }));
    await userEvent.click(screen.getByRole('button', { name: /add record to deadlift/i }));
    expect(screen.getAllByLabelText(/weight/i)).toHaveLength(1);
    await userEvent.click(screen.getByRole('button', { name: /new record/i }));
    expect(screen.getAllByLabelText(/weight/i)).toHaveLength(1);
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

  it('creates a carry exercise and shows its max pill', async () => {
    render(<ExercisesPage />);
    await userEvent.click(screen.getByRole('button', { name: /new record/i }));
    await userEvent.type(screen.getByLabelText(/exercise/i), 'Yoke');
    await userEvent.click(screen.getByRole('button', { name: /^🛷 carry$/i }));
    await userEvent.type(screen.getByLabelText(/weight/i), '100');
    await userEvent.type(screen.getByLabelText(/distance/i), '20');
    await userEvent.click(screen.getByRole('button', { name: /^save$/i }));
    expect(screen.getByText('Yoke')).toBeInTheDocument();
    expect(screen.getByText(/max 100 kg/i)).toBeInTheDocument();
  });

  it('hides exercises without records from the default list', () => {
    seed([
      ex('Back Squat', [{ id: 'e0', date: '2026-06-01', weight: 100, reps: 5 }]),
      ex('Deadlift'),
    ]);
    render(<ExercisesPage />);
    expect(screen.getByText('Back Squat')).toBeInTheDocument();
    expect(screen.queryByText('Deadlift')).not.toBeInTheDocument();
  });

  it('shows every exercise, with or without records, once search is open', async () => {
    seed([
      ex('Back Squat', [{ id: 'e0', date: '2026-06-01', weight: 100, reps: 5 }]),
      ex('Deadlift'),
    ]);
    render(<ExercisesPage />);
    await userEvent.click(screen.getByRole('button', { name: /search/i }));
    expect(screen.getByText('Back Squat')).toBeInTheDocument();
    expect(screen.getByText('Deadlift')).toBeInTheDocument();
    await userEvent.type(screen.getByPlaceholderText(/search/i), 'dead');
    expect(screen.queryByText('Back Squat')).not.toBeInTheDocument();
    expect(screen.getByText('Deadlift')).toBeInTheDocument();
  });

  it('shows an empty-list hint when no exercise has records yet', () => {
    seed([ex('Back Squat'), ex('Deadlift')]);
    render(<ExercisesPage />);
    expect(screen.getByText('No records yet — search 🔍 to find an exercise from your library')).toBeInTheDocument();
  });

  it('does not show the empty-list hint when there are no exercises at all', () => {
    seed([]);
    render(<ExercisesPage />);
    expect(screen.queryByText(/no records yet/i)).not.toBeInTheDocument();
  });

  it('does not show the empty-list hint while the search panel is open', async () => {
    seed([ex('Back Squat'), ex('Deadlift')]);
    render(<ExercisesPage />);
    await userEvent.click(screen.getByRole('button', { name: /search/i }));
    expect(screen.queryByText(/no records yet/i)).not.toBeInTheDocument();
  });
});
