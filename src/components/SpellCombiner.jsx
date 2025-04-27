import React, { useState } from 'react';
import { DEFAULT_REACHES } from '../data/reachesData';

const SpellCombiner = ({
    selectedSpells,
    closeSpellCombiner,
    addCombinedSpell,
    arcanaValues,
    gnosis
}) => {
    const [combinedSpellName, setCombinedSpellName] = useState('');
    const [animateIn, setAnimateIn] = useState(true);

    // Calculate max spells that can be combined based on Gnosis
    const maxCombinedSpells =
        gnosis >= 9 ? 4 :
            gnosis >= 6 ? 3 :
                gnosis >= 3 ? 2 : 1;

    // Check if the current combination is valid
    const isValidCombination = selectedSpells.length > 1 &&
        selectedSpells.length <= maxCombinedSpells &&
        combinedSpellName.trim() !== '';

    // Check if all spells are rotes (rotes cannot be combined)
    const anyRotes = selectedSpells.some(spell => spell.castingType === 'rote');

    // Check if all spells are praxes (needed for praxis combined spell)
    const allPraxes = selectedSpells.every(spell => spell.castingType === 'praxis');

    // Get the lowest Arcanum among all selected spells
    const getLowestArcanum = () => {
        if (selectedSpells.length === 0) return null;

        return selectedSpells.reduce((lowest, spell) => {
            const currentSpellArcanaValue = parseInt(spell.level);
            return currentSpellArcanaValue < lowest.value ?
                { name: spell.arcanum, value: currentSpellArcanaValue } :
                lowest;
        }, { name: selectedSpells[0].arcanum, value: parseInt(selectedSpells[0].level) });
    };

    // Calculate dice penalty for additional spells
    const additionalSpellPenalty = (selectedSpells.length - 1) * 2;

    // Get the lowest Arcanum info
    const lowestArcanum = getLowestArcanum();

    // Handle spell combination
    const handleMergeSpells = () => {
        if (!isValidCombination || anyRotes) return;

        // Determine the lowest arcanum value (the actual dots the mage has in that arcanum)
        const lowestArcanumSpell = selectedSpells.reduce((lowest, current) => {
            const currentArcanumValue = arcanaValues[current.arcanum.toLowerCase()] || 0;
            const lowestValue = lowest ? arcanaValues[lowest.arcanum.toLowerCase()] || 0 : Infinity;
            return currentArcanumValue < lowestValue ? current : lowest;
        }, null);

        // Use the arcanum with lowest value, not the lowest level spell
        const lowestArcanum = {
            name: lowestArcanumSpell.arcanum,
            value: arcanaValues[lowestArcanumSpell.arcanum.toLowerCase()] || 0
        };

        // Create the combined spell
        const combinedSpell = {
            name: combinedSpellName,
            arcanum: selectedSpells.map(s => s.arcanum).join('/'),
            level: selectedSpells.map(s => s.level).join('/'),
            description: selectedSpells.map(s => s.description).join('\n\n'),
            short_description: `Combined spell: ${selectedSpells.map(s => s.name).join(', ')}`,
            practice: selectedSpells.map(s => s.practice).join('/'),
            primaryFactor: selectedSpells.map(s => s.primaryFactor).join('/'),
            withstand: selectedSpells.some(s => s.withstand) ?
                selectedSpells.filter(s => s.withstand).map(s => s.withstand).join('/') :
                null,
            skills: [...new Set(selectedSpells.flatMap(s => s.skills || []))],
            specialReaches: selectedSpells.flatMap(s => s.specialReaches || []),
            combined: true,
            componentSpells: selectedSpells,
            // If all spells are praxes, the combined spell can be a praxis
            castingType: allPraxes ? 'praxis' : 'improvised',
            additionalPenalty: additionalSpellPenalty,
            lowestArcanum: lowestArcanum  // Store the lowest arcanum by dots, not level
        };

        addCombinedSpell(combinedSpell);
        closeSpellCombiner();
    };

    return (
        <div className={`fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 transition-opacity duration-300 ${animateIn ? 'opacity-100' : 'opacity-0'}`}>
            <div className={`p-4 rounded-lg border border-slate-400 bg-slate-800 rounded-xl shadow-2xl transform transition-all duration-500 max-w-2xl w-full ${animateIn ? 'scale-100' : 'scale-95'}`} style={{ maxHeight: '90vh', overflowY: 'auto', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                {/* Header */}
                <div className="mb-4 border-b border-slate-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold flex items-center">
                        <i className="fas fa-magic mr-3 text-indigo-400"></i> Combine Spells
                    </h2>
                    <button
                        onClick={() => {
                            setAnimateIn(false);
                            setTimeout(closeSpellCombiner, 300);
                        }}
                        className="text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-700 transition-all"
                        aria-label="Close spell combiner"
                        style={{ marginLeft: 'auto' }}
                    >
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                {/* Content */}
                <div className="p-5">
                    {/* Gnosis Warning */}
                    {selectedSpells.length > maxCombinedSpells && (
                        <div className="mb-5 bg-red-900 bg-opacity-30 p-3 rounded-lg border border-red-900 animate-pulse-subtle">
                            <i className="fas fa-exclamation-circle mr-2"></i>
                            <strong>Gnosis Limit Exceeded:</strong> Your current Gnosis ({gnosis}) allows combining up to {maxCombinedSpells} spells. Please remove some spells.
                        </div>
                    )}

                    {/* Rote Warning */}
                    {anyRotes && (
                        <div className="mb-5 bg-red-900 bg-opacity-30 p-3 rounded-lg border border-red-900">
                            <i className="fas fa-exclamation-triangle mr-2"></i>
                            <strong>Rotes Cannot be Combined:</strong> Rote spells cannot be used in combined spells. Please remove any rote spells from your selection.
                        </div>
                    )}

                    {/* Praxis Note */}
                    {!anyRotes && selectedSpells.some(spell => spell.castingType === 'praxis') && !allPraxes && (
                        <div className="mb-5 bg-yellow-900 bg-opacity-30 p-3 rounded-lg border border-yellow-900">
                            <i className="fas fa-info-circle mr-2"></i>
                            <strong>Praxis Combination:</strong> You can only combine Praxes if all selected spells are Praxes. Your combination will be cast as an improvised spell.
                        </div>
                    )}

                    {/* Spell Name Input */}
                    <div className="mb-4">
                        <label className="block mb-2 font-medium">
                            <i className="fas fa-signature mr-2 text-indigo-400 mb-4"></i>
                            Name Your Combined Spell
                        </label>
                        <input
                            type="text"
                            value={combinedSpellName}
                            onChange={(e) => setCombinedSpellName(e.target.value)}
                            placeholder="Super cool spell name..."
                            className="w-full bg-slate-700 text-indigo-400 border border-slate-600 rounded-lg p-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 focus:outline-none transition-all"
                        />
                    </div>

                    {/* Spell Casting Info */}
                    <div className="mb-4 bg-slate-700 p-4 rounded-lg">
                        <h3 className="font-bold mb-3 text-indigo-300">Casting Information</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="bg-slate-800 p-3 rounded-lg">
                                <span className="text-slate-400 block mb-1">Base Dice Pool:</span>
                                <span className="text-white font-medium">
                                    {lowestArcanum ? `Gnosis + ${lowestArcanum.name} ${lowestArcanum.value}` : 'N/A'}
                                </span>
                            </div>
                            <div className="bg-slate-800 p-3 rounded-lg">
                                <span className="text-slate-400 block mb-1">Penalty:</span>
                                <span className="text-red-300 font-medium">-{additionalSpellPenalty}</span>
                            </div>
                            <div className="bg-slate-800 p-3 rounded-lg">
                                <span className="text-slate-400 block mb-1">Component Spells:</span>
                                <span className="text-white font-medium">{selectedSpells.length}</span>
                            </div>
                            <div className="bg-slate-800 p-3 rounded-lg">
                                <span className="text-slate-400 block mb-1">Primary Factors:</span>
                                <span className="text-white font-medium">
                                    {selectedSpells.map(s => s.primaryFactor).join(', ')}
                                </span>
                            </div>
                        </div>
                        <div className="text-xs text-slate-400 mt-4" style={{ fontSize: '0.8rem' }}>
                            <i className="fas fa-info-circle mr-1"></i> Combined spells use your Gnosis + lowest Arcanum rating with a penalty of -2 per additional spell.
                        </div>
                    </div>

                    {/* Selected Spells */}
                    <div className="mb-5">
                        <h3 className="font-bold mb-3 text-green-300">Selected Spells</h3>
                        <div className="space-y-3 custom-scrollbar max-h-96">
                            {selectedSpells.map((spell, index) => (
                                <div key={index} className="bg-slate-700 p-3 rounded-lg hover:bg-slate-600 transition-all mb-4">
                                    <div className="flex justify-between items-center">
                                        <div className="font-medium mr-2">{spell.name}</div>
                                        <div className="text-xs" style={{ fontSize: '0.9rem' }}>
                                            {spell.arcanum} <span className="dot-notation">{"•".repeat(spell.level)}</span>
                                        </div>
                                    </div>
                                    <div className="text-sm text-slate-400 mt-1 line-clamp-2">
                                        {spell.short_description}
                                    </div>
                                    <div className="flex mt-2 text-xs">
                                        <span className="bg-indigo-900 text-indigo-300 px-2 py-1 rounded-full mr-2">
                                            {spell.practice}
                                        </span>
                                        <span className="bg-blue-900 text-blue-300 px-2 py-1 rounded-full">
                                            {spell.primaryFactor}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-5 border-t border-slate-700 flex justify-end mt-4">
                    <button
                        onClick={() => {
                            setAnimateIn(false);
                            setTimeout(closeSpellCombiner, 300);
                        }}
                        className="bg-slate-700 hover:bg-slate-600 text-white p-3 rounded-lg mr-3 transition-all"
                        style={{ padding: '10px 15px' }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleMergeSpells}
                        disabled={!isValidCombination}
                        className={`rounded-lg font-medium flex items-center ${isValidCombination
                            ? 'bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer'
                            : 'bg-slate-600 text-slate-400 cursor-not-allowed'
                            }`}
                        style={{ padding: '10px 15px' }}
                    >
                        <i className="fas fa-magic mr-2"></i> Merge Spells
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SpellCombiner;