export const processSpellData = (spellsJson) => {
  return spellsJson.map(spell => {
    // Map tier to numerical level
    const tierMapping = {
      'Initiate': 1,
      'Apprentice': 2,
      'Disciple': 3,
      'Adept': 4,
      'Master': 5
    };

    const level = tierMapping[spell.tier] || 1;

    // Map reaches to a consistent format
    const specialReaches = spell.reaches ? spell.reaches.map(reach => ({
      name: `${spell.name}: ${reach.effect}`,
      cost: reach.level,
      description: reach.effect,
      // Mana cost is explicit per-reach. A reach only costs Mana when it says
      // so; an absent field means no Mana cost (avoids keyword false positives).
      manaCost: typeof reach.mana === 'number' ? reach.mana : 0
    })) : [];

    return {
      name: spell.name,
      arcanum: spell.path.toLowerCase(),
      level,
      description: spell.description,
      short_description: spell.short_description,
      practice: spell.practice,
      primaryFactor: spell.primaryFactor,
      withstand: spell.withstand,
      skills: spell.skills || [],
      specialReaches,
      source: spell.source,
      ...(typeof spell.mana === 'number' ? { mana: spell.mana } : {})
    };
  });
};