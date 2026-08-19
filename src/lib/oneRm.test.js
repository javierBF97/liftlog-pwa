import { describe, it, expect } from 'vitest';
import { estimate1RM, weightForRM, buildPercentTable, buildRmTable } from './oneRm';

describe('estimate1RM (Epley)', () => {
  it('computes 1RM from weight and reps', () => {
    expect(estimate1RM(100, 5)).toBeCloseTo(116.6667, 3);
  });
  it('returns the weight itself logic for reps via formula at 0 reps', () => {
    expect(estimate1RM(100, 0)).toBe(100);
  });
});

describe('weightForRM (inverse Epley)', () => {
  it('computes the weight for an n-rep max from a 1RM', () => {
    expect(weightForRM(120, 5)).toBeCloseTo(102.857, 3);
  });
});

describe('buildPercentTable', () => {
  it('builds 16 rows from 105% down to 30% in 5% steps', () => {
    const rows = buildPercentTable(100);
    expect(rows).toHaveLength(16);
    expect(rows[0]).toEqual({ pct: 105, weight: 105 });
    expect(rows[15]).toEqual({ pct: 30, weight: 30 });
  });
});

describe('buildRmTable', () => {
  it('builds rows from 1RM to 16RM by default', () => {
    const rows = buildRmTable(120);
    expect(rows).toHaveLength(16);
    expect(rows[0].rm).toBe(1);
    expect(rows[15].rm).toBe(16);
    expect(rows[4].weight).toBeCloseTo(102.857, 3);
  });
  it('accepts a custom max (detail view uses 12)', () => {
    const rows = buildRmTable(120, 12);
    expect(rows).toHaveLength(12);
    expect(rows[11].rm).toBe(12);
  });
});
