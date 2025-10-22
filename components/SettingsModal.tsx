import React, { useState, useEffect, useRef } from 'react';
import type { AppSettings, CustomTheme } from '../types';
import { PaletteIcon, XIcon, TrashIcon } from './icons';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSettingsChange: (settings: AppSettings) => void;
  onSave: () => void;
  onClearData: () => void;
}

const themes = [
    { id: 'default', name: 'Default Blue', colors: { bg: '#0f172a', surface: '#334155', accent: '#3b82f6', text: '#e2e8f0' } },
    { id: 'violet', name: 'Violet', colors: { bg: '#100d1a', surface: '#2d2840', accent: '#8b5cf6', text: '#e7e5e4' } },
    { id: 'crimson', name: 'Crimson', colors: { bg: '#1f1212', surface: '#422929', accent: '#ef4444', text: '#e7e5e4' } },
    { id: 'emerald', name: 'Emerald', colors: { bg: '#061512', surface: '#11382c', accent: '#10b981', text: '#e7e5e4' } },
    { id: 'amber', name: 'Amber', colors: { bg: '#1f1404', surface: '#43300f', accent: '#f59e0b', text: '#e7e5e4' } },
    { id: 'cyberpunk', name: 'Cyberpunk', colors: { bg: '#0d0221', surface: '#24174d', accent: '#f0f', text: '#0ff' } },
    { id: 'solaris', name: 'Solaris', colors: { bg: '#2B1704', surface: '#563514', accent: '#FF7B00', text: '#FFF0E1' } },
    { id: 'aurora', name: 'Aurora', colors: { bg: '#011526', surface: '#012E40', accent: '#3CA6A6', text: '#F2F2F2' } },
    { id: 'grove', name: 'Grove', colors: { bg: '#1A210D', surface: '#2A361A', accent: '#606C38', text: '#FEFAE0' } },
    { id: 'dune', name: 'Dune', colors: { bg: '#2a211c', surface: '#4d3d33', accent: '#d97706', text: '#f3e9e2' } },
    { id: 'rose', name: 'Rosé', colors: { bg: '#2c2125', surface: '#4f3e45', accent: '#e1a5a9', text: '#f5ebe0' } },
    { id: 'abyss', name: 'Abyss', colors: { bg: '#020c14', surface: '#042a3a', accent: '#2dd4bf', text: '#e0f2fe' } },
    { id: 'midnight', name: 'Midnight', colors: { bg: '#020408', surface: '#14161b', accent: '#5865F2', text: '#f1f1f1' } },
    { id: 'daybreak', name: 'Daybreak', colors: { bg: '#ffffff', surface: '#e3e5e8', accent: '#3b82f6', text: '#060607' } },
];

type FontSize = 'sm' | 'base' | 'lg';

const ColorInput: React.FC<{ label: string; value: string; onChange: (value: string) => void }> = ({ label, value, onChange }) => (
    <div className="flex items-center justify-between bg-surface-primary p-2 rounded-md">
        <label className="text-sm text-text-secondary">{label}</label>
        <input 
            type="color" 
            value={value} 
            onChange={(e) => onChange(e.target.value)}
            className="w-8 h-8 p-0 border-none rounded bg-transparent cursor-pointer"
            style={{'backgroundColor': 'transparent'}}
        />
    </div>
);


const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, settings, onSettingsChange, onSave, onClearData }) => {
  const [isCustomEditorOpen, setIsCustomEditorOpen] = useState(false);
  const originalSettingsRef = useRef<AppSettings | null>(null);

  useEffect(() => {
    // This effect runs ONLY when the modal opens or closes.
    if (isOpen) {
        // When it opens, store the initial settings.
        originalSettingsRef.current = settings;
    }
  }, [isOpen]);

  // This effect keeps the custom editor open/closed based on live preview changes.
  useEffect(() => {
    if(isOpen) {
        setIsCustomEditorOpen(settings.theme === 'custom');
    }
  }, [settings.theme, isOpen]);
  
  if (!isOpen) return null;

  const handleThemeSelect = (themeId: string) => {
    onSettingsChange({ ...settings, theme: themeId });
  };

  const handleCustomThemeChange = (colorKey: keyof CustomTheme, value: string) => {
      onSettingsChange({
          ...settings,
          theme: 'custom', // Ensure theme is set to custom when a color is changed
          customTheme: {
              ...(settings.customTheme!),
              [colorKey]: value,
          }
      });
  };

  const handleCheckboxChange = (key: 'reducedMotion' | 'disableSuggestions', checked: boolean) => {
      onSettingsChange({ ...settings, [key]: checked });
  };
  
  const handleFontSizeChange = (size: FontSize) => {
      onSettingsChange({ ...settings, fontSize: size });
  };

  const handleSave = () => {
    onSave();
    onClose();
  };
  
  const handleCancel = () => {
    // Revert to original settings for the preview
    if (originalSettingsRef.current) {
        onSettingsChange(originalSettingsRef.current);
    }
    onClose();
  };
  
  const handleClearDataConfirm = () => {
    if (window.confirm('Are you sure you want to delete ALL saved games and avatars? This action cannot be undone.')) {
        onClearData();
        onClose();
    }
  };

  const customThemePreviewColors = {
      bg: settings.customTheme?.bgPrimary || '#121212',
      surface: settings.customTheme?.surfacePrimary || '#282828',
      accent: settings.customTheme?.accentPrimary || '#BB86FC',
      text: settings.customTheme?.textPrimary || '#E0E0E0',
  }

  return (
    <div
      className="fixed inset-0 bg-background-primary/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
      onClick={handleCancel}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="bg-background-secondary border border-surface-primary rounded-lg w-full max-w-2xl m-4 text-text-primary animate-fade-in shadow-2xl shadow-black/50 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b border-surface-primary flex-shrink-0">
            <h2 className="text-xl font-bold">Settings</h2>
            <button onClick={handleCancel} className="p-1 rounded-full text-text-secondary hover:bg-surface-primary hover:text-text-primary">
                <XIcon className="w-6 h-6" />
            </button>
        </div>
        
        <div className="p-6 space-y-6 overflow-y-auto">
            <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-text-primary">
                    <PaletteIcon className="w-5 h-5" />
                    Color Theme
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[...themes, { id: 'custom', name: 'Custom', colors: customThemePreviewColors }].map(theme => (
                        <button
                            key={theme.id}
                            onClick={() => handleThemeSelect(theme.id)}
                            className={`p-1.5 rounded-lg border-2 transition-all ${settings.theme === theme.id ? 'border-white' : 'border-transparent hover:border-interactive-secondary'}`}
                        >
                            <div className="w-full rounded-md p-2" style={{ backgroundColor: theme.colors.bg }}>
                                <p className="text-xs font-semibold mb-1.5" style={{ color: theme.colors.text }}>{theme.name}</p>
                                <div className="flex h-5 w-full gap-1">
                                    <div className="w-1/3 rounded" style={{ backgroundColor: theme.colors.surface }}></div>
                                    <div className="w-1/3 rounded" style={{ backgroundColor: theme.colors.accent }}></div>
                                    <div className="w-1/3 rounded" style={{ backgroundColor: theme.colors.text }}></div>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {isCustomEditorOpen && (
                <div className="border-t border-surface-primary pt-6 animate-fade-in">
                    <h3 className="text-lg font-semibold mb-3">Custom Theme Editor</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <ColorInput label="Background Primary" value={settings.customTheme!.bgPrimary} onChange={v => handleCustomThemeChange('bgPrimary', v)} />
                        <ColorInput label="Background Secondary" value={settings.customTheme!.bgSecondary} onChange={v => handleCustomThemeChange('bgSecondary', v)} />
                        <ColorInput label="Surface" value={settings.customTheme!.surfacePrimary} onChange={v => handleCustomThemeChange('surfacePrimary', v)} />
                        <ColorInput label="Border" value={settings.customTheme!.borderPrimary} onChange={v => handleCustomThemeChange('borderPrimary', v)} />
                        <ColorInput label="Text Primary" value={settings.customTheme!.textPrimary} onChange={v => handleCustomThemeChange('textPrimary', v)} />
                        <ColorInput label="Text Secondary" value={settings.customTheme!.textSecondary} onChange={v => handleCustomThemeChange('textSecondary', v)} />
                        <ColorInput label="Accent Primary" value={settings.customTheme!.accentPrimary} onChange={v => handleCustomThemeChange('accentPrimary', v)} />
                        <ColorInput label="Accent Secondary" value={settings.customTheme!.accentSecondary} onChange={v => handleCustomThemeChange('accentSecondary', v)} />
                    </div>
                </div>
            )}
            
            <div className="border-t border-surface-primary pt-6">
                 <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-text-primary">
                    Accessibility
                </h3>
                <div className='space-y-4'>
                    <div>
                        <label className="block text-sm font-medium text-text-primary mb-2">Story Font Size</label>
                        <div className="flex gap-2">
                            {(['sm', 'base', 'lg'] as FontSize[]).map(size => (
                                <button key={size} onClick={() => handleFontSizeChange(size)} className={`w-full p-2 rounded-md border-2 ${settings.fontSize === size ? 'border-accent bg-accent/20' : 'border-border-primary bg-surface-secondary hover:border-interactive-secondary'}`}>
                                    {size.charAt(0).toUpperCase() + size.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label htmlFor="reduced-motion" className="flex items-center justify-between p-3 bg-surface-secondary rounded-lg cursor-pointer">
                            <div>
                                <span>Reduced Motion</span>
                                <p className="text-xs text-text-secondary">Disables non-essential animations.</p>
                            </div>
                            <input
                                id="reduced-motion"
                                type="checkbox"
                                checked={settings.reducedMotion}
                                onChange={(e) => handleCheckboxChange('reducedMotion', e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300 text-accent focus:ring-accent"
                            />
                        </label>
                    </div>
                </div>
            </div>

            <div className="border-t border-surface-primary pt-6">
                 <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-text-primary">
                    Gameplay
                </h3>
                <label htmlFor="disable-suggestions" className="flex items-center justify-between p-3 bg-surface-secondary rounded-lg cursor-pointer">
                    <div>
                        <span>Disable Suggestions</span>
                        <p className="text-xs text-text-secondary">Hides the "Try:" action suggestions.</p>
                    </div>
                    {/* FIX: Completed checkbox input with onChange handler */}
                    <input
                        id="disable-suggestions"
                        type="checkbox"
                        checked={settings.disableSuggestions}
                        onChange={(e) => handleCheckboxChange('disableSuggestions', e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-accent focus:ring-accent"
                    />
                </label>
            </div>
            <div className="border-t border-surface-primary pt-6">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-text-primary text-red-400">
                    <TrashIcon className="w-5 h-5" />
                    Danger Zone
                </h3>
                <button 
                    onClick={handleClearDataConfirm}
                    className="w-full text-left p-3 bg-red-900/50 rounded-lg cursor-pointer flex justify-between items-center group"
                >
                    <div>
                        <span>Clear All Saved Data</span>
                        <p className="text-xs text-red-400">Deletes all sessions and avatars permanently.</p>
                    </div>
                    <div className="p-2 bg-red-500/20 rounded-md text-red-300 group-hover:bg-red-500/40">
                        <TrashIcon className="w-5 h-5" />
                    </div>
                </button>
            </div>
        </div>
        <div className="flex justify-end items-center p-4 mt-auto border-t border-surface-primary bg-background-primary/50 flex-shrink-0">
            <div className="flex gap-3">
                <button onClick={handleCancel} className="bg-interactive-secondary text-white font-bold py-2 px-6 rounded-lg hover:bg-interactive-secondary/80 transition-colors">Cancel</button>
                <button onClick={handleSave} className="bg-accent text-white font-bold py-2 px-6 rounded-lg hover:bg-accent-hover transition-colors">Save & Close</button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;