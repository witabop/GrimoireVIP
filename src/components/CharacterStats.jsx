import React from 'react';
import { ARCANA } from '../data/arcanaData';

const CharacterStats = ({ gnosis, setGnosis, arcanaValues, setArcanaValues, majorArcana, setMajorArcana }) => {
  const handleArcanumIncrease = (arcanum) => {
    const currentValue = arcanaValues[arcanum.toLowerCase()];
    if (currentValue < 5) {
      setArcanaValues({ ...arcanaValues, [arcanum.toLowerCase()]: currentValue + 1 });
    }
  };

  const handleArcanumDecrease = (arcanum) => {
    const currentValue = arcanaValues[arcanum.toLowerCase()];
    if (currentValue > 0) {
      setArcanaValues({ ...arcanaValues, [arcanum.toLowerCase()]: currentValue - 1 });
    }
  };

  const handleGnosisIncrease = () => {
    if (gnosis < 10) {
      setGnosis(gnosis + 1);
    }
  };

  const handleGnosisDecrease = () => {
    if (gnosis > 1) {
      setGnosis(gnosis - 1);
    }
  };

  // Toggle major Arcana status
  const toggleMajorArcana = (arcanum) => {
    const arcanumLower = arcanum.toLowerCase();
    if (majorArcana.includes(arcanumLower)) {
      // Remove from major Arcana
      setMajorArcana(majorArcana.filter(a => a !== arcanumLower));
    } else {
      // Add to major Arcana if we have less than 3
      if (majorArcana.length < 3) {
        setMajorArcana([...majorArcana, arcanumLower]);
      }
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

  // Check if arcanum is one of the major Arcana
  const isMajorArcana = (arcanumName) => {
    return majorArcana.includes(arcanumName.toLowerCase());
  };

  return (
    <div className="card animate-slideInLeft">
      <h2 className="card-title">
        <i className="fas fa-user-circle mr-3 text-indigo-400 mb-3"></i> <span style={{marginTop: -10}}>Mage Stats</span>
      </h2>
      
      <div className="mb-5 p-4 bg-slate-700 rounded-lg">
        <label className="block mb-3 font-medium flex items-center">
          <i className="fas fa-star mr-2 text-yellow-400"></i>
          Gnosis
        </label>
        <div className="flex items-center space-x-3">
          <button 
            onClick={handleGnosisIncrease}
            className="bg-slate-700 hover:bg-slate-600 rounded-full w-8 h-8 flex items-center justify-center shadow-md transition-colors"
            disabled={gnosis >= 10}
          >
            <i className="fas fa-plus"></i>
          </button>
          
          <div 
            onClick={handleGnosisDecrease}
            className="bg-slate-700 text-white rounded-full cursor-pointer"
            style={{ width: '180px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 12px', cursor: 'pointer' }}
          >
            {Array.from({ length: 10 }).map((_, i) => (
              <span 
                key={i} 
                style={{ 
                  display: 'inline-block', 
                  width: '10px', 
                  height: '10px', 
                  borderRadius: '50%', 
                  margin: '0 3px',
                  backgroundColor: i < gnosis ? '#ffffff' : '#4b5563',
                  opacity: i < gnosis ? 1 : 0.4
                }}
              />
            ))}
          </div>
        </div>
        <div className="mt-3 text-sm text-slate-400">Higher Gnosis improves spellcasting</div>
      </div>
      
      <h3 className="text-lg font-bold mb-3 flex items-center mt-4">
        <i className="fas fa-magic mr-2 text-purple-400"></i>
        Arcana
      </h3>
      <div className="text-sm text-slate-400 mb-3">
        Click an Arcana icon to mark it as a major Arcanum (max 3). <span className="text-amber-300">Major Arcana don't require Mana for improvised spells.</span>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {ARCANA.map((arcanum) => {
          const value = arcanaValues[arcanum.name.toLowerCase()];
          const arcanumColor = getArcanumColor(arcanum.name);
          const textColor = arcanumColor.includes('text-white') ? '#ffffff' : '#000000';
          const isMajor = isMajorArcana(arcanum.name);
          
          return (
            <div key={arcanum.name.toLowerCase()} className="mb-4 transition-all duration-300">
              <label className="flex items-center mb-2 font-medium">
                <div 
                  className={`w-7 h-7 rounded-full flex items-center justify-center mr-2 ${arcanumColor} shadow-md cursor-pointer transition-all duration-300 ${isMajor ? 'ring-2 ring-yellow-400 ring-offset-2 ring-offset-slate-800 scale-110' : 'hover:scale-105'}`}
                  onClick={() => toggleMajorArcana(arcanum.name)}
                  title={isMajor ? "Major Arcanum (click to remove)" : "Click to set as Major Arcanum"}
                >
                  {getArcanumIcon(arcanum.name)}
                </div>
                {arcanum.name}
                {isMajor && (
                  <span className="text-indigo-400 ml-2 text-xs font-bold">Major</span>
                )}
              </label>
              <div className="flex items-center space-x-3">
                <button 
                  onClick={() => handleArcanumIncrease(arcanum.name)}
                  className={`rounded-full w-8 h-8 flex items-center justify-center shadow-md hover:opacity-80 transition-colors mr-2`}
                  disabled={value >= 5}
                >
                  <i className="fas fa-plus"></i>
                </button>
                
                <div 
                  onClick={() => handleArcanumDecrease(arcanum.name)}
                  className={`${arcanumColor} rounded-full cursor-pointer shadow-md ${isMajor ? 'border-2 border-yellow-400' : ''}`}
                  style={{ width: '120px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 12px', cursor: 'pointer' }}
                >
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span 
                      key={i} 
                      style={{ 
                        display: 'inline-block', 
                        width: '10px', 
                        height: '10px', 
                        borderRadius: '50%', 
                        margin: '0 3px',
                        backgroundColor: i < value ? textColor : '#1e293b',
                        opacity: i < value ? 1 : 0.4
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CharacterStats;