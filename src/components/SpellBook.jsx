import React, { useState, useRef } from 'react';
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
  setShowSpellSelector,
  onCombineSpells,
  gnosis,
  updateSpellOrder // New prop for updating the spell order
}) => {
  // Track multi-selected spells for combining
  const [selectedSpells, setSelectedSpells] = useState([]);
  const [draggedSpell, setDraggedSpell] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  // Calculate max spells that can be combined based on Gnosis
  const maxCombinedSpells =
    gnosis >= 9 ? 4 :
      gnosis >= 6 ? 3 :
        gnosis >= 3 ? 2 : 1;

  // Check if any selected spells are already combined
  const hasAlreadyCombinedSpell = selectedSpells.some(spell => spell.combined);

  // Check if all spells are rotes (rotes cannot be combined)
  const anyRotes = selectedSpells.some(spell => spell.castingType === 'rote');

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
        return <i className="fas fa-bolt text-yellow-400" style={{ color: '#fef08a' }}></i>;
      default:
        return <i className="fas fa-hat-wizard text-indigo-400"></i>;
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
    const icon = arcanum?.faIcon || 'wand-sparkles';
    return <i className={`fas fa-${icon}`}></i>;
  };

  // Handle click on a spell (with shift for multi-select)
  const handleSpellClick = (spell, event) => {
    // Check if ctrl key (or cmd key on Mac) was pressed
    if (event.ctrlKey || event.metaKey) {
      // Don't allow adding combined spells to selection
      if (spell.combined) {
        return;
      }

      // Don't allow selecting rotes for combination
      if (spell.castingType === 'rote') {
        return;
      }

      // Ctrl/Cmd key was pressed, toggle this spell in the multi-select array
      if (selectedSpells.some(s => s.name === spell.name && s.castingType === spell.castingType)) {
        // Remove from multi-select
        setSelectedSpells(selectedSpells.filter(
          s => !(s.name === spell.name && s.castingType === spell.castingType)
        ));
      } else {
        // Add to multi-select
        setSelectedSpells([...selectedSpells, spell]);
      }
    } else {
      // No ctrl/cmd key, just select the spell
      selectSpell(spell);
      setSelectedSpells([]); // Clear multi-selection
    }
  };

  // Handle combine button click
  const handleCombineClick = () => {
    // Check for valid combination
    if (selectedSpells.length <= 1 ||
      selectedSpells.length > maxCombinedSpells ||
      hasAlreadyCombinedSpell ||
      anyRotes) {
      return;
    }

    // Proceed with combination
    onCombineSpells([...selectedSpells]);

    // Clear selection after initiating combination
    setSelectedSpells([]);
  };

  // Check if a spell is in the selection
  const isSpellSelected = (spell) => {
    return selectedSpells.some(
      s => s.name === spell.name && s.castingType === spell.castingType
    );
  };

  // Drag and drop handlers
  const handleDragStart = (e, spell, index) => {
    setDraggedSpell({ spell, index });
    // Set the drag image to be transparent (optional)
    const img = new Image();
    img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'; // Transparent GIF
    e.dataTransfer.setDragImage(img, 0, 0);
    
    // Add a class to the dragged element
    e.currentTarget.classList.add('dragging');
  };

  const handleDragEnd = (e) => {
    e.currentTarget.classList.remove('dragging');
    setDraggedSpell(null);
    setDragOverIndex(null);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedSpell === null) return;
    if (dragOverIndex === index) return;
    
    setDragOverIndex(index);
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    if (draggedSpell === null) return;
    
    const { index: sourceIndex } = draggedSpell;
    if (sourceIndex === targetIndex) return;

    // Create a new array with the reordered spells
    const newSpells = [...userSpells];
    const [movedSpell] = newSpells.splice(sourceIndex, 1);
    newSpells.splice(targetIndex, 0, movedSpell);

    // Update the parent component with the new order
    updateSpellOrder(newSpells);

    setDraggedSpell(null);
    setDragOverIndex(null);
  };

  // Determine if this index has a drop indicator above or below
  const getDropIndicatorPosition = (index) => {
    if (draggedSpell === null || dragOverIndex !== index) return null;
    
    if (draggedSpell.index < index) {
      return 'below'; // Show indicator below when dragging from above
    } else {
      return 'above'; // Show indicator above when dragging from below
    }
  };

  return (
    <div className="card animate-slideInLeft">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold flex items-center" style={{ marginRight: '10px' }}>
          <i className="fas fa-book-open mr-3 text-purple-400"></i> Spell Book
        </h2>
        <div className="flex">
          {selectedSpells.length > 1 ? (
            <button
              onClick={handleCombineClick}
              className={`btn ${selectedSpells.length <= maxCombinedSpells && !hasAlreadyCombinedSpell && !anyRotes
                ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
                : 'bg-red-600 hover:bg-red-500 text-white'
                }`}
              disabled={hasAlreadyCombinedSpell || anyRotes}
              title={
                hasAlreadyCombinedSpell ? 'Cannot combine already combined spells' :
                  anyRotes ? 'Rotes cannot be combined' :
                    selectedSpells.length > maxCombinedSpells ?
                      `Your Gnosis (${gnosis}) limits you to ${maxCombinedSpells} spells` :
                      'Combine selected spells'
              }
            >
              <i className="fas fa-magic mr-1"></i> Combine ({selectedSpells.length})
            </button>
          ) : (
            <button
              onClick={() => setShowSpellSelector(true)}
              className="btn btn-primary"
              aria-label="Add Spell"
            >
              <i className="fas fa-plus mr-1"></i> Add
            </button>
          )}
        </div>
      </div>

      {selectedSpells.length > 0 && (
        <div className="mb-4 text-sm bg-indigo-900 bg-opacity-30 p-3 rounded-lg border border-indigo-800">
          <i className="fas fa-info-circle mr-2 text-indigo-300"></i>
          <span className="text-indigo-200">
            <strong>Ctrl+Click</strong> (or Cmd+Click on Mac) to select multiple spells. Selected: {selectedSpells.length}
            {hasAlreadyCombinedSpell && (
              <span className="text-red-300 ml-1">
                (Cannot combine already combined spells)
              </span>
            )}
            {selectedSpells.length > maxCombinedSpells && (
              <span className="text-red-300 ml-1">
                (Your Gnosis of {gnosis} allows combining up to {maxCombinedSpells} spells)
              </span>
            )}
          </span>
        </div>
      )}

      {userSpells.length === 0 ? (
        <div className="text-center p-8 bg-slate-700 rounded-lg">
          <i className="fas fa-scroll text-5xl mb-4 text-slate-500"></i>
          <p className="text-slate-300 font-medium">Your spell book is empty</p>
          <p className="text-slate-400 text-sm mt-2">Click "Add" to get started</p>
        </div>
      ) : (
        <div className="space-y-1 custom-scrollbar" style={{ paddingTop: 4 }}>
          {userSpells.map((spell, index) => (
            <div
              key={`${spell.name}-${spell.castingType}-${index}`}
              className={`spell-item relative ${
                (selectedSpell && selectedSpell.name === spell.name && selectedSpell.castingType === spell.castingType)
                  ? 'spell-item-selected'
                  : isSpellSelected(spell)
                    ? 'bg-indigo-900 border border-indigo-500'
                    : 'spell-item-normal'
                } group cursor-move transition-transform ${
                  draggedSpell?.index === index ? 'opacity-50' : 'opacity-100'
                }`}
              onClick={(e) => handleSpellClick(spell, e)}
              draggable="true"
              onDragStart={(e) => handleDragStart(e, spell, index)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => handleDrop(e, index)}
              style={{ 
                border: isSpellSelected(spell) ? '1px solid #6366f1' : '1px solid rgba(255, 255, 255, 0.1)', 
                padding: '12px', 
                borderRadius: '8px', 
                marginBottom: 3,
                transform: draggedSpell?.index === index ? 'scale(0.98)' : 'scale(1)',
                position: 'relative',
                zIndex: draggedSpell?.index === index ? 10 : 1
              }}
            >

              <div className="flex items-center w-full">
                <div className="flex items-center mr-2 opacity-70 cursor-grab">
                  <i className="fas fa-grip-lines text-slate-400"></i>
                </div>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${getArcanumColor(spell.arcanum)} shadow-md group-hover:scale-110 transition-transform mr-2`}>
                  {getArcanumIcon(spell.arcanum)}
                </div>

                <div className="flex-grow">
                  <div className="font-medium text-lg group-hover:text-white">
                    {spell.name}
                  </div>
                  <div className="text-xs text-slate-400 flex items-center mt-1 space-x-3">
                    <span className="inline-flex items-center">
                      {getSpellTypeIcon(spell.castingType)}
                      <span className="ml-4 capitalize" style={{ marginRight: 2, marginLeft: 5 }}>{spell.castingType}</span>
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
                  className="hover:text-red-400 ml-auto"
                  title="Remove spell"
                  style={{ marginLeft: 'auto ', color: 'gray' }}
                >
                  <i className="fas fa-trash-alt hover:text-red-400"></i>
                </button>
              </div>

              {/* Drop indicator below */}
              {getDropIndicatorPosition(index) === 'below' && (
                <div className="absolute left-0 right-0 bottom-0 h-1 bg-indigo-500 rounded-full transform translate-y-1" 
                     style={{ zIndex: 20 }}></div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SpellBook;