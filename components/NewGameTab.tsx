import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ALL_SCENARIOS } from '../constants';
import { RefreshIcon } from './icons';

interface NewGameTabProps {
  onStart: (prompt: string) => void;
}

const shuffleArray = (array: string[]) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};

const placeholders = [
  "I am a starship captain exploring an uncharted nebula...",
  "I wake up in a rusted-out bus, with no memory of how I got here...",
  "The year is 1922. I'm a private detective in a city of clockwork robots...",
  "I am the last survivor in a world overrun by sentient plants...",
];

const NewGameTab: React.FC<NewGameTabProps> = ({ onStart }) => {
  const [prompt, setPrompt] = useState('');
  const [selectedScenario, setSelectedScenario] = useState('');
  const [scenarios, setScenarios] = useState<string[]>([]);
  const [placeholder, setPlaceholder] = useState(placeholders[0]);
  
  const scenarioDeck = useRef({
    shuffled: [] as string[],
    index: 0
  });

  useEffect(() => {
    const interval = setInterval(() => {
        setPlaceholder(prev => {
            const currentIndex = placeholders.indexOf(prev);
            const nextIndex = (currentIndex + 1) % placeholders.length;
            return placeholders[nextIndex];
        });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const getNewScenarios = useCallback(() => {
    // If deck is empty or fully used, create a new one
    if (scenarioDeck.current.shuffled.length === 0 || scenarioDeck.current.index >= scenarioDeck.current.shuffled.length) {
        scenarioDeck.current.shuffled = shuffleArray(ALL_SCENARIOS);
        scenarioDeck.current.index = 0;
    }

    const newScenarios = scenarioDeck.current.shuffled.slice(scenarioDeck.current.index, scenarioDeck.current.index + 4);
    scenarioDeck.current.index += 4;
    setScenarios(newScenarios);
  }, []);

  useEffect(() => {
    getNewScenarios();
  }, [getNewScenarios]);

  const handleStart = () => {
    if (prompt.trim()) {
      onStart(prompt.trim());
    } else if (selectedScenario) {
      onStart(selectedScenario);
    }
  };
  
  const handleScenarioClick = (scenario: string) => {
    setPrompt(scenario);
    setSelectedScenario(scenario);
  };

  return (
    <div className="animate-fade-in pt-6">
      <p className="text-stone-400 mb-6 text-center max-w-2xl mx-auto">Craft your opening scene. Describe your character, the setting, and what's happening. The more detail you provide, the richer your story will be.</p>
      
      <textarea
        value={prompt}
        onChange={(e) => {
          setPrompt(e.target.value);
          setSelectedScenario('');
        }}
        placeholder={placeholder}
        className="w-full bg-stone-800 border border-stone-700 rounded-lg p-4 mb-4 text-stone-200 placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-accent transition duration-200 h-28 resize-none font-mono"
      />

      <div className="mb-8">
            <p className="text-stone-400 mb-4 text-center">Or, get started with a scenario:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {scenarios.map((scenario) => (
                  <button
                      key={scenario}
                      onClick={() => handleScenarioClick(scenario)}
                      className={`p-4 rounded-lg text-left transition-colors duration-200 border-2 text-sm h-full ${selectedScenario === scenario ? 'bg-accent/20 border-accent' : 'bg-stone-800/50 border-stone-700 hover:bg-stone-700/50'}`}
                  >
                      {scenario}
                  </button>
              ))}
          </div>
          <div className="flex justify-center mt-4">
            <button onClick={getNewScenarios} className="flex items-center gap-2 text-sm text-stone-400 hover:text-white transition-colors bg-stone-800/50 hover:bg-stone-700/50 px-4 py-2 rounded-lg">
                <RefreshIcon className="w-4 h-4" />
                More Scenarios
            </button>
        </div>
      </div>

      <button
        onClick={handleStart}
        disabled={!prompt.trim() && !selectedScenario}
        className="w-full bg-accent text-white font-bold py-3 px-8 rounded-full text-lg hover:bg-accent-hover disabled:bg-stone-800 disabled:text-stone-500 disabled:cursor-not-allowed transition duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-stone-900 focus:ring-white animate-glow disabled:animate-none"
      >
        Begin Your Story
      </button>
    </div>
  );
};

export default NewGameTab;
