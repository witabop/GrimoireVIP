import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { rollDice, countSuccesses } from '../utils/spellCalculations';

const DiceRoller = () => {
  const [open, setOpen] = useState(false);
  const [pool, setPool] = useState(4);
  const [results, setResults] = useState(null);

  const isChance = pool <= 0;
  const effectivePool = Math.max(pool, 0);

  const roll = () => {
    const dice = rollDice(effectivePool || 1, {});
    const successes = countSuccesses(dice, isChance);
    setResults({ dice, successes, pool: effectivePool, isChance });
  };

  return createPortal(
    <>
      {open && (
        <div className="fixed bottom-16 left-4 z-[9998] w-64 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl shadow-black/40 p-4 animate-fadeIn">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-white">Dice Roller</span>
            <button type="button" onClick={() => { setOpen(false); setResults(null); }} className="text-slate-500 hover:text-white text-xs">
              <i className="fas fa-times" />
            </button>
          </div>
          <div className="flex gap-2 mb-3">
            <input
              type="number"
              min={0}
              max={30}
              value={pool}
              onChange={(e) => { setPool(parseInt(e.target.value, 10) || 0); setResults(null); }}
              className="flex-1 bg-slate-700 text-white text-center text-sm border border-slate-600 rounded-lg py-2 focus:outline-none focus:border-indigo-500"
            />
            <button
              type="button"
              onClick={roll}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors"
            >
              <i className="fas fa-dice mr-1.5" />Roll
            </button>
          </div>
          {isChance && (
            <p className="text-[11px] text-amber-400 mb-2"><i className="fas fa-exclamation-triangle mr-1" />Chance die — only a 10 succeeds.</p>
          )}
          {results && (
            <div className="bg-slate-900/60 rounded-lg p-3 space-y-2">
              <div className="flex flex-wrap gap-1.5">
                {results.dice.map((d, i) => (
                  <span
                    key={i}
                    className={`w-8 h-8 rounded-md flex items-center justify-center text-xs font-bold ${
                      results.isChance
                        ? (d === 10 ? 'bg-green-600/30 text-green-300 border border-green-500/40'
                          : d === 1 ? 'bg-red-600/30 text-red-300 border border-red-500/40'
                          : 'bg-slate-700 text-slate-400 border border-slate-600')
                        : (d >= 8
                          ? 'bg-green-600/30 text-green-300 border border-green-500/40'
                          : 'bg-slate-700 text-slate-400 border border-slate-600')
                    }`}
                  >
                    {d}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-2 text-xs border-t border-slate-700 pt-2">
                <span className="text-slate-400">Successes:</span>
                <span className={`font-bold ${results.successes > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {results.successes}
                </span>
                {results.isChance && results.dice.some((d) => d === 1) && (
                  <span className="text-red-400 font-medium ml-1">— Dramatic Failure</span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`fixed bottom-4 left-4 z-[9998] w-12 h-12 rounded-full shadow-lg flex items-center justify-center text-lg transition-all ${
          open
            ? 'bg-indigo-600 text-white shadow-indigo-600/30'
            : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 hover:text-white'
        }`}
        title="Dice Roller"
      >
        <i className="fas fa-dice-d20" />
      </button>
    </>,
    document.body
  );
};

export default DiceRoller;
