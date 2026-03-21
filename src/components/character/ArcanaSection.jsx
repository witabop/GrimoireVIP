import React from 'react';
import { ARCANA } from '../../data/arcanaData';

const ArcanaSection = ({ arcanaValues, setArcanaValues, majorArcana, setMajorArcana }) => {
  const increase = (name) => {
    const key = name.toLowerCase();
    if ((arcanaValues[key] || 0) < 5) {
      setArcanaValues({ ...arcanaValues, [key]: (arcanaValues[key] || 0) + 1 });
    }
  };

  const decrease = (name) => {
    const key = name.toLowerCase();
    if ((arcanaValues[key] || 0) > 0) {
      setArcanaValues({ ...arcanaValues, [key]: arcanaValues[key] - 1 });
    }
  };

  const toggleMajor = (name) => {
    const key = name.toLowerCase();
    if (majorArcana.includes(key)) {
      setMajorArcana(majorArcana.filter((a) => a !== key));
    } else if (majorArcana.length < 3) {
      setMajorArcana([...majorArcana, key]);
    }
  };

  return (
    <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
      <h3 className="text-sm font-bold mb-2 flex items-center gap-2 text-purple-400">
        <i className="fas fa-magic" />
        Arcana
      </h3>
      <p className="text-[11px] text-slate-500 mb-3">
        Click an icon to mark as <span className="text-amber-300">Major</span> (max 3).
      </p>
      <div className="space-y-3">
        {ARCANA.map((arc) => {
          const key = arc.name.toLowerCase();
          const value = arcanaValues[key] || 0;
          const isMajor = majorArcana.includes(key);
          const textColor = arc.color.includes('text-white') ? '#ffffff' : '#000000';

          return (
            <div key={key} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => toggleMajor(arc.name)}
                className={`w-7 h-7 shrink-0 rounded-full flex items-center justify-center text-xs ${arc.color} shadow-sm transition-all ${
                  isMajor ? 'ring-2 ring-amber-400 ring-offset-1 ring-offset-slate-800 scale-110' : 'hover:scale-105'
                }`}
                title={isMajor ? 'Major Arcanum (click to remove)' : 'Set as Major Arcanum'}
              >
                <i className={`fas fa-${arc.faIcon}`} />
              </button>
              <span className="text-sm text-slate-300 w-16 truncate">
                {arc.name}
                {isMajor && <span className="text-amber-400 text-[10px] ml-1">M</span>}
              </span>
              <button
                type="button"
                onClick={() => increase(arc.name)}
                className="rounded-full w-6 h-6 flex items-center justify-center shadow-sm hover:opacity-80 transition-colors bg-slate-600 text-xs"
                disabled={value >= 5}
              >
                <i className="fas fa-plus text-[8px]" />
              </button>
              <div
                onClick={() => decrease(arc.name)}
                className={`${arc.color} rounded-full cursor-pointer shadow-sm ${isMajor ? 'border-2 border-yellow-400' : ''}`}
                style={{ width: '100px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 8px' }}
              >
                {Array.from({ length: 5 }, (_, i) => (
                  <span
                    key={i}
                    style={{
                      display: 'inline-block',
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      margin: '0 2px',
                      backgroundColor: i < value ? textColor : '#1e293b',
                      opacity: i < value ? 1 : 0.4,
                    }}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ArcanaSection;
