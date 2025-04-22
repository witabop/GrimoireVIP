import React from 'react';
import { ARCANA } from '../data/arcanaData';

const SPELL_TYPES = {
  IMPROVISED: 'improvised',
  ROTE: 'rote',
  PRAXIS: 'praxis'
};

const SpellBook = ({ 
  userSpells, 
  removeUserSpell, 
  selectSpell, 
  selectedSpell,
  setShowSpellSelector
}) => {
  // Convert numeric level to dot notation
  const getDotNotation = (level) => {
    return "•".repeat(level);
  };

  // Get icon for spell type
  const getSpellTypeIcon = (type) => {
    switch (type) {
      case SPELL_TYPES.ROTE:
        return <i className="fas fa-book text-blue-400"></i>;
      case SPELL_TYPES.PRAXIS:
        return <i className="fas fa-bolt text-yellow-400"></i>;
      default:
        return <i className="fas fa-hat-wizard text-purple-400"></i>;
    }
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

  return (
    <div className="card animate-slideInLeft">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold flex items-center" style={{ marginRight: '10px' }}>
          <i className="fas fa-book-open mr-3 text-purple-400"></i> Spell Book
        </h2>
        <button
          onClick={() => setShowSpellSelector(true)}
          className="btn btn-primary"
          aria-label="Add Spell"
        >
          <i className="fas fa-plus mr-1"></i> Add
        </button>
      </div>
      
      {userSpells.length === 0 ? (
        <div className="text-center p-8 bg-slate-700 rounded-lg">
          <i className="fas fa-scroll text-5xl mb-4 text-slate-500"></i>
          <p className="text-slate-300 font-medium">Your spell book is empty</p>
          <p className="text-slate-400 text-sm mt-2">Click "Add" to get started</p>
        </div>
      ) : (
        <div className="space-y-3 custom-scrollbar" style={{paddingTop: 4}}>
          {userSpells.map((spell, index) => (
            <div 
              key={`${spell.name}-${spell.castingType}-${index}`}
              className={`spell-item ${
                selectedSpell && selectedSpell.name === spell.name && selectedSpell.castingType === spell.castingType
                  ? 'spell-item-selected' 
                  : 'spell-item-normal'
              } group`}
              onClick={() => selectSpell(spell)}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${getArcanumColor(spell.arcanum)} shadow-md group-hover:scale-110 transition-transform mr-2`}>
                {getArcanumIcon(spell.arcanum)}
              </div>
              
              <div className="flex-grow">
                <div className="font-medium text-lg group-hover:text-white">{spell.name}</div>
                <div className="text-xs text-slate-400 flex items-center mt-1 space-x-3">
                  <span className="inline-flex items-center">
                    {getSpellTypeIcon(spell.castingType)}
                    <span className="ml-4 capitalize" style={{marginRight: 2, marginLeft: 5}}>{spell.castingType}</span>
                  </span>
                  <span className="text-slate-500 mr-2"> | </span>
                  <span className="inline-flex items-center">
                    <span className="ml-2"> {spell.arcanum} <span className="dot-notation">{getDotNotation(spell.level)}</span></span>
                  </span>
                </div>
              </div>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeUserSpell(spell);
                }}
                className="hover:text-red-50"
                title="Remove spell"
                style={{marginLeft: 'auto', color: 'gray'}}
              >
                <i className="fas fa-trash-alt hover:text-red-50"></i>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default SpellBook;