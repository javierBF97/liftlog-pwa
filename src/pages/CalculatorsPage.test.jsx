import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CalculatorsPage from './CalculatorsPage';

beforeEach(() => localStorage.clear());

describe('CalculatorsPage', () => {
  it('computes a % table with e1RM', async () => {
    render(<CalculatorsPage />);
    await userEvent.type(screen.getByLabelText(/peso/i), '100');
    await userEvent.type(screen.getByLabelText(/reps/i), '5');
    await userEvent.click(screen.getByRole('button', { name: /calcular/i }));
    expect(screen.getByText('116.7')).toBeInTheDocument();
  });

  it('switches to Discos mode and breaks down a weight', async () => {
    render(<CalculatorsPage />);
    await userEvent.click(screen.getByRole('button', { name: /^discos$/i }));
    await userEvent.type(screen.getByLabelText(/peso objetivo/i), '60');
    // 60-20=40 -> 20 per side, exacto
    expect(screen.getByText(/total 60 kg · exacto/i)).toBeInTheDocument();
  });
});
