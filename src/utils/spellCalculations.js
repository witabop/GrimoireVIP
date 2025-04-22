// Calculate dice pool based on character stats and spell properties
export const calculateDicePool = (gnosis, arcanaValue, castingType, yantras, reachPenalties) => {
    let dicePool = 0;
    
    // Calculate base dice based on casting type chosen by user
    if (castingType === 'rote') {
      // For rotes, we'd typically use Attribute + Skill + Arcanum
      // We're using a simplified version here with 3 + Arcanum
      dicePool = 3 + arcanaValue;
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
  
  // Roll dice with 10-again rule
  export const rollDice = (dicePool) => {
    let results = [];
    let remainingDice = dicePool;
    
    while (remainingDice > 0) {
      const roll = Math.floor(Math.random() * 10) + 1;
      results.push(roll);
      
      // 10-again rule: roll an additional die
      if (roll === 10) {
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
  
  // Calculate total reach cost and penalties
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