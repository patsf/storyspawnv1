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

  // FIX: Replace findLastIndex with a manual loop for wider compatibility.
  let lastGeminiMessageIndex = -1;
  for (let i = history.length - 1; i >= 0; i--) {
    if (history[i].author === 'gemini' && history[i].type !== 'thinking') {
      lastGeminiMessageIndex = i;
      break;
    }
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 font-mono">
      {history.map((message, index) => {
        const isMostRecentGemini = index === lastGeminiMessageIndex;
        return (
          <div key={index} className={`flex gap-4 group ${message.author === 'user' ? 'flex-row-reverse' : 'flex-row'} animate-slide-in-up`}>
             {message.author === 'user' ? (
                <button onClick={onUserIconClick} className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-stone-700 overflow-hidden focus:outline-none focus:ring-2 ring-offset-2 ring-offset-stone-900 focus:ring-white">
                    {customCharacter?.portraitUrl ? (
                        <img src={customCharacter.portraitUrl} alt="Your portrait" className="w-full h-full object-cover" />
                    ) : (
                        <UserCircleIcon className="w-8 h-8 text-stone-400" />
                    )}
                </button>
            ) : (
                <button 
                    onClick={() => message.type !== 'thinking' && onGeminiIconClick(message.text)} 
                    disabled={message.type === 'thinking'}
                    className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-cyan-500/20 disabled:cursor-not-allowed focus:outline-none focus:ring-2 ring-offset-2 ring-offset-stone-900 focus:ring-cyan-400 transition-transform hover:scale-110"
                    aria-label="Summarize message"
                >
                    <QuillIcon className="w-5 h-5 text-cyan-400" />
                </button>
            )}

            <div className={`relative max-w-2xl rounded-lg ${
              message.author === 'user' 
                ? 'bg-stone-800 text-stone-200 p-4' 
                : `bg-black/40 text-stone-300 ${isMostRecentGemini && !isLoading ? 'shadow-lg shadow-cyan-500/10' : ''}`
            }`}>
              {message.author === 'gemini' ? (
                  <GeminiMessage 
                      message={message}
                      isMostRecent={isMostRecentGemini}
                      isLoading={isLoading}
                      gameState={gameState}
                      onEntityClick={onEntityClick}
                      onKeywordHover={onKeywordHover}
                      onLocationClick={onLocationClick}
                      onDiscoveryClick={onDiscoveryClick}
                      onCombatClick={onCombatClick}
                      onEventClick={onEventClick}
                  />
              ) : (
                  <p className="whitespace-pre-wrap">{message.text}</p>
              )}

              {message.author === 'gemini' && message.type !== 'thinking' && isMostRecentGemini && (
                <div className="relative">
                  <button 
                    onClick={onReroll} 
                    disabled={isLoading}
                    className="absolute -bottom-2 right-0 bg-stone-700 p-2 rounded-full text-white hover:bg-stone-600 transition-all opacity-0 group-hover:opacity-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Reroll last response"
                  >
                    <RefreshIcon className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              )}
            </div>
          </div>
        )
      })}
      <div ref={endOfMessagesRef} />
    </div>
  );
};

export default StoryLog;
