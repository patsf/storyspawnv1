import React from 'react';
import {
    XIcon,
    SettingsIcon,
    BookOpenIcon,
    PlusIcon,
    FolderOpenIcon,
    QuestionMarkCircleIcon,
} from './icons';

interface GameMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  onHomepage: () => void;
  onStartNewGame: () => void;
  onSummarize: () => void;
  onSettings: () => void;
  onHelp: () => void;
}

const MenuButton: React.FC<{ onClick: () => void; icon: React.ReactNode; title: string; subtitle: string; }> = ({ onClick, icon, title, subtitle }) => (
    <button
        onClick={onClick}
        className="w-full text-left p-4 rounded-lg bg-surface-secondary hover:bg-surface-primary transition-colors group flex items-center gap-4"
    >
        <div className="p-2 bg-interactive-secondary/50 rounded-md">
            {icon}
        </div>
        <div>
            <h3 className="font-bold text-white">{title}</h3>
            <p className="text-xs text-text-secondary">{subtitle}</p>
        </div>
    </button>
);

const GameMenuModal: React.FC<GameMenuModalProps> = ({ isOpen, onClose, onHomepage, onStartNewGame, onSummarize, onSettings, onHelp }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="bg-background-secondary border border-surface-primary rounded-lg w-full max-w-md m-4 text-white animate-fade-in shadow-2xl shadow-black/50"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b border-surface-primary">
            <h2 className="text-xl font-bold">Game Menu</h2>
            <button onClick={onClose} className="p-1 rounded-full text-text-secondary hover:bg-surface-primary hover:text-white">
                <XIcon className="w-6 h-6" />
            </button>
        </div>

        <div className="p-6 space-y-4">
          <button
            onClick={onClose}
            className="w-full bg-accent text-white font-bold py-3 px-4 rounded-lg hover:bg-accent-hover transition-colors duration-200 text-lg"
          >
            Resume Game
          </button>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <MenuButton 
                onClick={onSummarize} 
                icon={<BookOpenIcon className="w-6 h-6 text-accent-text" />} 
                title="Journal"
                subtitle="Summarize story"
            />
             <MenuButton 
                onClick={onSettings} 
                icon={<SettingsIcon className="w-6 h-6 text-accent-text" />} 
                title="Settings"
                subtitle="Adjust options"
            />
            <MenuButton 
                onClick={onStartNewGame} 
                icon={<PlusIcon className="w-6 h-6 text-accent-text" />} 
                title="New Game"
                subtitle="End this session"
            />
            <MenuButton 
                onClick={() => {
                    onHomepage();
                    onClose();
                }}
                icon={<FolderOpenIcon className="w-6 h-6 text-accent-text" />} 
                title="Homepage"
                subtitle="Exit to main menu"
            />
            <div className="sm:col-span-2">
                 <MenuButton 
                    onClick={onHelp} 
                    icon={<QuestionMarkCircleIcon className="w-6 h-6 text-accent-text" />} 
                    title="Help / Guide"
                    subtitle="Learn how to play"
                />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameMenuModal;