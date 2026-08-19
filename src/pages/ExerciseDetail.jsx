import { useState, lazy, Suspense } from 'react';
import { estimate1RM } from '../lib/oneRm';
import { getLastEntry, loadBar, saveBar } from '../lib/storage';
import PercentTable from '../components/PercentTable';
import RmTable from '../components/RmTable';
import { IconPlus, IconBack, IconCalendar, IconEdit, IconTrash, IconCheck, IconX, IconSettings } from '../components/icons';
import { metricGrande, chartMetrics, chartSeries, historyHeaders, historyCells } from '../lib/metrics';
import { emojiFor } from '../lib/types';
import { t } from '../lib/i18n';
import EntryFields from '../components/EntryFields';

const OneRmChart = lazy(() => import('../components/OneRmChart'));
const MetricChart = lazy(() => import('../components/MetricChart'));

export default function ExerciseDetail({
  exercise, onBack, onAddEntry,
  onDeleteEntry = () => {}, onUpdateEntry = () => {},
  onRename = () => {}, onDelete = () => {},
  plates = [],
}) {
  const [adding, setAdding] = useState(false);
  const [mode, setMode] = useState('pct');
  const [showDates, setShowDates] = useState(false);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [editId, setEditId] = useState(null);
  const [editEntry, setEditEntry] = useState(null);
  const [confirmDelId, setConfirmDelId] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState('');
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [showPlates, setShowPlates] = useState(false);
  const [bar, setBar] = useState(loadBar);
  const [chartKey, setChartKey] = useState(null);

  const isStrength = exercise.type === 'strength' || !exercise.type;

  function submitName(e) {
    e.preventDefault();
    if (!nameDraft.trim()) return;
    onRename(nameDraft.trim());
    setEditingName(false);
    setMenuOpen(false);
  }

  function startEdit(e) {
    setConfirmDelId(null);
    setEditId(e.id);
    setEditEntry(e);
  }
  function saveEdit() {
    if (!editEntry) return;
    onUpdateEntry(editId, editEntry);
    setEditId(null);
  }

  const editing = editId ? exercise.entries.find((e) => e.id === editId) : null;
  const editInitial = editing && {
    date: editing.date,
    weight: editing.weight != null ? String(editing.weight) : undefined,
    reps: editing.reps != null ? String(editing.reps) : undefined,
    distance: editing.distance != null ? String(editing.distance) : undefined,
    calories: editing.calories != null ? String(editing.calories) : undefined,
    modality: editing.modality,
    time: editing.time != null ? `${Math.floor(editing.time / 60)}:${String(editing.time % 60).padStart(2, '0')}` : undefined,
  };

  const last = getLastEntry(exercise);
  const oneRm = last ? estimate1RM(last.weight, last.reps) : null;
  const hasData = exercise.entries.length > 0;
  const mg = hasData ? metricGrande(exercise) : null;

  const sorted = [...exercise.entries].sort((a, b) => b.date.localeCompare(a.date));
  const rangeActive = from || to;
  const history = rangeActive
    ? sorted.filter((e) => (!from || e.date >= from) && (!to || e.date <= to))
    : sorted.slice(0, 3);

  const addSection = adding ? (
    <AddEntryForm type={exercise.type} onCancel={() => setAdding(false)} onSave={(entry) => { onAddEntry(entry); setAdding(false); }} />
  ) : (
    <button className="btn primary" style={{ width: '100%', justifyContent: 'center', marginBottom: 12 }} onClick={() => setAdding(true)}>
      <IconPlus size={16} />{t('btn.addRecord')}
    </button>
  );

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button className="btn icon-btn" aria-label={t('detail.back')} onClick={onBack}><IconBack size={18} /></button>
          <h1 style={{ margin: 0 }}><span style={{ marginRight: 8 }}>{emojiFor(exercise.type)}</span>{exercise.name}</h1>
        </div>
        <button className={menuOpen ? 'icon-btn accent' : 'icon-btn'} aria-label={t('log.settings')} onClick={() => setMenuOpen((v) => !v)}><IconSettings size={18} /></button>
      </div>

      {menuOpen && (
        <div className="metric" style={{ marginBottom: 12, padding: 6 }}>
          {editingName ? (
            <form onSubmit={submitName} style={{ padding: 8 }}>
              <label className="field">{t('field.name')}
                <input value={nameDraft} onChange={(e) => setNameDraft(e.target.value)} autoFocus />
              </label>
              <button className="btn primary" type="submit">{t('btn.save')}</button>{' '}
              <button className="btn" type="button" onClick={() => setEditingName(false)}>{t('btn.cancel')}</button>
            </form>
          ) : confirmingDelete ? (
            <div style={{ padding: 10 }}>
              <p style={{ margin: '0 0 10px' }}>{t('detail.deleteQuestion', { name: exercise.name })}</p>
              <button className="btn" style={{ background: 'var(--danger)', color: '#fff', border: 'none' }} onClick={onDelete}>{t('detail.yesDelete')}</button>{' '}
              <button className="btn" type="button" onClick={() => setConfirmingDelete(false)}>{t('btn.cancel')}</button>
            </div>
          ) : (
            <>
              <button className="settings-row" onClick={() => { setNameDraft(exercise.name); setEditingName(true); }}>
                <span className="settings-ic"><IconEdit size={18} /></span>
                <span className="settings-title">{t('detail.editName')}</span>
              </button>
              <button className="settings-row" onClick={() => setConfirmingDelete(true)}>
                <span className="settings-ic" style={{ background: 'var(--danger-soft)', color: 'var(--danger)' }}><IconTrash size={18} /></span>
                <span className="settings-title">{t('detail.deleteExercise')}</span>
              </button>
            </>
          )}
        </div>
      )}

      {mg && (
        <div className="metric" style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>{mg.label}</div>
          <div style={{ fontSize: 26, fontWeight: 600 }}>{mg.value}</div>
        </div>
      )}

      {hasData && isStrength && (
        <>
          <div className="metric" style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 8 }}>{t('detail.e1rmHistory')}</div>
            {exercise.entries.length >= 2 ? (
              <Suspense fallback={<div style={{ height: 220 }} />}>
                <OneRmChart entries={exercise.entries} />
              </Suspense>
            ) : (
              <p className="muted-sm" style={{ margin: 0 }}>{t('detail.trend')}</p>
            )}
          </div>

          {addSection}

          <div className="metric" style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
              <div className="segmented">
                <button className={mode === 'pct' ? 'seg active' : 'seg'} onClick={() => setMode('pct')}>%</button>
                <button className={mode === 'rm' ? 'seg active' : 'seg'} onClick={() => setMode('rm')}>RM</button>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center', marginBottom: 10, flexWrap: 'wrap' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--muted)' }}>
                <input type="checkbox" checked={showPlates} onChange={(e) => setShowPlates(e.target.checked)} /> {t('calc.plates')}
              </label>
              {showPlates && (
                <span style={{ display: 'inline-flex', gap: 6 }}>
                  <button className={bar === 20 ? 'chip on' : 'chip'} onClick={() => { setBar(20); saveBar(20); }}>20</button>
                  <button className={bar === 15 ? 'chip on' : 'chip'} onClick={() => { setBar(15); saveBar(15); }}>15</button>
                </span>
              )}
            </div>
            {mode === 'pct'
              ? <PercentTable oneRm={oneRm} showPlates={showPlates} bar={bar} plates={plates} />
              : <RmTable oneRm={oneRm} max={12} showPlates={showPlates} bar={bar} plates={plates} />}
          </div>
        </>
      )}

      {hasData && !isStrength && (() => {
        const metrics = chartMetrics(exercise.type);
        const activeKey = chartKey ?? metrics[0].key;
        const data = chartSeries(exercise, activeKey);
        return (
          <>
            <div className="metric" style={{ marginBottom: 12 }}>
              {metrics.length > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
                  <div className="segmented">
                    {metrics.map((m) => (
                      <button key={m.key} className={activeKey === m.key ? 'seg active' : 'seg'} onClick={() => setChartKey(m.key)}>{m.label}</button>
                    ))}
                  </div>
                </div>
              )}
              {data.length >= 2 ? (
                <Suspense fallback={<div style={{ height: 220 }} />}><MetricChart data={data} /></Suspense>
              ) : (
                <p className="muted-sm" style={{ margin: 0 }}>{t('detail.trend')}</p>
              )}
            </div>
            {addSection}
          </>
        );
      })()}

      {!hasData && (
        <>
          <p>{t('detail.noRecords')}</p>
          {addSection}
        </>
      )}

      <div className="metric">
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
          <button className="btn" onClick={() => setShowDates((v) => !v)}><IconCalendar size={16} />{t('detail.dates')}</button>
        </div>

        {showDates && (
          <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
            <label className="field" style={{ flex: 1 }}>{t('detail.from')}
              <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
            </label>
            <label className="field" style={{ flex: 1 }}>{t('detail.to')}
              <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
            </label>
          </div>
        )}

        {editing && (
          <form onSubmit={(e) => { e.preventDefault(); saveEdit(); }} className="metric" style={{ marginBottom: 12 }}>
            <EntryFields key={editId} type={exercise.type} initial={editInitial} onChange={setEditEntry} />
            <button className="btn primary" type="submit">{t('btn.save')}</button>{' '}
            <button className="btn" type="button" onClick={() => setEditId(null)}>{t('btn.cancel')}</button>
          </form>
        )}

        <table>
          <thead><tr>{historyHeaders(exercise.type || 'strength').map((h) => <th key={h}>{h}</th>)}<th aria-label={t('detail.actions')} /></tr></thead>
          <tbody>
            {history.map((e) => (
              <tr key={e.id}>
                {historyCells(exercise.type || 'strength', e).map((c, i) => <td key={i}>{c}</td>)}
                <td>
                  <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                    {confirmDelId === e.id ? (
                      <>
                        <button className="act del" aria-label={t('detail.confirmDelete')} onClick={() => { onDeleteEntry(e.id); setConfirmDelId(null); }}><IconCheck size={15} /></button>
                        <button className="act edit" aria-label={t('btn.cancel')} onClick={() => setConfirmDelId(null)}><IconX size={15} /></button>
                      </>
                    ) : (
                      <>
                        <button className="act edit" aria-label={t('detail.edit')} onClick={() => startEdit(e)}><IconEdit size={15} /></button>
                        <button className="act del" aria-label={t('detail.delete')} onClick={() => { setEditId(null); setConfirmDelId(e.id); }}><IconTrash size={15} /></button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AddEntryForm({ type, onSave, onCancel }) {
  const [entry, setEntry] = useState(null);
  function submit(e) {
    e.preventDefault();
    if (!entry) return;
    onSave(entry);
  }
  return (
    <form onSubmit={submit} className="metric" style={{ marginBottom: 12 }}>
      <EntryFields type={type} onChange={setEntry} />
      <button className="btn primary" type="submit">{t('btn.saveRecord')}</button>{' '}
      <button className="btn" type="button" onClick={onCancel}>{t('btn.cancel')}</button>
    </form>
  );
}
