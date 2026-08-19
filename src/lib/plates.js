export const DEFAULT_PLATES = [
  { id: 'p25', weight: 25, color: '#8e1f1a', droppable: true },
  { id: 'p20', weight: 20, color: '#2f7ad6', droppable: true },
  { id: 'p15', weight: 15, color: '#e6b800', droppable: true },
  { id: 'p10', weight: 10, color: '#2e9e5b', droppable: true },
  { id: 'p5', weight: 5, color: '#6b7177', droppable: false },
  { id: 'p2_5', weight: 2.5, color: '#d33b34', droppable: false },
  { id: 'p1_5', weight: 1.5, color: '#f3e79b', droppable: false },
];

// Compare two candidate combos: fewer non-droppable first, then fewer total.
function better(a, b) {
  if (!b) return true;
  if (a.nonDrop !== b.nonDrop) return a.nonDrop < b.nonDrop;
  return a.count < b.count;
}

// Closest-loadable plate breakdown per side, preferring big bumpers (fewer
// non-droppable plates), then fewer plates overall.
// Returns { perSide: number[], loaded: number, exact: boolean }.
export function breakdown(targetWeight, barWeight, plates) {
  if (targetWeight <= barWeight || !plates.length) {
    return { perSide: [], loaded: barWeight, exact: targetWeight === barWeight };
  }
  const perSideTarget = (targetWeight - barWeight) / 2;
  // Work in 0.5 kg units to keep integers (handles 1.5 / 2.5).
  const U = 2;
  const target = Math.round(perSideTarget * U);
  const items = plates.map((p) => ({ u: Math.round(p.weight * U), weight: p.weight, droppable: p.droppable }));
  const maxU = Math.max(...items.map((i) => i.u));
  const cap = target + maxU; // allow overshoot by up to one plate
  // best[s] = { combo: number[], count, nonDrop } reaching sum s, or null
  const best = new Array(cap + 1).fill(null);
  best[0] = { combo: [], count: 0, nonDrop: 0 };
  for (let s = 1; s <= cap; s += 1) {
    for (const it of items) {
      if (it.u <= s && best[s - it.u]) {
        const prev = best[s - it.u];
        const cand = {
          combo: [...prev.combo, it.weight],
          count: prev.count + 1,
          nonDrop: prev.nonDrop + (it.droppable ? 0 : 1),
        };
        if (better(cand, best[s])) best[s] = cand;
      }
    }
  }
  // Score each reachable sum: distance-to-target plus a per-plate penalty, so we
  // never stack many tiny plates to shave a fraction (e.g. 18x1.5 to hit 27 kg).
  // Tie-break: fewer non-droppable plates, then fewer total, then lower sum.
  const score = (s) => Math.abs(s - target) + best[s].count;
  let bestS = -1;
  for (let s = 0; s <= cap; s += 1) {
    if (!best[s]) continue;
    if (bestS === -1) { bestS = s; continue; }
    const sc = score(s);
    const scBest = score(bestS);
    if (sc < scBest
      || (sc === scBest && best[s].nonDrop < best[bestS].nonDrop)
      || (sc === scBest && best[s].nonDrop === best[bestS].nonDrop && best[s].count < best[bestS].count)
      || (sc === scBest && best[s].nonDrop === best[bestS].nonDrop && best[s].count === best[bestS].count && s < bestS)) {
      bestS = s;
    }
  }
  const chosen = best[bestS];
  const loaded = barWeight + (2 * bestS) / U;
  return {
    perSide: [...chosen.combo].sort((a, b) => b - a),
    loaded,
    exact: loaded === targetWeight,
  };
}
