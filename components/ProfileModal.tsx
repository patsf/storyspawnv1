import React from 'react';
import type { CustomCharacter, PlayerStatus } from '../types';
import { UserCircleIcon, HealthIcon, BrainIcon, CogIcon } from './icons';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  character: CustomCharacter | null;
  status: PlayerStatus;
}

const StatBar: React.FC<{ value: number; Icon: React.FC<any>; color: string; label: string }> = ({ value, Icon, color, label }) => (
    <div className="flex items-center gap-3">
        <Icon className={`w-6 h-6 ${color.startsWith('#') || color.startsWith('var') ? '' : color}`} style={{color: color.startsWith('#') || color.startsWith('var') ? color : undefined }} />
        <div className="flex-1">
            <div className="flex justify-between items-baseline mb-1">
                <span className="text-sm font-semibold text-white">{label}</span>
                <span className="text-xs font-mono text-text-secondary">{value} / 100</span>
            </div>
            <div className="w-full bg-black/20 rounded-full h-2">
                <div 
                    className={`h-2 rounded-full transition-all duration-500`} 
                    style={{ width: `${value}%`, backgroundColor: color }}
                ></div>
            </div>
        </div>
    </div>
);


const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, character, status }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div 
        className="bg-background-secondary border border-surface-primary rounded-lg w-full max-w-sm m-4 text-white flex flex-col max-h-[90vh] animate-fade-in shadow-2xl shadow-black/50"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center p-6 space-y-4">
            <div className="relative w-32 h-32 rounded-full bg-surface-primary flex-shrink-0 overflow-hidden ring-2 ring-white/20">
                {character?.portraitUrl ? (
                    <img src={character.portraitUrl} alt={character.name || 'Your character'} className="w-full h-full object-cover" />
                ) : (
                    <UserCircleIcon className="w-full h-full text-text-secondary" />
                )}
            </div>
            <div className="flex-1 text-center">
                <h3 className="text-3xl font-bold font-heading">{character?.name || 'Survivor'}</h3>
                <p className="text-text-secondary">{character?.pronouns}</p>
            </div>
        </div>

        <div className="px-6 pb-6 space-y-4">
            <StatBar value={status.health} Icon={HealthIcon} color="#f87171" label="Health" />
            <StatBar value={status.resolve} Icon={BrainIcon} color="var(--color-accent)" label="Resolve" />

            <div className="flex items-center gap-3 bg-surface-secondary p-3 rounded-lg">
                <CogIcon className="w-6 h-6 text-yellow-400" />
                <div>
                    <span className="text-sm font-semibold text-white">Gold</span>
                    <p className="text-2xl font-mono font-bold text-yellow-300 tracking-wider">{status.currency}</p>
                </div>
            </div>
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

export default ProfileModal;