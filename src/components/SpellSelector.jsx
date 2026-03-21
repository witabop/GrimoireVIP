import React, { useState, useEffect } from 'react';
import { ARCANA } from '../data/arcanaData';

const SPELL_TYPES = {
  IMPROVISED: 'improvised',
  ROTE: 'rote',
  PRAXIS: 'praxis'
};

const ALL_SKILLS = [
  { key: 'academics', label: 'Academics' },
  { key: 'computer', label: 'Computer' },
  { key: 'craft', label: 'Craft' },
  { key: 'investigation', label: 'Investigation' },
  { key: 'medicine', label: 'Medicine' },
  { key: 'occult', label: 'Occult' },
  { key: 'politics', label: 'Politics' },
  { key: 'science', label: 'Science' },
  { key: 'athletics', label: 'Athletics' },
  { key: 'brawl', label: 'Brawl' },
  { key: 'drive', label: 'Drive' },
  { key: 'firearms', label: 'Firearms' },
  { key: 'larceny', label: 'Larceny' },
  { key: 'stealth', label: 'Stealth' },
  { key: 'survival', label: 'Survival' },
  { key: 'weaponry', label: 'Weaponry' },
  { key: 'animalKen', label: 'Animal Ken' },
  { key: 'empathy', label: 'Empathy' },
  { key: 'expression', label: 'Expression' },
  { key: 'intimidation', label: 'Intimidation' },
  { key: 'persuasion', label: 'Persuasion' },
  { key: 'socialize', label: 'Socialize' },
  { key: 'streetwise', label: 'Streetwise' },
  { key: 'subterfuge', label: 'Subterfuge' },
];

const skillLabelToKey = (label) => {
  if (!label) return null;
  const lower = label.toLowerCase().trim();
  if (lower === 'crafts') return 'craft';
  const match = ALL_SKILLS.find((s) => s.label.toLowerCase() === lower || s.key === lower);
  return match ? match.key : null;
};

const SpellSelector = ({ 
  spells, 
  arcanaValues, 
  characterSkills,
  addUserSpell, 
  closeSpellSelector 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedArcanum, setExpandedArcanum] = useState(null);
  const [selectedSpell, setSelectedSpell] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [selectedRoteSkill, setSelectedRoteSkill] = useState(null);
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    setAnimateIn(true);
  }, []);

  useEffect(() => {
    if (selectedType !== SPELL_TYPES.ROTE) {
      setSelectedRoteSkill(null);
      return;
    }
    if (!selectedSpell) return;
    const suggested = (selectedSpell.skills || []).map(skillLabelToKey).filter(Boolean);
    if (suggested.length > 0) setSelectedRoteSkill(suggested[0]);
    else setSelectedRoteSkill(ALL_SKILLS[0].key);
  }, [selectedType, selectedSpell]);

  const getAvailableSpellsByArcanum = (arcanum) => {
    return spells.filter(spell => {
      return spell.arcanum.toLowerCase() === arcanum.toLowerCase() && 
             arcanaValues[arcanum.toLowerCase()] >= spell.level;
    });
  };

  const getSearchResults = () => {
    if (!searchTerm.trim()) return [];
    return spells.filter(spell => {
      const canCast = arcanaValues[spell.arcanum.toLowerCase()] >= spell.level;
      const matchesSearch = spell.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           spell.description.toLowerCase().includes(searchTerm.toLowerCase());
      return canCast && matchesSearch;
    });
  };

  const getDotNotation = (level) => "•".repeat(level);

  const getArcanumColor = (arcanumName) => {
    const arcanum = ARCANA.find(a => a.name.toLowerCase() === arcanumName.toLowerCase());
    return arcanum ? arcanum.color : 'bg-slate-700 text-white';
  };

  const getArcanumIcon = (arcanumName) => {
    const arcanum = ARCANA.find(a => a.name.toLowerCase() === arcanumName.toLowerCase());
    const icon = arcanum?.faIcon || 'magic';
    return <i className={`fas fa-${icon}`}></i>;
  };

  const isRoteReady = selectedType !== SPELL_TYPES.ROTE || selectedRoteSkill;

  const handleAddSpell = () => {
    if (selectedSpell && selectedType && isRoteReady) {
      const spell = { ...selectedSpell, castingType: selectedType };
      if (selectedType === SPELL_TYPES.ROTE && selectedRoteSkill) {
        spell.roteSkill = selectedRoteSkill;
      }
      addUserSpell(spell);
      setSelectedSpell(null);
      setSelectedType(null);
      setSelectedRoteSkill(null);
      closeSpellSelector();
    }
  };

  const suggestedKeys = selectedSpell ? (selectedSpell.skills || []).map(skillLabelToKey).filter(Boolean) : [];

  return (
    <div className={`flex flex-col bg-slate-800 rounded-xl shadow-2xl border border-slate-700 transition-all duration-500 ${animateIn ? 'translate-x-0 opacity-100' : 'translate-x-20 opacity-0'}`}>
      {/* Header */}
      <div className="p-4 border-b border-slate-700 flex justify-between items-center rounded-t-xl">
        <h2 className="text-xl font-bold flex items-center mr-auto">
          <i className="fas fa-magic mr-3 text-indigo-400"></i> Add Spell
        </h2>
        <button 
          type="button"
          onClick={closeSpellSelector}
          className="text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-700 transition-all"
          aria-label="Close spell selector"
        >
          <i className="fas fa-times"></i>
        </button>
      </div>
      
      {/* Search */}
      <div className="p-4 border-b border-slate-700">
        <div className="relative">
          <input
            type="text"
            placeholder="🔎 Search spells by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-700 text-white text-sm border border-slate-600 rounded-lg px-3 py-2.5 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 focus:outline-none transition-all duration-300"
            autoFocus
          />
        </div>
      </div>
      
      {/* Content Area */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Spell Browser */}
        <div className="overflow-y-auto p-4 border-b border-slate-600 flex-1 custom-scrollbar">
          {searchTerm.trim() !== '' && (
            <div className="mb-4 animate-fadeIn">
              <h3 className="font-bold mb-2 text-blue-400 flex items-center">
                <i className="fas fa-search mr-2"></i>
                Search Results
              </h3>
              {getSearchResults().length > 0 ? (
                <div className="space-y-3">
                  {getSearchResults().map((spell, index) => (
                    <div 
                      key={`${spell.name}-${index}`}
                      className={`p-4 rounded-lg cursor-pointer hover:bg-slate-700 transition-all hover:-translate-y-1 hover:shadow-md animate-slideInUp ${
                        selectedSpell?.name === spell.name ? 'bg-blue-500 bg-opacity-20 border border-blue-400' : 'bg-slate-700'
                      }`}
                      onClick={() => setSelectedSpell(spell)}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${getArcanumColor(spell.arcanum)} shadow-md`}>
                          {getArcanumIcon(spell.arcanum)}
                        </div>
                        <div className="font-medium text-xs">{spell.name}</div>
                        <div className="ml-auto text-sm flex items-center">
                          <span className="ml-1 mr-2">{spell.arcanum}</span>
                          <span className="dot-notation">{getDotNotation(spell.level)}</span>
                        </div>
                      </div>
                      <div className="mt-2 text-sm text-slate-400 line-clamp-2">
                        {spell.short_description}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-slate-400 text-center p-4 bg-slate-800 rounded-lg animate-fadeIn">
                  <i className="fas fa-search-minus text-4xl mb-3 text-slate-500"></i>
                  <p>No matching spells found</p>
                </div>
              )}
            </div>
          )}
          
          {searchTerm.trim() === '' && (
            <div className="animate-fadeIn">
              <h3 className="font-bold mb-3 text-green-400 flex items-center">
                <i className="fas fa-book-open mr-2"></i>
                Browse by Arcanum
              </h3>
              <div className="space-y-3">
                {ARCANA.map((arcanum, index) => {
                  const hasAvailableSpells = getAvailableSpellsByArcanum(arcanum.name).length > 0;
                  const isExpanded = expandedArcanum === arcanum.name;
                  const icon = arcanum.faIcon || 'magic';
                  
                  return (
                    <div 
                      key={arcanum.name} 
                      className={`rounded-lg overflow-hidden shadow-md transition-all duration-300 animate-slideInLeft`}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div 
                        className={`flex items-center p-2 rounded-lg cursor-pointer ${
                          hasAvailableSpells ? arcanum.color : 'bg-slate-700 opacity-50'
                        } hover:shadow-lg transition-all`}
                        style={{ cursor: hasAvailableSpells ? 'pointer' : 'not-allowed' }}
                        onClick={() => {
                          if (hasAvailableSpells) {
                            setExpandedArcanum(isExpanded ? null : arcanum.name);
                          }
                        }}
                      >
                        <i className={`fas fa-${icon} mr-3 text-lg`}></i>
                        <span className="font-medium text-lg">{arcanum.name}</span>
                        <span className="ml-auto">
                          {hasAvailableSpells ? (isExpanded ? 
                            <i className="fas fa-chevron-up transition-transform"></i> : 
                            <i className="fas fa-chevron-down transition-transform"></i>
                          ) : ''}
                        </span>
                      </div>
                      
                      {isExpanded && (
                        <div className="bg-slate-700 p-3 space-y-2 max-h-72 overflow-y-auto custom-scrollbar animate-slideInUp shadow-inner rounded-sm mb-1.5 -mt-1">
                          {getAvailableSpellsByArcanum(arcanum.name).map((spell, spellIndex) => (
                            <div 
                              key={`${spell.name}-${spellIndex}`}
                              className={`hover:bg-slate-600 p-3 rounded-xs cursor-pointer transition-all animate-fadeIn ${
                                selectedSpell?.name === spell.name ? 'bg-blue-500' : 'bg-slate-700'
                              }`}
                              onClick={() => setSelectedSpell(spell)}
                              style={{ animationDelay: `${spellIndex * 30}ms` }}
                            >
                              <div className="flex items-center justify-between">
                                <div className="font-medium flex items-center">
                                  <div className={`w-7 h-7 rounded-full flex items-center justify-center mr-3 ${getArcanumColor(spell.arcanum)} shadow-md`}>
                                    {getArcanumIcon(spell.arcanum)}
                                  </div>
                                  {spell.name}
                                </div>
                                <div className="ml-2 text-sm dot-notation">{getDotNotation(spell.level)}</div>
                              </div>
                              <div className="mt-2 text-sm text-slate-400 line-clamp-2">
                                {spell.short_description}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        
        {/* Spell Details & Type Selection */}
        <div className="p-5 bg-slate-900 bg-opacity-70">
          {selectedSpell ? (
            <div className="flex flex-col animate-fadeIn p-4">
              <div className="mb-4 bg-slate-700 p-4 rounded-lg shadow-md border border-slate-600">
                <h3 className="text-lg font-bold flex items-center">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center mr-3 ${getArcanumColor(selectedSpell.arcanum)} shadow-md`}>
                    {getArcanumIcon(selectedSpell.arcanum)}
                  </div>
                  {selectedSpell.name}
                </h3>
                <div className="flex items-center text-sm mb-3 space-x-3">
                  <div className="badge badge-blue">
                    {selectedSpell.arcanum} {getDotNotation(selectedSpell.level)}
                  </div>
                  <div className="badge badge-purple">
                    {selectedSpell.practice}
                  </div>
                </div>
                <p className={`text-slate-300 mb-4 bg-slate-700 p-2 rounded-lg shadow-inner ${selectedSpell.description.length > 742 ? 'text-[11px]' : 'text-sm'}`}>
                  {selectedSpell.description}
                </p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-slate-700 p-2 rounded-lg flex flex-col">
                    <span className="text-slate-400 text-xs">Primary Factor:</span>
                    <span className="text-blue-300 font-medium">{selectedSpell.primaryFactor}</span>
                  </div>
                  {selectedSpell.withstand && (
                    <div className="bg-slate-700 p-2 rounded-lg flex flex-col">
                      <span className="text-slate-400 text-xs">Withstand:</span>
                      <span className="text-red-300 font-medium">{selectedSpell.withstand}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="animate-fadeIn">
                <h3 className="font-bold mb-3 flex items-center">
                  <i className="fas fa-hat-wizard mr-2 text-purple-400"></i>
                  How will you cast {selectedSpell.name}?
                </h3>
                <div className="grid grid-cols-3 gap-3 w-full">
                  {Object.values(SPELL_TYPES).map(type => (
                    <button
                      key={type}
                      type="button"
                      id={type}
                      onClick={() => setSelectedType(type)}
                      className={`p-2 rounded-lg border border-slate-600 overflow-hidden transition-all duration-300 hover:-translate-y-1 ${
                        selectedType === type 
                          ? 'border-indigo-500 bg-slate-700/70 scale-105 transform shadow-lg' 
                          : 'hover:border-slate-500 shadow-md hover:shadow-lg'
                      }`}
                    >
                      <div className="text-center mb-1 text-xl">
                        {type === SPELL_TYPES.ROTE && <i className="fas fa-book text-blue-400"></i>}
                        {type === SPELL_TYPES.PRAXIS && <i className="fas fa-bolt text-yellow-200"></i>}
                        {type === SPELL_TYPES.IMPROVISED && <i className="fas fa-hat-wizard text-indigo-400"></i>}
                      </div>
                      <div className={`text-[10px] capitalize font-medium text-center truncate ${
                        selectedType === type ? 'text-indigo-400' : ''
                      }`}>{type}</div>
                    </button>
                  ))}
                </div>

                {/* Rote Skill Selection */}
                {selectedType === SPELL_TYPES.ROTE && (
                  <div className="mt-4 bg-slate-800/60 rounded-lg p-3 border border-slate-700 animate-fadeIn">
                    {suggestedKeys.length > 0 && (
                      <p className="text-[11px] text-slate-400 mb-2">
                        <i className="fas fa-info-circle mr-1 text-indigo-400" />
                        Suggested rote skills: {selectedSpell.skills.map((s, i) => (
                          <span key={i} className="text-indigo-300 font-medium">{s}{i < selectedSpell.skills.length - 1 ? ', ' : ''}</span>
                        ))}
                      </p>
                    )}
                    <label className="flex items-center gap-2 text-xs text-slate-300">
                      <span className="whitespace-nowrap font-medium">Rote Skill:</span>
                      <select
                        value={selectedRoteSkill || ''}
                        onChange={(e) => setSelectedRoteSkill(e.target.value)}
                        className="flex-1 bg-slate-700 text-white text-xs border border-slate-600 rounded-lg px-2 py-1.5 focus:outline-none focus:border-indigo-500"
                      >
                        {suggestedKeys.length > 0 && (
                          <optgroup label="Suggested">
                            {ALL_SKILLS.filter((s) => suggestedKeys.includes(s.key)).map((s) => (
                              <option key={s.key} value={s.key}>{s.label} ({characterSkills[s.key] || 0})</option>
                            ))}
                          </optgroup>
                        )}
                        <optgroup label="All Skills">
                          {ALL_SKILLS.map((s) => (
                            <option key={s.key} value={s.key}>{s.label} ({characterSkills[s.key] || 0})</option>
                          ))}
                        </optgroup>
                      </select>
                    </label>
                  </div>
                )}
              </div>
            </div>
          ) : null}
          
          {/* Footer */}
          <div className="mt-2 pt-4 border-t border-slate-700 flex justify-end p-4 gap-3">
            <button
              type="button"
              onClick={closeSpellSelector}
              className="px-4 py-2.5 rounded-lg font-medium bg-slate-700 hover:bg-slate-600 transition-all hover:-translate-y-1 shadow-md hover:shadow-lg cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAddSpell}
              disabled={!selectedSpell || !selectedType || !isRoteReady}
              className={`px-4 py-2.5 rounded-lg font-medium flex items-center text-white transition-all shadow-md ${
                selectedSpell && selectedType && isRoteReady
                  ? 'bg-indigo-600 hover:bg-indigo-500 cursor-pointer hover:-translate-y-1 hover:shadow-lg'
                  : 'bg-slate-600 cursor-not-allowed opacity-70'
              }`}
            >
              <i className="fas fa-plus mr-2"></i> Add Spell
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpellSelector;
