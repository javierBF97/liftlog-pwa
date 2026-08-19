import { parseTime } from './metrics';

export const TYPE_FIELDS = {
  strength: [
    { key: 'weight', label: 'Peso (kg)', kind: 'number' },
    { key: 'reps', label: 'Reps', kind: 'int' },
  ],
  carry: [
    { key: 'weight', label: 'Peso (kg)', kind: 'number' },
    { key: 'distance', label: 'Distancia (m)', kind: 'number' },
  ],
  gymnastics: [
    { key: 'reps', label: 'Reps', kind: 'int' },
    { key: 'modality', label: 'Modalidad', kind: 'modality' },
    { key: 'time', label: 'Tiempo (mm:ss)', kind: 'time', showIf: (raw) => raw.modality === 'accumulated' },
  ],
  cardio: [
    { key: 'distance', label: 'Distancia (m)', kind: 'number' },
    { key: 'calories', label: 'Calorías', kind: 'int' },
    { key: 'time', label: 'Tiempo (mm:ss)', kind: 'time' },
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
