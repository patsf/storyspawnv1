import React from 'react';
import { MenuIcon, PanelLeftCloseIcon, PanelRightOpenIcon, LocationIcon, ClockIcon, CogIcon, SunIcon, MoonIcon, MusicNoteIcon } from './icons';
import SaveIndicator from './SaveIndicator';

type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night' | 'unknown';

interface GameHeaderProps {
  onMenuClick: () => void;
  onLogoClick: () => void;
  isSidePanelOpen: boolean;
  onToggleSidePanel: () => void;
  isSaving: boolean;
  location: string;
  time: string;
  currency: number;
  onGoldClick: () => void;
  timeOfDay: TimeOfDay;
  isCasinoAvailable: boolean;
  onCasinoClick: () => void;
}

const GameHeader: React.FC<GameHeaderProps> = ({ onMenuClick, onLogoClick, isSidePanelOpen, onToggleSidePanel, isSaving, location, time, currency, onGoldClick, timeOfDay, isCasinoAvailable, onCasinoClick }) => {
  const isNight = timeOfDay === 'night' || timeOfDay === 'evening';

  const TimeIcon = () => (
    <div className="relative w-6 h-6">
        <SunIcon className={`w-6 h-6 text-yellow-300 absolute transition-all duration-1000 ${isNight ? 'opacity-0 transform -rotate-90 scale-50' : 'opacity-100 transform rotate-0 scale-100'}`} />
        <MoonIcon className={`w-6 h-6 text-blue-300 absolute transition-all duration-1000 ${isNight ? 'opacity-100 transform rotate-0 scale-100' : 'opacity-0 transform rotate-90 scale-50'}`} />
    </div>
  );


  return (
    <header className="flex justify-between items-center px-4 sm:px-6 py-3 border-b border-surface-primary bg-background-secondary/50 backdrop-blur-sm flex-shrink-0">
      <div className="flex items-center gap-4">
        <button 
            onClick={onMenuClick} 
            className="text-text-secondary hover:text-white transition-colors duration-200 p-2 rounded-lg hover:bg-white/10"
            aria-label="Open game menu"
        >
            <MenuIcon className="w-6 h-6" />
        </button>
        <button onClick={onLogoClick} className="hidden sm:block">
            <h1 className="text-2xl font-extrabold text-white font-heading" style={{textShadow: '0 0 10px rgba(255,255,255,0.2)'}}>StorySpawn</h1>
        </button>
        <SaveIndicator isSaving={isSaving} />
      </div>

      <div className="flex-1 flex justify-center items-center gap-6 text-sm text-text-secondary font-mono min-w-0">
        <div className="hidden md:flex items-center gap-2 min-w-0" title={location}>
          <LocationIcon className="w-4 h-4 text-text-secondary/70 flex-shrink-0" />
          <span className="truncate">{location}</span>
        </div>
         <button 
            onClick={onGoldClick}
            className="hidden md:flex items-center gap-2 p-1 rounded-md hover:bg-white/10" 
            title="What is Gold?"
        >
            <CogIcon className="w-4 h-4 text-yellow-500" />
            <span className="text-yellow-400 font-semibold">{currency}</span>
        </button>
        <div className="hidden lg:flex items-center gap-2" title="In-Game Time">
          <ClockIcon className="w-4 h-4 text-text-secondary/70" />
          <span>{time}</span>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        {isCasinoAvailable && (
            <button 
                onClick={onCasinoClick}
                className="text-white bg-accent/20 hover:bg-accent/40 transition-colors duration-200 p-2 rounded-lg relative animate-glow"
                aria-label="Play a game"
                title="A game of chance is available!"
            >
                <MusicNoteIcon className="w-6 h-6" />
            </button>
        )}
        <TimeIcon />
        <button 
            onClick={onToggleSidePanel} 
            className="text-text-secondary hover:text-white transition-colors duration-200 p-2 rounded-lg hover:bg-white/10"
            aria-label={isSidePanelOpen ? "Close side panel" : "Open side panel"}
            data-tour-id="side-panel-toggle"
        >
            {isSidePanelOpen ? <PanelLeftCloseIcon className="w-6 h-6" /> : <PanelRightOpenIcon className="w-6 h-6" />}
        </button>
      </div>
    </header>
  );
};

export default React.memo(GameHeader);