import React, { useState } from 'react';

const ActiveSpells = ({ activeSpells, onRemove }) => {
  const [expanded, setExpanded] = useState(null);

  if (activeSpells.length === 0) return null;

  return (
    <div className="card animate-slideInLeft">
      <h2 className="card-title">
        <i className="fas fa-bolt mr-3 text-amber-400"></i> Active Spells
        <span className="ml-2 text-xs font-normal text-slate-400">({activeSpells.length})</span>
      </h2>
      <div className="space-y-2">
        {activeSpells.map((spell) => {
          const isOpen = expanded === spell.id;
          return (
            <div key={spell.id} className="bg-slate-700 rounded-lg overflow-hidden group relative">
              <div
                className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-slate-600/50 transition-colors"
                onClick={() => setExpanded(isOpen ? null : spell.id)}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white truncate">{spell.name}</span>
                    <span className="text-[10px] text-slate-400 shrink-0">{spell.castingType}</span>
                  </div>
                  <div className="text-xs text-slate-400 flex gap-3 mt-0.5">
                    <span>Potency <span className="text-indigo-300 font-medium">{spell.potency}</span></span>
                    {spell.reachLines.length > 0 && (
                      <span>Reaches <span className="text-amber-300 font-medium">{spell.reachLines.length}</span></span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onRemove(spell.id); }}
                    className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 text-xs p-1 transition-opacity"
                    title="Remove active spell"
                  >
                    <i className="fas fa-trash-alt" />
                  </button>
                  <i className={`fas fa-chevron-${isOpen ? 'up' : 'down'} text-[10px] text-slate-500`} />
                </div>
              </div>
              {isOpen && spell.reachLines.length > 0 && (
                <div className="px-3 pb-3 pt-1 border-t border-slate-600/50 animate-fadeIn">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1 font-medium">Reach Effects</p>
                  <ul className="space-y-0.5">
                    {spell.reachLines.map((line, i) => (
                      <li key={i} className="text-xs text-slate-300 flex gap-1.5">
                        <span className="text-indigo-400 shrink-0">•</span>
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ActiveSpells;
