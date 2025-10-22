

// FIX: Removed circular self-import of 'InventoryItem'.
// FIX: Populated file with necessary type definitions.
export interface InventoryItem {
  name: string;
  description: string;
  equippable?: boolean;
  slot?: 'head' | 'accessory' | 'weapon' | 'torso';
}

export interface StatusEffect {
  name: string;
  description: string;
  type: 'positive' | 'negative';
}

export type InjuryLocation = 'head' | 'torso' | 'leftArm' | 'rightArm' | 'leftLeg' | 'rightLeg';

export interface Injury {
    location: InjuryLocation;
    description: string;
    severity: 'minor' | 'moderate' | 'critical';
}

export interface PlayerStatus {
  health: number;
  resolve: number;
  currency: number;
  inventory: InventoryItem[];
  statusEffects: StatusEffect[];
  injuries: Injury[];
}

export interface Character {
  name: string;
  description: string;
  status: 'friendly' | 'neutral' | 'hostile' | 'unknown' | 'deceased';
  knownInformation: string[];
  imageUrl?: string;
  location?: string;
}

export interface Objective {
    text: string;
    completed: boolean;
}

export interface Quest {
  title: string;
  status: 'active' | 'completed';
  description:string;
  objectives: Objective[];
}

export interface WorldInfo {
    topic: string;
    details: string;
}

export interface StoryMessage {
  author: 'user' | 'gemini' | 'character';
  text: string;
  type?: 'thinking';
  characterName?: string;
  characterImageUrl?: string;
  gameTime?: string;
}

export type LocationType = 'settlement' | 'dungeon' | 'landmark' | 'natural' | 'interior' | 'poi';

export interface MapLocation {
  id: string;
  name: string;
  description: string;
  isCurrent: boolean;
  x: number;
  y: number;
  type?: LocationType;
}

export interface MapConnection {
  from: string;
  to: string;
}

export interface MapData {
  locations: MapLocation[];
  connections: MapConnection[];
}


export interface GameState {
  playerStatus: PlayerStatus;
  characters: Character[];
  quests: Quest[];
  worldInfo: WorldInfo[];
  gameTime: string;
  story: string;
  mapData?: MapData;
  dialogue?: { characterName: string; text: string; }[];
  allowCharacterCustomization?: {
    enabled: boolean;
    reason: string;
  };
  casinoAvailable?: boolean;
  locationImageUrl?: string;
}

export interface GameSession {
  id: string;
  title: string;
  lastPlayed: string;
  gameState: GameState;
  history: StoryMessage[];
  timePlayed?: number;
  worldImageUrl?: string;
  worldTitle?: string;
  locationImageUrl?: string;
}

export interface CustomCharacter {
  id: string;
  name: string;
  pronouns: string;
  age?: string;
  height?: string;
  appearance: {
    [key: string]: string;
    accessories?: string;
  };
  appearanceSummary: string;
  portraitUrl?: string;
  equippedItems?: {
    head?: InventoryItem;
    accessory?: InventoryItem;
    weapon?: InventoryItem;
    torso?: InventoryItem;
  };
}

export interface CustomTheme {
  bgPrimary: string;
  bgSecondary: string;
  surfacePrimary: string;
  borderPrimary: string;
  textPrimary: string;
  textSecondary: string;
  accentPrimary: string;
  accentSecondary: string;
}

export interface AppSettings {
    theme: string;
    reducedMotion: boolean;
    fontSize?: 'sm' | 'base' | 'lg';
    disableSuggestions?: boolean;
    customTheme?: CustomTheme;
}