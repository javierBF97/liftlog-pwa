import { describe, it, expect, beforeEach } from 'vitest';
import {
  emptyState, loadState, saveState, addExercise, addEntry,
  getLastEntry, exportJSON, importJSON, STORAGE_KEY,
  findExerciseByName, addRecord, deleteEntry, updateEntry,
  renameExercise, deleteExercise,
  exercisesByRecent, addPlate, removePlate, updatePlate, loadBar, saveBar, BAR_KEY,
} from './storage';

beforeEach(() => localStorage.clear());

describe('loadState / saveState', () => {
  it('returns empty state when nothing stored', () => {
    const s = loadState();
    expect(s.version).toBe(1);
    expect(s.exercises).toEqual([]);
    expect(s.plates).toHaveLength(7);
  });
  it('round-trips state through localStorage', () => {
    const s = addExercise(emptyState(), 'Squat');
    saveState(s);
    expect(loadState()).toEqual(s);
    expect(localStorage.getItem(STORAGE_KEY)).toBeTruthy();
  });
});

describe('addExercise', () => {
  it('adds an exercise with id, name and empty entries', () => {
    const s = addExercise(emptyState(), 'Back Squat');
    expect(s.exercises).toHaveLength(1);
    expect(s.exercises[0].name).toBe('Back Squat');
    expect(s.exercises[0].entries).toEqual([]);
    expect(s.exercises[0].id).toBeTruthy();
  });
  it('does not mutate the input state', () => {
    const a = emptyState();
    addExercise(a, 'Squat');
    expect(a.exercises).toHaveLength(0);
  });
});

describe('addEntry / getLastEntry', () => {
  it('adds an entry and reports it as the last (most recent)', () => {
    let s = addExercise(emptyState(), 'Squat');
    const id = s.exercises[0].id;
    s = addEntry(s, id, { date: '2026-06-10', weight: 95, reps: 5 });
    s = addEntry(s, id, { date: '2026-06-16', weight: 100, reps: 5 });
    const last = getLastEntry(s.exercises[0]);
    expect(last.weight).toBe(100);
    expect(last.date).toBe('2026-06-16');
  });
  it('returns null when an exercise has no entries', () => {
    const s = addExercise(emptyState(), 'Squat');
    expect(getLastEntry(s.exercises[0])).toBeNull();
  });
});

describe('exportJSON / importJSON', () => {
  it('round-trips state through JSON', () => {
    const s = addExercise(emptyState(), 'Squat');
    const text = exportJSON(s);
    expect(importJSON(text)).toEqual(s);
  });
  it('throws on malformed JSON', () => {
    expect(() => importJSON('not json')).toThrow();
  });
  it('throws on JSON missing exercises array', () => {
    expect(() => importJSON('{"version":1}')).toThrow();
  });
  it('normalizes exercises missing entries and ids', () => {
    const s = importJSON('{"exercises":[{"name":"Squat"}]}');
    expect(s.exercises[0].name).toBe('Squat');
    expect(s.exercises[0].entries).toEqual([]);
    expect(s.exercises[0].id).toBeTruthy();
  });
  it('drops malformed entries (non-numeric weight/reps)', () => {
    const json = '{"exercises":[{"id":"x","name":"Squat","entries":[{"date":"2026-06-16","weight":"abc","reps":5},{"date":"2026-06-16","weight":100,"reps":5}]}]}';
    const s = importJSON(json);
    expect(s.exercises[0].entries).toHaveLength(1);
    expect(s.exercises[0].entries[0].weight).toBe(100);
  });
});

describe('renameExercise', () => {
  it('changes the exercise name', () => {
    let s = addExercise(emptyState(), 'Squat');
    const id = s.exercises[0].id;
    s = renameExercise(s, id, 'Back Squat');
    expect(s.exercises[0].name).toBe('Back Squat');
  });
});

describe('deleteExercise', () => {
  it('removes the exercise', () => {
    let s = addExercise(emptyState(), 'Squat');
    const id = s.exercises[0].id;
    s = deleteExercise(s, id);
    expect(s.exercises).toHaveLength(0);
  });
});

describe('deleteEntry', () => {
  it('removes the entry by id', () => {
    let s = addExercise(emptyState(), 'Squat');
    const id = s.exercises[0].id;
    s = addEntry(s, id, { date: '2026-06-10', weight: 95, reps: 5 });
    const entryId = s.exercises[0].entries[0].id;
    s = deleteEntry(s, id, entryId);
    expect(s.exercises[0].entries).toHaveLength(0);
  });
});

describe('updateEntry', () => {
  it('patches weight and reps, keeping other fields', () => {
    let s = addExercise(emptyState(), 'Squat');
    const id = s.exercises[0].id;
    s = addEntry(s, id, { date: '2026-06-10', weight: 95, reps: 5 });
    const entryId = s.exercises[0].entries[0].id;
    s = updateEntry(s, id, entryId, { weight: 100, reps: 3 });
    expect(s.exercises[0].entries[0]).toMatchObject({ weight: 100, reps: 3, date: '2026-06-10' });
  });
});

describe('findExerciseByName', () => {
  it('matches case-insensitively, ignoring surrounding spaces', () => {
    const s = addExercise(emptyState(), 'Back Squat');
    expect(findExerciseByName(s, '  back squat ').name).toBe('Back Squat');
  });
  it('returns null when there is no match', () => {
    const s = addExercise(emptyState(), 'Back Squat');
    expect(findExerciseByName(s, 'Deadlift')).toBeNull();
  });
});

describe('addRecord', () => {
  it('appends to an existing exercise when the name matches (no duplicate)', () => {
    let s = addExercise(emptyState(), 'Back Squat');
    s = addRecord(s, 'back squat', { date: '2026-06-16', weight: 100, reps: 5 });
    expect(s.exercises).toHaveLength(1);
    expect(s.exercises[0].entries).toHaveLength(1);
    expect(s.exercises[0].entries[0].weight).toBe(100);
  });
  it('creates a new exercise with the record when the name is new', () => {
    const s = addRecord(emptyState(), 'Deadlift', { date: '2026-06-16', weight: 140, reps: 3 });
    expect(s.exercises).toHaveLength(1);
    expect(s.exercises[0].name).toBe('Deadlift');
    expect(s.exercises[0].entries[0].reps).toBe(3);
  });
});

describe('exercisesByRecent', () => {
  it('orders by most-recent entry date desc, empties last', () => {
    const s = { version: 1, exercises: [
      { id: 'a', name: 'A', createdAt: '2026-01-01', entries: [{ id: 'e', date: '2026-06-01', weight: 1, reps: 1 }] },
      { id: 'b', name: 'B', createdAt: '2026-01-02', entries: [] },
      { id: 'c', name: 'C', createdAt: '2026-01-03', entries: [{ id: 'e2', date: '2026-06-10', weight: 1, reps: 1 }] },
    ] };
    const order = exercisesByRecent(s).map((e) => e.id);
    expect(order).toEqual(['c', 'a', 'b']);
  });
});

describe('plates in state', () => {
  it('loadState seeds default plates when missing', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, exercises: [] }));
    expect(loadState().plates.length).toBe(7);
  });
  it('addPlate and removePlate are immutable', () => {
    let s = { version: 1, exercises: [], plates: [] };
    s = addPlate(s, { weight: 12, color: '#abc', droppable: true });
    expect(s.plates).toHaveLength(1);
    expect(s.plates[0].id).toBeTruthy();
    const id = s.plates[0].id;
    s = removePlate(s, id);
    expect(s.plates).toHaveLength(0);
  });
  it('updatePlate patches weight, color and droppable by id', () => {
    let s = { version: 1, exercises: [], plates: [
      { id: 'p1', weight: 20, color: '#2f7ad6', droppable: true },
      { id: 'p2', weight: 10, color: '#2e9e5b', droppable: true },
    ] };
    s = updatePlate(s, 'p2', { weight: 12.5, color: '#000000', droppable: false });
    expect(s.plates[1]).toEqual({ id: 'p2', weight: 12.5, color: '#000000', droppable: false });
    // other plate untouched
    expect(s.plates[0]).toEqual({ id: 'p1', weight: 20, color: '#2f7ad6', droppable: true });
  });
  it('importJSON seeds default plates when absent', () => {
    const s = importJSON('{"exercises":[]}');
    expect(s.plates.length).toBe(7);
  });
});

describe('bar persistence', () => {
  it('saves and loads the chosen bar weight, default 20', () => {
    expect(loadBar()).toBe(20);
    saveBar(15);
    expect(loadBar()).toBe(15);
  });
});

describe('exercise types', () => {
  it('addExercise defaults to strength and accepts a type', () => {
    expect(addExercise(emptyState(), 'Squat').exercises[0].type).toBe('strength');
    expect(addExercise(emptyState(), 'Yoke', 'carry').exercises[0].type).toBe('carry');
  });
  it('addEntry stores arbitrary type-specific fields', () => {
    let s = addExercise(emptyState(), 'Yoke', 'carry');
    const id = s.exercises[0].id;
    s = addEntry(s, id, { date: '2026-06-10', weight: 100, distance: 20 });
    expect(s.exercises[0].entries[0]).toMatchObject({ weight: 100, distance: 20 });
    expect(s.exercises[0].entries[0].id).toBeTruthy();
  });
  it('addRecord creates a new exercise with the given type', () => {
    const s = addRecord(emptyState(), 'Run', { date: '2026-06-10', distance: 5000, time: 1320 }, 'cardio');
    expect(s.exercises[0].type).toBe('cardio');
    expect(s.exercises[0].entries[0].distance).toBe(5000);
  });
  it('loadState migrates exercises without a type to strength', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      version: 1,
      exercises: [{ id: 'x', name: 'Old', createdAt: '2026-01-01', entries: [] }],
    }));
    expect(loadState().exercises[0].type).toBe('strength');
  });
  it('sanitizeState keeps valid carry entries, drops invalid, defaults type', () => {
    const json = JSON.stringify({ exercises: [
      { id: 'c', name: 'Yoke', type: 'carry', entries: [
        { id: 'e1', date: '2026-06-10', weight: 100, distance: 20 },
        { id: 'e2', date: '2026-06-11', weight: 100 },
      ] },
      { id: 'd', name: 'Old', entries: [{ id: 'e3', date: '2026-06-10', weight: 'abc', reps: 5 }] },
    ] });
    const s = importJSON(json);
    expect(s.exercises[0].type).toBe('carry');
    expect(s.exercises[0].entries).toHaveLength(1);
    expect(s.exercises[1].type).toBe('strength');
    expect(s.exercises[1].entries).toHaveLength(0);
  });
});
