import React, { useState, useRef, useEffect } from 'react';
import type { Injury, InventoryItem } from '../types';
import { HeartPulseIcon, PlusCircleIcon, QuestionMarkCircleIcon } from './icons';

interface InjuriesPanelProps {
  injuries: Injury[];
  inventory: InventoryItem[];
  onUseItem: (item: InventoryItem, injury: Injury) => void;
}

const injuryPositions = {
    head: { top: '13%', left: '50%' },
    torso: { top: '40%', left: '50%' },
    leftArm: { top: '42%', left: '25%' },
    rightArm: { top: '42%', left: '75%' },
    leftLeg: { top: '75%', left: '40%' },
    rightLeg: { top: '75%', left: '60%' },
};

const severityStyles = {
    minor: 'bg-yellow-500 border-yellow-400',
    moderate: 'bg-orange-500 border-orange-400',
    critical: 'bg-red-600 border-red-500',
};

const healingKeywords = ['bandage', 'salve', 'potion', 'kit', 'meds', 'stim', 'healing', 'health'];

const HumanoidFigure: React.FC<{ injuries: Injury[]; onSelect: (injury: Injury) => void; selectedInjury: Injury | null; }> = ({ injuries, onSelect, selectedInjury }) => {
    return (
        <div className="relative w-40 h-80 mx-auto my-4">
             <svg viewBox="0 0 100 200" className="absolute inset-0 w-full h-full text-interactive-secondary/50" fill="currentColor">
                {/* Head */}
                <path d="M50 5 C 62 5, 70 15, 70 25 S 62 45, 50 45 S 30 35, 30 25 S 38 5, 50 5 Z" />
                {/* Neck */}
                <rect x="45" y="45" width="10" height="10" />
                {/* Torso */}
                <path d="M45 55 L 30 60 L 25 100 L 40 120 L 60 120 L 75 100 L 70 60 Z" />
                {/* Arms */}
                <path d="M30 60 L 15 110 L 20 115 L 35 65 Z" />
                <path d="M70 60 L 85 110 L 80 115 L 65 65 Z" />
                {/* Legs */}
                <path d="M40 120 L 30 180 L 40 195 L 50 120 Z" />
                <path d="M60 120 L 70 180 L 60 195 L 50 120 Z" />
            </svg>
            
            {injuries.map((injury) => {
                const pos = injuryPositions[injury.location];
                const sev = severityStyles[injury.severity];
                const isSelected = selectedInjury?.location === injury.location && selectedInjury?.description === injury.description;
                const injuryKey = `${injury.location}-${injury.description}`;
                return (
                    <button
                        key={injuryKey}
                        onClick={() => onSelect(injury)}
                        className={`absolute w-6 h-6 rounded-full ${sev} -translate-x-1/2 -translate-y-1/2 ring-2 ring-background-secondary border-2 transition-transform hover:scale-125 cursor-pointer focus:outline-none ${isSelected ? 'scale-125 ring-accent' : 'ring-transparent'} animate-subtle-pulse`}
                        style={{ top: pos.top, left: pos.left, animationDuration: '3s' }}
                        title={`${injury.severity} ${injury.description} on ${injury.location.replace(/([A-Z])/g, ' $1')}`}
                        aria-label={`Select ${injury.description} on ${injury.location}`}
                    />
                );
            })}
        </div>
    );
};

const InjuryItem: React.FC<{ injury: Injury; inventory: InventoryItem[]; onUseItem: (item: InventoryItem, injury: Injury) => void; onSelect: (injury: Injury) => void; isSelected: boolean; }> = ({ injury, inventory, onUseItem, onSelect, isSelected }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const usableItems = inventory.filter(item => 
        healingKeywords.some(keyword => item.name.toLowerCase().includes(keyword))
    );

    return (
        <div className={`bg-surface-secondary/50 rounded-lg transition-all duration-300 ${isSelected ? 'ring-2 ring-accent' : 'ring-2 ring-transparent'}`}>
            <button 
                className="w-full text-left p-3"
                onClick={() => { onSelect(injury); setIsExpanded(prev => !prev); }}
            >
                <div className="flex justify-between items-center">
                    <span className="font-semibold text-white capitalize">{injury.description}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full text-white ${severityStyles[injury.severity]}`}>{injury.severity}</span>
                </div>
                <p className="text-sm text-text-secondary capitalize">{injury.location.replace(/([A-Z])/g, ' $1')}</p>
            </button>
            {isExpanded && (
                <div className="border-t border-border-primary/50 p-3 animate-fade-in">
                    <h4 className="text-xs font-bold uppercase text-text-secondary mb-2 flex items-center gap-1.5 group relative">
                        <span>Treat with:</span>
                        <QuestionMarkCircleIcon className="w-3.5 h-3.5" />
                        <span className="absolute bottom-full left-0 mb-2 w-max max-w-xs bg-background-primary text-white text-xs rounded-lg py-2 px-3 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                            Using an item from this menu sends a precise command to the AI, increasing the chance of successful treatment.
                        </span>
                    </h4>
                    {usableItems.length > 0 ? (
                        <div className="space-y-2">
                            {usableItems.map(item => (
                                <button 
                                    key={item.name}
                                    onClick={() => onUseItem(item, injury)}
                                    className="w-full flex items-center gap-2 text-left p-2 rounded-md bg-surface-primary/50 hover:bg-accent/20 transition-colors"
                                >
                                    <PlusCircleIcon className="w-5 h-5 text-green-400 flex-shrink-0" />
                                    <span className="text-sm text-text-primary">{item.name}</span>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-text-secondary/70 italic">No usable items in inventory.</p>
                    )}
                </div>
            )}
        </div>
    );
};

const InjuriesPanel: React.FC<InjuriesPanelProps> = ({ injuries, inventory, onUseItem }) => {
  const [selectedInjury, setSelectedInjury] = useState<Injury | null>(null);
  const itemRefs = useRef<Map<string, HTMLDivElement | null>>(new Map());

  useEffect(() => {
    if (selectedInjury) {
        const key = `${selectedInjury.location}-${selectedInjury.description}`;
        const element = itemRefs.current.get(key);
        element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [selectedInjury]);

  return (
    <div className="text-text-primary p-4">
      {injuries.length > 0 ? (
        <div>
            <HumanoidFigure injuries={injuries} onSelect={setSelectedInjury} selectedInjury={selectedInjury} />
            <div className="space-y-3 mt-4">
                {injuries.map((injury) => {
                    const key = `${injury.location}-${injury.description}`;
                    return (
                        <div key={key} ref={(node) => {
                            if (node) {
                                itemRefs.current.set(key, node);
                            } else {
                                itemRefs.current.delete(key);
                            }
                        }}>
                            <InjuryItem
                                injury={injury} 
                                inventory={inventory} 
                                onUseItem={onUseItem}
                                onSelect={setSelectedInjury}
                                isSelected={selectedInjury?.location === injury.location && selectedInjury?.description === injury.description}
                            />
                        </div>
                    )
                })}
            </div>
        </div>
      ) : (
        <div className="text-center text-text-secondary p-8 pt-12">
            <HeartPulseIcon className="w-12 h-12 mx-auto mb-2" />
            <p>No injuries to report.</p>
            <p className="text-sm">You are in good health.</p>
        </div>
      )}
    </div>
  );
};

export default InjuriesPanel;