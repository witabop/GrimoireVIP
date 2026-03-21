import React, { useState } from 'react';

const DAMAGE_CYCLE = ['', '/', 'x', '*'];

const DerivedStatsBar = ({ char, updateChar }) => {
  const attr = char.attributes || {};
  const maxHealth = char.healthOverride ?? (attr.stamina || 1) + 5;
  const speed = char.speedOverride ?? (attr.dexterity || 1) + (attr.strength || 1) + 5;
  const maxWillpower = char.willpowerOverride ?? (attr.resolve || 1) + (attr.composure || 1);

  const track = char.healthTrack || [];
  const normalizedTrack = Array.from({ length: maxHealth }, (_, i) => track[i] || '');
  const spentWP = char.willpower ?? 0;

  const cycleDamage = (idx) => {
    const current = normalizedTrack[idx] || '';
    const nextIdx = (DAMAGE_CYCLE.indexOf(current) + 1) % DAMAGE_CYCLE.length;
    const newTrack = [...normalizedTrack];
    newTrack[idx] = DAMAGE_CYCLE[nextIdx];
    updateChar({ healthTrack: newTrack });
  };

  const toggleWP = (idx) => {
    updateChar({ willpower: idx < spentWP ? idx : idx + 1 });
  };

  return (
    <div className="flex flex-wrap gap-3 items-stretch">
      <OverrideBox
        label="Speed"
        value={speed}
        isOverridden={char.speedOverride != null}
        onOverride={(v) => updateChar({ speedOverride: v })}
        onClear={() => updateChar({ speedOverride: null })}
      />

      {/* Health */}
      <div className="bg-slate-800 rounded-lg p-3 border border-slate-700 shadow-md flex-1 min-w-[200px]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-slate-400 font-medium uppercase tracking-wide">Health</span>
          <OverrideButton
            isOverridden={char.healthOverride != null}
            onOverride={(v) => updateChar({ healthOverride: v })}
            onClear={() => updateChar({ healthOverride: null })}
            currentCalc={maxHealth}
          />
        </div>
        <div className="flex flex-wrap gap-1 mb-1.5">
          {normalizedTrack.map((_, i) => (
            <span key={`max-${i}`} className="w-5 h-5 rounded-full bg-slate-500 border border-slate-400 inline-block" />
          ))}
        </div>
        <div className="flex flex-wrap gap-1">
          {normalizedTrack.map((dmg, i) => (
            <button
              key={`dmg-${i}`}
              type="button"
              onClick={() => cycleDamage(i)}
              className="w-5 h-5 rounded-full border border-slate-500 flex items-center justify-center text-[10px] font-bold leading-none bg-slate-700 hover:bg-slate-600 transition-colors"
              title={dmg ? `Damage: ${dmg}` : 'No damage (click to cycle)'}
            >
              {dmg === '/' && <span className="text-yellow-400">/</span>}
              {dmg === 'x' && <span className="text-red-400">X</span>}
              {dmg === '*' && <span className="text-purple-400">*</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Willpower */}
      <div className="bg-slate-800 rounded-lg p-3 border border-slate-700 shadow-md min-w-[140px]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-slate-400 font-medium uppercase tracking-wide">Willpower</span>
          <OverrideButton
            isOverridden={char.willpowerOverride != null}
            onOverride={(v) => updateChar({ willpowerOverride: v })}
            onClear={() => updateChar({ willpowerOverride: null })}
            currentCalc={maxWillpower}
          />
        </div>
        <div className="flex flex-wrap gap-1 mb-1.5">
          {Array.from({ length: maxWillpower }, (_, i) => (
            <span key={`wp-max-${i}`} className="w-5 h-5 rounded-full bg-slate-500 border border-slate-400 inline-block" />
          ))}
        </div>
        <div className="flex flex-wrap gap-1">
          {Array.from({ length: maxWillpower }, (_, i) => (
            <button
              key={`wp-${i}`}
              type="button"
              onClick={() => toggleWP(i)}
              className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                i < spentWP
                  ? 'bg-blue-500 border-blue-400'
                  : 'bg-slate-700 border-slate-500 hover:bg-slate-600'
              }`}
              title={i < spentWP ? 'Spent (click to unfill)' : 'Available (click to fill)'}
            />
          ))}
        </div>
      </div>

      {/* Mana */}
      <div className="bg-slate-800 rounded-lg p-3 border border-slate-700 shadow-md min-w-[80px]">
        <span className="text-xs text-slate-400 font-medium uppercase tracking-wide block mb-2">Mana</span>
        <input
          type="number"
          min={0}
          value={char.mana ?? 0}
          onChange={(e) => {
            const n = parseInt(e.target.value, 10);
            updateChar({ mana: isNaN(n) ? 0 : Math.max(0, n) });
          }}
          className="w-16 bg-slate-700 text-white text-center text-lg font-bold border border-slate-600 rounded-lg py-1 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40 focus:outline-none"
        />
      </div>
    </div>
  );
};

const OverrideBox = ({ label, value, isOverridden, onOverride, onClear }) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');

  const openEdit = () => { setDraft(String(value)); setEditing(true); };
  const save = () => {
    const n = parseInt(draft, 10);
    if (!isNaN(n) && n >= 0) onOverride(n);
    setEditing(false);
  };

  return (
    <div className="bg-slate-800 rounded-lg p-3 border border-slate-700 shadow-md min-w-[80px] relative">
      <span className="text-xs text-slate-400 font-medium uppercase tracking-wide block mb-2">{label}</span>
      <div className="text-2xl font-bold text-white cursor-pointer" onClick={openEdit}>{value}</div>
      {isOverridden && (
        <button type="button" onClick={onClear} className="absolute top-2 right-2 text-[10px] text-slate-500 hover:text-amber-400" title="Clear override">
          <i className="fas fa-undo" />
        </button>
      )}
      {editing && (
        <div className="absolute top-full left-0 mt-1 z-50 bg-slate-900 border border-slate-600 rounded-lg p-2 shadow-xl flex gap-2">
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

const OverrideButton = ({ isOverridden, onOverride, onClear, currentCalc }) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');

  const open = () => { setDraft(String(currentCalc)); setEditing(true); };
  const save = () => {
    const n = parseInt(draft, 10);
    if (!isNaN(n) && n >= 1) onOverride(n);
    setEditing(false);
  };

  return (
    <div className="relative">
      <button type="button" onClick={isOverridden ? onClear : open} className="text-[10px] text-slate-500 hover:text-amber-400" title={isOverridden ? 'Clear override' : 'Override'}>
        <i className={`fas fa-${isOverridden ? 'undo' : 'pen'}`} />
      </button>
      {editing && (
        <div className="absolute top-full right-0 mt-1 z-50 bg-slate-900 border border-slate-600 rounded-lg p-2 shadow-xl flex gap-2">
          <input
            type="number" autoFocus min={1}
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

export default DerivedStatsBar;
