import React, { useState, useEffect, useCallback } from 'react';
import type { CustomCharacter } from '../types';
import { generateCharacterImage } from '../services/geminiService';
import LoadingSpinner from './LoadingSpinner';
import { QuestionMarkCircleIcon } from './icons';

interface InGameCustomizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  character: CustomCharacter | null;
  onSave: (character: CustomCharacter) => void;
  reason: string;
}

const InGameCustomizationModal: React.FC<InGameCustomizationModalProps> = ({ isOpen, onClose, character, onSave, reason }) => {
  const [localCharacter, setLocalCharacter] = useState<CustomCharacter | null>(character);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    setLocalCharacter(character);
  }, [character, isOpen]);

  const generateSummary = useCallback(() => {
    if (!localCharacter) return '';
    const parts = [];
    if (localCharacter.appearance.build) parts.push(`${localCharacter.appearance.build} build`);
    if (localCharacter.appearance.skinTone) parts.push(`${localCharacter.appearance.skinTone} skin`);
    if (localCharacter.appearance.hairStyle && localCharacter.appearance.hairColor) {
        parts.push(`${localCharacter.appearance.hairStyle}, ${localCharacter.appearance.hairColor.toLowerCase()} hair`);
    } else if (localCharacter.appearance.hairStyle) {
        parts.push(`${localCharacter.appearance.hairStyle} hair`);
    }
    if (localCharacter.appearance.eyeColor) parts.push(`${localCharacter.appearance.eyeColor.toLowerCase()} eyes`);
    if (localCharacter.appearance.distinguishingFeatures) parts.push(localCharacter.appearance.distinguishingFeatures);
    if (localCharacter.appearance.accessories) parts.push(`wearing ${localCharacter.appearance.accessories}`);
    const summary = parts.join(', ');
    return summary ? summary + '.' : '';
  }, [localCharacter]);

  useEffect(() => {
    if (localCharacter) {
        setLocalCharacter(prev => prev ? ({...prev, appearanceSummary: generateSummary()}) : null);
    }
  }, [localCharacter?.appearance, generateSummary]);

  const handleGeneratePortrait = async () => {
    if (!localCharacter) return;
    setIsGenerating(true);
    try {
        const { name, pronouns, age, height, appearanceSummary } = localCharacter;
        const imageUrl = await generateCharacterImage(appearanceSummary, name, pronouns, age, height);
        setLocalCharacter(prev => prev ? ({...prev, portraitUrl: imageUrl}) : null);
    } finally {
        setIsGenerating(false);
    }
  };

  const handleSave = () => {
    if (localCharacter) {
        onSave(localCharacter);
    }
  };

  const handleValueChange = (field: keyof CustomCharacter['appearance'], value: string) => {
    setLocalCharacter(prev => {
        if (!prev) return null;
        return {
            ...prev,
            appearance: {
                ...prev.appearance,
                [field]: value
            }
        }
    });
  };


  if (!isOpen || !localCharacter) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-stone-900 border border-stone-700 rounded-lg w-full max-w-2xl m-4 text-white flex flex-col max-h-[90vh] animate-fade-in shadow-2xl shadow-black/50"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-stone-800">
            <h2 className="text-2xl font-bold">Edit Appearance</h2>
            <p className="text-sm text-accent-text mt-1 bg-accent/10 p-2 rounded-md border border-accent/20">{reason}</p>
        </div>
        
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-y-auto">
            <div className="md:col-span-1 space-y-3">
                <div className="aspect-square w-full bg-stone-800 border-2 border-stone-700 rounded-lg flex items-center justify-center overflow-hidden relative">
                    {localCharacter.portraitUrl ? <img src={localCharacter.portraitUrl} alt="Portrait" className="w-full h-full object-cover"/> : <span className="text-stone-500 text-xs p-2">No Portrait</span>}
                    {isGenerating && <div className="absolute inset-0 bg-black/70 flex items-center justify-center"><LoadingSpinner /></div>}
                </div>
                <button
                    onClick={handleGeneratePortrait}
                    disabled={isGenerating || !localCharacter.appearanceSummary}
                    className="w-full flex items-center justify-center gap-2 bg-stone-700 text-white font-bold py-2 px-4 rounded-lg hover:bg-stone-600 transition-colors disabled:bg-stone-800 disabled:cursor-not-allowed"
                >
                    <QuestionMarkCircleIcon className="w-5 h-5" />
                    <span>{isGenerating ? 'Generating...' : 'Update Portrait'}</span>
                </button>
            </div>
            <div className="md:col-span-2 space-y-4">
                 <div className="grid grid-cols-2 gap-4">
                    <InputField label="Hair Style" value={localCharacter.appearance.hairStyle} onChange={(val) => handleValueChange('hairStyle', val)} />
                    <InputField label="Hair Color" value={localCharacter.appearance.hairColor} onChange={(val) => handleValueChange('hairColor', val)} />
                 </div>
                 <InputField label="Distinguishing Feature" value={localCharacter.appearance.distinguishingFeatures} onChange={(val) => handleValueChange('distinguishingFeatures', val)} />
                 <InputField label="Jewelry & Accessories" value={localCharacter.appearance.accessories} onChange={(val) => handleValueChange('accessories', val)} />
                 <div>
                    <label className="block text-sm font-medium text-stone-300 mb-2">Appearance Summary</label>
                    <div className="bg-stone-800/50 border border-stone-700 rounded-lg p-3 text-sm text-stone-300 min-h-[4rem] italic">
                        <p>{localCharacter.appearanceSummary || "No description."}</p>
                    </div>
                </div>
            </div>
        </div>
        
        <div className="p-4 bg-black/20 mt-auto border-t border-stone-800 flex justify-end gap-3">
            <button onClick={onClose} className="bg-stone-700 text-white font-bold py-2 px-6 rounded-lg hover:bg-stone-600 transition-colors">Cancel</button>
            <button onClick={handleSave} className="bg-accent text-white font-bold py-2 px-6 rounded-lg hover:bg-accent-hover transition-colors">Save Changes</button>
        </div>
      </div>
    </div>
  );
};

const InputField: React.FC<{label: string, value: string, onChange: (value: string) => void}> = ({ label, value, onChange }) => (
    <div>
        <label className="block text-sm font-medium text-stone-300 mb-2">{label}</label>
        <input type="text" value={value || ''} onChange={e => onChange(e.target.value)} className="w-full bg-stone-900 border border-stone-700 rounded-md p-2 text-stone-200 focus:outline-none focus:ring-2 focus:ring-accent" />
    </div>
);

export default InGameCustomizationModal;