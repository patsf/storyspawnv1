import React from 'react';
import { RefreshIcon } from './icons';

interface ActionSuggestionsProps {
  suggestions: string[];
  onSuggestionClick: (suggestion: string) => void;
  isLoading: boolean;
  onReroll: () => void;
}

const ActionSuggestions: React.FC<ActionSuggestionsProps> = ({ suggestions, onSuggestionClick, isLoading, onReroll }) => {
  if (isLoading) {
    return (
        <div className="h-10"></div>
    );
  }

  if (suggestions.length === 0) {
      return (
        <div className="h-10 flex items-center gap-2">
            <p className="text-xs text-text-secondary opacity-70 flex-shrink-0">Generating suggestions...</p>
        </div>
      )
  }

  return (
    <div className="flex items-center gap-2 py-2 animate-fade-in" data-tour-id="action-suggestions">
      <p className="text-xs text-text-secondary opacity-70 flex-shrink-0">Try:</p>
      <div className="flex items-center gap-2 overflow-x-auto flex-1 no-scrollbar">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onSuggestionClick(suggestion)}
            className="bg-surface-secondary border border-border-primary text-text-secondary text-xs whitespace-nowrap px-3 py-1.5 rounded-full hover:bg-surface-primary hover:border-interactive-secondary hover:text-text-primary transition-all duration-200"
          >
            {suggestion}
          </button>
        ))}
      </div>
       <button onClick={onReroll} className="p-2 rounded-full bg-surface-secondary border border-border-primary text-text-secondary hover:text-text-primary transition-colors duration-200">
            <RefreshIcon className="w-4 h-4" />
       </button>
    </div>
  );
};

export default ActionSuggestions;
