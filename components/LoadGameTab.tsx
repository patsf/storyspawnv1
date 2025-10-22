import React, { useState, useEffect } from 'react';
import type { GameSession } from '../types';
import { getGameSessions, deleteGameSession, renameGameSession } from '../services/storageService';
import { TrashIcon, QuillIcon } from './icons';

interface LoadGameTabProps {
    onLoad: (sessionId: string) => void;
    onRename: () => void;
    onDelete: () => void;
}

function timeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return "Just now";
}

function formatTimePlayed(seconds: number = 0): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}h ${m}m played`;
    return `${m}m played`;
}


const LoadGameTab: React.FC<LoadGameTabProps> = ({ onLoad, onRename, onDelete }) => {
    const [sessions, setSessions] = useState<GameSession[]>([]);
    const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
    const [newTitle, setNewTitle] = useState('');

    useEffect(() => {
        setSessions(getGameSessions());
    }, []);

    const handleDelete = (e: React.MouseEvent, sessionId: string) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this save? This action cannot be undone.')) {
            deleteGameSession(sessionId);
            setSessions(getGameSessions());
            onDelete();
        }
    };

    const handleRenameStart = (e: React.MouseEvent, session: GameSession) => {
        e.stopPropagation();
        setEditingSessionId(session.id);
        setNewTitle(session.title);
    };

    const handleRenameSave = (sessionId: string) => {
        if (newTitle.trim()) {
            renameGameSession(sessionId, newTitle.trim());
            setSessions(getGameSessions());
            setEditingSessionId(null);
            onRename();
        }
    }

    if (sessions.length === 0) {
        return (
            <div className="text-center py-12 text-stone-500 animate-fade-in">
                <p>No past adventures found.</p>
                <p className="text-sm">Time to create a new one!</p>
            </div>
        );
    }

    return (
        <div className="space-y-4 pt-6 max-h-[60vh] overflow-y-auto pr-2 animate-fade-in">
            {sessions.map(session => (
                <div key={session.id} className="bg-stone-800/50 border border-stone-700 rounded-lg transition-colors duration-200 overflow-hidden flex flex-col sm:flex-row">
                    {session.worldImageUrl && (
                        <div className="flex-shrink-0 sm:w-40 h-24 sm:h-auto">
                            <img src={session.worldImageUrl} alt={session.title} className="w-full h-full object-cover"/>
                        </div>
                    )}
                    <div className="p-4 flex flex-col flex-grow">
                        <div className="flex justify-between items-start mb-1">
                            {editingSessionId === session.id ? (
                                <input 
                                    type="text"
                                    value={newTitle}
                                    onChange={(e) => setNewTitle(e.target.value)}
                                    onBlur={() => handleRenameSave(session.id)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleRenameSave(session.id)}
                                    className="bg-stone-900 border border-accent rounded-md p-1 text-lg font-bold w-full -m-1"
                                    autoFocus
                                />
                            ) : (
                                <h3 className="font-bold text-white text-lg truncate pr-2">{session.title}</h3>
                            )}
                            <div className="flex gap-1 flex-shrink-0">
                                <button onClick={(e) => handleRenameStart(e, session)} className="p-2 rounded-md text-stone-400 hover:text-white hover:bg-stone-700/50"><QuillIcon className="w-4 h-4" /></button>
                                <button onClick={(e) => handleDelete(e, session.id)} className="p-2 rounded-md text-stone-400 hover:text-red-400 hover:bg-stone-700/50"><TrashIcon className="w-4 h-4" /></button>
                            </div>
                        </div>

                        <div className="text-xs text-stone-400 mb-3 flex gap-4">
                            <span>Last played: {timeAgo(session.lastPlayed)}</span>
                            <span>{formatTimePlayed(session.timePlayed)}</span>
                        </div>
                        
                        <div className="mt-auto">
                            <button 
                                onClick={() => onLoad(session.id)}
                                className="w-full bg-accent text-white font-bold py-2 px-4 rounded-lg hover:bg-accent-hover transition-colors duration-200"
                            >
                                Continue
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default LoadGameTab;