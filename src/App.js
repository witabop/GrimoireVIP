import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import SpellBook from './components/SpellBook';
import ReachSelector from './components/ReachSelector';
import SpellResults from './components/SpellResults';
import SpellSelector from './components/SpellSelector';
import CharacterSheet from './components/CharacterSheet';
import ActiveSpells from './components/ActiveSpells';
import DiceRoller from './components/DiceRoller';
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
import {
  saveCharacterData, loadCharacterData, mergeWithDefaults,
  initRoster, saveCharacterToRoster, addCharacterToRoster, deleteCharacterFromRoster, getDefaultCharacterData
} from './utils/localStorage';
import SpellCombiner from './components/SpellCombiner';
import SpellCastLog from './components/SpellCastLog';
import CastingCostsSummary from './components/CastingCostsSummary';

import spellsJson from './data/spells.json';

function App() {
  // ─── Unified character state ───────────────────────────────
  const [characterData, setCharacterData] = useState(() => mergeWithDefaults(null));

  const updateChar = useCallback((patch) => {
    setCharacterData((prev) => ({ ...prev, ...patch }));
  }, []);

  // Convenience accessors so the spell-casting code reads naturally
  const gnosis = characterData.gnosis;
  const arcanaValues = characterData.arcanaValues;
  const majorArcana = characterData.majorArcana;
  const userSpells = characterData.userSpells;
  const yantras = characterData.yantras;

  const setUserSpells = (fn) => {
    if (typeof fn === 'function') {
      setCharacterData((prev) => ({ ...prev, userSpells: fn(prev.userSpells) }));
    } else {
      updateChar({ userSpells: fn });
    }
  };
  const setYantras = (v) => updateChar({ yantras: v });

  // ─── Multi-character roster ──────────────────────────────
  const [roster, setRoster] = useState(null);
  const activeCharId = roster?.activeId || null;

  const switchCharacter = (id) => {
    if (!roster || id === activeCharId) return;
    const updated = saveCharacterToRoster(roster, activeCharId, characterData);
    const target = updated.characters.find((c) => c.id === id);
    if (!target) return;
    const next = { ...updated, activeId: id };
    saveRoster_fn(next);
    setRoster(next);
    setCharacterData(mergeWithDefaults(target.data));
  };

  const createNewCharacter = () => {
    if (!roster) return;
    const saved = saveCharacterToRoster(roster, activeCharId, characterData);
    const fresh = getDefaultCharacterData();
    const { roster: next } = addCharacterToRoster(saved, fresh);
    setRoster(next);
    setCharacterData(fresh);
  };

  const deleteCurrentCharacter = () => {
    if (!roster || roster.characters.length <= 1) return;
    const next = deleteCharacterFromRoster(roster, activeCharId);
    setRoster(next);
    const target = next.characters.find((c) => c.id === next.activeId);
    if (target) setCharacterData(mergeWithDefaults(target.data));
  };

  const saveRoster_fn = (r) => {
    try { localStorage.setItem('mage-character-roster', JSON.stringify(r)); } catch { /* ignore */ }
  };

  // ─── Page navigation ──────────────────────────────────────
  const [activePage, setActivePage] = useState('character');
  const fileInputRef = useRef(null);

  const exportCharacter = () => {
    const blob = new Blob([JSON.stringify(characterData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${characterData.shadowName || 'character'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importCharacter = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = mergeWithDefaults(JSON.parse(ev.target.result));
        if (roster) {
          const saved = saveCharacterToRoster(roster, activeCharId, characterData);
          const { roster: next } = addCharacterToRoster(saved, data);
          setRoster(next);
        }
        setCharacterData(data);
      } catch { /* ignore bad JSON */ }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // ─── Spell data ────────────────────────────────────────────
  const [spells, setSpells] = useState([]);
  const [showSpellSelector, setShowSpellSelector] = useState(false);

  // Spell casting state
  const [selectedSpell, setSelectedSpell] = useState(null);
  const [selectedReaches, setSelectedReaches] = useState([]);
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

  // Additional modifiers
  const [dicePoolModifier, setDicePoolModifier] = useState(0);
  const [manaModifier, setManaModifier] = useState(0);
  const [reachesModifier, setReachesModifier] = useState(0);
  const [ritualBoost, setRitualBoost] = useState(0);
  const [castLog, setCastLog] = useState([]);
  const [showCastLog, setShowCastLog] = useState(false);
  const [rollContext, setRollContext] = useState(null);
  const [showDiceBreakdown, setShowDiceBreakdown] = useState(false);

  // Combiner states
  const [showSpellCombiner, setShowSpellCombiner] = useState(false);
  const [spellsForCombination, setSpellsForCombination] = useState([]);
  const [defaultCSPotency, setDefaultCSPotency] = useState(0);

  const handleCombineSpells = (spellsToMerge) => {
    setSpellsForCombination(spellsToMerge);
    setShowSpellCombiner(true);
  };

  const addCombinedSpell = (combinedSpell) => {
    setUserSpells((prev) => [...prev, combinedSpell]);
    setShowSpellCombiner(false);
    setSpellsForCombination([]);
  };

  const calculateSpellDicePool = () => {
    if (!selectedSpell) return 0;

    if (selectedSpell.combined) {
      const lowestArcanumValue = arcanaValues[selectedSpell.lowestArcanum.name.toLowerCase()];
      return calculateCombinedSpellDicePool(
        gnosis,
        lowestArcanumValue,
        selectedSpell.componentSpells.length,
        yantras,
        calculateEffectivePenalty()
      );
    }

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

  // ─── Load / save ──────────────────────────────────────────
  useEffect(() => {
    const processedSpells = processSpellData(spellsJson);
    setSpells(processedSpells);

    const saved = loadCharacterData();
    const charData = mergeWithDefaults(saved);
    setCharacterData(charData);

    const r = initRoster(charData);
    setRoster(r);
    const active = r.characters.find((c) => c.id === r.activeId);
    if (active) setCharacterData(mergeWithDefaults(active.data));

    setTimeout(() => setAppReady(true), 100);
  }, []);

  useEffect(() => {
    if (!appReady) return;
    saveCharacterData(characterData);
    if (roster && activeCharId) {
      const updated = saveCharacterToRoster(roster, activeCharId, characterData);
      setRoster(updated);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [characterData, appReady]);

  // ─── Active spell reach overhead ─────────────────────────
  const activeSpells = characterData.activeSpells || [];
  const activeSpellReachCost = activeSpells.length >= gnosis
    ? (activeSpells.length - gnosis + 1)
    : 0;

  // ─── Reach calculation ────────────────────────────────────
  useEffect(() => {
    if (!selectedSpell) {
      setAvailableReaches(0);
      return;
    }

    if (selectedSpell.combined) {
      const arcanumValue = selectedSpell.lowestArcanum.value;
      let baseReaches = 1;

      const lowestLevelSpell = selectedSpell.componentSpells.reduce((lowest, current) =>
        parseInt(current.level) < parseInt(lowest.level) ? current : lowest,
        selectedSpell.componentSpells[0]
      );

      baseReaches += Math.max(0, arcanumValue - parseInt(lowestLevelSpell.level));

      const { totalCost } = calculateReachEffects(selectedReaches, selectedSpell, DEFAULT_REACHES);
      setAvailableReaches(baseReaches - totalCost - activeSpellReachCost);
      return;
    }

    const arcanumValue = arcanaValues[selectedSpell.arcanum.toLowerCase()] || 0;
    const baseAvailableReaches = calculateAvailableReaches(
      arcanumValue,
      parseInt(selectedSpell.level),
      selectedSpell.castingType
    );

    const { totalCost } = calculateReachEffects(selectedReaches, selectedSpell, DEFAULT_REACHES);
    setAvailableReaches(baseAvailableReaches - totalCost - activeSpellReachCost);
  }, [selectedSpell, arcanaValues, selectedReaches, activeSpellReachCost]);

  // Reset state when spell changes
  useEffect(() => {
    setSelectedReaches([]);
    setRollResults([]);
    setRollContext(null);
    setReachesModifier(0);
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
      const arcanaRating = arcanaValues[selectedSpell.lowestArcanum.name.toLowerCase()] ?? 0;
      return {
        gnosis, arcanaRating,
        arcanaLabel: selectedSpell.lowestArcanum.name,
        yantras, ritualBoost,
        combinedSpellDicePenalty: Math.max(0, (selectedSpell.componentSpells?.length || 1) - 1) * 2,
        reachPenalty, potencyBoostPenalty, dicePoolModifier
      };
    }
    const arcanaRating = arcanaValues[selectedSpell.arcanum.toLowerCase()] ?? 0;
    return {
      gnosis, arcanaRating,
      arcanaLabel: selectedSpell.arcanum,
      yantras, ritualBoost,
      combinedSpellDicePenalty: 0,
      reachPenalty, potencyBoostPenalty, dicePoolModifier
    };
  };

  const getCurrentPrimaryFactor = () => {
    if (selectedReaches.includes("Change Primary Factor: Duration")) return "Duration";
    if (selectedReaches.includes("Change Primary Factor: Potency")) return "Potency";
    return selectedSpell?.primaryFactor || "";
  };

  const addUserSpell = (spell) => {
    const exists = userSpells.some(s => s.name === spell.name && s.castingType === spell.castingType);
    if (!exists) setUserSpells((prev) => [...prev, spell]);
    setShowSpellSelector(false);
  };

  const removeUserSpell = (spellToRemove) => {
    setUserSpells((prev) =>
      prev.filter(s => !(s.name === spellToRemove.name && s.castingType === spellToRemove.castingType))
    );
    if (selectedSpell?.name === spellToRemove.name && selectedSpell?.castingType === spellToRemove.castingType) {
      setSelectedSpell(null);
    }
    if (spellsForCombination.some(s => s.name === spellToRemove.name && s.castingType === spellToRemove.castingType)) {
      setSpellsForCombination(prev =>
        prev.filter(s => !(s.name === spellToRemove.name && s.castingType === spellToRemove.castingType))
      );
    }
  };

  const selectSpell = (spell) => {
    setSelectedSpell(spell);
    if (spell?.castingType === 'rote' && spell.roteSkill) {
      const skillDots = characterData.skills[spell.roteSkill] || 0;
      setYantras(skillDots);
    }
  };

  const isDurationFree = (durationOption) => {
    if (!selectedSpell) return false;
    const currentPrimaryFactor = getCurrentPrimaryFactor();
    if (currentPrimaryFactor !== 'Duration') return false;
    const arcanumValue = arcanaValues[selectedSpell.arcanum.toLowerCase()];
    const isAdvanced = durationOption.startsWith("Duration: One") || durationOption === "Duration: Indefinite";
    let level;
    if (!isAdvanced) {
      if (durationOption === 'Duration: 2 turns') level = 1;
      else if (durationOption === 'Duration: 3 turns') level = 2;
      else if (durationOption === 'Duration: 5 turns') level = 3;
      else if (durationOption === 'Duration: 10 turns') level = 4;
      else level = 0;
    } else {
      if (durationOption === 'Duration: One scene/hour') level = 1;
      else if (durationOption === 'Duration: One day') level = 2;
      else if (durationOption === 'Duration: One week') level = 3;
      else if (durationOption === 'Duration: One month') level = 4;
      else if (durationOption === 'Duration: One year') level = 5;
      else if (durationOption === 'Duration: Indefinite') level = 6;
      else level = 0;
    }
    return level <= arcanumValue;
  };

  const calculateEffectivePenalty = () => {
    if (!selectedSpell) return 0;
    let totalPenalty = 0;

    selectedReaches.forEach(reachName => {
      if (reachName === "Change Primary Factor: Duration" || reachName === "Change Primary Factor: Potency") return;
      if (selectedSpell.specialReaches?.some(r => r.name === reachName)) return;

      if (reachName.startsWith("Duration:")) {
        if (isDurationFree(reachName)) return;
        if (getCurrentPrimaryFactor() === 'Duration') {
          const arcanumValue = arcanaValues[selectedSpell.arcanum.toLowerCase()];
          const isAdvanced = reachName.startsWith("Duration: One") || reachName === "Duration: Indefinite";
          let freeLevel = Math.min(arcanumValue, 5);
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
          if (level > freeLevel) {
            if (!isAdvanced) {
              const penalties = [0, 2, 4, 6, 8];
              totalPenalty += penalties[level] - penalties[freeLevel];
            } else {
              const advPenalties = [0, 0, 2, 4, 6, 8, 10];
              totalPenalty += advPenalties[level] - advPenalties[Math.min(freeLevel, advPenalties.length - 1)];
            }
          }
          return;
        }
      }

      const reach = DEFAULT_REACHES.find(r => r.name === reachName);
      if (reach?.dicePenalty) totalPenalty += reach.dicePenalty;
    });

    return totalPenalty + potencyBoost * 2;
  };

  const isSpellUsingMajorArcanum = () => {
    if (!selectedSpell) return false;
    return majorArcana.includes(selectedSpell.arcanum.toLowerCase());
  };

  const calculateManaCost = () => {
    if (!selectedSpell) return 0;
    let manaCost = typeof selectedSpell.mana === 'number' ? selectedSpell.mana : 0;
    if (selectedSpell.castingType === 'improvised' && !isSpellUsingMajorArcanum()) manaCost += 1;
    selectedReaches.forEach(reachName => {
      const specialReach = selectedSpell.specialReaches?.find(r => r.name === reachName);
      if (specialReach) { if (specialReach.manaCost) manaCost += specialReach.manaCost; return; }
      const reach = DEFAULT_REACHES.find(r => r.name === reachName);
      if (reach?.manaCost) manaCost += reach.manaCost;
      if ((reachName.toLowerCase().includes('spend') || reachName.toLowerCase().includes('point')) && reachName.toLowerCase().includes('mana')) manaCost += 1;
    });
    return manaCost + manaModifier;
  };

  const getEffectivePotency = () => {
    if (!selectedSpell) return 0;
    if (selectedSpell.combined) return defaultCSPotency + potencyBoost;
    const arcanumValue = arcanaValues[selectedSpell.arcanum.toLowerCase()];
    const currentPrimaryFactor = getCurrentPrimaryFactor();
    const basePotency = currentPrimaryFactor === 'Potency' ? arcanumValue : 1;
    return basePotency + potencyBoost;
  };

  const buildReachLines = () => {
    const lines = [];
    selectedReaches.forEach((reachName) => {
      const sp = selectedSpell?.specialReaches?.find((r) => r.name === reachName);
      if (sp) { lines.push(`${reachName}${sp.manaCost ? ` (${sp.manaCost} Mana)` : ''}`); return; }
      const dr = DEFAULT_REACHES.find((r) => r.name === reachName);
      if (dr) {
        let suffix = '';
        if (dr.dicePenalty) suffix += ` (−${dr.dicePenalty} dice)`;
        if (dr.manaCost) suffix += ` (${dr.manaCost} Mana)`;
        lines.push(`${dr.name}${suffix}`);
      } else {
        lines.push(reachName);
      }
    });
    return lines;
  };

  const getSpellDuration = () => {
    const durationReach = selectedReaches.find((r) => r.startsWith('Duration:'));
    if (durationReach) return durationReach.replace('Duration: ', '');
    return '1 turn';
  };

  const getCastingTime = () => {
    if (selectedReaches.includes('Casting Time: Instant')) return 'Instant';
    const intervalMin = getRitualIntervalMinutes(gnosis);
    const totalMins = (1 + ritualBoost) * intervalMin;
    return formatRitualDuration(totalMins) || `${totalMins} minutes`;
  };

  const buildCastLogEntry = (finalPool, isChanceDie, results, successes, breakdown) => {
    const intervalMin = getRitualIntervalMinutes(gnosis);
    const ritualMins = (1 + ritualBoost) * intervalMin;
    const intervalLabel = formatRitualDuration(intervalMin) || `${intervalMin} minute${intervalMin === 1 ? '' : 's'}`;

    const reachLines = buildReachLines();

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
      eightAgain, nineAgain,
      potency: getEffectivePotency(),
      potencyBoost,
      primaryFactor: getCurrentPrimaryFactor(),
      manaCostTotal: calculateManaCost(),
      manaModifier,
      breakdown: { ...breakdown },
      reachLines,
      reachCount: calculateReachEffects(selectedReaches, selectedSpell, DEFAULT_REACHES).totalCost,
      overreachAmount: (availableReaches + reachesModifier) < 0 ? Math.abs(availableReaches + reachesModifier) : 0,
      combined: !!selectedSpell.combined,
      componentNames: selectedSpell.componentSpells?.map((s) => s.name),
      ritualBoost,
      ritualIntervalLabel: intervalLabel,
      ritualTimeLabel: formatRitualDuration(ritualMins) || '—',
      duration: getSpellDuration(),
      castingTime: getCastingTime()
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

  const addToActiveSpells = () => {
    if (!selectedSpell) return;
    const entry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      name: selectedSpell.name,
      castingType: selectedSpell.castingType,
      potency: getEffectivePotency(),
      reachLines: buildReachLines(),
    };
    updateChar({ activeSpells: [...activeSpells, entry] });
  };

  const removeActiveSpell = (id) => {
    updateChar({ activeSpells: activeSpells.filter((s) => s.id !== id) });
  };

  const inuredSpells = characterData.inuredSpells || [];

  const addToInuredSpells = () => {
    if (!selectedSpell || inuredSpells.length >= gnosis) return;
    const entry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      name: selectedSpell.name,
      castingType: selectedSpell.castingType,
      potency: getEffectivePotency(),
    };
    updateChar({ inuredSpells: [...inuredSpells, entry] });
  };

  const removeInuredSpell = (id) => {
    updateChar({ inuredSpells: inuredSpells.filter((s) => s.id !== id) });
  };

  const finalPoolDisplay = computeFinalDicePool();
  const castIsImpossible = selectedSpell && finalPoolDisplay <= -6;
  const isInuredSpell = selectedSpell && inuredSpells.some((s) => s.name === selectedSpell.name);

  // ─── Log portal (only on spellcasting page) ───────────────
  const logPortal =
    activePage === 'spellcasting' && typeof document !== 'undefined'
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

  // ─── Render ────────────────────────────────────────────────
  return (
    <>
      {logPortal}
      <div className={`min-h-screen bg-gradient-to-r from-slate-900 to-indigo-900 text-white p-4 transition-opacity duration-500 ${appReady ? 'opacity-100' : 'opacity-0'}`}>

        {/* Navigation bar */}
        <div className="max-w-7xl mx-auto flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold flex items-center gap-2 text-slate-200">
              <img src="/favicon.ico" alt="" className="w-6 h-6" />
              Grimoire<span className="-ml-1 text-indigo-400">.VIP</span>
            </h1>
            {roster && roster.characters.length > 0 && (
              <div className="flex items-center gap-1.5">
                <select
                  value={activeCharId || ''}
                  onChange={(e) => switchCharacter(e.target.value)}
                  className="bg-slate-800 text-slate-300 text-xs border border-slate-700 rounded-lg px-2 py-1.5 focus:outline-none focus:border-indigo-500 max-w-[160px] truncate"
                  title="Switch character"
                >
                  {roster.characters.map((c) => (
                    <option key={c.id} value={c.id}>{c.name || 'Unnamed Mage'}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={createNewCharacter}
                  className="text-slate-500 hover:text-green-400 text-xs p-1 transition-colors"
                  title="New character"
                >
                  <i className="fas fa-plus" />
                </button>
                {roster.characters.length > 1 && (
                  <button
                    type="button"
                    onClick={deleteCurrentCharacter}
                    className="text-slate-500 hover:text-red-400 text-xs p-1 transition-colors"
                    title="Delete current character"
                  >
                    <i className="fas fa-trash-alt" />
                  </button>
                )}
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <input type="file" accept=".json" ref={fileInputRef} onChange={importCharacter} className="hidden" />
            <button
              type="button"
              onClick={exportCharacter}
              className="px-3 py-2 rounded-lg text-sm font-medium bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700 transition-colors"
              title="Export character to JSON"
            >
              <i className="fas fa-download mr-1.5" />Export
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-2 rounded-lg text-sm font-medium bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700 transition-colors"
              title="Import character from JSON"
            >
              <i className="fas fa-upload mr-1.5" />Import
            </button>
            <button
              type="button"
              onClick={() => setActivePage('character')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activePage === 'character'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
              }`}
            >
              <i className="fas fa-user-circle mr-2" />
              Character
            </button>
            <button
              type="button"
              onClick={() => setActivePage('spellcasting')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activePage === 'spellcasting'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
              }`}
            >
              <i className="fas fa-magic mr-2" />
              Spellcasting
            </button>
          </div>
        </div>

        {/* ─── Character Sheet page ───────────────────────── */}
        {activePage === 'character' && (
          <CharacterSheet char={characterData} updateChar={updateChar} onNavigate={setActivePage} />
        )}

        {/* ─── Spellcasting page ──────────────────────────── */}
        {activePage === 'spellcasting' && (
          <>
            <div className={`grid ${showSpellSelector ? 'grid-cols-1 lg:grid-cols-4' : 'grid-cols-1 lg:grid-cols-3'} gap-6 max-w-7xl mx-auto relative`}>
              {/* Left column */}
              <div className="space-y-6 relative">
                <ActiveSpells activeSpells={activeSpells} onRemove={removeActiveSpell} />
                {inuredSpells.length > 0 && (
                  <div className="card animate-slideInLeft">
                    <h2 className="card-title">
                      <i className="fas fa-shield-alt mr-3 text-teal-400"></i> Inured Spells
                      <span className="ml-2 text-xs font-normal text-slate-400">({inuredSpells.length}/{gnosis})</span>
                    </h2>
                    <div className="space-y-2">
                      {inuredSpells.map((spell) => (
                        <div key={spell.id} className="flex items-center justify-between bg-slate-700 rounded-lg px-3 py-2 group">
                          <span className="text-sm font-medium text-white">{spell.name}</span>
                          <button
                            type="button"
                            onClick={() => removeInuredSpell(spell.id)}
                            className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 text-xs p-1 transition-opacity"
                            title="Remove inured spell"
                          >
                            <i className="fas fa-trash-alt" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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

              {showSpellSelector && (
                <div className="space-y-6 lg:h-full">
                  <SpellSelector
                    spells={spells}
                    arcanaValues={arcanaValues}
                    characterSkills={characterData.skills}
                    addUserSpell={addUserSpell}
                    closeSpellSelector={() => setShowSpellSelector(false)}
                  />
                </div>
              )}

              {/* Middle column */}
              <div className="space-y-6">
                {selectedSpell ? (
                  <>
                    <div className="card animate-fadeIn shadow-lg">
                      <h3 className="text-lg font-bold mb-3 flex items-center">
                        <i className="fas fa-scroll mr-3 text-amber-400"></i>
                        Casting Summary
                      </h3>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div
                          className="bg-slate-700 p-4 rounded-lg shadow-sm cursor-pointer hover:bg-slate-600/80 transition-colors"
                          onClick={() => setShowDiceBreakdown(prev => !prev)}
                          title="Click to toggle dice pool breakdown"
                        >
                          <div className="text-sm text-slate-400 mb-1 flex items-center justify-between">
                            Dice Pool
                            <i className={`fas fa-chevron-${showDiceBreakdown ? 'up' : 'down'} text-xs text-slate-500`} />
                          </div>
                          <div className="text-2xl font-bold">{finalPoolDisplay}</div>
                          {castIsImpossible && (
                            <div className="flex items-center mt-2 text-xs text-red-300 bg-red-900/40 border border-red-800/60 rounded-lg px-2 py-1.5">
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

                        <div className="bg-slate-700 p-4 rounded-lg shadow-sm">
                          <div className="text-sm text-slate-400 mb-1">Mana Cost</div>
                          <div className="text-2xl font-bold flex items-center">
                            <i className="fas fa-tint text-blue-400 mr-2"></i>
                            {calculateManaCost()}
                          </div>
                        </div>
                      </div>

                      {activeSpellReachCost > 0 && (
                        <div className="mb-4 flex items-center gap-2 text-xs text-amber-300 bg-amber-900/20 border border-amber-800/30 rounded-lg px-3 py-2">
                          <i className="fas fa-layer-group" />
                          <span>
                            Active spells ({activeSpells.length}/{gnosis}) — this spell requires
                            <strong className="ml-1">+{activeSpellReachCost} Reach{activeSpellReachCost > 1 ? 'es' : ''}</strong>
                          </span>
                        </div>
                      )}

                      {isInuredSpell && (
                        <div className="mb-4 flex items-center gap-2 text-xs text-teal-300 bg-teal-900/20 border border-teal-800/30 rounded-lg px-3 py-2">
                          <i className="fas fa-shield-alt" />
                          <span>This spell is inured — casting it incurs a base Paradox risk of <strong>2 dice</strong>.</span>
                        </div>
                      )}

                      {showDiceBreakdown && (
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
                          activeSpellReachCost={activeSpellReachCost}
                        />
                      )}

                      <div className="mb-4 bg-slate-800 p-3 rounded-lg">
                        <h4 className="text-sm font-bold text-indigo-300 mb-3 flex items-center">
                          <i className="fas fa-dice mr-2"></i> Roll Options
                        </h4>
                        <div className="flex space-x-4">
                          <label className="flex items-center space-x-2 cursor-pointer">
                            <input type="checkbox" checked={eightAgain} onChange={() => setEightAgain(!eightAgain)}
                              className="h-4 w-4 text-indigo-500 rounded border-slate-600 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-800" />
                            <span className="text-sm text-slate-300">8-Again</span>
                          </label>
                          <label className="flex items-center space-x-2 cursor-pointer">
                            <input type="checkbox" checked={nineAgain} onChange={() => setNineAgain(!nineAgain)}
                              className="h-4 w-4 text-indigo-500 rounded border-slate-600 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-800" />
                            <span className="text-sm text-slate-300">9-Again</span>
                          </label>
                        </div>
                      </div>

                      <button
                        type="button" onClick={castSpell} disabled={castIsImpossible}
                        className={`w-full py-3 rounded-lg font-bold flex items-center justify-center shadow-lg transition-all click-effect ${
                          castIsImpossible
                            ? 'bg-slate-600 text-slate-400 cursor-not-allowed opacity-70'
                            : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 hover:shadow-xl'
                        }`}
                      >
                        <i className="fas fa-bolt mr-3"></i>
                        Cast Spell!
                      </button>
                      {(availableReaches + reachesModifier) < 0 && (
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
                      setYantras={(v) => setYantras(v)}
                      setPotencyBoost={setPotencyBoost}
                      potencyBoostLevel={potencyBoostLevel}
                      setPotencyBoostLevel={setPotencyBoostLevel}
                      arcanaValue={selectedSpell?.arcanum ? arcanaValues[selectedSpell.arcanum.toLowerCase()] : 0}
                      arcanaValues={arcanaValues}
                      getCurrentPrimaryFactor={getCurrentPrimaryFactor}
                      isDurationFree={isDurationFree}
                      calculateEffectivePenalty={calculateEffectivePenalty}
                      setDicePoolModifier={setDicePoolModifier}
                      dicePoolModifier={dicePoolModifier}
                      setManaModifier={setManaModifier}
                      manaModifier={manaModifier}
                      reachesModifier={reachesModifier}
                      setReachesModifier={setReachesModifier}
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
                      <button type="button" onClick={() => setShowSpellSelector(true)} className="mt-4 btn btn-primary animate-pulse-subtle">
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
                  onAddToActive={addToActiveSpells}
                  onAddToInured={addToInuredSpells}
                  inuredFull={inuredSpells.length >= gnosis}
                />
              </div>
            </div>
          </>
        )}

        <footer className="text-center mt-10 text-slate-400 text-sm pb-4">
          <a href='https://github.com/witabop/GrimoireVIP' target='_blank' rel="noreferrer">Grimoire.VIP</a>
        </footer>
      </div>
      <DiceRoller />
    </>
  );
}

export default App;
