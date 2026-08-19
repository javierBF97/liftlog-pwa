import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EntryFields from './EntryFields';

describe('EntryFields', () => {
  it('emits a carry entry as fields are filled', async () => {
    const onChange = vi.fn();
    render(<EntryFields type="carry" onChange={onChange} />);
    await userEvent.type(screen.getByLabelText(/weight/i), '100');
    await userEvent.type(screen.getByLabelText(/distance/i), '20');
    const last = onChange.mock.calls.at(-1)[0];
    expect(last).toMatchObject({ weight: 100, distance: 20 });
    expect(last.date).toBeTruthy();
  });

  it('seeds fields from `initial`', async () => {
    const onChange = vi.fn();
    render(<EntryFields type="strength" initial={{ date: '2026-06-10', weight: '100', reps: '5' }} onChange={onChange} />);
    expect(screen.getByLabelText(/weight/i)).toHaveValue(100);
    expect(screen.getByLabelText(/reps/i)).toHaveValue(5);
  });

  it('gymnastics shows the time field only for accumulated', async () => {
    render(<EntryFields type="gymnastics" onChange={() => {}} />);
    expect(screen.queryByLabelText(/minutes/i)).not.toBeInTheDocument();
    await userEvent.selectOptions(screen.getByLabelText(/modality/i), 'accumulated');
    expect(screen.getByLabelText(/minutes/i)).toBeInTheDocument();
  });
});
