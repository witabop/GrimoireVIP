import React, { useState } from 'react';
import { DEFAULT_REACHES } from '../data/reachesData';
import { calculateReachEffects } from '../utils/spellCalculations';

const ReachSelector = ({ 
  selectedSpell, 
  selectedReaches, 
  setSelectedReaches, 
  availableReaches,
  yantras,
  setYantras
}) => {
  
  const isReachSelected = (reachName) => {
    return selectedReaches.includes(reachName);
  };

  const handleReachToggle = (reachName) => {
    if (isReachSelected(reachName)) {
      setSelectedReaches(selectedReaches.filter(r => r !== reachName));
    } else {
      setSelectedReaches([...selectedReaches, reachName]);
    }
  };

  // Get description for reach with any penalties
  const getReachDescription = (reachName) => {
    const defaultReach = DEFAULT_REACHES.find(r => r.name === reachName);
    if (!defaultReach) return reachName;
    
    let description = defaultReach.name;
    if (defaultReach.dicePenalty) {
      description += ` (-${defaultReach.dicePenalty} dice)`;
    }
    if (defaultReach.manaCost) {
      description += ` [${defaultReach.manaCost} Mana]`;
    }
    
    return description;
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

  const { totalPenalty, manaCost } = selectedSpell ? 
    calculateReachEffects(
      selectedReaches, 
      selectedSpell, 
      DEFAULT_REACHES
    ) : { totalPenalty: 0, manaCost: 0 };

  const categorizedReaches = getReachesByCategory();

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
              Available: {availableReaches}
            </span>
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
                      <label className="flex items-center cursor-pointer p-2 rounded-lg hover:bg-slate-700 transition-colors">
                        <input
                          type="checkbox"
                          checked={isReachSelected(reach.name)}
                          onChange={() => handleReachToggle(reach.name)}
                          className="mr-3 h-4 w-4 text-indigo-500 rounded focus:ring-indigo-400"
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
                    {reaches.map(reach => (
                      <div key={reach.name} className="relative">
                        <label className={`flex items-center cursor-pointer p-2 rounded-lg transition-colors ${
                          isReachSelected(reach.name) ? 'bg-slate-700' : 'hover:bg-slate-700'
                        }`}>
                          <input
                            type="checkbox"
                            checked={isReachSelected(reach.name)}
                            onChange={() => handleReachToggle(reach.name)}
                            className="mr-3 h-4 w-4 text-indigo-500 rounded focus:ring-indigo-400"
                          />
                          <span className={`flex-grow ${reach.dicePenalty ? 'text-yellow-300' : 'text-slate-300'}`}>
                            {reach.name}
                          </span>
                          
                          <div className="flex space-x-2">
                            {reach.dicePenalty && (
                              <span className="badge badge-yellow">
                                -{reach.dicePenalty}
                              </span>
                            )}
                            
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
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {availableReaches < 0 && (
            <div className="mt-2 mb-4 text-red-400 text-sm flex items-center bg-red-900 bg-opacity-30 p-3 rounded-lg border border-red-900 animate-pulse-subtle">
              <i className="fas fa-exclamation-triangle mr-2"></i>
              You've selected more reaches than available
            </div>
          )}
          
          {(totalPenalty > 0 || manaCost > 0) && (
            <div className="p-4 bg-slate-800 rounded-lg mb-4 text-sm animate-fadeIn shadow-md">
              <div className="font-bold mb-3 text-slate-300">Costs Summary:</div>
              <div className="space-y-2">
                {totalPenalty > 0 && (
                  <div className="text-yellow-400 flex items-center p-2 bg-yellow-900 bg-opacity-30 rounded-lg">
                    <i className="fas fa-dice-d20 mr-2"></i>
                    Dice Penalty: -{totalPenalty}
                  </div>
                )}
                {manaCost > 0 && (
                  <div className="text-blue-400 flex items-center p-2 bg-blue-900 bg-opacity-30 rounded-lg">
                    <i className="fas fa-tint mr-2"></i>
                    Mana Cost: {manaCost}
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
                max="5" 
                value={yantras} 
                onChange={(e) => setYantras(parseInt(e.target.value))} 
                className="w-16 bg-slate-700 text-white border border-slate-600 rounded-md p-2 text-center focus-ring mr-2"
              />
          
              
              <div className="dot-notation flex-grow">{"+".repeat(yantras)}</div>
            </div>
            <div className="mt-3 text-sm text-slate-400 bg-slate-700 p-2 rounded-md">
              <i className="fas fa-info-circle mr-1"></i>
              Yantras add bonus dice to your spell casting
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};

export default ReachSelector;