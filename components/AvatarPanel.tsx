import React, { useState } from 'react';
import type { CustomCharacter, InventoryItem } from '../types';
import { UserCircleIcon, WandIcon, XIcon } from './icons';

interface AvatarPanelProps {
  character: CustomCharacter | null;
  allowCustomization: boolean;
  customizationReason: string;
  onEditAppearance: () => void;
  onUnequip: (item: InventoryItem) => void;
}

const AvatarPanel: React.FC<AvatarPanelProps> = ({ character, allowCustomization, customizationReason, onEditAppearance, onUnequip }) => {
    const [showTooltip, setShowTooltip] = useState(false);

    const handleButtonClick = () => {
        if (allowCustomization) {
            onEditAppearance();
        } else {
            setShowTooltip(true);
            setTimeout(() => setShowTooltip(false), 3000); // Hide after 3 seconds
        }
    };
    
    const equipmentSlots: (keyof Required<CustomCharacter>['equippedItems'])[] = ['head', 'torso', 'accessory'];

    return (
        <div className="p-4 text-white">
            <div className="text-center">
                <div className="relative w-32 h-32 rounded-full bg-stone-800 flex-shrink-0 overflow-hidden ring-2 ring-white/20 mx-auto">
                    {character?.portraitUrl ? (
                        <img src={character.portraitUrl} alt={character.name || 'Your character'} className="w-full h-full object-cover" />
                    ) : (
                        <UserCircleIcon className="w-full h-full text-stone-600" />
                    )}
                </div>
                <div className="mt-4">
                    <h3 className="text-2xl font-bold font-heading">{character?.name || 'Wanderer'}</h3>
                    <p className="text-stone-400">{character?.pronouns}</p>
                </div>
            </div>
            
            <div className="mt-4 text-left text-sm space-y-2 p-4 bg-stone-800/50 rounded-lg border border-stone-700/50">
                {character?.age && (
                    <div>
                        <span className="font-semibold text-stone-400">Age: </span>
                        <span className="text-stone-200">{character.age}</span>
                    </div>
                )}
                {character?.height && (
                    <div>
                        <span className="font-semibold text-stone-400">Height: </span>
                        <span className="text-stone-200">{character.height}</span>
                    </div>
                )}
                {character?.appearanceSummary && (
                    <div>
                        <p className="font-semibold text-stone-400 mb-1">Appearance:</p>
                        <p className="text-stone-300 italic">{character.appearanceSummary}</p>
                    </div>
                )}
            </div>

            <div className="mt-6">
                 <button
                    onClick={handleButtonClick}
                    className={`w-full flex items-center justify-center gap-2 font-semibold p-3 rounded-lg transition-colors duration-200 relative ${allowCustomization ? 'bg-accent hover:bg-accent-hover' : 'bg-stone-700 text-stone-400 cursor-not-allowed'}`}
                    aria-disabled={!allowCustomization}
                 >
                    <WandIcon className="w-5 h-5" />
                    Edit Appearance
                    {showTooltip && !allowCustomization && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs bg-stone-800 text-white text-xs rounded-lg py-2 px-3 shadow-lg animate-fade-in" role="tooltip">
                            You need to find an opportunity in the story to change your appearance.
                        </div>
                    )}
                </button>
                {allowCustomization && (
                    <p className="text-xs text-accent-text mt-2 animate-fade-in">{customizationReason}</p>
                )}
            </div>
            
            <div className="mt-6 text-left">
                <h4 className="font-semibold text-white mb-3 text-base">Equipment</h4>
                <div className="space-y-2">
                    {equipmentSlots.map(slot => {
                        const item = character?.equippedItems?.[slot];
                        return (
                             <div key={slot} className="flex items-center justify-between p-2 bg-stone-800/50 rounded-md">
                                <div>
                                    <p className="text-xs text-stone-400 capitalize">{slot}</p>
                                    <p className={`font-semibold ${item ? 'text-white' : 'text-stone-500 italic'}`}>{item?.name ?? 'Empty'}</p>
                                </div>
                                {item && (
                                    <button onClick={() => onUnequip(item)} className="p-2 rounded-full text-stone-400 hover:bg-red-500/20 hover:text-red-300 transition-colors">
                                        <XIcon className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    );
};

export default AvatarPanel;