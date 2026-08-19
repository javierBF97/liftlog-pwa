import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PlateCalc from './PlateCalc';
import { DEFAULT_PLATES } from '../lib/plates';

describe('PlateCalc', () => {
  it('breaks down a target weight per side', async () => {
    render(<PlateCalc bar={20} plates={DEFAULT_PLATES} />);
    await userEvent.type(screen.getByLabelText(/peso objetivo/i), '75');
    // 75 -> per side 25+2.5
    expect(screen.getByText('2.5')).toBeInTheDocument();
    expect(screen.getByText(/total 75 kg/i)).toBeInTheDocument();
  });
});
