import React, { useState } from 'react';
import type { InventoryItem } from '../types';
import { AnvilIcon, WandIcon, XIcon, PlusIcon } from './icons';

interface CraftingPanelProps {
  inventory: InventoryItem[];
  onCraftAttempt: (items: InventoryItem[]) => void;
}

const CraftingPanel: React.FC<CraftingPanelProps> = ({ inventory, onCraftAttempt }) => {
    const [slots, setSlots] = useState<(InventoryItem | null)[]>([null, null, null]);

    const handleClearSlots = () => {
        setSlots([null, null, null]);
    };

    const handleCraft = () => {
        const itemsToCraft = slots.filter((item): item is InventoryItem => item !== null);
        if (itemsToCraft.length > 0) {
            onCraftAttempt(itemsToCraft);
            handleClearSlots();
        }
    };
    
    const handleItemClick = (item: InventoryItem) => {
        const firstEmptySlotIndex = slots.findIndex(slot => slot === null);
        if (firstEmptySlotIndex !== -1) {
            const newSlots = [...slots];
            newSlots[firstEmptySlotIndex] = item;
            setSlots(newSlots);
        }
    };

    const handleSlotClick = (index: number) => {
        const newSlots = [...slots];
        newSlots[index] = null;
        setSlots(newSlots);
    };

    const isSlotFilled = (item: InventoryItem) => {
        return slots.some(slot => slot?.name === item.name);
    }
    
    const canCraft = slots.filter(s => s !== null).length >= 2;

    return (
        <div className="p-4 text-neutral-300 space-y-4">
             <div className="flex items-center mb-2">
                <AnvilIcon className="w-6 h-6 mr-3 text-neutral-400" />
                <span className="font-semibold text-white text-lg">Crafting Bench</span>
            </div>
            
            <div className="bg-stone-900/50 border border-stone-700/50 rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-around gap-4">
                    {slots.map((item, index) => (
                        <div key={index} className="flex items-center gap-2">
                            {index > 0 && <PlusIcon className="w-5 h-5 text-stone-600" />}
                            <button 
                                onClick={() => handleSlotClick(index)}
                                className="w-16 h-16 bg-stone-800 border-2 border-dashed border-stone-700 rounded-md flex items-center justify-center text-stone-500 hover:border-accent hover:text-accent transition-colors"
                                disabled={!item}
                                aria-label={item ? `Remove ${item.name}` : `Crafting slot ${index + 1}`}
                            >
                                {item ? <span className="text-xs text-center p-1 text-white truncate">{item.name}</span> : <WandIcon className="w-6 h-6" />}
                            </button>
                        </div>
                    ))}
                </div>

                <div className="flex gap-3">
                     <button 
                        onClick={handleClearSlots}
                        className="w-full flex items-center justify-center gap-2 bg-stone-700/50 text-stone-300 py-2 rounded-md hover:bg-stone-700"
                    >
                       <XIcon className="w-4 h-4" /> Clear
                    </button>
                    <button 
                        onClick={handleCraft}
                        disabled={!canCraft}
                        className="w-full flex items-center justify-center gap-2 bg-accent text-white font-bold py-2 rounded-md hover:bg-accent-hover disabled:bg-stone-800 disabled:text-stone-500 disabled:cursor-not-allowed transition-colors"
                    >
                        <AnvilIcon className="w-5 h-5" /> Craft
                    </button>
                </div>
                <p className="text-xs text-center text-stone-500 italic pt-2 border-t border-stone-800">
                    Hint: Combine materials and see what happens! Try combining a 'Stick' and a 'Rock', or 'Cloth' and 'Alcohol'.
                </p>
            </div>

            <div>
                <h3 className="font-semibold text-white mb-2">Available Materials</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                    {inventory.length > 0 ? (
                        inventory.map((item, index) => {
                             const isUsed = isSlotFilled(item);
                             return (
                                <button 
                                    key={`${item.name}-${index}`}
                                    onClick={() => handleItemClick(item)}
                                    disabled={isUsed}
                                    className="w-full text-left p-2 rounded-md bg-stone-800/50 hover:bg-neutral-700/50 transition-colors duration-200 disabled:bg-stone-900/50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <p className="truncate text-neutral-200">{item.name}</p>
                                </button>
                             )
                        })
                    ) : (
                        <p className="p-2 text-sm text-neutral-500">No items available.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CraftingPanel;