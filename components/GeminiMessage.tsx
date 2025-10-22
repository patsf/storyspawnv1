import React from 'react';
import type { StoryMessage, GameState } from '../types';
import { useTypewriter } from '../hooks/useTypewriter';
import { ExclamationCircleIcon, DiscoveryIcon, LocationIcon } from './icons';

interface GeminiMessageProps {
    message: StoryMessage;
    gameState: GameState;
    onEntityClick: (type: 'character' | 'item', name: string) => void;
    onKeywordHover: (keyword: string | null, rect: DOMRect | null) => void;
    onLocationClick: (locationName: string) => void;
    onDiscoveryClick: (discoveryText: string) => void;
    onCombatClick: () => void;
    onEventClick: (eventText: string) => void;
}

const ThinkingIndicator = () => (
    <div className="flex items-center justify-center gap-2 text-stone-400 p-4 animate-fade-in h-12">
      <div className="w-2 h-2 bg-accent rounded-full animate-subtle-pulse" style={{ animationDelay: '0s' }}></div>
      <div className="w-2 h-2 bg-accent rounded-full animate-subtle-pulse" style={{ animationDelay: '0.2s' }}></div>
      <div className="w-2 h-2 bg-accent rounded-full animate-subtle-pulse" style={{ animationDelay: '0.4s' }}></div>
    </div>
)

const markerIcons: Record<string, React.FC<React.SVGProps<SVGSVGElement>>> = {
    EVENT: ExclamationCircleIcon,
    DISCOVERY: DiscoveryIcon,
    COMBAT: ExclamationCircleIcon,
    LOCATION: LocationIcon,
};

const markerStyles: Record<string, string> = {
    EVENT: 'story-marker-event',
    DISCOVERY: 'story-marker-discovery',
    COMBAT: 'story-marker-combat',
    LOCATION: 'story-marker-location',
}

const InteractiveText: React.FC<Omit<GeminiMessageProps, 'message'> & { text: string }> = ({ text, gameState, onEntityClick, onKeywordHover, onLocationClick, onDiscoveryClick, onCombatClick, onEventClick }) => {
    // Pre-process to fix AI occasionally sending unhandled tags like [CHARACTER: ...]
    const preprocessedText = text.replace(/\[(CHARACTER|ITEM|CLUE):([^\]]+)\]/gi, '$2');

    const keywords = [
        ...gameState.characters.map(c => c.name),
        ...gameState.playerStatus.inventory.map(i => i.name)
    ].filter(Boolean);

    if (keywords.length === 0 && !preprocessedText.includes('[')) {
        return <>{preprocessedText}</>;
    }
    
    const escapedKeywords = keywords.map(kw => kw.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'));

    const markerRegexPart = `(\\[(EVENT|DISCOVERY|COMBAT|LOCATION):([^\\]]+)\\])`;
    const keywordRegexPart = escapedKeywords.length > 0 ? `\\b(${escapedKeywords.join('|')})\\b` : '';
    
    const regexParts = [markerRegexPart, keywordRegexPart].filter(Boolean);
    const combinedRegex = new RegExp(regexParts.join('|'), 'gi');

    const parts = [];
    let lastIndex = 0;

    const allMatches = Array.from(preprocessedText.matchAll(combinedRegex));

    // FIX: Explicitly typed `match` as RegExpMatchArray to resolve type errors.
    allMatches.forEach((match: RegExpMatchArray, i) => {
        const [fullMatch, _fullMarker, markerType, markerContent, keyword] = match;
        const startIndex = match.index || 0;

        if (startIndex > lastIndex) {
            parts.push(<React.Fragment key={`text-${i}`}>{preprocessedText.slice(lastIndex, startIndex)}</React.Fragment>);
        }

        if (markerType) { // It's a [MARKER:...]
            const Icon = markerIcons[markerType];
            const style = markerStyles[markerType];
            const content = markerContent.trim();
            const isClickable = ['LOCATION', 'DISCOVERY', 'COMBAT', 'EVENT'].includes(markerType);
            
            const MarkerComponent = (
                <span className={`story-marker ${style} ${isClickable ? 'cursor-pointer hover:ring-2 hover:ring-current' : ''}`}>
                    {Icon && <Icon className="w-4 h-4" />}
                    {content}
                </span>
            );

            if (isClickable) {
                let clickHandler = () => {};
                if (markerType === 'LOCATION') clickHandler = () => onLocationClick(content);
                else if (markerType === 'DISCOVERY') clickHandler = () => onDiscoveryClick(content);
                else if (markerType === 'COMBAT') clickHandler = onCombatClick;
                else if (markerType === 'EVENT') clickHandler = () => onEventClick(content);


                parts.push(
                    <button key={`marker-${i}`} onClick={clickHandler} className="inline-block text-left">
                        {MarkerComponent}
                    </button>
                );
            } else {
                 parts.push(<React.Fragment key={`marker-${i}`}>{MarkerComponent}</React.Fragment>);
            }

        } else if (keyword) { // It's a keyword
            const isCharacter = gameState.characters.some(c => c.name.toLowerCase() === keyword.toLowerCase());
            const isItem = gameState.playerStatus.inventory.some(i => i.name.toLowerCase() === keyword.toLowerCase());
            const entityType = isCharacter ? 'character' : (isItem ? 'item' : null);

            const handleClick = () => {
                if (entityType) onEntityClick(entityType, keyword);
            };

            const handleMouseEnter = (e: React.MouseEvent<HTMLSpanElement>) => {
                onKeywordHover(keyword, e.currentTarget.getBoundingClientRect());
            };

            const handleMouseLeave = () => {
                onKeywordHover(null, null);
            }

            parts.push(
                <span
                    key={`keyword-${i}`}
                    className="text-accent hover:underline cursor-pointer font-bold"
                    onClick={handleClick}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                >
                    {keyword}
                </span>
            );
        }
        
        lastIndex = startIndex + fullMatch.length;
    });

    if (lastIndex < preprocessedText.length) {
        parts.push(<React.Fragment key="text-end">{preprocessedText.slice(lastIndex)}</React.Fragment>);
    }

    return <>{parts}</>;
};


const GeminiMessage: React.FC<GeminiMessageProps> = ({ message, gameState, onEntityClick, onKeywordHover, onLocationClick, onDiscoveryClick, onCombatClick, onEventClick }) => {
    
    if (message.type === 'thinking') {
        return <ThinkingIndicator />;
    }

    const typedText = useTypewriter(message.text);

    return (
        <div className="p-4 animate-fade-in">
            <div className="whitespace-pre-wrap" style={{ letterSpacing: 'normal' }}>
                 <InteractiveText 
                    text={typedText}
                    gameState={gameState}
                    onEntityClick={onEntityClick}
                    onKeywordHover={onKeywordHover}
                    onLocationClick={onLocationClick}
                    onDiscoveryClick={onDiscoveryClick}
                    onCombatClick={onCombatClick}
                    onEventClick={onEventClick}
                />
            </div>
            {message.gameTime && (
                <p className="text-right text-xs text-stone-500 font-mono mt-3 pt-2 border-t border-stone-700/50">{message.gameTime}</p>
            )}
        </div>
    );
}

export default GeminiMessage;