import React from 'react';
import type { PlayerStatus as PlayerStatusType, Character, Quest, WorldInfo, InventoryItem, StatusEffect, GameState, Objective, Injury, CustomCharacter } from '../types';
import PlayerStatus from './PlayerStatus';
import CharacterPanel from './CharacterPanel';
import QuestLog from './QuestLog';
import WorldInfoPanel from './WorldInfoPanel';
import IconLegend from './IconLegend';
import InjuriesPanel from './InjuriesPanel';
import CraftingPanel from './CraftingPanel';
import AvatarPanel from './AvatarPanel';
import InteractiveMap from './InteractiveMap';
import { HealthIcon, ClipboardListIcon, BookOpenIcon, BandageIcon, AnvilIcon, UserCircleIcon, UsersIcon } from './icons';

type Tab = 'status' | 'injuries' | 'characters' | 'quests' | 'world' | 'crafting' | 'avatar';

interface SidePanelProps {
  gameState: GameState;
  onItemClick: (item: InventoryItem) => void;
  onCharacterClick: (character: Character) => void;
  onObjectiveClick: (objective: Objective) => void;
  onUseItemOnInjury: (item: InventoryItem, injury: Injury) => void;
  onCraftAttempt: (items: InventoryItem[]) => void;
  onEditAppearance: () => void;
  customCharacter: CustomCharacter | null;
  onUnequipItem: (item: InventoryItem) => void;
  isOpen: boolean;
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  onTabFocus: (tab: Tab) => void;
  hasNewCharacters: boolean;
  hasNewQuests: boolean;
  hasNewWorldInfo: boolean;
  onStatusEffectHover: (effect: StatusEffect | null, rect: DOMRect | null) => void;
  onGoldHover: (isHovering: boolean, rect: DOMRect | null) => void;
  onResolveHover: (isHovering: boolean, rect: DOMRect | null) => void;
  onHealthHover: (isHovering: boolean, rect: DOMRect | null) => void;
  onMapNodeHover: (tooltip: { visible: boolean; content: React.ReactNode; x: number; y: number; }) => void;
  newItems: string[];
  newEffects: string[];
  newCharacters: string[];
  newQuests: string[];
  highlightedItem: string | null;
}


const SidePanel: React.FC<SidePanelProps> = ({
  gameState,
  onItemClick,
  onCharacterClick,
  onObjectiveClick,
  onUseItemOnInjury,
  onCraftAttempt,
  onEditAppearance,
  customCharacter,
  onUnequipItem,
  isOpen,
  activeTab,
  onTabChange,
  onTabFocus,
  hasNewCharacters,
  hasNewQuests,
  hasNewWorldInfo,
  onStatusEffectHover,
  onGoldHover,
  onResolveHover,
  onHealthHover,
  onMapNodeHover,
  newItems,
  newEffects,
  newCharacters,
  newQuests,
  highlightedItem
}) => {

  const handleTabClick = (tabId: Tab) => {
    onTabChange(tabId);
    onTabFocus(tabId);
  };
  
  const { playerStatus, characters, quests, worldInfo } = gameState;

  const tabs: {id: Tab, label: string, icon: React.FC<React.SVGProps<SVGSVGElement>>, tourId?: string}[] = [
      { id: 'status', label: 'Status', icon: HealthIcon, tourId: 'status-tab' },
      { id: 'injuries', label: 'Injuries', icon: BandageIcon },
      { id: 'crafting', label: 'Craft', icon: AnvilIcon },
      { id: 'characters', label: 'People', icon: UsersIcon },
      { id: 'quests', label: 'Quests', icon: ClipboardListIcon, tourId: 'quests-tab' },
      { id: 'world', label: 'World', icon: BookOpenIcon },
      { id: 'avatar', label: 'Avatar', icon: UserCircleIcon },
  ];
  
  const notificationMap: Record<string, boolean> = {
    characters: hasNewCharacters,
    quests: hasNewQuests,
    world: hasNewWorldInfo,
    injuries: playerStatus.injuries.length > 0,
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'status': return <PlayerStatus status={playerStatus} onItemClick={onItemClick} onStatusEffectHover={onStatusEffectHover} onGoldHover={onGoldHover} onResolveHover={onResolveHover} onHealthHover={onHealthHover} newItems={newItems} newEffects={newEffects} highlightedItem={highlightedItem} />;
      case 'injuries': return <InjuriesPanel injuries={playerStatus.injuries} inventory={playerStatus.inventory} onUseItem={onUseItemOnInjury} />;
      case 'characters': return <CharacterPanel characters={characters} onCharacterClick={onCharacterClick} newCharacters={newCharacters} />;
      case 'quests': return <QuestLog quests={quests} newQuests={newQuests} onObjectiveClick={onObjectiveClick} />;
      case 'world': return <WorldInfoPanel worldInfo={worldInfo} />;
      case 'crafting': return <CraftingPanel inventory={playerStatus.inventory} onCraftAttempt={onCraftAttempt} />;
      case 'avatar': return <AvatarPanel 
                                character={customCharacter}
                                onEditAppearance={onEditAppearance}
                                onUnequip={onUnequipItem}
                                allowCustomization={gameState.allowCharacterCustomization?.enabled ?? false}
                                customizationReason={gameState.allowCharacterCustomization?.reason ?? ''}
                             />;
      default: return null;
    }
  };
  
  const mainContentClass = isOpen ? "block" : "hidden lg:hidden";
  const collapsedContentClass = isOpen ? "hidden" : "hidden lg:block";


  return (
    <aside className={`
      fixed inset-y-0 right-0 z-40 h-screen flex flex-col transform transition-transform duration-300 ease-in-out
      lg:relative lg:h-auto lg:z-auto lg:transform-none lg:transition-all
      ${isOpen ? 'translate-x-0 w-80 sm:w-96' : 'translate-x-full w-80 sm:w-96 lg:translate-x-0 lg:w-16'}
      bg-black/20 border-l border-white/10
    `}>
      {/* Collapsed View (Desktop only) */}
      <div className={`${collapsedContentClass}`}>
          <div className="flex flex-col items-center p-2 space-y-2 mt-2">
              {tabs.map(tab => (
                    <button
                    key={tab.id}
                    title={tab.label}
                    onClick={() => handleTabClick(tab.id)}
                    className={`relative p-3 rounded-lg transition-colors duration-200 ${
                        activeTab === tab.id ? 'bg-accent text-white' : 'text-text-secondary hover:bg-white/10 hover:text-white'
                    }`}
                    aria-label={tab.label}
                    data-tour-id={tab.tourId}
                  >
                    <tab.icon className="w-6 h-6" />
                    {notificationMap[tab.id] && (
                        <span className="absolute top-1 right-1 block h-2.5 w-2.5 rounded-full bg-accent-hover ring-2 ring-background-secondary" />
                    )}
                  </button>
              ))}
          </div>
      </div>
       
      {/* Expanded View */}
      <div className={`${mainContentClass} flex flex-col flex-1 overflow-hidden`}>
        <div className="p-2 border-b border-white/10">
            <div className="flex flex-wrap justify-start bg-black/20 rounded-lg p-1 gap-1">
            {tabs.map(tab => (
                <button
                    key={tab.id}
                    onClick={() => handleTabClick(tab.id)}
                    className={`relative px-2 py-2 text-xs font-medium rounded-md transition-colors duration-200 flex-auto text-center ${
                        activeTab === tab.id
                        ? 'bg-accent text-white'
                        : 'text-text-secondary hover:bg-white/10 hover:text-white'
                    }`}
                    data-tour-id={tab.tourId}
                    >
                    {tab.label}
                     {notificationMap[tab.id] && (
                        <span className="absolute top-1 right-1 block h-2.5 w-2.5 rounded-full bg-accent-hover ring-2 ring-background-secondary" />
                    )}
                </button>
            ))}
            </div>
        </div>
        <div className="flex-1 overflow-y-auto">
            <div className="animate-fade-in" key={activeTab}>
              {renderContent()}
            </div>
        </div>
        <div className="mt-auto flex flex-col">
            <InteractiveMap mapData={gameState.mapData} onNodeHover={onMapNodeHover} />
            <IconLegend />
        </div>
      </div>
    </aside>
  );
};

export default SidePanel;