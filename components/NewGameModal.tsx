import React, { useState, useEffect } from 'react';
import type { GameSession, CustomCharacter, AppSettings } from '../types';

import NewGameTab from './NewGameTab';
import WorldForgeTab from './WorldForgeTab';
import LocationPickerTab from './LocationPickerTab';
import { FEATURED_WORLDS, EXPANDED_FEATURED_WORLDS } from '../constants';
import { XIcon, StarIcon, QuillIcon, GlobeIcon, AnvilIcon, BookOpenIcon } from './icons';

const ALL_WORLDS = [...FEATURED_WORLDS, ...EXPANDED_FEATURED_WORLDS];
// FIX: The `World` type is now correctly defined to include the optional `staffPick` property.
// The previous type `typeof ALL_WORLDS[0]` was too narrow, as it was inferred from an object without `staffPick`.
type World = (typeof FEATURED_WORLDS)[number] & { staffPick?: boolean };

interface NewGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStart: (prompt: string, hiddenPreamble?: string, world?: World, locationImage?: { base64: string, mimeType: string }) => void;
  defaultTab?: Tab;
}

type Tab = 'scenario' | 'forge' | 'browse' | 'location';

const BrowseWorlds: React.FC<{ onStart: (world: World) => void }> = ({ onStart }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto pr-2">
        {ALL_WORLDS.map(world => (
             <button 
                key={world.title} 
                onClick={() => onStart(world as World)}
                className={`relative aspect-video rounded-lg overflow-hidden group border-2 hover:border-accent transition-all duration-300 transform hover:scale-105 bg-cover bg-center ${(world as World).staffPick ? 'border-amber-400' : 'border-surface-primary'}`}
                style={{ backgroundImage: `url(${world.imageUrl})` }}
                aria-label={`Start adventure: ${world.title}`}
            >
                {(world as World).staffPick && (
                    <div className="absolute top-2 right-2 bg-amber-400 text-black text-xs font-bold px-2 py-0.5 rounded-full z-20 flex items-center gap-1">
                        <StarIcon className="w-4 h-4"/> Staff Pick
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 flex flex-col justify-end z-10 transition-colors group-hover:bg-black/70">
                    <h4 className="font-bold text-white text-md leading-tight">{world.title}</h4>
                    <p className="text-sm text-text-primary/90">{world.tagline}</p>
                </div>
            </button>
        ))}
    </div>
);


const NewGameModal: React.FC<NewGameModalProps> = ({ isOpen, onClose, onStart, defaultTab }) => {
  const [activeTab, setActiveTab] = useState<Tab>(defaultTab || 'scenario');
  
  useEffect(() => {
    if (isOpen) {
        setActiveTab(defaultTab || 'scenario');
    }
  }, [isOpen, defaultTab]);

  if (!isOpen) return null;

  const handleStart = (prompt: string, hiddenPreamble?: string, world?: World, locationImage?: { base64: string, mimeType: string }) => {
    onStart(prompt, hiddenPreamble, world, locationImage);
    onClose();
  };

  const tabs: { id: Tab, label: string, icon: React.FC<any> }[] = [
      { id: 'scenario', label: 'Scenario', icon: QuillIcon },
      { id: 'location', label: 'Location', icon: GlobeIcon },
      { id: 'forge', label: 'Forge', icon: AnvilIcon },
      { id: 'browse', label: 'Browse', icon: BookOpenIcon },
  ];

  const renderContent = () => {
    switch (activeTab) {
        case 'scenario':
            return <NewGameTab onStart={(prompt) => handleStart(prompt)} />;
        case 'location':
            return <LocationPickerTab onStart={(prompt, image) => handleStart(prompt, undefined, undefined, image)} onClose={onClose} />;
        case 'forge':
            return <WorldForgeTab onStart={(prompt) => handleStart(prompt)} />;
        case 'browse':
            return <BrowseWorlds onStart={(world) => handleStart(world.prompt, undefined, world)} />;
        default:
            return null;
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
        className="bg-background-secondary border border-surface-primary rounded-lg w-full max-w-4xl m-4 text-white animate-fade-in shadow-2xl shadow-black/50 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b border-surface-primary">
            <h2 className="text-xl font-bold">Start New Adventure</h2>
            <button onClick={onClose} className="p-1 rounded-full text-text-secondary hover:bg-surface-primary hover:text-white">
                <XIcon className="w-6 h-6" />
            </button>
        </div>
        <div className="p-2 border-b border-surface-primary">
            <div className="flex flex-wrap gap-2 p-1 bg-background-primary/50 rounded-md">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 py-2 px-3 text-sm font-semibold rounded-md transition-colors flex items-center justify-center gap-2 ${activeTab === tab.id ? 'bg-accent text-white' : 'text-text-secondary hover:bg-surface-primary'}`}
                    >
                        <tab.icon className="w-5 h-5" />
                        <span>{tab.label}</span>
                    </button>
                ))}
            </div>
        </div>
        <div className="p-6 overflow-y-auto">
            {activeTab !== 'location' && <p className="text-text-secondary mb-4 text-center">Starting a new game will end your current session. Your progress will be saved.</p>}
            {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default NewGameModal;