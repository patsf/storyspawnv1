import React, { useRef, useEffect } from 'react';
import type { PlayerStatus as PlayerStatusType, InventoryItem, StatusEffect } from '../types';
import { HealthIcon, InventoryIcon, PlusCircleIcon, MinusCircleIcon, BrainIcon, CogIcon } from './icons';

interface PlayerStatusProps {
  status: PlayerStatusType;
  onItemClick: (item: InventoryItem) => void;
  onStatusEffectHover: (effect: StatusEffect | null, rect: DOMRect | null) => void;
  onGoldHover: (isHovering: boolean, rect: DOMRect | null) => void;
  onResolveHover: (isHovering: boolean, rect: DOMRect | null) => void;
  onHealthHover: (isHovering: boolean, rect: DOMRect | null) => void;
  newItems: string[];
  newEffects: string[];
  highlightedItem: string | null;
}

const PlayerStatus: React.FC<PlayerStatusProps> = ({ status, onItemClick, onStatusEffectHover, onGoldHover, onResolveHover, onHealthHover, newItems, newEffects, highlightedItem }) => {
  const itemRefs = useRef<Map<string, HTMLButtonElement | null>>(new Map());

  useEffect(() => {
    if (highlightedItem) {
      const node = itemRefs.current.get(highlightedItem);
      if (node) {
        node.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [highlightedItem]);

  return (
    <div className="p-4 text-text-primary space-y-3">
      <div>
        <button
            onMouseEnter={(e) => onHealthHover(true, e.currentTarget.getBoundingClientRect())}
            onMouseLeave={() => onHealthHover(false, null)}
            className="w-full text-left p-1 -m-1 rounded-md hover:bg-white/5 transition-colors"
            aria-label="What is Health?"
        >
          <div className="flex items-center mb-2">
            <HealthIcon className="w-6 h-6 mr-3 text-red-400" />
            <span className="font-semibold text-white">Health</span>
          </div>
        </button>
        <div className="w-full bg-black/20 rounded-full h-2.5">
          <div 
            className={`h-2.5 rounded-full transition-all duration-500 ${status.health < 30 ? 'bg-red-500' : 'bg-red-400'}`} 
            style={{ width: `${status.health}%` }}>
          </div>
        </div>
        <p className="text-right text-sm mt-1 text-text-secondary">{status.health} / 100</p>
      </div>
       <div>
         <button
            onMouseEnter={(e) => onResolveHover(true, e.currentTarget.getBoundingClientRect())}
            onMouseLeave={() => onResolveHover(false, null)}
            className="w-full text-left p-1 -m-1 rounded-md hover:bg-white/5 transition-colors"
            aria-label="What is Resolve?"
        >
            <div className="flex items-center mb-2">
            <BrainIcon className="w-6 h-6 mr-3 text-accent" />
            <span className="font-semibold text-white">Resolve</span>
            </div>
        </button>
        <div className="w-full bg-black/20 rounded-full h-2.5">
          <div 
            className="bg-accent h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${status.resolve}%` }}>
          </div>
        </div>
        <p className="text-right text-sm mt-1 text-text-secondary">{status.resolve} / 100</p>
      </div>
      <div>
        <h3 className="font-semibold text-white mb-3 flex items-center">
            <InventoryIcon className="w-5 h-5 mr-2 text-text-secondary" />
            <span>Status Effects</span>
        </h3>
        <div className="pl-1 space-y-2 text-text-secondary">
          {status.statusEffects.length > 0 ? (
            <div className="flex flex-wrap gap-2">
                {status.statusEffects.map((effect, index) => {
                    const isPositive = effect.type === 'positive';
                    const isNew = newEffects.includes(effect.name);
                    return (
                        <button
                            key={index}
                            onMouseEnter={(e) => onStatusEffectHover(effect, e.currentTarget.getBoundingClientRect())}
                            onMouseLeave={() => onStatusEffectHover(null, null)}
                            className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-full transition-colors duration-200 ${isPositive ? 'bg-green-500/10 text-green-300 border border-green-500/20' : 'bg-red-500/10 text-red-300 border border-red-500/20'} ${isNew ? 'animate-glow-and-fade' : ''}`}
                        >
                            {isPositive ? <PlusCircleIcon className="w-4 h-4" /> : <MinusCircleIcon className="w-4 h-4" />}
                            <span>{effect.name}</span>
                        </button>
                    )
                })}
            </div>
          ) : (
            <p className="px-2 text-sm text-text-secondary/70">Normal</p>
          )}
        </div>
      </div>
      <div>
        <div className="flex items-center mb-2">
          <InventoryIcon className="w-6 h-6 mr-3 text-text-secondary" />
          <span className="font-semibold text-white">Inventory</span>
        </div>
        <div className="pl-1 space-y-2 text-text-secondary max-h-48 overflow-y-auto">
          <button 
            onMouseEnter={(e) => onGoldHover(true, e.currentTarget.getBoundingClientRect())}
            onMouseLeave={() => onGoldHover(false, null)}
            className="w-full text-left p-2 rounded-md bg-surface-secondary hover:bg-surface-primary transition-colors duration-200 flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
                <CogIcon className="w-5 h-5 text-yellow-400" />
                <p className="truncate text-text-primary">Gold</p>
            </div>
            <p className="font-mono font-bold text-yellow-300">{status.currency}</p>
          </button>
          
          {status.inventory.length > 0 ? (
            status.inventory.map((item, index) => {
              const isNew = newItems.includes(item.name);
              const isHighlighted = item.name === highlightedItem;
              return (
              <button 
                key={index}
                ref={(node) => {
                    if (node) itemRefs.current.set(item.name, node);
                    else itemRefs.current.delete(item.name);
                }}
                onClick={() => onItemClick(item)}
                className={`w-full text-left p-2 rounded-md bg-surface-secondary hover:bg-surface-primary transition-colors duration-200 ${isNew ? 'animate-glow-and-fade' : 'animate-fade-in'} ${isHighlighted ? 'glow-focus' : ''}`}
              >
                <p className="truncate text-text-primary">{item.name}</p>
              </button>
            )})
          ) : (
            <p className="p-2 text-sm text-text-secondary/70">No items.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlayerStatus;