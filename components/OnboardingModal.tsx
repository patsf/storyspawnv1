import React, { useState, useLayoutEffect, useRef } from 'react';
import { XIcon, ChevronLeftIcon, ChevronRightIcon } from './icons';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TOUR_STEPS = [
  {
    title: "Welcome to StorySpawn!",
    content: "This is an interactive tour to get you started. Your choices directly shape the story, characters, and the world itself.",
  },
  {
    selector: '[data-tour-id="user-input"]',
    title: "Take Action",
    content: "This is the input bar. Describe what you want to do next, like 'Look around the room' or 'Talk to the bartender', and press Enter.",
  },
  {
    selector: '[data-tour-id="action-suggestions"]',
    title: "Action Suggestions",
    content: "Feeling stuck? We'll offer suggestions here. Click one to perform that action, or use them as inspiration for your own ideas.",
  },
  {
    selector: '[data-tour-id="story-log"]',
    title: "Your Story Unfolds",
    content: "Your adventure is written here. Look for highlighted keywords you can click on to learn more about characters and items.",
  },
  {
    selector: '[data-tour-id="side-panel-toggle"]',
    title: "The Side Panel",
    content: "Click this icon to open and close your side panel, which contains all your vital game information.",
  },
  {
    selector: '[data-tour-id="status-tab"]',
    title: "Character Status",
    content: "Track your Health, Resolve, and Inventory here. Your health is critical—if it reaches zero, the story ends!",
    requiresPanelOpen: true,
  },
  {
    selector: '[data-tour-id="quests-tab"]',
    title: "Quests & Objectives",
    content: "Your current goals and tasks are tracked in the Quests tab. Click on an objective to get a hint for what to do next.",
    requiresPanelOpen: true,
  },
  {
    selector: '[data-tour-id="world-map"]',
    title: "The World Map",
    content: "As you explore new locations, they will be added to your map at the bottom of the side panel. You can pan and zoom to see where you've been.",
    requiresPanelOpen: true,
  },
  {
    title: "You're Ready!",
    content: "That's everything you need to know. The story is yours to create. Good luck!",
  }
];

const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose }) => {
  const [stepIndex, setStepIndex] = useState(0);
  const [highlightStyle, setHighlightStyle] = useState<React.CSSProperties>({});
  const [popoverStyle, setPopoverStyle] = useState<React.CSSProperties>({});
  const popoverRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!isOpen) return;

    const currentStep = TOUR_STEPS[stepIndex];
    const { selector, requiresPanelOpen } = currentStep;
    let observer: ResizeObserver;

    const updatePositions = () => {
      const element = selector ? document.querySelector<HTMLElement>(selector) : null;
      
      if (element) {
        if (requiresPanelOpen) {
          const panelToggle = document.querySelector<HTMLElement>('[data-tour-id="side-panel-toggle"]');
          const isPanelOpen = panelToggle?.getAttribute('aria-label')?.includes('Close');
          if (!isPanelOpen) {
            panelToggle?.click();
            setTimeout(updatePositions, 350); // Wait for panel transition
            return;
          }
        }

        const rect = element.getBoundingClientRect();
        const padding = 10;
        setHighlightStyle({
          width: `${rect.width + padding * 2}px`,
          height: `${rect.height + padding * 2}px`,
          top: `${rect.top - padding}px`,
          left: `${rect.left - padding}px`,
          borderRadius: '8px',
          boxShadow: '0 0 0 9999px var(--onboarding-backdrop-color)',
          transition: 'all 0.3s ease-in-out',
        });

        if (popoverRef.current) {
          const popoverRect = popoverRef.current.getBoundingClientRect();
          let top = rect.bottom + 15;
          let left = rect.left + rect.width / 2 - popoverRect.width / 2;

          if (top + popoverRect.height > window.innerHeight - 10) {
            top = rect.top - popoverRect.height - 15;
          }
          if (left < 10) {
            left = 10;
          }
          if (left + popoverRect.width > window.innerWidth - 10) {
            left = window.innerWidth - popoverRect.width - 10;
          }
          
          setPopoverStyle({ top: `${top}px`, left: `${left}px`, transform: 'none' });
        }
        
        observer = new ResizeObserver(updatePositions);
        observer.observe(element);

      } else {
        setHighlightStyle({
            top: '50%', left: '50%', width: 0, height: 0,
            boxShadow: '0 0 0 9999px var(--onboarding-backdrop-color)',
            transition: 'all 0.3s ease-in-out',
        });
        setPopoverStyle({ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' });
      }
    };

    const timeoutId = setTimeout(updatePositions, 100);
    window.addEventListener('resize', updatePositions);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', updatePositions);
      if (observer) observer.disconnect();
    };
  }, [stepIndex, isOpen]);

  if (!isOpen) return null;

  const currentStepData = TOUR_STEPS[stepIndex];

  const handleNext = () => {
    if (stepIndex < TOUR_STEPS.length - 1) {
      setStepIndex(stepIndex + 1);
    } else {
      handleFinish();
    }
  };

  const handlePrev = () => {
    if (stepIndex > 0) {
      setStepIndex(stepIndex - 1);
    }
  };
  
  const handleFinish = () => {
    localStorage.setItem('storyspawn_interactive_onboarding_completed', 'true');
    onClose();
    setTimeout(() => setStepIndex(0), 500); // Reset for next time
  };

  return (
    <div className="fixed inset-0 z-50 animate-fade-in" aria-modal="true" role="dialog">
      <div className="absolute" style={highlightStyle}></div>
      <div
        ref={popoverRef}
        style={popoverStyle}
        className="fixed bg-background-secondary border border-surface-primary rounded-lg w-full max-w-sm m-4 text-text-primary shadow-2xl shadow-black/50 flex flex-col transition-all duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b border-surface-primary">
          <h2 className="text-xl font-bold font-heading">{currentStepData.title}</h2>
          <button onClick={handleFinish} className="p-1 rounded-full text-text-secondary hover:bg-surface-primary hover:text-text-primary">
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-4">
            <p className="text-text-secondary leading-relaxed">{currentStepData.content}</p>
        </div>

        <div className="flex justify-between items-center p-4 mt-auto border-t border-surface-primary bg-background-primary/50">
            <div className="flex gap-1">
                {TOUR_STEPS.map((_, index) => (
                    <button 
                        key={index}
                        onClick={() => setStepIndex(index)}
                        className={`w-4 h-2 rounded-full transition-all duration-300 ${stepIndex === index ? 'bg-accent w-6' : 'bg-interactive-secondary hover:bg-interactive-secondary/70'}`}
                        aria-label={`Go to step ${index + 1}`}
                    />
                ))}
            </div>
            <div className="flex gap-3">
                <button 
                    onClick={handlePrev} 
                    disabled={stepIndex === 0}
                    className="flex items-center gap-2 bg-interactive-secondary text-white font-bold py-2 px-4 rounded-lg hover:bg-interactive-secondary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <ChevronLeftIcon className="w-5 h-5"/>
                </button>
                <button onClick={handleNext} className="flex items-center gap-2 bg-accent text-white font-bold py-2 px-4 rounded-lg hover:bg-accent-hover transition-colors">
                     <span>{stepIndex === TOUR_STEPS.length - 1 ? 'Finish' : 'Next'}</span>
                    <ChevronRightIcon className="w-5 h-5"/>
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingModal;
