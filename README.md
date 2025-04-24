# [Grimoire.VIP](https://grimoire.vip)

![Grimoire](/public/logo512.png)

## 🔮 Spellcasting Assistant for Mage: The Awakening 2e

Grimoire.VIP is an interactive web application for the Chronicles of Darkness game "Mage: The Awakening", 2nd Edition more specifically. This tool is intended to help players and Storytellers quickly customize and cast spells according to the game's magic system.

## ✨ Features

### Character Management
- **Gnosis Tracking**: Set your character's Gnosis rating (1-10) to determine your base spellcasting ability
- **Arcana Allocation**: Manage your character's proficiency in the ten Arcana (Death, Fate, Forces, Life, Matter, Mind, Prime, Spirit, Space, and Time)
- **Persistent Character Data**: Your character data is automatically saved to local storage, ensuring you never lose your configurations

### Spellbook Management
- **Spell Library**: Browse a comprehensive database of spells organized by Arcana
- **Personalized Spellbook**: Create and maintain your character's unique collection of spells
- **Casting Types**: Choose whether to cast spells as improvised, rote, or praxis
- **Advanced Search**: Find spells by name, description, or other attributes

### Spell Customization
- **Reach Management**: Customize spells with various Reaches to alter their effects
- **Cost Calculation**: Automatically calculate Mana costs and dice penalties from Reaches
- **Yantra Integration**: Add bonuses from Yantras to improve your casting chances

### Spellcasting System
- **Dynamic Dice Pool**: Calculate your total dice pool based on Arcana, Gnosis, casting type, and modifiers
- **Real-time Results**: Roll your dice virtually and see your successes instantly
- **Effects Summary**: View clear descriptions of your spell's results and effects

When you reload the application, this data is automatically loaded, allowing you to continue where you left off.

## 📋 Installation and Setup

### Prerequisites
- Node.js (v14.0.0 or higher)
- npm (v6.0.0 or higher)

### Installation Steps
1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/grimoire.git
   cd grimoire
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

### Building for Production
To create an optimized production build:
```bash
npm run build
```

The build files will be available in the `build` directory, ready for deployment to a static web server.

## 🎮 Usage Guide

### Getting Started
1. **Set Character Stats**: Begin by setting your character's Gnosis and allocating dots to your Arcana (plus to add, and click arcana dot to remove)
2. **Build Your Spellbook**: Add spells to your personal spellbook by clicking "Add" and browsing the spell library
3. **Select a Spell**: Choose a spell from your spellbook to prepare for casting
4. **Customize Your Spell**: Add Reaches and Yantras to modify your spell as desired
5. **Cast Your Spell**: Click "Cast Spell!" to roll your dice and see the results

## 🧙‍♂️ For Game Masters

Grimoire can significantly speed up play at your table by:
- Eliminating the need to reference rulebooks for spell details
- Providing instant dice pool calculations
- Giving players a clear understanding of their magical capabilities
- Reducing errors in complex spell modifications

Consider having players prepare their commonly used spells in advance of gameplay sessions for maximum efficiency.

## 🛠️ Customization

### Adding New Spells
The spell database can be extended by adding new entries to the `spells.json` file:

```javascript
{
  "name": "Your New Spell",
  "path": "Arcanum Name",
  "tier": "Initiate",  // or Apprentice, Disciple, Adept, Master
  "secondary": null,    // or "Arcanum •••" if requires a secondary Arcanum
  "practice": "Compelling",
  "primaryFactor": "Duration",
  "withstand": null,
  "skills": [
    "Skill1",
    "Skill2",
    "Skill3"
  ],
  "description": "Description of your spell effect",
  "reaches": [
    {
      "level": 1,
      "effect": "Description of reach effect"
    }
  ],
  "source": "Book Abbreviation p123"
}
```

### Styling
The application uses TailwindCSS for styling. Custom styles can be added in the `index.css` file.

## 🤝 Contributing

Contributions to Grimoire.VIP are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature-name`
5. Open a Pull Request

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgements

- Onyx Path Publishing for creating Mage: The Awakening
- The Chronicles of Darkness community for their support and inspiration
- All contributors who have invested their time and expertise in this project
- Please note this is just a project and its pretty messy at that so don't expect much!

---

*Disclaimer: Grimoire is a fan-made tool and is not affiliated with or endorsed by Onyx Path Publishing or White Wolf Publishing. Mage: The Awakening and all related properties are trademarks of their respective owners.*