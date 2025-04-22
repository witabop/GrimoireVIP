import React, { useState, useEffect } from 'react';
import { ARCANA } from '../data/arcanaData';

const SPELL_TYPES = {
  IMPROVISED: 'improvised',
  ROTE: 'rote',
  PRAXIS: 'praxis'
};

const SpellSelector = ({ 
  spells, 
  arcanaValues, 
  addUserSpell, 
  closeSpellSelector 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedArcanum, setExpandedArcanum] = useState(null);
  const [selectedSpell, setSelectedSpell] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    // Trigger animation after component mounts
    setAnimateIn(true);
  }, []);

  // Filter spells the user can cast based on their Arcana
  const getAvailableSpellsByArcanum = (arcanum) => {
    return spells.filter(spell => {
      return spell.arcanum.toLowerCase() === arcanum.toLowerCase() && 
             arcanaValues[arcanum.toLowerCase()] >= spell.level;
    });
  };

  // Get spells matching search term
  const getSearchResults = () => {
    if (!searchTerm.trim()) return [];
    
    return spells.filter(spell => {
      const canCast = arcanaValues[spell.arcanum.toLowerCase()] >= spell.level;
      const matchesSearch = spell.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           spell.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      return canCast && matchesSearch;
    });
  };

  // Convert numeric level to dot notation
  const getDotNotation = (level) => {
    return "•".repeat(level);
  };

  // Get color class for arcanum
  const getArcanumColor = (arcanumName) => {
    const arcanum = ARCANA.find(a => a.name.toLowerCase() === arcanumName.toLowerCase());
    return arcanum ? arcanum.color : 'bg-slate-700 text-white';
  };

  // Get icon for arcanum
  const getArcanumIcon = (arcanumName) => {
    const arcanum = ARCANA.find(a => a.name.toLowerCase() === arcanumName.toLowerCase());
    const icon = arcanum?.faIcon || 'magic';
    return <i className={`fas fa-${icon}`}></i>;
  };

  // Handle adding a spell to the spellbook
  const handleAddSpell = () => {
    if (selectedSpell && selectedType) {
      addUserSpell({
        ...selectedSpell,
        castingType: selectedType
      });
      
      // Reset state and close selector
      setSelectedSpell(null);
      setSelectedType(null);
      closeSpellSelector();
    }
  };

  return (
    <div style={{position: 'flex', backgroundColor: '#1E293B', borderRadius: '.75rem', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.25)', borderWidth: "1px", borderColor: '#334155' }} className={`flex flex-col transform transition-all duration-500 ${animateIn ? 'translate-x-0 opacity-100' : 'translate-x-20 opacity-0'}`}>
      {/* Header */}
      <div className="p-4 border-b border-slate-700 flex justify-between items-center rounded-t-xl">
        <h2 className="text-xl font-bold flex items-center" style={{marginRight: 'auto'}}>
          <i className="fas fa-magic mr-3 text-indigo-400"></i> Add Spell
        </h2>
        <button 
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
            className="w-full bg-slate-700 text-white border border-slate-600 rounded-lg pl-10 p-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 focus:outline-none transition-all duration-300"
            autoFocus
            style={{ fontSize: 15, padding: 10, outline: 'none' }}
          />
        </div>
      </div>
      
      {/* Content Area */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Spell Browser */}
        <div className="overflow-y-auto p-4 border-b border-slate-600 flex-1 custom-scrollbar">
          {/* Search Results */}
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
                      style={{ animationDelay: `${index * 50}ms`, cursor: 'pointer', paddingTop: 8, paddingBottom: 8, borderBottom: '1px solid rgba(255, 255, 255, 0.1)' } }
                    >
                      <div className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${getArcanumColor(spell.arcanum)} shadow-md`}>
                          {getArcanumIcon(spell.arcanum)}
                        </div>
                        <div className="font-medium text-xs">{spell.name}</div>
                        <div className="ml-auto text-sm flex items-center">
                          <span className="mr-2 ml-2" style={{marginLeft: 2}}>{spell.arcanum}</span>
                          <span className="dot-notation">{getDotNotation(spell.level)}</span>
                        </div>
                      </div>
                      <div className="mt-2 text-sm text-slate-400 line-clamp-2">
                        {spell.description}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-slate-400 text-center p-6 bg-slate-800 rounded-lg animate-fadeIn">
                  <i className="fas fa-search-minus text-4xl mb-3 text-slate-500"></i>
                  <p>No matching spells found</p>
                </div>
              )}
            </div>
          )}
          
          {/* Browse by Arcanum */}
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
                        className={`flex items-center p-3 rounded-lg cursor-pointer ${
                          hasAvailableSpells ? arcanum.color : 'bg-slate-700 opacity-50'
                        } hover:shadow-lg transition-all`}
                        style={{cursor: hasAvailableSpells ? 'pointer' : 'not-allowed', marginBottom: 5}}
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
                        <div className="bg-slate-700 p-4 space-y-2 max-h-72 overflow-y-auto custom-scrollbar animate-slideInUp shadow-inner" style={{marginBottom: 6, marginTop: -5, borderRadius: 1}}>
                          {getAvailableSpellsByArcanum(arcanum.name).map((spell, spellIndex) => (
                            <div 
                              key={`${spell.name}-${spellIndex}`}
                              className={`hover:bg-slate-600 p-3 rounded-xs cursor-pointer transition-all animate-fadeIn ${
                                selectedSpell?.name === spell.name ? 'bg-blue-900 bg-opacity-50 border border-blue-500 shadow-md' : 'bg-slate-800'
                              }`}
                              onClick={() => setSelectedSpell(spell)}
                              style={{ animationDelay: `${spellIndex * 30}ms`, cursor: 'pointer', paddingTop: 8, paddingBottom: 8, borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}
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
                                {spell.description}
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
              <div className="mb-4 bg-slate-700 p-4 rounded-lg shadow-md border border-slate-600" style={{borderWidth: .5, borderColor: '#818CF8'}}>
                <h3 className="text-lg font-bold mb-2 flex items-center">
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
                <p className="text-slate-300 mb-4 bg-slate-800 p-3 rounded-lg shadow-inner" style={{fontSize: 14}}>
                  {selectedSpell.description}
                </p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-slate-800 p-3 rounded-lg flex flex-col">
                    <span className="text-slate-400 text-xs">Primary Factor:</span>
                    <span className="text-blue-300 font-medium">{selectedSpell.primaryFactor}</span>
                  </div>
                  {selectedSpell.withstand && (
                    <div className="bg-slate-800 p-3 rounded-lg flex flex-col">
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
                <div className="grid grid-cols-3 gap-4" style={{display: 'inline-flex'}}>
                  {console.log(selectedType)}
                  {Object.values(SPELL_TYPES).map(type => (
                    <button
                      key={type}
                      id={type}
                      onClick={() => setSelectedType(type)}
                      className={`p-4 rounded-lg border transition-all duration-300 hover:-translate-y-1 ${
                        selectedType === type 
                          ? 'border-indigo-400 bg-slate-700 bg-opacity-70 scale-105 transform shadow-lg' 
                          : 'border-slate-600 hover:border-slate-400 shadow-md hover:shadow-lg'
                      }`}
                      style={{borderColor: selectedType === type ? '#4F46E5' : '#334155', borderWidth: 1}}
                    >
                      <div className="text-center mb-3 p-3" style={{fontSize: 25}}>
                        {type === SPELL_TYPES.ROTE && <i className="fas fa-book text-4xl text-blue-400" style={{fontSize: 25}}></i>}
                        {type === SPELL_TYPES.PRAXIS && <i className="fas fa-bolt text-4xl text-yellow-200" style={{color: '#FACC15', fontSize: 25}}></i>}
                        {type === SPELL_TYPES.IMPROVISED && <i className="fas fa-hat-wizard text-4xl text-indigo-400" style={{fontSize: 25}}></i>}
                      </div>
                      <div className={`text-sm capitalize font-medium ${
                        selectedType === type ? 'text-indigo-400' : ''
                      }`} style={{fontSize: 10, width: 45}}>{type}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
          
          {/* Footer */}
          <div className="mt-4 pt-4 border-t border-slate-700 flex justify-end p-4">
            <button
              onClick={closeSpellSelector}
              className=" py-2 rounded-lg font-medium bg-slate-700 hover:bg-slate-600 mr-3 transition-all hover:-translate-y-1 shadow-md hover:shadow-lg"
              style={{cursor: 'pointer', padding: 10}}
            >
              Cancel
            </button>
            <button
              onClick={handleAddSpell}
              disabled={!selectedSpell || !selectedType}
              className={`px-4 py-2 rounded-lg font-medium flex items-center transition-all hover:-translate-y-1 shadow-md hover:shadow-lg ${
                selectedSpell && selectedType
                  ? 'bg-slate-400 cursor-pointer'
                  : 'bg-slate-600 cursor-not-allowed opacity-70'
              }`}
              style={{padding: 10, backgroundColor: selectedSpell && selectedType ? '#4F46E5' : '#475569', color: 'white'}}
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