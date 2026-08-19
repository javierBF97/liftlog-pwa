import { describe, it, expect } from 'vitest';
import { DEFAULT_PLATES, breakdown } from './plates';

describe('DEFAULT_PLATES', () => {
  it('has the 7 default plates with colors and droppable flags', () => {
    expect(DEFAULT_PLATES).toHaveLength(7);
    const byW = Object.fromEntries(DEFAULT_PLATES.map((p) => [p.weight, p]));
    expect(byW[25].droppable).toBe(true);
    expect(byW[5].droppable).toBe(false);
    expect(byW[1.5].droppable).toBe(false);
    expect(byW[20].color).toBe('#2f7ad6');
  });
});

describe('breakdown', () => {
  it('finds an exact load preferring fewer small plates (75 kg, bar 20)', () => {
    const r = breakdown(75, 20, DEFAULT_PLATES); // per side 27.5 -> 25+2.5 (1 small) over 20+5+2.5 (2 small)
    expect(r.loaded).toBe(75);
    expect(r.exact).toBe(true);
    expect([...r.perSide].sort((a, b) => b - a)).toEqual([25, 2.5]);
  });

  it('returns the nearest loadable with exact=false when not achievable', () => {
    const r = breakdown(73.5, 20, DEFAULT_PLATES); // per side 26.75 -> 26.5 (25+1.5)
    expect(r.exact).toBe(false);
    expect(r.loaded).toBe(73);
    expect([...r.perSide].sort((a, b) => b - a)).toEqual([25, 1.5]);
  });

  it('prefers big bumpers over small plates when equally close', () => {
    const r = breakdown(80, 20, DEFAULT_PLATES); // per side 30 -> 20+10 (no small plates)
    expect(r.exact).toBe(true);
    expect(r.perSide.every((w) => w >= 10)).toBe(true);
  });

  it('returns empty when target <= bar', () => {
    const r = breakdown(20, 20, DEFAULT_PLATES);
    expect(r.perSide).toEqual([]);
    expect(r.loaded).toBe(20);
    expect(r.exact).toBe(true);
  });

  it('works with a custom plate set', () => {
    const plates = [{ weight: 10, color: '#000', droppable: true }];
    const r = breakdown(40, 20, plates); // per side 10 -> [10]
    expect(r.perSide).toEqual([10]);
    expect(r.loaded).toBe(40);
  });
});
