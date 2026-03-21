# [Grimoire.VIP](https://grimoire.vip)

![Grimoire](/public/grimoireviprepoimage.jpg)

## Mage: The Awakening 2e Character Manager and Spellcasting Assistant

Grimoire.VIP is a comprehensive web-based character manager and spellcasting tool for Mage: The Awakening, Second Edition (Chronicles of Darkness). It handles the full complexity of the game's magic system: dice pool calculations, Reach and Mana costs, ritual timing, combined spellcasting, and more so players can focus on the story instead of the arithmetic as well as having to manage multiple tools at once. It also serves as a complete digital character sheet, tracking attributes, skills, merits, items, combat stats, and everything else a Mage player needs at the table.

All character data persists automatically in the browser's local storage, and can be exported to or imported from JSON for backup and sharing.

---

## Features

### Character Identity

A clickable info card in the top corner displays your shadow name, path, Gnosis, and experience totals at a glance. Clicking it opens a detailed form where you can set:

- Shadow Name, Player Name, Concept, Chronicle
- Gnosis (1--10)
- Path (Acanthus, Mastigos, Moros, Thyrsus, Obrimos)
- Order (Adamantine Arrow, Guardians of the Veil, Mysterium, Silver Ladder, Free Council, Seers of the Throne, and others)
- Legacy
- Virtue and Vice (selected from canonical lists)
- Arcane Experiences, Arcane Beats, Experiences, Beats

### Derived Stats

Displayed alongside the identity card. Each stat is computed from attributes by default but can be overridden manually.

- **Speed** -- Dexterity + Strength + 5
- **Health** -- Stamina + Size (Size is always 5). Displayed as two rows of dots: the top row shows maximum health, and the bottom row is an interactive damage track where each dot cycles through empty, bashing (/), lethal (x), and aggravated (*) on click.
- **Willpower** -- Resolve + Composure. Top row shows maximum dots, bottom row tracks current willpower (click to spend or recover).
- **Mana** -- Direct numeric input.

### Attributes

Nine attributes organized in three columns (Mental, Physical, Social), each adjustable from 1 to 10. These values feed into derived stats, combat calculations, and dice pools throughout the application.

### Arcana

All ten Arcana (Death, Fate, Forces, Life, Matter, Mind, Prime, Space, Spirit, Time) with dot ratings from 0 to 5. Up to three Arcana can be marked as Major. The dot controls match the tabletop convention: click the plus button to add a dot, click an existing dot to remove it.

### Skills

Twenty-four skills grouped under Mental, Physical, and Social, each adjustable from 0 to 10. Any skill can be flagged as a Rote Skill with a toggle button, which is relevant for Rote spellcasting and the Mudra yantra.

### Wisdom

A track of ten dots, defaulting to 7. Decrease or increase freely. If Wisdom reaches 0, a "breaking point" warning is displayed.

### Combat Stats

Three side-by-side boxes below Wisdom:

- **Initiative** -- Dexterity + Composure, with override.
- **Defense / Armor** -- Defense is the lower of Dexterity or Wits, plus Athletics. Armor defaults to 0. Both can be overridden.
- **Tilts and Conditions** -- A freeform list. Click to open a popup, type an entry, press Enter to add it. Hover any entry to reveal a delete button.

### Actions Tab

A searchable list of common Mage actions, each with a description and (where applicable) a rollable dice pool calculated from your character's stats:

- **Cast Spell** -- Navigates to the spellcasting page.
- **Cancel Spell** -- Lists your active spells with a button to cancel each one.
- **Mage Armor** -- Lists all Arcana-based armors filtered to those you actually know, with their full mechanical effects.
- **Attack** -- Unarmed (Strength + Brawl), Melee (Strength + Weaponry), Ranged (Dexterity + Firearms), and Thrown (Dexterity + Athletics). Each attack type is rollable with an adjustable modifier and supports specified targeting (Arm, Leg, Head, Hand) with the correct dice penalties and Tilt effects.
- **Dodge** -- Shows your doubled Defense pool.
- **Grapple** -- Strength + Brawl minus Defense, with a full list of grapple moves.
- **Aiming** -- +1 to +3 bonus dice over consecutive turns.
- **Movement** -- Speed and Dash values.
- **Going Prone** -- Penalties and bonuses.
- **Active Mage Sight** -- Clash of Wills roller (Gnosis + selected Arcanum).
- **Focused Mage Sight** -- Revelation (Gnosis + Arcanum minus Opacity) and Scrutiny (Gnosis + Arcanum) as separate rollable sections with adjustable Opacity.
- **Teamwork** -- Both mundane teamwork (custom dice pool) and spellcasting teamwork (Gnosis + Arcanum for qualified casters, Gnosis minus 3 otherwise). Each is independently rollable.

### Items Tab

Four subtabs for managing gear:

- **Mundane** -- Simple named entries.
- **Combat** -- Weapons with Damage, Range, Clip, Initiative, Strength, and Size fields.
- **Enchanted** -- Items with Power (text), Dice Pool, and Mana fields.
- **Yantras** -- Simple named entries for tracking your yantra tools.

### Merits Tab

Add merits by name with a dot rating from 1 to 10. Delete by hovering and clicking the trash icon.

### Goals Tab

- **Aspirations** -- Unlimited freeform entries.
- **Obsessions** -- Capped by Gnosis (1 at Gnosis 1--2, 2 at 3--5, 3 at 6--8, 4 at 9--10).

### Attainments Tab

- **Arcana Attainments** -- Unlimited entries.
- **Legacy Attainments** -- Capped at 5.

### Nimbus Tab

Text fields for Long-Term, Immediate, Signature, and Peripheral Mage Sight nimbus descriptions. An "Effected Stats" grid lets you assign a 0--10 modifier to each of the nine attributes.

### Extras Tab

A large freeform text area for session notes, backstory, or anything else you want to keep with your character.

---

### Spellbook

Your personal collection of spells, displayed in the left column of the spellcasting view. Spells can be added from a searchable library of the full canonical spell list, removed, reordered by drag-and-drop, and searched by name. Each entry shows the spell's name, Arcanum, level (in dot notation), casting type (Improvised, Rote, or Praxis), and practice.

### Spell Combining

Select multiple spells with Ctrl/Cmd-click and merge them into a combined spell. The number of component spells is limited by Gnosis. Rotes cannot be combined. The combined spell uses the lowest Arcanum rating and applies a -2 dice penalty per additional component spell.

### Spell Customization

After selecting a spell, the customization panel provides:

- **Reach Selection** -- Toggle special and standard Reaches. Duration options respect your primary factor and show whether they're free or penalized. Mana costs and dice penalties are displayed inline.
- **Potency Boost** -- Increase potency by up to 5, at a cost of -2 dice per level.
- **Yantra Modifier** -- Enter your total yantra dice bonus. An info panel shows your Gnosis-based yantra limit.
- **Ritual Boost** -- Add up to +5 dice by extending casting time. The ritual interval and total casting duration are calculated from your Gnosis.
- **Additional Modifiers** -- Fine-tune the dice pool, Reach count, and Mana cost with +/- controls.

### Casting Summary

Displays the final dice pool with a clickable breakdown showing every modifier (Gnosis, Arcanum, yantras, ritual boost, Reach penalty, potency boost penalty, combined spell penalty, active spell Reach cost, and manual adjustments). Warns when overreaching, when casting is impossible (pool at -6 or below), and when casting an inured spell (base Paradox of 2 dice). Roll options include 8-Again and 9-Again. The Cast Spell button is disabled when casting is impossible.

### Spell Results

After casting, the results panel shows the rolled dice (color-coded by success), total successes, effective potency, and all selected Reaches with descriptions. Chance die rolls are handled correctly, including dramatic failure on a 1. From this panel you can add the spell to your Active Spells or Inured Spells lists.

### Active Spells

Displayed in the left column of the spellcasting view. Each entry shows the spell name, casting type, potency, and an expandable list of Reach effects. A mage can maintain active spells up to their Gnosis; additional active spells impose escalating Reach costs that are automatically factored into new castings.

### Inured Spells

Also in the left column, below Active Spells. Inured spells are capped at Gnosis. Casting a spell that has been inured triggers a warning about the base 2-dice Paradox risk.

### Session Cast Log

A log button in the top-right corner of the spellcasting view opens a scrollable panel showing every spell cast during the current session, in reverse chronological order. Each entry includes the spell name, timestamp, dice pool, potency (with ritual boost), successes, Mana cost, individual die results, Reach count (with overreach indicator), and a full dice pool breakdown. A copy button formats the entry as readable plain text for sharing with your Storyteller.

### Dice Roller

A floating button in the bottom-left corner of both views. Opens a small popup where you can enter any dice pool, roll, and see results with success counting. Pools of 0 or less roll a chance die, with dramatic failure on a 1.

### Import and Export

Buttons next to the navigation tabs let you export your entire character (including spellbook, active spells, and all settings) as a JSON file, or import a previously exported file. Imported data is merged with the default character structure so that missing fields are safely initialized.

### Navigation

A simple button bar switches between the Character Sheet and Spellcasting views. All character data is shared between the two views and persists automatically.

---

## Installation

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Setup

```bash
git clone https://github.com/yourusername/grimoire.git
cd grimoire
npm install
npm start
```

The development server will open at `http://localhost:3000`.

### Production Build

```bash
npm run build
```

The optimized output is written to the `build` directory, ready for deployment to any static hosting service.

---

## Customizing the Spell Database

Spells are stored in `src/data/spells.json`. To add a new spell, append an entry following this structure:

```json
{
  "name": "Spell Name",
  "path": "Arcanum Name",
  "tier": "Initiate",
  "secondary": null,
  "practice": "Compelling",
  "primaryFactor": "Duration",
  "withstand": null,
  "mana": 0,
  "skills": ["Skill1", "Skill2"],
  "description": "What the spell does.",
  "reaches": [
    { "level": 1, "effect": "What this Reach adds." }
  ],
  "source": "MtAw2e p123"
}
```

The optional `mana` field sets a base Mana cost that is always charged when casting the spell (used for spells like Acceleration or Incognito Presence). Omit it or set it to 0 for spells with no inherent Mana cost.

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature-name`
5. Open a Pull Request

---

## License

This project is licensed under the MIT License. See the LICENSE file for details.

---

*Grimoire.VIP is a fan-made tool and is not affiliated with or endorsed by Onyx Path Publishing or White Wolf Publishing. Mage: The Awakening and all related properties are trademarks of their respective owners.*
