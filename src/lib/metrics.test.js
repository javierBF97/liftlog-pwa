import { describe, it, expect } from 'vitest';
import {
  parseTime, formatTime, carryVolume, pacePerKm, powerCalMin, pillText,
  metricGrande, chartMetrics, chartSeries, historyHeaders, historyCells,
} from './metrics';

describe('time format', () => {
  it('parses mm:ss to seconds', () => {
    expect(parseTime('1:30')).toBe(90);
    expect(parseTime('22:00')).toBe(1320);
    expect(parseTime('45')).toBe(45);
    expect(parseTime('')).toBeNull();
    expect(parseTime('abc')).toBeNull();
  });
  it('formats seconds to m:ss', () => {
    expect(formatTime(90)).toBe('1:30');
    expect(formatTime(1320)).toBe('22:00');
    expect(formatTime(5)).toBe('0:05');
  });
});

describe('derived metrics', () => {
  it('carryVolume = weight * distance', () => {
    expect(carryVolume(100, 20)).toBe(2000);
  });
  it('pacePerKm returns seconds per km', () => {
    expect(pacePerKm(1000, 270)).toBe(270);
    expect(pacePerKm(0, 100)).toBeNull();
  });
  it('powerCalMin returns calories per minute', () => {
    expect(powerCalMin(150, 600)).toBe(15);
    expect(powerCalMin(0, 100)).toBeNull();
  });
});

describe('pillText', () => {
  it('strength: best e1RM across entries', () => {
    const ex = { type: 'strength', entries: [
      { id: '1', date: '2026-06-01', weight: 90, reps: 5 },
      { id: '2', date: '2026-06-10', weight: 100, reps: 5 },
    ] };
    expect(pillText(ex)).toBe('e1RM 113 kg');
  });
  it('strength: a lighter last session does not lower the e1RM', () => {
    const ex = { type: 'strength', entries: [
      { id: '1', date: '2026-06-01', weight: 100, reps: 5 },
      { id: '2', date: '2026-06-20', weight: 60, reps: 3 },
    ] };
    expect(pillText(ex)).toBe('e1RM 113 kg');
  });
  it('carry: max weight', () => {
    const ex = { type: 'carry', entries: [
      { id: '1', date: '2026-06-01', weight: 80, distance: 20 },
      { id: '2', date: '2026-06-10', weight: 100, distance: 15 },
    ] };
    expect(pillText(ex)).toBe('max 100 kg');
  });
  it('gymnastics: max unbroken reps', () => {
    const ex = { type: 'gymnastics', entries: [
      { id: '1', date: '2026-06-01', reps: 12, modality: 'unbroken' },
      { id: '2', date: '2026-06-10', reps: 50, modality: 'accumulated', time: 180 },
    ] };
    expect(pillText(ex)).toBe('12 unbroken');
  });
  it('cardio: best pace per km', () => {
    const ex = { type: 'cardio', entries: [
      { id: '1', date: '2026-06-01', distance: 1000, time: 300 },
      { id: '2', date: '2026-06-10', distance: 1000, time: 270 },
    ] };
    expect(pillText(ex)).toBe('best 4:30 /km');
  });
  it('returns null when there are no entries', () => {
    expect(pillText({ type: 'strength', entries: [] })).toBeNull();
  });
});

describe('metricGrande', () => {
  it('strength → best estimated 1RM on record', () => {
    expect(metricGrande({ type: 'strength', entries: [{ date: '2026-06-10', weight: 100, reps: 5 }] }))
      .toEqual({ label: 'Estimated 1RM', value: '113 kg' });
  });
  it('carry → max weight', () => {
    expect(metricGrande({ type: 'carry', entries: [
      { date: '2026-06-01', weight: 80, distance: 20 }, { date: '2026-06-02', weight: 100, distance: 10 },
    ] })).toEqual({ label: 'Max weight', value: '100 kg' });
  });
  it('returns null without entries', () => {
    expect(metricGrande({ type: 'carry', entries: [] })).toBeNull();
  });
});

describe('chartMetrics / chartSeries', () => {
  it('carry has Weight and Volume options', () => {
    expect(chartMetrics('carry').map((m) => m.key)).toEqual(['weight', 'volume']);
  });
  it('strength has a single e1rm series', () => {
    expect(chartMetrics('strength').map((m) => m.key)).toEqual(['e1rm']);
  });
  it('chartSeries(carry, volume) = weight*distance per dated point, sorted', () => {
    const ex = { type: 'carry', entries: [
      { date: '2026-06-02', weight: 100, distance: 10 },
      { date: '2026-06-01', weight: 80, distance: 20 },
    ] };
    expect(chartSeries(ex, 'volume')).toEqual([
      { date: '2026-06-01', value: 1600 },
      { date: '2026-06-02', value: 1000 },
    ]);
  });
  it('chartSeries drops points where the metric does not apply (gym unbroken series)', () => {
    const ex = { type: 'gymnastics', entries: [
      { date: '2026-06-01', reps: 12, modality: 'unbroken' },
      { date: '2026-06-02', reps: 50, modality: 'accumulated', time: 180 },
    ] };
    expect(chartSeries(ex, 'unbroken')).toEqual([{ date: '2026-06-01', value: 12 }]);
  });
});

describe('history columns', () => {
  it('headers per type', () => {
    expect(historyHeaders('carry')).toEqual(['Date', 'Weight', 'Distance']);
    expect(historyHeaders('gymnastics')).toEqual(['Date', 'Reps', 'Modality', 'Time']);
    expect(historyHeaders('cardio')).toEqual(['Date', 'Distance', 'Calories', 'Time']);
    expect(historyHeaders('strength')).toEqual(['Date', 'Weight', 'Reps']);
  });
  it('cells per type', () => {
    expect(historyCells('carry', { date: '2026-06-01', weight: 100, distance: 20 }))
      .toEqual(['2026-06-01', '100 kg', '20 m']);
    expect(historyCells('gymnastics', { date: '2026-06-01', reps: 50, modality: 'accumulated', time: 180 }))
      .toEqual(['2026-06-01', '50', 'Accum.', '3:00']);
    expect(historyCells('cardio', { date: '2026-06-01', calories: 120, time: 600 }))
      .toEqual(['2026-06-01', '—', '120 cal', '10:00']);
  });
});
