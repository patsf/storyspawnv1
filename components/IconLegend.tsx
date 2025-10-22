import React, { useState } from 'react';
import { ExclamationCircleIcon, DiscoveryIcon, LocationIcon, ChevronDownIcon } from './icons';

const LegendItem: React.FC<{ children: React.ReactNode; description: string }> = ({ children, description }) => (
    <div className="flex items-center gap-4">
        <div className="w-1/3 flex-shrink-0">{children}</div>
        <p className="text-stone-400 text-xs flex-1">{description}</p>
    </div>
);

const IconLegend: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border-t border-white/10 bg-black/20">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full p-4 flex justify-between items-center text-left hover:bg-white/5 transition-colors"
                aria-expanded={isOpen}
            >
                <h4 className="font-semibold text-sm text-white">Legend</h4>
                <ChevronDownIcon className={`w-5 h-5 text-stone-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="px-4 pb-4 space-y-3 animate-fade-in">
                    <LegendItem description="A key plot point, action, or combat start. Click to interact.">
                         <span className="story-marker story-marker-event text-xs"><ExclamationCircleIcon className="w-3 h-3 mr-1" />Event</span>
                    </LegendItem>
                     <LegendItem description="Find a new item or crucial information. Click to see it.">
                        <span className="story-marker story-marker-discovery text-xs"><DiscoveryIcon className="w-3 h-3 mr-1" />Discovery</span>
                    </LegendItem>
                    <LegendItem description="Discover a new area. Click to see world info.">
                        <span className="story-marker story-marker-location text-xs"><LocationIcon className="w-3 h-3 mr-1" />Location</span>
                    </LegendItem>
                    <LegendItem description="An interactable person or item. Click for details.">
                        <span className="inline-block text-cyan-400 font-bold border-b-2 border-cyan-400/30 px-2 text-xs">Keyword</span>
                    </LegendItem>
                </div>
            )}
        </div>
    );
};

export default IconLegend;
