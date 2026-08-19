import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ExerciseDetail from './ExerciseDetail';
import { DEFAULT_PLATES } from '../lib/plates';

vi.mock('../components/OneRmChart', () => ({ default: () => <div data-testid="chart" /> }));
vi.mock('../components/MetricChart', () => ({ default: () => <div data-testid="metric-chart" /> }));

const entries = [
  { id: 'e1', date: '2026-03-10', weight: 80, reps: 5 },
  { id: 'e2', date: '2026-04-10', weight: 85, reps: 5 },
  { id: 'e3', date: '2026-05-10', weight: 90, reps: 5 },
  { id: 'e4', date: '2026-06-10', weight: 95, reps: 5 },
  { id: 'e5', date: '2026-06-16', weight: 100, reps: 5 },
];
const exercise = { id: 'x1', name: 'Back Squat', createdAt: '', entries };

describe('ExerciseDetail v2', () => {
  it('shows e1RM from last entry, the chart and the percent table (105 → 30)', async () => {
    render(<ExerciseDetail exercise={exercise} onBack={() => {}} onAddEntry={() => {}} />);
    expect(screen.getByText('Back Squat')).toBeInTheDocument();
    expect(screen.getByText(/117 kg/)).toBeInTheDocument();
    expect(await screen.findByTestId('chart')).toBeInTheDocument();
    expect(screen.getByText('105%')).toBeInTheDocument();
    expect(screen.getByText('30%')).toBeInTheDocument();
  });

  it('toggles between % and RM (1RM..12RM) tables', async () => {
    render(<ExerciseDetail exercise={exercise} onBack={() => {}} onAddEntry={() => {}} />);
    await userEvent.click(screen.getByRole('button', { name: /^rm$/i }));
    expect(screen.getByText('1RM')).toBeInTheDocument();
    expect(screen.getByText('12RM')).toBeInTheDocument();
    expect(screen.queryByText('13RM')).not.toBeInTheDocument();
    expect(screen.queryByText('105%')).not.toBeInTheDocument();
  });

  it('has a single add control (no bottom button) that calls onAddEntry', async () => {
    const onAddEntry = vi.fn();
    render(<ExerciseDetail exercise={exercise} onBack={() => {}} onAddEntry={onAddEntry} />);
    expect(screen.queryByText(/add today's record/i)).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /^add record$/i }));
    await userEvent.type(screen.getByLabelText(/weight/i), '102.5');
    await userEvent.type(screen.getByLabelText(/reps/i), '3');
    await userEvent.click(screen.getByRole('button', { name: /save record/i }));
    expect(onAddEntry).toHaveBeenCalledWith(expect.objectContaining({ weight: 102.5, reps: 3 }));
  });

  it('shows the 3 most recent history entries by default', () => {
    render(<ExerciseDetail exercise={exercise} onBack={() => {}} onAddEntry={() => {}} />);
    expect(screen.getByText('2026-06-16')).toBeInTheDocument();
    expect(screen.getByText('2026-05-10')).toBeInTheDocument();
    expect(screen.queryByText('2026-03-10')).not.toBeInTheDocument();
  });

  it('expands history when a date range is applied', async () => {
    render(<ExerciseDetail exercise={exercise} onBack={() => {}} onAddEntry={() => {}} />);
    await userEvent.click(screen.getByRole('button', { name: /dates/i }));
    fireEvent.change(screen.getByLabelText(/from/i), { target: { value: '2026-03-01' } });
    expect(screen.getByText('2026-03-10')).toBeInTheDocument();
  });

  it('deletes a history entry via its trash button', async () => {
    const onDeleteEntry = vi.fn();
    render(<ExerciseDetail exercise={exercise} onBack={() => {}} onAddEntry={() => {}} onDeleteEntry={onDeleteEntry} />);
    await userEvent.click(screen.getAllByRole('button', { name: /^delete$/i })[0]);
    await userEvent.click(screen.getByRole('button', { name: /confirm delete/i }));
    expect(onDeleteEntry).toHaveBeenCalledWith('e5');
  });

  it('edits a history entry inline and saves the new weight', async () => {
    const onUpdateEntry = vi.fn();
    render(<ExerciseDetail exercise={exercise} onBack={() => {}} onAddEntry={() => {}} onUpdateEntry={onUpdateEntry} />);
    await userEvent.click(screen.getAllByRole('button', { name: /^edit$/i })[0]);
    const weightInput = screen.getByDisplayValue('100');
    await userEvent.clear(weightInput);
    await userEvent.type(weightInput, '105');
    await userEvent.click(screen.getByRole('button', { name: /^save$/i }));
    expect(onUpdateEntry).toHaveBeenCalledWith('e5', expect.objectContaining({ weight: 105 }));
  });

  it('renames the exercise from the settings menu', async () => {
    const onRename = vi.fn();
    render(<ExerciseDetail exercise={exercise} onBack={() => {}} onAddEntry={() => {}} onRename={onRename} />);
    await userEvent.click(screen.getByRole('button', { name: /settings/i }));
    await userEvent.click(screen.getByRole('button', { name: /edit name/i }));
    const input = screen.getByLabelText(/name/i);
    await userEvent.clear(input);
    await userEvent.type(input, 'Front Squat');
    await userEvent.click(screen.getByRole('button', { name: /^save$/i }));
    expect(onRename).toHaveBeenCalledWith('Front Squat');
  });

  it('deletes the exercise after confirming in the settings menu', async () => {
    const onDelete = vi.fn();
    render(<ExerciseDetail exercise={exercise} onBack={() => {}} onAddEntry={() => {}} onDelete={onDelete} />);
    await userEvent.click(screen.getByRole('button', { name: /settings/i }));
    await userEvent.click(screen.getByRole('button', { name: /delete exercise/i }));
    await userEvent.click(screen.getByRole('button', { name: /yes, delete/i }));
    expect(onDelete).toHaveBeenCalled();
  });

  it('shows plates in the % table when the discos toggle is on', async () => {
    render(<ExerciseDetail exercise={exercise} onBack={() => {}} onAddEntry={() => {}} plates={DEFAULT_PLATES} />);
    await userEvent.click(screen.getByRole('checkbox', { name: /plates/i }));
    expect(screen.getByText(/plates \/side/i)).toBeInTheDocument();
  });

  it('carry detail: metric grande, chart selector and per-type history columns', async () => {
    const carry = { id: 'c1', name: 'Yoke', type: 'carry', entries: [
      { id: 'e1', date: '2026-06-01', weight: 80, distance: 20 },
      { id: 'e2', date: '2026-06-10', weight: 100, distance: 15 },
    ] };
    render(<ExerciseDetail exercise={carry} onBack={() => {}} onAddEntry={() => {}} />);
    expect(screen.getByText('Max weight')).toBeInTheDocument();
    expect(screen.getAllByText('100 kg').length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: /^volume$/i })).toBeInTheDocument();
    expect(screen.getByText('Distance')).toBeInTheDocument();
    expect(screen.queryByText('105%')).not.toBeInTheDocument();
  });

  it('edits a carry entry with type-aware fields', async () => {
    const onUpdateEntry = vi.fn();
    const carry = { id: 'c1', name: 'Yoke', type: 'carry', entries: [
      { id: 'e1', date: '2026-06-10', weight: 100, distance: 20 },
    ] };
    render(<ExerciseDetail exercise={carry} onBack={() => {}} onAddEntry={() => {}} onUpdateEntry={onUpdateEntry} />);
    await userEvent.click(screen.getByRole('button', { name: /^edit$/i }));
    const dist = screen.getByLabelText(/distance/i);
    await userEvent.clear(dist);
    await userEvent.type(dist, '25');
    await userEvent.click(screen.getByRole('button', { name: /^save$/i }));
    expect(onUpdateEntry).toHaveBeenCalledWith('e1', expect.objectContaining({ weight: 100, distance: 25 }));
  });

  it('does not show 1RM/% sections for a non-strength exercise', () => {
    const carry = { id: 'c1', name: 'Yoke', type: 'carry', entries: [
      { id: 'e1', date: '2026-06-10', weight: 100, distance: 20 },
    ] };
    render(<ExerciseDetail exercise={carry} onBack={() => {}} onAddEntry={() => {}} plates={DEFAULT_PLATES} />);
    expect(screen.queryByText('Estimated 1RM')).not.toBeInTheDocument();
    expect(screen.queryByText('105%')).not.toBeInTheDocument();
    expect(screen.getByText('Max weight')).toBeInTheDocument();
    expect(screen.getAllByText('100 kg').length).toBeGreaterThan(0);
  });
});
