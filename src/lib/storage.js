import { DEFAULT_PLATES } from './plates';
import baseLibrary from '../../crossfit-base.json';

export const STORAGE_KEY = 'liftlog-v1';
export const BAR_KEY = 'liftlog-bar-kg';

function uuid() {
  return crypto.randomUUID();
}

const TYPES = ['strength', 'carry', 'gymnastics', 'cardio'];
const NUM_FIELDS = ['weight', 'reps', 'distance', 'calories', 'time'];

function isValidEntry(type, e) {
  if (!e || typeof e.date !== 'string') return false;
  const has = (f) => Number.isFinite(Number(e[f])) && e[f] !== '' && e[f] != null;
  if (type === 'carry') return has('weight') && has('distance');
  if (type === 'gymnastics') return has('reps');
  if (type === 'cardio') return has('time') && (has('distance') || has('calories'));
  return has('weight') && has('reps');
}

function cleanEntry(e) {
  const out = { id: (typeof e.id === 'string' && e.id) ? e.id : uuid(), date: e.date };
  for (const f of NUM_FIELDS) {
    if (Number.isFinite(Number(e[f])) && e[f] !== '' && e[f] != null) out[f] = Number(e[f]);
  }
  if (typeof e.modality === 'string') out.modality = e.modality;
  return out;
}

export function emptyState() {
  return { version: 1, exercises: [], plates: DEFAULT_PLATES };
}

// State for a device that has never stored anything: the bundled exercise
// library, so the app is usable without importing a backup first.
export function initialState() {
  try {
    return sanitizeState(baseLibrary);
  } catch {
    return emptyState();
  }
}

export function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  // Absent key means first run; an empty stored state is a deliberate wipe.
  if (!raw) return initialState();
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.exercises)) return emptyState();
    if (!Array.isArray(parsed.plates) || parsed.plates.length === 0) {
      parsed.plates = DEFAULT_PLATES;
    }
    parsed.exercises = parsed.exercises.map((ex) => (ex.type ? ex : { ...ex, type: 'strength' }));
    return parsed;
  } catch {
    // Corrupted storage: fall back to empty state rather than white-screening.
    return emptyState();
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore write failures (quota exceeded, private mode); state stays in memory.
  }
}

export function addExercise(state, name, type = 'strength') {
  const exercise = {
    id: uuid(),
    name,
    type,
    createdAt: new Date().toISOString(),
    entries: [],
  };
  return { ...state, exercises: [...state.exercises, exercise] };
}

export function exercisesByRecent(state) {
  const lastDate = (ex) => (ex.entries.length
    ? [...ex.entries].sort((a, b) => a.date.localeCompare(b.date)).at(-1).date
    : '');
  return [...state.exercises].sort((a, b) => lastDate(b).localeCompare(lastDate(a)));
}

export function addPlate(state, { weight, color, droppable }) {
  const plate = { id: uuid(), weight, color, droppable: !!droppable };
  return { ...state, plates: [...(state.plates ?? []), plate] };
}

export function removePlate(state, plateId) {
  return { ...state, plates: (state.plates ?? []).filter((p) => p.id !== plateId) };
}

export function updatePlate(state, plateId, { weight, color, droppable }) {
  const plates = (state.plates ?? []).map((p) =>
    p.id === plateId
      ? {
        id: p.id,
        weight: weight != null ? Number(weight) : p.weight,
        color: color != null ? color : p.color,
        droppable: droppable != null ? !!droppable : p.droppable,
      }
      : p
  );
  return { ...state, plates };
}

export function loadBar() {
  const raw = localStorage.getItem(BAR_KEY);
  const n = parseFloat(raw);
  return Number.isFinite(n) && n > 0 ? n : 20;
}

export function saveBar(kg) {
  try { localStorage.setItem(BAR_KEY, String(kg)); } catch { /* ignore */ }
}

export function addEntry(state, exerciseId, entry) {
  const exercises = state.exercises.map((ex) =>
    ex.id === exerciseId
      ? { ...ex, entries: [...ex.entries, { id: uuid(), ...entry }] }
      : ex
  );
  return { ...state, exercises };
}

const normalizeName = (s) => s.trim().toLowerCase();

// Existing exercise whose name matches (case-insensitive, trimmed), or null.
export function findExerciseByName(state, name) {
  return state.exercises.find((ex) => normalizeName(ex.name) === normalizeName(name)) ?? null;
}

// Add a record under `name`: append to the matching exercise, or create it first.
export function addRecord(state, name, entry, type = 'strength') {
  const existing = findExerciseByName(state, name);
  if (existing) return addEntry(state, existing.id, entry);
  const next = addExercise(state, name.trim(), type);
  const created = next.exercises[next.exercises.length - 1];
  return addEntry(next, created.id, entry);
}

export function renameExercise(state, exerciseId, name) {
  const exercises = state.exercises.map((ex) => (ex.id === exerciseId ? { ...ex, name } : ex));
  return { ...state, exercises };
}

export function deleteExercise(state, exerciseId) {
  return { ...state, exercises: state.exercises.filter((ex) => ex.id !== exerciseId) };
}

export function deleteEntry(state, exerciseId, entryId) {
  const exercises = state.exercises.map((ex) =>
    ex.id === exerciseId
      ? { ...ex, entries: ex.entries.filter((e) => e.id !== entryId) }
      : ex
  );
  return { ...state, exercises };
}

export function updateEntry(state, exerciseId, entryId, patch) {
  const exercises = state.exercises.map((ex) =>
    ex.id === exerciseId
      ? { ...ex, entries: ex.entries.map((e) => (e.id === entryId ? { ...e, ...patch } : e)) }
      : ex
  );
  return { ...state, exercises };
}

// Most recent entry by date, or null when empty.
export function getLastEntry(exercise) {
  if (!exercise.entries.length) return null;
  return [...exercise.entries].sort((a, b) => a.date.localeCompare(b.date)).at(-1);
}

export function exportJSON(state) {
  return JSON.stringify(state, null, 2);
}

// Normalize an imported object into a valid state, dropping malformed pieces.
export function sanitizeState(parsed) {
  if (!parsed || !Array.isArray(parsed.exercises)) {
    throw new Error('Invalid backup: missing exercises array');
  }
  const exercises = parsed.exercises
    .filter((ex) => ex && typeof ex.name === 'string' && ex.name.trim())
    .map((ex) => {
      const type = TYPES.includes(ex.type) ? ex.type : 'strength';
      return {
        id: typeof ex.id === 'string' && ex.id ? ex.id : uuid(),
        name: ex.name,
        type,
        createdAt: typeof ex.createdAt === 'string' ? ex.createdAt : new Date().toISOString(),
        entries: Array.isArray(ex.entries)
          ? ex.entries.filter((e) => isValidEntry(type, e)).map(cleanEntry)
          : [],
      };
    });
  const plates = Array.isArray(parsed.plates) && parsed.plates.length
    ? parsed.plates
        .filter((p) => p && Number.isFinite(Number(p.weight)) && typeof p.color === 'string')
        .map((p) => ({
          id: typeof p.id === 'string' && p.id ? p.id : uuid(),
          weight: Number(p.weight),
          color: p.color,
          droppable: !!p.droppable,
        }))
    : DEFAULT_PLATES;
  return { version: 1, exercises, plates };
}

export function importJSON(text) {
  return sanitizeState(JSON.parse(text));
}
