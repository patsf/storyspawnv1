import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import LoadGameTab from './LoadGameTab';
import CharacterCreatorTab from './CharacterCreatorTab';
import SettingsModal from './SettingsModal';
import FeaturedWorldDetailModal from './FeaturedWorldDetailModal';
import GenreDetailPage from './GenreDetailPage';
import OnboardingModal from './OnboardingModal';
import NewGameModal from './NewGameModal';
import { PlusIcon, FolderOpenIcon, AnvilIcon, UserCircleIcon, SettingsIcon, XIcon, ChevronLeftIcon, ChevronRightIcon, ChevronDownIcon, StarIcon, QuestionMarkCircleIcon } from './icons';
import { getCustomCharacter, getGameSessions, saveAppSettings, getAppSettings, clearAllGameData } from '../services/storageService';
import { FEATURED_WORLDS, EXPANDED_FEATURED_WORLDS, WORLD_CATEGORIES } from '../constants';
import type { GameSession, CustomCharacter, AppSettings } from '../types';

interface HomePageProps {
  onStart: (prompt: string, hiddenPreamble?: string, world?: World, locationImage?: { base64: string, mimeType: string }) => void;
  onLoad: (sessionId: string) => void;
}

type World = (typeof FEATURED_WORLDS)[0] & { staffPick?: boolean };

const funFacts = [
    "Your custom avatar is persistent across all your adventures!",
    "You can find opportunities to change your appearance mid-story.",
    "Using the 'Injuries' panel to treat wounds is more effective than typing.",
    "The world map is built dynamically based on where you travel.",
    "Clicking the quill icon on a story message will give you a summary of its contents.",
    "You can reroll the AI's last response if you don't like the outcome.",
    "The color theme of the entire app can be changed in the settings menu.",
];

// Helper function to shuffle an array
const shuffleArray = <T,>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};


const FunFact: React.FC = () => {
    const [factIndex, setFactIndex] = useState(0);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const interval = setInterval(() => {
            setIsVisible(false);
            setTimeout(() => {
                setFactIndex(prev => (prev + 1) % funFacts.length);
                setIsVisible(true);
            }, 500); // fade-out duration
        }, 5000); // 5 seconds per fact

        return () => clearInterval(interval);
    }, []);

    return (
        <p className={`text-xs text-text-secondary mt-4 opacity-70 italic transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
            Tip: {funFacts[factIndex]}
        </p>
    );
};


const InteractiveLogo = () => {
    const text = "StorySpawn";
    return (
        <h1 className="text-5xl md:text-6xl font-extrabold font-heading text-white whitespace-nowrap" style={{textShadow: '0 0 20px var(--color-accent-glow)'}}>
            {text.split('').map((char, index) => (
                <span key={index} className="inline-block transition-all duration-300 ease-out hover:text-accent hover:-translate-y-2 hover:scale-110 cursor-pointer">
                    {char}
                </span>
            ))}
        </h1>
    )
};

type ModalView = 'new' | 'load' | 'forge' | 'avatar';

const modalTitles: Record<ModalView, string> = {
    new: 'New Story',
    load: 'Load Adventure',
    forge: 'Forge a Story',
    avatar: 'Design Your Avatar'
}

const ActionModal: React.FC<{ view: ModalView; onClose: () => void; children: React.ReactNode; }> = ({ view, onClose, children }) => (
    <div className="fixed inset-0 bg-background-primary/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
        <div className="bg-background-secondary border border-surface-primary rounded-2xl w-full max-w-4xl m-4 text-text-primary flex flex-col max-h-[90vh] animate-slide-in-up shadow-2xl shadow-black/50" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-4 border-b border-surface-primary flex-shrink-0">
                <h2 className="text-xl font-bold">{modalTitles[view]}</h2>
                <button onClick={onClose} className="p-1 rounded-full text-text-secondary hover:bg-surface-primary hover:text-text-primary">
                    <XIcon className="w-6 h-6" />
                </button>
            </div>
            <div className="p-6 sm:p-8 overflow-y-auto">
                {children}
            </div>
        </div>
    </div>
);


const CLONE_COUNT = 5;

const WorldCategoryRow: React.FC<{ category: string, worlds: World[], onWorldClick: (world: World) => void, onCategoryClick: (category: string) => void }> = ({ category, worlds, onWorldClick, onCategoryClick }) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [isHovering, setIsHovering] = useState(false);
    const isScrollingRef = useRef(false);
    const isProgrammaticScroll = useRef(false);
    const scrollEndTimeout = useRef<number | null>(null);

    const canScrollSeamlessly = worlds.length > CLONE_COUNT;
    const displayWorlds = canScrollSeamlessly ? [...worlds, ...worlds, ...worlds] : worlds;

    useLayoutEffect(() => {
        if (scrollRef.current && canScrollSeamlessly) {
            scrollRef.current.scrollLeft = scrollRef.current.scrollWidth / 3;
        }
    }, [worlds.length, canScrollSeamlessly]);
    
    const handleScroll = () => {
        if (isProgrammaticScroll.current || isScrollingRef.current || !scrollRef.current || !canScrollSeamlessly) return;
        
        const { scrollLeft, scrollWidth } = scrollRef.current;
        const contentWidth = scrollWidth / 3;

        if (scrollLeft < contentWidth) {
            isScrollingRef.current = true;
            scrollRef.current.scrollLeft += contentWidth;
            requestAnimationFrame(() => { isScrollingRef.current = false; });
        } else if (scrollLeft >= contentWidth * 2) {
            isScrollingRef.current = true;
            scrollRef.current.scrollLeft -= contentWidth;
            requestAnimationFrame(() => { isScrollingRef.current = false; });
        }
    };

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            isProgrammaticScroll.current = true;
            if (scrollEndTimeout.current) {
                window.clearTimeout(scrollEndTimeout.current);
            }
            const { clientWidth } = scrollRef.current;
            const scrollAmount = clientWidth * 0.8;
            scrollRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth',
            });
            scrollEndTimeout.current = window.setTimeout(() => {
                isProgrammaticScroll.current = false;
            }, 500);
        }
    };

    return (
        <div onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>
             <button onClick={() => onCategoryClick(category)} className="flex items-center gap-2 group mb-4">
                <h3 className="text-2xl font-bold text-white group-hover:text-accent transition-colors">{category}</h3>
                <ChevronRightIcon className="w-6 h-6 text-text-secondary group-hover:text-accent transition-all transform group-hover:translate-x-1" />
            </button>
            <div className="relative group -mx-4 px-4">
                 {isHovering && worlds.length > 3 && (
                    <button
                        onClick={() => scroll('left')}
                        className="absolute left-0 top-1/2 -translate-y-1/2 z-20 p-2 bg-black/60 rounded-full text-white transition-opacity hover:bg-black/80 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-white"
                        aria-label="Scroll left"
                    >
                        <ChevronLeftIcon className="w-6 h-6" />
                    </button>
                 )}
                <div ref={scrollRef} onScroll={handleScroll} className="flex overflow-x-auto space-x-4 pb-4 -mb-4 no-scrollbar">
                    {displayWorlds.map((world, index) => (
                        <div key={`${world.title}-${index}`} className="flex-shrink-0 w-72">
                            <button
                                onClick={() => onWorldClick(world)}
                                className={`relative w-full aspect-video rounded-lg overflow-hidden group/card border-2 hover:border-accent transition-all duration-300 transform hover:scale-105 bg-cover bg-center bg-background-secondary ${world.staffPick ? 'border-amber-400' : 'border-surface-primary'}`}
                                style={{ backgroundImage: `url(${world.imageUrl})` }}
                                aria-label={`Learn more about ${world.title}`}
                            >
                                {world.staffPick && (
                                    <div className="absolute top-2 right-2 bg-amber-400 text-black text-xs font-bold px-2 py-0.5 rounded-full z-20 flex items-center gap-1">
                                        <StarIcon className="w-4 h-4"/> Staff Pick
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 flex flex-col justify-end z-10">
                                    <h4 className="font-bold text-white text-md leading-tight">{world.title}</h4>
                                    <p className="text-xs text-text-primary/90 transition-all duration-300 max-h-0 opacity-0 group-hover/card:max-h-10 group-hover/card:opacity-100 group-hover/card:mt-1">
                                        {world.tagline}
                                    </p>
                                </div>
                            </button>
                        </div>
                    ))}
                </div>
                 {isHovering && worlds.length > 3 && (
                    <button
                        onClick={() => scroll('right')}
                        className="absolute right-0 top-1/2 -translate-y-1/2 z-20 p-2 bg-black/60 rounded-full text-white transition-opacity hover:bg-black/80 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-white"
                        aria-label="Scroll right"
                    >
                        <ChevronRightIcon className="w-6 h-6" />
                    </button>
                 )}
            </div>
        </div>
    );
};

const themeIds = ['default', 'violet', 'crimson', 'emerald', 'amber', 'cyberpunk', 'solaris', 'aurora', 'grove', 'dune', 'rose', 'abyss', 'midnight', 'daybreak'];
const themeClasses = themeIds.map(id => `theme-${id}`);

const HomePage: React.FC<HomePageProps> = ({ onStart, onLoad }) => {
  const [activeModal, setActiveModal] = useState<ModalView | null>(null);
  const [selectedWorld, setSelectedWorld] = useState<World | null>(null);
  const [customCharacter, setCustomCharacter] = useState<CustomCharacter | null>(null);
  const [sessions, setSessions] = useState<GameSession[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<AppSettings>(getAppSettings());
  const [featuredWorlds, setFeaturedWorlds] = useState<World[]>([]);
  const [categorizedWorlds, setCategorizedWorlds] = useState<Record<string, World[]>>({});
  const [showBrowseHint, setShowBrowseHint] = useState(true);
  const browseHintRef = useRef<HTMLDivElement>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  const refreshData = () => {
      setCustomCharacter(getCustomCharacter());
      setSessions(getGameSessions());
  };

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

    if (settings.theme === 'custom' && settings.customTheme) {
        const { customTheme } = settings;
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
        rootStyle.setProperty('--color-surface-secondary', hexToRgba(customTheme.surfacePrimary, 0.75));
        rootStyle.setProperty('--color-interactive-secondary', customTheme.borderPrimary);
        rootStyle.setProperty('--color-accent-text', customTheme.accentSecondary);
        rootStyle.setProperty('--color-accent-glow', hexToRgba(customTheme.accentPrimary, 0.4));
    } else if (settings.theme && themeIds.includes(settings.theme)) {
        document.body.classList.add(`theme-${settings.theme}`);
    } else {
        document.body.classList.add(`theme-default`); // Fallback
    }

    if (settings.reducedMotion) {
        document.body.classList.add('reduced-motion');
    } else {
        document.body.classList.remove('reduced-motion');
    }
  }, [settings]);

  useEffect(() => {
      refreshData();

      const allWorlds: World[] = [...FEATURED_WORLDS, ...EXPANDED_FEATURED_WORLDS];
      const shuffled = shuffleArray(allWorlds);
      setFeaturedWorlds(shuffled.slice(0, 3));

      const worldCategories = WORLD_CATEGORIES;

      const groupedWorlds: Record<string, World[]> = {};

      for (const categoryName in worldCategories) {
          const themes = worldCategories[categoryName];
          const worldsInCategory = allWorlds.filter(world => themes.includes(world.theme));
          if (worldsInCategory.length > 0) {
              groupedWorlds[categoryName] = shuffleArray(worldsInCategory);
          }
      }
      setCategorizedWorlds(groupedWorlds);
  }, []);
  
  // Refresh data when a modal is closed, in case something changed (e.g., avatar created)
  useEffect(() => {
    if (activeModal === null) {
        refreshData();
    }
  }, [activeModal]);

  // Handle browse hint visibility
  useEffect(() => {
    let hintTopPosition = 0;
    if (browseHintRef.current) {
        hintTopPosition = browseHintRef.current.getBoundingClientRect().top + window.scrollY;
    }

    const handleScroll = () => {
        if (window.scrollY > hintTopPosition + 50) {
            setShowBrowseHint(false);
        } else {
            setShowBrowseHint(true);
        }
    };
    
    if (hintTopPosition > 0) {
        window.addEventListener('scroll', handleScroll, { passive: true });
    }
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [selectedCategory]); // Re-evaluate when view changes


  const handleSettingsChange = (newSettings: AppSettings) => {
      setSettings(newSettings);
  };

  const handleSaveSettings = () => {
    saveAppSettings(settings);
  };

  const handleClearData = () => {
    if (window.confirm('Are you sure you want to delete ALL saved games and avatars? This action cannot be undone.')) {
        clearAllGameData();
        refreshData();
    }
  };

  const handleStart = (prompt: string, hiddenPreamble?: string, world?: World, locationImage?: { base64: string, mimeType: string }) => {
    onStart(prompt, hiddenPreamble, world, locationImage);
  };
  
  const renderModalContent = () => {
      if (!activeModal) return null;
      switch(activeModal) {
          case 'load': return <LoadGameTab onLoad={onLoad} onRename={refreshData} onDelete={refreshData} />;
          case 'avatar': return <CharacterCreatorTab />;
          default: return null;
      }
  }

  const lastSession = sessions.length > 0 ? sessions[0] : null;

  return (
    <div className="relative min-h-screen font-sans overflow-auto">
        <div className="animated-topography" />
        <div className="relative z-10 flex flex-col items-center p-4">
            <OnboardingModal isOpen={isOnboardingOpen} onClose={() => setIsOnboardingOpen(false)} />
            <SettingsModal 
                isOpen={isSettingsOpen} 
                onClose={() => setIsSettingsOpen(false)}
                settings={settings}
                onSettingsChange={handleSettingsChange}
                onSave={handleSaveSettings}
                onClearData={handleClearData}
            />
            
            <NewGameModal
                isOpen={activeModal === 'new' || activeModal === 'forge'}
                onClose={() => setActiveModal(null)}
                onStart={handleStart}
                defaultTab={activeModal === 'forge' ? 'forge' : 'scenario'}
            />

            {activeModal && (activeModal === 'load' || activeModal === 'avatar') && (
                <ActionModal view={activeModal} onClose={() => setActiveModal(null)}>
                    {renderModalContent()}
                </ActionModal>
            )}

            {selectedWorld && (
                <FeaturedWorldDetailModal
                    world={selectedWorld}
                    onClose={() => setSelectedWorld(null)}
                    onPlay={(world) => {
                        setSelectedWorld(null);
                        onStart(world.prompt, undefined, world);
                    }}
                    onGenreClick={(category) => {
                        setSelectedWorld(null);
                        setSelectedCategory(category);
                    }}
                />
            )}
            
            <div className="absolute top-6 right-6 flex gap-2 z-20">
                <button 
                    onClick={() => setIsOnboardingOpen(true)}
                    className="text-text-secondary hover:text-white transition-colors p-2 rounded-full hover:bg-white/10"
                    aria-label="Open help guide"
                >
                    <QuestionMarkCircleIcon className="w-7 h-7" />
                </button>
                <button 
                    onClick={() => setIsSettingsOpen(true)}
                    className="text-text-secondary hover:text-white transition-colors p-2 rounded-full hover:bg-white/10"
                    aria-label="Open settings"
                >
                    <SettingsIcon className="w-7 h-7" />
                </button>
            </div>


            <main className="w-full max-w-screen-xl mx-auto z-10 animate-fade-in pt-24 pb-12">
                {selectedCategory && categorizedWorlds[selectedCategory] ? (
                    <GenreDetailPage 
                        category={selectedCategory}
                        worlds={categorizedWorlds[selectedCategory]}
                        onWorldClick={setSelectedWorld}
                        onBack={() => setSelectedCategory(null)}
                    />
                ) : (
                <>
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-center">
                        <div className="lg:col-span-2 flex flex-col items-center lg:items-start text-center lg:text-left">
                            <InteractiveLogo />
                            <p className="text-lg text-text-secondary mt-4 max-w-md">An AI-powered storytelling platform where your choices shape a dynamic world.</p>
                            <FunFact />
                            
                            {customCharacter && (
                                <div className="mt-8 p-4 rounded-lg bg-black/20 border border-surface-primary flex items-center gap-4 w-full max-w-md">
                                    <img src={customCharacter.portraitUrl} alt="Your Avatar" className="w-16 h-16 rounded-full object-cover border-2 border-border-primary"/>
                                    <div>
                                        <p className="text-text-secondary text-sm">Welcome back,</p>
                                        <h3 className="text-xl font-bold text-white">{customCharacter.name}</h3>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="lg:col-span-3">
                            <div className="space-y-3">
                            {lastSession && (
                                    <button
                                        onClick={() => onLoad(lastSession.id)}
                                        className="w-full text-left p-4 rounded-md bg-accent/10 border-2 border-accent/30 hover:bg-accent/20 transition-all group"
                                    >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-lg font-bold text-accent">Continue Your Journey</h3>
                                            <p className="text-sm text-accent-text/80 truncate pr-4">{lastSession.title}</p>
                                        </div>
                                        <FolderOpenIcon className="w-8 h-8 text-accent group-hover:scale-110 transition-transform" />
                                    </div>
                                    </button>
                            )}
                                <button onClick={() => setActiveModal('new')} className="w-full text-left flex items-center justify-between p-4 bg-surface-secondary hover:bg-surface-primary rounded-md transition-colors group">
                                    <div>
                                        <h3 className="text-lg font-bold text-white">New Story</h3>
                                        <p className="text-sm text-text-secondary">Start a story from a scenario.</p>
                                    </div>
                                    <PlusIcon className="w-6 h-6 text-text-secondary group-hover:text-white transition-colors" />
                                </button>
                                <button onClick={() => setActiveModal('forge')} className="w-full text-left flex items-center justify-between p-4 bg-surface-secondary hover:bg-surface-primary rounded-md transition-colors group">
                                    <div>
                                        <h3 className="text-lg font-bold text-white">Forge a Story</h3>
                                        <p className="text-sm text-text-secondary">Craft a unique starting point.</p>
                                    </div>
                                    <AnvilIcon className="w-6 h-6 text-text-secondary group-hover:text-white transition-colors" />
                                </button>
                                <button onClick={() => setActiveModal('avatar')} className="w-full text-left flex items-center justify-between p-4 bg-surface-secondary hover:bg-surface-primary rounded-md transition-colors group">
                                <div>
                                        <h3 className="text-lg font-bold text-white">{customCharacter ? 'Edit Your Avatar' : 'Design Your Avatar'}</h3>
                                        <p className="text-sm text-text-secondary">Create or modify your persistent character.</p>
                                    </div>
                                    <UserCircleIcon className="w-6 h-6 text-text-secondary group-hover:text-white transition-colors" />
                                </button>
                                <button onClick={() => setActiveModal('load')} className="w-full text-left flex items-center justify-between p-4 bg-surface-secondary hover:bg-surface-primary rounded-md transition-colors group">
                                    <div>
                                        <h3 className="text-lg font-bold text-white">Load Game</h3>
                                        <p className="text-sm text-text-secondary">Pick up where you left off.</p>
                                    </div>
                                    <FolderOpenIcon className="w-6 h-6 text-text-secondary group-hover:text-white transition-colors" />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="mt-16 w-full">
                        <h3 className="text-sm font-semibold text-accent-text font-mono tracking-widest uppercase text-center mb-4">
                            Featured Stories
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {featuredWorlds.map(world => (
                                <button 
                                    key={world.title} 
                                    onClick={() => setSelectedWorld(world)}
                                    className={`relative h-64 rounded-lg overflow-hidden group border-2 hover:border-accent transition-all duration-300 transform hover:scale-105 bg-cover bg-center ${world.staffPick ? 'border-amber-400' : 'border-surface-primary'}`}
                                    style={{ backgroundImage: `url(${world.imageUrl})` }}
                                    aria-label={`Learn more about ${world.title}`}
                                >
                                    {world.staffPick && (
                                        <div className="absolute top-2 right-2 bg-amber-400 text-black text-xs font-bold px-2 py-0.5 rounded-full z-20 flex items-center gap-1">
                                            <StarIcon className="w-4 h-4"/> Staff Pick
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 flex flex-col justify-end z-10 transition-colors group-hover:bg-black/70">
                                        <h4 className="font-bold text-white text-lg leading-tight">{world.title}</h4>
                                        <p className="text-sm text-text-primary/90">{world.tagline}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    <div ref={browseHintRef} className={`text-center transition-all duration-300 ease-out overflow-hidden ${showBrowseHint ? 'my-20 h-24 opacity-100' : 'my-0 h-0 opacity-0 pointer-events-none'}`}>
                        <h3 className="text-sm font-semibold text-accent-text font-mono tracking-widest uppercase mb-4">
                            Browse by Genre
                        </h3>
                        <ChevronDownIcon className="w-10 h-10 mx-auto text-text-secondary animate-bounce" />
                    </div>

                    <div id="browse-worlds" className="w-full space-y-12">
                        {Object.entries(categorizedWorlds).map(([category, worlds]) => (
                            // FIX: Added Array.isArray check to ensure `worlds` is an array before accessing length.
                            Array.isArray(worlds) && worlds.length > 0 && (
                                <WorldCategoryRow
                                    key={category}
                                    category={category}
                                    worlds={worlds}
                                    onWorldClick={setSelectedWorld}
                                    onCategoryClick={setSelectedCategory}
                                />
                            )
                        ))}
                    </div>
                </>
                )}
            </main>
        </div>
    </div>
  );
};

export default HomePage;