import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import PlateChips from './PlateChips';

describe('PlateChips', () => {
  it('renders one chip per plate with its weight', () => {
    render(<PlateChips perSide={[20, 5, 2.5]} />);
    expect(screen.getByText('20')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('2.5')).toBeInTheDocument();
  });
  it('shows a dash when there are no plates', () => {
    render(<PlateChips perSide={[]} />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });
});
