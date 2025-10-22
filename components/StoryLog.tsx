import React, { useRef, useEffect } from 'react';
import type { StoryMessage, GameState, CustomCharacter } from '../types';
import GeminiMessage from './GeminiMessage';
import { RefreshIcon, QuillIcon, UserCircleIcon } from './icons';

interface StoryLogProps {
  history: StoryMessage[];
  gameState: GameState;
  onEntityClick: (type: 'character' | 'item', name: string) => void;
  onKeywordHover: (keyword: string | null, rect: DOMRect | null) => void;
  onLocationClick: (locationName: string) => void;
  onDiscoveryClick: (discoveryText: string) => void;
  onCombatClick: () => void;
  onEventClick: (eventText: string) => void;
  onReroll: () => void;
  isLoading: boolean;
  customCharacter: CustomCharacter | null;
  onUserIconClick: () => void;
  onGeminiIconClick: (messageText: string) => void;
}

const StoryLog: React.FC<StoryLogProps> = ({ 
    history, 
    gameState, 
    onEntityClick, 
    onKeywordHover, 
    onLocationClick, 
    onDiscoveryClick, 
    onCombatClick, 
    onEventClick, 
    onReroll, 
    isLoading,
    customCharacter,
    onUserIconClick,
    onGeminiIconClick
}) => {
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  let lastNonUserMessageIndex = -1;
    for (let i = history.length - 1; i >= 0; i--) {
        if (history[i].author !== 'user') {
            lastNonUserMessageIndex = i;
            break;
        }
    }

  return (
    <div className="flex-1 overflow-y-auto px-6 sm:px-10 py-6 space-y-6 font-mono" data-tour-id="story-log">
      {history.map((message, index) => {
        const isMostRecentBlock = index >= lastNonUserMessageIndex && history[lastNonUserMessageIndex]?.author !== 'user';
        
        if (message.author === 'user') {
            return (
                <div key={index} className="flex gap-4 group flex-row-reverse animate-slide-in-up">
                    <button onClick={onUserIconClick} className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-interactive-secondary overflow-hidden focus:outline-none focus:ring-2 ring-offset-2 ring-offset-background-secondary focus:ring-white">
                        {customCharacter?.portraitUrl ? (
                            <img src={customCharacter.portraitUrl} alt="Your portrait" className="w-full h-full object-cover" />
                        ) : (
                            <UserCircleIcon className="w-8 h-8 text-text-secondary" />
                        )}
                    </button>
                    <div className="relative max-w-3xl rounded-lg bg-surface-primary text-text-primary p-4">
                        <p className="whitespace-pre-wrap">{message.text}</p>
                    </div>
                </div>
            )
        }
        
        if (message.author === 'gemini') {
            return (
                 <div key={index} className="flex gap-4 group flex-row animate-slide-in-up">
                    <button 
                        onClick={() => message.type !== 'thinking' && onGeminiIconClick(message.text)} 
                        disabled={message.type === 'thinking'}
                        className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-accent/20 disabled:cursor-not-allowed focus:outline-none focus:ring-2 ring-offset-2 ring-offset-background-secondary focus:ring-accent-hover transition-transform hover:scale-110"
                        aria-label="Summarize message"
                    >
                        <QuillIcon className="w-5 h-5 text-accent" />
                    </button>

                    <div className={`relative max-w-3xl rounded-lg bg-black/40 text-text-primary ${isMostRecentBlock && !isLoading ? 'shadow-lg shadow-accent/10' : ''}`}>
                         <GeminiMessage 
                            message={message}
                            gameState={gameState}
                            onEntityClick={onEntityClick}
                            onKeywordHover={onKeywordHover}
                            onLocationClick={onLocationClick}
                            onDiscoveryClick={onDiscoveryClick}
                            onCombatClick={onCombatClick}
                            onEventClick={onEventClick}
                        />
                         {message.type !== 'thinking' && isMostRecentBlock && (
                            <div className="relative">
                            <button 
                                onClick={onReroll} 
                                disabled={isLoading}
                                className="absolute -bottom-2 right-0 bg-interactive-secondary p-2 rounded-full text-white hover:bg-interactive-secondary transition-all opacity-0 group-hover:opacity-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                aria-label="Reroll last response"
                            >
                                <RefreshIcon className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                            </button>
                            </div>
                        )}
                    </div>
                 </div>
            )
        }

        if (message.author === 'character') {
            return (
                 <div key={index} className="flex gap-4 group flex-row animate-slide-in-up">
                    <button onClick={() => onEntityClick('character', message.characterName || '')} className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-interactive-secondary overflow-hidden focus:outline-none focus:ring-2 ring-offset-2 ring-offset-background-secondary focus:ring-white">
                        {message.characterImageUrl ? (
                            <img src={message.characterImageUrl} alt={message.characterName} className="w-full h-full object-cover" />
                        ) : (
                             <UserCircleIcon className="w-8 h-8 text-text-secondary" />
                        )}
                    </button>
                    <div className="max-w-3xl">
                        <p className="text-xs text-text-secondary ml-3 mb-1">{message.characterName}</p>
                        <div className="relative rounded-lg bg-surface-primary text-text-primary p-4">
                            <p className="whitespace-pre-wrap">{message.text}</p>
                        </div>
                    </div>
                </div>
            )
        }

        return null;

      })}
      <div ref={endOfMessagesRef} />
    </div>
  );
};

export default StoryLog;