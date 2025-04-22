import React, { useState, useEffect } from 'react';
import CharacterStats from './components/CharacterStats';
import SpellBook from './components/SpellBook';
import ReachSelector from './components/ReachSelector';
import SpellResults from './components/SpellResults';
import SpellSelector from './components/SpellSelector'; 
import { processSpellData } from './data/dataLoader';
import { calculateDicePool, calculateAvailableReaches, rollDice, calculateReachEffects } from './utils/spellCalculations';
import { DEFAULT_REACHES } from './data/reachesData';
import { saveCharacterData, loadCharacterData, getDefaultCharacterData } from './utils/localStorage';

import spellsJson from './data/spells.json';

function App() {
  const [spells, setSpells] = useState([]);
  const [userSpells, setUserSpells] = useState([]);
  const [showSpellSelector, setShowSpellSelector] = useState(false);

  // Character stats with default values
  const [gnosis, setGnosis] = useState(1);
  const [arcanaValues, setArcanaValues] = useState({
    death: 0,
    fate: 0,
    forces: 0,
    life: 0,
    matter: 0,
    mind: 0,
    prime: 0,
    spirit: 0,
    space: 0,
    time: 0
  });

  // Spell casting state
  const [selectedSpell, setSelectedSpell] = useState(null);
  const [selectedReaches, setSelectedReaches] = useState([]);
  const [yantras, setYantras] = useState(0);
  const [availableReaches, setAvailableReaches] = useState(0);

  // Results state
  const [dicePool, setDicePool] = useState(0);
  const [rollResults, setRollResults] = useState([]);
  
  // Animation state
  const [appReady, setAppReady] = useState(false);
  
  const setGnosisAndSave = (newGnosis) => {
    setGnosis(newGnosis);
  };
  
  const setArcanaValuesAndSave = (newArcanaValues) => {
    setArcanaValues(newArcanaValues);
  };
  
  const setYantrasAndSave = (newYantras) => {
    setYantras(newYantras);
  };

  // Load data from local storage on component mount
  useEffect(() => {
    // Process spell data first
    const processedSpells = processSpellData(spellsJson);
    setSpells(processedSpells);
    
    // Load character data from local storage
    const savedData = loadCharacterData();
    if (savedData) {
      console.log('Loading saved character data');
      
      // Check that data has expected structure before setting state
      if (typeof savedData.gnosis === 'number') {
        setGnosis(savedData.gnosis);
      }
      
      if (savedData.arcanaValues && typeof savedData.arcanaValues === 'object') {
        setArcanaValues(savedData.arcanaValues);
      }
      
      if (Array.isArray(savedData.userSpells)) {
        setUserSpells(savedData.userSpells);
      }
      
      if (typeof savedData.yantras === 'number') {
        setYantras(savedData.yantras);
      }
    } else {
      console.log('No saved data found, using defaults');
    }
    
    setTimeout(() => setAppReady(true), 100);
  }, []);

  // Save character data whenever relevant state changes
  useEffect(() => {
    if (!appReady) return;
    
    console.log('Saving character data to local storage');
    const characterData = {
      gnosis,
      arcanaValues,
      userSpells,
      yantras
    };
    
    saveCharacterData(characterData);
  }, [gnosis, arcanaValues, userSpells, yantras, appReady]);

  // Calculate available reaches whenever necessary values change
  useEffect(() => {
    if (!selectedSpell) {
      setAvailableReaches(0);
      return;
    }

    const arcanumValue = arcanaValues[selectedSpell.arcanum.toLowerCase()];
    const baseAvailableReaches = calculateAvailableReaches(
      arcanumValue,
      selectedSpell.level,
      selectedSpell.castingType
    );

    // Calculate used reaches
    const { totalCost } = calculateReachEffects(
      selectedReaches,
      selectedSpell,
      DEFAULT_REACHES
    );

    setAvailableReaches(baseAvailableReaches - totalCost);
  }, [selectedSpell, arcanaValues, selectedReaches]);

  // Reset state when spell changes
  useEffect(() => {
    setSelectedReaches([]);
    setRollResults([]);
  }, [selectedSpell]);

  // Add spell to user's spellbook
  const addUserSpell = (spell) => {
    // Check if this spell is already in the spellbook with the same casting type
    const exists = userSpells.some(s =>
      s.name === spell.name && s.castingType === spell.castingType
    );

    if (!exists) {
      setUserSpells(prevSpells => [...prevSpells, spell]);
    }

    setShowSpellSelector(false);
  };

  // Remove spell from user's spellbook
  const removeUserSpell = (spellToRemove) => {
    setUserSpells(prevSpells => 
      prevSpells.filter(spell =>
        !(spell.name === spellToRemove.name && spell.castingType === spellToRemove.castingType)
      )
    );

    // If the removed spell was selected, deselect it
    if (selectedSpell && selectedSpell.name === spellToRemove.name &&
      selectedSpell.castingType === spellToRemove.castingType) {
      setSelectedSpell(null);
    }
  };


  const selectSpell = (spell) => {
    setSelectedSpell(spell);
  };

  const castSpell = () => {
    if (!selectedSpell) return;

    const arcanumValue = arcanaValues[selectedSpell.arcanum.toLowerCase()];

    // Calculate reach penalties
    const { totalPenalty } = calculateReachEffects(
      selectedReaches,
      selectedSpell,
      DEFAULT_REACHES
    );

    const finalDicePool = calculateDicePool(
      gnosis,
      arcanumValue,
      selectedSpell.castingType,
      yantras,
      totalPenalty
    );

    setDicePool(finalDicePool);

    const results = rollDice(finalDicePool);
    setRollResults(results);
  };

  const calculateManaCost = () => {
    if (!selectedSpell) return 0;

    let manaCost = 0;

    // Improvised spells cost 1 Mana (Praxis and Rote spells don't)
    if (selectedSpell.castingType === 'improvised') {
      manaCost += 1;
    }

    const { manaCost: reachManaCost } = calculateReachEffects(
      selectedReaches,
      selectedSpell,
      DEFAULT_REACHES
    );

    manaCost += reachManaCost;

    return manaCost;
  };

  return (
    <div className={`min-h-screen bg-gradient-to-r from-slate-900 to-indigo-900 text-white p-4 transition-opacity duration-500 ${appReady ? 'opacity-100' : 'opacity-0'}`}>

      <div className={`grid ${showSpellSelector ? 'grid-cols-1 lg:grid-cols-4' : 'grid-cols-1 lg:grid-cols-3'} gap-6 max-w-7xl mx-auto relative`}>
        {/* Left column - Character Stats & Spellbook */}
        <div className="space-y-6 relative">
          <CharacterStats
            gnosis={gnosis}
            setGnosis={setGnosisAndSave}
            arcanaValues={arcanaValues}
            setArcanaValues={setArcanaValuesAndSave}
          />

          <SpellBook
            spells={spells}
            userSpells={userSpells}
            addUserSpell={addUserSpell}
            removeUserSpell={removeUserSpell}
            selectSpell={selectSpell}
            selectedSpell={selectedSpell}
            arcanaValues={arcanaValues}
            showSpellSelector={showSpellSelector}
            setShowSpellSelector={setShowSpellSelector}
          />
        </div>

        {/* Spell Selector Column only visible when showSpellSelector is true */}
        {showSpellSelector && (
          <div className="space-y-6 lg:h-full">
            <SpellSelector 
              spells={spells}
              arcanaValues={arcanaValues}
              addUserSpell={addUserSpell}
              closeSpellSelector={() => setShowSpellSelector(false)}
            />
          </div>
        )}

        {/* Middle column - Customization */}
        <div className="space-y-6">
          {selectedSpell ? (
            <>
              <div className="card animate-fadeIn shadow-lg">
                <h3 className="text-lg font-bold mb-3 flex items-center">
                  <i className="fas fa-scroll mr-3 text-amber-400"></i>
                  Casting Summary
                </h3>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-slate-700 p-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <div className="text-sm text-slate-400 mb-1">Dice Pool</div>
                    <div className="text-2xl font-bold">{
                      calculateDicePool(
                        gnosis,
                        arcanaValues[selectedSpell.arcanum.toLowerCase()],
                        selectedSpell.castingType,
                        yantras,
                        calculateReachEffects(
                          selectedReaches,
                          selectedSpell,
                          DEFAULT_REACHES
                        ).totalPenalty
                      )
                    }</div>
                  </div>

                  <div className="bg-slate-700 p-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <div className="text-sm text-slate-400 mb-1">Mana Cost</div>
                    <div className="text-2xl font-bold flex items-center">
                      <i className="fas fa-tint text-blue-400 mr-2"></i>
                      {calculateManaCost()}
                    </div>
                  </div>
                </div>

                <button
                  onClick={castSpell}
                  className={`w-full py-3 rounded-lg font-bold flex items-center justify-center bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg hover:shadow-xl transition-all click-effect
                    `}
                >
                  <i className="fas fa-bolt mr-3"></i>
                  Cast Spell!
                </button>
                {availableReaches < 0 && (
                  <p className="text-red-400 text-sm mt-2">
                    BEWARE! Casting this spell will result in an overreach!
                  </p>
                )}
              </div>
              <ReachSelector
                selectedSpell={selectedSpell}
                selectedReaches={selectedReaches}
                setSelectedReaches={setSelectedReaches}
                availableReaches={availableReaches}
                yantras={yantras}
                setYantras={setYantrasAndSave}
              />
            </>
          ) : (
            <div className="card flex flex-col items-center justify-center text-center p-8 animate-pulse-subtle">
              <i className="fas fa-book text-6xl mb-6 text-indigo-400"></i>
              <h3 className="text-2xl font-bold mb-3">No Spell Selected</h3>
              <p className="text-slate-400 max-w-md">Choose a spell from your spellbook to begin casting or add a new spell to get started</p>
              {userSpells.length === 0 && (
                <button
                  onClick={() => setShowSpellSelector(true)}
                  className="mt-4 btn btn-primary animate-pulse-subtle"
                >
                  <i className="fas fa-plus mr-2"></i> Add Your First Spell
                </button>
              )}
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-6">
          <SpellResults
            selectedSpell={selectedSpell}
            dicePool={dicePool}
            rollResults={rollResults}
            spellPotency={selectedSpell ? arcanaValues[selectedSpell.arcanum.toLowerCase()] : 0}
            onCastSpell={castSpell}
          />
        </div>
      </div>
      
      {/* Footer */}
      <footer className="text-center mt-10 text-slate-400 text-sm pb-4">
        <p>Grimoire.VIP ❤️</p>
      </footer>
    </div>
  );
}

export default App;