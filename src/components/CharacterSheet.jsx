import React, { useState } from 'react';
import CharacterInfoBar from './character/CharacterInfoBar';
import DerivedStatsBar from './character/DerivedStatsBar';
import AttributesSection from './character/AttributesSection';
import ArcanaSection from './character/ArcanaSection';
import SkillsSection from './character/SkillsSection';
import WisdomTrack from './character/WisdomTrack';
import CombatStatsRow from './character/CombatStatsRow';
import ActionsTab from './character/tabs/ActionsTab';
import MeritsTab from './character/tabs/MeritsTab';
import ItemsTab from './character/tabs/ItemsTab';
import GoalsTab from './character/tabs/GoalsTab';
import NimbusTab from './character/tabs/NimbusTab';
import AttainmentsTab from './character/tabs/AttainmentsTab';
import ExtrasTab from './character/tabs/ExtrasTab';

const TABS = ['Actions', 'Items', 'Merits', 'Goals', 'Attainments', 'Nimbus', 'Extras'];

const CharacterSheet = ({ char, updateChar, onNavigate }) => {
  const [activeTab, setActiveTab] = useState('Actions');

  const setAttributes = (attrs) => updateChar({ attributes: attrs });
  const setArcanaValues = (vals) => updateChar({ arcanaValues: vals });
  const setMajorArcana = (vals) => updateChar({ majorArcana: vals });

  const onSkillChange = (key, value) => {
    updateChar({ skills: { ...char.skills, [key]: Math.max(0, Math.min(10, value)) } });
  };

  const onToggleRote = (key) => {
    const current = char.roteSkills || [];
    if (current.includes(key)) {
      updateChar({ roteSkills: current.filter((k) => k !== key) });
    } else {
      updateChar({ roteSkills: [...current, key] });
    }
  };

  const updateNimbus = (nimbus) => updateChar({ nimbus });

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fadeIn">
      {/* Top bar: info + derived stats */}
      <div className="flex flex-wrap gap-3 items-start">
        <CharacterInfoBar char={char} updateChar={updateChar} />
        <div className="flex-1 min-w-0">
          <DerivedStatsBar char={char} updateChar={updateChar} />
        </div>
      </div>

      {/* Attributes */}
      <AttributesSection attributes={char.attributes} onChange={setAttributes} />

      {/* Main two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] gap-6">
        {/* Left column — narrower */}
        <div className="space-y-4">
          <ArcanaSection
            arcanaValues={char.arcanaValues}
            setArcanaValues={setArcanaValues}
            majorArcana={char.majorArcana}
            setMajorArcana={setMajorArcana}
          />
          <SkillsSection
            skills={char.skills}
            roteSkills={char.roteSkills || []}
            onSkillChange={onSkillChange}
            onToggleRote={onToggleRote}
          />
        </div>

        {/* Right column — wider */}
        <div className="space-y-4">
          <WisdomTrack
            wisdom={char.wisdom ?? 7}
            onChange={(v) => updateChar({ wisdom: v })}
          />
          <CombatStatsRow char={char} updateChar={updateChar} />

          {/* Tabbed section */}
          <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
            <div className="flex border-b border-slate-700 overflow-x-auto">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors ${
                    activeTab === tab
                      ? 'text-white border-b-2 border-indigo-500 bg-slate-800'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="p-4">
              {activeTab === 'Actions' && <ActionsTab char={char} updateChar={updateChar} onNavigate={onNavigate} />}
              {activeTab === 'Items' && (
                <ItemsTab
                  mundaneItems={char.mundaneItems || []}
                  combatItems={char.combatItems || []}
                  enchantedItems={char.enchantedItems || []}
                  yantraItems={char.yantraItems || []}
                  onChangeMundane={(v) => updateChar({ mundaneItems: v })}
                  onChangeCombat={(v) => updateChar({ combatItems: v })}
                  onChangeEnchanted={(v) => updateChar({ enchantedItems: v })}
                  onChangeYantras={(v) => updateChar({ yantraItems: v })}
                />
              )}
              {activeTab === 'Merits' && (
                <MeritsTab merits={char.merits || []} onChange={(v) => updateChar({ merits: v })} />
              )}
              {activeTab === 'Goals' && (
                <GoalsTab
                  aspirations={char.aspirations || []}
                  obsessions={char.obsessions || []}
                  gnosis={char.gnosis}
                  onChangeAspirations={(v) => updateChar({ aspirations: v })}
                  onChangeObsessions={(v) => updateChar({ obsessions: v })}
                />
              )}
              {activeTab === 'Attainments' && (
                <AttainmentsTab
                  arcanaAttainments={char.arcanaAttainments || []}
                  legacyAttainments={char.legacyAttainments || []}
                  onChangeArcana={(v) => updateChar({ arcanaAttainments: v })}
                  onChangeLegacy={(v) => updateChar({ legacyAttainments: v })}
                />
              )}
              {activeTab === 'Nimbus' && (
                <NimbusTab nimbus={char.nimbus || {}} onChange={updateNimbus} />
              )}
              {activeTab === 'Extras' && (
                <ExtrasTab value={char.extras || ''} onChange={(v) => updateChar({ extras: v })} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CharacterSheet;
