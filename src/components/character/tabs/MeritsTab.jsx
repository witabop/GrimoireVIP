import React, { useState } from 'react';

const MeritsTab = ({ merits, onChange }) => {
  const [draft, setDraft] = useState('');
  const [adding, setAdding] = useState(false);

  const add = () => {
    const trimmed = draft.trim();
    if (trimmed) {
      onChange([...merits, { name: trimmed, dots: 1 }]);
      setDraft('');
    }
  };

  const remove = (idx) => onChange(merits.filter((_, i) => i !== idx));

  const setDots = (idx, val) => {
    const n = parseInt(val, 10);
    if (isNaN(n)) return;
    const updated = [...merits];
    updated[idx] = { ...updated[idx], dots: Math.max(1, Math.min(10, n)) };
    onChange(updated);
  };

  return (
    <div className="space-y-2">
      {merits.length === 0 && !adding && (
        <p className="text-xs text-slate-500 italic">No merits added yet.</p>
      )}
      {merits.map((m, i) => (
        <div key={i} className="flex items-center gap-3 bg-slate-700/60 rounded-lg px-3 py-2 group">
          <span className="text-sm text-slate-300 flex-1 min-w-0 truncate">{m.name}</span>
          <input
            type="number"
            min={1}
            max={10}
            value={m.dots}
            onChange={(e) => setDots(i, e.target.value)}
            className="w-14 bg-slate-700 text-white text-center text-sm border border-slate-600 rounded-lg py-1 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40 focus:outline-none"
          />
          <button
            type="button"
            onClick={() => remove(i)}
            className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 text-xs transition-opacity"
          >
            <i className="fas fa-trash-alt" />
          </button>
        </div>
      ))}

      {adding ? (
        <div className="flex gap-2">
          <input
            type="text"
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') add();
              if (e.key === 'Escape') { setAdding(false); setDraft(''); }
            }}
            placeholder="Merit name…"
            className="flex-1 bg-slate-700 text-white border border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
          />
          <button type="button" onClick={add} className="text-green-400 hover:text-green-300 text-sm px-2"><i className="fas fa-check" /></button>
          <button type="button" onClick={() => { setAdding(false); setDraft(''); }} className="text-slate-400 hover:text-white text-sm px-2"><i className="fas fa-times" /></button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 mt-1"
        >
          <i className="fas fa-plus" /> Add Merit
        </button>
      )}
    </div>
  );
};

export default MeritsTab;
