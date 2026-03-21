import React from 'react';

const WisdomTrack = ({ wisdom, onChange }) => {
  const increase = () => {
    if (wisdom < 10) onChange(wisdom + 1);
  };

  const decrease = () => {
    if (wisdom > 0) onChange(wisdom - 1);
  };

  return (
    <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
      <h3 className="text-sm font-bold mb-3 flex items-center gap-2 text-amber-400">
        <i className="fas fa-eye" />
        Wisdom
      </h3>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={increase}
          disabled={wisdom >= 10}
          className="rounded-full w-7 h-7 flex items-center justify-center shadow-sm hover:opacity-80 transition-colors bg-slate-600 text-xs shrink-0"
        >
          <i className="fas fa-plus text-[9px]" />
        </button>
        <div
          onClick={decrease}
          className="bg-slate-700 rounded-full cursor-pointer shadow-sm"
          style={{ height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 10px' }}
        >
          {Array.from({ length: 10 }, (_, i) => (
            <span
              key={i}
              style={{
                display: 'inline-block',
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                margin: '0 2px',
                backgroundColor: i < wisdom ? '#fbbf24' : '#4b5563',
                opacity: i < wisdom ? 1 : 0.4,
              }}
            />
          ))}
        </div>
        <span className="text-xs text-slate-500 ml-1 shrink-0">{wisdom}/10</span>
      </div>
    </div>
  );
};

export default WisdomTrack;
