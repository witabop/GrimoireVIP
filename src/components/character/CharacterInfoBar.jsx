import React, { useState } from 'react';
import { createPortal } from 'react-dom';

const PATHS = ['Acanthus', 'Mastigos', 'Moros', 'Thyrsus', 'Obrimos'];
const ORDERS = [
  'Adamantine Arrow', 'Guardians of the Veil', 'Mysterium', 'Silver Ladder',
  'Free Council', 'Seers of the Throne (Approval Required)',
  'Hegemony (Approval Required)', 'Panopticon (Approval Required)',
  'Paternoster (Approval Required)', 'Praetorian (Approval Required)',
  'Apostate (Approval Required)', 'Nameless (Approval Required)',
];
const VIRTUES = [
  'Ambitious', 'Courageous', 'Generous', 'Honest', 'Hopeful',
  'Just', 'Loving', 'Loyal', 'Patient', 'Trustworthy',
];
const VICES = [
  'Ambitious', 'Addictive', 'Corrupt', 'Cruel', 'Deceitful',
  'Dogmatic', 'Greedy', 'Hasty', 'Hateful', 'Pessimistic',
];

const CharacterInfoBar = ({ char, updateChar }) => {
  const [open, setOpen] = useState(false);

  const displayName = char.shadowName || 'Unnamed Mage';
  const ae = char.arcaneExperiences + Math.floor(char.arcaneBeats / 5);
  const e = char.experiences + Math.floor(char.beats / 5);

  return (
    <>
      <div
        className="bg-slate-800 rounded-lg p-3 cursor-pointer hover:bg-slate-700/80 transition-colors border border-slate-700 shadow-md min-w-[220px] relative"
        onClick={() => setOpen(true)}
      >
        <span className="text-slate-500 pointer-events-none absolute top-0.5 right-2.5" aria-hidden>
          <i className="fas fa-pen text-xs" />
        </span>
        <div className="flex items-baseline gap-2 text-sm">
          <span className="font-bold text-white truncate max-w-[140px]">{displayName}</span>
          <span className="text-slate-400 text-xs whitespace-nowrap">AE: {ae}, E: {e}</span>
        </div>
        <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5 border-t border-slate-700/70 pt-1">
          <span>{char.path || 'No Path'}</span>
          <span className="text-slate-600">·</span>
          <span>Gnosis {char.gnosis}</span>
        </div>
      </div>

      {open && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-12 bg-black/60" onClick={() => setOpen(false)}>
          <div
            className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto p-6 animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <i className="fas fa-user-circle text-indigo-400" />
                Character Identity
              </h2>
              <button type="button" onClick={() => setOpen(false)} className="text-slate-400 hover:text-white p-1.5 rounded-md hover:bg-slate-700 transition-colors">
                <i className="fas fa-times" />
              </button>
            </div>

            <div className="space-y-4">
              <Field label="Shadow Name" value={char.shadowName} onChange={(v) => updateChar({ shadowName: v })} />
              <Field label="Player" value={char.playerName} onChange={(v) => updateChar({ playerName: v })} />

              <div className="grid grid-cols-2 gap-4">
                <NumberField label="Gnosis" value={char.gnosis} min={1} max={10} onChange={(v) => updateChar({ gnosis: v })} />
                <SelectField label="Path" value={char.path} options={PATHS} onChange={(v) => updateChar({ path: v })} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <NumberField label="Arcane Experiences" value={char.arcaneExperiences} min={0} max={999} onChange={(v) => updateChar({ arcaneExperiences: v })} />
                <NumberField label="Arcane Beats" value={char.arcaneBeats} min={0} max={4} onChange={(v) => updateChar({ arcaneBeats: v })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <NumberField label="Experiences" value={char.experiences} min={0} max={999} onChange={(v) => updateChar({ experiences: v })} />
                <NumberField label="Beats" value={char.beats} min={0} max={4} onChange={(v) => updateChar({ beats: v })} />
              </div>

              <Field label="Chronicle" value={char.chronicle} onChange={(v) => updateChar({ chronicle: v })} />

              <div className="grid grid-cols-2 gap-4">
                <SelectField label="Virtue" value={char.virtue} options={VIRTUES} onChange={(v) => updateChar({ virtue: v })} />
                <SelectField label="Vice" value={char.vice} options={VICES} onChange={(v) => updateChar({ vice: v })} />
              </div>

              <Field label="Concept" value={char.concept} onChange={(v) => updateChar({ concept: v })} />
              <SelectField label="Order" value={char.order} options={ORDERS} onChange={(v) => updateChar({ order: v })} />
              <Field label="Legacy" value={char.legacy} onChange={(v) => updateChar({ legacy: v })} />
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

const Field = ({ label, value, onChange }) => (
  <div>
    <label className="block text-xs text-slate-400 mb-1">{label}</label>
    <input
      type="text"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-slate-700 text-white border border-slate-600 rounded-lg px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40 focus:outline-none"
    />
  </div>
);

const NumberField = ({ label, value, min, max, onChange }) => (
  <div>
    <label className="block text-xs text-slate-400 mb-1">{label}</label>
    <input
      type="number"
      value={value ?? 0}
      min={min}
      max={max}
      onChange={(e) => {
        const n = parseInt(e.target.value, 10);
        if (!isNaN(n)) onChange(Math.max(min, Math.min(max, n)));
      }}
      className="w-full bg-slate-700 text-white border border-slate-600 rounded-lg px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40 focus:outline-none"
    />
  </div>
);

const SelectField = ({ label, value, options, onChange }) => (
  <div>
    <label className="block text-xs text-slate-400 mb-1">{label}</label>
    <select
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-slate-700 text-white border border-slate-600 rounded-lg px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40 focus:outline-none"
    >
      <option value="">— Select —</option>
      {options.map((o) => (
        <option key={o} value={o}>{o}</option>
      ))}
    </select>
  </div>
);

export default CharacterInfoBar;
