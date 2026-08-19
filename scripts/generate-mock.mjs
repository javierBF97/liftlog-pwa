import { randomUUID } from 'node:crypto';
import { writeFileSync } from 'node:fs';

// Today is 2026-06-16; generate ~3 months of history.
const END = new Date('2026-06-16T00:00:00Z');
const START = new Date(END);
START.setUTCMonth(START.getUTCMonth() - 3); // 2026-03-16

// name + approximate starting "top set" weight (kg) + reps scheme + monthly gain (kg)
const EXERCISES = [
  ['Back Squat', 100, [3, 5], 7],
  ['Front Squat', 80, [3, 5], 6],
  ['Overhead Squat', 55, [2, 3, 5], 4],
  ['Deadlift', 140, [1, 3, 5], 8],
  ['Sumo Deadlift', 130, [3, 5], 7],
  ['Romanian Deadlift', 100, [5, 8], 5],
  ['Power Clean', 75, [2, 3], 5],
  ['Hang Power Clean', 70, [2, 3], 4],
  ['Squat Clean', 85, [1, 2, 3], 5],
  ['Clean and Jerk', 80, [1, 2], 4],
  ['Power Snatch', 55, [2, 3], 3],
  ['Hang Snatch', 50, [2, 3], 3],
  ['Squat Snatch', 60, [1, 2], 3],
  ['Push Press', 70, [3, 5], 4],
  ['Push Jerk', 80, [2, 3], 4],
  ['Split Jerk', 85, [1, 2, 3], 4],
  ['Strict Press', 50, [3, 5], 3],
  ['Bench Press', 90, [3, 5], 5],
  ['Thruster', 60, [3, 5], 4],
  ['Front Rack Lunge', 70, [5, 8], 4],
  ['Back Rack Lunge', 80, [5, 8], 4],
  ['Weighted Pull-up', 20, [3, 5], 3],
  ['Bent Over Row', 70, [5, 8], 4],
  ['Hip Thrust', 120, [5, 8], 8],
  ['Good Morning', 60, [5, 8], 3],
];

// Simple seeded RNG so the dataset is reproducible.
let seed = 20260616;
function rand() {
  seed = (seed * 1103515245 + 12345) & 0x7fffffff;
  return seed / 0x7fffffff;
}
const pick = (arr) => arr[Math.floor(rand() * arr.length)];
const round2_5 = (x) => Math.round(x / 2.5) * 2.5;

const totalDays = Math.round((END - START) / 86400000); // ~92

function buildEntries(base, reps, gainPerMonth) {
  // 1–2 sessions per week, on distinct days.
  const sessions = 12 + Math.floor(rand() * 6); // 12–17
  const days = new Set();
  while (days.size < sessions) days.add(Math.floor(rand() * (totalDays + 1)));
  const sortedDays = [...days].sort((a, b) => a - b);

  return sortedDays.map((dayOffset) => {
    const d = new Date(START);
    d.setUTCDate(d.getUTCDate() + dayOffset);
    const date = d.toISOString().slice(0, 10);

    const monthsIn = dayOffset / 30;
    const trend = base + gainPerMonth * monthsIn;
    const noise = (rand() - 0.5) * 0.06 * base; // ±3%
    const weight = Math.max(20, round2_5(trend + noise));

    return { id: randomUUID(), date, weight, reps: pick(reps) };
  });
}

const exercises = EXERCISES.map(([name, base, reps, gain]) => {
  const entries = buildEntries(base, reps, gain);
  const createdAt = new Date(START);
  createdAt.setUTCDate(createdAt.getUTCDate() - 1);
  return { id: randomUUID(), name, createdAt: createdAt.toISOString(), entries };
});

const state = { version: 1, exercises };
const out = new URL('../mock-data.json', import.meta.url);
writeFileSync(out, JSON.stringify(state, null, 2));

const totalEntries = exercises.reduce((n, e) => n + e.entries.length, 0);
console.log(`Wrote ${exercises.length} exercises, ${totalEntries} entries to mock-data.json`);
