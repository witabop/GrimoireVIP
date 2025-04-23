import React, { useState, useEffect } from 'react';
import { DEFAULT_REACHES } from '../data/reachesData';
import { 
  calculateReachEffects, 
  getDefaultPotency, 
  getFreeDurationLevel,
  calculateDurationPenalty,
  calculateReachEffectsWithPrimaryFactor
} from '../utils/spellCalculations';

const ReachSelector = ({ 
  selectedSpell, 
  selectedReaches, 
  setSelectedReaches, 
  availableReaches,
  yantras,
  setYantras,
  setPotencyBoost,
  arcanaValue,
  setDicePoolModifier,
  dicePoolModifier,
  setManaModifier,
  manaModifier,
  potencyBoostLevel,
  setPotencyBoostLevel,
}) => {
  
  // const [potencyBoostLevel, setPotencyBoostLevel] = useState(0);
  const [isDurationAdvanced, setIsDurationAdvanced] = useState(false);
  
  // Additional modifiers
  const [reachesModifier, setReachesModifier] = useState(0);

  // Track which durations are selected
  const [selectedDuration, setSelectedDuration] = useState(null);

  // Check if a reach option is selected
  const isReachSelected = (reachName) => {
    return selectedReaches.includes(reachName);
  };

  // Get current effective primary factor
  const getCurrentPrimaryFactor = () => {
    if (selectedReaches.includes("Change Primary Factor: Duration")) {
      return "Duration";
    } 
    if (selectedReaches.includes("Change Primary Factor: Potency")) {
      return "Potency";
    }
    return selectedSpell?.primaryFactor || "";
  };

  // Update tracking state when selectedReaches changes
  useEffect(() => {
    // Check for advanced scale reach
    const hasAdvancedDurationReach = selectedReaches.some(reach => 
      reach.startsWith("Duration: One") || reach === "Duration: Indefinite"
    );
    setIsDurationAdvanced(hasAdvancedDurationReach);

    // Update selected duration
    const durationReach = selectedReaches.find(reach => reach.startsWith("Duration:"));
    setSelectedDuration(durationReach || null);
  }, [selectedReaches]);

  const handleReachToggle = (reachName) => {
    // If toggling a duration option, unselect other durations
    if (reachName.startsWith("Duration:")) {
      // If this duration option is already selected, just remove it
      if (isReachSelected(reachName)) {
        setSelectedReaches(selectedReaches.filter(r => r !== reachName));
        return;
      }
      
      // Otherwise, remove other duration options and add this one
      const otherReaches = selectedReaches.filter(r => !r.startsWith("Duration:"));
      setSelectedReaches([...otherReaches, reachName]);
      return;
    }

    // Special handling for primary factor changes
    if (reachName === "Change Primary Factor: Duration" || reachName === "Change Primary Factor: Potency") {
      // If already selected, just remove it
      if (isReachSelected(reachName)) {
        setSelectedReaches(selectedReaches.filter(r => r !== reachName));
        return;
      }
      
      // Remove any other primary factor changes
      const filteredReaches = selectedReaches.filter(r => 
        r !== "Change Primary Factor: Duration" && r !== "Change Primary Factor: Potency"
      );
      setSelectedReaches([...filteredReaches, reachName]);
      return;
    }

    // Normal toggle for other reaches
    if (isReachSelected(reachName)) {
      setSelectedReaches(selectedReaches.filter(r => r !== reachName));
    } else {
      setSelectedReaches([...selectedReaches, reachName]);
    }
  };

  // Handle potency boost changes with individual level checkboxes
  const handlePotencyBoostChange = (level) => {
    if (potencyBoostLevel === level) {
      // If clicking the currently selected level, turn it off
      setPotencyBoostLevel(0);
      setPotencyBoost(0);
    } else {
      setPotencyBoostLevel(level);
      setPotencyBoost(level);
    }
  };

  // Get category-based reaches
  const getReachesByCategory = () => {
    const categories = {};
    
    DEFAULT_REACHES.forEach(reach => {
      if (!categories[reach.category]) {
        categories[reach.category] = [];
      }
      categories[reach.category].push(reach);
    });
    
    return categories;
  };

  // Determine if duration option has free penalty based on arcana level
  const getDurationPenaltyText = (durationOption) => {
    if (!selectedSpell) return null;

    const effectivePrimaryFactor = getCurrentPrimaryFactor();
    const isDurationPrimary = effectivePrimaryFactor === "Duration";
    
    // If duration isn't primary, show full penalty
    if (!isDurationPrimary) {
      return DEFAULT_REACHES.find(r => r.name === durationOption)?.dicePenalty || 0;
    }

    // Check if this is an advanced scale option
    const isAdvanced = durationOption.startsWith("Duration: One") || durationOption === "Duration: Indefinite";
    
    // Calculate the free level based on arcana value
    const freeLevel = getFreeDurationLevel(arcanaValue, selectedSpell.primaryFactor, effectivePrimaryFactor, isAdvanced);
    
    // Get the level of this duration option
    const optionLevel = getDurationLevel(durationOption, isAdvanced);
    
    // If this option's level is <= free level, it's free
    if (optionLevel <= freeLevel) {
      return "Free";
    }
    
    // Otherwise calculate the partial penalty
    const reach = DEFAULT_REACHES.find(r => r.name === durationOption);
    if (!reach) return 0;
    
    const actualPenalty = calculateDurationPenalty(
      durationOption, 
      arcanaValue, 
      selectedSpell.primaryFactor, 
      effectivePrimaryFactor, 
      isAdvanced
    );
    
    return actualPenalty;
  };

  // Helper to get duration level for UI display
  const getDurationLevel = (durationName, isAdvanced) => {
    // For standard scale durations
    if (!isAdvanced) {
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
      case 'Duration: Indefinite': return 6;
      default: return 0;
    }
  };

  // Use the primary-factor-aware calculation
  const getEffectiveCosts = () => {
    if (!selectedSpell) return { totalPenalty: 0, manaCost: 0 };
    
    const currentPrimaryFactor = getCurrentPrimaryFactor();
    
    return calculateReachEffectsWithPrimaryFactor(
      selectedReaches,
      selectedSpell,
      DEFAULT_REACHES,
      arcanaValue,
      selectedSpell.primaryFactor,
      currentPrimaryFactor !== selectedSpell.primaryFactor ? currentPrimaryFactor : null
    );
  };

  // Get costs that account for primary factor benefits
  const { totalPenalty, manaCost } = getEffectiveCosts();

  // Calculate additional dice penalty from potency boost
  const potencyPenalty = potencyBoostLevel * 2;

  const categorizedReaches = getReachesByCategory();

  // Get the default potency based on primary factor
  const defaultPotency = selectedSpell 
    ? getDefaultPotency(arcanaValue, selectedSpell.primaryFactor, getCurrentPrimaryFactor()) 
    : 0;

  return (
    <div className="card animate-slideInRight">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-xl font-bold flex items-center">
          <i className="fas fa-cog mr-3 text-blue-400"></i> Customize Spell
        </h2>
      </div>

      
      {selectedSpell ? (
        <>
          <div className="flex justify-between items-center mb-3">
            <div className="font-medium flex items-center">
              <i className="fas fa-list-alt mr-2 text-green-400"></i>
              Select Reaches:
            </div>
            <span className={`text-sm font-medium px-3 py-1 rounded-full ${
              availableReaches < 0 ? 'bg-red-900 text-red-200' : 
              availableReaches > 0 ? 'bg-green-900 text-green-200' : 
              'bg-yellow-900 text-yellow-200'
            }`}>
              Available: {availableReaches + reachesModifier}
            </span>
          </div>

          
          
          
          {/* Spell Information */}
          <div className="mb-4 bg-slate-700 rounded-lg p-4">
            <h4 className="text-sm font-bold text-blue-300 mb-3 flex items-center">
              <i className="fas fa-info-circle mr-2"></i> Spell Information
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-slate-800 p-3 rounded-lg">
                <span className="text-slate-400 block mb-1">Practice:</span>
                <span className="text-white font-medium">{selectedSpell.practice}</span>
              </div>
              <div className="bg-slate-800 p-3 rounded-lg">
                <span className="text-slate-400 block mb-1">Primary Factor:</span>
                <span className="text-white font-medium flex items-center">
                  {getCurrentPrimaryFactor()}
                  {getCurrentPrimaryFactor() !== selectedSpell.primaryFactor && 
                    <span className="ml-2 text-xs text-indigo-300">(changed)</span>
                  }
                </span>
              </div>
              <div className="bg-slate-800 p-3 rounded-lg">
                <span className="text-slate-400 block mb-1">Default Potency:</span>
                <span className="text-white font-medium flex items-center">
                  {defaultPotency}
                </span>
              </div>
              {selectedSpell.withstand && (
                <div className="bg-slate-800 p-3 rounded-lg">
                  <span className="text-slate-400 block mb-1">Withstand:</span>
                  <span className="text-white font-medium">{selectedSpell.withstand}</span>
                </div>
              )}
            </div>
            {selectedSpell.skills && selectedSpell.skills.length > 0 && (
            <div className="mt-4 mb-4 bg-indigo-900 bg-opacity-30 p-3 rounded-lg border border-indigo-800">
              <h4 className="text-sm font-bold text-indigo-300 mb-3 flex items-center">
                <i className="fas fa-graduation-cap mr-2"></i> Rote Skills
              </h4>
              <div className="flex flex-wrap gap-2" style={{fontSize: 15, fontStyle: 'italic', color: '#cbd5e1'}}>
                {selectedSpell.skills.map((skill, index) => (
                  <span 
                    key={index} 
                    className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-800 text-indigo-200 text-xs font-medium"
                  >
                    <i className="fas fa-book-open mr-1"></i> <span style={{marginRight: 5}}>{skill}</span>
                  </span>
                ))}
              </div>
              <div className="text-xs text-indigo-200 mt-2" style={{fontSize: 12, fontStyle: 'italic', color: '#cbd5e1'}}>
                <i className="fas fa-info-circle mr-1" ></i>
                These skills can be added to the yantra bonus as Mudra when casting a Rote.
              </div>
            </div>
          )}
          </div>

          {/* Potency Boost Section */}
          <div className="mb-4 bg-slate-700 rounded-lg p-4">
            <h4 className="text-sm font-bold text-purple-300 mb-3 flex items-center">
              <i className="fas fa-bolt mr-2"></i> Boost Potency
            </h4>
            <div className="space-y-4">
              <p className="text-sm text-slate-300 mb-2">Select a potency boost level:</p>
              <div className="flex items-center justify-between space-x-3">
                {[1, 2, 3, 4, 5].map((level) => (
                  <div key={level} className="flex flex-col items-center">
                    <label className={`p-4 w-12 h-12 rounded-lg flex items-center justify-center cursor-pointer ${
                      potencyBoostLevel === level 
                        ? 'bg-indigo-600 text-white shadow-lg border' 
                        : 'bg-slate-900 text-slate-300 hover:bg-slate-600 shadow-lg'
                    } transition-colors mb-2`} style={{cursor: 'pointer'}}>
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={potencyBoostLevel === level}
                        onChange={() => handlePotencyBoostChange(level)}
                      />
                      +{level}
                    </label>
                    {potencyBoostLevel === level && (
                      <span className="text-yellow" style={{fontSize: 11, color: '#facc15', padding: 3.5, borderRadius: 10, marginTop: 5}}>-{level * 2} dice</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          
          <div className="custom-scrollbar bg-slate-700 rounded-lg border border-slate-700 p-4 mb-4">
            {/* Special Reaches for this spell */}
            {selectedSpell.specialReaches && selectedSpell.specialReaches.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-bold text-blue-400 mb-2 flex items-center">
                  <i className="fas fa-star mr-2"></i> Special Reaches
                </h4>
                <div className="bg-slate-800 rounded-lg p-3 space-y-2">
                  {selectedSpell.specialReaches.map(reach => (
                    <div key={reach.name} className="relative">
                      <label className="flex items-center cursor-pointer p-2 rounded-lg hover:bg-slate-700 transition-colors" style={{cursor: 'pointer'}}>
                        <input
                          type="checkbox"
                          checked={isReachSelected(reach.name)}
                          onChange={() => handleReachToggle(reach.name)}
                          className="mr-3 h-4 w-4 text-indigo-500 rounded focus:ring-indigo-400"
                          style={{cursor: 'pointer'}}
                        />
                        <span className="flex-grow">
                          {reach.name} 
                        </span>
                        {reach.cost > 1 && 
                          <span className="badge badge-purple ml-2">
                            {reach.cost} Reaches
                          </span>
                        }
                      </label>
                      {reach.description && (
                        <div className="text-xs text-slate-400 ml-9 mt-1">
                          {reach.description}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Default Reaches categorized */}
            <div>
              <h4 className="text-sm font-bold text-green-400 mb-2 flex items-center">
                <i className="fas fa-list mr-2"></i> Standard Reaches
              </h4>
              
              {Object.entries(categorizedReaches).map(([category, reaches]) => (
                <div key={category} className="mb-4">
                  <div className="flex items-center mb-2">
                    <div className="h-px bg-slate-700 flex-grow"></div>
                    <h5 className="text-xs font-bold text-slate-400 mx-3 uppercase tracking-wider">{category}</h5>
                    <div className="h-px bg-slate-700 flex-grow"></div>
                  </div>
                  
                  <div className="bg-slate-800 rounded-lg p-3 space-y-2">
                    {reaches.map(reach => {
                      // Special handling for duration options
                      const isDurationOption = reach.name.startsWith("Duration:");
                      const durationPenalty = isDurationOption ? getDurationPenaltyText(reach.name) : null;
                      
                      return (
                        <div key={reach.name} className="relative">
                          <label className={`flex items-center cursor-pointer p-2 rounded-lg transition-colors ${
                            isReachSelected(reach.name) ? 'bg-slate-700' : 'hover:bg-slate-700'
                          }`} style={{cursor: 'pointer'}}>
                            <input
                              type="checkbox"
                              checked={isReachSelected(reach.name)}
                              onChange={() => handleReachToggle(reach.name)}
                              className="mr-3 h-4 w-4 text-indigo-500 rounded focus:ring-indigo-400"
                              style={{cursor: 'pointer'}}
                            />
                            <span className={`flex-grow ${reach.dicePenalty ? 'text-yellow-300' : 'text-slate-300'}`}>
                              {reach.name}
                            </span>
                            
                            <div className="flex space-x-2">
                              {isDurationOption ? (
                                <span className={`badge ${durationPenalty === "Free" ? 'badge-green' : 'badge-yellow'}`}>
                                  {durationPenalty === "Free" ? 'Free' : `-${durationPenalty}`}
                                </span>
                              ) : reach.dicePenalty ? (
                                <span className="badge badge-yellow">
                                  -{reach.dicePenalty}
                                </span>
                              ) : null}
                              
                              {reach.manaCost && (
                                <span className="badge badge-blue">
                                  {reach.manaCost} Mana
                                </span>
                              )}
                            </div>
                          </label>
                          
                          {reach.description && (
                            <div className="text-xs text-slate-400 ml-9 mt-1">
                              {reach.description}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {availableReaches + reachesModifier < 0 && (
            <div className="mt-2 mb-4 text-red-400 text-sm flex items-center bg-red-900 bg-opacity-30 p-3 rounded-lg border border-red-900 animate-pulse-subtle">
              <i className="fas fa-exclamation-triangle mr-2"></i>
              You've selected more reaches than available
            </div>
          )}
          
          {(totalPenalty > 0 || potencyPenalty > 0 || manaCost > 0 || dicePoolModifier !== 0 || manaModifier !== 0) && (
            <div className="p-4 bg-slate-800 rounded-lg mb-4 text-sm animate-fadeIn shadow-md">
              <div className="font-bold mb-3 text-slate-300">Costs Summary:</div>
              <div className="space-y-2">
                {potencyPenalty > 0 && (
                  <div className="text-yellow-300 flex items-center p-2 bg-yellow-900 bg-opacity-30 rounded-lg">
                    <i className="fas fa-bolt mr-2"></i>
                    Potency Boost Penalty: -{potencyPenalty} dice
                  </div>
                )}
                {totalPenalty > 0 && (
                  <div className="text-yellow-300 flex items-center p-2 bg-yellow-900 bg-opacity-30 rounded-lg">
                    <i className="fas fa-dice-d20 mr-2"></i>
                    Reach Penalty: -{totalPenalty} dice
                  </div>
                )}
                {dicePoolModifier !== 0 && (
                  <div className={`flex items-center p-2 rounded-lg ${
                    dicePoolModifier > 0 ? 'text-green-300 bg-green-900 bg-opacity-30' : 'text-red-300 bg-red-900 bg-opacity-30'
                  }`}>
                    <i className="fas fa-dice-d20 mr-2"></i>
                    Dice Pool Modifier: {dicePoolModifier > 0 ? `+${dicePoolModifier}` : dicePoolModifier} dice
                  </div>
                )}
                {(potencyPenalty > 0 || totalPenalty > 0 || dicePoolModifier !== 0) && (
                  <div className={`flex items-center p-2 rounded-lg ${
                    (totalPenalty + potencyPenalty - dicePoolModifier) >= 0 ? 'text-red-400 bg-red-900 bg-opacity-30' : 'text-green-400 bg-green-900 bg-opacity-30'
                  }`}>
                    <i className="fas fa-dice-d20 mr-2"></i>
                    Total Dice Modifier: {dicePoolModifier - totalPenalty - potencyPenalty} dice
                  </div>
                )}
                {(manaCost > 0 || manaModifier !== 0) && (
                  <div className="text-blue-400 flex items-center p-2 bg-blue-900 bg-opacity-30 rounded-lg">
                    <i className="fas fa-tint mr-2"></i>
                    Mana Cost: {manaCost + manaModifier} {manaModifier !== 0 ? `(${manaModifier > 0 ? '+' : ''}${manaModifier} modified)` : ''}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="mb-3 bg-slate-700 p-4 rounded-lg">
            <label className="block mb-3 font-medium flex items-center">
              <i className="fas fa-plus-circle mr-2 text-purple-400"></i>
              Yantra Modifier:
            </label>
            <div className="flex items-center space-x-3">
              <input 
                type="number" 
                min="0"
                value={yantras} 
                onChange={(e) => setYantras(parseInt(e.target.value))} 
                className="w-10 bg-slate-700 text-white border border-slate-600 rounded-md p-2 text-center focus-ring mr-2"
                style={{ fontSize: 14, fontWeight: 'bold', width: '20%' }}
              />
              <div className="dot-notation flex-grow">{"+".repeat(yantras)}</div>
            </div>
            <div className="mt-4 text-sm text-slate-400 bg-slate-800 p-3 rounded-md" style={{fontSize: 14}} >
              <i className="fas fa-info-circle mr-2" ></i>
              <span className="font-medium">Yantras</span> add bonus dice to your spell casting. Common examples include: <span style={{fontSize: 11, fontStyle: 'italic'}}>Dedicated magical tool, Symbols, Runes, Descriptive Casting, Runes, etc.</span>
            </div>
          </div>

          {/* Additional Modifiers Section */}
          <div className="mb-4 bg-slate-700 rounded-lg p-4">
            <h4 className="text-sm font-bold text-amber-300 mb-3 flex items-center">
              <i className="fas fa-sliders-h mr-2"></i> Additional Modifiers
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Dice Pool Modifier */}
              <div className="bg-slate-800 p-3 rounded-lg">
                <label className="block mb-2 text-sm font-medium flex items-center">
                  <i className="fas fa-dice-d20 mr-2 text-slate-400"></i>
                  Dice Pool
                </label>
                <div className="flex items-center">
                  <button 
                    onClick={() => setDicePoolModifier(Math.max(-10, dicePoolModifier - 1))}
                    className="bg-slate-700 hover:bg-slate-600 rounded-l-lg px-3 py-2 transition-colors"
                  >
                    <i className="fas fa-minus" style={{fontSize: 13, margin: 5}}></i>
                  </button>
                  <div className="w-12 py-2 bg-slate-900 text-center font-bold text-white">
                    {dicePoolModifier > 0 ? `+${dicePoolModifier}` : dicePoolModifier}
                  </div>
                  <button 
                    onClick={() => setDicePoolModifier(Math.min(10, dicePoolModifier + 1))}
                    className="bg-slate-700 hover:bg-slate-600 rounded-r-lg px-3 py-2 transition-colors"
                  >
                    <i className="fas fa-plus" style={{fontSize: 13, margin: 5}}></i>
                  </button>
                </div>
              </div>
              
              {/* Reaches Modifier */}
              <div className="bg-slate-800 p-3 rounded-lg">
                <label className="block mb-2 text-sm font-medium flex items-center">
                  <i className="fas fa-magic mr-2 text-indigo-400"></i>
                  Reaches
                </label>
                <div className="flex items-center">
                  <button 
                    onClick={() => setReachesModifier(Math.max(-5, reachesModifier - 1))}
                    className="bg-slate-700 hover:bg-slate-600 rounded-l-lg px-3 py-2 transition-colors"
                  >
                    <i className="fas fa-minus" style={{fontSize: 13, margin: 5}}></i>
                  </button>
                  <div className="w-12 py-2 bg-slate-900 text-center font-bold text-white">
                    {reachesModifier > 0 ? `+${reachesModifier}` : reachesModifier}
                  </div>
                  <button 
                    onClick={() => setReachesModifier(Math.min(5, reachesModifier + 1))}
                    className="bg-slate-700 hover:bg-slate-600 rounded-r-lg px-3 py-2 transition-colors"
                  >
                    <i className="fas fa-plus" style={{fontSize: 13, margin: 5}}></i>
                  </button>
                </div>
              </div>
              
              {/* Mana Modifier */}
              <div className="bg-slate-800 p-3 rounded-lg">
                <label className="block mb-2 text-sm font-medium flex items-center">
                  <i className="fas fa-tint mr-2 text-blue-400"></i>
                  Mana
                </label>
                <div className="flex items-center">
                  <button 
                    onClick={() => setManaModifier(Math.max(-5, manaModifier - 1))}
                    className="bg-slate-700 hover:bg-slate-600 rounded-l-lg px-3 py-2 transition-colors"
                  >
                    <i className="fas fa-minus" style={{fontSize: 13, margin: 5}}></i>
                  </button>
                  <div className="w-12 py-2 bg-slate-900 text-center font-bold text-white">
                    {manaModifier > 0 ? `+${manaModifier}` : manaModifier}
                  </div>
                  <button 
                    onClick={() => setManaModifier(Math.min(5, manaModifier + 1))}
                    className="bg-slate-700 hover:bg-slate-600 rounded-r-lg px-3 py-2 transition-colors"
                  >
                    <i className="fas fa-plus" style={{fontSize: 13, margin: 5}}></i>
                  </button>
                </div>
              </div>
            </div>
            
            <div className="mt-4 text-sm text-slate-400 bg-slate-800 bg-opacity-50 p-3 rounded-md">
              <i className="fas fa-info-circle mr-2"></i>
              These modifiers allow for additional adjustments to your spell that may not be covered by default.
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};

export default ReachSelector;