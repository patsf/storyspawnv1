import React, { useState } from 'react';
import type { WorldInfo } from '../types';
import { BookOpenIcon } from './icons';

interface WorldInfoPanelProps {
  worldInfo: WorldInfo[];
}

const AccordionItem: React.FC<{ topic: string, details: string }> = ({ topic, details }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border-b border-surface-primary">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center text-left p-4 hover:bg-surface-secondary">
                <span className="font-semibold text-white">{topic}</span>
                <svg className={`w-5 h-5 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>
            {isOpen && (
                <div className="p-4 bg-black/30 animate-fade-in">
                    <p className="text-text-primary font-mono text-sm">{details}</p>
                </div>
            )}
        </div>
    )
}

const WorldInfoPanel: React.FC<WorldInfoPanelProps> = ({ worldInfo }) => {
  return (
    <div className="text-text-primary">
      {worldInfo.length > 0 ? (
        <div className="border-t border-surface-primary">
            {worldInfo.map((info, index) => (
                <AccordionItem key={index} topic={info.topic} details={info.details} />
            ))}
        </div>
      ) : (
        <div className="text-center text-text-secondary p-8 pt-12">
            <BookOpenIcon className="w-12 h-12 mx-auto mb-2" />
            <p>Information about the world, its locations, and lore will be collected here.</p>
        </div>
      )}
    </div>
  );
};

export default WorldInfoPanel;