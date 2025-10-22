import type { GameSession, CustomCharacter, AppSettings } from '../types';

const STORAGE_KEY = 'storyspawn_sessions';
const AVATARS_KEY = 'storyspawn_avatars';
const ACTIVE_AVATAR_ID_KEY = 'storyspawn_active_avatar_id';
const SETTINGS_KEY = 'storyspawn_settings';

// Define a constant for history pruning to manage storage size.
const MAX_HISTORY_PER_SESSION = 50;

export function getGameSessions(): GameSession[] {
    try {
        const sessionsJson = localStorage.getItem(STORAGE_KEY);
        if (!sessionsJson) return [];
        const sessions = JSON.parse(sessionsJson) as GameSession[];
        // Sort by lastPlayed date, newest first
        return sessions.sort((a, b) => new Date(b.lastPlayed).getTime() - new Date(a.lastPlayed).getTime());
    } catch (error) {
        console.error("Error loading game sessions from local storage:", error);
        return [];
    }
}

export function saveGameSession(session: GameSession): void {
    // Prune the current session's history before attempting to save.
    if (session.history.length > MAX_HISTORY_PER_SESSION) {
        session.history = session.history.slice(-MAX_HISTORY_PER_SESSION);
    }

    const sessions = getGameSessions();
    // Update or add the current session, placing it at the front (as the most recent).
    const otherSessions = sessions.filter(s => s.id !== session.id);
    const updatedSessions = [session, ...otherSessions];

    const trySave = (sessionsToSave: GameSession[]) => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionsToSave));
            return true; // Success
        } catch (error) {
            // Check for QuotaExceededError
            if (error instanceof DOMException && (error.name === 'QuotaExceededError' || error.code === 22)) {
                return false; // Needs pruning
            }
            console.error("Error saving game session to local storage:", error);
            // For other errors, we might not be able to recover.
            return true; 
        }
    };

    if (trySave(updatedSessions)) {
        return; // Saved successfully
    }

    // If saving failed due to quota, start pruning old sessions.
    console.warn("Local storage quota exceeded. Attempting to prune old game sessions.");
    const sessionsToPrune = [...updatedSessions];

    // Prune the oldest sessions first (they are at the end of the array)
    for (let i = sessionsToPrune.length - 1; i >= 0; i--) {
        const currentSession = sessionsToPrune[i];
        if (currentSession.history.length > 10) { // Prune any session with more than 10 history items
            currentSession.history = currentSession.history.slice(-10); // Prune aggressively
            if (trySave(sessionsToPrune)) {
                console.log(`Successfully saved after pruning session: ${currentSession.title}`);
                return; // Success!
            }
        }
    }
    
    console.error("Failed to save session even after attempting to prune all old sessions. The session data may be too large.");
}


export function deleteGameSession(sessionId: string): void {
    try {
        let sessions = getGameSessions();
        sessions = sessions.filter(s => s.id !== sessionId);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    } catch (error) {
        console.error("Error deleting game session from local storage:", error);
    }
}

export function renameGameSession(sessionId: string, newTitle: string): void {
    try {
        const sessions = getGameSessions();
        const sessionIndex = sessions.findIndex(s => s.id === sessionId);
        if (sessionIndex > -1) {
            sessions[sessionIndex].title = newTitle;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
        }
    } catch (error) {
        console.error("Error renaming game session:", error);
    }
}

export function getAvatars(): CustomCharacter[] {
    try {
        const avatarsJson = localStorage.getItem(AVATARS_KEY);
        return avatarsJson ? JSON.parse(avatarsJson) : [];
    } catch (error) {
        console.error("Error loading avatars from local storage:", error);
        return [];
    }
}

export function setActiveAvatarId(id: string | null) {
    if (id) {
        localStorage.setItem(ACTIVE_AVATAR_ID_KEY, id);
    } else {
        localStorage.removeItem(ACTIVE_AVATAR_ID_KEY);
    }
}

export function getActiveAvatarId(): string | null {
    return localStorage.getItem(ACTIVE_AVATAR_ID_KEY);
}

export function getCustomCharacter(): CustomCharacter | null {
    try {
        const activeId = getActiveAvatarId();
        const avatars = getAvatars();

        if (activeId) {
            const activeAvatar = avatars.find(a => a.id === activeId);
            if (activeAvatar) return activeAvatar;
        }
        
        // Fallback if no active ID is set or the active ID is invalid
        return avatars.length > 0 ? avatars[0] : null;
    } catch (error) {
        console.error("Error loading character from local storage:", error);
        return null;
    }
}

export function saveCustomCharacter(character: CustomCharacter): void {
    try {
        const avatars = getAvatars();
        const existingIndex = avatars.findIndex(a => a.id === character.id);
        if (existingIndex > -1) {
            avatars[existingIndex] = character;
        } else {
            avatars.unshift(character); // add to front
        }
        localStorage.setItem(AVATARS_KEY, JSON.stringify(avatars));
    } catch (error) {
        console.error("Error saving character to local storage:", error);
    }
}

export function deleteCustomCharacter(avatarId?: string): void {
    if (!avatarId) return; // safety check
    try {
        let avatars = getAvatars();
        avatars = avatars.filter(a => a.id !== avatarId);
        localStorage.setItem(AVATARS_KEY, JSON.stringify(avatars));
        
        if (getActiveAvatarId() === avatarId) {
            // If there are other avatars, set the first one as active, otherwise clear it.
            const newActiveId = avatars.length > 0 ? avatars[0].id : null;
            setActiveAvatarId(newActiveId);
        }
    } catch (error) {
        console.error("Error deleting character from local storage:", error);
    }
}

export function getAppSettings(): AppSettings {
    const defaultSettings: AppSettings = {
        theme: 'violet',
        reducedMotion: false,
        fontSize: 'base',
        disableSuggestions: false,
        customTheme: {
            bgPrimary: '#100d1a',
            bgSecondary: '#1e1b2b',
            surfacePrimary: '#2d2840',
            borderPrimary: '#413a5c',
            textPrimary: '#e7e5e4',
            textSecondary: '#8a81b0',
            accentPrimary: '#8b5cf6',
            accentSecondary: '#a78bfa',
        },
    };
    try {
        const settingsJson = localStorage.getItem(SETTINGS_KEY);
        // Check for prefers-reduced-motion media query as a one-time default
        if (!settingsJson && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            defaultSettings.reducedMotion = true;
        }
        const savedSettings = settingsJson ? JSON.parse(settingsJson) : {};
        
        return { 
            ...defaultSettings, 
            ...savedSettings,
            customTheme: {
                ...defaultSettings.customTheme,
                ...savedSettings.customTheme,
            }
        };
    } catch (error) {
        console.error("Error loading settings from local storage:", error);
        return defaultSettings;
    }
}

export function saveAppSettings(settings: AppSettings): void {
    try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
        console.error("Error saving settings to local storage:", error);
    }
}

export function clearAllGameData(): void {
    try {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(AVATARS_KEY);
        localStorage.removeItem(ACTIVE_AVATAR_ID_KEY);
    } catch (error) {
        console.error("Error clearing game data from local storage:", error);
    }
}