import { Potion, GameState } from '../types';
import { drawCards } from './cardUtils';

export const POTIONS: Potion[] = [
  {
    id: 'potion-heal',
    name: 'Krumpli Osztás',
    description: 'Gyógyítja a Népszerűséged 20%-át.',
    rarity: 'Common',
    effect: (state: GameState) => {
      if (!state.player) return state;
      const healAmt = Math.floor(state.player.maxHp * 0.2);
      return {
        ...state,
        player: { ...state.player, hp: Math.min(state.player.maxHp, state.player.hp + healAmt) },
        logs: [`Elfogyasztottál egy Krumplit. Gyógyultál ${healAmt} Népszerűséget.`, ...state.logs]
      };
    }
  },
  {
    id: 'potion-energy',
    name: 'Kávé a Kantinból',
    description: 'Nyersz 2 Költségvetést (Lendületet).',
    rarity: 'Uncommon',
    effect: (state: GameState) => {
      if (!state.player) return state;
      return {
        ...state,
        player: { ...state.player, energy: state.player.energy + 2 },
        logs: [`Megittad a Kantinos Kávét. +2 Lendület kapott.`, ...state.logs]
      };
    }
  },
  {
    id: 'potion-strength',
    name: 'Győzelmi Pálinka',
    description: 'Nyersz 2 Befolyást (Erőt).',
    rarity: 'Uncommon',
    effect: (state: GameState) => {
      if (!state.player) return state;
      const existingStr = state.player.statusEffects.find(s => s.type === 'Strength');
      const effs = existingStr 
        ? state.player.statusEffects.map(s => s.type === 'Strength' ? { ...s, stacks: s.stacks + 2 } : s)
        : [...state.player.statusEffects, { type: 'Strength' as const, stacks: 2 }];
      return {
        ...state,
        player: { ...state.player, statusEffects: effs },
        logs: [`Legurítottál egy kupicával. +2 Befolyás.`, ...state.logs]
      };
    }
  },
  {
    id: 'potion-draw',
    name: 'Kiszivárgott Akta',
    description: 'Húzol 3 kártyát.',
    rarity: 'Common',
    effect: (state: GameState) => {
      if (!state.player) return state;
      const s2 = drawCards(state, 3);
      return {
        ...s2,
        logs: [`Kibontottad a Kiszivárgott Aktát. Húztál 3 lapot.`, ...state.logs]
      };
    }
  },
  {
    id: 'potion-block',
    name: 'Békemenet',
    description: 'Nyersz 12 Cenzúrát (Blokkot).',
    rarity: 'Common',
    effect: (state: GameState) => {
      if (!state.player) return state;
      return {
        ...state,
        player: { ...state.player, block: state.player.block + 12 },
        logs: [`Élre álltál a Békemenetben. +12 Cenzúra.`, ...state.logs]
      };
    }
  }
];
