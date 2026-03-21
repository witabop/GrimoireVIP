/** Stable ids for Actions tab rows — order in array is the default presentation order. */
export const DEFAULT_ACTIONS_TAB_ORDER = [
  'castSpell',
  'cancelSpell',
  'counterspell',
  'attack',
  'grapple',
  'scourPattern',
  'dodge',
  'aiming',
  'reloading',
  'movement',
  'jumping',
  'goingProne',
  'mageArmor',
  'activeMageSight',
  'focusedMageSight',
  'teamwork',
];

/** Substrings used for the Actions tab search box (must match prior behavior). */
export const ACTION_TAB_SEARCH = {
  castSpell: 'Cast Spell',
  cancelSpell: 'Cancel Spell',
  counterspell: 'Counterspell',
  attack: 'Attack',
  grapple: 'Grapple',
  scourPattern: 'Scour Pattern',
  dodge: 'Dodge',
  aiming: 'Aiming',
  reloading: 'Reloading',
  movement: 'Movement',
  jumping: 'Jumping',
  goingProne: 'Going Prone',
  mageArmor: 'Mage Armor',
  activeMageSight: 'Active Mage Sight',
  focusedMageSight: 'Focused Mage Sight',
  teamwork: 'Teamwork',
};

const allowed = new Set(DEFAULT_ACTIONS_TAB_ORDER);

/**
 * Merge saved order with defaults: unknown ids dropped, new actions appended in default order.
 */
export function normalizeActionsTabOrder(saved) {
  const result = [];
  const seen = new Set();
  if (Array.isArray(saved)) {
    for (const id of saved) {
      if (allowed.has(id) && !seen.has(id)) {
        result.push(id);
        seen.add(id);
      }
    }
  }
  for (const id of DEFAULT_ACTIONS_TAB_ORDER) {
    if (!seen.has(id)) result.push(id);
  }
  return result;
}
