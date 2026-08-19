import { randomUUID } from 'node:crypto';
import { writeFileSync } from 'node:fs';

const NAMES = [
  // Squat
  'Back Squat', 'Front Squat', 'Overhead Squat', 'Box Squat', 'Pause Squat', 'Goblet Squat', 'Zercher Squat',
  // Hinge / deadlift
  'Deadlift', 'Sumo Deadlift', 'Romanian Deadlift', 'Deficit Deadlift', 'Snatch-Grip Deadlift', 'Stiff-Leg Deadlift', 'Good Morning', 'Hip Thrust', 'Glute Bridge',
  // Snatch
  'Snatch', 'Power Snatch', 'Hang Snatch', 'Hang Power Snatch', 'Muscle Snatch', 'Snatch Balance', 'Snatch Pull', 'Snatch High Pull',
  // Clean
  'Clean', 'Power Clean', 'Hang Clean', 'Hang Power Clean', 'Muscle Clean', 'Clean Pull', 'Clean High Pull', 'Clean and Jerk', 'Power Clean and Jerk',
  // Press / jerk
  'Push Press', 'Push Jerk', 'Split Jerk', 'Strict Press', 'Bench Press', 'Close-Grip Bench Press', 'Incline Bench Press', 'Z-Press', 'Behind-the-Neck Press',
  // Thruster / lunge
  'Thruster', 'Front Rack Lunge', 'Back Rack Lunge', 'Overhead Lunge', 'Walking Lunge', 'Bulgarian Split Squat', 'Weighted Step-up', 'Sandbag Clean',
  // Pull / row / weighted gymnastics
  'Bent Over Row', 'Pendlay Row', 'Weighted Pull-up', 'Weighted Chin-up', 'Weighted Dip',
  // Dumbbell
  'Dumbbell Snatch', 'Dumbbell Clean and Jerk', 'Dumbbell Thruster', 'Dumbbell Push Press', 'Dumbbell Bench Press', 'Dumbbell Row', 'Dumbbell Lunge', 'Dumbbell Front Squat', 'Devil Press', 'Dumbbell Box Step-up',
  // Kettlebell
  'Kettlebell Swing', 'Kettlebell Goblet Squat', 'Kettlebell Snatch', 'Kettlebell Clean', 'Kettlebell Clean and Jerk', 'Turkish Get-up', 'Kettlebell Deadlift',
  // Loaded ball
  'Wall Ball', 'Medicine Ball Clean',
];

const now = new Date().toISOString();
const exercises = NAMES.map((name) => ({
  id: randomUUID(),
  name,
  createdAt: now,
  entries: [],
}));

const state = { version: 1, exercises };
const out = new URL('../crossfit-base.json', import.meta.url);
writeFileSync(out, JSON.stringify(state, null, 2));
console.log(`Wrote ${exercises.length} base exercises to crossfit-base.json`);
