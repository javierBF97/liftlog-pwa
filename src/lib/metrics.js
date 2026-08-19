import { estimate1RM } from './oneRm';

export function parseTime(str) {
  if (typeof str !== 'string') return null;
  const t = str.trim();
  if (t === '') return null;
  if (t.includes(':')) {
    const [m, s] = t.split(':');
    const mm = parseInt(m, 10);
    const ss = parseInt(s, 10);
    if (Number.isNaN(mm) || Number.isNaN(ss)) return null;
    return mm * 60 + ss;
  }
  const n = parseInt(t, 10);
  return Number.isNaN(n) ? null : n;
}

export function formatTime(sec) {
  if (sec == null || Number.isNaN(sec)) return '';
  const s = Math.round(sec);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, '0')}`;
}

export const carryVolume = (weight, distance) => weight * distance;

export function pacePerKm(distanceM, timeS) {
  if (!distanceM || !timeS) return null;
  return timeS / (distanceM / 1000);
}

export function powerCalMin(calories, timeS) {
  if (!calories || !timeS) return null;
  return calories / (timeS / 60);
}

const lastByDate = (entries) => [...entries].sort((a, b) => a.date.localeCompare(b.date)).at(-1);

export function pillText(exercise) {
  const { type = 'strength', entries } = exercise;
  if (!entries.length) return null;
  if (type === 'carry') {
    return `máx ${Math.max(...entries.map((e) => e.weight))} kg`;
  }
  if (type === 'gymnastics') {
    const unbroken = entries.filter((e) => e.modality === 'unbroken').map((e) => e.reps);
    if (unbroken.length) return `${Math.max(...unbroken)} unbroken`;
    return `${Math.max(...entries.map((e) => e.reps))} reps`;
  }
  if (type === 'cardio') {
    const paces = entries.filter((e) => e.distance && e.time).map((e) => pacePerKm(e.distance, e.time));
    if (paces.length) return `mejor ${formatTime(Math.min(...paces))} /km`;
    const powers = entries.filter((e) => e.calories && e.time).map((e) => powerCalMin(e.calories, e.time));
    if (powers.length) return `mejor ${Math.round(Math.max(...powers))} cal/min`;
    return null;
  }
  const last = lastByDate(entries);
  return `e1RM ${Math.round(estimate1RM(last.weight, last.reps))} kg`;
}

export function metricGrande(exercise) {
  const { type = 'strength', entries } = exercise;
  if (!entries.length) return null;
  if (type === 'carry') {
    return { label: 'Peso máximo', value: `${Math.max(...entries.map((e) => e.weight))} kg` };
  }
  if (type === 'gymnastics') {
    const ub = entries.filter((e) => e.modality === 'unbroken').map((e) => e.reps);
    if (ub.length) return { label: 'Récord unbroken', value: `${Math.max(...ub)} reps` };
    return { label: 'Máximo reps', value: `${Math.max(...entries.map((e) => e.reps))} reps` };
  }
  if (type === 'cardio') {
    const paces = entries.filter((e) => e.distance && e.time).map((e) => pacePerKm(e.distance, e.time));
    if (paces.length) return { label: 'Mejor ritmo', value: `${formatTime(Math.min(...paces))} /km` };
    const powers = entries.filter((e) => e.calories && e.time).map((e) => powerCalMin(e.calories, e.time));
    if (powers.length) return { label: 'Mejor potencia', value: `${Math.round(Math.max(...powers))} cal/min` };
    return null;
  }
  const last = lastByDate(entries);
  return { label: '1RM estimado', value: `${Math.round(estimate1RM(last.weight, last.reps))} kg` };
}

export function chartMetrics(type) {
  if (type === 'carry') {
    return [
      { key: 'weight', label: 'Peso', valueOf: (e) => e.weight },
      { key: 'volume', label: 'Volumen', valueOf: (e) => e.weight * e.distance },
    ];
  }
  if (type === 'gymnastics') {
    return [
      { key: 'unbroken', label: 'Unbroken', valueOf: (e) => (e.modality === 'unbroken' ? e.reps : null) },
      { key: 'time', label: 'Tiempo', valueOf: (e) => (e.modality === 'accumulated' ? e.time : null), fmt: formatTime },
    ];
  }
  if (type === 'cardio') {
    return [
      { key: 'rate', label: 'Ritmo·Potencia', valueOf: (e) => (e.distance ? pacePerKm(e.distance, e.time) : powerCalMin(e.calories, e.time)), fmt: formatTime },
      { key: 'time', label: 'Tiempo', valueOf: (e) => e.time, fmt: formatTime },
    ];
  }
  return [{ key: 'e1rm', label: 'e1RM', valueOf: (e) => Math.round(estimate1RM(e.weight, e.reps)) }];
}

export function chartSeries(exercise, metricKey) {
  const metrics = chartMetrics(exercise.type || 'strength');
  const metric = metrics.find((m) => m.key === metricKey) ?? metrics[0];
  return [...exercise.entries]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((e) => ({ date: e.date, value: metric.valueOf(e) }))
    .filter((p) => p.value != null);
}

export function historyHeaders(type) {
  if (type === 'carry') return ['Fecha', 'Peso', 'Distancia'];
  if (type === 'gymnastics') return ['Fecha', 'Reps', 'Modalidad', 'Tiempo'];
  if (type === 'cardio') return ['Fecha', 'Distancia', 'Calorías', 'Tiempo'];
  return ['Fecha', 'Peso', 'Reps'];
}

export function historyCells(type, e) {
  if (type === 'carry') return [e.date, `${e.weight} kg`, `${e.distance} m`];
  if (type === 'gymnastics') {
    return [e.date, `${e.reps}`, e.modality === 'unbroken' ? 'Unbroken' : 'Acum.', e.modality === 'accumulated' ? formatTime(e.time) : '—'];
  }
  if (type === 'cardio') {
    return [e.date, e.distance ? `${e.distance} m` : '—', e.calories ? `${e.calories} cal` : '—', formatTime(e.time)];
  }
  return [e.date, `${e.weight} kg`, `${e.reps}`];
}
