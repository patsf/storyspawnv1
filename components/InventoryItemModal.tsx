import React from 'react';
import type { InventoryItem } from '../types';

interface InventoryItemModalProps {
  item: InventoryItem | null;
  isOpen: boolean;
  onClose: () => void;
  onUse: (item: InventoryItem) => void;
  onDrop: (item: InventoryItem) => void;
  onEquip: (item: InventoryItem) => void;
}

const InventoryItemModal: React.FC<InventoryItemModalProps> = ({ item, isOpen, onClose, onUse, onDrop, onEquip }) => {
  if (!isOpen || !item) return null;
  
  const isCosmeticEquippable = item.equippable && ['head', 'torso', 'accessory'].includes(item.slot || '');

  const handleDrop = () => {
    if (window.confirm(`Are you sure you want to drop ${item.name}? This action might be irreversible.`)) {
        onDrop(item);
    }
  }

  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div 
        className="bg-background-secondary border border-surface-primary rounded-lg p-6 w-full max-w-md m-4 text-white animate-fade-in shadow-2xl shadow-black/50"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
      >
        <h3 className="text-2xl font-bold mb-4">{item.name}</h3>
        <p className="text-text-primary mb-6 font-mono">{item.description}</p>
        <div className="flex flex-col sm:flex-row gap-3">
             <button
                onClick={() => onUse(item)}
                className="w-full bg-interactive-secondary text-white font-bold py-2 px-4 rounded-lg hover:bg-interactive-secondary transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background-secondary focus:ring-white"
                >
                Use
            </button>
            {isCosmeticEquippable && (
                 <button
                    onClick={() => onEquip(item)}
                    className="w-full bg-accent text-white font-bold py-2 px-4 rounded-lg hover:bg-accent-hover transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background-secondary focus:ring-white"
                    >
                    Equip
                </button>
            )}
             <button
                onClick={handleDrop}
                className="w-full bg-surface-primary text-text-primary font-bold py-2 px-4 rounded-lg hover:bg-red-500/30 hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background-secondary focus:ring-white"
                >
                Drop
            </button>
            <button
                onClick={onClose}
                className="w-full bg-surface-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-interactive-secondary transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background-secondary focus:ring-white sm:hidden"
                >
                Close
            </button>
        </div>
      </div>
    </div>
  );
};

export default InventoryItemModal;