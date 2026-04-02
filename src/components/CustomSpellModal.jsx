import React, { useState, useEffect } from 'react';
import { ARCANA, TIER_MAPPING } from '../data/arcanaData';
import { processSpellData } from '../data/dataLoader';

const VALID_PATHS = ARCANA.map(a => a.name);
const VALID_TIERS = Object.keys(TIER_MAPPING);
const VALID_PRIMARY_FACTORS = ['Duration', 'Potency'];

const SPELL_TYPES = {
  IMPROVISED: 'improvised',
  ROTE: 'rote',
  PRAXIS: 'praxis'
};

const ALL_SKILLS = [
  { key: 'academics', label: 'Academics' },
  { key: 'computer', label: 'Computer' },
  { key: 'craft', label: 'Craft' },
  { key: 'investigation', label: 'Investigation' },
  { key: 'medicine', label: 'Medicine' },
  { key: 'occult', label: 'Occult' },
  { key: 'politics', label: 'Politics' },
  { key: 'science', label: 'Science' },
  { key: 'athletics', label: 'Athletics' },
  { key: 'brawl', label: 'Brawl' },
  { key: 'drive', label: 'Drive' },
  { key: 'firearms', label: 'Firearms' },
  { key: 'larceny', label: 'Larceny' },
  { key: 'stealth', label: 'Stealth' },
  { key: 'survival', label: 'Survival' },
  { key: 'weaponry', label: 'Weaponry' },
  { key: 'animalKen', label: 'Animal Ken' },
  { key: 'empathy', label: 'Empathy' },
  { key: 'expression', label: 'Expression' },
  { key: 'intimidation', label: 'Intimidation' },
  { key: 'persuasion', label: 'Persuasion' },
  { key: 'socialize', label: 'Socialize' },
  { key: 'streetwise', label: 'Streetwise' },
  { key: 'subterfuge', label: 'Subterfuge' },
];

const skillLabelToKey = (label) => {
  if (!label) return null;
  const lower = label.toLowerCase().trim();
  if (lower === 'crafts') return 'craft';
  const match = ALL_SKILLS.find((s) => s.label.toLowerCase() === lower || s.key === lower);
  return match ? match.key : null;
};

function validateSpellJson(raw) {
  const errors = [];

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    return { errors: [`Invalid JSON: ${e.message}`], spell: null };
  }

  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    return { errors: ['Spell must be a JSON object, not an array or primitive.'], spell: null };
  }

  const requiredStrings = ['name', 'path', 'tier', 'practice', 'primaryFactor', 'description', 'short_description'];
  for (const field of requiredStrings) {
    if (typeof parsed[field] !== 'string' || parsed[field].trim() === '') {
      errors.push(`"${field}" is required and must be a non-empty string.`);
    }
  }

  if (typeof parsed.path === 'string' && !VALID_PATHS.some(p => p.toLowerCase() === parsed.path.toLowerCase())) {
    errors.push(`"path" must be a valid Arcanum: ${VALID_PATHS.join(', ')}.`);
  }

  if (typeof parsed.tier === 'string' && !VALID_TIERS.includes(parsed.tier)) {
    errors.push(`"tier" must be one of: ${VALID_TIERS.join(', ')}.`);
  }

  if (typeof parsed.primaryFactor === 'string' && !VALID_PRIMARY_FACTORS.includes(parsed.primaryFactor)) {
    errors.push(`"primaryFactor" must be one of: ${VALID_PRIMARY_FACTORS.join(', ')}.`);
  }

  if (parsed.secondary !== undefined && parsed.secondary !== null && typeof parsed.secondary !== 'string') {
    errors.push(`"secondary" must be a string or null.`);
  }

  if (parsed.withstand !== undefined && parsed.withstand !== null && typeof parsed.withstand !== 'string') {
    errors.push(`"withstand" must be a string or null.`);
  }

  if (parsed.skills !== undefined) {
    if (!Array.isArray(parsed.skills)) {
      errors.push(`"skills" must be an array of strings.`);
    } else if (parsed.skills.some(s => typeof s !== 'string')) {
      errors.push(`Every entry in "skills" must be a string.`);
    }
  }

  if (parsed.reaches !== undefined) {
    if (!Array.isArray(parsed.reaches)) {
      errors.push(`"reaches" must be an array.`);
    } else {
      parsed.reaches.forEach((r, i) => {
        if (typeof r !== 'object' || r === null) {
          errors.push(`reaches[${i}] must be an object with "level" (number) and "effect" (string).`);
        } else {
          if (typeof r.level !== 'number') errors.push(`reaches[${i}].level must be a number.`);
          if (typeof r.effect !== 'string') errors.push(`reaches[${i}].effect must be a string.`);
        }
      });
    }
  }

  if (parsed.source !== undefined && typeof parsed.source !== 'string') {
    errors.push(`"source" must be a string.`);
  }

  if (parsed.mana !== undefined && typeof parsed.mana !== 'number') {
    errors.push(`"mana" must be a number.`);
  }

  return { errors, spell: errors.length === 0 ? parsed : null };
}

const EXAMPLE_SPELL = JSON.stringify({
  name: "Example Spell",
  path: "Death",
  tier: "Initiate",
  secondary: null,
  practice: "Compelling",
  primaryFactor: "Duration",
  withstand: null,
  skills: ["Occult"],
  description: "A custom spell description goes here.",
  reaches: [{ level: 1, effect: "An additional reach effect." }],
  source: "Homebrew",
  short_description: "Brief summary of the spell"
}, null, 2);

const CustomSpellModal = ({ onAddSpell, onClose, characterSkills }) => {
  const [jsonInput, setJsonInput] = useState('');
  const [validationErrors, setValidationErrors] = useState([]);
  const [parsedSpell, setParsedSpell] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [selectedRoteSkill, setSelectedRoteSkill] = useState(null);
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setAnimateIn(true));
  }, []);

  useEffect(() => {
    if (selectedType !== SPELL_TYPES.ROTE) {
      setSelectedRoteSkill(null);
      return;
    }
    if (!parsedSpell) return;
    const suggested = (parsedSpell.skills || []).map(skillLabelToKey).filter(Boolean);
    if (suggested.length > 0) setSelectedRoteSkill(suggested[0]);
    else setSelectedRoteSkill(ALL_SKILLS[0].key);
  }, [selectedType, parsedSpell]);

  const handleValidate = () => {
    if (!jsonInput.trim()) {
      setValidationErrors(['Please paste spell JSON data.']);
      setParsedSpell(null);
      return;
    }
    const { errors, spell } = validateSpellJson(jsonInput);
    setValidationErrors(errors);
    setParsedSpell(spell);
    if (spell) setSelectedType(null);
  };

  const handleAdd = () => {
    if (!parsedSpell || !selectedType) return;
    if (selectedType === SPELL_TYPES.ROTE && !selectedRoteSkill) return;

    const [processed] = processSpellData([parsedSpell]);
    const spellToAdd = { ...processed, castingType: selectedType };
    if (selectedType === SPELL_TYPES.ROTE && selectedRoteSkill) {
      spellToAdd.roteSkill = selectedRoteSkill;
    }
    onAddSpell(spellToAdd);
  };

  const handleLoadExample = () => {
    setJsonInput(EXAMPLE_SPELL);
    setValidationErrors([]);
    setParsedSpell(null);
    setSelectedType(null);
  };

  const isRoteReady = selectedType !== SPELL_TYPES.ROTE || selectedRoteSkill;
  const canAdd = parsedSpell && selectedType && isRoteReady;
  const suggestedKeys = parsedSpell ? (parsedSpell.skills || []).map(skillLabelToKey).filter(Boolean) : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className={`absolute inset-0 bg-black transition-opacity duration-300 ${animateIn ? 'opacity-60' : 'opacity-0'}`}
        onClick={onClose}
      />
      <div className={`relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-slate-800 rounded-xl shadow-2xl border border-slate-700 transition-all duration-300 ${animateIn ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
        {/* Header */}
        <div className="p-4 border-b border-slate-700 flex justify-between items-center shrink-0">
          <h2 className="text-xl font-bold flex items-center">
            <i className="fas fa-file-code mr-3 text-amber-400"></i> Insert Custom Spell
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-700 transition-all"
            aria-label="Close"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar space-y-4">
          <p className="text-sm text-slate-400">
            Paste spell JSON data below. The spell must match the standard format used in the spell database.
          </p>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleLoadExample}
              className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              <i className="fas fa-clipboard-list mr-1"></i> Load example
            </button>
          </div>

          <textarea
            value={jsonInput}
            onChange={(e) => {
              setJsonInput(e.target.value);
              setValidationErrors([]);
              setParsedSpell(null);
              setSelectedType(null);
            }}
            placeholder={`{\n  "name": "...",\n  "path": "Death",\n  "tier": "Initiate",\n  ...\n}`}
            rows={12}
            className="w-full bg-slate-900 text-slate-200 border border-slate-600 rounded-lg px-4 py-3 text-sm font-mono focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40 focus:outline-none transition-all resize-y"
            spellCheck={false}
          />

          <button
            type="button"
            onClick={handleValidate}
            className="w-full py-2.5 rounded-lg font-medium bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md"
          >
            <i className="fas fa-check-circle mr-2"></i> Validate
          </button>

          {/* Validation errors */}
          {validationErrors.length > 0 && (
            <div className="bg-red-900/30 border border-red-800 rounded-lg p-3 space-y-1 animate-fadeIn">
              <h4 className="text-sm font-bold text-red-300 flex items-center">
                <i className="fas fa-exclamation-triangle mr-2"></i> Validation Errors
              </h4>
              <ul className="list-disc list-inside text-sm text-red-200 space-y-0.5">
                {validationErrors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Spell preview + casting type */}
          {parsedSpell && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-green-900/20 border border-green-800 rounded-lg p-3">
                <h4 className="text-sm font-bold text-green-300 flex items-center mb-2">
                  <i className="fas fa-check mr-2"></i> Valid Spell
                </h4>
                <div className="text-sm text-slate-300 space-y-1">
                  <div><span className="text-slate-500">Name:</span> {parsedSpell.name}</div>
                  <div><span className="text-slate-500">Arcanum:</span> {parsedSpell.path} ({parsedSpell.tier})</div>
                  <div><span className="text-slate-500">Practice:</span> {parsedSpell.practice}</div>
                  <div><span className="text-slate-500">Primary Factor:</span> {parsedSpell.primaryFactor}</div>
                  {parsedSpell.withstand && <div><span className="text-slate-500">Withstand:</span> {parsedSpell.withstand}</div>}
                  <div className="text-xs text-slate-400 mt-1 line-clamp-2">{parsedSpell.short_description}</div>
                </div>
              </div>

              <div>
                <h3 className="font-bold mb-3 flex items-center text-sm">
                  <i className="fas fa-hat-wizard mr-2 text-purple-400"></i>
                  How will you cast {parsedSpell.name}?
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {Object.values(SPELL_TYPES).map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setSelectedType(type)}
                      className={`p-2 rounded-lg border border-slate-600 transition-all duration-300 hover:-translate-y-0.5 ${
                        selectedType === type
                          ? 'border-indigo-500 bg-slate-700/70 scale-105 shadow-lg'
                          : 'hover:border-slate-500 shadow-md hover:shadow-lg'
                      }`}
                    >
                      <div className="text-center mb-1 text-xl">
                        {type === SPELL_TYPES.ROTE && <i className="fas fa-book text-blue-400"></i>}
                        {type === SPELL_TYPES.PRAXIS && <i className="fas fa-bolt text-yellow-200"></i>}
                        {type === SPELL_TYPES.IMPROVISED && <i className="fas fa-hat-wizard text-indigo-400"></i>}
                      </div>
                      <div className={`text-xs capitalize font-medium text-center ${selectedType === type ? 'text-indigo-400' : ''}`}>
                        {type}
                      </div>
                    </button>
                  ))}
                </div>

                {selectedType === SPELL_TYPES.ROTE && (
                  <div className="mt-4 bg-slate-800/60 rounded-lg p-3 border border-slate-700 animate-fadeIn">
                    {suggestedKeys.length > 0 && (
                      <p className="text-[11px] text-slate-400 mb-2">
                        <i className="fas fa-info-circle mr-1 text-indigo-400" />
                        Suggested rote skills: {parsedSpell.skills.map((s, i) => (
                          <span key={i} className="text-indigo-300 font-medium">{s}{i < parsedSpell.skills.length - 1 ? ', ' : ''}</span>
                        ))}
                      </p>
                    )}
                    <label className="flex items-center gap-2 text-xs text-slate-300">
                      <span className="whitespace-nowrap font-medium">Rote Skill:</span>
                      <select
                        value={selectedRoteSkill || ''}
                        onChange={(e) => setSelectedRoteSkill(e.target.value)}
                        className="flex-1 bg-slate-700 text-white text-xs border border-slate-600 rounded-lg px-2 py-1.5 focus:outline-none focus:border-indigo-500"
                      >
                        {suggestedKeys.length > 0 && (
                          <optgroup label="Suggested">
                            {ALL_SKILLS.filter((s) => suggestedKeys.includes(s.key)).map((s) => (
                              <option key={s.key} value={s.key}>{s.label} ({characterSkills?.[s.key] || 0})</option>
                            ))}
                          </optgroup>
                        )}
                        <optgroup label="All Skills">
                          {ALL_SKILLS.map((s) => (
                            <option key={s.key} value={s.key}>{s.label} ({characterSkills?.[s.key] || 0})</option>
                          ))}
                        </optgroup>
                      </select>
                    </label>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700 flex justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-lg font-medium bg-slate-700 hover:bg-slate-600 transition-all shadow-md"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleAdd}
            disabled={!canAdd}
            className={`px-4 py-2.5 rounded-lg font-medium flex items-center text-white transition-all shadow-md ${
              canAdd
                ? 'bg-indigo-600 hover:bg-indigo-500 cursor-pointer hover:-translate-y-0.5 hover:shadow-lg'
                : 'bg-slate-600 cursor-not-allowed opacity-70'
            }`}
          >
            <i className="fas fa-plus mr-2"></i> Add Custom Spell
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomSpellModal;
