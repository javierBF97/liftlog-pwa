import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import RmTable from './RmTable';
import { DEFAULT_PLATES } from '../lib/plates';

describe('RmTable', () => {
  it('renders 1RM..16RM by default', () => {
    render(<RmTable oneRm={120} />);
    expect(screen.getByText('1RM')).toBeInTheDocument();
    expect(screen.getByText('16RM')).toBeInTheDocument();
    expect(screen.getAllByRole('row')).toHaveLength(17);
  });
  it('limits rows with max prop and shows plates when on', () => {
    render(<RmTable oneRm={120} max={12} showPlates bar={20} plates={DEFAULT_PLATES} />);
    expect(screen.getByText('12RM')).toBeInTheDocument();
    expect(screen.queryByText('13RM')).not.toBeInTheDocument();
    expect(screen.getByText(/plates \/side/i)).toBeInTheDocument();
  });
});
