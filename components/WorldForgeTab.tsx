import React, { useState } from 'react';
import { 
    FEATURED_WORLDS, 
    EXPANDED_FEATURED_WORLDS,
    FORGE_WHO_ARE_YOU,
    FORGE_WHERE_DOES_STORY_BEGIN,
    FORGE_WHAT_DRIVES_YOU,
    FORGE_WHAT_IS_UNIQUE,
    FORGE_CHERISHED_OBJECT,
    FORGE_INCITING_INCIDENT
} from '../constants';
import { AnvilIcon, CheckIcon } from './icons';

interface WorldForgeTabProps {
    onStart: (prompt: string) => void;
}

const ALL_WORLDS = [...FEATURED_WORLDS, ...EXPANDED_FEATURED_WORLDS];
type World = typeof ALL_WORLDS[0];

const TONES = ['Balanced', 'Serious', 'Humorous', 'Dark', 'Hopeful', 'Whimsical'];
const STYLES = ['Cinematic', 'Gritty', 'Poetic', 'Fast-Paced', 'Descriptive'];

const ForgeQuestion: React.FC<{
    label: string;
    options: string[];
    value: { selected: string; custom: string };
    onValueChange: (value: { selected: string; custom: string }) => void;
    placeholder: string;
    type?: 'buttons' | 'dropdown';
}> = ({ label, options, value, onValueChange, placeholder, type = 'buttons' }) => {
    
    const handleSelect = (selectedValue: string) => {
        onValueChange({ selected: selectedValue, custom: '' });
    };

    const handleCustomChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        onValueChange({ selected: '', custom: e.target.value });
    };

    return (
        <div>
            <label className="block text-sm font-medium text-stone-300 mb-3">{label}</label>
            {type === 'buttons' ? (
                <div className="flex flex-wrap gap-3">
                    {options.map(option => (
                        <button
                            key={option}
                            onClick={() => handleSelect(option)}
                            className={`flex-shrink-0 px-4 py-3 rounded-lg text-left transition-colors duration-200 border-2 text-sm max-w-xs ${
                                value.selected === option && !value.custom
                                    ? 'bg-accent/20 border-accent text-white shadow-md shadow-accent/10'
                                    : 'bg-stone-800/50 border-stone-700 text-stone-300 hover:bg-stone-700/50'
                            }`}
                        >
                            {option}
                        </button>
                    ))}
                </div>
            ) : (
                <select
                    value={value.custom ? '' : value.selected}
                    onChange={e => handleSelect(e.target.value)}
                    className="w-full bg-stone-800 border border-stone-700 rounded-lg p-3 text-stone-200 focus:outline-none focus:ring-2 focus:ring-accent transition duration-200 appearance-none bg-no-repeat bg-right-3"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                        backgroundPosition: 'right 0.75rem center',
                        backgroundSize: '1.5em 1.5em'
                    }}
                >
                    <option value="" disabled>Select an option or write your own below</option>
                    {options.map(option => (
                        <option key={option} value={option}>
                            {option}
                        </option>
                    ))}
                </select>
            )}
             <textarea
                value={value.custom}
                onChange={handleCustomChange}
                placeholder={placeholder}
                rows={2}
                className="w-full bg-stone-900 border border-stone-700 rounded-lg p-3 text-stone-200 placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-accent transition duration-200 mt-3 resize-none font-mono"
            />
        </div>
    );
};

const WorldForgeTab: React.FC<WorldForgeTabProps> = ({ onStart }) => {
    const [drive, setDrive] = useState({ selected: FORGE_WHAT_DRIVES_YOU[0], custom: '' });
    const [who, setWho] = useState({ selected: FORGE_WHO_ARE_YOU[0], custom: '' });
    const [uniqueTrait, setUniqueTrait] = useState({ selected: FORGE_WHAT_IS_UNIQUE[0], custom: '' });
    const [cherishedObject, setCherishedObject] = useState({ selected: FORGE_CHERISHED_OBJECT[0], custom: '' });
    const [where, setWhere] = useState({ selected: FORGE_WHERE_DOES_STORY_BEGIN[0], custom: '' });
    const [incident, setIncident] = useState({ selected: FORGE_INCITING_INCIDENT[0], custom: '' });
    
    const [selectedWorlds, setSelectedWorlds] = useState<World[]>([]);
    const [customElements, setCustomElements] = useState('');
    const [tone, setTone] = useState('Balanced');
    const [style, setStyle] = useState('Cinematic');
    const [showBlendAndRefine, setShowBlendAndRefine] = useState(false);
    
    const handleWorldSelect = (world: World) => {
        setSelectedWorlds(prev => {
            if (prev.find(w => w.title === world.title)) {
                return prev.filter(w => w.title !== world.title);
            }
            if (prev.length < 3) {
                return [...prev, world];
            }
            return prev;
        });
    };

    const handleForge = () => {
        let finalPrompt = 'I want to start a new story. ';

        const driveValue = drive.custom || drive.selected;
        if (driveValue) {
            finalPrompt += `The protagonist is driven by this core motivation: "${driveValue}". `;
        }

        let protagonistDetails = [];
        const whoValue = who.custom || who.selected;
        if (whoValue) protagonistDetails.push(`they are ${whoValue.toLowerCase()}`);
        const uniqueTraitValue = uniqueTrait.custom || uniqueTrait.selected;
        if (uniqueTraitValue) protagonistDetails.push(`their unique trait is that ${uniqueTraitValue.toLowerCase()}`);
        const cherishedObjectValue = cherishedObject.custom || cherishedObject.selected;
        if (cherishedObjectValue) protagonistDetails.push(`they carry ${cherishedObjectValue.toLowerCase()}`);
        if (protagonistDetails.length > 0) {
            finalPrompt += `For the protagonist, ${protagonistDetails.join(', and ')}. `;
        }

        const whereValue = where.custom || where.selected;
        if (whereValue) {
            finalPrompt += `The story begins ${whereValue.toLowerCase()}. `;
        }
        
        const incidentValue = incident.custom || incident.selected;
        if (incidentValue) {
            finalPrompt += `The story is set in motion when ${incidentValue.toLowerCase()}. `
        }

        if (selectedWorlds.length > 0) {
            const worldTitles = selectedWorlds.map(w => `"${w.title}"`).join(', ');
            finalPrompt += `The narrative should blend the core concepts, themes, and settings from the following existing stories: ${worldTitles}. `;
        }

        if (customElements.trim()) {
            finalPrompt += `Please also incorporate these specific custom elements into the world and opening scene: ${customElements.trim()}. `;
        }

        finalPrompt += `The tone should be ${tone.toLowerCase()}, and the writing style should be ${style.toLowerCase()}. `;

        finalPrompt += `Now, begin the story by setting the scene and introducing the initial situation.`;
        
        onStart(finalPrompt);
    };
    
    const renderSection = (step: number, title: string, children: React.ReactNode) => (
        <section className="border-t border-stone-800 pt-6">
            <h3 className="text-xl font-semibold text-white mb-4">
                <span className="text-accent">{step}.</span> {title}
            </h3>
            {children}
        </section>
    );

    return (
        <div className="animate-fade-in pt-6 text-left">
            <p className="text-stone-400 mb-8 text-center">Craft a unique starting point by defining the core elements of your adventure.</p>
            
            <div className="space-y-8">
                {renderSection(1, "The Core Idea", (
                    <ForgeQuestion 
                        label="What is the central motivation or conflict?" 
                        options={FORGE_WHAT_DRIVES_YOU} 
                        value={drive} 
                        onValueChange={setDrive}
                        placeholder="Or write your own motivation..."
                        type="buttons"
                    />
                ))}

                {renderSection(2, "The Protagonist", (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <ForgeQuestion label="Who are you?" options={FORGE_WHO_ARE_YOU} value={who} onValueChange={setWho} type="dropdown" placeholder="Or describe who you are..." />
                        <ForgeQuestion label="What makes you unique?" options={FORGE_WHAT_IS_UNIQUE} value={uniqueTrait} onValueChange={setUniqueTrait} type="dropdown" placeholder="Or describe your unique trait..." />
                        <div className="md:col-span-2">
                           <ForgeQuestion label="What is your cherished object?" options={FORGE_CHERISHED_OBJECT} value={cherishedObject} onValueChange={setCherishedObject} type="dropdown" placeholder="Or describe your cherished object..."/>
                        </div>
                    </div>
                ))}

                {renderSection(3, "The Setting", (
                     <ForgeQuestion label="Where does the story begin?" options={FORGE_WHERE_DOES_STORY_BEGIN} value={where} onValueChange={setWhere} type="buttons" placeholder="Or describe your own setting..."/>
                ))}
                
                {renderSection(4, "The Inciting Incident", (
                     <ForgeQuestion label="How does the adventure kick off?" options={FORGE_INCITING_INCIDENT} value={incident} onValueChange={setIncident} type="buttons" placeholder="Or write your own inciting incident..."/>
                ))}

                <section className="border-t border-stone-800 pt-6">
                    <div className="flex justify-between items-center mb-4">
                         <h3 className="text-xl font-semibold text-white">
                            <span className="text-accent">5.</span> Blend & Refine <span className="text-base font-normal text-stone-400">(Optional)</span>
                        </h3>
                        {!showBlendAndRefine && (
                             <button onClick={() => setShowBlendAndRefine(true)} className="bg-stone-700/50 hover:bg-stone-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm">
                                Show Options
                            </button>
                        )}
                    </div>
                    {showBlendAndRefine && (
                        <div className="space-y-4 animate-fade-in">
                            <div>
                                <label className="block text-sm font-medium text-stone-300 mb-2">Blend Stories <span className="font-normal text-stone-400">(Select up to 3)</span></label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-2 bg-stone-950/50 rounded-lg max-h-80 overflow-y-auto">
                                    {ALL_WORLDS.map(world => {
                                        const isSelected = selectedWorlds.some(w => w.title === world.title);
                                        return (
                                            <button key={world.title} onClick={() => handleWorldSelect(world)} className="relative aspect-square rounded-lg overflow-hidden border-2 transition-all duration-200 group focus:outline-none"
                                                style={{
                                                    borderColor: isSelected ? 'var(--color-accent)' : 'var(--stone-800)',
                                                    boxShadow: isSelected ? '0 0 15px var(--color-accent-glow)' : 'none'
                                                }}
                                            >
                                                <img src={world.imageUrl} alt={world.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                                                <div className={`absolute inset-0 bg-gradient-to-t from-black/80 to-transparent transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}></div>
                                                <p className="absolute bottom-2 left-2 right-2 text-xs font-bold text-white leading-tight">{world.title}</p>
                                                {isSelected && (
                                                    <div className="absolute top-2 right-2 w-6 h-6 bg-accent rounded-full flex items-center justify-center text-white">
                                                        <CheckIcon className="w-4 h-4" />
                                                    </div>
                                                )}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-stone-300 mb-2">Add Custom Elements</label>
                                <textarea
                                    value={customElements}
                                    onChange={(e) => setCustomElements(e.target.value)}
                                    placeholder="e.g., A mysterious compass, a city built on a giant turtle, a talking fox..."
                                    className="w-full bg-stone-800 border border-stone-700 rounded-lg p-3 text-stone-200 placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-accent transition duration-200 h-24 resize-none font-mono"
                                />
                            </div>
                        </div>
                    )}
                </section>

                {renderSection(6, "Define Tone & Style", (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-stone-300 mb-2">Tone</label>
                            <div className="flex flex-wrap gap-2">
                                {TONES.map(t => <ToggleButton key={t} value={t} selectedValue={tone} onSelect={setTone} />)}
                            </div>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-stone-300 mb-2">Style</label>
                            <div className="flex flex-wrap gap-2">
                                {STYLES.map(s => <ToggleButton key={s} value={s} selectedValue={style} onSelect={setStyle} />)}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-8 pt-6 border-t border-stone-800">
                <button
                    onClick={handleForge}
                    className="w-full bg-accent text-white font-bold py-3 px-8 rounded-full text-lg hover:bg-accent-hover transition duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-stone-900 focus:ring-white animate-glow flex items-center justify-center gap-2"
                >
                    <AnvilIcon className="w-5 h-5"/>
                    Forge Your Story
                </button>
            </div>
        </div>
    );
};

const ToggleButton: React.FC<{value: string; selectedValue: string; onSelect: (value: string) => void}> = ({ value, selectedValue, onSelect }) => (
    <button
        onClick={() => onSelect(value)}
        className={`px-3 py-1.5 text-sm rounded-full border-2 transition-colors ${selectedValue === value ? 'bg-accent/20 border-accent text-white' : 'bg-stone-800/50 border-stone-700 text-stone-300 hover:border-stone-500'}`}
    >
        {value}
    </button>
);

export default WorldForgeTab;