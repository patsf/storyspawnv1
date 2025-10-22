import React from 'react';
import type { Character } from '../types';
import { SkullIcon } from './icons';

interface CharacterModalProps {
  character: Character | null;
  isOpen: boolean;
  onClose: () => void;
}

const CharacterModal: React.FC<CharacterModalProps> = ({ character, isOpen, onClose }) => {
  if (!isOpen || !character) return null;

  const isDeceased = character?.status === 'deceased';

  const formatLocation = (location: string | undefined) => {
    if (!location) return '';
    return location.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div 
        className="bg-background-secondary border border-surface-primary rounded-lg w-full max-w-lg m-4 text-white flex flex-col max-h-[90vh] animate-fade-in shadow-2xl shadow-black/50"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col sm:flex-row items-center sm:items-start p-6 space-y-4 sm:space-y-0 sm:space-x-6">
            <div className={`relative w-32 h-32 rounded-lg bg-surface-primary flex-shrink-0 overflow-hidden ${isDeceased ? 'grayscale' : ''}`}>
                {character.imageUrl ? (
                    <img src={character.imageUrl} alt={character.name} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full bg-interactive-secondary animate-pulse"></div>
                )}
            </div>
            <div className="flex-1 text-center sm:text-left">
                <h3 className="text-3xl font-bold font-heading">{character.name}</h3>
                <span className={`inline-block text-white text-xs font-semibold mr-2 px-2.5 py-0.5 rounded-full mt-2 ${isDeceased ? 'bg-red-500/30' : 'bg-white/10'}`}>
                    {character.status}
                </span>
            </div>
        </div>

        <div className="px-6 pb-6 overflow-y-auto">
            {isDeceased && (
                <div className="mb-6 p-4 rounded-lg bg-red-900/30 border border-red-500/30 flex items-center gap-3">
                    <SkullIcon className="w-8 h-8 text-red-400 flex-shrink-0" />
                    <div>
                        <h4 className="font-bold text-red-300">Deceased</h4>
                        {character.location && <p className="text-sm text-red-400">Last seen: {formatLocation(character.location)}</p>}
                    </div>
                </div>
            )}
            <h4 className="text-sm font-bold uppercase text-text-secondary tracking-wider mb-2">Description</h4>
            <p className="text-text-primary mb-6 font-mono text-sm">{character.description}</p>
            
            {!isDeceased && character.location && (
                <>
                    <h4 className="text-sm font-bold uppercase text-text-secondary tracking-wider mb-2">Last Known Location</h4>
                    <p className="text-text-primary mb-6 font-mono text-sm">{formatLocation(character.location)}</p>
                </>
            )}

            <h4 className="text-sm font-bold uppercase text-text-secondary tracking-wider mb-2">Known Information</h4>
            {character.knownInformation.length > 0 ? (
                <ul className="space-y-2 list-disc list-inside text-text-secondary font-mono text-sm">
                    {character.knownInformation.map((info, index) => (
                        <li key={index}>{info}</li>
                    ))}
                </ul>
            ) : (
                <p className="text-text-secondary/70 font-mono text-sm">You don't know anything specific about them yet.</p>
            )}
        </div>

        <div className="p-4 bg-black/20 mt-auto border-t border-surface-primary">
            <button
            onClick={onClose}
            className="w-full bg-interactive-secondary text-white font-bold py-2 px-4 rounded-lg hover:bg-interactive-secondary transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background-secondary focus:ring-white"
            >
            Close
            </button>
        </div>

      </div>
    </div>
  );
};

export default CharacterModal;