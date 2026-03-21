import React, { useState } from 'react';

const AttainmentsTab = ({ arcanaAttainments, legacyAttainments, onChangeArcana, onChangeLegacy }) => {
  return (
    <div className="space-y-5">
      <EntryList
        title="Arcana Attainments"
        items={arcanaAttainments}
        onChange={onChangeArcana}
        placeholder="New arcana attainment…"
      />
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wide">Legacy Attainments</span>
          <span className="text-[10px] text-slate-500">({legacyAttainments.length}/5)</span>
        </div>
        <EntryList
          items={legacyAttainments}
          onChange={onChangeLegacy}
          placeholder="New legacy attainment…"
          max={5}
        />
      </div>
    </div>
  );
};

const EntryList = ({ title, items, onChange, placeholder, max }) => {
  const [draft, setDraft] = useState('');
  const [adding, setAdding] = useState(false);

  const add = () => {
    const trimmed = draft.trim();
    if (trimmed) { onChange([...items, trimmed]); setDraft(''); }
  };

  const remove = (idx) => onChange(items.filter((_, i) => i !== idx));
  const atMax = max != null && items.length >= max;

  return (
    <div className="space-y-1.5">
      {title && <p className="text-xs font-bold text-slate-300 uppercase tracking-wide mb-2">{title}</p>}
      {items.length === 0 && !adding && <p className="text-xs text-slate-500 italic">None added.</p>}
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2 bg-slate-700/60 rounded-lg px-3 py-2 group">
          <span className="text-sm text-slate-300 flex-1 truncate">{item}</span>
          <button type="button" onClick={() => remove(i)} className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 text-xs transition-opacity"><i className="fas fa-trash-alt" /></button>
        </div>
      ))}
      {adding ? (
        <div className="flex gap-2">
          <input type="text" autoFocus value={draft} onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') add(); if (e.key === 'Escape') { setAdding(false); setDraft(''); } }}
            placeholder={placeholder} className="flex-1 bg-slate-700 text-white border border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500" />
          <button type="button" onClick={add} className="text-green-400 hover:text-green-300 text-sm px-2"><i className="fas fa-check" /></button>
          <button type="button" onClick={() => { setAdding(false); setDraft(''); }} className="text-slate-400 hover:text-white text-sm px-2"><i className="fas fa-times" /></button>
        </div>
      ) : (
        !atMax && (
          <button type="button" onClick={() => setAdding(true)} className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 mt-1">
            <i className="fas fa-plus" /> Add
          </button>
        )
      )}
    </div>
  );
};

export default AttainmentsTab;
