import React, { useEffect } from 'react';
import { DEFAULT_REACHES } from '../data/reachesData';
import {
  getDefaultPotency,
  getRitualIntervalMinutes,
  formatRitualDuration,
  getMaxYantrasForGnosis
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
  arcanaValues,
  setDicePoolModifier,
  dicePoolModifier,
  setManaModifier,
  manaModifier,
  reachesModifier,
  setReachesModifier,
  potencyBoostLevel,
  setPotencyBoostLevel,
  getCurrentPrimaryFactor,
  setDefaultCSPotency,
  gnosis,
  ritualBoost,
  setRitualBoost
}) => {
  // Track if we're viewing a combined spell
  const isCombinedSpell = selectedSpell?.combined;

  // Handle reach toggle
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

  // Check if a reach option is selected
  const isReachSelected = (reachName) => {
    return selectedReaches.includes(reachName);
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

  // Get all special reaches from a combined spell
  const getAllSpecialReaches = () => {
    if (!isCombinedSpell || !selectedSpell) {
      return selectedSpell?.specialReaches || [];
    }

    // Combine all special reaches from component spells
    const allSpecialReaches = [];
    selectedSpell.componentSpells.forEach(spell => {
      if (spell.specialReaches) {
        allSpecialReaches.push(...spell.specialReaches);
      }
    });

    return allSpecialReaches;
  };

  // Get the current spellcasting arcana value
  const getCurrentArcanaValue = () => {
    if (!selectedSpell) return 0;

    if (isCombinedSpell && selectedSpell.lowestArcanum) {
      // This should now be the lowest arcanum by dots, not level
      return selectedSpell.lowestArcanum.value;
    }

    // For non-combined spells
    if (arcanaValues && selectedSpell.arcanum) {
      const arcanum = selectedSpell.arcanum.toLowerCase();
      return arcanaValues[arcanum] || 0;
    }

    return 0;
  };
  // Determine if duration option has free penalty based on arcana level
  const getDurationPenaltyText = (durationOption) => {
    if (!selectedSpell) return null;

    const effectivePrimaryFactor = getCurrentPrimaryFactor();

    // For combined spells, check if any component has Duration as primary
    const isDurationPrimary = isCombinedSpell ?
      selectedSpell.primaryFactor.split('/').includes('Duration') || effectivePrimaryFactor === 'Duration' :
      effectivePrimaryFactor === 'Duration';

    const currentArcanaValue = getCurrentArcanaValue();

    // If duration isn't primary, show full penalty
    if (!isDurationPrimary) {
      return DEFAULT_REACHES.find(r => r.name === durationOption)?.dicePenalty || 0;
    }

    // Check if this is an advanced scale option
    const isAdvanced = durationOption.startsWith("Duration: One") || durationOption === "Duration: Indefinite";

    // Get the level of this duration option
    const optionLevel = getDurationLevel(durationOption, isAdvanced);

    // Calculate the free level based on arcana value
    // For combined spells, use the selected spell's lowest arcanum value
    const freeLevel = Math.min(currentArcanaValue, 5); // Cap at 5

    // If this option's level is <= free level, it's free
    if (optionLevel <= freeLevel) {
      return "Free";
    }

    // Otherwise get the standard penalty
    const reach = DEFAULT_REACHES.find(r => r.name === durationOption);
    if (!reach) return 0;

    return reach.dicePenalty;
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

  const maxYantras = getMaxYantrasForGnosis(gnosis ?? 1);
  const ritualIntervalMin = getRitualIntervalMinutes(gnosis ?? 1);
  const ritualTotalMin = (1 + (ritualBoost || 0)) * ritualIntervalMin;

  const categorizedReaches = getReachesByCategory();
  const specialReaches = getAllSpecialReaches();

  // Get the default potency based on primary factor
  const getDefaultPotencyForCombinedSpell = () => {
    if (!selectedSpell) return 0;

    const currentArcanaValue = getCurrentArcanaValue();
    const primaryFactor = getCurrentPrimaryFactor();

    // If it's a combined spell with mixed primary factors
    if (isCombinedSpell) {
      const primaryFactors = selectedSpell.primaryFactor.split('/');

      // Make sure we always provide potency based on lowest arcanum when Potency is a primary factor
      if (primaryFactors.includes('Potency') || primaryFactor === 'Potency') {
        // Explicitly use the lowestArcanum value which should be correct
        return selectedSpell.lowestArcanum.value;
      }

      // If no Potency as primary factor, default to 1
      return 1;
    }

    return getDefaultPotency(currentArcanaValue, selectedSpell.primaryFactor, primaryFactor);
  };

  const combinedDefaultPotency = isCombinedSpell ? getDefaultPotencyForCombinedSpell() : 0;
  useEffect(() => {
    if (isCombinedSpell) setDefaultCSPotency(combinedDefaultPotency);
  }, [isCombinedSpell, combinedDefaultPotency, setDefaultCSPotency]);

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
            <span className={`text-sm font-medium px-3 py-1 rounded-full ${availableReaches < 0 ? 'bg-red-900 text-red-200' :
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
            <div className="grid grid-cols-2 gap-4 text-sm p-3">
              <div className="bg-slate-700 rounded-lg">
                <span className="text-slate-400 block mb-1">Practice:</span>
                <span className="text-white font-medium">
                  {isCombinedSpell
                    ? selectedSpell.practice
                    : selectedSpell.practice}
                </span>
              </div>
              <div className="bg-slate-700 rounded-lg">
                <span className="text-slate-400 block mb-1">Primary Factor:</span>
                <span className="text-white font-medium flex items-center">
                  {getCurrentPrimaryFactor()}
                  {getCurrentPrimaryFactor() !== selectedSpell.primaryFactor &&
                    <span className="ml-1 text-[11px] text-indigo-300">
                      (changed)
                    </span>
                  }
                </span>
              </div>
              <div className="bg-slate-700 rounded-lg">
                <span className="text-slate-400 block mb-1">Default Potency:</span>
                <span className="text-white font-medium flex items-center">
                  {combinedDefaultPotency}
                </span>
              </div>
              {selectedSpell.withstand && (
                <div className="bg-slate-700 rounded-lg">
                  <span className="text-slate-400 block mb-1">Withstand:</span>
                  <span className="text-white font-medium">
                    {selectedSpell.withstand}
                  </span>
                </div>
              )}
            </div>

            {!selectedSpell.combined && selectedSpell.castingType === 'rote' && selectedSpell.roteSkill && (
              <div className="mt-3 mb-4 bg-indigo-900/30 p-3 rounded-lg border border-slate-700">
                <h4 className="text-sm font-bold text-indigo-300 mb-2 flex items-center">
                  <i className="fas fa-graduation-cap mr-2"></i> Rote Skill
                </h4>
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-800 text-indigo-200 text-xs font-medium">
                  <i className="fas fa-book-open mr-1"></i> {selectedSpell.roteSkill.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()).trim()}
                </span>
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
              <div className="flex flex-wrap items-center justify-between gap-3">
                {[1, 2, 3, 4, 5].map((level) => (
                  <div key={level} className="flex flex-col items-center">
                    <label className={`p-4 w-12 h-12 rounded-lg flex items-center justify-center cursor-pointer border transition-colors mb-2 ${potencyBoostLevel === level
                      ? 'bg-indigo-600 text-white shadow-lg border-indigo-500'
                      : 'bg-slate-900 text-slate-300 hover:bg-slate-600 shadow-lg border-slate-700'
                      }`}>
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={potencyBoostLevel === level}
                        onChange={() => handlePotencyBoostChange(level)}
                      />
                      +{level}
                    </label>
                    {potencyBoostLevel === level && (
                      <span className="text-[11px] text-yellow-400 p-1 rounded-lg mt-1">-{level * 2} dice</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="custom-scrollbar bg-slate-700 rounded-lg p-4 mb-4 ring-1 ring-slate-800/80">
            <div className="mb-4 bg-slate-800 p-4 rounded-lg">
              <h4 className="text-sm font-bold text-blue-400 mb-2 flex items-center">
                <i className="fas fa-star mr-2"></i> All Available Reaches
              </h4>

              {/* Special Reaches */}
              {specialReaches?.length > 0 && (
                <div className="bg-slate-800 rounded-lg p-3 space-y-2 mb-4 text-sm">
                  {specialReaches.map(reach => (
                    <div key={reach.name} className="relative">
                      <label className="flex items-center cursor-pointer p-2 rounded-lg hover:bg-slate-700 transition-colors mb-4">
                        <input
                          type="checkbox"
                          checked={isReachSelected(reach.name)}
                          onChange={() => handleReachToggle(reach.name)}
                          className="mr-3 h-4 w-4 cursor-pointer text-indigo-500 rounded border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-800"
                        />
                        <span className="flex-grow">
                          {reach.name}
                        </span>
                        <div>
                          {reach.cost > 1 &&
                            <span className="badge badge-purple ml-2.5 mb-4 whitespace-nowrap">
                              {reach.cost} Reaches
                            </span>
                          }
                          {reach.manaCost > 0 && (
                            <span className="badge badge-blue ml-2.5 whitespace-nowrap">
                              {reach.manaCost} Mana
                            </span>
                          )}
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
              )}

              {/* Standard Reaches by category */}
              {Object.entries(categorizedReaches).map(([category, reaches]) => (
                <div key={category} className="mb-2 mt-2">
                  <div className="flex items-center mb-2">
                    <div className="h-px bg-slate-700 flex-grow"></div>
                    <h5 className="font-bold text-slate-400 mx-3 uppercase tracking-wider text-sm">{category}</h5>
                    <div className="h-px bg-slate-700 flex-grow"></div>
                  </div>

                  <div className="bg-slate-800 rounded-lg p-3 space-y-2">
                    {reaches.map(reach => {
                      // Special handling for duration options
                      const isDurationOption = reach.name.startsWith("Duration:");
                      const durationPenalty = isDurationOption ? getDurationPenaltyText(reach.name) : null;

                      return (
                        <div key={reach.name} className="relative">
                          <label className={`flex items-center cursor-pointer p-2 rounded-lg transition-colors ${isReachSelected(reach.name) ? 'bg-slate-700' : 'hover:bg-slate-700'
                            }`}>
                            <input
                              type="checkbox"
                              checked={isReachSelected(reach.name)}
                              onChange={() => handleReachToggle(reach.name)}
                              className="mr-3 h-4 w-4 cursor-pointer text-indigo-500 rounded border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-800"
                            />
                            <span className={`flex-grow text-slate-300`}>
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
                                <span className="badge badge-blue whitespace-nowrap">
                                  {reach.manaCost} Mana
                                </span>
                              )}
                            </div>
                          </label>

                          {reach.description && (
                            <div className="text-slate-400 ml-9 mt-1 text-[13px]">
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
            <div className="mt-2 mb-4 text-red-300 text-sm flex items-center bg-red-950/50 p-3 rounded-lg border border-slate-700 animate-pulse-subtle">
              <i className="fas fa-exclamation-triangle mr-2"></i>
              You've selected more reaches than available
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
                onChange={(e) => {
                  const v = parseInt(e.target.value, 10);
                  setYantras(Number.isNaN(v) ? 0 : Math.max(0, v));
                }}
                className="w-1/5 bg-slate-700 text-white text-sm font-bold border border-slate-600 rounded-md p-2 text-center mr-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-800"
              />
              <div className="dot-notation flex-grow">{"+".repeat(yantras)}</div>
            </div>
            <div className="mt-4 text-sm text-slate-400 bg-slate-800 p-3 rounded-lg">
              <p>
                <i className="fas fa-info-circle mr-2 text-slate-500" />
                <span className="font-medium text-slate-300">Yantra dice bonus</span> — enter the total extra dice from your yantras.
              </p>
              <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                Common examples: dedicated tool, mudra, mantras, sacraments, demesne, etc.
              </p>
              <p className="mt-2 pt-3 border-t border-slate-700 text-indigo-200/95 text-xs leading-relaxed">
                <i className="fas fa-layer-group mr-2 text-indigo-400" />
                <span className="font-semibold text-indigo-200">Yantra limit (Gnosis {gnosis ?? 1}):</span> up to{' '}
                <span className="font-bold text-white">{maxYantras}</span> separate yantras may be used on one spell.
              </p>
            </div>
          </div>

          <div className="mb-3 bg-slate-700 p-4 rounded-lg">
            <label className="block mb-3 font-medium flex items-center">
              <i className="fas fa-hourglass-half mr-2"></i>
              Ritual Boost
            </label>
            <p className="text-xs text-slate-400 mb-3">
              Each point adds <span className="text-green-300 font-medium">+1 die</span> to the pool and extends casting by one ritual interval for your Gnosis (
              {formatRitualDuration(ritualIntervalMin) || `${ritualIntervalMin} minutes`} per interval).
            </p>
            <div className="flex flex-wrap gap-2">
              {[0, 1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRitualBoost(n)}
                  className={`min-w-[2.5rem] px-3 py-2 rounded-lg text-sm font-bold transition-colors ${
                    ritualBoost === n
                      ? 'bg-amber-600 text-white shadow-md'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {n === 0 ? 'None' : `+${n}`}
                </button>
              ))}
            </div>
            {ritualBoost > 0 && (
              <p className="mt-2 text-sm text-amber-200/95">
                <i className="fas fa-clock mr-2" />
                Estimated ritual casting time:{' '}
                <span className="font-semibold text-white">
                  {formatRitualDuration(ritualTotalMin) || '—'}
                </span>
              </p>
            )}
          </div>

          {/* Additional Modifiers Section */}
          <div className="mb-4 bg-slate-700 rounded-lg p-4">
            <h4 className="text-sm font-bold text-amber-300 mb-3 flex items-center">
              <i className="fas fa-sliders-h mr-2"></i> Additional Modifiers
            </h4>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Dice', icon: 'fa-dice-d20', color: 'text-slate-400', value: dicePoolModifier, set: setDicePoolModifier, min: -10, max: 10 },
                { label: 'Reaches', icon: 'fa-magic', color: 'text-indigo-400', value: reachesModifier, set: setReachesModifier, min: -5, max: 5 },
                { label: 'Mana', icon: 'fa-tint', color: 'text-blue-400', value: manaModifier, set: setManaModifier, min: -5, max: 5 },
              ].map((m) => (
                <div key={m.label} className="bg-slate-800 p-3 rounded-lg overflow-hidden">
                  <label className="block mb-2 text-sm font-medium flex items-center">
                    <i className={`fas ${m.icon} mr-2 ${m.color}`}></i>
                    {m.label}
                  </label>
                  <div className="flex items-stretch rounded-lg overflow-hidden bg-slate-900">
                    <button
                      type="button"
                      onClick={() => m.set(Math.max(m.min, m.value - 1))}
                      className="flex-1 py-2 hover:bg-slate-600 transition-colors flex items-center justify-center"
                    >
                      <i className="fas fa-minus text-xs"></i>
                    </button>
                    <div className="w-10 py-2 text-center font-bold text-white text-sm flex items-center justify-center border-x border-slate-700">
                      {m.value > 0 ? `+${m.value}` : m.value}
                    </div>
                    <button
                      type="button"
                      onClick={() => m.set(Math.min(m.max, m.value + 1))}
                      className="flex-1 py-2 hover:bg-slate-600 transition-colors flex items-center justify-center"
                    >
                      <i className="fas fa-plus text-xs"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 text-sm text-slate-400 bg-slate-800 bg-opacity-50 p-3 rounded-lg">
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