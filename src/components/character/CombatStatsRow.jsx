import React, { useState } from 'react';

const CombatStatsRow = ({ char, updateChar }) => {
  const attr = char.attributes || {};
  const skills = char.skills || {};

  const initiative = char.initiativeOverride ?? (attr.dexterity || 1) + (attr.composure || 1);
  const defense = char.defenseOverride ?? Math.min(attr.dexterity || 1, attr.wits || 1) + (skills.athletics || 0);
  const armor = char.armor ?? 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      <StatBox
        label="Initiative"
        value={initiative}
        isOverridden={char.initiativeOverride != null}
        onOverride={(v) => updateChar({ initiativeOverride: v })}
        onClear={() => updateChar({ initiativeOverride: null })}
      />

      <DefenseArmorBox
        defense={defense}
        armor={armor}
        isDefenseOverridden={char.defenseOverride != null}
        onDefenseOverride={(v) => updateChar({ defenseOverride: v })}
        onDefenseClear={() => updateChar({ defenseOverride: null })}
        onArmorChange={(v) => updateChar({ armor: v })}
      />

      <TiltsBox
        items={char.tiltsAndConditions || []}
        onChange={(items) => updateChar({ tiltsAndConditions: items })}
      />
    </div>
  );
};

const StatBox = ({ label, value, isOverridden, onOverride, onClear }) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');

  const open = () => { setDraft(String(value)); setEditing(true); };
  const save = () => {
    const n = parseInt(draft, 10);
    if (!isNaN(n) && n >= 0) onOverride(n);
    setEditing(false);
  };

  return (
    <div className="bg-slate-800 rounded-lg p-4 border border-slate-700 relative cursor-pointer hover:bg-slate-700/50 transition-colors" onClick={open}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-slate-400 font-medium uppercase tracking-wide">{label}</span>
        {isOverridden && (
          <button type="button" onClick={(e) => { e.stopPropagation(); onClear(); }} className="text-[10px] text-slate-500 hover:text-amber-400" title="Clear override">
            <i className="fas fa-undo" />
          </button>
        )}
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
      {editing && (
        <div className="absolute top-full left-0 mt-1 z-50 bg-slate-900 border border-slate-600 rounded-lg p-2 shadow-xl flex gap-2" onClick={(e) => e.stopPropagation()}>
          <input
            type="number" autoFocus min={0}
            value={draft} onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && save()}
            className="w-16 bg-slate-700 text-white text-center text-sm border border-slate-600 rounded px-2 py-1 focus:outline-none focus:border-indigo-500"
          />
          <button type="button" onClick={save} className="text-green-400 hover:text-green-300 text-sm"><i className="fas fa-check" /></button>
          <button type="button" onClick={() => setEditing(false)} className="text-slate-400 hover:text-white text-sm"><i className="fas fa-times" /></button>
        </div>
      )}
    </div>
  );
};

const DefenseArmorBox = ({ defense, armor, isDefenseOverridden, onDefenseOverride, onDefenseClear, onArmorChange }) => {
  const [editing, setEditing] = useState(false);
  const [defDraft, setDefDraft] = useState('');
  const [armDraft, setArmDraft] = useState('');

  const open = () => { setDefDraft(String(defense)); setArmDraft(String(armor)); setEditing(true); };
  const save = () => {
    const d = parseInt(defDraft, 10);
    const a = parseInt(armDraft, 10);
    if (!isNaN(d) && d >= 0) onDefenseOverride(d);
    if (!isNaN(a) && a >= 0) onArmorChange(a);
    setEditing(false);
  };

  return (
    <div className="bg-slate-800 rounded-lg p-4 border border-slate-700 relative cursor-pointer hover:bg-slate-700/50 transition-colors" onClick={open}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-slate-400 font-medium uppercase tracking-wide">Defense / Armor</span>
        {isDefenseOverridden && (
          <button type="button" onClick={(e) => { e.stopPropagation(); onDefenseClear(); }} className="text-[10px] text-slate-500 hover:text-amber-400" title="Clear defense override">
            <i className="fas fa-undo" />
          </button>
        )}
      </div>
      <div className="text-2xl font-bold text-white">
        {defense} <span className="text-slate-500 text-lg">/</span> <span className="text-slate-300">{armor}</span>
      </div>
      {editing && (
        <div className="absolute top-full left-0 mt-1 z-50 bg-slate-900 border border-slate-600 rounded-lg p-3 shadow-xl space-y-2 min-w-[180px]" onClick={(e) => e.stopPropagation()}>
          <div>
            <label className="text-[10px] text-slate-400 block mb-0.5">Defense</label>
            <input
              type="number" autoFocus min={0}
              value={defDraft} onChange={(e) => setDefDraft(e.target.value)}
              className="w-full bg-slate-700 text-white text-sm border border-slate-600 rounded px-2 py-1 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="text-[10px] text-slate-400 block mb-0.5">Armor</label>
            <input
              type="number" min={0}
              value={armDraft} onChange={(e) => setArmDraft(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && save()}
              className="w-full bg-slate-700 text-white text-sm border border-slate-600 rounded px-2 py-1 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={save} className="text-green-400 hover:text-green-300 text-sm"><i className="fas fa-check" /></button>
            <button type="button" onClick={() => setEditing(false)} className="text-slate-400 hover:text-white text-sm"><i className="fas fa-times" /></button>
          </div>
        </div>
      )}
    </div>
  );
};

const TiltsBox = ({ items, onChange }) => {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState('');

  const add = () => {
    const trimmed = draft.trim();
    if (trimmed) {
      onChange([...items, trimmed]);
      setDraft('');
    }
  };

  const remove = (idx) => {
    onChange(items.filter((_, i) => i !== idx));
  };

  return (
    <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-slate-400 font-medium uppercase tracking-wide">Tilts & Conditions</span>
        <button type="button" onClick={() => setAdding(true)} className="text-xs text-indigo-400 hover:text-indigo-300">
          <i className="fas fa-plus" />
        </button>
      </div>
      <div className="space-y-1 min-h-[2rem]">
        {items.length === 0 && !adding && (
          <p className="text-xs text-slate-600 italic">None active</p>
        )}
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2 group text-sm text-slate-300">
            <span className="flex-1 min-w-0 truncate">{item}</span>
            <button
              type="button"
              onClick={() => remove(i)}
              className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 text-xs transition-opacity"
            >
              <i className="fas fa-trash-alt" />
            </button>
          </div>
        ))}
        {adding && (
          <div className="flex gap-2 mt-1">
            <input
              type="text" autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') add();
                if (e.key === 'Escape') { setAdding(false); setDraft(''); }
              }}
              placeholder="New tilt or condition…"
              className="flex-1 bg-slate-700 text-white border border-slate-600 rounded px-2 py-1 text-xs focus:outline-none focus:border-indigo-500"
            />
            <button type="button" onClick={add} className="text-green-400 hover:text-green-300 text-xs"><i className="fas fa-check" /></button>
            <button type="button" onClick={() => { setAdding(false); setDraft(''); }} className="text-slate-400 hover:text-white text-xs"><i className="fas fa-times" /></button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CombatStatsRow;
