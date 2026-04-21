import { Card, GameState, CharacterClass, StatusEffect } from '../types';
import { IC_CARDS } from './cards/ic_cards';
import { SL_CARDS } from './cards/sl_cards';
import { df_cards } from './cards/df_cards';
import { WT_CARDS } from './cards/wt_cards';
import { VW_CARDS } from './cards/vw_cards';
import { cl_cards } from './cards/cl_cards';


// Legacy Hex cards that are still needed for events
export const HEX_CARDS: Card[] = [
  {
    id: 'hx-debt', name: 'Államadósság', type: 'Hex', cost: -1, rarity: 'Common', characterClass: 'Colorless',
    description: 'Kijátszhatatlan. (Csak foglalja a helyet a kezedben)',
    effect: (s) => s
  },
  {
    id: 'hx-bureaucracy', name: 'Bürokrácia', type: 'Hex', cost: -1, rarity: 'Uncommon', characterClass: 'Colorless',
    description: 'Kijátszhatatlan. Ha eldobod, veszíts 3 HP-t.',
    effect: (s) => s
  }
];

export const UNIQUE_CARDS: Card[] = [
  ...IC_CARDS,
  ...SL_CARDS,
  ...df_cards,
  ...WT_CARDS,
  ...VW_CARDS,
  ...cl_cards,
  ...HEX_CARDS
];

export const getStartingDeck = (cls: CharacterClass): Card[] => {
  const strike: Card = {
    id: `${cls}-strike`, name: 'Beadvány', type: 'Attack', cost: 1, rarity: 'Common', needsTarget: true,
    description: 'Okozz 6 sebzést.', effect: (s, targetId) => {
        // Simple inline dealDamage to avoid circular imports just for starter deck
        if (!s.player || s.enemies.length === 0) return s;
        let newEnemies = [...s.enemies];
        const strength = s.player.statusEffects.find(st => st.type === 'Strength')?.stacks || 0;
        const targets = targetId ? newEnemies.filter(e => e.id === targetId) : [newEnemies[0]];
        targets.forEach(target => {
            const isVuln = !!target.statusEffects.find(st => st.type === 'Vulnerable');
            const isWeak = !!s.player!.statusEffects.find(st => st.type === 'Weak');
            let finalDamage = 6 + strength;
            if (isWeak) finalDamage = Math.floor(finalDamage * 0.75);
            if (isVuln) finalDamage = Math.floor(finalDamage * 1.5);
            const actualDmg = Math.max(0, finalDamage - target.block);
            const targetIndex = newEnemies.findIndex(e => e.id === target.id);
            if (targetIndex !== -1) {
                newEnemies[targetIndex] = { ...target, hp: Math.max(0, target.hp - actualDmg), block: Math.max(0, target.block - finalDamage) };
            }
        });
        return { ...s, enemies: newEnemies };
    }
  };
  const defend: Card = {
    id: `${cls}-defend`, name: 'Védekezés', type: 'Skill', cost: 1, rarity: 'Common',
    description: 'Nyerj 5 Cenzúrát.', effect: (s) => {
        if (!s.player) return s;
        const dex = s.player.statusEffects.find(st => st.type === 'Dexterity')?.stacks || 0;
        return { ...s, player: { ...s.player, block: s.player.block + 5 + dex } };
    }
  };
  
  // Fix kezdő lapok meghatározása karakterenként (mindig Common)
  const startingUniquesMap: Record<string, string[]> = {
    'Civil Aktivista': ['df-1', 'df-2'],
    'Diáktüntető': ['ic-26', 'ic-34'],
    'Oknyomozó': ['sl-26', 'sl-28'],
    'Független Politikus': ['wt-26', 'wt-27'],
    'Digitális Ellenálló': ['vw-26', 'vw-28']
  };

  const startingIds = startingUniquesMap[cls] || [];
  const firstUniqueCard = UNIQUE_CARDS.find(c => c.id === startingIds[0]);
  const secondUniqueCard = UNIQUE_CARDS.find(c => c.id === startingIds[1]);

  const firstUnique = firstUniqueCard ? { ...firstUniqueCard, id: `${firstUniqueCard.id}-base` } : { ...strike, id: `${cls}-strike-uniq` };
  const secondUnique = secondUniqueCard ? { ...secondUniqueCard, id: `${secondUniqueCard.id}-base` } : { ...defend, id: `${cls}-defend-uniq` };

  return [
    {...strike, id: `${cls}-strike-1`}, {...strike, id: `${cls}-strike-2`},
    {...strike, id: `${cls}-strike-3`}, {...strike, id: `${cls}-strike-4`},
    {...defend, id: `${cls}-defend-1`}, {...defend, id: `${cls}-defend-2`},
    {...defend, id: `${cls}-defend-3`}, {...defend, id: `${cls}-defend-4`},
    firstUnique,
    secondUnique,
  ];


};

export const RARITY_WEIGHTS = {
  Common: 60,
  Uncommon: 34,
  Rare: 6
};

export const pickRandomCardByRarity = (cards: Card[]): Card => {
  const r = Math.random() * 100;
  let targetRarity: 'Common' | 'Uncommon' | 'Rare' = 'Common';
  
  if (r < RARITY_WEIGHTS.Rare) targetRarity = 'Rare';
  else if (r < RARITY_WEIGHTS.Rare + RARITY_WEIGHTS.Uncommon) targetRarity = 'Uncommon';
  
  const pool = cards.filter(c => c.rarity === targetRarity);
  
  // Fallback if pool is empty
  if (pool.length === 0) {
     if (targetRarity === 'Rare') {
        const uncommonPool = cards.filter(c => c.rarity === 'Uncommon');
        if (uncommonPool.length > 0) return uncommonPool[Math.floor(Math.random() * uncommonPool.length)];
     }
     const commonPool = cards.filter(c => c.rarity === 'Common');
     if (commonPool.length > 0) return commonPool[Math.floor(Math.random() * commonPool.length)];
     
     // Last resort: any card
     if (cards.length === 0) throw new Error("No cards available to pick from!");
     return cards[Math.floor(Math.random() * cards.length)];
  }
  
  return pool[Math.floor(Math.random() * pool.length)];
};

export const getWeightedRewardCards = (cls: CharacterClass | 'Colorless', count: number = 3): Card[] => {
  const allAvailable = UNIQUE_CARDS.filter(c => c.characterClass === cls && c.type !== 'Hex');
  const selected: Card[] = [];
  
  for (let i = 0; i < count; i++) {
      const remainingCards = allAvailable.filter(c => !selected.find(s => s.id === c.id));
      if (remainingCards.length === 0) break;
      
      const picked = pickRandomCardByRarity(remainingCards);
      selected.push({ ...picked, id: `${picked.id}-${Math.random()}` });
  }
  
  return selected;
};

export const getRewardPool = (cls: CharacterClass): Card[] => {
  return UNIQUE_CARDS
    .filter(card => card.type !== 'Hex' && card.characterClass === cls);
};

export const getColorlessPool = (): Card[] => {
  return UNIQUE_CARDS
    .filter(card => card.type !== 'Hex' && card.characterClass === 'Colorless');
};
