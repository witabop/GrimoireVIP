import React from 'react';
import { ARCANA } from '../data/arcanaData';

const CharacterStats = ({ gnosis, setGnosis, arcanaValues, setArcanaValues }) => {
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
            className="bg-slate-800 hover:bg-slate-600 rounded-full w-8 h-8 flex items-center justify-center shadow-md transition-colors"
            disabled={gnosis >= 10}
          >
            <i className="fas fa-plus"></i>
          </button>
          
          <div 
            onClick={handleGnosisDecrease}
            className="bg-slate-800 text-white rounded-full cursor-pointer"
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
      <div className="grid grid-cols-2 gap-4">
        {ARCANA.map((arcanum) => {
          const value = arcanaValues[arcanum.name.toLowerCase()];
          const arcanumColor = getArcanumColor(arcanum.name);
          const textColor = arcanumColor.includes('text-white') ? '#ffffff' : '#000000';
          
          return (
            <div key={arcanum.name.toLowerCase()} className="mb-4 transition-all duration-300">
              <label className="flex items-center mb-2 font-medium">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center mr-2 ${arcanumColor} shadow-md`}>
                  {getArcanumIcon(arcanum.name)}
                </div>
                {arcanum.name}
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
                  className={`${arcanumColor} rounded-full cursor-pointer shadow-md`}
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