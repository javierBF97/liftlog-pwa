import { estimate1RM } from './oneRm';
import { t } from './i18n';

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
    return `${t('pill.max')} ${Math.max(...entries.map((e) => e.weight))} kg`;
  }
  if (type === 'gymnastics') {
    const unbroken = entries.filter((e) => e.modality === 'unbroken').map((e) => e.reps);
    if (unbroken.length) return `${Math.max(...unbroken)} unbroken`;
    return `${Math.max(...entries.map((e) => e.reps))} reps`;
  }
  if (type === 'cardio') {
    const paces = entries.filter((e) => e.distance && e.time).map((e) => pacePerKm(e.distance, e.time));
    if (paces.length) return `${t('pill.best')} ${formatTime(Math.min(...paces))} /km`;
    const powers = entries.filter((e) => e.calories && e.time).map((e) => powerCalMin(e.calories, e.time));
    if (powers.length) return `${t('pill.best')} ${Math.round(Math.max(...powers))} cal/min`;
    return null;
  }
  const last = lastByDate(entries);
  return `e1RM ${Math.round(estimate1RM(last.weight, last.reps))} kg`;
}

export function metricGrande(exercise) {
  const { type = 'strength', entries } = exercise;
  if (!entries.length) return null;
  if (type === 'carry') {
    return { label: t('metric.maxWeight'), value: `${Math.max(...entries.map((e) => e.weight))} kg` };
  }
  if (type === 'gymnastics') {
    const ub = entries.filter((e) => e.modality === 'unbroken').map((e) => e.reps);
    if (ub.length) return { label: t('metric.unbrokenRecord'), value: `${Math.max(...ub)} reps` };
    return { label: t('metric.maxReps'), value: `${Math.max(...entries.map((e) => e.reps))} reps` };
  }
  if (type === 'cardio') {
    const paces = entries.filter((e) => e.distance && e.time).map((e) => pacePerKm(e.distance, e.time));
    if (paces.length) return { label: t('metric.bestPace'), value: `${formatTime(Math.min(...paces))} /km` };
    const powers = entries.filter((e) => e.calories && e.time).map((e) => powerCalMin(e.calories, e.time));
    if (powers.length) return { label: t('metric.bestPower'), value: `${Math.round(Math.max(...powers))} cal/min` };
    return null;
  }
  const last = lastByDate(entries);
  return { label: t('metric.e1rm'), value: `${Math.round(estimate1RM(last.weight, last.reps))} kg` };
}

export function chartMetrics(type) {
  if (type === 'carry') {
    return [
      { key: 'weight', label: t('chart.weight'), valueOf: (e) => e.weight },
      { key: 'volume', label: t('chart.volume'), valueOf: (e) => e.weight * e.distance },
    ];
  }
  if (type === 'gymnastics') {
    return [
      { key: 'unbroken', label: t('modality.unbroken'), valueOf: (e) => (e.modality === 'unbroken' ? e.reps : null) },
      { key: 'time', label: t('chart.time'), valueOf: (e) => (e.modality === 'accumulated' ? e.time : null), fmt: formatTime },
    ];
  }
  if (type === 'cardio') {
    return [
      { key: 'rate', label: t('chart.rate'), valueOf: (e) => (e.distance ? pacePerKm(e.distance, e.time) : powerCalMin(e.calories, e.time)), fmt: formatTime },
      { key: 'time', label: t('chart.time'), valueOf: (e) => e.time, fmt: formatTime },
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
  const h = (k) => t(`h.${k}`);
  if (type === 'carry') return [h('date'), h('weight'), h('distance')];
  if (type === 'gymnastics') return [h('date'), h('reps'), h('modality'), h('time')];
  if (type === 'cardio') return [h('date'), h('distance'), h('calories'), h('time')];
  return [h('date'), h('weight'), h('reps')];
}

export function historyCells(type, e) {
  if (type === 'carry') return [e.date, `${e.weight} kg`, `${e.distance} m`];
  if (type === 'gymnastics') {
    return [e.date, `${e.reps}`, e.modality === 'unbroken' ? t('modality.unbroken') : t('h.accum'), e.modality === 'accumulated' ? formatTime(e.time) : '—'];
  }
  if (type === 'cardio') {
    return [e.date, e.distance ? `${e.distance} m` : '—', e.calories ? `${e.calories} cal` : '—', formatTime(e.time)];
  }
  return [e.date, `${e.weight} kg`, `${e.reps}`];
}
