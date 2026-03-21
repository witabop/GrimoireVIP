import React from 'react';
import { getEffectiveReachCosts } from '../utils/castingCosts';
import { formatRitualDuration, getRitualCastTimeMinutes } from '../utils/spellCalculations';

const CastingCostsSummary = ({
  selectedSpell,
  selectedReaches,
  getCurrentPrimaryFactor,
  arcanaValue,
  arcanaValues,
  arcanaLabel,
  yantras,
  potencyBoostLevel,
  dicePoolModifier,
  ritualBoost,
  gnosis,
  activeSpellReachCost = 0,
  className = ''
}) => {
  if (!selectedSpell) return null;

  const { totalPenalty } = getEffectiveReachCosts(
    selectedSpell,
    selectedReaches,
    getCurrentPrimaryFactor,
    arcanaValue,
    arcanaValues
  );

  const effectiveGnosis = gnosis ?? 1;
  const effectiveArcana = arcanaValue ?? 0;
  const effectiveYantras = yantras ?? 0;
  const potencyPenalty = potencyBoostLevel * 2;
  const isCombinedSpell = selectedSpell.combined;
  const combinedPenalty = isCombinedSpell ? (selectedSpell.additionalPenalty || 0) : 0;
  const ritualTotalMin = getRitualCastTimeMinutes(effectiveGnosis, ritualBoost || 0);

  const totalPositive =
    effectiveGnosis + effectiveArcana + effectiveYantras +
    (ritualBoost || 0) + Math.max(0, dicePoolModifier);
  const totalNegative =
    totalPenalty + potencyPenalty + combinedPenalty + Math.max(0, -dicePoolModifier);
  const netPool = totalPositive - totalNegative;

  return (
    <div
      className={`p-4 bg-slate-700 rounded-lg text-sm shadow-lg shadow-black/25 ${className}`}
    >
      <div className="mb-3 text-slate-400 flex items-center">
        Pool Breakdown
      </div>

      <div className="space-y-1.5 italic">
        <Row icon="fa-brain" color="green">
          Gnosis: +{effectiveGnosis}
        </Row>
        <Row icon="fa-hat-wizard" color="green">
          {arcanaLabel || 'Arcanum'}: +{effectiveArcana}
        </Row>
        {effectiveYantras > 0 && (
          <Row icon="fa-gem" color="green">
            Yantras: +{effectiveYantras}
          </Row>
        )}
        {(ritualBoost || 0) > 0 && (
          <Row icon="fa-hourglass-half" color="green">
            Ritual boost: +{ritualBoost}
            <span className="ml-1.5 text-green-200/60 text-xs">
              (~{formatRitualDuration(ritualTotalMin) || '—'})
            </span>
          </Row>
        )}

        {totalPenalty > 0 && (
          <Row icon="fa-hand-point-up" color="yellow">
            Reach penalty: −{totalPenalty}
          </Row>
        )}
        {activeSpellReachCost > 0 && (
          <Row icon="fa-layer-group" color="blue">
            Active spell Reach: +{activeSpellReachCost}
            <span className="ml-1.5 text-blue-200/60 text-xs">(reach only, no dice penalty)</span>
          </Row>
        )}
        {potencyPenalty > 0 && (
          <Row icon="fa-bolt" color="yellow">
            Potency boost: −{potencyPenalty}
          </Row>
        )}
        {combinedPenalty > 0 && (
          <Row icon="fa-magic" color="yellow">
            Combined spell: −{combinedPenalty}
          </Row>
        )}
        {dicePoolModifier !== 0 && (
          <Row icon="fa-sliders-h" color={dicePoolModifier > 0 ? 'green' : 'yellow'}>
            Additional modifier: {dicePoolModifier > 0 ? '+' : ''}{dicePoolModifier}
          </Row>
        )}

        <div className={`flex items-center justify-between p-2 rounded-lg font-bold border-t border-slate-600/80 pt-3 mt-1 ${
          netPool >= 1 ? 'text-white' : netPool <= -6 ? 'text-red-400' : 'text-amber-300'
        }`}>
          <span className="flex items-center">
            <i className="fas fa-equals mr-2 w-4 text-center" />
            {netPool} dice
          </span>
        </div>

      </div>
    </div>
  );
};

const COLORS = {
  green:  'text-green-300 bg-green-900/20',
  yellow: 'text-yellow-300 bg-yellow-900/20',
  blue:   'text-blue-300 bg-blue-900/20',
  red:    'text-red-300 bg-red-900/20',
};

const Row = ({ icon, color, className = '', children }) => (
  <div className={`flex items-center p-2 rounded-lg ${COLORS[color] || ''} ${className}`}>
    <i className={`fas ${icon} mr-2 w-4 text-center`} />
    {children}
  </div>
);

export default CastingCostsSummary;
