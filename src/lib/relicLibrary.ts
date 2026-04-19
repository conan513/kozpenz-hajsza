import { Relic, GameState } from '../types';

const heal = (state: GameState, amount: number): GameState => {
  if (!state.player) return state;
  return {
    ...state,
    player: { ...state.player, hp: Math.min(state.player.maxHp, state.player.hp + amount) },
    logs: [`Healed for ${amount} HP.`, ...state.logs]
  };
};

const gainEnergy = (state: GameState, amount: number): GameState => {
  if (!state.player) return state;
  return {
    ...state,
    player: { ...state.player, energy: Math.min(9, state.player.energy + amount) },
    logs: [`Gained ${amount} Energy.`, ...state.logs]
  };
};

const addStrength = (state: GameState, amount: number): GameState => {
  if (!state.player) return state;
  const existing = state.player.statusEffects.find(st => st.type === 'Strength');
  const effs = existing 
    ? state.player.statusEffects.map(st => st.type === 'Strength' ? { ...st, stacks: st.stacks + amount } : st)
    : [...state.player.statusEffects, { type: 'Strength' as const, stacks: amount }];
  return { ...state, player: { ...state.player, statusEffects: effs } };
};

const drawCards = (state: GameState, amount: number): GameState => {
  if (!state.player) return state;
  let newDrawPile = [...state.player.drawPile];
  let newDiscardPile = [...state.player.discardPile];
  let newHand = [...state.player.hand];

  for (let i = 0; i < amount; i++) {
    if (newDrawPile.length === 0) {
      if (newDiscardPile.length === 0) break;
      newDrawPile = [...newDiscardPile].sort(() => Math.random() - 0.5);
      newDiscardPile = [];
    }
    const card = newDrawPile.pop();
    if (card) newHand.push(card);
  }

  return {
    ...state,
    player: { ...state.player, drawPile: newDrawPile, discardPile: newDiscardPile, hand: newHand },
    logs: [`Drew ${amount} cards.`, ...state.logs]
  };
};

export const RELICS: Relic[] = [
  {
    id: 'void-eye',
    name: 'Mélyállami Tekintet',
    description: 'Harc elején zavard össze az ellenfeleket (Gyengítés).',
    onCombatStart: (state: GameState) => {
        if (state.enemies.length === 0) return state;
        return {
            ...state,
            enemies: state.enemies.map(e => ({
                ...e,
                statusEffects: [...e.statusEffects, { type: 'Weak' as const, stacks: 1 }]
            })),
            logs: ['A Mélyállami Tekintet meggyengítette az ellenfeleket.', ...state.logs]
        };
    }
  },
  { 
    id: 'burning-blood', 
    name: 'Nemzeti Konzultáció', 
    description: 'A harc végén gyógyulj 6 Népszerűséget (HP).',
    onCombatEnd: (state) => heal(state, 6)
  },
  { 
    id: 'ring-of-snake', 
    name: 'Megafonos Algoritmus', 
    description: 'Harc elején húzz 2 plusz kártyát.',
    onCombatStart: (state) => drawCards(state, 2)
  },
  { 
    id: 'cracked-core', 
    name: 'Guruló Dollárok', 
    description: 'Harc elején nyerj 2 Blokkot (Cenzúrát).',
    onCombatStart: (state) => {
       if (!state.player) return state;
       return { ...state, player: { ...state.player, block: state.player.block + 2 } };
    }
  },
  { 
    id: 'pure-water', 
    name: 'Közpénz Injekció', 
    description: 'Harc elején nyerj 1 Lendületet.',
    onCombatStart: (state) => gainEnergy(state, 1)
  },
  { 
    id: 'vajra', 
    name: 'EU-s Vétó', 
    description: 'Minden harc elején nyerj 1 Befolyást (Erőt).',
    onCombatStart: (state) => addStrength(state, 1)
  },
  { 
    id: 'anchor', 
    name: 'Sorompó a Karmelitánál', 
    description: 'Indíts minden harcot 10 Blokkal (Cenzúrával).',
    onCombatStart: (state) => {
        if (!state.player) return state;
        return { ...state, player: { ...state.player, block: state.player.block + 10 } };
    }
  },
  { 
    id: 'lantern', 
    name: 'Lézerblokkoló', 
    description: 'Az első körben nyerj 1 plusz Lendületet.',
    onTurnStart: (state) => {
        if (state.turnCount === 1) return gainEnergy(state, 1);
        return state;
    }
  },
  { 
    id: 'meat-on-the-bone', 
    name: 'Krumpliosztás', 
    description: 'Ha a Népszerűséged (HP) 50% alatt van a harc végén, gyógyulsz 12-t.',
    onCombatEnd: (state) => {
        if (state.player && state.player.hp <= (state.player.maxHp / 2)) {
            return heal(state, 12);
        }
        return state;
    }
  },
  { 
    id: 'happy-flower', 
    name: 'Rezsiutalvány', 
    description: 'Minden 3. köröd elején nyerj 1 Lendületet.',
    onTurnStart: (state) => {
        if (state.turnCount % 3 === 0) return gainEnergy(state, 1);
        return state;
    }
  },
  { 
    id: 'bag-of-preparation', 
    name: 'Pegasus Jelentés', 
    description: 'Harc elején húzz 2 plusz kártyát.',
    onCombatStart: (state) => drawCards(state, 2)
  },
  { 
    id: 'blood-vial', 
    name: 'Mészáros Ásványvíz', 
    description: 'Minden harc elején gyógyulsz 2 Népszerűséget.',
    onCombatStart: (state) => heal(state, 2)
  },
  {
    id: 'shuriken',
    name: 'Karaktergyilkosság',
    description: 'Nyerj 1 Befolyást minden kijátszott Támadás után.',
    onCardPlay: (state, card) => {
       if (card.type === 'Attack') return addStrength(state, 1);
       return state;
    }
  },
  {
    id: 'letter-opener',
    name: 'Kormányinfó',
    description: 'Amikor Készség kártyát játszol ki, sebzel 3-at minden ellenfélnek.',
    onCardPlay: (state, card) => {
      if (card.type === 'Skill' && state.enemies.length > 0) {
         return {
            ...state,
            enemies: state.enemies.map(e => ({ ...e, hp: Math.max(0, e.hp - 3) })),
            logs: [`A Kormányinfó 3 sebzést okozott midenkinek.`, ...state.logs]
         };
      }
      return state;
    }
  }
];
