import { describe, it, expect } from 'vitest';
import { TYPE_FIELDS, parseEntry } from './entryForm';

describe('TYPE_FIELDS', () => {
  it('defines fields for each type', () => {
    expect(TYPE_FIELDS.strength.map((f) => f.key)).toEqual(['weight', 'reps']);
    expect(TYPE_FIELDS.carry.map((f) => f.key)).toEqual(['weight', 'distance']);
    expect(TYPE_FIELDS.gymnastics.map((f) => f.key)).toEqual(['reps', 'modality', 'time']);
    expect(TYPE_FIELDS.cardio.map((f) => f.key)).toEqual(['distance', 'calories', 'time']);
  });
});

describe('parseEntry', () => {
  const date = '2026-06-10';
  it('strength needs weight>0 and reps>0', () => {
    expect(parseEntry('strength', { date, weight: '100', reps: '5' })).toEqual({ date, weight: 100, reps: 5 });
    expect(parseEntry('strength', { date, weight: '0', reps: '5' })).toBeNull();
    expect(parseEntry('strength', { date, weight: '100', reps: '' })).toBeNull();
  });
  it('carry needs weight>0 and distance>0', () => {
    expect(parseEntry('carry', { date, weight: '100', distance: '20' })).toEqual({ date, weight: 100, distance: 20 });
    expect(parseEntry('carry', { date, weight: '100', distance: '' })).toBeNull();
  });
  it('gymnastics: unbroken has no time; accumulated requires time', () => {
    expect(parseEntry('gymnastics', { date, reps: '12', modality: 'unbroken' }))
      .toEqual({ date, reps: 12, modality: 'unbroken' });
    expect(parseEntry('gymnastics', { date, reps: '50', modality: 'accumulated', time: '3:00' }))
      .toEqual({ date, reps: 50, modality: 'accumulated', time: 180 });
    expect(parseEntry('gymnastics', { date, reps: '50', modality: 'accumulated', time: '' })).toBeNull();
  });
  it('cardio: time required and at least one of distance/calories', () => {
    expect(parseEntry('cardio', { date, distance: '5000', calories: '', time: '22:00' }))
      .toEqual({ date, distance: 5000, time: 1320 });
    expect(parseEntry('cardio', { date, distance: '', calories: '120', time: '10:00' }))
      .toEqual({ date, calories: 120, time: 600 });
    expect(parseEntry('cardio', { date, distance: '', calories: '', time: '10:00' })).toBeNull();
    expect(parseEntry('cardio', { date, distance: '5000', calories: '', time: '' })).toBeNull();
  });
  it('returns null without a date', () => {
    expect(parseEntry('strength', { date: '', weight: '100', reps: '5' })).toBeNull();
  });
});
