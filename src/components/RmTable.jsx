import { buildRmTable } from '../lib/oneRm';
import { breakdown } from '../lib/plates';
import { t } from '../lib/i18n';
import PlateChips from './PlateChips';

export default function RmTable({ oneRm, max = 16, showPlates = false, bar = 20, plates = [] }) {
  const rows = buildRmTable(oneRm, max);
  return (
    <table>
      <thead>
        <tr><th>RM</th><th>{t('table.weight')}</th>{showPlates && <th>{t('table.platesSide')}</th>}</tr>
      </thead>
      <tbody>
        {rows.map((r) => {
          const b = showPlates ? breakdown(r.weight, bar, plates) : null;
          return (
            <tr key={r.rm}>
              <td>{r.rm}RM</td>
              <td>{b && !b.exact ? `≈${b.loaded.toFixed(1)}` : r.weight.toFixed(1)}</td>
              {showPlates && <td><PlateChips perSide={b.perSide} plates={plates} /></td>}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
