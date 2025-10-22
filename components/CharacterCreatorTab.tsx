import React, { useState, useEffect, useCallback } from 'react';
import { 
    getAvatars, 
    saveCustomCharacter, 
    deleteCustomCharacter,
    setActiveAvatarId,
    getActiveAvatarId
} from '../services/storageService';
import { generateCharacterImage } from '../services/geminiService';
import type { CustomCharacter } from '../types';
import { QuestionMarkCircleIcon, TrashIcon, UserCircleIcon, RefreshIcon, PlusIcon } from './icons';
import LoadingSpinner from './LoadingSpinner';

const appearanceOptions = {
  build: ['Slender', 'Average', 'Athletic', 'Heavyset', 'Wiry', 'Muscular'],
  skinTone: ['Pale', 'Fair', 'Tanned', 'Olive', 'Brown', 'Dark'],
  hairStyle: ['Short and spiky', 'Long and braided', 'Messy bun', 'Undercut', 'Bald', 'Dreadlocks', 'Shaved sides', 'Mohawk'],
  hairColor: ['Black', 'Brown', 'Blonde', 'Red', 'White', 'Grey', 'Dyed blue', 'Dyed green'],
  eyeColor: ['Brown', 'Blue', 'Green', 'Hazel', 'Grey', 'Amber', 'Violet'],
  distinguishingFeatures: ['A scar over the left eye', 'A cybernetic arm', 'Tribal tattoos on their face', 'A calm and watchful demeanor', 'Worn and weary eyes', 'A perpetually hopeful smile', 'A robotic eye', 'Ornate jewelry from scavenged parts'],
  accessories: ['A simple leather satchel', 'A silver ring on their right hand', 'Goggles pushed up on their forehead', 'A worn traveler\'s cloak', 'An intricate pendant around their neck']
};

const nameOptions = {
    first: ['Kael', 'Roric', 'Elara', 'Seraphina', 'Jaxon', 'Zane', 'Lyra', 'Aria', 'Gideon', 'Silas', 'Nia', 'Corbin'],
    last: ['Stonehand', 'Shadowmend', 'Swiftwind', 'Ironheart', 'Voidgazer', 'Brightwood', 'Stormcaller', 'Nightshade']
};

const NEW_AVATAR_TEMPLATE: Omit<CustomCharacter, 'id'> = {
    name: '',
    pronouns: 'they/them',
    age: '',
    height: '',
    appearance: {},
    appearanceSummary: '',
    portraitUrl: '',
};


interface AppearanceInputProps {
    label: string;
    field: string;
    options: string[];
    value: string;
    onValueChange: (field: string, value: string) => void;
}

const AppearanceInput: React.FC<AppearanceInputProps> = ({ label, field, options, value, onValueChange }) => {
    return (
        <div>
            <label htmlFor={field} className="block text-sm font-medium text-stone-300 mb-2">{label}</label>
            <input
                id={field}
                type="text"
                value={value || ''}
                onChange={(e) => onValueChange(field, e.target.value)}
                placeholder={`e.g., ${options[0]} or something new...`}
                className="w-full bg-stone-900 border border-stone-700 rounded-md p-2 text-stone-200 focus:outline-none focus:ring-2 focus:ring-accent placeholder-stone-500"
            />
            <div className="flex flex-wrap gap-2 mt-2">
                {options.slice(0, 4).map(opt => (
                    <button
                        key={opt}
                        type="button"
                        onClick={() => onValueChange(field, opt)}
                        className="px-3 py-1 text-xs rounded-full bg-stone-700 hover:bg-accent text-stone-200 hover:text-white transition-colors"
                        title={opt}
                    >
                        {opt}
                    </button>
                ))}
            </div>
        </div>
    );
};


const CharacterCreatorTab: React.FC = () => {
    const [avatars, setAvatars] = useState<CustomCharacter[]>([]);
    const [selectedAvatarId, setSelectedAvatarId] = useState<string | null>(null);
    const [character, setCharacter] = useState<Omit<CustomCharacter, 'id'> & { id?: string }>(NEW_AVATAR_TEMPLATE);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');

    const handleSelectAvatar = useCallback((id: string, currentAvatars: CustomCharacter[]) => {
        const avatarToSelect = currentAvatars.find(a => a.id === id);
        if (avatarToSelect) {
            setSelectedAvatarId(id);
            setCharacter(avatarToSelect);
            setActiveAvatarId(id);
            setIsDirty(false);
        }
    }, []);

    const handleNewAvatar = useCallback(() => {
        setSelectedAvatarId(null);
        setCharacter(NEW_AVATAR_TEMPLATE);
        setIsDirty(false);
    }, []);

    const loadAvatars = useCallback(() => {
        const savedAvatars = getAvatars();
        setAvatars(savedAvatars);
        const activeId = getActiveAvatarId();
        
        let idToSelect = activeId;
        if (!idToSelect && savedAvatars.length > 0) {
            idToSelect = savedAvatars[0].id;
        }

        if (idToSelect && savedAvatars.some(a => a.id === idToSelect)) {
            handleSelectAvatar(idToSelect, savedAvatars);
        } else {
            handleNewAvatar();
        }
    }, [handleNewAvatar, handleSelectAvatar]);

    useEffect(() => {
        loadAvatars();
    }, [loadAvatars]);


    const handleCharacterFieldChange = (field: keyof Omit<CustomCharacter, 'appearance' | 'appearanceSummary'>, value: string) => {
        setCharacter(prev => ({ ...prev, [field]: value }));
        setIsDirty(true);
    };

    const handleAppearanceChange = (field: keyof CustomCharacter['appearance'], value: string) => {
        setCharacter(prev => ({
            ...prev,
            appearance: {
                ...prev.appearance,
                [field]: value
            }
        }));
        setIsDirty(true);
    };

    const handleHeightChange = (part: 'feet' | 'inches', value: string) => {
        const currentHeight = character.height || "0'0\"";
        let [feet, inches] = currentHeight.replace(/"/g, '').split("'").map(Number);
        if (part === 'feet') feet = parseInt(value) || 0;
        if (part === 'inches') inches = parseInt(value) || 0;
        const newHeight = `${feet}'${inches}"`;
        handleCharacterFieldChange('height', newHeight);
    };

    const generateSummary = useCallback(() => {
        const parts = [];
        if (character.appearance.build) parts.push(`${character.appearance.build} build`);
        if (character.appearance.skinTone) parts.push(`${character.appearance.skinTone} skin`);
        if (character.appearance.hairStyle && character.appearance.hairColor) {
            parts.push(`${character.appearance.hairStyle}, ${character.appearance.hairColor.toLowerCase()} hair`);
        } else if (character.appearance.hairStyle) {
            parts.push(`${character.appearance.hairStyle} hair`);
        }
        if (character.appearance.eyeColor) parts.push(`${character.appearance.eyeColor.toLowerCase()} eyes`);
        if (character.appearance.distinguishingFeatures) parts.push(character.appearance.distinguishingFeatures);
        if (character.appearance.accessories) parts.push(`wearing ${character.appearance.accessories}`);

        const summary = parts.join(', ');
        return summary ? summary + '.' : '';
    }, [character.appearance]);

    useEffect(() => {
        setCharacter(prev => ({...prev, appearanceSummary: generateSummary()}));
    }, [character.appearance, generateSummary]);

    const handleGeneratePortrait = async () => {
        setIsGenerating(true);
        try {
            const { name, pronouns, age, height, appearanceSummary } = character;
            const imageUrl = await generateCharacterImage(appearanceSummary, name, pronouns, age, height);
            setCharacter(prev => ({...prev, portraitUrl: imageUrl}));
            setIsDirty(true);
        } catch (error) {
            console.error("Failed to generate portrait", error);
        } finally {
            setIsGenerating(false);
        }
    };
    
    const handleSave = () => {
        const finalCharacter: CustomCharacter = {
            ...NEW_AVATAR_TEMPLATE,
            ...character,
            id: selectedAvatarId || Date.now().toString(),
        };
        
        saveCustomCharacter(finalCharacter);
        setActiveAvatarId(finalCharacter.id);
        setIsDirty(false);
        setSaveMessage('Avatar Saved!');
        setTimeout(() => setSaveMessage(''), 2000);
        
        const newAvatars = getAvatars();
        setAvatars(newAvatars);
        setSelectedAvatarId(finalCharacter.id);
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Are you sure you want to delete this avatar?')) {
            deleteCustomCharacter(id);
            const remainingAvatars = getAvatars();
            setAvatars(remainingAvatars);
            if (selectedAvatarId === id) {
                if (remainingAvatars.length > 0) {
                    handleSelectAvatar(remainingAvatars[0].id, remainingAvatars);
                } else {
                    handleNewAvatar();
                }
            }
        }
    };
    
    const handleRandomize = () => {
        const randomOption = (options: string[]) => options[Math.floor(Math.random() * options.length)];
        
        const newAppearance: CustomCharacter['appearance'] = {};
        const keys = Object.keys(appearanceOptions) as Array<keyof typeof appearanceOptions>;
        for (const key of keys) {
            const options = appearanceOptions[key];
            newAppearance[key] = randomOption(options);
        }

        const pronouns = ['they/them', 'she/her', 'he/him'];
        const feet = Math.floor(Math.random() * 2) + 5; // 5 or 6
        const inches = Math.floor(Math.random() * 12); // 0-11

        setCharacter(prev => ({
            ...prev,
            name: `${randomOption(nameOptions.first)} ${randomOption(nameOptions.last)}`,
            pronouns: randomOption(pronouns),
            appearance: newAppearance,
            age: `${Math.floor(Math.random() * 40) + 18}`,
            height: `${feet}'${inches}"`
        }));
        setIsDirty(true);
    };

    const [feet, inches] = (character.height || "0'0\"").replace(/"/g, '').split("'").map(Number);
    const isNew = !selectedAvatarId;
    const saveButtonText = isNew ? 'Save New Avatar' : 'Update Avatar';
    
    return (
        <div className="animate-fade-in pt-6 text-left flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-1/3 flex-shrink-0 border-b md:border-b-0 md:border-r border-stone-700 pb-4 md:pb-0 md:pr-6">
                <button
                    onClick={handleNewAvatar}
                    className="w-full flex items-center justify-center gap-2 p-3 mb-3 rounded-lg bg-accent/20 text-accent-text hover:bg-accent/30 transition-colors"
                >
                    <PlusIcon className="w-5 h-5" />
                    New Avatar
                </button>
                <div className="space-y-2 max-h-48 md:max-h-[60vh] overflow-y-auto no-scrollbar pr-1">
                    {avatars.map(avatar => (
                        <button
                            key={avatar.id}
                            onClick={() => handleSelectAvatar(avatar.id, avatars)}
                            className={`w-full text-left p-2 rounded-lg flex items-center gap-3 transition-colors group relative ${selectedAvatarId === avatar.id ? 'bg-stone-700' : 'hover:bg-stone-800'}`}
                        >
                            <div className="w-10 h-10 rounded-full flex-shrink-0 bg-stone-800 overflow-hidden">
                                {avatar.portraitUrl ? <img src={avatar.portraitUrl} alt={avatar.name} className="w-full h-full object-cover" /> : <UserCircleIcon className="w-full h-full text-stone-600"/>}
                            </div>
                            <span className="flex-1 truncate font-semibold">{avatar.name || 'Untitled Avatar'}</span>
                            <div
                                onClick={(e) => { e.stopPropagation(); handleDelete(avatar.id); }}
                                className="p-2 rounded-full text-stone-500 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
                                aria-label={`Delete ${avatar.name}`}
                            >
                                <TrashIcon className="w-4 h-4" />
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            <div className="w-full md:w-2/3 flex-1">
                <div className="max-h-[60vh] overflow-y-auto -mr-4 pr-4 no-scrollbar">
                    <p className="text-stone-400 mb-6 text-center">Design a persistent avatar for all your adventures. The selected avatar will be used when you start a new game.</p>
                
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 items-start">
                        <div className="md:col-span-1 space-y-3">
                            <div className="aspect-square w-full bg-stone-800/50 border-2 border-stone-700 rounded-lg flex items-center justify-center overflow-hidden relative group">
                                {character.portraitUrl ? (
                                    <img src={character.portraitUrl} alt="Character Portrait" className="w-full h-full object-cover"/>
                                ) : (
                                     <div className="text-center text-stone-500 p-4">
                                        <UserCircleIcon className="w-24 h-24 mx-auto" />
                                        <p className="text-sm">Portrait will appear here</p>
                                    </div>
                                )}
                                {isGenerating && <div className="absolute inset-0 bg-black/70 flex items-center justify-center"><LoadingSpinner /></div>}
                            </div>
                            <button
                                type="button"
                                onClick={handleGeneratePortrait}
                                disabled={isGenerating || !character.appearanceSummary}
                                className="w-full flex items-center justify-center gap-2 bg-stone-700 text-white font-bold py-2 px-4 rounded-lg hover:bg-stone-600 transition-colors disabled:bg-stone-800 disabled:cursor-not-allowed"
                            >
                               <QuestionMarkCircleIcon className="w-5 h-5" />
                               <span>{isGenerating ? 'Generating...' : 'Generate Portrait'}</span>
                            </button>
                        </div>
                         <div className="md:col-span-2 space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-stone-300 mb-2">Name</label>
                                    <input id="name" type="text" value={character.name} onChange={e => handleCharacterFieldChange('name', e.target.value)} placeholder="Enter character name" className="w-full bg-stone-900 border border-stone-700 rounded-md p-2 text-stone-200 focus:outline-none focus:ring-2 focus:ring-accent" />
                                </div>
                                <div>
                                    <label htmlFor="pronouns" className="block text-sm font-medium text-stone-300 mb-2">Pronouns</label>
                                    <select id="pronouns" value={character.pronouns} onChange={e => handleCharacterFieldChange('pronouns', e.target.value)} className="w-full bg-stone-900 border border-stone-700 rounded-md p-2 text-stone-200 focus:outline-none focus:ring-2 focus:ring-accent">
                                        <option>they/them</option>
                                        <option>she/her</option>
                                        <option>he/him</option>
                                    </select>
                                </div>
                                 <div>
                                    <label htmlFor="age" className="block text-sm font-medium text-stone-300 mb-2">Age</label>
                                    <input id="age" type="text" value={character.age} onChange={e => handleCharacterFieldChange('age', e.target.value)} placeholder="e.g., 28" className="w-full bg-stone-900 border border-stone-700 rounded-md p-2 text-stone-200 focus:outline-none focus:ring-2 focus:ring-accent" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-stone-300 mb-2">Height</label>
                                    <div className="flex gap-2">
                                        <input type="number" value={feet || ''} onChange={e => handleHeightChange('feet', e.target.value)} placeholder="ft" className="w-full bg-stone-900 border border-stone-700 rounded-md p-2 text-stone-200 focus:outline-none focus:ring-2 focus:ring-accent" />
                                        <input type="number" value={inches || ''} onChange={e => handleHeightChange('inches', e.target.value)} placeholder="in" className="w-full bg-stone-900 border border-stone-700 rounded-md p-2 text-stone-200 focus:outline-none focus:ring-2 focus:ring-accent" />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-stone-300 mb-2">Appearance Summary</label>
                                <div className="bg-stone-900 border border-stone-700 rounded-lg p-3 text-sm text-stone-300 min-h-[4rem] italic">
                                    <p>{character.appearanceSummary || "Describe your character to generate a summary..."}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-between items-center pt-4 mb-4 border-t border-stone-700/50">
                        <h3 className="text-lg font-semibold text-white">Details</h3>
                        <button type="button" onClick={handleRandomize} className="flex items-center gap-2 text-sm text-stone-400 hover:text-white transition-colors">
                            <RefreshIcon className="w-4 h-4" />
                            Randomize
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                        <AppearanceInput label="Build" field="build" options={appearanceOptions.build} value={character.appearance.build} onValueChange={handleAppearanceChange} />
                        <AppearanceInput label="Skin Tone" field="skinTone" options={appearanceOptions.skinTone} value={character.appearance.skinTone} onValueChange={handleAppearanceChange} />
                        <AppearanceInput label="Hair Style" field="hairStyle" options={appearanceOptions.hairStyle} value={character.appearance.hairStyle} onValueChange={handleAppearanceChange} />
                        <AppearanceInput label="Hair Color" field="hairColor" options={appearanceOptions.hairColor} value={character.appearance.hairColor} onValueChange={handleAppearanceChange} />
                        <AppearanceInput label="Eye Color" field="eyeColor" options={appearanceOptions.eyeColor} value={character.appearance.eyeColor} onValueChange={handleAppearanceChange} />
                        <AppearanceInput label="Distinguishing Feature" field="distinguishingFeatures" options={appearanceOptions.distinguishingFeatures} value={character.appearance.distinguishingFeatures} onValueChange={handleAppearanceChange} />
                        <AppearanceInput label="Accessories" field="accessories" options={appearanceOptions.accessories} value={character.appearance.accessories} onValueChange={handleAppearanceChange} />
                    </div>
                </div>
                <div className="mt-auto pt-4 border-t border-stone-800">
                    <button
                        onClick={handleSave}
                        disabled={!isDirty || !character.name}
                        className="w-full bg-accent text-white font-bold py-3 rounded-lg hover:bg-accent-hover transition-colors disabled:bg-stone-800 disabled:text-stone-500 disabled:cursor-not-allowed"
                    >
                        {saveMessage || saveButtonText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CharacterCreatorTab;
