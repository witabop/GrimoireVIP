import React, { useState } from 'react';

const SUBTABS = ['Mundane', 'Combat', 'Enchanted', 'Yantras'];

const ItemsTab = ({ mundaneItems, combatItems, enchantedItems, yantraItems, onChangeMundane, onChangeCombat, onChangeEnchanted, onChangeYantras }) => {
  const [subtab, setSubtab] = useState('Mundane');

  return (
    <div>
      <div className="flex gap-1 mb-3">
        {SUBTABS.map((t) => (
          <button
            type="button"
            key={t}
            onClick={() => setSubtab(t)}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              subtab === t ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
            }`}
          >
            {t}
          </button>
        ))}
      </div>
      {subtab === 'Mundane' && <SimpleList items={mundaneItems} onChange={onChangeMundane} placeholder="Item name…" label="Item" />}
      {subtab === 'Combat' && <CombatList items={combatItems} onChange={onChangeCombat} />}
      {subtab === 'Enchanted' && <EnchantedList items={enchantedItems} onChange={onChangeEnchanted} />}
      {subtab === 'Yantras' && <SimpleList items={yantraItems} onChange={onChangeYantras} placeholder="Yantra name…" label="Yantra" />}
    </div>
  );
};

/** Normalize legacy string items to { name, description } objects. */
const normalize = (item) =>
  typeof item === 'string' ? { name: item, description: '' } : { name: item.name || '', description: item.description || '' };

const EditableName = ({ value, onChange }) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  const commit = () => {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== value) onChange(trimmed);
    else setDraft(value);
    setEditing(false);
  };

  if (editing) {
    return (
      <input
        type="text"
        autoFocus
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') { setDraft(value); setEditing(false); } }}
        className="flex-1 bg-slate-700 text-white text-sm border border-indigo-500 rounded px-2 py-0.5 focus:outline-none min-w-0"
      />
    );
  }
  return (
    <span
      onClick={() => { setDraft(value); setEditing(true); }}
      className="text-sm text-slate-200 font-medium flex-1 truncate cursor-pointer hover:text-white transition-colors"
      title="Click to edit name"
    >
      {value}
    </span>
  );
};

const DescriptionField = ({ value, onChange }) => (
  <textarea
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder="Description / notes…"
    rows={2}
    className="w-full bg-slate-800/60 text-slate-300 text-xs border border-slate-600/50 rounded-lg px-3 py-2 mt-2 focus:outline-none focus:border-indigo-500 placeholder-slate-600 resize-y leading-relaxed"
  />
);

const SimpleList = ({ items, onChange, placeholder, label }) => {
  const [draft, setDraft] = useState('');
  const [adding, setAdding] = useState(false);

  const normalized = items.map(normalize);

  const persist = (next) => onChange(next);

  const add = () => {
    const trimmed = draft.trim();
    if (trimmed) { persist([...normalized, { name: trimmed, description: '' }]); setDraft(''); }
  };

  const remove = (idx) => persist(normalized.filter((_, i) => i !== idx));

  const updateItem = (idx, patch) => {
    const updated = [...normalized];
    updated[idx] = { ...updated[idx], ...patch };
    persist(updated);
  };

  return (
    <div className="space-y-1.5">
      {normalized.length === 0 && !adding && <p className="text-xs text-slate-500 italic">No items.</p>}
      {normalized.map((item, i) => (
        <div key={i} className="bg-slate-700/60 rounded-lg px-3 py-2 group">
          <div className="flex items-center gap-2">
            <EditableName value={item.name} onChange={(name) => updateItem(i, { name })} />
            <button type="button" onClick={() => remove(i)} className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 text-xs transition-opacity"><i className="fas fa-trash-alt" /></button>
          </div>
          <DescriptionField value={item.description} onChange={(description) => updateItem(i, { description })} />
        </div>
      ))}
      {adding ? (
        <div className="flex gap-2">
          <input type="text" autoFocus value={draft} onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') add(); if (e.key === 'Escape') { setAdding(false); setDraft(''); } }}
            placeholder={placeholder} className="flex-1 bg-slate-700 text-white border border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500" />
          <button type="button" onClick={add} className="text-green-400 hover:text-green-300 text-sm px-2"><i className="fas fa-check" /></button>
          <button type="button" onClick={() => { setAdding(false); setDraft(''); }} className="text-slate-400 hover:text-white text-sm px-2"><i className="fas fa-times" /></button>
        </div>
      ) : (
        <button type="button" onClick={() => setAdding(true)} className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 mt-1">
          <i className="fas fa-plus" /> Add {label}
        </button>
      )}
    </div>
  );
};

const COMBAT_FIELDS = [
  { key: 'dmg', label: 'Dmg' },
  { key: 'range', label: 'Range' },
  { key: 'clip', label: 'Clip' },
  { key: 'init', label: 'Init' },
  { key: 'str', label: 'Str' },
  { key: 'size', label: 'Size' },
];

const CombatList = ({ items, onChange }) => {
  const [draft, setDraft] = useState('');
  const [adding, setAdding] = useState(false);

  const add = () => {
    const trimmed = draft.trim();
    if (trimmed) {
      onChange([...items, { name: trimmed, dmg: 0, range: 0, clip: 0, init: 0, str: 0, size: 0, description: '' }]);
      setDraft('');
    }
  };

  const remove = (idx) => onChange(items.filter((_, i) => i !== idx));

  const updateField = (idx, field, val) => {
    const updated = [...items];
    if (field === 'name' || field === 'description') {
      updated[idx] = { ...updated[idx], [field]: val };
    } else {
      const n = parseInt(val, 10);
      updated[idx] = { ...updated[idx], [field]: isNaN(n) ? 0 : n };
    }
    onChange(updated);
  };

  return (
    <div className="space-y-2">
      {items.length === 0 && !adding && <p className="text-xs text-slate-500 italic">No combat items.</p>}
      {items.map((item, i) => (
        <div key={i} className="bg-slate-700/60 rounded-lg px-3 py-2 group">
          <div className="flex items-center gap-2 mb-2">
            <EditableName value={item.name} onChange={(name) => updateField(i, 'name', name)} />
            <button type="button" onClick={() => remove(i)} className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 text-xs transition-opacity"><i className="fas fa-trash-alt" /></button>
          </div>
          <div className="grid grid-cols-6 gap-2">
            {COMBAT_FIELDS.map((f) => (
              <div key={f.key}>
                <label className="text-[10px] text-slate-500 block mb-0.5">{f.label}</label>
                <input type="number" value={item[f.key] ?? 0} onChange={(e) => updateField(i, f.key, e.target.value)}
                  className="w-full bg-slate-700 text-white text-center text-xs border border-slate-600 rounded py-1 focus:outline-none focus:border-indigo-500" />
              </div>
            ))}
          </div>
          <DescriptionField value={item.description || ''} onChange={(description) => updateField(i, 'description', description)} />
        </div>
      ))}
      {adding ? (
        <div className="flex gap-2">
          <input type="text" autoFocus value={draft} onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') add(); if (e.key === 'Escape') { setAdding(false); setDraft(''); } }}
            placeholder="Weapon name…" className="flex-1 bg-slate-700 text-white border border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500" />
          <button type="button" onClick={add} className="text-green-400 hover:text-green-300 text-sm px-2"><i className="fas fa-check" /></button>
          <button type="button" onClick={() => { setAdding(false); setDraft(''); }} className="text-slate-400 hover:text-white text-sm px-2"><i className="fas fa-times" /></button>
        </div>
      ) : (
        <button type="button" onClick={() => setAdding(true)} className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 mt-1">
          <i className="fas fa-plus" /> Add Weapon
        </button>
      )}
    </div>
  );
};

const EnchantedList = ({ items, onChange }) => {
  const [draft, setDraft] = useState('');
  const [adding, setAdding] = useState(false);

  const add = () => {
    const trimmed = draft.trim();
    if (trimmed) {
      onChange([...items, { name: trimmed, power: '', dicePool: 0, mana: 0, description: '' }]);
      setDraft('');
    }
  };

  const remove = (idx) => onChange(items.filter((_, i) => i !== idx));

  const updateField = (idx, field, val) => {
    const updated = [...items];
    if (field === 'power' || field === 'name' || field === 'description') {
      updated[idx] = { ...updated[idx], [field]: val };
    } else {
      const n = parseInt(val, 10);
      updated[idx] = { ...updated[idx], [field]: isNaN(n) ? 0 : n };
    }
    onChange(updated);
  };

  return (
    <div className="space-y-2">
      {items.length === 0 && !adding && <p className="text-xs text-slate-500 italic">No enchanted items.</p>}
      {items.map((item, i) => (
        <div key={i} className="bg-slate-700/60 rounded-lg px-3 py-2 group">
          <div className="flex items-center gap-2 mb-2">
            <EditableName value={item.name} onChange={(name) => updateField(i, 'name', name)} />
            <button type="button" onClick={() => remove(i)} className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 text-xs transition-opacity"><i className="fas fa-trash-alt" /></button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-[10px] text-slate-500 block mb-0.5">Power</label>
              <input type="text" value={item.power || ''} onChange={(e) => updateField(i, 'power', e.target.value)}
                className="w-full bg-slate-700 text-white text-xs border border-slate-600 rounded px-2 py-1 focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="text-[10px] text-slate-500 block mb-0.5">Dice Pool</label>
              <input type="number" value={item.dicePool ?? 0} onChange={(e) => updateField(i, 'dicePool', e.target.value)}
                className="w-full bg-slate-700 text-white text-center text-xs border border-slate-600 rounded py-1 focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="text-[10px] text-slate-500 block mb-0.5">Mana</label>
              <input type="number" value={item.mana ?? 0} onChange={(e) => updateField(i, 'mana', e.target.value)}
                className="w-full bg-slate-700 text-white text-center text-xs border border-slate-600 rounded py-1 focus:outline-none focus:border-indigo-500" />
            </div>
          </div>
          <DescriptionField value={item.description || ''} onChange={(description) => updateField(i, 'description', description)} />
        </div>
      ))}
      {adding ? (
        <div className="flex gap-2">
          <input type="text" autoFocus value={draft} onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') add(); if (e.key === 'Escape') { setAdding(false); setDraft(''); } }}
            placeholder="Enchanted item name…" className="flex-1 bg-slate-700 text-white border border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500" />
          <button type="button" onClick={add} className="text-green-400 hover:text-green-300 text-sm px-2"><i className="fas fa-check" /></button>
          <button type="button" onClick={() => { setAdding(false); setDraft(''); }} className="text-slate-400 hover:text-white text-sm px-2"><i className="fas fa-times" /></button>
        </div>
      ) : (
        <button type="button" onClick={() => setAdding(true)} className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 mt-1">
          <i className="fas fa-plus" /> Add Enchanted Item
        </button>
      )}
    </div>
  );
};

export default ItemsTab;
