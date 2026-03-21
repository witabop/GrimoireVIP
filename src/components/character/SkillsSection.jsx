import React from 'react';

const MENTAL_SKILLS = [
  { key: 'academics', label: 'Academics' },
  { key: 'computer', label: 'Computer' },
  { key: 'craft', label: 'Craft' },
  { key: 'investigation', label: 'Investigation' },
  { key: 'medicine', label: 'Medicine' },
  { key: 'occult', label: 'Occult' },
  { key: 'politics', label: 'Politics' },
  { key: 'science', label: 'Science' },
];

const PHYSICAL_SKILLS = [
  { key: 'athletics', label: 'Athletics' },
  { key: 'brawl', label: 'Brawl' },
  { key: 'drive', label: 'Drive' },
  { key: 'firearms', label: 'Firearms' },
  { key: 'larceny', label: 'Larceny' },
  { key: 'stealth', label: 'Stealth' },
  { key: 'survival', label: 'Survival' },
  { key: 'weaponry', label: 'Weaponry' },
];

const SOCIAL_SKILLS = [
  { key: 'animalKen', label: 'Animal Ken' },
  { key: 'empathy', label: 'Empathy' },
  { key: 'expression', label: 'Expression' },
  { key: 'intimidation', label: 'Intimidation' },
  { key: 'persuasion', label: 'Persuasion' },
  { key: 'socialize', label: 'Socialize' },
  { key: 'streetwise', label: 'Streetwise' },
  { key: 'subterfuge', label: 'Subterfuge' },
];

const SkillsSection = ({ skills, roteSkills, skillSpecialties, onSkillChange, onToggleRote, onSpecialtyChange }) => {
  const set = (key, raw) => {
    const n = parseInt(raw, 10);
    if (!isNaN(n)) onSkillChange(key, Math.max(0, Math.min(10, n)));
  };

  return (
    <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
      <h3 className="text-sm font-bold mb-3 flex items-center gap-2 text-green-400">
        <i className="fas fa-tools" />
        Skills
      </h3>
      <div className="space-y-4">
        <SkillGroup title="Mental" icon="fa-brain" color="text-blue-400" skills={MENTAL_SKILLS} values={skills} roteSkills={roteSkills} specialties={skillSpecialties} onChange={set} onToggleRote={onToggleRote} onSpecialtyChange={onSpecialtyChange} />
        <SkillGroup title="Physical" icon="fa-fist-raised" color="text-red-400" skills={PHYSICAL_SKILLS} values={skills} roteSkills={roteSkills} specialties={skillSpecialties} onChange={set} onToggleRote={onToggleRote} onSpecialtyChange={onSpecialtyChange} />
        <SkillGroup title="Social" icon="fa-comments" color="text-green-400" skills={SOCIAL_SKILLS} values={skills} roteSkills={roteSkills} specialties={skillSpecialties} onChange={set} onToggleRote={onToggleRote} onSpecialtyChange={onSpecialtyChange} />
      </div>
    </div>
  );
};

const SkillGroup = ({ title, icon, color, skills: skillList, values, roteSkills, specialties, onChange, onToggleRote, onSpecialtyChange }) => (
  <div>
    <h4 className={`text-xs font-bold uppercase tracking-wider mb-2 ${color} flex items-center gap-1.5`}>
      <i className={`fas ${icon} text-[10px]`} />
      {title}
    </h4>
    <div className="space-y-1.5">
      {skillList.map(({ key, label }) => {
        const isRote = roteSkills.includes(key);
        return (
          <div key={key} className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onToggleRote(key)}
              className={`w-4 h-4 shrink-0 rounded-sm border flex items-center justify-center text-[8px] transition-colors ${
                isRote
                  ? 'bg-indigo-600 border-indigo-500 text-white'
                  : 'border-slate-600 text-transparent hover:border-slate-500 hover:text-slate-600'
              }`}
              title={isRote ? 'Rote skill (click to remove)' : 'Mark as rote skill'}
            >
              <i className="fas fa-book" />
            </button>
            <span className="text-sm text-slate-300 w-20 shrink-0 truncate">{label}</span>
            <input
              type="text"
              value={specialties[key] || ''}
              onChange={(e) => onSpecialtyChange(key, e.target.value)}
              placeholder="Specialty"
              className="flex-1 min-w-0 bg-slate-700/50 text-slate-300 text-[11px] border border-slate-600/50 rounded px-1.5 py-1 focus:border-indigo-500 focus:outline-none placeholder:text-slate-600"
            />
            <input
              type="number"
              min={0}
              max={10}
              value={values[key] || 0}
              onChange={(e) => onChange(key, e.target.value)}
              className="w-12 shrink-0 bg-slate-700 text-white text-center text-xs border border-slate-600 rounded-lg py-1 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40 focus:outline-none"
            />
          </div>
        );
      })}
    </div>
  </div>
);

export default SkillsSection;
