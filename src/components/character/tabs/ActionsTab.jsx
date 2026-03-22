import React, { useState, useMemo, useCallback } from 'react';
import { rollDice, countSuccesses } from '../../../utils/spellCalculations';
import { normalizeActionsTabOrder, ACTION_TAB_SEARCH } from '../../../utils/actionsTabOrder';

const SPECIFIED_TARGETS = [
  { label: 'None', penalty: 0 },
  { label: 'Arm (–2)', penalty: 2, effect: 'Arm Wrack if dmg > Stamina' },
  { label: 'Leg (–2)', penalty: 2, effect: 'Leg Wrack if dmg > Stamina' },
  { label: 'Head (–3)', penalty: 3, effect: 'Stun if dmg ≥ Size' },
  { label: 'Hand (–4)', penalty: 4, effect: 'Arm Wrack on any hit' },
];

const ARCANA_NAMES = ['Death', 'Fate', 'Forces', 'Life', 'Matter', 'Mind', 'Prime', 'Space', 'Spirit', 'Time'];

const ActionTypeBadge = ({ type }) => {
  const colors = {
    instant: 'bg-blue-600/30 text-blue-300 border-blue-500/40',
    reflexive: 'bg-green-600/30 text-green-300 border-green-500/40',
    'pre-turn': 'bg-amber-600/30 text-amber-300 border-amber-500/40',
    extended: 'bg-purple-600/30 text-purple-300 border-purple-500/40',
    free: 'bg-slate-600/30 text-slate-300 border-slate-500/40',
    conditional: 'bg-cyan-600/30 text-cyan-300 border-cyan-500/40',
  };
  return (
    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${colors[type] || colors.instant}`}>
      {type}
    </span>
  );
};

function DraggableActionRow({
  actionId,
  children,
  onMoveBefore,
  draggingId,
  setDraggingId,
  hoverTargetId,
  setHoverTargetId,
}) {
  const isDragging = draggingId === actionId;
  const isHoverTarget = Boolean(draggingId && draggingId !== actionId && hoverTargetId === actionId);

  return (
    <div
      className={`flex gap-1.5 items-stretch rounded-lg transition-[opacity,box-shadow] ${isDragging ? 'opacity-45' : ''} ${isHoverTarget ? 'ring-2 ring-indigo-400/70 rounded-lg' : ''}`}
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        if (draggingId && draggingId !== actionId) setHoverTargetId(actionId);
      }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) {
          setHoverTargetId((prev) => (prev === actionId ? null : prev));
        }
      }}
      onDrop={(e) => {
        e.preventDefault();
        setHoverTargetId(null);
        const src = e.dataTransfer.getData('text/plain');
        if (src) onMoveBefore(src, actionId);
      }}
    >
      <div
        draggable
        onDragStart={(e) => {
          e.dataTransfer.setData('text/plain', actionId);
          e.dataTransfer.effectAllowed = 'move';
          setDraggingId(actionId);
        }}
        onDragEnd={() => {
          setDraggingId(null);
          setHoverTargetId(null);
        }}
        className="flex items-center justify-center w-7 shrink-0 rounded-md bg-slate-800/90 text-slate-500 hover:text-indigo-300 cursor-grab active:cursor-grabbing border border-slate-600/60 touch-none select-none self-stretch min-h-[2.75rem]"
        title="Drag to reorder"
        aria-label={`Drag to reorder: ${ACTION_TAB_SEARCH[actionId] || actionId}`}
      >
        <i className="fas fa-grip-vertical text-xs" />
      </div>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}

const ActionsTab = ({ char, updateChar, onNavigate }) => {
  const attr = char.attributes || {};
  const skills = char.skills || {};
  const arcanaValues = char.arcanaValues || {};
  const gnosis = char.gnosis || 1;
  const activeSpells = char.activeSpells || [];
  const actionMods = char.actionModifiers || {};
  const defense = char.defenseOverride ?? Math.min(attr.dexterity || 1, attr.wits || 1) + (skills.athletics || 0);
  const speed = char.speedOverride ?? (attr.dexterity || 1) + (attr.strength || 1) + 5;

  const setActionMod = (key, value) => {
    updateChar({ actionModifiers: { ...actionMods, [key]: value } });
  };

  const attackTypes = [
    { key: 'unarmed', label: 'Unarmed Combat', formula: 'Strength + Brawl', base: (attr.strength || 1) + (skills.brawl || 0), subtractDef: true },
    { key: 'melee', label: 'Melee Combat', formula: 'Strength + Weaponry', base: (attr.strength || 1) + (skills.weaponry || 0), subtractDef: true },
    { key: 'ranged', label: 'Ranged Combat', formula: 'Dexterity + Firearms', base: (attr.dexterity || 1) + (skills.firearms || 0), subtractDef: false },
    { key: 'thrown', label: 'Thrown Weapons', formula: 'Dexterity + Athletics', base: (attr.dexterity || 1) + (skills.athletics || 0), subtractDef: true },
  ];

  const grappleBase = (attr.strength || 1) + (skills.brawl || 0);
  const jumpingBase = (attr.strength || 1) + (skills.athletics || 0);

  const cancelSpell = (id) => {
    updateChar({ activeSpells: activeSpells.filter((s) => s.id !== id) });
  };

  const [search, setSearch] = useState('');
  const [draggingId, setDraggingId] = useState(null);
  const [hoverTargetId, setHoverTargetId] = useState(null);
  const q = search.toLowerCase();
  const showId = (id) => !q || (ACTION_TAB_SEARCH[id] || '').toLowerCase().includes(q);

  const order = useMemo(() => normalizeActionsTabOrder(char.actionsTabOrder), [char.actionsTabOrder]);

  const moveBefore = useCallback(
    (sourceId, targetId) => {
      if (sourceId === targetId) return;
      const next = normalizeActionsTabOrder(char.actionsTabOrder);
      const fi = next.indexOf(sourceId);
      const ti = next.indexOf(targetId);
      if (fi === -1 || ti === -1) return;
      next.splice(fi, 1);
      next.splice(next.indexOf(targetId), 0, sourceId);
      updateChar({ actionsTabOrder: next });
    },
    [char.actionsTabOrder, updateChar]
  );

  const renderActionBlock = (id) => {
    switch (id) {
      case 'castSpell':
        return <CastSpellAction onNavigate={onNavigate} />;
      case 'cancelSpell':
        return <CancelSpellAction activeSpells={activeSpells} gnosis={gnosis} onCancel={cancelSpell} />;
      case 'counterspell':
        return <CounterspellAction gnosis={gnosis} arcanaValues={arcanaValues} />;
      case 'attack':
        return <AttackAction attackTypes={attackTypes} actionMods={actionMods} setActionMod={setActionMod} />;
      case 'grapple':
        return <GrappleAction base={grappleBase} savedMod={actionMods.grappleMod || 0} onModChange={(v) => setActionMod('grappleMod', v)} />;
      case 'scourPattern':
        return <ScourPatternAction gnosis={gnosis} />;
      case 'dodge':
        return (
          <SimpleAction
            name="Dodge"
            actionType="pre-turn"
            summary={`Defense ×2 = ${defense * 2} dice`}
            description={`At any point before your action, your character can choose to Dodge. Doing so gives up her normal action. When Dodging, double your character's Defense but do not subtract it from attack rolls. Instead, roll Defense as a dice pool, and subtract each success from the attacker's successes. If this reduces the attacker's successes to 0, the attack does no damage. Apply successes from Dodging before adding any weapon bonus.\n\nAgainst multiple opponents, reduce Defense by one for each opponent before doubling it to determine your dice pool. If your Defense is reduced to 0, you roll a chance die. A dramatic failure when Dodging leaves your character off-balance; reduce her Defense by –1 for her next turn.`}
          />
        );
      case 'aiming':
        return (
          <SimpleAction
            name="Aiming"
            actionType="instant"
            summary="+1 to +3 dice (one turn per die)"
            description={`Instead of firing, a character may spend a turn aiming at an opponent. Each turn spent aiming adds a die to an attack roll, as long as the attack is the next action by the aiming character. Characters may aim for multiple turns before attacking, building up the bonus, but it may not exceed +3 dice.`}
          />
        );
      case 'reloading':
        return (
          <SimpleAction
            name="Reloading"
            actionType="instant"
            summary="Instant; Defense may be lost loading loose rounds"
            description={`Reloading a firearm is an instant action. If you need to load bullets separately, you cannot apply your Defense on the same turn. If you have a magazine or speed-loader, you don't lose your Defense.`}
          />
        );
      case 'movement':
        return (
          <SimpleAction
            name="Movement"
            actionType="conditional"
            summary={`Speed ${speed} / Dash ${speed * 2}`}
            description={`A character can move his Speed in a single turn and still take an instant action. He can forsake his action to Dash and move at double his normal pace.`}
          />
        );
      case 'jumping':
        return <JumpingAction base={jumpingBase} savedMod={actionMods.jumpingMod || 0} onModChange={(v) => setActionMod('jumpingMod', v)} />;
      case 'goingProne':
        return (
          <SimpleAction
            name="Going Prone"
            actionType="pre-turn"
            summary="−2 ranged / +2 melee against you"
            description={`When a character can't find cover, the next best thing when bullets are flying is to drop flat to the ground. Ranged attacks against him suffer a –2 die penalty. A standing attacker using Brawl or Weaponry to attack instead gains a +2 die bonus.\n\nA character can drop prone at any point before his action. Dropping to the ground costs his action for the turn. Getting up from being prone also takes your character's action.`}
          />
        );
      case 'mageArmor':
        return <MageArmorAction arcanaValues={arcanaValues} />;
      case 'activeMageSight':
        return <ActiveMageSightAction gnosis={gnosis} arcanaValues={arcanaValues} />;
      case 'focusedMageSight':
        return <FocusedMageSightAction gnosis={gnosis} arcanaValues={arcanaValues} />;
      case 'teamwork':
        return <TeamworkAction gnosis={gnosis} arcanaValues={arcanaValues} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-2">
      <div className="relative mb-1">
        <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search actions…"
          className="w-full bg-slate-700 text-white text-sm border border-slate-600 rounded-lg pl-8 pr-3 py-2 focus:outline-none focus:border-indigo-500 placeholder-slate-500"
        />
      </div>
      {order.filter((actionId) => showId(actionId)).map((actionId) => (
        <DraggableActionRow
          key={actionId}
          actionId={actionId}
          onMoveBefore={moveBefore}
          draggingId={draggingId}
          setDraggingId={setDraggingId}
          hoverTargetId={hoverTargetId}
          setHoverTargetId={setHoverTargetId}
        >
          {renderActionBlock(actionId)}
        </DraggableActionRow>
      ))}
    </div>
  );
};

/* ─── Cast Spell ──────────────────────────────────────────── */
const CastSpellAction = ({ onNavigate }) => (
  <div className="bg-slate-700/60 rounded-lg overflow-hidden">
    <button type="button" className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-slate-700 transition-colors" onClick={() => onNavigate('spellcasting')}>
      <div className="flex items-center gap-2">
        <span className="font-medium text-sm text-white">Cast Spell</span>
        <ActionTypeBadge type="conditional" />
        <span className="text-xs text-slate-400">Open the spellcasting page</span>
      </div>
      <i className="fas fa-magic text-xs text-indigo-400" />
    </button>
  </div>
);

/* ─── Roll result display ─────────────────────────────────── */
const RollResult = ({ results, pool }) => {
  if (!results) return null;
  const isChance = pool <= 0;
  const successes = countSuccesses(results, isChance);
  return (
    <div className="bg-slate-900/60 rounded-lg p-3 mt-2 space-y-1.5">
      <div className="flex items-center gap-2 text-xs">
        <span className="text-slate-400">Pool: {pool}{isChance ? ' (chance)' : ''}</span>
        <span className="text-slate-600">|</span>
        <span className={successes > 0 ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>
          {successes} success{successes !== 1 ? 'es' : ''}
        </span>
      </div>
      <div className="flex flex-wrap gap-1">
        {results.map((d, i) => (
          <span key={i} className={`w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold ${
            d >= 8 ? 'bg-green-600/30 text-green-300 border border-green-500/40' :
            (isChance && d === 1) ? 'bg-red-600/30 text-red-300 border border-red-500/40' :
            'bg-slate-700 text-slate-400 border border-slate-600'
          }`}>{d}</span>
        ))}
      </div>
    </div>
  );
};

/* ─── Attack (rollable, with specified targets) ───────────── */
const AttackAction = ({ attackTypes, actionMods, setActionMod }) => {
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState({});

  const getMod = (key) => actionMods[`attack_mod_${key}`] || 0;
  const getTarget = (key) => actionMods[`attack_target_${key}`] || 0;
  const setMod = (key, v) => setActionMod(`attack_mod_${key}`, v);
  const setTarget = (key, v) => setActionMod(`attack_target_${key}`, v);
  const getPool = (at) => Math.max(0, at.base + getMod(at.key) - getTarget(at.key));

  const roll = (at) => {
    const pool = getPool(at);
    setResults((prev) => ({ ...prev, [at.key]: { dice: rollDice(pool), pool } }));
  };

  return (
    <div className="bg-slate-700/60 rounded-lg overflow-hidden">
      <button type="button" className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-slate-700 transition-colors" onClick={() => setOpen(!open)}>
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm text-white">Attack</span>
          <ActionTypeBadge type="instant" />
          <span className="text-xs text-slate-400">Various combat dice pools</span>
        </div>
        <i className={`fas fa-chevron-${open ? 'up' : 'down'} text-xs text-slate-500`} />
      </button>
      {open && (
        <div className="px-4 pb-4 pt-2 border-t border-slate-600/50 space-y-3 animate-fadeIn">
          <p className="text-sm text-slate-300 leading-relaxed">On your turn, your character can attack using one of the following dice pools. Determine damage by adding the successes rolled to any weapon bonus.</p>
          {attackTypes.map((at) => {
            const pool = getPool(at);
            const res = results[at.key];
            return (
              <div key={at.key} className="bg-slate-800/50 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm text-white font-medium">{at.label}</span>
                    <span className="text-xs text-slate-500 ml-2">{at.formula}{at.subtractDef ? ' − Target Def' : ''}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono text-white font-bold">{pool}</span>
                    <button type="button" onClick={() => roll(at)} className="px-3 py-1 rounded-md bg-indigo-600 hover:bg-indigo-500 text-xs text-white font-medium transition-colors">
                      <i className="fas fa-dice mr-1" />Roll
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs">
                  <label className="flex items-center gap-1.5 text-slate-400">
                    Modifier
                    <input type="number" min={0} max={10} value={getMod(at.key)} onChange={(e) => setMod(at.key, Math.max(0, Math.min(10, parseInt(e.target.value, 10) || 0)))}
                      className="w-12 bg-slate-700 text-white text-center border border-slate-600 rounded py-0.5 focus:outline-none focus:border-indigo-500" />
                  </label>
                  <label className="flex items-center gap-1.5 text-slate-400">
                    Target
                    <select value={getTarget(at.key)} onChange={(e) => setTarget(at.key, parseInt(e.target.value, 10))}
                      className="bg-slate-700 text-white text-xs border border-slate-600 rounded px-2 py-0.5 focus:outline-none focus:border-indigo-500">
                      {SPECIFIED_TARGETS.map((t) => (
                        <option key={t.label} value={t.penalty}>{t.label}</option>
                      ))}
                    </select>
                  </label>
                  {getTarget(at.key) > 0 && (
                    <span className="text-amber-400 text-[10px]">
                      {SPECIFIED_TARGETS.find((t) => t.penalty === getTarget(at.key))?.effect}
                    </span>
                  )}
                </div>
                {res && <RollResult results={res.dice} pool={res.pool} />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

/* ─── Jumping (rollable) ─────────────────────────────────── */
const JumpingAction = ({ base, savedMod, onModChange }) => {
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState(null);
  const mod = savedMod;
  const setMod = (v) => onModChange(v);
  const pool = Math.max(0, base + mod);

  return (
    <div className="bg-slate-700/60 rounded-lg overflow-hidden">
      <button type="button" className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-slate-700 transition-colors" onClick={() => setOpen(!open)}>
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm text-white">Jumping</span>
          <ActionTypeBadge type="instant" />
          <span className="text-xs text-slate-400">Str + Athletics = {base}</span>
        </div>
        <i className={`fas fa-chevron-${open ? 'up' : 'down'} text-xs text-slate-500`} />
      </button>
      {open && (
        <div className="px-4 pb-4 pt-2 border-t border-slate-600/50 space-y-3 animate-fadeIn">
          <p className="text-sm text-slate-300 leading-relaxed">Jumping is an instant action. Roll Strength + Athletics; each success adds one foot of vertical height cleared in a single jump.</p>
          <div className="bg-slate-800/50 rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-xs">
                <span className="text-sm font-mono text-white font-bold">{pool} dice</span>
                <label className="flex items-center gap-1.5 text-slate-400">
                  Modifier
                  <input type="number" min={0} max={10} value={mod} onChange={(e) => setMod(Math.max(0, Math.min(10, parseInt(e.target.value, 10) || 0)))}
                    className="w-12 bg-slate-700 text-white text-center border border-slate-600 rounded py-0.5 focus:outline-none focus:border-indigo-500" />
                </label>
              </div>
              <button type="button" onClick={() => setResult({ dice: rollDice(pool), pool })} className="px-3 py-1 rounded-md bg-indigo-600 hover:bg-indigo-500 text-xs text-white font-medium transition-colors">
                <i className="fas fa-dice mr-1" />Roll
              </button>
            </div>
            {result && (
              <>
                <RollResult results={result.dice} pool={result.pool} />
                <p className="text-xs text-slate-400">
                  Vertical height this jump: <span className="text-indigo-300 font-medium">{countSuccesses(result.dice, result.pool <= 1)} ft</span>
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

/* ─── Grapple (rollable) ──────────────────────────────────── */
const GRAPPLE_MOVES = [
  { name: 'Break Free', desc: 'Throw off your opponent; both no longer grappling. Reflexive — take another action immediately.' },
  { name: 'Control Weapon', desc: 'Draw a holstered weapon or turn your opponent\'s weapon against him.' },
  { name: 'Damage', desc: 'Deal bashing damage equal to rolled successes. Add weapon bonus if you control a weapon.' },
  { name: 'Disarm', desc: 'Remove a weapon from the grapple entirely. Requires prior Control Weapon.' },
  { name: 'Drop Prone', desc: 'Throw both of you to the ground. Must Break Free before rising.' },
  { name: 'Hold', desc: 'Hold opponent in place. Neither can apply Defense against incoming attacks.' },
  { name: 'Restrain', desc: 'Immobilize opponent. Requires prior Hold. If using equipment, you can leave the grapple.' },
  { name: 'Take Cover', desc: 'Use opponent\'s body as cover. Ranged attacks until end of turn auto-hit them.' },
];

const GrappleAction = ({ base, savedMod, onModChange }) => {
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState(null);
  const mod = savedMod;
  const setMod = (v) => onModChange(v);

  const pool = Math.max(0, base + mod);

  return (
    <div className="bg-slate-700/60 rounded-lg overflow-hidden">
      <button type="button" className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-slate-700 transition-colors" onClick={() => setOpen(!open)}>
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm text-white">Grapple</span>
          <ActionTypeBadge type="instant" />
          <span className="text-xs text-slate-400">Str + Brawl = {base} − Target Def</span>
        </div>
        <i className={`fas fa-chevron-${open ? 'up' : 'down'} text-xs text-slate-500`} />
      </button>
      {open && (
        <div className="px-4 pb-4 pt-2 border-t border-slate-600/50 space-y-3 animate-fadeIn">
          <p className="text-sm text-slate-300 leading-relaxed">To grab your opponent, roll Strength + Brawl – Defense. On a success, both of you are grappling. Each turn, both characters make a contested Strength + Brawl action. The winner picks a move (or two on exceptional success).</p>
          <div className="bg-slate-800/50 rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-xs">
                <span className="text-sm font-mono text-white font-bold">{pool} dice</span>
                <label className="flex items-center gap-1.5 text-slate-400">
                  Modifier
                  <input type="number" min={0} max={10} value={mod} onChange={(e) => setMod(Math.max(0, Math.min(10, parseInt(e.target.value, 10) || 0)))}
                    className="w-12 bg-slate-700 text-white text-center border border-slate-600 rounded py-0.5 focus:outline-none focus:border-indigo-500" />
                </label>
              </div>
              <button type="button" onClick={() => setResult({ dice: rollDice(pool), pool })} className="px-3 py-1 rounded-md bg-indigo-600 hover:bg-indigo-500 text-xs text-white font-medium transition-colors">
                <i className="fas fa-dice mr-1" />Roll
              </button>
            </div>
            {result && <RollResult results={result.dice} pool={result.pool} />}
          </div>
          <div className="space-y-1.5">
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Grapple Moves</p>
            {GRAPPLE_MOVES.map((m) => (
              <div key={m.name} className="flex gap-2 text-xs">
                <span className="text-indigo-400 font-medium shrink-0 w-28">{m.name}</span>
                <span className="text-slate-400">{m.desc}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-amber-300/80 bg-amber-900/20 rounded-lg px-3 py-2 border border-amber-800/30">
            <i className="fas fa-exclamation-triangle mr-1.5" />A mage can cast spells in a grapple regardless of winning, but suffers –3 to spellcasting if she failed, and must operate under Yantra restrictions.
          </p>
        </div>
      )}
    </div>
  );
};

/* ─── Mage Armor ──────────────────────────────────────────── */
const MAGE_ARMORS = [
  { arcanum: 'Death',  effect: 'Downgrades lethal damage from kinetic attacks to bashing. Does not roll to stay conscious when Health track is filled.' },
  { arcanum: 'Fate',   effect: '+Arcanum to Defense. Apply Defense to firearms. On successful Dodge, spend 1 Mana to add Fate dots as weapon rating on next physical attack against that target.' },
  { arcanum: 'Forces', effect: '+Arcanum as general armor vs. all physical attacks, fire, and electricity. No effect on mental/psychic attacks.' },
  { arcanum: 'Life',   effect: '+\u00BD Arcanum (round up) as general armor and Defense bonus. Use higher of Wits/Dexterity for Defense instead of lower.' },
  { arcanum: 'Matter', effect: '+Arcanum as general armor vs. all physical attacks. Immune to Armor Piercing. No effect on mental/psychic attacks.' },
  { arcanum: 'Mind',   effect: '+Arcanum to Defense. On successful Dodge, spend 1 Mana to inflict Beaten Down Tilt on attacker (supernatural beings contest via Clash of Wills). No protection vs. non-cognitive threats.' },
  { arcanum: 'Prime',  effect: 'Reduces damage from wholly supernatural attacks by Arcanum dots. No effect on mundane attacks.' },
  { arcanum: 'Space',  effect: '+Arcanum to Defense. Apply Defense to firearms. On successful Dodge, spend 1 Mana to redirect the attack to another target (hits with successes equal to Space dots).' },
  { arcanum: 'Spirit', effect: 'Downgrades lethal damage from kinetic attacks and ephemeral entity attacks to bashing.' },
  { arcanum: 'Time',   effect: "+Arcanum to Defense. Apply Defense to firearms. On successful Dodge, spend 1 Mana to reduce attacker's Initiative by Time dots for the scene." },
];

const MageArmorAction = ({ arcanaValues }) => {
  const [open, setOpen] = useState(false);
  const known = MAGE_ARMORS.filter((a) => (arcanaValues[a.arcanum.toLowerCase()] || 0) >= 2);

  return (
    <div className="bg-slate-700/60 rounded-lg overflow-hidden">
      <button type="button" className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-slate-700 transition-colors" onClick={() => setOpen(!open)}>
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm text-white">Mage Armor</span>
          <ActionTypeBadge type="reflexive" />
          <span className="text-xs text-slate-400">1 Mana, lasts the scene</span>
        </div>
        <i className={`fas fa-chevron-${open ? 'up' : 'down'} text-xs text-slate-500`} />
      </button>
      {open && (
        <div className="px-4 pb-4 pt-2 border-t border-slate-600/50 space-y-3 animate-fadeIn">
          <p className="text-sm text-slate-300 leading-relaxed">Mage Armor costs 1 Mana to activate as a reflexive action and remains active for the scene, even if the mage falls unconscious, unless she dies. Only one form of Mage Armor can be active at a time, but the mage can spend Mana to switch between Arcana as a reflexive action. Armors that increase Defense work against surprise attacks.</p>
          {known.length > 0 ? (
            <div className="space-y-1.5">
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Available Armors</p>
              {known.map((a) => {
                const dots = arcanaValues[a.arcanum.toLowerCase()];
                return (
                  <div key={a.arcanum} className="flex gap-2 text-xs bg-slate-800/50 rounded-lg px-3 py-2">
                    <span className="text-indigo-300 font-medium shrink-0 w-16">{a.arcanum} ({dots})</span>
                    <span className="text-slate-400">{a.effect}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">No Arcana with at least 1 dot.</p>
          )}
        </div>
      )}
    </div>
  );
};

/* ─── Active Mage Sight ───────────────────────────────────── */
const ActiveMageSightAction = ({ gnosis, arcanaValues }) => {
  const [open, setOpen] = useState(false);
  const [selectedArcanum, setSelectedArcanum] = useState('death');
  const [result, setResult] = useState(null);

  const arcanumVal = arcanaValues[selectedArcanum] || 0;
  const pool = Math.max(0, gnosis + arcanumVal);

  return (
    <div className="bg-slate-700/60 rounded-lg overflow-hidden">
      <button type="button" className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-slate-700 transition-colors" onClick={() => setOpen(!open)}>
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm text-white">Active Mage Sight</span>
          <ActionTypeBadge type="reflexive" />
          <span className="text-xs text-slate-400">Ruling Arcana reflexive, others instant</span>
        </div>
        <i className={`fas fa-chevron-${open ? 'up' : 'down'} text-xs text-slate-500`} />
      </button>
      {open && (
        <div className="px-4 pb-4 pt-2 border-t border-slate-600/50 space-y-3 animate-fadeIn">
          <p className="text-sm text-slate-300 leading-relaxed">Entering Active Mage Sight is a reflexive action when using Ruling Arcana, and an instant action otherwise. Leaving it is always reflexive. While active, the mage suffers a –2 modifier to all rolls unrelated to using or perceiving magic. A mage can maintain Active Mage Sight for a number of minutes equal to her Gnosis ({gnosis} min). After that, she must spend a Willpower point to keep it active for the remainder of the scene.</p>
          <p className="text-sm text-slate-300 leading-relaxed">If Active Mage Sight could pierce a concealment effect, use a Clash of Wills: Gnosis + Arcanum vs. the defender's concealment dice pool.</p>

          <div className="bg-slate-800/50 rounded-lg p-3 space-y-2">
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-1">Clash of Wills — Gnosis + Arcanum</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-xs">
                <label className="flex items-center gap-1.5 text-slate-400">
                  Arcanum
                  <select value={selectedArcanum} onChange={(e) => { setSelectedArcanum(e.target.value); setResult(null); }}
                    className="bg-slate-700 text-white text-xs border border-slate-600 rounded px-2 py-0.5 focus:outline-none focus:border-indigo-500">
                    {ARCANA_NAMES.map((a) => (
                      <option key={a} value={a.toLowerCase()}>{a} ({arcanaValues[a.toLowerCase()] || 0})</option>
                    ))}
                  </select>
                </label>
                <span className="text-sm font-mono text-white font-bold">{pool} dice</span>
              </div>
              <button type="button" onClick={() => setResult({ dice: rollDice(pool), pool })} className="px-3 py-1 rounded-md bg-indigo-600 hover:bg-indigo-500 text-xs text-white font-medium transition-colors">
                <i className="fas fa-dice mr-1" />Roll
              </button>
            </div>
            {result && <RollResult results={result.dice} pool={result.pool} />}
          </div>
        </div>
      )}
    </div>
  );
};

/* ─── Focused Mage Sight (rollable Revelation + Scrutiny) ─── */
const FocusedMageSightAction = ({ gnosis, arcanaValues }) => {
  const [open, setOpen] = useState(false);
  const [selRev, setSelRev] = useState('death');
  const [selScr, setSelScr] = useState('death');
  const [opacityRev, setOpacityRev] = useState(0);
  const [revResult, setRevResult] = useState(null);
  const [scrResult, setScrResult] = useState(null);

  const revPool = Math.max(0, gnosis + (arcanaValues[selRev] || 0) - opacityRev);
  const scrPool = Math.max(0, gnosis + (arcanaValues[selScr] || 0));

  return (
    <div className="bg-slate-700/60 rounded-lg overflow-hidden">
      <button type="button" className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-slate-700 transition-colors" onClick={() => setOpen(!open)}>
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm text-white">Focused Mage Sight</span>
          <ActionTypeBadge type="instant" />
          <span className="text-xs text-slate-400">Gnosis + Arcanum</span>
        </div>
        <i className={`fas fa-chevron-${open ? 'up' : 'down'} text-xs text-slate-500`} />
      </button>
      {open && (
        <div className="px-4 pb-4 pt-2 border-t border-slate-600/50 space-y-3 animate-fadeIn">
          <p className="text-sm text-slate-300 leading-relaxed">Focused Mage Sight allows a mage to scrutinize a subject through the lens of the chosen Arcana. The mage must already be using Active Mage Sight. It has two stages:</p>

          {/* Revelation */}
          <div className="bg-slate-800/40 rounded-lg p-3 space-y-2">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-xs font-bold text-indigo-300">Revelation</p>
              <ActionTypeBadge type="instant" />
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">Dice Pool: Gnosis + Arcanum – Opacity</p>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3 text-xs">
                <label className="flex items-center gap-1.5 text-slate-400">
                  Arcanum
                  <select value={selRev} onChange={(e) => { setSelRev(e.target.value); setRevResult(null); }}
                    className="bg-slate-700 text-white text-xs border border-slate-600 rounded px-2 py-0.5 focus:outline-none focus:border-indigo-500">
                    {ARCANA_NAMES.map((a) => <option key={a} value={a.toLowerCase()}>{a} ({arcanaValues[a.toLowerCase()] || 0})</option>)}
                  </select>
                </label>
                <label className="flex items-center gap-1.5 text-slate-400">
                  Opacity
                  <input type="number" min={0} max={20} value={opacityRev} onChange={(e) => setOpacityRev(Math.max(0, parseInt(e.target.value, 10) || 0))}
                    className="w-12 bg-slate-700 text-white text-center border border-slate-600 rounded py-0.5 focus:outline-none focus:border-indigo-500" />
                </label>
                <span className="text-sm font-mono text-white font-bold">{revPool} dice</span>
              </div>
              <button type="button" onClick={() => setRevResult({ dice: rollDice(revPool), pool: revPool })} className="px-3 py-1 rounded-md bg-indigo-600 hover:bg-indigo-500 text-xs text-white font-medium transition-colors">
                <i className="fas fa-dice mr-1" />Roll
              </button>
            </div>
            {revResult && <RollResult results={revResult.dice} pool={revResult.pool} />}
            <div className="text-[11px] text-slate-500 leading-relaxed mt-1 space-y-0.5">
              <p>• <strong className="text-slate-400">Dramatic Failure:</strong> No Scrutiny or Revelation possible for 24 hours.</p>
              <p>• <strong className="text-slate-400">Failure:</strong> Unable to Reveal, but can still Scrutinize.</p>
              <p>• <strong className="text-slate-400">Success:</strong> Discovers surface information of the Mystery.</p>
              <p>• <strong className="text-slate-400">Exceptional:</strong> Surface info + lower Opacity by 1, or uncover deep info.</p>
            </div>
          </div>

          {/* Scrutiny */}
          <div className="bg-slate-800/40 rounded-lg p-3 space-y-2">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-xs font-bold text-indigo-300">Scrutiny</p>
              <ActionTypeBadge type="extended" />
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">Dice Pool: Gnosis + Arcanum (1 Willpower to activate). Time per roll: 1 turn. Accumulate successes equal to Opacity to lower it by 1.</p>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3 text-xs">
                <label className="flex items-center gap-1.5 text-slate-400">
                  Arcanum
                  <select value={selScr} onChange={(e) => { setSelScr(e.target.value); setScrResult(null); }}
                    className="bg-slate-700 text-white text-xs border border-slate-600 rounded px-2 py-0.5 focus:outline-none focus:border-indigo-500">
                    {ARCANA_NAMES.map((a) => <option key={a} value={a.toLowerCase()}>{a} ({arcanaValues[a.toLowerCase()] || 0})</option>)}
                  </select>
                </label>
                <span className="text-sm font-mono text-white font-bold">{scrPool} dice</span>
              </div>
              <button type="button" onClick={() => setScrResult({ dice: rollDice(scrPool), pool: scrPool })} className="px-3 py-1 rounded-md bg-indigo-600 hover:bg-indigo-500 text-xs text-white font-medium transition-colors">
                <i className="fas fa-dice mr-1" />Roll
              </button>
            </div>
            {scrResult && <RollResult results={scrResult.dice} pool={scrResult.pool} />}
            <div className="text-[11px] text-slate-500 leading-relaxed mt-1 space-y-0.5">
              <p>After rolls equal to unmodified Gnosis + Arcanum ({scrPool}), failed rolls add {Math.ceil(gnosis / 2)} to Opacity.</p>
              <p>Mana can be spent (up to {gnosis}/turn) to add successes on successful rolls.</p>
              <p>• <strong className="text-slate-400">Dramatic Failure:</strong> No successes, +2 Opacity. Supernal entity may take note.</p>
              <p>• <strong className="text-slate-400">Failure:</strong> No successes. Past the limit, adds {Math.ceil(gnosis / 2)} to Opacity.</p>
              <p>• <strong className="text-slate-400">Success:</strong> Accumulate successes; spend Mana for more.</p>
              <p>• <strong className="text-slate-400">Exceptional:</strong> Apply all successes even across Opacity thresholds, or spend Mana to obscure tracks.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ─── Cancel Spell (reflexive) ────────────────────────────── */
const CancelSpellAction = ({ activeSpells, gnosis, onCancel }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-slate-700/60 rounded-lg overflow-hidden">
      <button type="button" className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-slate-700 transition-colors" onClick={() => setOpen(!open)}>
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm text-white">Cancel Spell</span>
          <ActionTypeBadge type="reflexive" />
          <span className="text-xs text-slate-400">{activeSpells.length}/{gnosis} active</span>
        </div>
        <i className={`fas fa-chevron-${open ? 'up' : 'down'} text-xs text-slate-500`} />
      </button>
      {open && (
        <div className="px-4 pb-4 pt-2 border-t border-slate-600/50 space-y-3 animate-fadeIn">
          <p className="text-sm text-slate-300 leading-relaxed">A mage may cancel any of her active spells as a reflexive action. She cannot increase spell factors after casting, but can restrict effects by reducing factors such as Potency, Duration, or Scale as an instant action.</p>
          <p className="text-sm text-slate-300 leading-relaxed">A mage can have up to <strong className="text-white">{gnosis}</strong> active spells (equal to Gnosis). Each spell beyond that requires +1 Reach, plus another Reach per spell already over the limit.</p>
          <p className="text-xs text-slate-400 leading-relaxed">A mage may also relinquish a spell (1 Willpower point) to remove it from her active count without canceling it. Spending a Willpower dot relinquishes it safely; otherwise it risks going awry each chapter.</p>
          {activeSpells.length > 0 ? (
            <div className="space-y-1.5">
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Active Spells</p>
              {activeSpells.map((spell) => (
                <div key={spell.id} className="flex items-center justify-between bg-slate-800/50 rounded-lg px-3 py-2 group">
                  <div>
                    <span className="text-sm text-white font-medium">{spell.name}</span>
                    <span className="text-xs text-slate-500 ml-2">Potency {spell.potency}</span>
                  </div>
                  <button type="button" onClick={() => onCancel(spell.id)} className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 text-xs p-1 transition-opacity" title="Cancel this spell">
                    <i className="fas fa-times-circle" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">No active spells.</p>
          )}
        </div>
      )}
    </div>
  );
};

/* ─── Counterspell (rollable Clash of Wills) ─────────────── */
const CounterspellAction = ({ gnosis, arcanaValues }) => {
  const [open, setOpen] = useState(false);
  const knownArcana = ARCANA_NAMES.filter((a) => (arcanaValues[a.toLowerCase()] || 0) >= 1);
  const firstKnown = knownArcana.length > 0 ? knownArcana[0].toLowerCase() : 'death';
  const [selectedArcanum, setSelectedArcanum] = useState(firstKnown);
  const [universal, setUniversal] = useState(false);
  const [result, setResult] = useState(null);

  const hasPrime2 = (arcanaValues.prime || 0) >= 2;
  const arcanumVal = universal ? (arcanaValues.prime || 0) : (arcanaValues[selectedArcanum] || 0);
  const pool = Math.max(0, gnosis + arcanumVal);

  return (
    <div className="bg-slate-700/60 rounded-lg overflow-hidden">
      <button type="button" className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-slate-700 transition-colors" onClick={() => setOpen(!open)}>
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm text-white">Counterspell</span>
          <ActionTypeBadge type="instant" />
          <span className="text-xs text-slate-400">Clash of Wills</span>
        </div>
        <i className={`fas fa-chevron-${open ? 'up' : 'down'} text-xs text-slate-500`} />
      </button>
      {open && (
        <div className="px-4 pb-4 pt-2 border-t border-slate-600/50 space-y-3 animate-fadeIn">
          <p className="text-sm text-slate-300 leading-relaxed">Knowledge of an Arcanum lets you disrupt another mage's Imago before the spell takes effect. You must be using Active Mage Sight to see the spell being cast. Counterspell is a Clash of Wills: your Gnosis + Arcanum vs. the caster's Gnosis + Arcanum.</p>
          <p className="text-sm text-slate-300 leading-relaxed">You always counter the <strong className="text-white">highest Arcanum</strong> of the target spell. Arcanum ratings don't need to match — an Initiate can counter a Master — but countering a mage with a <strong className="text-white">higher rating</strong> in the target Arcanum costs <strong className="text-blue-300">1 Mana</strong>.</p>

          {/* Arcanum-specific counterspell */}
          <div className="bg-slate-800/40 rounded-lg p-3 space-y-2">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-xs font-bold text-indigo-300">Arcanum Counterspell</p>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">Counter a spell that uses an Arcanum you know (at least 1 dot).</p>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3 text-xs">
                <label className="flex items-center gap-1.5 text-slate-400">
                  Arcanum
                  <select
                    value={universal ? '' : selectedArcanum}
                    onChange={(e) => { setSelectedArcanum(e.target.value); setUniversal(false); setResult(null); }}
                    disabled={universal}
                    className="bg-slate-700 text-white text-xs border border-slate-600 rounded px-2 py-0.5 focus:outline-none focus:border-indigo-500 disabled:opacity-40"
                  >
                    {knownArcana.length > 0 ? (
                      knownArcana.map((a) => (
                        <option key={a} value={a.toLowerCase()}>{a} ({arcanaValues[a.toLowerCase()] || 0})</option>
                      ))
                    ) : (
                      <option disabled>No Arcana known</option>
                    )}
                  </select>
                </label>
                {!universal && <span className="text-sm font-mono text-white font-bold">{pool} dice</span>}
              </div>
              {!universal && (
                <button type="button" onClick={() => setResult({ dice: rollDice(pool), pool })} disabled={knownArcana.length === 0}
                  className="px-3 py-1 rounded-md bg-indigo-600 hover:bg-indigo-500 text-xs text-white font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                  <i className="fas fa-dice mr-1" />Roll Clash
                </button>
              )}
            </div>
            {!universal && result && <RollResult results={result.dice} pool={result.pool} />}
          </div>

          {/* Universal Counterspell */}
          <div className="bg-slate-800/40 rounded-lg p-3 space-y-2">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-xs font-bold text-indigo-300">Universal Counterspell</p>
              <span className="text-[10px] text-slate-500">Requires Prime 2</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">With Prime 2, a mage can counter <strong className="text-slate-200">any</strong> spell regardless of Arcanum, using Gnosis + Prime. This costs <strong className="text-blue-300">1 Mana</strong>.</p>
            {hasPrime2 ? (
              <>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-xs text-slate-400">Gnosis {gnosis} + Prime {arcanaValues.prime} = <span className="text-sm font-mono text-white font-bold">{Math.max(0, gnosis + arcanaValues.prime)} dice</span></span>
                  <button type="button" onClick={() => { setUniversal(true); setResult({ dice: rollDice(Math.max(0, gnosis + arcanaValues.prime)), pool: Math.max(0, gnosis + arcanaValues.prime) }); }}
                    className="px-3 py-1 rounded-md bg-indigo-600 hover:bg-indigo-500 text-xs text-white font-medium transition-colors">
                    <i className="fas fa-dice mr-1" />Roll Clash
                  </button>
                </div>
                {universal && result && <RollResult results={result.dice} pool={result.pool} />}
                <p className="text-[10px] text-blue-300/70">Costs 1 Mana to use.</p>
              </>
            ) : (
              <p className="text-xs text-slate-500 italic">You need Prime 2 to use Universal Counterspell.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

/* ─── Teamwork (rollable) ────────────────────────────────── */
const TeamworkAction = ({ gnosis, arcanaValues }) => {
  const [open, setOpen] = useState(false);
  const firstKnown = ARCANA_NAMES.find((a) => (arcanaValues[a.toLowerCase()] || 0) >= 1);
  const [selectedArcanum, setSelectedArcanum] = useState(firstKnown ? firstKnown.toLowerCase() : 'death');
  const [meetsReqs, setMeetsReqs] = useState(true);
  const [mageResult, setMageResult] = useState(null);
  const [mundanePool, setMundanePool] = useState(4);
  const [mundaneResult, setMundaneResult] = useState(null);

  const arcanumVal = arcanaValues[selectedArcanum] || 0;
  const magePool = meetsReqs ? Math.max(0, gnosis + arcanumVal) : Math.max(0, gnosis - 3);

  return (
    <div className="bg-slate-700/60 rounded-lg overflow-hidden">
      <button type="button" className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-slate-700 transition-colors" onClick={() => setOpen(!open)}>
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm text-white">Teamwork</span>
          <ActionTypeBadge type="instant" />
          <span className="text-xs text-slate-400">Secondary assist rolls</span>
        </div>
        <i className={`fas fa-chevron-${open ? 'up' : 'down'} text-xs text-slate-500`} />
      </button>
      {open && (
        <div className="px-4 pb-4 pt-2 border-t border-slate-600/50 space-y-3 animate-fadeIn">
          {/* Mundane teamwork */}
          <div className="bg-slate-800/40 rounded-lg p-3 space-y-2">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-xs font-bold text-indigo-300">Mundane Teamwork</p>
              <ActionTypeBadge type="instant" />
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">When two or more people work together, one person takes the lead as the primary actor. Anyone assisting rolls the same pool before the primary actor. Each success gives the primary actor a bonus die. A dramatic failure from a secondary actor gives the primary actor a −4 penalty instead.</p>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3 text-xs">
                <label className="flex items-center gap-1.5 text-slate-400">
                  Dice Pool
                  <input type="number" min={0} max={30} value={mundanePool} onChange={(e) => { setMundanePool(Math.max(0, parseInt(e.target.value, 10) || 0)); setMundaneResult(null); }}
                    className="w-14 bg-slate-700 text-white text-center border border-slate-600 rounded py-0.5 focus:outline-none focus:border-indigo-500" />
                </label>
                <span className="text-sm font-mono text-white font-bold">{mundanePool} dice</span>
              </div>
              <button type="button" onClick={() => setMundaneResult({ dice: rollDice(mundanePool), pool: mundanePool })} className="px-3 py-1 rounded-md bg-indigo-600 hover:bg-indigo-500 text-xs text-white font-medium transition-colors">
                <i className="fas fa-dice mr-1" />Roll
              </button>
            </div>
            {mundaneResult && <RollResult results={mundaneResult.dice} pool={mundaneResult.pool} />}
          </div>

          {/* Mage teamwork */}
          <div className="bg-slate-800/40 rounded-lg p-3 space-y-2">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-xs font-bold text-indigo-300">Spellcasting Teamwork</p>
              <ActionTypeBadge type="instant" />
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">All mage participants must have at least 1 dot in the required Arcanum; the leader must meet the full requirement. Secondary casters who meet requirements roll <strong className="text-white">Gnosis + Arcanum</strong>; those who do not roll <strong className="text-white">Gnosis − 3</strong>. Successes become bonus dice for the leader.</p>
            <p className="text-xs text-slate-400 leading-relaxed">Each participant rolls for Paradox separately. Mages without the Arcanum at all, Sleepwalkers, and Proximi may assist but do not roll — their presence can be used as an environment Yantra instead.</p>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3 text-xs flex-wrap">
                <label className="flex items-center gap-1.5 text-slate-400">
                  Arcanum
                  <select value={selectedArcanum} onChange={(e) => { setSelectedArcanum(e.target.value); setMageResult(null); }}
                    className="bg-slate-700 text-white text-xs border border-slate-600 rounded px-2 py-0.5 focus:outline-none focus:border-indigo-500">
                    {ARCANA_NAMES.filter((a) => (arcanaValues[a.toLowerCase()] || 0) >= 1).map((a) => (
                      <option key={a} value={a.toLowerCase()}>{a} ({arcanaValues[a.toLowerCase()]})</option>
                    ))}
                  </select>
                </label>
                <label className="flex items-center gap-1.5 text-slate-400 cursor-pointer">
                  <input type="checkbox" checked={meetsReqs} onChange={() => { setMeetsReqs(!meetsReqs); setMageResult(null); }}
                    className="h-3.5 w-3.5 rounded border-slate-600 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-slate-800" />
                  Meets requirements
                </label>
                <span className="text-sm font-mono text-white font-bold">{magePool} dice</span>
              </div>
              <button type="button" onClick={() => setMageResult({ dice: rollDice(magePool), pool: magePool })} className="px-3 py-1 rounded-md bg-indigo-600 hover:bg-indigo-500 text-xs text-white font-medium transition-colors">
                <i className="fas fa-dice mr-1" />Roll
              </button>
            </div>
            <p className="text-[11px] text-slate-500">
              {meetsReqs
                ? `Gnosis (${gnosis}) + ${selectedArcanum.charAt(0).toUpperCase() + selectedArcanum.slice(1)} (${arcanumVal})`
                : `Gnosis (${gnosis}) − 3`
              } — successes become bonus dice for the leader.
            </p>
            {mageResult && <RollResult results={mageResult.dice} pool={mageResult.pool} />}
          </div>
        </div>
      )}
    </div>
  );
};

/* ─── Scour Pattern ──────────────────────────────────────── */
const ScourPatternAction = ({ gnosis }) => {
  const [open, setOpen] = useState(false);
  const maxScours = gnosis >= 10 ? 4 : gnosis >= 7 ? 3 : gnosis >= 5 ? 2 : 1;

  return (
    <div className="bg-slate-700/60 rounded-lg overflow-hidden">
      <button type="button" className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-slate-700 transition-colors" onClick={() => setOpen(!open)}>
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm text-white">Scour Pattern</span>
          <ActionTypeBadge type="instant" />
          <span className="text-xs text-slate-400">{maxScours}/day — produces 3 Mana</span>
        </div>
        <i className={`fas fa-chevron-${open ? 'up' : 'down'} text-xs text-slate-500`} />
      </button>
      {open && (
        <div className="px-4 pb-4 pt-2 border-t border-slate-600/50 space-y-3 animate-fadeIn">
          <p className="text-sm text-slate-300 leading-relaxed">A mage can Scour her Pattern for Mana, literally tearing apart some of the building blocks that maintain her physical form. She reduces a Physical Attribute (Strength, Dexterity, or Stamina) and all derived traits by one dot for 24 hours, <strong className="text-white">or</strong> suffers one resistant lethal wound. Either method produces <strong className="text-green-300">3 Mana</strong>.</p>
          <div className="bg-slate-800/50 rounded-lg p-3 space-y-2">
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Scour Limits by Gnosis</p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs">
              {[
                { range: '1–4', limit: 1 },
                { range: '5–6', limit: 2 },
                { range: '7–9', limit: 3 },
                { range: '10', limit: 4 },
              ].map((r) => (
                <div key={r.range} className={`flex justify-between ${r.limit === maxScours ? 'text-indigo-300 font-medium' : 'text-slate-500'}`}>
                  <span>Gnosis {r.range}</span>
                  <span>{r.limit}/day</span>
                </div>
              ))}
            </div>
          </div>
          <p className="text-xs text-amber-300/80 bg-amber-900/20 rounded-lg px-3 py-2 border border-amber-800/30">
            <i className="fas fa-exclamation-triangle mr-1.5" />At your current Gnosis ({gnosis}), you can Scour <strong>{maxScours} time{maxScours !== 1 ? 's' : ''}</strong> per day.
          </p>
        </div>
      )}
    </div>
  );
};

/* ─── Simple (non-rollable) action ────────────────────────── */
const SimpleAction = ({ name, actionType, summary, description, subsections, note }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-slate-700/60 rounded-lg overflow-hidden">
      <button type="button" className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-slate-700 transition-colors" onClick={() => setOpen(!open)}>
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm text-white">{name}</span>
          {actionType && <ActionTypeBadge type={actionType} />}
          <span className="text-xs text-slate-400">{summary}</span>
        </div>
        <i className={`fas fa-chevron-${open ? 'up' : 'down'} text-xs text-slate-500`} />
      </button>
      {open && (
        <div className="px-4 pb-4 pt-1 border-t border-slate-600/50 space-y-3 animate-fadeIn">
          <p className="text-sm text-slate-300 whitespace-pre-line leading-relaxed">{description}</p>
          {subsections && subsections.map((s) => (
            <div key={s.title} className="bg-slate-800/40 rounded-lg p-3">
              <p className="text-xs font-bold text-indigo-300 mb-1">{s.title}</p>
              <p className="text-xs text-slate-400 whitespace-pre-line leading-relaxed">{s.text}</p>
            </div>
          ))}
          {note && (
            <p className="text-xs text-amber-300/80 bg-amber-900/20 rounded-lg px-3 py-2 border border-amber-800/30">
              <i className="fas fa-exclamation-triangle mr-1.5" />{note}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default ActionsTab;
