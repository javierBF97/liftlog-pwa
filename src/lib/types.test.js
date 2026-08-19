import { describe, it, expect } from 'vitest';
import { EXERCISE_TYPES, TYPE_IDS, DEFAULT_TYPE, emojiFor, labelFor } from './types';

describe('types registry', () => {
  it('has the four types with emoji and label', () => {
    expect(TYPE_IDS).toEqual(['strength', 'carry', 'gymnastics', 'cardio']);
    expect(EXERCISE_TYPES.carry.emoji).toBe('🛷');
    expect(labelFor('strength')).toBe('Strength');
    expect(DEFAULT_TYPE).toBe('strength');
  });
  it('emojiFor/labelFor fall back to strength for unknown types', () => {
    expect(emojiFor('carry')).toBe('🛷');
    expect(emojiFor('???')).toBe('💪');
    expect(labelFor('cardio')).toBe('Cardio');
    expect(labelFor(undefined)).toBe('Strength');
  });
});
