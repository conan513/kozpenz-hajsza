/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type CardType = 'Attack' | 'Skill' | 'Power' | 'Hex';

export interface Card {
  id: string;
  name: string;
  type: CardType;
  cost: number;
  description: string;
  effect: (gameState: GameState, targetId?: string) => GameState;
  rarity: 'Common' | 'Uncommon' | 'Rare';
  needsTarget?: boolean;
}

export type EnemyIntentType = 'Attack' | 'Defend' | 'Buff' | 'Debuff' | 'Curse';

export interface EnemyIntent {
  type: EnemyIntentType;
  value?: number;
}

export interface Enemy {
  id: string;
  name: string;
  maxHp: number;
  hp: number;
  block: number;
  intent: EnemyIntent;
  statusEffects: StatusEffect[];
}

export type CharacterClass = 'Diáktüntető' | 'Oknyomozó' | 'Civil Aktivista' | 'Független Politikus' | 'Digitális Ellenálló';

export interface Relic {
  id: string;
  name: string;
  description: string;
  onCombatStart?: (state: GameState) => GameState;
  onCombatEnd?: (state: GameState) => GameState;
  onTurnStart?: (state: GameState) => GameState;
  onCardPlay?: (state: GameState, card: Card, targetId?: string) => GameState;
}

export interface Potion {
  id: string;
  name: string;
  description: string;
  rarity: 'Common' | 'Uncommon' | 'Rare';
  needsTarget?: boolean;
  effect: (gameState: GameState, targetId?: string) => GameState;
}

export interface Player {
  class: CharacterClass;
  maxHp: number;
  hp: number;
  block: number;
  energy: number;
  maxEnergy: number;
  drawPile: Card[];
  hand: Card[];
  discardPile: Card[];
  exhaustPile: Card[];
  deck: Card[];
  statusEffects: StatusEffect[];
  relics: Relic[];
  potions: Potion[];
  maxPotions: number;
}

export interface StatusEffect {
  type: 'Strength' | 'Weak' | 'Vulnerable' | 'Dexterity' | 'Frail' | 'Poison';
  stacks: number;
}

export type NodeType = 'Combat' | 'Elite' | 'Rest' | 'Shop' | 'Mystery' | 'Boss' | 'Start';

export interface MapNode {
  id: string;
  type: NodeType;
  connections: string[];
  x: number;
  y: number;
  floor?: number;
  visited: boolean;
  reachable: boolean;
}

export interface EventChoice {
  label: string;
  description: string;
  effect: (state: GameState) => GameState;
  condition?: (state: GameState) => boolean;
}

export interface GameEvent {
  id: string;
  title: string;
  description: string;
  choices: EventChoice[];
}

export interface RewardState {
  gold: number;
  relic: Relic | null;
  cards: Card[];
}

export interface ShopItem<T> {
  item: T;
  price: number;
}

export interface ShopInventory {
  cards: ShopItem<Card>[];
  relics: ShopItem<Relic>[];
  potions: ShopItem<Potion>[];
}

export interface GameState {
  player: Player | null;
  enemies: Enemy[];
  map: MapNode[];
  currentNodeId: string | null;
  view: 'Title' | 'CharacterSelect' | 'Map' | 'Combat' | 'Reward' | 'GameOver' | 'Win' | 'Event' | 'Rest' | 'Shop' | 'Start';
  turn: 'Player' | 'Enemy';
  turnCount: number;
  logs: string[];
  gold: number;
  currentEvent: GameEvent | null;
  activeEventChoices: EventChoice[];
  reward: RewardState | null;
  shopInventory: ShopInventory | null;
  cardsPlayedThisTurn: string[]; // List of card IDs played in the current turn
}
