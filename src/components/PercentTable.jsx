import { buildPercentTable } from '../lib/oneRm';
import { breakdown } from '../lib/plates';
import PlateChips from './PlateChips';

export default function PercentTable({ oneRm, showPlates = false, bar = 20, plates = [] }) {
  const rows = buildPercentTable(oneRm);
  return (
    <table>
      <thead>
        <tr><th>%</th><th>Peso (kg)</th>{showPlates && <th>Discos /lado</th>}</tr>
      </thead>
      <tbody>
        {rows.map((r) => {
          const b = showPlates ? breakdown(r.weight, bar, plates) : null;
          return (
            <tr key={r.pct}>
              <td>{r.pct}%</td>
              <td>{b && !b.exact ? `≈${b.loaded.toFixed(1)}` : r.weight.toFixed(1)}</td>
              {showPlates && <td><PlateChips perSide={b.perSide} plates={plates} /></td>}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
