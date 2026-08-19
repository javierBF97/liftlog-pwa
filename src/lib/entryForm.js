import { parseTime } from './metrics';

// `label` holds an i18n key; render sites resolve it with t() so the field
// captions follow the active language.
export const TYPE_FIELDS = {
  strength: [
    { key: 'weight', label: 'field.weight', kind: 'number' },
    { key: 'reps', label: 'field.reps', kind: 'int' },
  ],
  carry: [
    { key: 'weight', label: 'field.weight', kind: 'number' },
    { key: 'distance', label: 'field.distance', kind: 'number' },
  ],
  gymnastics: [
    { key: 'reps', label: 'field.reps', kind: 'int' },
    { key: 'modality', label: 'field.modality', kind: 'modality' },
    { key: 'time', label: 'field.time', kind: 'time', showIf: (raw) => raw.modality === 'accumulated' },
  ],
  cardio: [
    { key: 'distance', label: 'field.distance', kind: 'number' },
    { key: 'calories', label: 'field.calories', kind: 'int' },
    { key: 'time', label: 'field.time', kind: 'time' },
  ],
};

const num = (v) => {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : null;
};

export function parseEntry(type, raw) {
  if (!raw.date) return null;
  const date = raw.date;
  if (type === 'carry') {
    const weight = num(raw.weight);
    const distance = num(raw.distance);
    if (!(weight > 0) || !(distance > 0)) return null;
    return { date, weight, distance };
  }
  if (type === 'gymnastics') {
    const reps = num(raw.reps);
    const modality = raw.modality === 'accumulated' ? 'accumulated' : 'unbroken';
    if (!(reps > 0)) return null;
    if (modality === 'accumulated') {
      const time = parseTime(raw.time);
      if (!(time > 0)) return null;
      return { date, reps, modality, time };
    }
    return { date, reps, modality };
  }
  if (type === 'cardio') {
    const time = parseTime(raw.time);
    if (!(time > 0)) return null;
    const distance = num(raw.distance);
    const calories = num(raw.calories);
    if (!(distance > 0) && !(calories > 0)) return null;
    const out = { date, time };
    if (distance > 0) out.distance = distance;
    if (calories > 0) out.calories = calories;
    return out;
  }
  // default: strength
  const weight = num(raw.weight);
  const reps = num(raw.reps);
  if (!(weight > 0) || !(reps > 0)) return null;
  return { date, weight, reps };
}
