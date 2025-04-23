// Calculate dice pool based on character stats and spell properties
export const calculateDicePool = (gnosis, arcanaValue, castingType, yantras, reachPenalties) => {
  let dicePool = 0;
  
  // Calculate base dice based on casting type chosen by user
  if (castingType === 'rote') {
    // For rotes, we'd typically use Attribute + Skill + Arcanum
    // We're using a simplified version here. User will add in Mudra in yantra modifier section
    dicePool = gnosis + arcanaValue;
  } else {
    // For improvised spells and praxis
    dicePool = gnosis + arcanaValue;
  }
  
  // Add yantra bonuses
  dicePool += yantras;
  
  // Apply penalties from reaches
  dicePool -= reachPenalties;
  
  // Ensure dice pool is at least 1
  return Math.max(1, dicePool);
};

// Calculate how many reaches a mage can use for a spell
export const calculateAvailableReaches = (arcanaValue, spellLevel, castingType) => {
  // Rote spells use 5 instead of actual Arcanum rating
  const effectiveArcanum = castingType === 'rote' ? 5 : arcanaValue;
  return 1 + Math.max(0, effectiveArcanum - spellLevel);
};

// Roll dice with 10-again rule and optional 8-again or 9-again
export const rollDice = (dicePool, options = {}) => {
  const { eightAgain = false, nineAgain = false } = options;
  let results = [];
  let remainingDice = dicePool;
  
  // Set the threshold for rolling again based on options
  const againThreshold = eightAgain ? 8 : (nineAgain ? 9 : 10);
  
  while (remainingDice > 0) {
    const roll = Math.floor(Math.random() * 10) + 1;
    results.push(roll);
    
    // Check if the roll meets the "again" threshold for an extra die
    if (roll >= againThreshold) {
      remainingDice++;
    }
    
    remainingDice--;
  }
  
  return results;
};

// Count successes (8+) in roll results
export const countSuccesses = (rollResults) => {
  return rollResults.filter(roll => roll >= 8).length;
};

// Calculate total reach cost and penalties (original version)
export const calculateReachEffects = (selectedReaches, spell, defaultReaches) => {
  let totalCost = 0;
  let totalPenalty = 0;
  let manaCost = 0;
  
  // Handle case where spell might be null during initialization
  const specialReaches = spell?.specialReaches || [];
  
  selectedReaches.forEach(reachName => {
    // Check if it's a special reach for this spell
    const specialReach = specialReaches.find(r => r.name === reachName);
    if (specialReach) {
      totalCost += specialReach.cost;
      return;
    }
    
    // Check if it's a default reach
    const defaultReach = defaultReaches.find(r => r.name === reachName);
    if (defaultReach) {
      totalCost += defaultReach.cost;
      if (defaultReach.dicePenalty) {
        totalPenalty += defaultReach.dicePenalty;
      }
      if (defaultReach.manaCost) {
        manaCost += defaultReach.manaCost;
      }
    }
  });
  
  return { totalCost, totalPenalty, manaCost };
};

// Get default potency based on primary factor
export const getDefaultPotency = (arcanaValue, primaryFactor, selectedPrimaryFactor) => {
  // If primary factor is potency (original or changed), use arcana value
  if (primaryFactor === 'Potency' || selectedPrimaryFactor === 'Potency') {
    return arcanaValue;
  }
  // Otherwise default to 1
  return 1;
};

// Get free duration level based on arcana dots when duration is primary factor
export const getFreeDurationLevel = (arcanaValue, primaryFactor, selectedPrimaryFactor, isAdvancedScale) => {
  // If primary factor is not duration, nothing is free
  if (primaryFactor !== 'Duration' && selectedPrimaryFactor !== 'Duration') {
    return 0;
  }

  // If arcana level is too low, nothing is free
  if (arcanaValue <= 0) {
    return 0;
  }

  // Cap at 5 for standard scale
  const cappedLevel = Math.min(arcanaValue, 5);
  
  // For advanced scale, free level is the same (1-5 based on arcana)
  return cappedLevel;
};

// Calculate dice penalty for duration based on primary factor
export const calculateDurationPenalty = (selectedDuration, arcanaValue, primaryFactor, selectedPrimaryFactor, isAdvancedScale = false) => {
  // If no duration selected or arcanaValue is invalid, no penalty
  if (!selectedDuration || arcanaValue < 0) {
    return 0;
  }

  // Check if duration is the primary factor
  const isDurationPrimary = primaryFactor === 'Duration' || selectedPrimaryFactor === 'Duration';
  
  // If duration is not primary, full penalty applies
  if (!isDurationPrimary) {
    return getDurationPenalty(selectedDuration);
  }
  
  // Get free duration level based on arcana dots
  const freeDurationLevel = getFreeDurationLevel(arcanaValue, primaryFactor, selectedPrimaryFactor, isAdvancedScale);
  
  // Get the duration level of the selected option
  const selectedDurationLevel = getDurationLevel(selectedDuration, isAdvancedScale);
  
  // If selected duration is below or equal to the free level, no penalty
  if (selectedDurationLevel <= freeDurationLevel) {
    return 0;
  }
  
  // Otherwise, calculate penalty only for the difference
  return getDurationPenaltyDifference(freeDurationLevel, selectedDurationLevel, isAdvancedScale);
};

// Helper to get duration level (1-5) for a specific duration option
const getDurationLevel = (durationName, isAdvancedScale) => {
  // For standard scale durations
  if (!isAdvancedScale) {
    switch (durationName) {
      case 'Duration: 2 turns': return 1;
      case 'Duration: 3 turns': return 2;
      case 'Duration: 5 turns': return 3;
      case 'Duration: 10 turns': return 4;
      default: return 0;
    }
  }
  
  // For advanced scale durations
  switch (durationName) {
    case 'Duration: One scene/hour': return 1;
    case 'Duration: One day': return 2;
    case 'Duration: One week': return 3;
    case 'Duration: One month': return 4;
    case 'Duration: One year': return 5;
    // Special case for indefinite
    case 'Duration: Indefinite': return 6;
    default: return 0;
  }
};

// Get the penalty for a specific duration level
const getDurationPenalty = (durationName) => {
  switch (durationName) {
    case 'Duration: 2 turns': return 2;
    case 'Duration: 3 turns': return 4;
    case 'Duration: 5 turns': return 6;
    case 'Duration: 10 turns': return 8;
    case 'Duration: One day': return 2;
    case 'Duration: One week': return 4;
    case 'Duration: One month': return 6;
    case 'Duration: One year': return 8;
    case 'Duration: Indefinite': return 10;
    default: return 0;
  }
};

// Calculate penalty difference between two duration levels
const getDurationPenaltyDifference = (freeLevel, selectedLevel, isAdvancedScale) => {
  // For standard scale
  if (!isAdvancedScale) {
    const penalties = [0, 2, 4, 6, 8];
    // If we're moving from free level to selected level, only take the difference in penalties
    if (freeLevel < selectedLevel && freeLevel >= 0 && selectedLevel <= 4) {
      return penalties[selectedLevel] - penalties[freeLevel];
    }
    // Otherwise return full penalty
    return selectedLevel >= 0 && selectedLevel < penalties.length ? penalties[selectedLevel] : 0;
  }
  
  // For advanced scale
  const advancedPenalties = [0, 0, 2, 4, 6, 8, 10]; // Index 0 is placeholder, 1 is One scene/hour
  // If moving from free level to selected, only take the difference
  if (freeLevel < selectedLevel && freeLevel >= 0 && selectedLevel < advancedPenalties.length) {
    return advancedPenalties[selectedLevel] - advancedPenalties[freeLevel];
  }
  // Otherwise return full penalty
  return selectedLevel >= 0 && selectedLevel < advancedPenalties.length ? advancedPenalties[selectedLevel] : 0;
};

// Calculate total reach effects with primary factor adjustments
export const calculateReachEffectsWithPrimaryFactor = (
  selectedReaches, 
  spell, 
  defaultReaches, 
  arcanaValue, 
  primaryFactor,
  changedPrimaryFactor
) => {
  let totalCost = 0;
  let totalPenalty = 0;
  let manaCost = 0;
  
  // Handle case where spell might be null during initialization
  const specialReaches = spell?.specialReaches || [];
  
  // Check for advanced scale reach
  const hasAdvancedDurationReach = selectedReaches.some(reach => 
    reach.startsWith("Duration: One") || reach === "Duration: Indefinite"
  );
  const selectedDuration = selectedReaches.find(reach => reach.startsWith("Duration:"));
  const isPrimaryFactorDuration = primaryFactor === 'Duration' || changedPrimaryFactor === 'Duration';
  
  selectedReaches.forEach(reachName => {
    // Check if it's a special reach for this spell
    const specialReach = specialReaches.find(r => r.name === reachName);
    if (specialReach) {
      totalCost += specialReach.cost;
      return;
    }
    
    // Get the reach defaults
    const defaultReach = defaultReaches.find(r => r.name === reachName);
    if (!defaultReach) return;
    
    // Add to total reach cost
    totalCost += defaultReach.cost;
    
    // Special handling for duration options
    if (reachName.startsWith("Duration:")) {
      const isAdvanced = reachName.startsWith("Duration: One") || reachName === "Duration: Indefinite";
      
      // If duration is the primary factor, calculate reduced or free penalty
      if (isPrimaryFactorDuration) {
        const adjustedPenalty = calculateDurationPenalty(
          reachName, 
          arcanaValue, 
          primaryFactor, 
          changedPrimaryFactor,
          isAdvanced
        );
        totalPenalty += adjustedPenalty;
      } else {
        // Normal penalty if not primary
        if (defaultReach.dicePenalty) {
          totalPenalty += defaultReach.dicePenalty;
        }
      }
    } 
    // For non-duration reaches
    else if (defaultReach.dicePenalty) {
      totalPenalty += defaultReach.dicePenalty;
    }
    
    // Add mana costs
    if (defaultReach.manaCost) {
      manaCost += defaultReach.manaCost;
    }
  });
  
  return { totalCost, totalPenalty, manaCost };
};