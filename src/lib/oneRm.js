// Brzycki formula: 1RM = weight * 36 / (37 - reps). Unlike Epley it returns
// the weight itself at one rep, so an estimate never exceeds a lifted single.
// It also breaks down as reps approach 37, hence the cap: past 10 reps no
// formula is reliable, and 10 is where Brzycki and Epley agree.
const MAX_MODELLED_REPS = 10;

const modelled = (reps) => Math.min(reps, MAX_MODELLED_REPS);

export function estimate1RM(weight, reps) {
  return (weight * 36) / (37 - modelled(reps));
}

// Inverse Brzycki: weight liftable for n reps given a 1RM
export function weightForRM(oneRm, n) {
  return (oneRm * (37 - modelled(n))) / 36;
}

// % table from 105% down to 30% in 5% steps (16 rows)
export function buildPercentTable(oneRm, { start = 105, end = 30, step = 5 } = {}) {
  const rows = [];
  for (let pct = start; pct >= end; pct -= step) {
    rows.push({ pct, weight: oneRm * (pct / 100) });
  }
  return rows;
}

// 1RM..maxRM table
export function buildRmTable(oneRm, max = 16) {
  const rows = [];
  for (let n = 1; n <= max; n += 1) {
    rows.push({ rm: n, weight: weightForRM(oneRm, n) });
  }
  return rows;
}
