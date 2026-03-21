const STORAGE_KEY = 'mage-spell-caster-data';

export const DEFAULT_CHARACTER = {
  // Identity
  shadowName: '',
  playerName: '',
  chronicle: '',
  concept: '',
  path: '',
  order: '',
  legacy: '',
  virtue: '',
  vice: '',

  // Core
  gnosis: 1,
  wisdom: 7,
  willpower: 0,        // current spent willpower (dots filled on bottom row)
  willpowerOverride: null,

  // Experience
  arcaneExperiences: 0,
  arcaneBeats: 0,
  experiences: 0,
  beats: 0,

  // Attributes (MtAw 2e default: 1 each)
  attributes: {
    intelligence: 1, wits: 1, resolve: 1,
    strength: 1, dexterity: 1, stamina: 1,
    presence: 1, manipulation: 1, composure: 1,
  },

  // Skills (default 0)
  skills: {
    academics: 0, computer: 0, craft: 0, investigation: 0,
    medicine: 0, occult: 0, politics: 0, science: 0,
    athletics: 0, brawl: 0, drive: 0, firearms: 0,
    larceny: 0, stealth: 0, survival: 0, weaponry: 0,
    animalKen: 0, empathy: 0, expression: 0, intimidation: 0,
    persuasion: 0, socialize: 0, streetwise: 0, subterfuge: 0,
  },
  roteSkills: [],

  // Arcana
  arcanaValues: {
    death: 0, fate: 0, forces: 0, life: 0, matter: 0,
    mind: 0, prime: 0, spirit: 0, space: 0, time: 0,
  },
  majorArcana: [],

  // Health track — array of '', '/', 'x', '*'
  healthTrack: [],
  healthOverride: null,

  // Derived stat overrides (null = use calculated)
  speedOverride: null,
  initiativeOverride: null,
  defenseOverride: null,
  armor: 0,

  // Mana
  mana: 0,

  // Tilts & Conditions
  tiltsAndConditions: [],

  // Merits — array of { name: string, dots: number }
  merits: [],

  // Items
  mundaneItems: [],
  combatItems: [],       // { name, dmg, range, clip, init, str, size }
  enchantedItems: [],    // { name, power, dicePool, mana }
  yantraItems: [],

  // Goals
  aspirations: [],
  obsessions: [],

  // Nimbus
  nimbus: {
    longTerm: '',
    immediate: '',
    signature: '',
    peripheralMageSight: '',
    effectedStats: {
      intelligence: 0, wits: 0, resolve: 0,
      strength: 0, dexterity: 0, stamina: 0,
      presence: 0, manipulation: 0, composure: 0,
    },
  },

  // Attainments
  arcanaAttainments: [],
  legacyAttainments: [],

  // Inured spells
  inuredSpells: [],

  // Extras / notes
  extras: '',

  // Active spells (currently sustained)
  activeSpells: [],

  // Spellbook
  userSpells: [],
  yantras: 0,
};

export const getDefaultCharacterData = () => ({ ...DEFAULT_CHARACTER });

export const saveCharacterData = (data) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Error saving to local storage:', error);
    return false;
  }
};

export const loadCharacterData = () => {
  try {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (!savedData) return null;
    return JSON.parse(savedData);
  } catch (error) {
    console.error('Error loading from local storage:', error);
    return null;
  }
};

export const mergeWithDefaults = (saved) => {
  const defaults = getDefaultCharacterData();
  if (!saved) return defaults;
  const merged = { ...defaults, ...saved };
  merged.attributes = { ...defaults.attributes, ...(saved.attributes || {}) };
  merged.skills = { ...defaults.skills, ...(saved.skills || {}) };
  merged.arcanaValues = { ...defaults.arcanaValues, ...(saved.arcanaValues || {}) };
  if (!Array.isArray(merged.majorArcana)) merged.majorArcana = [];
  if (!Array.isArray(merged.roteSkills)) merged.roteSkills = [];
  if (!Array.isArray(merged.healthTrack)) merged.healthTrack = [];
  if (!Array.isArray(merged.tiltsAndConditions)) merged.tiltsAndConditions = [];
  if (!Array.isArray(merged.merits)) merged.merits = [];
  if (!Array.isArray(merged.mundaneItems)) merged.mundaneItems = [];
  if (!Array.isArray(merged.combatItems)) merged.combatItems = [];
  if (!Array.isArray(merged.enchantedItems)) merged.enchantedItems = [];
  if (!Array.isArray(merged.yantraItems)) merged.yantraItems = [];
  if (!Array.isArray(merged.aspirations)) merged.aspirations = [];
  if (!Array.isArray(merged.obsessions)) merged.obsessions = [];
  if (!merged.nimbus || typeof merged.nimbus !== 'object') merged.nimbus = { ...defaults.nimbus };
  if (!merged.nimbus.effectedStats) merged.nimbus.effectedStats = { ...defaults.nimbus.effectedStats };
  if (!Array.isArray(merged.arcanaAttainments)) merged.arcanaAttainments = [];
  if (!Array.isArray(merged.legacyAttainments)) merged.legacyAttainments = [];
  if (!Array.isArray(merged.activeSpells)) merged.activeSpells = [];
  if (!Array.isArray(merged.inuredSpells)) merged.inuredSpells = [];
  if (!Array.isArray(merged.userSpells)) merged.userSpells = [];
  return merged;
};
