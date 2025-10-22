import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Chat, Type, Part } from '@google/genai';

import StoryLog from './components/StoryLog';
import UserInput from './components/UserInput';
import SidePanel from './components/SidePanel';
import HomePage from './components/HomePage';
import InventoryItemModal from './components/InventoryItemModal';
import CharacterModal from './components/CharacterModal';
import LoadingOverlay from './components/LoadingOverlay';
import GameHeader from './components/GameHeader';
import GameMenuModal from './components/GameMenuModal';
import ActionSuggestions from './components/ActionSuggestions';
import Tooltip from './components/Tooltip';
import DynamicBackground from './components/DynamicBackground';
import GameOverBanner from './components/GameOverModal';
import GameStartLoader from './components/GameStartLoader';
import EnvironmentIndicator from './components/EnvironmentIndicator';
import InfoModal from './components/InfoModal';
import ProfileModal from './components/ProfileModal';
import SummaryModal from './components/SummaryModal';
import NewGameModal from './components/NewGameModal';
import InGameCustomizationModal from './components/InGameCustomizationModal';
import SettingsModal from './components/SettingsModal';
import CasinoModal from './components/CasinoModal';
import OnboardingModal from './components/OnboardingModal';
import LocationDisplay from './components/LocationDisplay';

import { initChat, generateCharacterImage, generateActionSuggestions, getEnvironmentType, elaborateOnText, summarizeMessage, summarizeStory } from './services/geminiService';
import { saveGameSession, getGameSessions, getCustomCharacter, saveCustomCharacter, getAppSettings, saveAppSettings } from './services/storageService';
import { SYSTEM_INSTRUCTION, INITIAL_PLAYER_STATUS, EnvironmentType } from './constants';
import type { StoryMessage, GameState, InventoryItem, Character, GameSession, Quest, WorldInfo, StatusEffect, Objective, CustomCharacter, Injury, AppSettings } from './types';

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        playerStatus: {
            type: Type.OBJECT,
            properties: {
                health: { type: Type.NUMBER, description: "Player's health, from 0 to 100." },
                resolve: { type: Type.NUMBER, description: "Player's mental resolve, from 0 to 100." },
                currency: { type: Type.NUMBER, description: "Player's currency, called 'Gold'." },
                inventory: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            name: { type: Type.STRING },
                            description: { type: Type.STRING },
                            equippable: { type: Type.BOOLEAN, description: "Whether the item can be equipped." },
                            slot: { type: Type.STRING, enum: ['head', 'accessory', 'weapon', 'torso'], description: "Where the item is equipped." }
                        },
                        required: ['name', 'description'],
                    },
                },
                statusEffects: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            name: { type: Type.STRING },
                            description: { type: Type.STRING },
                            type: { type: Type.STRING, enum: ['positive', 'negative'] },
                        },
                        required: ['name', 'description', 'type'],
                    },
                },
                injuries: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            location: { type: Type.STRING, enum: ['head', 'torso', 'leftArm', 'rightArm', 'leftLeg', 'rightLeg'] },
                            description: { type: Type.STRING },
                            severity: { type: Type.STRING, enum: ['minor', 'moderate', 'critical'] },
                        },
                        required: ['location', 'description', 'severity'],
                    },
                },
            },
            required: ['health', 'resolve', 'inventory', 'statusEffects', 'currency', 'injuries'],
        },
        characters: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING },
                    description: { type: Type.STRING, description: "A detailed physical description of the character for image generation." },
                    status: { type: Type.STRING, enum: ['friendly', 'neutral', 'hostile', 'unknown', 'deceased'] },
                    knownInformation: { type: Type.ARRAY, items: { type: Type.STRING } },
                    location: { type: Type.STRING, description: "The character's last known location." },
                },
                required: ['name', 'description', 'status', 'knownInformation'],
            },
        },
        quests: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING },
                    status: { type: Type.STRING, enum: ['active', 'completed'] },
                    description: { type: Type.STRING },
                    objectives: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                text: { type: Type.STRING },
                                completed: { type: Type.BOOLEAN },
                            },
                            required: ['text', 'completed'],
                        }
                    }
                },
                required: ['title', 'status', 'description', 'objectives'],
            },
        },
        worldInfo: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    topic: { type: Type.STRING },
                    details: { type: Type.STRING },
                },
                required: ['topic', 'details'],
            },
        },
        gameTime: { type: Type.STRING, description: "The current in-game time. Be specific and descriptive, e.g., 'Day 1, 8:00 AM' or 'Year 34, Cycle 2, Day 15, Evening'." },
        story: { type: Type.STRING, description: "The narrative text to present to the player. This is the main story content." },
        dialogue: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    characterName: { type: Type.STRING },
                    text: { type: Type.STRING },
                },
                required: ['characterName', 'text'],
            }
        },
        allowCharacterCustomization: {
            type: Type.OBJECT,
            properties: {
                enabled: { type: Type.BOOLEAN },
                reason: { type: Type.STRING },
            },
            description: "Signals that the player has an opportunity to change their appearance in-game."
        },
        casinoAvailable: { type: Type.BOOLEAN, description: "Set to true if the player is in a location or situation where they can gamble." },
        mapData: {
            type: Type.OBJECT,
            description: "Graph data representing the player's explored world map.",
            properties: {
                locations: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            id: { type: Type.STRING, description: "A unique, simple, machine-readable ID for the location (e.g., 'rusty_flagon_tavern')." },
                            name: { type: Type.STRING, description: "The display name of the location." },
                            description: { type: Type.STRING, description: "A brief description for map tooltips." },
                            isCurrent: { type: Type.BOOLEAN, description: "Set to true for the player's current location, false for all others." },
                            x: { type: Type.NUMBER, description: "An X coordinate between 0 and 100 for map placement." },
                            y: { type: Type.NUMBER, description: "A Y coordinate between 0 and 100 for map placement." },
                            type: { type: Type.STRING, enum: ['settlement', 'dungeon', 'landmark', 'natural', 'interior', 'poi'], description: "The type of the location, used for map icons." },
                        },
                        required: ['id', 'name', 'description', 'isCurrent', 'x', 'y', 'type'],
                    }
                },
                connections: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            from: { type: Type.STRING, description: "The 'id' of the starting location." },
                            to: { type: Type.STRING, description: "The 'id' of the ending location." },
                        },
                        required: ['from', 'to'],
                    }
                }
            },
            required: ['locations', 'connections'],
        }
    },
    required: ['playerStatus', 'characters', 'quests', 'worldInfo', 'gameTime', 'story'],
};

type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night' | 'unknown';
type SidePanelTab = 'status' | 'injuries' | 'characters' | 'quests' | 'world' | 'crafting' | 'avatar';

function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined);
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

const themeIds = ['default', 'violet', 'crimson', 'emerald', 'amber', 'cyberpunk', 'solaris', 'aurora', 'grove', 'dune', 'rose', 'abyss', 'midnight', 'daybreak'];
const themeClasses = themeIds.map(id => `theme-${id}`);


function App() {
  const [chat, setChat] = useState<Chat | null>(null);
  const [history, setHistory] = useState<StoryMessage[]>([]);
  const [gameState, setGameState] = useState<GameState>({
    playerStatus: INITIAL_PLAYER_STATUS,
    characters: [],
    quests: [],
    worldInfo: [],
    gameTime: "Day 1, Morning",
    story: "",
    mapData: { locations: [], connections: [] },
    allowCharacterCustomization: { enabled: false, reason: '' },
    casinoAvailable: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [userInput, setUserInput] = useState('');

  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [isCharacterModalOpen, setIsCharacterModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const [tooltip, setTooltip] = useState<{ visible: boolean; content: React.ReactNode; x: number; y: number; }>({ visible: false, content: null, x: 0, y: 0 });
  
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<SidePanelTab>('status');
  const [isSaving, setIsSaving] = useState(false);
  const [currentEnvironment, setCurrentEnvironment] = useState<EnvironmentType>('default');
  const [isGameOver, setIsGameOver] = useState(false);
  const [isStartingGame, setIsStartingGame] = useState(false);
  const [environmentNotification, setEnvironmentNotification] = useState('');
  
  const [seenCounts, setSeenCounts] = useState({ characters: 0, quests: 0, worldInfo: 0 });
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('morning');
  const [currentLocation, setCurrentLocation] = useState<string>('Unknown Area');
  const [timePlayed, setTimePlayed] = useState(0);

  const [isShaking, setIsShaking] = useState(false);
  const [highlightedItem, setHighlightedItem] = useState<string | null>(null);
  const [statusVignette, setStatusVignette] = useState<{ color: string, key: number } | null>(null);
  const [infoModalState, setInfoModalState] = useState({ isOpen: false, title: '', content: '', isLoading: false });

  const [customCharacter, setCustomCharacter] = useState<CustomCharacter | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [summaryModalState, setSummaryModalState] = useState({ isOpen: false, title: '', content: '', isLoading: false });
  const [isNewGameModalOpen, setIsNewGameModalOpen] = useState(false);
  const [isCustomizationModalOpen, setIsCustomizationModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isCasinoModalOpen, setIsCasinoModalOpen] = useState(false);
  const [isCasinoAvailable, setIsCasinoAvailable] = useState(false);
  const [appSettings, setAppSettings] = useState<AppSettings>(getAppSettings());
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  
  const [elaboratedInfo, setElaboratedInfo] = useState<Record<string, string>>({});
  const [cachedSummary, setCachedSummary] = useState<{ content: string, historyLength: number } | null>(null);


  const prevGameState = usePrevious(gameState);

    useEffect(() => {
        // Manage theme classes and styles
        document.body.classList.remove(...themeClasses);
        const rootStyle = document.documentElement.style;
        const themeColorVars = [
            '--color-background-primary', '--color-background-secondary', '--color-surface-primary',
            '--color-surface-secondary', '--color-border-primary', '--color-interactive-secondary',
            '--color-text-primary', '--color-text-secondary', '--color-accent-primary',
            '--color-accent-secondary', '--color-accent-text', '--color-accent-glow'
        ];
        themeColorVars.forEach(v => rootStyle.removeProperty(v));

        if (appSettings.theme === 'custom' && appSettings.customTheme) {
            const { customTheme } = appSettings;
            const hexToRgba = (hex: string, alpha: number) => {
                if (!/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) return `rgba(59, 130, 246, ${alpha})`;
                let fullHex = hex.slice(1);
                if (fullHex.length === 3) {
                    fullHex = fullHex.split('').map(c => c + c).join('');
                }
                const r = parseInt(fullHex.substring(0, 2), 16);
                const g = parseInt(fullHex.substring(2, 4), 16);
                const b = parseInt(fullHex.substring(4, 6), 16);
                return `rgba(${r}, ${g}, ${b}, ${alpha})`;
            };

            rootStyle.setProperty('--color-background-primary', customTheme.bgPrimary);
            rootStyle.setProperty('--color-background-secondary', customTheme.bgSecondary);
            rootStyle.setProperty('--color-surface-primary', customTheme.surfacePrimary);
            rootStyle.setProperty('--color-border-primary', customTheme.borderPrimary);
            rootStyle.setProperty('--color-text-primary', customTheme.textPrimary);
            rootStyle.setProperty('--color-text-secondary', customTheme.textSecondary);
            rootStyle.setProperty('--color-accent-primary', customTheme.accentPrimary);
            rootStyle.setProperty('--color-accent-secondary', customTheme.accentSecondary);
            
            // Derived values
            rootStyle.setProperty('--color-surface-secondary', hexToRgba(customTheme.surfacePrimary, 0.75));
            rootStyle.setProperty('--color-interactive-secondary', customTheme.borderPrimary);
            rootStyle.setProperty('--color-accent-text', customTheme.accentSecondary);
            rootStyle.setProperty('--color-accent-glow', hexToRgba(customTheme.accentPrimary, 0.3));

        } else if (appSettings.theme) {
            document.body.classList.add(`theme-${appSettings.theme}`);
        }
        
        // Manage other body classes
        if (appSettings.reducedMotion) {
            document.body.classList.add('reduced-motion');
        } else {
            document.body.classList.remove('reduced-motion');
        }
        
        // Font size
        document.documentElement.classList.remove('text-sm', 'text-base', 'text-lg');
        document.documentElement.classList.add(`text-${appSettings.fontSize || 'base'}`);

    }, [appSettings]);
  
  useEffect(() => {
    setCustomCharacter(getCustomCharacter());
  }, [isGameStarted, isCustomizationModalOpen]);

  // Screen shake on new injury & health loss vignette
  useEffect(() => {
    if (prevGameState) {
        if (gameState.playerStatus.injuries.length > prevGameState.playerStatus.injuries.length) {
            setIsShaking(true);
            setTimeout(() => setIsShaking(false), 400);
        }
        if (gameState.playerStatus.health < prevGameState.playerStatus.health) {
            const damage = prevGameState.playerStatus.health - gameState.playerStatus.health;
            const intensity = Math.min(0.8, 0.3 + damage / 50); 
            setStatusVignette({ color: `inset 0 0 150px 40px rgba(239, 68, 68, ${intensity})`, key: Date.now() });
        }
    }
  }, [gameState.playerStatus.injuries, gameState.playerStatus.health, prevGameState]);
  
  useEffect(() => {
    const onboardingCompleted = localStorage.getItem('storyspawn_interactive_onboarding_completed');
    if (!onboardingCompleted && isGameStarted) {
        setIsOnboardingOpen(true);
    }
  }, [isGameStarted]);

  // Time played tracker
  useEffect(() => {
      if (isGameStarted && !isMenuOpen && !isGameOver) {
          const interval = setInterval(() => {
              setTimePlayed(prev => prev + 1);
          }, 1000);
          return () => clearInterval(interval);
      }
  }, [isGameStarted, isMenuOpen, isGameOver]);

  const newItems = useMemo(() => {
    if (!prevGameState) return [];
    return gameState.playerStatus.inventory
      .filter(item => !prevGameState.playerStatus.inventory.some(prevItem => prevItem.name === item.name))
      .map(item => item.name);
  }, [gameState.playerStatus.inventory, prevGameState]);
  
  const newEffects = useMemo(() => {
    if (!prevGameState) return [];
    return gameState.playerStatus.statusEffects
      .filter((effect: StatusEffect) => !prevGameState.playerStatus.statusEffects.some((prevEffect: StatusEffect) => prevEffect.name === effect.name));
  }, [gameState.playerStatus.statusEffects, prevGameState]);

  useEffect(() => {
      if (newEffects.length > 0) {
          const newNegativeEffect = newEffects.find(e => e.type === 'negative');
          if (newNegativeEffect) {
              let color = 'rgba(239, 68, 68, 0.25)'; // Default red for damage
              if (newNegativeEffect.name.toLowerCase().includes('poison')) {
                  color = 'rgba(74, 222, 128, 0.25)'; // Green for poison
              }
              setStatusVignette({ color: `inset 0 0 120px 30px ${color}`, key: Date.now() });
          }
      }
  }, [newEffects]);
  
  const newCharacters = useMemo(() => {
    if (!prevGameState) return [];
    return gameState.characters
        .filter(char => !prevGameState.characters.some(prevChar => prevChar.name === char.name))
        .map(char => char.name);
  }, [gameState.characters, prevGameState]);

  const newQuests = useMemo(() => {
    if (!prevGameState) return [];
    return gameState.quests
        .filter(q => q.status === 'active' && !prevGameState.quests.some(pq => pq.title === q.title))
        .map(q => q.title);
  }, [gameState.quests, prevGameState]);

  useEffect(() => {
    if (gameState.story) {
        let lastMessage: StoryMessage | undefined;
        for (let i = history.length - 1; i >= 0; i--) {
            if (history[i].author === 'gemini' && history[i].type !== 'thinking') {
                lastMessage = history[i];
                break;
            }
        }
        
        if (lastMessage) {
            const locationMatches = [...lastMessage.text.matchAll(/\[LOCATION:([^\]]+)\]/g)];
            if (locationMatches.length > 0) {
                const lastLocation = locationMatches[locationMatches.length - 1][1];
                setCurrentLocation(lastLocation.trim());
            }
        }
    }
  }, [gameState.story, history]);

  useEffect(() => {
    if (gameState.playerStatus.health <= 0 && !isGameOver) {
      setIsGameOver(true);
    }
  }, [gameState.playerStatus.health, isGameOver]);
  
  useEffect(() => {
    if (currentEnvironment !== 'default' && isGameStarted) {
        const friendlyName = currentEnvironment.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        setEnvironmentNotification(friendlyName);
        const timer = setTimeout(() => {
            setEnvironmentNotification('');
        }, 3000);
        return () => clearTimeout(timer);
    }
  }, [currentEnvironment, isGameStarted]);

  useEffect(() => {
    const gameTimeStr = gameState.gameTime.toLowerCase();
    let newTimeOfDay: TimeOfDay = 'unknown';

    const timeMatch = gameTimeStr.match(/(\d{1,2})(?::\d{2})?\s*(am|pm)/);
    if (timeMatch) {
        let hour = parseInt(timeMatch[1]);
        const period = timeMatch[2];

        if (hour === 12) { // Handle 12am/12pm
            hour = period === 'am' ? 0 : 12;
        } else if (period === 'pm') {
            hour += 12;
        }
        
        // 0-4: Night, 5-11: Morning, 12-17: Afternoon, 18-23: Evening
        if (hour >= 0 && hour <= 4) newTimeOfDay = 'night';
        else if (hour >= 5 && hour <= 11) newTimeOfDay = 'morning';
        else if (hour >= 12 && hour <= 17) newTimeOfDay = 'afternoon';
        else if (hour >= 18 && hour <= 23) newTimeOfDay = 'evening';
    } else {
        // Fallback to keyword matching
        if (gameTimeStr.includes('night') || gameTimeStr.includes('midnight')) newTimeOfDay = 'night';
        else if (gameTimeStr.includes('morning') || gameTimeStr.includes('dawn') || gameTimeStr.includes('sunrise')) newTimeOfDay = 'morning';
        else if (gameTimeStr.includes('afternoon') || gameTimeStr.includes('noon') || gameTimeStr.includes('midday')) newTimeOfDay = 'afternoon';
        else if (gameTimeStr.includes('evening') || gameTimeStr.includes('dusk') || gameTimeStr.includes('sunset')) newTimeOfDay = 'evening';
    }
    
    if (newTimeOfDay !== 'unknown' && newTimeOfDay !== timeOfDay) {
        setTimeOfDay(newTimeOfDay);
    }
  }, [gameState.gameTime, timeOfDay]);

  useEffect(() => {
    document.body.classList.remove('time-of-day-evening', 'time-of-day-night');
    if (timeOfDay !== 'unknown') {
        if (timeOfDay === 'evening' || timeOfDay === 'night') {
            document.body.classList.add(`time-of-day-${timeOfDay}`);
        }
    }
  }, [timeOfDay]);


  useEffect(() => {
    if (!isLoading && isGameStarted && sessionId && history.length > 1 && !isGameOver) {
      setIsSaving(true);
      const sessions = getGameSessions();
      const currentSession = sessions.find(s => s.id === sessionId);
      const session: GameSession = {
          id: sessionId,
          title: currentSession?.title || "Untitled Adventure",
          lastPlayed: new Date().toISOString(),
          gameState: gameState,
          history: history,
          timePlayed: timePlayed,
          worldImageUrl: currentSession?.worldImageUrl,
          worldTitle: currentSession?.worldTitle,
          locationImageUrl: gameState.locationImageUrl,
      };
      saveGameSession(session);
      setTimeout(() => setIsSaving(false), 2000);
    }
  }, [isLoading, isGameStarted, sessionId, gameState, history, isGameOver, timePlayed]);
  
  useEffect(() => {
    if (isGameStarted) {
      setSeenCounts({
        characters: gameState.characters.length,
        quests: gameState.quests.length,
        worldInfo: gameState.worldInfo.length,
      });
    }
  }, [isGameStarted, gameState.characters, gameState.quests, gameState.worldInfo]);

  const handleReturnToMenu = () => {
    setIsGameStarted(false);
    setIsGameOver(false);
    setHistory([]);
    setGameState({
        playerStatus: INITIAL_PLAYER_STATUS,
        characters: [],
        quests: [],
        worldInfo: [],
        gameTime: "Day 1, Morning",
        story: "",
        mapData: { locations: [], connections: [] },
        locationImageUrl: undefined,
    });
    setChat(null);
    setSessionId(null);
    setSuggestions([]);
    setElaboratedInfo({});
    setCachedSummary(null);
    setIsCasinoAvailable(false);
    setTimePlayed(0);
  };

  const handleNewGame = () => {
      handleReturnToMenu(); // Reset everything
      // The HomePage component will handle starting a new game
  }

  const processStreamedData = (jsonString: string): GameState | null => {
    if (!jsonString) {
      return null;
    }
    try {
      let sanitizedJsonString = jsonString.replace(/```json/g, '').replace(/```/g, '').trim();
      if (!sanitizedJsonString) return null;
      
      // Find the first '{' and the last '}' to extract the main JSON object, making parsing more robust.
      const firstBrace = sanitizedJsonString.indexOf('{');
      const lastBrace = sanitizedJsonString.lastIndexOf('}');
      if (firstBrace === -1 || lastBrace === -1 || lastBrace < firstBrace) {
          throw new Error("Invalid JSON structure: missing braces.");
      }
      
      sanitizedJsonString = sanitizedJsonString.substring(firstBrace, lastBrace + 1);

      const data = JSON.parse(sanitizedJsonString);
      return data as GameState;
    } catch (error) {
      console.error("Error parsing game state JSON:", error, "Raw JSON:", jsonString);
      return null;
    }
  };

  const getUpdatedCharactersWithImages = useCallback(async (newCharacters: Character[], currentCharacters: Character[]): Promise<Character[]> => {
    const existingImageMap = new Map<string, string>();
    currentCharacters.forEach(char => {
        if (char.imageUrl) {
            existingImageMap.set(char.name, char.imageUrl);
        }
    });

    const charactersToGenerate = newCharacters.filter(newChar =>
        !existingImageMap.has(newChar.name) && newChar.description && newChar.status !== 'deceased'
    );

    let generatedImageMap = new Map<string, string>();
    if (charactersToGenerate.length > 0) {
        // We don't have the full custom character object here, so we pass what we have from the game state.
        const imagePromises = charactersToGenerate.map(async (char) => {
            const imageUrl = await generateCharacterImage(char.description, char.name, 'unknown');
            return { name: char.name, imageUrl };
        });
        const generatedImages = await Promise.all(imagePromises);
        generatedImages.forEach(img => generatedImageMap.set(img.name, img.imageUrl));
    }

    return newCharacters.map(char => ({
        ...char,
        imageUrl: existingImageMap.get(char.name) || generatedImageMap.get(char.name) || char.imageUrl,
    }));
  }, []);
  
    const generateCharacterPreamble = (character: CustomCharacter | null): string => {
        if (!character) return '';

        let summary = `My character's current appearance is: ${character.appearanceSummary}.`;

        if (character.equippedItems && Object.keys(character.equippedItems).length > 0) {
            const equippedList = (Object.entries(character.equippedItems) as [keyof CustomCharacter['equippedItems'], InventoryItem][])
                .filter(([, item]) => item)
                .map(([slot, item]) => `${slot}: ${item!.name}`)
                .join(', ');
            if (equippedList) {
                summary += ` Equipped items: ${equippedList}.`;
            }
        }
        
        return `(System Note: This is a note to you, the AI. Do not repeat it to the player. ${summary} Ensure the story reflects this current state.)`;
    };

  const handleRerollSuggestions = useCallback(async (storyText?: string) => {
      if (appSettings.disableSuggestions) return;
      setSuggestions([]);
      const text = storyText || gameState.story;
      if (text) {
          const newSuggestions = await generateActionSuggestions(text);
          setSuggestions(newSuggestions);
      }
  }, [gameState.story, appSettings.disableSuggestions]);
  
  const streamResponse = useCallback(async (chatInstance: Chat, message: string | Part[]) => {
    if (isGameOver) return;
    setIsLoading(true);
    setSuggestions([]);
    let fullResponseJson = '';

    try {
      const stream = await chatInstance.sendMessageStream({
        message,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: "application/json",
          responseSchema: responseSchema,
        }
      });
      for await (const chunk of stream) {
        if (chunk.text) { // Prevent concatenating 'undefined'
          fullResponseJson += chunk.text;
        }
      }
    } catch (error) {
      console.error("Error streaming response:", error);
      const errorMessage: StoryMessage = {
        author: 'gemini',
        text: 'An unexpected error occurred while contacting the AI. Please check your connection or try again.'
      };
      setHistory(prev => {
        const newHistory = [...prev];
        const thinkingIndex = newHistory.findIndex(m => m.type === 'thinking');
        if (thinkingIndex !== -1) {
          newHistory[thinkingIndex] = errorMessage;
        }
        return newHistory;
      });
      setIsLoading(false);
      return;
    } finally {
      setIsLoading(false);
      const finalGameState = processStreamedData(fullResponseJson);
      
      if (!finalGameState) {
        const errorMessage: StoryMessage = {
            author: 'gemini',
            text: 'There was a problem generating the next part of the story. Please try rerolling or rephrasing your action.'
        };
        setHistory(prev => {
            const newHistory = [...prev];
            const thinkingIndex = newHistory.findIndex(m => m.type === 'thinking');
            if (thinkingIndex !== -1) {
                newHistory[thinkingIndex] = errorMessage;
            }
            return newHistory;
        });
        return; // End execution here
      }

      if (finalGameState) {

        setIsCasinoAvailable(!!finalGameState.casinoAvailable);

        const updatedCharacters = await getUpdatedCharactersWithImages(finalGameState.characters, gameState.characters);
        
        // Defensively merge game state to prevent data loss from AI response
        setGameState(prev => {
            const mergedState: GameState = {
                ...prev,
                ...finalGameState,
                characters: updatedCharacters,
                // If AI forgets quests, map, or world info, keep the old state.
                quests: finalGameState.quests && finalGameState.quests.length > 0 ? finalGameState.quests : prev.quests,
                worldInfo: finalGameState.worldInfo && finalGameState.worldInfo.length > 0 ? finalGameState.worldInfo : prev.worldInfo,
                mapData: finalGameState.mapData && finalGameState.mapData.locations.length > 0 ? finalGameState.mapData : prev.mapData,
                locationImageUrl: prev.locationImageUrl, // Preserve location image
            };
            return mergedState;
        });

        const messagesForThisTurn: StoryMessage[] = [];
        
        if (finalGameState.story) {
            const narrationMessage: StoryMessage = { author: 'gemini', text: finalGameState.story, gameTime: finalGameState.gameTime };
            messagesForThisTurn.push(narrationMessage);
        }

        if (finalGameState.dialogue) {
            for (const line of finalGameState.dialogue) {
                if (line.characterName.toLowerCase() === 'you') {
                    continue;
                }
                const character = updatedCharacters.find(c => c.name === line.characterName);
                const dialogueMessage: StoryMessage = {
                    author: 'character',
                    text: line.text,
                    characterName: line.characterName,
                    characterImageUrl: character?.imageUrl
                };
                messagesForThisTurn.push(dialogueMessage);
            }
        }


        setHistory(prev => {
          const newHistory = [...prev];
          const thinkingIndex = newHistory.findIndex(m => m.type === 'thinking');
          if (thinkingIndex !== -1) {
             if (messagesForThisTurn.length > 0) {
                 newHistory.splice(thinkingIndex, 1, ...messagesForThisTurn);
             } else {
                 newHistory.splice(thinkingIndex, 1); // Remove thinking if no response
             }
          }
          return newHistory;
        });

        if (finalGameState.story) {
          handleRerollSuggestions(finalGameState.story);
          const env = await getEnvironmentType(finalGameState.story);
          setCurrentEnvironment(env);
        }
      }
    }
  }, [isGameOver, gameState.characters, getUpdatedCharactersWithImages, handleRerollSuggestions]);
  
  const startGame = useCallback(async (
    userVisiblePrompt: string,
    hiddenPreamble?: string,
    world?: { title: string, imageUrl: string },
    locationImage?: { base64: string, mimeType: string }
) => {
    setIsStartingGame(true);
    const newSessionId = Date.now().toString();
    setSessionId(newSessionId);
    setIsGameOver(false);
    setElaboratedInfo({});
    setCachedSummary(null);
    setIsCasinoAvailable(false);
    setTimePlayed(0);

    const newChat = initChat([]);
    setChat(newChat);
    setIsGameStarted(true);
    
    const preamble = generateCharacterPreamble(getCustomCharacter());
    const userMessageText = locationImage ? "I look around and take in my surroundings." : userVisiblePrompt;
    
    let messageToSend: string | Part[];

    if (locationImage) {
        const imageUrl = `data:${locationImage.mimeType};base64,${locationImage.base64}`;
        setGameState(prev => ({...prev, locationImageUrl: imageUrl}));
        
        const imagePart: Part = { inlineData: { data: locationImage.base64, mimeType: locationImage.mimeType } };
        const textPart: Part = { text: `${preamble} (System Note: Start the story based on the provided image. My first action is: "${userMessageText}")` };
        messageToSend = [imagePart, textPart];
    } else {
        messageToSend = `${preamble} ${hiddenPreamble || ''} Start a new game with this scenario: ${userVisiblePrompt}`;
    }

    const userMessage: StoryMessage = { author: 'user', text: userMessageText };
    const thinkingMessage: StoryMessage = { author: 'gemini', text: '...', type: 'thinking' };
    setHistory([userMessage, thinkingMessage]);
    
    const initialSession: GameSession = {
        id: newSessionId,
        title: world?.title || userVisiblePrompt.slice(0, 50) + (userVisiblePrompt.length > 50 ? '...' : ''),
        lastPlayed: new Date().toISOString(),
        gameState: { ...gameState, locationImageUrl: locationImage ? `data:${locationImage.mimeType};base64,${locationImage.base64}` : undefined },
        history: [userMessage],
        timePlayed: 0,
        worldImageUrl: world?.imageUrl,
        worldTitle: world?.title,
    };
    saveGameSession(initialSession);

    try {
      await streamResponse(newChat, messageToSend);
    } finally {
      setIsStartingGame(false);
    }
}, [gameState, streamResponse]);

  const loadGame = useCallback((sessionIdToLoad: string) => {
      const sessions = getGameSessions();
      const sessionToLoad = sessions.find(s => s.id === sessionIdToLoad);
      if (sessionToLoad) {
          setGameState(sessionToLoad.gameState);
          setHistory(sessionToLoad.history);
          setSessionId(sessionToLoad.id);
          setIsGameOver(false);
          setElaboratedInfo({});
          setCachedSummary(null);
          setIsCasinoAvailable(sessionToLoad.gameState.casinoAvailable || false);
          setTimePlayed(sessionToLoad.timePlayed || 0);
          
          const chatHistory = sessionToLoad.history
            .filter(m => m.type !== 'thinking' && m.author !== 'character')
            .map(m => ({
                role: m.author === 'user' ? 'user' as const : 'model' as const,
                parts: [{ text: m.author === 'gemini' ? JSON.stringify({ story: m.text }) : m.text }]
            }));

          const newChat = initChat(chatHistory);
          setChat(newChat);
          setIsGameStarted(true);
          setActiveTab('world');
      }
  }, []);
  
  const handleSubmit = useCallback((input: string) => {
    if (!chat || isLoading || !sessionId || isGameOver) return;
    const userMessage: StoryMessage = { author: 'user', text: input };
    const thinkingMessage: StoryMessage = { author: 'gemini', text: '...', type: 'thinking' };
    setHistory(prev => [...prev, userMessage, thinkingMessage]);
    setUserInput('');
    const preamble = generateCharacterPreamble(customCharacter);
    streamResponse(chat, `${preamble} ${input}`);
  }, [chat, isLoading, sessionId, isGameOver, streamResponse, customCharacter]);
  
  const handleRerollLastResponse = useCallback(() => {
    if (isLoading) return;

    let lastUserMessageIndex = -1;
    for (let i = history.length - 1; i >= 0; i--) {
        if (history[i].author === 'user') {
            lastUserMessageIndex = i;
            break;
        }
    }

    if (lastUserMessageIndex === -1) return;

    const lastUserMessage = history[lastUserMessageIndex];
    
    setHistory(prev => prev.slice(0, lastUserMessageIndex + 1));
    const thinkingMessage: StoryMessage = { author: 'gemini', text: '...', type: 'thinking' };
    setHistory(prev => [...prev, thinkingMessage]);

    const preamble = generateCharacterPreamble(customCharacter);
    streamResponse(chat!, `${preamble} ${lastUserMessage.text}`);

  }, [history, isLoading, chat, streamResponse, customCharacter]);

  const handleItemClick = (item: InventoryItem) => {
    setSelectedItem(item);
    setIsItemModalOpen(true);
    setUserInput(`Examine ${item.name}`);
  };
  const handleUseItem = (item: InventoryItem) => {
    setIsItemModalOpen(false);
    handleSubmit(`Use ${item.name}`);
  };

  const handleDropItem = (item: InventoryItem) => {
    setIsItemModalOpen(false);
    handleSubmit(`Drop ${item.name}`);
  }

  const handleEquipItem = useCallback(async (item: InventoryItem) => {
    if (!customCharacter || !item.slot) return;
    setIsItemModalOpen(false);
    
    // Create an updated character object
    let newCharacter = { ...customCharacter };
    newCharacter.equippedItems = { ...newCharacter.equippedItems, [item.slot]: item };

    // Generate new summary with equipped item
    const equippedList = (Object.entries(newCharacter.equippedItems) as [keyof CustomCharacter['equippedItems'], InventoryItem][])
        .filter(([, item]) => item)
        .map(([slot, item]) => `${slot}: ${item!.name}`)
        .join(', ');
    const baseSummary = newCharacter.appearanceSummary.split(' wearing ')[0];
    newCharacter.appearanceSummary = equippedList 
        ? `${baseSummary} wearing ${equippedList}.`
        : `${baseSummary}.`;
    
    setCustomCharacter(newCharacter);

    // Regenerate portrait
    try {
        const imageUrl = await generateCharacterImage(newCharacter.appearanceSummary, newCharacter.name, newCharacter.pronouns, newCharacter.age, newCharacter.height);
        newCharacter.portraitUrl = imageUrl;
    } catch(e) {
        console.error("Failed to update portrait on equip:", e);
    }

    setCustomCharacter(newCharacter);
    saveCustomCharacter(newCharacter);

    // Inform the AI
    handleSubmit(`(I equip the ${item.name}.)`);
  }, [customCharacter, handleSubmit]);

    const handleUnequipItem = useCallback((item: InventoryItem) => {
        if (!customCharacter || !item.slot) return;

        let newCharacter = { ...customCharacter };
        if (newCharacter.equippedItems) {
            delete newCharacter.equippedItems[item.slot];
        }

        const equippedItemsList = Object.values(newCharacter.equippedItems || {})
            .filter(Boolean)
            .map((i: InventoryItem) => i!.name)
            .join(', ');
        const baseSummary = newCharacter.appearanceSummary.split(' wearing ')[0];
        newCharacter.appearanceSummary = equippedItemsList
            ? `${baseSummary} wearing ${equippedItemsList}.`
            : `${baseSummary}.`;

        setCustomCharacter(newCharacter);
        saveCustomCharacter(newCharacter);
        handleSubmit(`(I unequip the ${item.name}.)`);
    }, [customCharacter, handleSubmit]);
  
  const handleCharacterClick = (character: Character) => {
    setSelectedCharacter(character);
    setIsCharacterModalOpen(true);
    if (character.status !== 'deceased') {
      setUserInput(`Talk to ${character.name}`);
    }
  };
  
  const handleEntityClick = (type: 'character' | 'item', name: string) => {
    setIsSidePanelOpen(true);
    if (type === 'character') {
      const character = gameState.characters.find(c => c.name.toLowerCase() === name.toLowerCase());
      if (character) {
        setSelectedCharacter(character);
        setIsCharacterModalOpen(true);
      }
    } else if (type === 'item') {
      const item = gameState.playerStatus.inventory.find(i => i.name.toLowerCase() === name.toLowerCase());
      if (item) {
        setActiveTab('status');
        setHighlightedItem(item.name);
        setTimeout(() => setHighlightedItem(null), 2500);
      }
    }
  };

  const handleLocationClick = (locationName: string) => {
      setIsSidePanelOpen(true);
      setActiveTab('world');
  };
  
  const handleDiscoveryClick = async (discoveryText: string) => {
      const foundItem = gameState.playerStatus.inventory.find(item => 
          new RegExp(`\\b${item.name}\\b`, 'i').test(discoveryText)
      );

      if (foundItem) { // It's an item
          setHighlightedItem(foundItem.name);
          setTimeout(() => setHighlightedItem(null), 2500);
          setIsSidePanelOpen(true);
          setActiveTab('status');
      } else { // It's information
          if (elaboratedInfo[discoveryText]) {
              setInfoModalState({ isOpen: true, title: discoveryText, content: elaboratedInfo[discoveryText], isLoading: false });
              return;
          }

          setInfoModalState({ isOpen: true, title: "Investigating...", content: '', isLoading: true });
          
          const storyContext = history.slice(-5).map(h => h.text).join('\n');
          const elaboration = await elaborateOnText(discoveryText, storyContext);
          
          setElaboratedInfo(prev => ({ ...prev, [discoveryText]: elaboration }));
          setInfoModalState({ isOpen: true, title: discoveryText, content: elaboration, isLoading: false });
      }
  };
  
  const handleCombatClick = () => {
    setIsSidePanelOpen(true);
    setActiveTab('characters');
  };
  
  const handleEventClick = (eventText: string) => {
    setUserInput(`In response to "${eventText}", I `);
  };

  const handleObjectiveClick = (objective: Objective) => {
    if (!objective.completed) {
      setUserInput(`Attempt to ${objective.text}`);
    }
  };

    const handleUseItemOnInjury = (item: InventoryItem, injury: Injury) => {
        const prompt = `I use the ${item.name} to treat the ${injury.description.toLowerCase()} on my ${injury.location.replace(/([A-Z])/g, ' $1').toLowerCase()}.`;
        handleSubmit(prompt);
        // Also close the side panel to show the action in the log
        setIsSidePanelOpen(false);
    };
  
  const handleCraftAttempt = (items: InventoryItem[]) => {
      const itemNames = items.map(i => i.name).join(' and ');
      const prompt = `(The player uses the crafting bench to combine the following items: ${itemNames}. Describe the process and the outcome. If successful, specify the new item created and remove the components from the inventory. If it fails, describe why and what happens to the components.)`;
      handleSubmit(prompt);
      setIsSidePanelOpen(false);
  };

  const handleSaveCustomization = (updatedCharacter: CustomCharacter) => {
      setCustomCharacter(updatedCharacter);
      saveCustomCharacter(updatedCharacter);
      setIsCustomizationModalOpen(false);
      const prompt = `(My appearance has changed to: ${updatedCharacter.appearanceSummary})`;
      handleSubmit(prompt);
  };

  const handleGamblingResult = (amount: number) => {
    setIsCasinoModalOpen(false);
    setGameState(prev => ({
        ...prev,
        playerStatus: {
            ...prev.playerStatus,
            currency: Math.max(0, prev.playerStatus.currency + amount)
        }
    }));
  };


  const handleKeywordHover = (keyword: string | null, rect: DOMRect | null) => {
    if (keyword && rect) {
        const character = gameState.characters.find(c => c.name.toLowerCase() === keyword.toLowerCase());
        const item = gameState.playerStatus.inventory.find(i => i.name.toLowerCase() === keyword.toLowerCase());
        
        let content = null;
        if (character) {
            content = <div><strong>{character.name}</strong> ({character.status})</div>;
        } else if (item) {
            content = (
                <div>
                    <strong>{item.name}</strong>
                    <p className="text-sm text-text-secondary mt-1">{item.description}</p>
                </div>
            );
        }

        if (content) {
            setTooltip({
                visible: true,
                content: content,
                x: rect.left + rect.width / 2,
                y: rect.top,
            });
        }
    } else {
        setTooltip(prev => ({ ...prev, visible: false }));
    }
  };

  const handleStatusEffectHover = (effect: StatusEffect | null, rect: DOMRect | null) => {
      if (effect && rect) {
          const content = (
              <div>
                  <strong>{effect.name}</strong> ({effect.type})
                  <p className="text-sm text-text-secondary mt-1">{effect.description}</p>
              </div>
          );
          setTooltip({
              visible: true,
              content: content,
              x: rect.left + rect.width / 2,
              y: rect.top,
          });
      } else {
          setTooltip(prev => ({ ...prev, visible: false }));
      }
  };

  const handleGoldHover = (isHovering: boolean, rect: DOMRect | null) => {
      if (isHovering && rect) {
          const content = (
              <div>
                  <strong>Gold</strong>
                  <p className="text-sm text-text-secondary mt-1">The primary in-game currency for this story's world. Used for trading, bribing, and other interactions. Earned by completing quests or finding treasures.</p>
              </div>
          );
          setTooltip({
              visible: true,
              content: content,
              x: rect.left + rect.width / 2,
              y: rect.top,
          });
      } else {
          setTooltip(prev => ({ ...prev, visible: false }));
      }
  };
  
  const handleHeaderGoldClick = () => {
      setInfoModalState({ 
          isOpen: true, 
          title: 'Gold', 
          content: "Gold is this world's primary in-game currency. It's essential for trading goods, acquiring services, bribing characters, or paying for passage. Your Gold count is unique to this adventure and will change based on your actions, from completing quests and selling valuable items to making shrewd deals or outright theft.",
          isLoading: false 
      });
  };
  
  const handleResolveHover = (isHovering: boolean, rect: DOMRect | null) => {
      if (isHovering && rect) {
          const content = (
              <div>
                  <strong>Resolve</strong>
                  <p className="text-sm text-text-secondary mt-1">A measure of your character's mental fortitude. Low resolve can affect actions and interactions.</p>
              </div>
          );
          setTooltip({
              visible: true,
              content: content,
              x: rect.left + rect.width / 2,
              y: rect.top,
          });
      } else {
          setTooltip(prev => ({ ...prev, visible: false }));
      }
  };

    const handleHealthHover = (isHovering: boolean, rect: DOMRect | null) => {
      if (isHovering && rect) {
          const content = (
              <div>
                  <strong>Health</strong>
                  <p className="text-sm text-text-secondary mt-1">Your physical well-being. If it reaches 0, your journey ends permanently and this world becomes inaccessible.</p>
              </div>
          );
          setTooltip({
              visible: true,
              content: content,
              x: rect.left + rect.width / 2,
              y: rect.top,
          });
      } else {
          setTooltip(prev => ({ ...prev, visible: false }));
      }
  };


  const handleToggleSidePanel = () => {
    if (!isSidePanelOpen) {
      setSeenCounts({
        characters: gameState.characters.length,
        quests: gameState.quests.length,
        worldInfo: gameState.worldInfo.length,
      });
    }
    setIsSidePanelOpen(!isSidePanelOpen);
  };

  const handleTabFocus = (tab: SidePanelTab) => {
    setSeenCounts(prev => {
        const newCounts = { ...prev };
        if (tab === 'characters') newCounts.characters = gameState.characters.length;
        if (tab === 'quests') newCounts.quests = gameState.quests.length;
        if (tab === 'world') newCounts.worldInfo = gameState.worldInfo.length;
        return newCounts;
    });
  };

    const handleGeminiIconClick = async (messageText: string) => {
        setSummaryModalState({ isOpen: true, content: '', isLoading: true, title: '' });
        const summary = await summarizeMessage(messageText);
        setSummaryModalState({ isOpen: true, content: summary, isLoading: false, title: "Message Summary" });
    };
    
    const handleSummarizeStory = async () => {
        setIsMenuOpen(false);

        if (cachedSummary && cachedSummary.historyLength === history.length) {
            setSummaryModalState({ isOpen: true, title: "Journal Summary", content: cachedSummary.content, isLoading: false });
            return;
        }

        setSummaryModalState({ isOpen: true, title: "Journal Summary", content: '', isLoading: true });
        const summary = await summarizeStory(history);
        setCachedSummary({ content: summary, historyLength: history.length });
        setSummaryModalState({ isOpen: true, title: "Journal Summary", content: summary, isLoading: false });
    };

    const handleSettingsChange = (newSettings: AppSettings) => {
        setAppSettings(newSettings);
    };

    const handleSaveSettings = () => {
        saveAppSettings(appSettings);
    };

  const hasNewCharactersBadge = useMemo(() => gameState.characters.length > seenCounts.characters, [gameState.characters.length, seenCounts.characters]);
  const hasNewQuestsBadge = useMemo(() => gameState.quests.length > seenCounts.quests, [gameState.quests.length, seenCounts.quests]);
  const hasNewWorldInfoBadge = useMemo(() => gameState.worldInfo.length > seenCounts.worldInfo, [gameState.worldInfo.length, seenCounts.worldInfo]);

  if (isStartingGame) {
      return <GameStartLoader />;
  }

  if (!isGameStarted) {
    return <HomePage onStart={startGame} onLoad={loadGame} />;
  }
  
  const isLowHealth = gameState.playerStatus.health > 0 && gameState.playerStatus.health < 30;

  return (
    <div className={`flex h-screen bg-transparent text-text-primary font-sans overflow-hidden ${isLowHealth ? 'low-health-effect' : ''} ${isShaking ? 'screen-shake' : ''}`}>
      <DynamicBackground environment={currentEnvironment} />
      {statusVignette && (
          <div 
              key={statusVignette.key}
              className="status-vignette"
              style={{ '--shadow-color': statusVignette.color } as React.CSSProperties}
          />
      )}
      <EnvironmentIndicator location={environmentNotification} />
      
      <Tooltip {...tooltip} />
      <OnboardingModal isOpen={isOnboardingOpen} onClose={() => setIsOnboardingOpen(false)} />

      {/* Mobile Overlay Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/60 z-30 transition-opacity lg:hidden ${isSidePanelOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsSidePanelOpen(false)}
        aria-hidden="true"
      ></div>

      <InventoryItemModal
        item={selectedItem}
        isOpen={isItemModalOpen}
        onClose={() => setIsItemModalOpen(false)}
        onUse={handleUseItem}
        onDrop={handleDropItem}
        onEquip={handleEquipItem}
      />
      <CharacterModal
        character={selectedCharacter}
        isOpen={isCharacterModalOpen}
        onClose={() => setIsCharacterModalOpen(false)}
      />
      <GameMenuModal
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onHomepage={handleReturnToMenu}
        onStartNewGame={() => {
          setIsMenuOpen(false);
          setIsNewGameModalOpen(true);
        }}
        onSummarize={handleSummarizeStory}
        onSettings={() => {
            setIsMenuOpen(false);
            setIsSettingsModalOpen(true);
        }}
        onHelp={() => {
            setIsMenuOpen(false);
            setIsOnboardingOpen(true);
        }}
      />
       <SettingsModal 
            isOpen={isSettingsModalOpen} 
            onClose={() => setIsSettingsModalOpen(false)}
            settings={appSettings}
            onSettingsChange={handleSettingsChange}
            onSave={handleSaveSettings}
            onClearData={() => {
                // This would be a destructive action mid-game, so we just close.
                // The homepage handles the actual data clearing.
                setIsSettingsModalOpen(false);
            }}
        />
      <NewGameModal
        isOpen={isNewGameModalOpen}
        onClose={() => setIsNewGameModalOpen(false)}
        onStart={(prompt, hiddenPreamble, world, locationImage) => {
            handleReturnToMenu();
            // A short delay to allow state to reset before starting a new game
            setTimeout(() => startGame(prompt, hiddenPreamble, world, locationImage), 100);
        }}
      />
       <InfoModal
        isOpen={infoModalState.isOpen}
        onClose={() => setInfoModalState({ isOpen: false, title: '', content: '', isLoading: false })}
        title={infoModalState.title}
        content={infoModalState.content}
        isLoading={infoModalState.isLoading}
      />
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        character={customCharacter}
        status={gameState.playerStatus}
      />
      <InGameCustomizationModal 
        isOpen={isCustomizationModalOpen}
        onClose={() => setIsCustomizationModalOpen(false)}
        character={customCharacter}
        onSave={handleSaveCustomization}
        reason={gameState.allowCharacterCustomization?.reason ?? ''}
      />
      <SummaryModal
        isOpen={summaryModalState.isOpen}
        onClose={() => setSummaryModalState({ isOpen: false, title: '', content: '', isLoading: false })}
        title={summaryModalState.title || "Message Summary"}
        content={summaryModalState.content}
        isLoading={summaryModalState.isLoading}
      />
       <CasinoModal
        isOpen={isCasinoModalOpen}
        onClose={() => setIsCasinoModalOpen(false)}
        playerGold={gameState.playerStatus.currency}
        onGameEnd={handleGamblingResult}
      />

      <div className="flex-1 flex justify-center overflow-hidden">
        <main className="w-full h-screen flex flex-col lg:max-w-6xl xl:max-w-7xl">
            <GameHeader 
                onMenuClick={() => setIsMenuOpen(true)}
                onLogoClick={handleReturnToMenu}
                isSidePanelOpen={isSidePanelOpen}
                onToggleSidePanel={handleToggleSidePanel}
                isSaving={isSaving}
                location={currentLocation}
                time={gameState.gameTime}
                currency={gameState.playerStatus.currency}
                onGoldClick={handleHeaderGoldClick}
                timeOfDay={timeOfDay}
                isCasinoAvailable={isCasinoAvailable}
                onCasinoClick={() => setIsCasinoModalOpen(true)}
            />
            {gameState.locationImageUrl && <LocationDisplay imageUrl={gameState.locationImageUrl} />}
            <StoryLog 
                history={history} 
                gameState={gameState}
                onEntityClick={handleEntityClick}
                onKeywordHover={handleKeywordHover}
                onLocationClick={handleLocationClick}
                onDiscoveryClick={handleDiscoveryClick}
                onCombatClick={handleCombatClick}
                onEventClick={handleEventClick}
                onReroll={handleRerollLastResponse}
                isLoading={isLoading}
                customCharacter={customCharacter}
                onUserIconClick={() => setIsProfileModalOpen(true)}
                onGeminiIconClick={handleGeminiIconClick}
            />
            {isGameOver ? (
                <GameOverBanner onNewGame={handleNewGame} onReturnToMenu={handleReturnToMenu} />
            ) : (
                <>
                    <div className="px-4 pb-1">
                        {!appSettings.disableSuggestions && (
                            <ActionSuggestions 
                                suggestions={suggestions} 
                                onSuggestionClick={handleSubmit} 
                                isLoading={isLoading}
                                onReroll={() => handleRerollSuggestions()}
                            />
                        )}
                    </div>
                    <UserInput onSubmit={handleSubmit} isLoading={isLoading} input={userInput} setInput={setUserInput} />
                </>
            )}
        </main>
      </div>

      <SidePanel 
        gameState={gameState}
        onItemClick={handleItemClick}
        onCharacterClick={handleCharacterClick}
        onObjectiveClick={handleObjectiveClick}
        onUseItemOnInjury={handleUseItemOnInjury}
        onCraftAttempt={handleCraftAttempt}
        onEditAppearance={() => setIsCustomizationModalOpen(true)}
        customCharacter={customCharacter}
        onUnequipItem={handleUnequipItem}
        isOpen={isSidePanelOpen}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onTabFocus={handleTabFocus}
        hasNewCharacters={hasNewCharactersBadge}
        hasNewQuests={hasNewQuestsBadge}
        hasNewWorldInfo={hasNewWorldInfoBadge}
        onStatusEffectHover={handleStatusEffectHover}
        onGoldHover={handleGoldHover}
        // FIX: Pass the correct handler function `handleResolveHover` to the `onResolveHover` prop.
        onResolveHover={handleResolveHover}
        onHealthHover={handleHealthHover}
        onMapNodeHover={setTooltip}
        newItems={newItems}
        newEffects={newEffects.map(e => e.name)}
        newCharacters={newCharacters}
        newQuests={newQuests}
        highlightedItem={highlightedItem}
      />
    </div>
  );
}

export default App;
