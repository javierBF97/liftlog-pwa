import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TypeSelector from './TypeSelector';

describe('TypeSelector', () => {
  it('renders the four types and reports selection', async () => {
    const onChange = vi.fn();
    render(<TypeSelector value="strength" onChange={onChange} />);
    expect(screen.getByRole('button', { name: /strength/i })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /carry/i }));
    expect(onChange).toHaveBeenCalledWith('carry');
  });
});
