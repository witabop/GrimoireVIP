
export const DEFAULT_REACHES = [
    { name: 'Casting Time: Instant', cost: 1, category: 'Casting', description: 'Cast your spell as an instant action' },
    { name: 'Duration: One scene/hour', cost: 1, category: 'Duration', description: 'Extend the spell to last for one scene or hour' },
    { name: 'Range: Sensory', cost: 1, category: 'Range', description: 'Extend the range to anything you can perceive' },
    { name: 'Additional Active', cost: 1, category: 'General', description: 'Maintain an additional spell active simultaneously' },
    
    { name: 'Duration: One day', cost: 1, category: 'Duration', dicePenalty: 2, description: 'Extend spell duration to last for one day' },
    { name: 'Duration: One week', cost: 1, category: 'Duration', dicePenalty: 4, description: 'Extend spell duration to last for one week' },
    { name: 'Duration: One month', cost: 1, category: 'Duration', dicePenalty: 6, description: 'Extend spell duration to last for one month' },
    { name: 'Duration: One year', cost: 1, category: 'Duration', dicePenalty: 8, description: 'Extend spell duration to last for one year' },
    { name: 'Duration: Indefinite', cost: 2, category: 'Duration', manaCost: 1, dicePenalty: 10, description: 'Extend spell duration indefinitely' },
    
    { name: 'Scale: Large building, 5 subjects', cost: 1, category: 'Scale', description: 'Affect an area the size of a large building or up to 5 subjects' },
    { name: 'Scale: Small warehouse, 10 subjects', cost: 1, category: 'Scale', dicePenalty: 2, description: 'Affect an area the size of a small warehouse or up to 10 subjects' },
    { name: 'Scale: Supermarket, 20 subjects', cost: 1, category: 'Scale', dicePenalty: 4, description: 'Affect an area the size of a supermarket or up to 20 subjects' },
    { name: 'Scale: Shopping mall, 40 subjects', cost: 1, category: 'Scale', dicePenalty: 6, description: 'Affect an area the size of a shopping mall or up to 40 subjects' },
    { name: 'Scale: City block, 80 subjects', cost: 1, category: 'Scale', dicePenalty: 8, description: 'Affect an area the size of a city block or up to 80 subjects' },
    { name: 'Scale: Small neighborhood, 160 subjects', cost: 1, category: 'Scale', dicePenalty: 10, description: 'Affect an area the size of a small neighborhood or up to 160 subjects' }
  ];