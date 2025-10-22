import React from 'react';
import type { Character } from '../types';
import { SkullIcon } from './icons';

interface CharacterPanelProps {
  characters: Character[];
  onCharacterClick: (character: Character) => void;
  newCharacters: string[];
}

const CharacterPanel: React.FC<CharacterPanelProps> = ({ characters, onCharacterClick, newCharacters }) => {
  const statusClasses: Record<Character['status'], string> = {
    friendly: 'ring-accent/50',
    hostile: 'ring-red-500/50',
    neutral: 'ring-border-primary/50',
    unknown: 'ring-transparent',
    deceased: 'ring-transparent',
  };

  return (
    <div className="text-text-primary">
      {characters.length === 0 ? (
        <p className="text-text-secondary p-4 text-center">No characters met yet.</p>
      ) : (
        <div className="grid grid-cols-3 gap-4 p-4">
          {characters.map((character) => {
            const isDeceased = character.status === 'deceased';
            const isNew = newCharacters.includes(character.name);
            return (
                <button 
                    key={character.name} 
                    className={`flex flex-col items-center text-center group focus:outline-none focus:ring-2 focus:ring-white rounded-lg p-1 ${isNew ? 'animate-glow-and-fade' : ''}`}
                    onClick={() => onCharacterClick(character)}
                >
                <div 
                    className={`relative w-16 h-16 rounded-full bg-surface-primary mb-2 overflow-hidden flex items-center justify-center transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-white/10 ring-2 ${statusClasses[character.status] || 'ring-transparent'} ${isDeceased ? 'grayscale' : ''}`} 
                >
                    {character.imageUrl ? (
                    <img src={character.imageUrl} alt={character.name} className="w-full h-full object-cover" />
                    ) : (
                    <div className="w-full h-full bg-interactive-secondary animate-pulse"></div>
                    )}
                    {isDeceased && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                            <SkullIcon className="w-8 h-8 text-red-500/80" />
                        </div>
                    )}
                </div>
                <p className={`font-semibold text-xs text-white truncate w-full ${isDeceased ? 'line-through text-text-secondary' : ''}`}>{character.name}</p>
                </button>
            )
          })}
        </div>
      )}
    </div>
  );
};

export default CharacterPanel;