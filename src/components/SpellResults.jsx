import React from 'react';
import { DEFAULT_REACHES } from '../data/reachesData';

const SpellResults = ({
  selectedSpell,
  displayDicePool,
  rollResults,
  rollContext,
  spellPotency,
  potencyBoost,
  selectedReaches,
  primaryFactor,
  eightAgain,
  setEightAgain,
  nineAgain,
  setNineAgain,
  onAddToActive,
  onAddToInured,
  inuredFull
}) => {

  const isChanceDie = rollResults.length > 0 && rollContext
    ? rollContext.isChanceDie
    : displayDicePool <= 1;
  // Calculate successes from roll results
  const calculateSuccesses = () => {
    if (isChanceDie) {
      // For chance die, only a 10 is a success
      return rollResults.filter(roll => roll === 10).length;
    }
    // Normal success counting (8+)
    return rollResults.filter(roll => roll >= 8).length;
  };

  // Check if there's a dramatic failure (chance die rolled 1)
  const isDramaticFailure = () => {
    return isChanceDie && rollResults.some(roll => roll === 1);
  };

  // Convert numeric value to dot notation
  const getDotNotation = (value) => {
    return "•".repeat(value);
  };

  // Get all selected reaches with descriptions
  const getSelectedReachesWithDescriptions = () => {
    if (!selectedSpell || !selectedReaches || selectedReaches.length === 0) {
      return [];
    }

    const result = [];

    // Add special reaches first
    if (selectedSpell.specialReaches) {
      selectedSpell.specialReaches.forEach(reach => {
        if (selectedReaches.includes(reach.name)) {
          result.push({
            name: reach.name,
            description: reach.description,
            cost: reach.cost,
            manaCost: reach.manaCost,
            isSpecial: true
          });
        }
      });
    }

    // Add standard reaches
    selectedReaches.forEach(reachName => {
      // Skip if it's already added as a special reach
      if (result.some(r => r.name === reachName)) {
        return;
      }

      const defaultReach = DEFAULT_REACHES.find(r => r.name === reachName);
      if (defaultReach) {
        result.push({
          name: defaultReach.name,
          description: defaultReach.description,
          dicePenalty: defaultReach.dicePenalty,
          manaCost: defaultReach.manaCost,
          isSpecial: false
        });
      }
    });

    return result;
  };

  const selectedReachesWithDescriptions = getSelectedReachesWithDescriptions();

  return (
    <div className="card animate-slideInRight">
      <h2 className="card-title">
        <i className="fas fa-fire-alt mr-3 text-red-400"></i> Spell Results
      </h2>

      {selectedSpell ? (
        <>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-slate-700 p-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <h3 className="font-bold mb-2 flex items-center">
                <i className="fas fa-dice mr-2"></i> Dice Pool
              </h3>
              <p className="text-3xl font-bold">
                {displayDicePool}
              </p>

            </div>

            <div className="bg-slate-700 p-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <h3 className="font-bold mb-2 flex items-center text-purple-300">
                <i className="fas fa-fist-raised mr-2"></i> Potency
              </h3>
              <p className="text-3xl font-bold flex items-center">
                {spellPotency}
                {spellPotency > 0 &&
                  <span className="text-sm text-amber-400 ml-1.5 dot-notation">
                    {getDotNotation(spellPotency)}
                  </span>
                }
                {potencyBoost > 0 &&
                  <span className="ml-2 text-sm text-green-400">(+{potencyBoost})</span>
                }
              </p>
            </div>
          </div>

          <div className="mb-4">

            {rollResults.length > 0 && (
              <h3 className="font-bold mb-3 flex items-center text-green-300">
                <i className="fas fa-dice-d20 mr-2"></i> Roll Results
              </h3>
            )}
            {rollResults.length > 0 ? (
              <div className="bg-slate-700 p-4 rounded-lg shadow-md mb-2.5">
                <div className="flex flex-wrap gap-3 mb-4">
                  {rollResults.map((result, index) => (
                    <div
                      key={index}
                      className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg shadow-md transform transition-all duration-300 hover:scale-110 ${isChanceDie
                        ? (result === 10 ? 'bg-green-600 text-white shine-effect' :
                          result === 1 ? 'bg-red-600 text-white' : 'bg-slate-600 text-slate-300')
                        : (result >= 8
                          ? (result === 10 ? 'bg-green-600 text-white shine-effect' : 'bg-blue-600 text-white')
                          : 'bg-slate-600 text-slate-300')
                        }`}
                      
                    >
                      {result}
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-t border-slate-600 pt-4 mt-2 space-y-3 sm:space-y-0">
                  <div className="flex items-center">
                    <span className="text-slate-400 mr-2">Successes:</span>
                    <span className="text-2xl font-bold text-green-400">{calculateSuccesses()}</span>
                  </div>
                  <div className="text-sm text-slate-300">
                    {isChanceDie ? (
                      <span className="badge badge-yellow">Chance Die</span>
                    ) : (
                      <>
                        {eightAgain && !nineAgain && <span className="badge badge-indigo">8-Again Active</span>}
                        {nineAgain && !eightAgain && <span className="badge badge-indigo">9-Again Active</span>}
                        {eightAgain && nineAgain && <span className="badge badge-indigo">8 & 9-Again Active</span>}
                      </>
                    )}
                  </div>
                </div>

                {isDramaticFailure() && (
                  <div className="mt-4 text-red-400 text-sm bg-red-900 bg-opacity-30 p-3 rounded-lg border border-red-900 animate-pulse-subtle">
                    <i className="fas fa-exclamation-circle mr-2"></i>
                    <strong>Dramatic Failure!</strong> Rolling a 1 on a chance die results in a dramatic failure.
                  </div>
                )}
              </div>
            ) : null}

            {/* Spell Description & Details Section */}
            <div className="bg-slate-700 p-4 rounded-lg shadow-md">
              <h3 className="font-bold mb-3 flex items-center text-blue-300">
                <i className="fas fa-book-open mr-2"></i> Spell Details
              </h3>


              <div className="grid grid-cols-2 gap-4 mb-4 text-sm p-3">
                <div className="bg-slate-700 rounded-lg">

                  <span className="text-slate-400 block mb-1">Practice:</span>
                  <span className="text-white font-medium">{selectedSpell.practice}</span>
                </div>
                <div className="bg-slate-700 rounded-lg">
                  <span className="text-slate-400 block mb-1">Primary Factor:</span>
                  <span className="text-white font-medium flex items-center">
                    {primaryFactor || selectedSpell.primaryFactor}
                    {primaryFactor && primaryFactor !== selectedSpell.primaryFactor &&
                      <span className="ml-1 text-[11px] text-indigo-300">(changed)</span>
                    }
                  </span>
                </div>
                {selectedSpell.withstand && (
                  <div className="bg-slate-700 rounded-lg">
                    <span className="text-slate-400 block mb-1">Withstand:</span>
                    <span className="text-white font-medium">{selectedSpell.withstand}</span>
                  </div>
                )}
                {selectedSpell?.combined && (
                  <div className="-mt-2 mb-4 rounded-lg">
                    <p className="text-slate-400 mt-3 mb-1">Component Spells:</p>
                    <div className="gap-2">
                      {selectedSpell.componentSpells.map((spell, idx) => (
                        <div key={idx} className="text-xs text-indigo-200 rounded-full font-medium">
                          • {spell.name}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>


              {/* Description Section */}
              <div className="bg-slate-800 p-4 rounded-lg mb-2">
                <div className="pb-4 rounded-lg mb-2">
                  <h4 className="text-sm font-bold mb-2 text-slate-200">Description:</h4>
                  <p className={`text-slate-300 ${selectedSpell.description.length > 742 ? 'text-xs' : 'text-base'}`}>{selectedSpell.description}</p>
                </div>
                <h4 className="text-sm font-bold mb-4 text-slate-200">Selected Reaches:</h4>
                {selectedReachesWithDescriptions.length > 0 ? (
                  <div className="space-y-2">
                    {selectedReachesWithDescriptions.map((reach, index) => (
                      <div key={index} className="flex">
                        <span className="text-indigo-400 mr-2">•</span>
                        <div>
                          <span className={`font-medium`}>
                            {reach.isSpecial ? (
                              <span className="text-slate-300"><span className="text-indigo-400">{reach.name.split(':')[0]}:</span>{reach.name.split(':')[1]}</span>
                            ) : (
                              <span className="text-slate-300">{reach.name}</span>
                            )}
                          </span>
                          {(reach.manaCost && reach.manaCost > 0) ?
                            <span className="text-blue-100 text-xs" style={{ marginLeft: 4, fontSize: 12, color: '#60a5fa' }}>({reach.manaCost} Mana)</span> : ''
                          }
                          {reach.description && (
                            <div className="text-xs text-slate-400 mt-1 mb-3">{reach.isSpecial ? '' : reach.description}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 italic" style={{ marginTop: -5 }}>No reaches selected</p>
                )}
              </div>
            </div>
          </div>

          {onAddToActive && (
            <button
              type="button"
              onClick={onAddToActive}
              className="w-full mt-4 py-2.5 rounded-lg text-sm font-medium bg-amber-600/20 text-amber-300 border border-amber-600/40 hover:bg-amber-600/30 hover:border-amber-500/50 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <i className="fas fa-bolt" />
              Add to Active Spells
            </button>
          )}
          {onAddToInured && (
            <div className="mt-2">
              <button
                type="button"
                onClick={onAddToInured}
                disabled={inuredFull}
                className={`w-full py-2.5 rounded-lg text-sm font-medium border transition-all duration-200 flex items-center justify-center gap-2 ${
                  inuredFull
                    ? 'bg-slate-700/40 text-slate-500 border-slate-600 cursor-not-allowed'
                    : 'bg-teal-600/20 text-teal-300 border-teal-600/40 hover:bg-teal-600/30 hover:border-teal-500/50'
                }`}
              >
                <i className="fas fa-shield-alt" />
                {inuredFull ? 'Inured Spells Full' : 'Add to Inured Spells'}
              </button>
              <p className="text-[10px] text-slate-500 mt-1.5 text-center leading-relaxed">
                Inuring a spell requires it to have triggered an act of hubris that resulted in Wisdom loss.
              </p>
            </div>
          )}
        </>
      ) : (
        <div className="bg-slate-700 p-8 rounded-lg text-center shadow-md relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 opacity-50"></div>
          <i className="fas fa-book text-6xl mb-4 text-slate-500 relative"></i>
          <p className="text-slate-300 text-lg relative">Select a spell to see results</p>
          <div className="w-24 h-1 bg-slate-600 mx-auto mt-4 rounded-full relative"></div>
        </div>
      )}
    </div>
  );
};

export default SpellResults;