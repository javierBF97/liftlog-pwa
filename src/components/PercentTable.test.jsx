import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import PercentTable from './PercentTable';
import { DEFAULT_PLATES } from '../lib/plates';

describe('PercentTable', () => {
  it('renders 16 rows (105% → 30%)', () => {
    render(<PercentTable oneRm={100} />);
    expect(screen.getByText('105%')).toBeInTheDocument();
    expect(screen.getByText('30%')).toBeInTheDocument();
    expect(screen.getAllByRole('row')).toHaveLength(17);
  });
  it('shows a plates column when showPlates is on', () => {
    render(<PercentTable oneRm={100} showPlates bar={20} plates={DEFAULT_PLATES} />);
    expect(screen.getAllByText('20').length).toBeGreaterThan(0);
    expect(screen.getByText(/discos/i)).toBeInTheDocument();
  });
});
