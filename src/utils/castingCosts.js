import { DEFAULT_REACHES } from '../data/reachesData';
import { calculateReachEffectsWithPrimaryFactor } from './spellCalculations';

/**
 * Reach dice penalties and reach-derived mana (same logic as Customize Spell).
 */
export function getEffectiveReachCosts(
  selectedSpell,
  selectedReaches,
  getCurrentPrimaryFactor,
  arcanaValue,
  arcanaValues
) {
  if (!selectedSpell) return { totalPenalty: 0, manaCost: 0 };

  const currentPrimaryFactor = getCurrentPrimaryFactor();
  const isCombinedSpell = selectedSpell?.combined;

  const getCurrentArcanaValue = () => {
    if (isCombinedSpell && selectedSpell.lowestArcanum) {
      return selectedSpell.lowestArcanum.value;
    }
    if (arcanaValues && selectedSpell.arcanum) {
      return arcanaValues[selectedSpell.arcanum.toLowerCase()] || 0;
    }
    return 0;
  };

  if (isCombinedSpell) {
    const currentArcanaValue = getCurrentArcanaValue();
    const primaryFactors = selectedSpell.primaryFactor.split('/');
    const hasDuration =
      primaryFactors.includes('Duration') || currentPrimaryFactor === 'Duration';

    return calculateReachEffectsWithPrimaryFactor(
      selectedReaches,
      selectedSpell,
      DEFAULT_REACHES,
      currentArcanaValue,
      hasDuration ? 'Duration' : selectedSpell.primaryFactor,
      currentPrimaryFactor
    );
  }

  return calculateReachEffectsWithPrimaryFactor(
    selectedReaches,
    selectedSpell,
    DEFAULT_REACHES,
    arcanaValue,
    selectedSpell.primaryFactor,
    currentPrimaryFactor !== selectedSpell.primaryFactor ? currentPrimaryFactor : null
  );
}
