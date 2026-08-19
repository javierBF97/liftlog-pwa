import { useState } from 'react';
import {
  loadState, saveState, addEntry, addRecord,
  exportJSON, importJSON, deleteEntry, updateEntry,
  renameExercise, deleteExercise, findExerciseByName, exercisesByRecent,
} from '../lib/storage';
import { pillText } from '../lib/metrics';
import { emojiFor } from '../lib/types';
import { t, getLang, setLang, LANGS } from '../lib/i18n';
import { IconPlus, IconSearch, IconSettings, IconDownload, IconUpload } from '../components/icons';
import ExerciseDetail from './ExerciseDetail';
import EntryFields from '../components/EntryFields';
import TypeSelector from '../components/TypeSelector';

export default function ExercisesPage() {
  const [state, setState] = useState(loadState);
  const [openId, setOpenId] = useState(null);
  const [panel, setPanel] = useState(null); // 'search' | 'settings' | 'add' | null
  const [quickAddId, setQuickAddId] = useState(null);
  const [query, setQuery] = useState('');

  function persist(next) {
    setState(next);
    saveState(next);
  }
  function persistWith(fn) {
    setState((prev) => {
      const next = fn(prev);
      saveState(next);
      return next;
    });
  }

  if (openId) {
    const exercise = state.exercises.find((e) => e.id === openId);
    return (
      <ExerciseDetail
        exercise={exercise}
        onBack={() => setOpenId(null)}
        onAddEntry={(entry) => persistWith((prev) => addEntry(prev, openId, entry))}
        onDeleteEntry={(entryId) => persistWith((prev) => deleteEntry(prev, openId, entryId))}
        onUpdateEntry={(entryId, patch) => persistWith((prev) => updateEntry(prev, openId, entryId, patch))}
        onRename={(name) => {
          const dup = findExerciseByName(state, name);
          if (dup && dup.id !== openId) { alert(t('log.duplicate')); return; }
          persistWith((prev) => renameExercise(prev, openId, name));
        }}
        onDelete={() => { persistWith((prev) => deleteExercise(prev, openId)); setOpenId(null); }}
        plates={state.plates}
      />
    );
  }

  // Only one collapsible open at a time.
  function togglePanel(name) {
    setQuickAddId(null);
    setPanel((cur) => {
      const next = cur === name ? null : name;
      if (next !== 'search') setQuery('');
      return next;
    });
  }
  function toggleQuickAdd(id) {
    // Close the big "new record" form if it was open, but keep any active
    // search so the row the user tapped stays where it is.
    setPanel((cur) => (cur === 'add' ? null : cur));
    setQuickAddId((cur) => (cur === id ? null : id));
  }

  // With the search panel closed, only show exercises that already have
  // records; opening search reveals the full library (including "empty" ones)
  // so the user can find something to log for the first time.
  const filtered = exercisesByRecent(state).filter((ex) =>
    (panel === 'search' || ex.entries.length > 0)
    && ex.name.toLowerCase().includes(query.trim().toLowerCase())
  );
  const showEmptyHint = panel !== 'search' && state.exercises.length > 0 && filtered.length === 0;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <h1 style={{ margin: 0 }}>{t('log.title')}</h1>
        <button className={panel === 'settings' ? 'icon-btn accent' : 'icon-btn'} aria-label={t('log.settings')} onClick={() => togglePanel('settings')}>
          <IconSettings size={18} />
        </button>
      </div>

      {panel === 'settings' && (
        <BackupControls state={state} onImport={(s) => { persist(s); setPanel(null); }} />
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <button className={panel === 'search' ? 'icon-btn accent' : 'icon-btn'} aria-label={t('log.search')} onClick={() => togglePanel('search')}>
          <IconSearch size={18} />
        </button>
        <button className="btn primary fab" aria-label={t('log.newRecord')} onClick={() => togglePanel('add')}>
          <IconPlus size={20} />
        </button>
      </div>

      {panel === 'search' && (
        <input
          type="search"
          className="search"
          placeholder={t('log.searchPlaceholder')}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
      )}

      {panel === 'add' && (
        <AddRecordForm
          exercises={state.exercises}
          onCancel={() => setPanel(null)}
          onSave={(name, entry, type) => { persistWith((prev) => addRecord(prev, name, entry, type)); setPanel(null); }}
        />
      )}

      {showEmptyHint && <p className="muted-sm">{t('log.emptyHint')}</p>}

      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {filtered.map((ex) => {
          return (
            <li key={ex.id} style={{ marginBottom: 10 }}>
              <div className="ex-item">
                <button className="ex-open" onClick={() => setOpenId(ex.id)}>
                  <div className="ex-name">
                    <span style={{ marginRight: 8 }}>{emojiFor(ex.type)}</span>{ex.name}
                  </div>
                  {pillText(ex)
                    ? <span className="pill">{pillText(ex)}</span>
                    : <span className="muted-sm">{t('pill.noRecords')}</span>}
                </button>
                <button
                  className="icon-btn accent"
                  aria-label={t('log.addRecordTo', { name: ex.name })}
                  onClick={() => toggleQuickAdd(ex.id)}
                >
                  <IconPlus size={18} />
                </button>
              </div>
              {quickAddId === ex.id && (
                <LogForm
                  type={ex.type}
                  onCancel={() => setQuickAddId(null)}
                  onSave={(entry) => {
                    persistWith((prev) => addEntry(prev, ex.id, entry));
                    setQuickAddId(null);
                  }}
                />
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function AddRecordForm({ exercises, onSave, onCancel }) {
  const [name, setName] = useState('');
  const [type, setType] = useState('strength');
  const [entry, setEntry] = useState(null);

  const q = name.trim().toLowerCase();
  const exactMatch = exercises.find((ex) => ex.name.trim().toLowerCase() === q);
  const suggestions = q && !exactMatch
    ? exercises.filter((ex) => ex.name.toLowerCase().includes(q)).slice(0, 5)
    : [];
  const effectiveType = exactMatch ? exactMatch.type : type;

  function submit(e) {
    e.preventDefault();
    if (!name.trim() || !entry) return;
    onSave(name.trim(), entry, effectiveType);
  }

  return (
    <form onSubmit={submit} className="metric" style={{ marginBottom: 16 }}>
      <label className="field">{t('field.exercise')}
        <input value={name} onChange={(e) => setName(e.target.value)} autoFocus />
      </label>
      {suggestions.length > 0 && (
        <div className="suggestions">
          {suggestions.map((ex) => (
            <button type="button" key={ex.id} className="suggestion" onClick={() => setName(ex.name)}>
              {ex.name} <span style={{ color: 'var(--faint)', fontSize: 12 }}>{t('log.existing')}</span>
            </button>
          ))}
        </div>
      )}
      {!exactMatch && <TypeSelector value={type} onChange={setType} />}
      <EntryFields key={effectiveType} type={effectiveType} onChange={setEntry} />
      {name.trim() && (
        <p style={{ fontSize: 12, color: 'var(--faint)', margin: '0 0 12px' }}>
          {exactMatch ? t('log.willSave', { name: exactMatch.name }) : t('log.willCreate', { name: name.trim() })}
        </p>
      )}
      <button className="btn primary" type="submit">{t('btn.save')}</button>{' '}
      <button className="btn" type="button" onClick={onCancel}>{t('btn.cancel')}</button>
    </form>
  );
}

function LogForm({ type, onSave, onCancel }) {
  const [entry, setEntry] = useState(null);
  function submit(e) {
    e.preventDefault();
    if (!entry) return;
    onSave(entry);
  }
  return (
    <form onSubmit={submit} style={{ marginTop: 8, paddingLeft: 8, borderLeft: '2px solid var(--border)' }}>
      <EntryFields type={type} onChange={setEntry} />
      <button className="btn primary" type="submit">{t('btn.saveRecord')}</button>{' '}
      <button className="btn" type="button" onClick={onCancel}>{t('btn.cancel')}</button>
    </form>
  );
}

function BackupControls({ state, onImport }) {
  const today = () => new Date().toISOString().slice(0, 10);

  function handleExport() {
    const blob = new Blob([exportJSON(state)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `liftlog-${today()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImport(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        onImport(importJSON(reader.result));
      } catch (err) {
        alert(t('log.importFailed', { message: err.message }));
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  return (
    <div className="metric" style={{ marginBottom: 16, padding: 6 }}>
      <button className="settings-row" onClick={handleExport}>
        <span className="settings-ic"><IconDownload size={18} /></span>
        <span style={{ display: 'flex', flexDirection: 'column' }}>
          <span className="settings-title">{t('backup.export')}</span>
          <span className="settings-sub">{t('backup.exportSub')}</span>
        </span>
      </button>
      <label className="settings-row">
        <span className="settings-ic"><IconUpload size={18} /></span>
        <span style={{ display: 'flex', flexDirection: 'column' }}>
          <span className="settings-title">{t('backup.import')}</span>
          <span className="settings-sub">{t('backup.importSub')}</span>
        </span>
        <input type="file" accept="application/json" hidden onChange={handleImport} />
      </label>
      <div className="settings-row" style={{ cursor: 'default' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%' }}>
          <span className="settings-title" style={{ flex: 1 }}>{t('settings.language')}</span>
          {LANGS.map((l) => (
            <button
              key={l}
              className={getLang() === l ? 'chip on' : 'chip'}
              onClick={() => setLang(l)}
            >
              {l === 'en' ? 'English' : 'Español'}
            </button>
          ))}
        </span>
      </div>
    </div>
  );
}
