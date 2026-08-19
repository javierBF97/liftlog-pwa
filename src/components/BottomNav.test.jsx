import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BottomNav from './BottomNav';

describe('BottomNav', () => {
  it('renders the two tabs', () => {
    render(<BottomNav active="exercises" onChange={() => {}} />);
    expect(screen.getByRole('button', { name: /log/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /calc\./i })).toBeInTheDocument();
  });
  it('calls onChange with the tab id when clicked', async () => {
    const onChange = vi.fn();
    render(<BottomNav active="exercises" onChange={onChange} />);
    await userEvent.click(screen.getByRole('button', { name: /calc\./i }));
    expect(onChange).toHaveBeenCalledWith('calc');
  });
});
