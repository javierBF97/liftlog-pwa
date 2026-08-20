import { describe, it, expect } from 'vitest';
import { estimate1RM, weightForRM, buildPercentTable, buildRmTable } from './oneRm';

describe('estimate1RM (Brzycki)', () => {
  it('returns the weight itself for a single, never more', () => {
    expect(estimate1RM(55, 1)).toBe(55);
  });
  it('computes 1RM from weight and reps', () => {
    expect(estimate1RM(100, 5)).toBeCloseTo(112.5, 3);
  });
  it('grows with reps at the same weight', () => {
    expect(estimate1RM(100, 3)).toBeGreaterThan(estimate1RM(100, 1));
    expect(estimate1RM(100, 5)).toBeGreaterThan(estimate1RM(100, 3));
  });
  it('stays finite and sane for rep counts the formula cannot model', () => {
    for (const reps of [20, 37, 50]) {
      const rm = estimate1RM(100, reps);
      expect(Number.isFinite(rm)).toBe(true);
      expect(rm).toBeGreaterThan(100);
      expect(rm).toBeLessThan(200);
    }
  });
});

describe('weightForRM (inverse Brzycki)', () => {
  it('computes the weight for an n-rep max from a 1RM', () => {
    expect(weightForRM(120, 5)).toBeCloseTo(106.6667, 3);
  });
  it('round-trips with estimate1RM', () => {
    expect(weightForRM(estimate1RM(100, 5), 5)).toBeCloseTo(100, 6);
  });
  it('returns the 1RM itself for a single', () => {
    expect(weightForRM(120, 1)).toBe(120);
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
    expect(rows[4].weight).toBeCloseTo(106.6667, 3);
  });
  it('accepts a custom max (detail view uses 12)', () => {
    const rows = buildRmTable(120, 12);
    expect(rows).toHaveLength(12);
    expect(rows[11].rm).toBe(12);
  });
});
