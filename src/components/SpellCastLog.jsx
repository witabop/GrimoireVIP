import React from 'react';

export const formatCastEntryAsText = (entry) => {
  if (!entry) return '';
  const lines = [
    `── ${entry.spellName} ──`,
    `Time: ${entry.timeLabel}`,
    `Gnosis: ${entry.gnosis} | Casting: ${entry.castingType || '—'}`,
    `Dice pool (rolled): ${entry.poolUsed}${entry.isChanceDie ? ' (chance die)' : ''}`,
    `Roll: [${entry.rollResults.join(', ')}] → ${entry.successes} success(es)`,
    `8-Again: ${entry.eightAgain ? 'yes' : 'no'} | 9-Again: ${entry.nineAgain ? 'yes' : 'no'}`,
    `Potency: ${entry.potency}${entry.potencyBoost ? ` (boost +${entry.potencyBoost})` : ''}`,
    `Primary factor: ${entry.primaryFactor || '—'}`,
    `Duration: ${entry.duration || '—'}`,
    `Casting time: ${entry.castingTime || '—'}`,
    `Mana cost (total): ${entry.manaCostTotal}`,
    '',
    'Dice pool breakdown:',
    `  Gnosis + Arcanum (${entry.breakdown.arcanaLabel} ${entry.breakdown.arcanaRating}): ${entry.breakdown.gnosis + entry.breakdown.arcanaRating}`,
    `  Yantras: +${entry.breakdown.yantras}`,
    ...(entry.breakdown.combinedSpellDicePenalty > 0
      ? [`  Combined spell penalty: -${entry.breakdown.combinedSpellDicePenalty}`]
      : []),
    `  Reach penalty: -${entry.breakdown.reachPenalty}`,
    ...(entry.breakdown.potencyBoostPenalty > 0
      ? [`  Potency boost penalty: -${entry.breakdown.potencyBoostPenalty}`]
      : []),
    `  Ritual boost dice: +${entry.breakdown.ritualBoost}`,
    `  Additional dice pool modifier: ${entry.breakdown.dicePoolModifier >= 0 ? '+' : ''}${entry.breakdown.dicePoolModifier}`,
    `  = ${entry.poolUsed}`,
    '',
    ...(entry.ritualBoost > 0
      ? [
          `Ritual: +${entry.ritualBoost} die (interval ${entry.ritualIntervalLabel}), total cast time ~${entry.ritualTimeLabel}`,
          ''
        ]
      : []),
    `Reaches: ${entry.reachCount ?? entry.reachLines.length}${entry.overreachAmount > 0 ? ` (Overreach ${entry.overreachAmount})` : ''}`,
    ...(entry.reachLines.length ? entry.reachLines.map((l) => `  • ${l}`) : ['  (none)']),
    '',
    'Modifiers:',
    `  Mana modifier: ${entry.manaModifier >= 0 ? '+' : ''}${entry.manaModifier}`,
    ''
  ];
  if (entry.combined && entry.componentNames?.length) {
    lines.push('Component spells:', ...entry.componentNames.map((n) => `  • ${n}`), '');
  }
  lines.push('─'.repeat(40));
  return lines.join('\n');
};

const SpellCastLog = ({ onClose, entries }) => {
  const copyEntry = async (entry) => {
    const text = formatCastEntryAsText(entry);
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
  };

  return (
    <div
      className="fixed top-4 right-4 z-[99999] w-[min(calc(100vw-1.5rem),26rem)] max-h-[min(85vh,calc(100vh-2rem))] flex flex-col rounded-xl border border-slate-700 bg-slate-800 shadow-2xl shadow-black/40 ring-1 ring-slate-600/50"
      role="dialog"
      aria-modal="true"
      aria-label="Spell cast log"
    >
      <div className="relative flex items-center w-full px-4 py-3 border-b border-slate-700 bg-slate-800/95 shrink-0 rounded-t-xl">
        <h2 className="text-base font-bold text-indigo-200 flex items-center gap-2">
          <i className="fas fa-history" />
          Spell Log
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="absolute right-2.5 text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-700 transition-colors"
          aria-label="Close log"
        >
          <i className="fas fa-times" />
        </button>
      </div>
      <div className="overflow-y-auto flex-1 p-3 space-y-3 custom-scrollbar bg-slate-800 min-h-0 rounded-b-xl">
        {entries.length === 0 ? (
          <p className="text-slate-400 text-center py-10 text-sm px-2">
            No spells cast this session yet.
          </p>
        ) : (
          entries.map((entry) => (
            <article
              key={entry.id}
              className="bg-slate-600 border border-slate-700 rounded-lg p-3 text-sm shadow-inner mb-2.5"
            >
              <div className="relative flex flex-wrap items-start justify-between gap-2 mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-amber-200 text-sm leading-tight">{entry.spellName}</h3>
                    {entry.castingType && (
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${
                        entry.castingType === 'rote' ? 'bg-blue-600/30 text-blue-300 border-blue-500/40' :
                        entry.castingType === 'praxis' ? 'bg-yellow-600/30 text-yellow-300 border-yellow-500/40' :
                        'bg-purple-600/30 text-purple-300 border-purple-500/40'
                      }`}>{entry.castingType}</span>
                    )}
                  </div>
                  <p className="text-slate-400 text-[11px] mt-0.5 italic">{entry.timeLabel}</p>
                </div>
                <button
                  type="button"
                  onClick={() => copyEntry(entry)}
                  className="absolute right-0 shrink-0 px-2.5 py-1 rounded-md bg-indigo-700 hover:bg-indigo-600 text-white text-[11px] font-medium transition-colors flex items-center gap-1"
                >
                  <i className="fas fa-copy text-[10px]" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-slate-300 text-xs">
                <div>
                  <span className="text-slate-400">Pool:</span>{' '}
                  <span className="font-mono font-bold text-white">{entry.poolUsed}</span>
                  {entry.isChanceDie && (
                    <span className="ml-1 text-[10px] text-amber-400 italic"> (chance)</span>
                  )}
                </div>
                <div>
                  <span className="text-slate-400">Potency:</span>{' '}
                  <span className="font-bold text-indigo-300">{entry.potency}</span>
                </div>
                <div>
                  <span className="text-slate-400">Successes:</span>{' '}
                  <span className="font-bold text-green-400">{entry.successes}</span>
                </div>
                <div>
                  <span className="text-slate-400">Mana:</span>{' '}
                  <span className="text-blue-300">{entry.manaCostTotal}</span>
                </div>
                {entry.duration && (
                  <div>
                    <span className="text-slate-400">Duration:</span>{' '}
                    <span className="text-amber-300">{entry.duration}</span>
                  </div>
                )}
                {entry.castingTime && (
                  <div>
                    <span className="text-slate-400">Cast time:</span>{' '}
                    <span className="text-slate-300">{entry.castingTime}</span>
                  </div>
                )}
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {entry.rollResults.map((r, i) => (
                  <span
                    key={i}
                    className={`inline-flex w-8 h-8 items-center justify-center rounded font-bold text-xs ${
                      entry.isChanceDie
                        ? r === 10
                          ? 'bg-green-700 text-white'
                          : r === 1
                            ? 'bg-red-800 text-white'
                            : 'bg-slate-800 text-slate-400'
                        : r >= 8
                          ? r === 10
                            ? 'bg-green-700 text-white'
                            : 'bg-blue-700 text-white'
                          : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {r}
                  </span>
                ))}
              </div>
              {(entry.reachCount ?? entry.reachLines.length) > 0 && (
                <div className="mt-2.5 pt-2 border-t border-slate-700/50">
                  <p className="text-[10px] text-slate-300 uppercase tracking-wider mb-1 font-medium">
                    Reaches: {entry.reachCount ?? entry.reachLines.length}
                    {(entry.overreachAmount ?? 0) > 0 && (
                      <span className="ml-1.5 text-red-400 normal-case tracking-normal italic text-xs"> (Overreach: {entry.overreachAmount})</span>
                    )}
                  </p>
                  <ul className="text-slate-300 text-[11px] space-y-0.5 leading-relaxed">
                    {entry.reachLines.map((line, i) => (
                      <li key={i} className="flex gap-1.5">
                        <span className="text-slate-400 shrink-0">•</span>
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="mt-2 pt-2 border-t border-slate-700 text-xs text-slate-400 space-y-1 font-mono leading-relaxed italic">
                <p>
                  Gnosis {entry.breakdown.gnosis} + {entry.breakdown.arcanaLabel} {entry.breakdown.arcanaRating} | +{entry.breakdown.yantras} yantra dice
                  {entry.breakdown.combinedSpellDicePenalty > 0 &&
                    ` | −${entry.breakdown.combinedSpellDicePenalty} combined`}{' '}
                  | −{entry.breakdown.reachPenalty} reach
                  {entry.breakdown.potencyBoostPenalty > 0 &&
                    ` | −${entry.breakdown.potencyBoostPenalty} potency boost`}{' '}
                  | +{entry.breakdown.ritualBoost} ritual | mod{' '}
                  {entry.breakdown.dicePoolModifier >= 0 ? '+' : ''}
                  {entry.breakdown.dicePoolModifier}
                </p>
                {entry.ritualBoost > 0 && (
                  <p className="text-indigo-400/95">
                    Ritual ~{entry.ritualTimeLabel} ({entry.ritualIntervalLabel} × {1 + entry.ritualBoost} intervals)
                  </p>
                )}
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
};

export default SpellCastLog;
