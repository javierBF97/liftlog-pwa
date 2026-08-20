import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CalculatorsPage from './CalculatorsPage';

beforeEach(() => localStorage.clear());

describe('CalculatorsPage', () => {
  it('computes a % table with e1RM', async () => {
    render(<CalculatorsPage />);
    await userEvent.type(screen.getByLabelText(/weight/i), '100');
    await userEvent.type(screen.getByLabelText(/reps/i), '5');
    await userEvent.click(screen.getByRole('button', { name: /calculate/i }));
    expect(screen.getByText('112.5')).toBeInTheDocument();
  });

  it('switches to Plates mode and breaks down a weight', async () => {
    render(<CalculatorsPage />);
    await userEvent.click(screen.getByRole('button', { name: /^plates$/i }));
    await userEvent.type(screen.getByLabelText(/target weight/i), '60');
    // 60-20=40 -> 20 per side, exact
    expect(screen.getByText(/total 60 kg · exact/i)).toBeInTheDocument();
  });
});
