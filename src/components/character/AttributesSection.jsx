import React from 'react';

const MENTAL = [
  { key: 'intelligence', label: 'Intelligence' },
  { key: 'wits', label: 'Wits' },
  { key: 'resolve', label: 'Resolve' },
];
const PHYSICAL = [
  { key: 'strength', label: 'Strength' },
  { key: 'dexterity', label: 'Dexterity' },
  { key: 'stamina', label: 'Stamina' },
];
const SOCIAL = [
  { key: 'presence', label: 'Presence' },
  { key: 'manipulation', label: 'Manipulation' },
  { key: 'composure', label: 'Composure' },
];

const AttributesSection = ({ attributes, onChange }) => {
  const set = (key, raw) => {
    const n = parseInt(raw, 10);
    if (!isNaN(n)) onChange({ ...attributes, [key]: Math.max(1, Math.min(10, n)) });
  };

  return (
    <div className="grid grid-cols-3 gap-4">
      <AttrGroup title="Mental" icon="fa-brain" color="text-blue-400" attrs={MENTAL} values={attributes} onChange={set} />
      <AttrGroup title="Physical" icon="fa-fist-raised" color="text-red-400" attrs={PHYSICAL} values={attributes} onChange={set} />
      <AttrGroup title="Social" icon="fa-comments" color="text-green-400" attrs={SOCIAL} values={attributes} onChange={set} />
    </div>
  );
};

const AttrGroup = ({ title, icon, color, attrs, values, onChange }) => (
  <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
    <h3 className={`text-sm font-bold mb-3 flex items-center gap-2 ${color}`}>
      <i className={`fas ${icon}`} />
      {title}
    </h3>
    <div className="space-y-2.5">
      {attrs.map(({ key, label }) => (
        <div key={key} className="flex items-center justify-between">
          <span className="text-sm text-slate-300">{label}</span>
          <input
            type="number"
            min={1}
            max={10}
            value={values[key] || 1}
            onChange={(e) => onChange(key, e.target.value)}
            className="w-14 bg-slate-700 text-white text-center text-sm border border-slate-600 rounded-lg py-1 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40 focus:outline-none"
          />
        </div>
      ))}
    </div>
  </div>
);

export default AttributesSection;
