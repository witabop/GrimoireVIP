import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import CharacterStats from './components/CharacterStats';
import SpellBook from './components/SpellBook';
import ReachSelector from './components/ReachSelector';
import SpellResults from './components/SpellResults';
import SpellSelector from './components/SpellSelector';
import { processSpellData } from './data/dataLoader';
import {
  calculateAvailableReaches,
  calculateCombinedSpellDicePool,
  calculateDicePool,
  rollDice,
  calculateReachEffects,
  countSuccesses,
  getRitualIntervalMinutes,
  formatRitualDuration
} from './utils/spellCalculations';
import { DEFAULT_REACHES } from './data/reachesData';
import { saveCharacterData, loadCharacterData, getDefaultCharacterData } from './utils/localStorage';
import SpellCombiner from './components/SpellCombiner';
import SpellCastLog from './components/SpellCastLog';
import CastingCostsSummary from './components/CastingCostsSummary';

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

  // Major Arcana state - new addition
  const [majorArcana, setMajorArcana] = useState([]);

  // Spell casting state
  const [selectedSpell, setSelectedSpell] = useState(null);
  const [selectedReaches, setSelectedReaches] = useState([]);
  const [yantras, setYantras] = useState(0);
  const [availableReaches, setAvailableReaches] = useState(0);
  const [potencyBoost, setPotencyBoost] = useState(0);
  const [potencyBoostLevel, setPotencyBoostLevel] = useState(0);

  // Results state
  const [rollResults, setRollResults] = useState([]);

  // Roll options state
  const [eightAgain, setEightAgain] = useState(false);
  const [nineAgain, setNineAgain] = useState(false);

  // Animation state
  const [appReady, setAppReady] = useState(false);

  const updateSpellOrder = (newSpellOrder) => {
    setUserSpells(newSpellOrder);
  };

  const setGnosisAndSave = (newGnosis) => {
    setGnosis(newGnosis);
  };

  const setArcanaValuesAndSave = (newArcanaValues) => {
    setArcanaValues(newArcanaValues);
  };

  const setYantrasAndSave = (newYantras) => {
    setYantras(newYantras);
  };

  // New method for setting Major Arcana
  const setMajorArcanaAndSave = (newMajorArcana) => {
    setMajorArcana(newMajorArcana);
  };

  // Additional modifiers
  const [dicePoolModifier, setDicePoolModifier] = useState(0);
  const [manaModifier, setManaModifier] = useState(0);
  const [ritualBoost, setRitualBoost] = useState(0);
  const [castLog, setCastLog] = useState([]);
  const [showCastLog, setShowCastLog] = useState(false);
  const [rollContext, setRollContext] = useState(null);

  // Combiner states
  const [showSpellCombiner, setShowSpellCombiner] = useState(false);
  const [spellsForCombination, setSpellsForCombination] = useState([]);
  const [defaultCSPotency, setDefaultCSPotency] = useState(0);

  const handleCombineSpells = (spellsToMerge) => {
    setSpellsForCombination(spellsToMerge);
    setShowSpellCombiner(true);
  };

  const addCombinedSpell = (combinedSpell) => {
    setUserSpells(prevSpells => [...prevSpells, combinedSpell]);
    setShowSpellCombiner(false);
    setSpellsForCombination([]);
  };

  const calculateSpellDicePool = () => {
    if (!selectedSpell) return 0;

    // Handle combined spells differently
    if (selectedSpell.combined) {
      // Get the lowest Arcanum value among the component spells
      const lowestArcanumValue = arcanaValues[selectedSpell.lowestArcanum.name.toLowerCase()];

      return calculateCombinedSpellDicePool(
        gnosis,
        lowestArcanumValue,
        selectedSpell.componentSpells.length,
        yantras,
        calculateEffectivePenalty()
      );
    }

    // Regular spell calculation
    return calculateDicePool(
      gnosis,
      arcanaValues[selectedSpell.arcanum.toLowerCase()],
      selectedSpell.castingType,
      yantras,
      calculateEffectivePenalty()
    );
  };

  // Reset potency boost when spell changes
  useEffect(() => {
    setPotencyBoost(0);
    setPotencyBoostLevel(0);
    setRitualBoost(0);
  }, [selectedSpell]);

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

      // Load major Arcana
      if (Array.isArray(savedData.majorArcana)) {
        setMajorArcana(savedData.majorArcana);
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
      yantras,
      majorArcana // Save major Arcana
    };

    saveCharacterData(characterData);
  }, [gnosis, arcanaValues, userSpells, yantras, majorArcana, appReady]);

  // Calculate available reaches whenever necessary values change
  useEffect(() => {
    if (!selectedSpell) {
      setAvailableReaches(0);
      return;
    }

    // Handle combined spells differently
    if (selectedSpell.combined) {
      // For combined spells, we need to use the lowest arcanum value, not the spell level
      const arcanumValue = selectedSpell.lowestArcanum.value;
      let baseReaches = 1; // Start with the base 1 reach

      // Additional reaches based on arcanum value vs spell level
      // For combined spells, we use the lowest value component spell
      const lowestLevelSpell = selectedSpell.componentSpells.reduce((lowest, current) =>
        parseInt(current.level) < parseInt(lowest.level) ? current : lowest
        , selectedSpell.componentSpells[0]);

      // Calculate base reaches like: 1 + (arcanum value - spell level)
      baseReaches += Math.max(0, arcanumValue - parseInt(lowestLevelSpell.level));

      // Calculate used reaches from selectedReaches
      const { totalCost } = calculateReachEffects(
        selectedReaches,
        selectedSpell,
        DEFAULT_REACHES
      );

      setAvailableReaches(baseReaches - totalCost);
      return;
    }

    // Regular spell calculation
    const arcanumValue = arcanaValues[selectedSpell.arcanum.toLowerCase()] || 0;
    const baseAvailableReaches = calculateAvailableReaches(
      arcanumValue,
      parseInt(selectedSpell.level),
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
    setRollContext(null);
  }, [selectedSpell]);

  const computeFinalDicePool = () => {
    if (!selectedSpell) return 0;
    return calculateSpellDicePool() + dicePoolModifier + ritualBoost;
  };

  const getDicePoolBreakdown = () => {
    if (!selectedSpell) return null;
    const totalPenalty = calculateEffectivePenalty();
    const potencyBoostPenalty = potencyBoost * 2;
    const reachPenalty = totalPenalty - potencyBoostPenalty;
    if (selectedSpell.combined) {
      const arcanaRating =
        arcanaValues[selectedSpell.lowestArcanum.name.toLowerCase()] ?? 0;
      return {
        gnosis,
        arcanaRating,
        arcanaLabel: selectedSpell.lowestArcanum.name,
        yantras,
        ritualBoost,
        combinedSpellDicePenalty: Math.max(0, (selectedSpell.componentSpells?.length || 1) - 1) * 2,
        reachPenalty,
        potencyBoostPenalty,
        dicePoolModifier
      };
    }
    const arcanaRating = arcanaValues[selectedSpell.arcanum.toLowerCase()] ?? 0;
    return {
      gnosis,
      arcanaRating,
      arcanaLabel: selectedSpell.arcanum,
      yantras,
      ritualBoost,
      combinedSpellDicePenalty: 0,
      reachPenalty,
      potencyBoostPenalty,
      dicePoolModifier
    };
  };

  // Get current primary factor based on reaches
  const getCurrentPrimaryFactor = () => {
    if (selectedReaches.includes("Change Primary Factor: Duration")) {
      return "Duration";
    }
    if (selectedReaches.includes("Change Primary Factor: Potency")) {
      return "Potency";
    }
    return selectedSpell?.primaryFactor || "";
  };

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

    // Also remove it from any selection for combination
    if (spellsForCombination.some(s => s.name === spellToRemove.name && s.castingType === spellToRemove.castingType)) {
      setSpellsForCombination(prev =>
        prev.filter(s => !(s.name === spellToRemove.name && s.castingType === spellToRemove.castingType))
      );
    }
  };

  const selectSpell = (spell) => {
    setSelectedSpell(spell);
  };

  // Calculate if a duration option should be free based on primary factor
  const isDurationFree = (durationOption) => {
    if (!selectedSpell) return false;

    const currentPrimaryFactor = getCurrentPrimaryFactor();
    if (currentPrimaryFactor !== 'Duration') return false;

    const arcanumValue = arcanaValues[selectedSpell.arcanum.toLowerCase()];

    // Check if this is an advanced scale option
    const isAdvanced = durationOption.startsWith("Duration: One") || durationOption === "Duration: Indefinite";

    // Get level based on duration option
    let level;

    if (!isAdvanced) {
      // Standard durations
      if (durationOption === 'Duration: 2 turns') level = 1;
      else if (durationOption === 'Duration: 3 turns') level = 2;
      else if (durationOption === 'Duration: 5 turns') level = 3;
      else if (durationOption === 'Duration: 10 turns') level = 4;
      else level = 0;
    } else {
      // Advanced durations
      if (durationOption === 'Duration: One scene/hour') level = 1;
      else if (durationOption === 'Duration: One day') level = 2;
      else if (durationOption === 'Duration: One week') level = 3;
      else if (durationOption === 'Duration: One month') level = 4;
      else if (durationOption === 'Duration: One year') level = 5;
      else if (durationOption === 'Duration: Indefinite') level = 6;
      else level = 0;
    }

    // Free if level <= arcanum value
    return level <= arcanumValue;
  };

  // Calculate effective dice pool penalty
  const calculateEffectivePenalty = () => {
    if (!selectedSpell) return 0;

    let totalPenalty = 0;

    // Add penalties from all non-duration reaches
    selectedReaches.forEach(reachName => {
      // Skip primary factor changes as these don't have penalties
      if (reachName === "Change Primary Factor: Duration" || reachName === "Change Primary Factor: Potency") {
        return;
      }

      // Special reaches
      if (selectedSpell.specialReaches && selectedSpell.specialReaches.some(r => r.name === reachName)) {
        // Special reaches generally don't have dice penalties
        return;
      }

      // Check if it's a duration reach
      if (reachName.startsWith("Duration:")) {
        // If Duration is primary factor, check if it's free
        if (isDurationFree(reachName)) {
          // Free, no penalty
          return;
        }

        // If it's not free but Duration is primary, calculate reduced penalty
        if (getCurrentPrimaryFactor() === 'Duration') {
          const arcanumValue = arcanaValues[selectedSpell.arcanum.toLowerCase()];

          // Get standard penalties
          let standardPenalties = {
            'Duration: 2 turns': 2,
            'Duration: 3 turns': 4,
            'Duration: 5 turns': 6,
            'Duration: 10 turns': 8,
            'Duration: One day': 2,
            'Duration: One week': 4,
            'Duration: One month': 6,
            'Duration: One year': 8,
            'Duration: Indefinite': 10
          };

          // Calculate penalty based on how much it exceeds free level
          const isAdvanced = reachName.startsWith("Duration: One") || reachName === "Duration: Indefinite";
          let freeLevel = Math.min(arcanumValue, 5); // Cap at 5

          // Get level of this duration
          let level;
          if (!isAdvanced) {
            if (reachName === 'Duration: 2 turns') level = 1;
            else if (reachName === 'Duration: 3 turns') level = 2;
            else if (reachName === 'Duration: 5 turns') level = 3;
            else if (reachName === 'Duration: 10 turns') level = 4;
          } else {
            if (reachName === 'Duration: One scene/hour') level = 1;
            else if (reachName === 'Duration: One day') level = 2;
            else if (reachName === 'Duration: One week') level = 3;
            else if (reachName === 'Duration: One month') level = 4;
            else if (reachName === 'Duration: One year') level = 5;
            else if (reachName === 'Duration: Indefinite') level = 6;
          }

          // If level > free level, calculate penalty difference
          if (level > freeLevel) {
            if (!isAdvanced) {
              // Standard durations penalties: 0, 2, 4, 6, 8
              const penalties = [0, 2, 4, 6, 8];
              totalPenalty += penalties[level] - penalties[freeLevel];
            } else {
              // Advanced durations penalties: 0, 0, 2, 4, 6, 8, 10
              const advPenalties = [0, 0, 2, 4, 6, 8, 10];
              totalPenalty += advPenalties[level] - advPenalties[Math.min(freeLevel, advPenalties.length - 1)];
            }
          }
          return;
        }
      }

      // Regular reach with dice penalty
      const reach = DEFAULT_REACHES.find(r => r.name === reachName);
      if (reach && reach.dicePenalty) {
        totalPenalty += reach.dicePenalty;
      }
    });

    // Add potency boost penalty
    const potencyPenalty = potencyBoost * 2;

    return totalPenalty + potencyPenalty;
  };

  // Check if the selected spell's arcanum is a major arcanum
  const isSpellUsingMajorArcanum = () => {
    if (!selectedSpell) return false;
    return majorArcana.includes(selectedSpell.arcanum.toLowerCase());
  };

  const calculateManaCost = () => {
    if (!selectedSpell) return 0;

    let manaCost = typeof selectedSpell.mana === 'number' ? selectedSpell.mana : 0;

    // Improvised spells cost 1 Mana UNLESS they use a major Arcanum
    if (selectedSpell.castingType === 'improvised' && !isSpellUsingMajorArcanum()) {
      manaCost += 1;
    }

    selectedReaches.forEach(reachName => {
      const specialReach = selectedSpell.specialReaches?.find(r => r.name === reachName);
      if (specialReach) {
        if (specialReach.manaCost) {
          manaCost += specialReach.manaCost;
        }
        return;
      }
      const reach = DEFAULT_REACHES.find(r => r.name === reachName);
      if (reach && reach.manaCost) {
        manaCost += reach.manaCost;
      }
      if ((reachName.toLowerCase().includes('spend') || reachName.toLowerCase().includes('point')) && reachName.toLowerCase().includes('mana')) {
        manaCost += 1;
      }
    });

    return manaCost + manaModifier;
  };

  // Get the effective potency including boosts and primary factor
  const getEffectivePotency = () => {
    if (!selectedSpell) return 0;

    if (selectedSpell.combined) {
      return defaultCSPotency + potencyBoost;
    }

    const arcanumValue = arcanaValues[selectedSpell.arcanum.toLowerCase()];
    const currentPrimaryFactor = getCurrentPrimaryFactor();

    // Base potency is Arcana value if Potency is primary factor, else 1
    const basePotency = currentPrimaryFactor === 'Potency' ? arcanumValue : 1;

    // Add potency boost
    return basePotency + potencyBoost;
  };

  const buildCastLogEntry = (finalPool, isChanceDie, results, successes, breakdown) => {
    const intervalMin = getRitualIntervalMinutes(gnosis);
    const ritualMins = ritualBoost * intervalMin;
    const intervalLabel =
      formatRitualDuration(intervalMin) ||
      `${intervalMin} minute${intervalMin === 1 ? '' : 's'}`;

    const reachLines = [];
    selectedReaches.forEach((reachName) => {
      const sp = selectedSpell.specialReaches?.find((r) => r.name === reachName);
      if (sp) {
        reachLines.push(
          `${reachName}${sp.manaCost ? ` (${sp.manaCost} Mana)` : ''}`
        );
        return;
      }
      const dr = DEFAULT_REACHES.find((r) => r.name === reachName);
      if (dr) {
        let suffix = '';
        if (dr.dicePenalty) suffix += ` (−${dr.dicePenalty} dice)`;
        if (dr.manaCost) suffix += ` (${dr.manaCost} Mana)`;
        reachLines.push(`${dr.name}${suffix}`);
      } else {
        reachLines.push(reachName);
      }
    });

    return {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      timeLabel: new Date().toLocaleString(),
      spellName: selectedSpell.name,
      castingType: selectedSpell.castingType,
      gnosis,
      poolUsed: finalPool,
      isChanceDie,
      rollResults: [...results],
      successes,
      eightAgain,
      nineAgain,
      potency: getEffectivePotency(),
      potencyBoost,
      primaryFactor: getCurrentPrimaryFactor(),
      manaCostTotal: calculateManaCost(),
      manaModifier,
      breakdown: { ...breakdown },
      reachLines,
      combined: !!selectedSpell.combined,
      componentNames: selectedSpell.componentSpells?.map((s) => s.name),
      ritualBoost,
      ritualIntervalLabel: intervalLabel,
      ritualTimeLabel: formatRitualDuration(ritualMins) || '—'
    };
  };

  const castSpell = () => {
    if (!selectedSpell) return;

    const finalDicePool = computeFinalDicePool();
    if (finalDicePool <= -6) return;

    const isChanceDie = finalDicePool <= 1;
    setRollContext({ poolUsed: finalDicePool, isChanceDie });

    const results = rollDice(finalDicePool, isChanceDie ? {} : { eightAgain, nineAgain });
    setRollResults(results);

    const successes = countSuccesses(results, isChanceDie);
    const breakdown = getDicePoolBreakdown();
    setCastLog((prev) => [buildCastLogEntry(finalDicePool, isChanceDie, results, successes, breakdown), ...prev]);
  };

  const finalPoolDisplay = computeFinalDicePool();
  const castIsImpossible = selectedSpell && finalPoolDisplay <= -6;

  const logPortal =
    typeof document !== 'undefined'
      ? createPortal(
          showCastLog ? (
            <SpellCastLog onClose={() => setShowCastLog(false)} entries={castLog} />
          ) : (
            <button
              type="button"
              onClick={() => setShowCastLog(true)}
              className="fixed top-4 right-4 z-[99999] flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700 hover:text-white shadow-lg transition-colors text-sm font-medium"
              aria-label="Open spell cast log"
            >
              <i className="fas fa-history" />
              Log
              {castLog.length > 0 && (
                <span className="bg-indigo-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {castLog.length}
                </span>
              )}
            </button>
          ),
          document.body
        )
      : null;

  return (
    <>
      {logPortal}
      <div
        className={`min-h-screen bg-gradient-to-r from-slate-900 to-indigo-900 text-white p-4 transition-opacity duration-500 ${appReady ? 'opacity-100' : 'opacity-0'}`}
      >
      <div className={`grid ${showSpellSelector ? 'grid-cols-1 lg:grid-cols-4' : 'grid-cols-1 lg:grid-cols-3'} gap-6 max-w-7xl mx-auto relative`}>
        {/* Left column - Character Stats & Spellbook */}
        <div className="space-y-6 relative">
          <CharacterStats
            gnosis={gnosis}
            setGnosis={setGnosisAndSave}
            arcanaValues={arcanaValues}
            setArcanaValues={setArcanaValuesAndSave}
            majorArcana={majorArcana}
            setMajorArcana={setMajorArcanaAndSave}
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
            onCombineSpells={handleCombineSpells}
            gnosis={gnosis}
            updateSpellOrder={updateSpellOrder}
          />

        </div>
        {showSpellCombiner && (
          <div className="space-y-6 lg:h-full">
            <SpellCombiner
              selectedSpells={spellsForCombination}
              closeSpellCombiner={() => setShowSpellCombiner(false)}
              addCombinedSpell={addCombinedSpell}
              arcanaValues={arcanaValues}
              gnosis={gnosis}
            />
          </div>
        )}


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
                    <div className="text-2xl font-bold">{finalPoolDisplay}</div>
                    {castIsImpossible && (
                      <div className="flex items-center mt-2 text-xs text-red-300 bg-red-900/40 border border-red-800 rounded-lg px-2 py-1.5">
                        <i className="fas fa-ban mr-2" />
                        Impossible to cast (pool ≤ −6).
                      </div>
                    )}
                    {!castIsImpossible && finalPoolDisplay <= 1 && (
                        <div className="flex items-center mt-2 badge badge-yellow">
                          <i className="fas fa-exclamation-triangle mr-2"></i>
                          Chance Die!
                        </div>
                      )}
                  </div>

                  <div className="bg-slate-700 p-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <div className="text-sm text-slate-400 mb-1">
                      Mana Cost
                    </div>
                    <div className="text-2xl font-bold flex items-center">
                      <i className="fas fa-tint text-blue-400 mr-2"></i>
                      {calculateManaCost()}
                    </div>
                  </div>
                </div>

                {/* Roll Options */}
                <div className="mb-4 bg-slate-800 p-3 rounded-lg">
                  <h4 className="text-sm font-bold text-indigo-300 mb-3 flex items-center">
                    <i className="fas fa-dice mr-2"></i> Roll Options
                  </h4>
                  <div className="flex space-x-4">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={eightAgain}
                        onChange={() => setEightAgain(!eightAgain)}
                        className="h-4 w-4 text-indigo-500 rounded border-slate-600 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-800"
                      />
                      <span className="text-sm text-slate-300">8-Again</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={nineAgain}
                        onChange={() => setNineAgain(!nineAgain)}
                        className="h-4 w-4 text-indigo-500 rounded border-slate-600 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-800"
                      />
                      <span className="text-sm text-slate-300">9-Again</span>
                    </label>
                  </div>
                </div>

                <CastingCostsSummary
                  className="mb-4"
                  selectedSpell={selectedSpell}
                  selectedReaches={selectedReaches}
                  getCurrentPrimaryFactor={getCurrentPrimaryFactor}
                  arcanaValue={selectedSpell?.arcanum ? arcanaValues[selectedSpell.arcanum.toLowerCase()] : 0}
                  arcanaValues={arcanaValues}
                  arcanaLabel={selectedSpell?.combined ? selectedSpell.lowestArcanum?.name : selectedSpell?.arcanum}
                  yantras={yantras}
                  potencyBoostLevel={potencyBoostLevel}
                  dicePoolModifier={dicePoolModifier}
                  manaModifier={manaModifier}
                  ritualBoost={ritualBoost}
                  gnosis={gnosis}
                />

                <button
                  type="button"
                  onClick={castSpell}
                  disabled={castIsImpossible}
                  className={`w-full py-3 rounded-lg font-bold flex items-center justify-center shadow-lg transition-all click-effect ${
                    castIsImpossible
                      ? 'bg-slate-600 text-slate-400 cursor-not-allowed opacity-70'
                      : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 hover:shadow-xl'
                  }`}
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
                setPotencyBoost={setPotencyBoost}
                potencyBoostLevel={potencyBoostLevel}
                setPotencyBoostLevel={setPotencyBoostLevel}
                arcanaValue={selectedSpell?.arcanum ? arcanaValues[selectedSpell.arcanum.toLowerCase()] : 0}
                arcanaValues={arcanaValues} // Make sure this prop is being passed
                getCurrentPrimaryFactor={getCurrentPrimaryFactor}
                isDurationFree={isDurationFree}
                calculateEffectivePenalty={calculateEffectivePenalty}
                setDicePoolModifier={setDicePoolModifier}
                dicePoolModifier={dicePoolModifier}
                setManaModifier={setManaModifier}
                manaModifier={manaModifier}
                setDefaultCSPotency={setDefaultCSPotency}
                gnosis={gnosis}
                ritualBoost={ritualBoost}
                setRitualBoost={setRitualBoost}
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
            displayDicePool={finalPoolDisplay}
            rollResults={rollResults}
            rollContext={rollContext}
            spellPotency={getEffectivePotency()}
            potencyBoost={potencyBoost}
            selectedReaches={selectedReaches}
            primaryFactor={getCurrentPrimaryFactor()}
            eightAgain={eightAgain}
            setEightAgain={setEightAgain}
            nineAgain={nineAgain}
            setNineAgain={setNineAgain}
          />
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center mt-10 text-slate-400 text-sm pb-4">
        <a href='https://github.com/witabop/GrimoireVIP' target='_blank' rel="noreferrer">Grimoire.VIP ❤️</a>
      </footer>
      </div>
    </>
  );
}

export default App;