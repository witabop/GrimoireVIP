import React from 'react';

const ATTR_LIST = [
  { key: 'intelligence', label: 'Intelligence' },
  { key: 'wits', label: 'Wits' },
  { key: 'resolve', label: 'Resolve' },
  { key: 'strength', label: 'Strength' },
  { key: 'dexterity', label: 'Dexterity' },
  { key: 'stamina', label: 'Stamina' },
  { key: 'presence', label: 'Presence' },
  { key: 'manipulation', label: 'Manipulation' },
  { key: 'composure', label: 'Composure' },
];

const NimbusTab = ({ nimbus, onChange }) => {
  const update = (key, val) => onChange({ ...nimbus, [key]: val });
  const stats = nimbus.effectedStats || {};

  const updateStat = (key, raw) => {
    const n = parseInt(raw, 10);
    if (!isNaN(n)) {
      onChange({
        ...nimbus,
        effectedStats: { ...stats, [key]: Math.max(-10, Math.min(10, n)) },
      });
    }
  };

  return (
    <div className="space-y-4">
      <TextField label="Long-Term" value={nimbus.longTerm} onChange={(v) => update('longTerm', v)} />
      <TextField label="Immediate" value={nimbus.immediate} onChange={(v) => update('immediate', v)} />
      <TextField label="Signature" value={nimbus.signature} onChange={(v) => update('signature', v)} />
      <TextField label="Peripheral Mage Sight" value={nimbus.peripheralMageSight} onChange={(v) => update('peripheralMageSight', v)} />

      <div>
        <p className="text-xs font-bold text-slate-300 uppercase tracking-wide mb-2">Effected Stats</p>
        <div className="grid grid-cols-3 gap-x-4 gap-y-1.5">
          {ATTR_LIST.map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-xs text-slate-400">{label}</span>
              <input
                type="number"
                min={0}
                max={10}
                value={stats[key] ?? 0}
                onChange={(e) => updateStat(key, e.target.value)}
                className="w-12 bg-slate-700 text-white text-center text-xs border border-slate-600 rounded py-1 focus:outline-none focus:border-indigo-500"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const TextField = ({ label, value, onChange }) => (
  <div>
    <label className="block text-xs text-slate-400 mb-1">{label}</label>
    <textarea
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      rows={2}
      className="w-full bg-slate-700 text-white text-sm border border-slate-600 rounded-lg px-3 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40 focus:outline-none resize-none"
    />
  </div>
);

export default NimbusTab;
