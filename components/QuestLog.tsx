import React, { useState } from 'react';
import type { Quest, Objective } from '../types';
// FIX: Import CheckIcon from './icons' instead of defining it locally.
import { ClipboardListIcon, CheckIcon } from './icons';

interface QuestLogProps {
  quests: Quest[];
  newQuests: string[];
  onObjectiveClick: (objective: Objective) => void;
}

const QuestItem: React.FC<{ quest: Quest, isNew: boolean, onObjectiveClick: (objective: Objective) => void }> = ({ quest, isNew, onObjectiveClick }) => {
    const [isOpen, setIsOpen] = useState(quest.status === 'active');
    const isCompleted = quest.status === 'completed';

    return (
        <div className={`border-b border-surface-primary transition-opacity duration-300 ${isCompleted ? 'opacity-60' : ''} ${isNew ? 'animate-glow-and-fade' : ''}`}>
            <button 
                onClick={() => setIsOpen(!isOpen)} 
                className="w-full flex justify-between items-center text-left p-4 hover:bg-surface-secondary"
                disabled={isCompleted}
            >
                <span className={`font-semibold ${isCompleted ? 'line-through text-text-secondary' : 'text-white'}`}>
                    {quest.title}
                </span>
                {!isCompleted && (
                    <svg className={`w-5 h-5 transition-transform text-text-secondary ${isOpen ? 'transform rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                )}
            </button>
            {isOpen && !isCompleted && (
                <div className="p-4 bg-black/30 animate-fade-in space-y-4">
                    <p className="text-text-primary font-mono text-sm italic">{quest.description}</p>
                    <div className="space-y-2">
                        {quest.objectives.map((obj, index) => (
                            <button 
                                key={index} 
                                onClick={() => onObjectiveClick(obj)}
                                disabled={obj.completed}
                                className="w-full flex items-center gap-3 text-sm text-left p-1 rounded-md hover:bg-white/10 transition-colors disabled:hover:bg-transparent"
                            >
                                <div className={`w-5 h-5 rounded flex-shrink-0 flex items-center justify-center ${obj.completed ? 'bg-accent' : 'bg-interactive-secondary'}`}>
                                    {obj.completed && <CheckIcon className="w-4 h-4 text-white" />}
                                </div>
                                <span className={`${obj.completed ? 'line-through text-text-secondary' : 'text-text-primary'}`}>
                                    {obj.text}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};


const QuestLog: React.FC<QuestLogProps> = ({ quests, newQuests, onObjectiveClick }) => {
  const activeQuests = quests.filter(q => q.status === 'active');
  const completedQuests = quests.filter(q => q.status === 'completed');

  return (
    <div className="text-text-primary">
      {quests.length === 0 ? (
        <div className="text-center text-text-secondary p-8 pt-12">
            <ClipboardListIcon className="w-12 h-12 mx-auto mb-2" />
            <p>Your objectives will appear here as you discover them.</p>
        </div>
      ) : (
         <div className="border-t border-surface-primary">
            {activeQuests.map((quest) => <QuestItem key={quest.title} quest={quest} isNew={newQuests.includes(quest.title)} onObjectiveClick={onObjectiveClick} />)}
            {completedQuests.map((quest) => <QuestItem key={quest.title} quest={quest} isNew={false} onObjectiveClick={onObjectiveClick} />)}
        </div>
      )}
    </div>
  );
};

export default QuestLog;