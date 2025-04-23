const STORAGE_KEY = 'mage-spell-caster-data';

// Save all character data to local storage
export const saveCharacterData = (data) => {
  try {
    const serializedData = JSON.stringify(data);
    localStorage.setItem(STORAGE_KEY, serializedData);
    console.log('Data saved to local storage:', data);
    return true;
  } catch (error) {
    console.error('Error saving to local storage:', error);
    return false;
  }
};

// Load character data from local storage
export const loadCharacterData = () => {
  try {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (!savedData) {
      console.log('No saved data found in local storage');
      return null;
    }
    
    const parsedData = JSON.parse(savedData);
    console.log('Data loaded from local storage:', parsedData);
    return parsedData;
  } catch (error) {
    console.error('Error loading from local storage:', error);
    return null;
  }
};

// Get default character data (for new users)
export const getDefaultCharacterData = () => {
  return {
    gnosis: 1,
    arcanaValues: {
      death: 0,
      fate: 0,
      forces: 0,
      life: 0,
      matter: 0,
      mind: 0,
      prime: 0,
      spirit: 0,
      space: 0,
      time: 0
    },
    userSpells: [],
    yantras: 0,
    majorArcana: [] // Default empty array for major Arcana
  };
};