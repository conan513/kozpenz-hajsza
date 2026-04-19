import { Card, GameState, CharacterClass, StatusEffect } from '../types';

// Helper to shuffle cards (used for draw effects)
const shuffle = <T>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

// Common helpers for card effects
const dealDamage = (state: GameState, baseDamage: number, hits: number = 1, targetId?: string): GameState => {
  if (!state.player || state.enemies.length === 0) return state;
  let newEnemies = [...state.enemies];
  
  const strength = state.player.statusEffects.find(s => s.type === 'Strength')?.stacks || 0;
  
  // If targetId is 'ALL', we do AoE to all valid targets
  const isAoE = targetId === 'ALL';
  const targets = isAoE 
    ? newEnemies 
    : targetId 
      ? newEnemies.filter(e => e.id === targetId)
      : [newEnemies[0]]; // Fallback to first enemy if single target and no targetId provided
  
  targets.forEach(target => {
    const isVuln = !!target.statusEffects.find(s => s.type === 'Vulnerable');
    const isWeak = !!state.player!.statusEffects.find(s => s.type === 'Weak');
    
    let finalDamage = baseDamage + strength;
    if (isWeak) finalDamage = Math.floor(finalDamage * 0.75);
    if (isVuln) finalDamage = Math.floor(finalDamage * 1.5);
    finalDamage *= hits;
    
    const actualDmg = Math.max(0, finalDamage - target.block);
    
    // Update the specific instance in the array
    const targetIndex = newEnemies.findIndex(e => e.id === target.id);
    if (targetIndex !== -1) {
        newEnemies[targetIndex] = {
            ...target,
            hp: Math.max(0, target.hp - actualDmg),
            block: Math.max(0, target.block - finalDamage)
        };
    }
  });

  return {
    ...state,
    enemies: newEnemies
  };
};

const gainBlock = (state: GameState, baseBlock: number): GameState => {
  if (!state.player) return state;
  const dex = state.player.statusEffects.find(s => s.type === 'Dexterity')?.stacks || 0;
  return {
    ...state,
    player: { ...state.player, block: state.player.block + baseBlock + dex }
  };
};

const drawCards = (state: GameState, amount: number): GameState => {
  if (!state.player) return state;
  let newDrawPile = [...state.player.drawPile];
  let newDiscardPile = [...state.player.discardPile];
  let newHand = [...state.player.hand];

  for (let i = 0; i < amount; i++) {
    if (newDrawPile.length === 0) {
      if (newDiscardPile.length === 0) break;
      newDrawPile = shuffle(newDiscardPile);
      newDiscardPile = [];
    }
    const card = newDrawPile.pop();
    if (card) newHand.push(card);
  }

  return {
    ...state,
    player: { ...state.player, drawPile: newDrawPile, discardPile: newDiscardPile, hand: newHand }
  };
};

const addCardsToPile = (state: GameState, cardIds: string[], pile: 'drawPile' | 'discardPile' | 'hand'): GameState => {
  if (!state.player) return state;
  const cardsToAdd = cardIds.map(id => {
    const template = UNIQUE_CARDS.find(c => c.id === id);
    return template ? { ...template, id: `${template.id}-${Math.random()}` } : null;
  }).filter(c => c !== null) as Card[];
  
  return {
    ...state,
    player: {
      ...state.player,
      [pile]: [...state.player[pile], ...cardsToAdd]
    }
  };
};

const hasSynergyWith = (baseId: string, state: GameState) => {
  return state.cardsPlayedThisTurn.some(cid => cid.startsWith(baseId));
};

const applyStatus = (state: GameState, type: StatusEffect['type'], stacks: number, targetId?: string): GameState => {
  if (!state.player) return state;
  let newEnemies = [...state.enemies];
  
  if (targetId === 'PLAYER') {
    const existing = state.player.statusEffects.find(s => s.type === type);
    return {
      ...state,
      player: {
        ...state.player,
        statusEffects: existing 
          ? state.player.statusEffects.map(s => s.type === type ? { ...s, stacks: s.stacks + stacks } : s)
          : [...state.player.statusEffects, { type, stacks }]
      }
    };
  }

  const targets = targetId === 'ALL' 
    ? newEnemies 
    : targetId 
      ? newEnemies.filter(e => e.id === targetId)
      : [newEnemies[0]];

  targets.forEach(target => {
    const targetIdx = newEnemies.findIndex(e => e.id === target.id);
    if (targetIdx !== -1) {
      const existing = target.statusEffects.find(s => s.type === type);
      newEnemies[targetIdx] = {
        ...target,
        statusEffects: existing
          ? target.statusEffects.map(s => s.type === type ? { ...s, stacks: s.stacks + stacks } : s)
          : [...target.statusEffects, { type, stacks }]
      };
    }
  });

  return { ...state, enemies: newEnemies };
};

// Detailed, unique cards
export const UNIQUE_CARDS: Card[] = [
  // SPECIAL / DOT / HEX
  {
    id: 'sp-corruption', name: 'Korrupciós Háló', type: 'Skill', cost: 1, rarity: 'Uncommon', needsTarget: true,
    description: 'Adj 6 Inflációt (DoT) az ellenfélnek.',
    effect: (s, targetId) => applyStatus(s, 'Poison', 6, targetId)
  },
  {
    id: 'sp-toxic', name: 'Mérgezett Szóvicc', type: 'Attack', cost: 0, rarity: 'Common', needsTarget: true,
    description: 'Okozz 3 sebzést. Adj 2 Inflációt (DoT).',
    effect: (s, targetId) => applyStatus(dealDamage(s, 3, 1, targetId), 'Poison', 2, targetId)
  },
  {
    id: 'hx-debt', name: 'Államadósság', type: 'Hex', cost: -1, rarity: 'Common',
    description: 'Kijátszhatatlan. (Csak foglalja a helyet a kezedben)',
    effect: (s) => s
  },
  {
    id: 'hx-bureaucracy', name: 'Bürokrácia', type: 'Hex', cost: -1, rarity: 'Uncommon',
    description: 'Kijátszhatatlan. Ha eldobod, veszíts 3 HP-t.',
    effect: (s) => s
  },
  {
    id: 'hx-request', name: 'Közérdekű Adatigénylés', type: 'Skill', cost: 1, rarity: 'Common',
    description: 'Nyerj 12 Cenzúrát. Adj 2 Bürokrácia (Átok) lapot a dobópaklidhoz.',
    effect: (s) => addCardsToPile(gainBlock(s, 12), ['hx-bureaucracy', 'hx-bureaucracy'], 'discardPile')
  },
  // IRONCLAD CARDS (Diáktüntető)
  {
    id: 'ic-cleave', name: 'Kordonbontás', type: 'Attack', cost: 1, rarity: 'Common',
    description: 'Okozz 8 sebzést MINDEN ellenfélnek. SZINERGIA: Ha dobtál már Skandálást, +4 sebzés.',
    effect: (s) => {
       const bonus = hasSynergyWith('ic-pommel', s) ? 4 : 0;
       return dealDamage(s, 8 + bonus, 1, 'ALL');
    }
  },
  {
    id: 'ic-ironwave', name: 'Alapjog', type: 'Attack', cost: 1, rarity: 'Common', needsTarget: true,
    description: 'Nyerj 5 Cenzúrát. Okozz 5 sebzést.',
    effect: (s, targetId) => dealDamage(gainBlock(s, 5), 5, 1, targetId)
  },
  {
    id: 'ic-pommel', name: 'Skandálás', type: 'Attack', cost: 1, rarity: 'Common', needsTarget: true,
    description: 'Okozz 9 sebzést. Húzz 1 kártyát.',
    effect: (s, targetId) => drawCards(dealDamage(s, 9, 1, targetId), 1)
  },
  {
    id: 'ic-inflame', name: 'Indulat', type: 'Power', cost: 1, rarity: 'Uncommon',
    description: 'Nyerj 2 Befolyást (Erőt).',
    effect: (s) => {
      if (!s.player) return s;
      const existing = s.player.statusEffects.find(st => st.type === 'Strength');
      const effs = existing 
        ? s.player.statusEffects.map(st => st.type === 'Strength' ? { ...st, stacks: st.stacks + 2 } : st)
        : [...s.player.statusEffects, { type: 'Strength' as const, stacks: 2 }];
      return { ...s, player: { ...s.player, statusEffects: effs } };
    }
  },
  {
    id: 'ic-reaper', name: 'Vagyonnyilatkozat', type: 'Attack', cost: 2, rarity: 'Rare',
    description: 'Okozz 4 sebzést MINDEN ellenfélnek. SZINERGIA: Ha volt Közbeszerzés, a sebzés 2x és gyógyulsz.',
    effect: (s) => {
      if(!s.player || s.enemies.length === 0) return s;
      const synergy = hasSynergyWith('df-skim', s);
      const baseDmg = synergy ? 8 : 4;
      const strength = (s.player.statusEffects.find(st => st.type === 'Strength')?.stacks || 0);
      let totalHeal = 0;
      
      s.enemies.forEach(enemy => {
         const dmg = baseDmg + strength;
         const unblocked = Math.max(0, dmg - enemy.block);
         totalHeal += unblocked;
      });

      const s2 = dealDamage(s, baseDmg, 1, 'ALL');
      return { ...s2, player: { ...s2.player!, hp: Math.min(s2.player!.maxHp, s2.player!.hp + totalHeal) } };
    }
  },

  // SILENT CARDS (Oknyomozó)
  {
    id: 'sl-backflip', name: 'Tényfeltárás', type: 'Skill', cost: 1, rarity: 'Common',
    description: 'Nyerj 5 Cenzúrát. Húzz 2 kártyát.',
    effect: (s) => drawCards(gainBlock(s, 5), 2)
  },
  {
    id: 'sl-dagger-spray', name: 'Kiszivárogtatás', type: 'Attack', cost: 1, rarity: 'Uncommon',
    description: 'Okozz 2x 4 sebzést MINDEN ellenfélnek. Adj 1 Sebezhetőséget. SZINERGIA: Tényfeltárás után +1 ütés.',
    effect: (s) => {
       const hits = hasSynergyWith('sl-backflip', s) ? 3 : 2;
       const s2 = dealDamage(s, 4, hits, 'ALL');
       return {
         ...s2,
         enemies: s2.enemies.map(e => ({
           ...e,
           statusEffects: e.statusEffects.some(st => st.type === 'Vulnerable')
             ? e.statusEffects.map(st => st.type === 'Vulnerable' ? { ...st, stacks: st.stacks + 1 } : st)
             : [...e.statusEffects, { type: 'Vulnerable', stacks: 1 }]
         }))
       };
    }
  },
  {
    id: 'sl-deadly-poison', name: 'Anonim Forrás', type: 'Skill', cost: 1, rarity: 'Common', needsTarget: true,
    description: 'Adj 3 Gyengeséget az ellenfélnek.',
    effect: (s, targetId) => {
      if(s.enemies.length === 0 || !targetId) return s;
      return {
         ...s,
         enemies: s.enemies.map(e => e.id === targetId ? { ...e, statusEffects: [...e.statusEffects, { type: 'Weak' as const, stacks: 3 }] } : e)
      };
    }
  },
  {
    id: 'sl-legsweep', name: 'Oknyomozó Interjú', type: 'Skill', cost: 2, rarity: 'Uncommon', needsTarget: true,
    description: 'Adj 2 Gyengeséget. Nyerj 11 Cenzúrát. SZINERGIA: Anonim Forrás után +5 Cenzúra.',
    effect: (s, targetId) => {
      if(s.enemies.length === 0 || !targetId) return s;
      const bonus = hasSynergyWith('sl-deadly-poison', s) ? 5 : 0;
      const s2 = gainBlock(s, 11 + bonus);
      return {
         ...s2,
         enemies: s2.enemies.map(e => e.id === targetId ? { ...e, statusEffects: [...e.statusEffects, { type: 'Weak' as const, stacks: 2 }] } : e)
      };
    }
  },
  {
    id: 'sl-adrenaline', name: 'Szuper-Infó', type: 'Skill', cost: 0, rarity: 'Rare',
    description: 'Nyerj 1 Lendületet. Húzz 2 kártyát. SZINERGIA: Ha volt már Tényfeltárás, +1 kártya.',
    effect: (s) => {
      if(!s.player) return s;
      const count = hasSynergyWith('sl-backflip', s) ? 3 : 2;
      const s2 = drawCards(s, count);
      return { ...s2, player: { ...s2.player!, energy: s2.player!.energy + 1 }};
    }
  },

  // DEFECT CARDS (Civil Aktivista)
  {
    id: 'df-charge', name: 'Plakát-ragasztás', type: 'Skill', cost: 1, rarity: 'Common',
    description: 'Nyerj 7 Cenzúrát. Nyerj 1 Ügyességet.',
    effect: (s) => {
      const s2 = gainBlock(s, 7);
      if (!s2.player) return s2;
      return {
        ...s2,
        player: {
          ...s2.player,
          statusEffects: s2.player.statusEffects.some(st => st.type === 'Dexterity')
            ? s2.player.statusEffects.map(st => st.type === 'Dexterity' ? { ...st, stacks: st.stacks + 1 } : st)
            : [...s2.player.statusEffects, { type: 'Dexterity' as const, stacks: 1 }]
        }
      }
    }
  },
  {
    id: 'df-claw', name: 'Ellen-Narratíva', type: 'Attack', cost: 0, rarity: 'Common', needsTarget: true,
    description: 'Okozz 3 sebzést. SZINERGIA: Plakát-ragasztás után 2x sebzés.',
    effect: (s, targetId) => {
       const dmg = hasSynergyWith('df-charge', s) ? 6 : 3;
       return dealDamage(s, dmg, 1, targetId);
    }
  },
  {
    id: 'df-turbo', name: 'Tüntetés', type: 'Skill', cost: 0, rarity: 'Common',
    description: 'Nyerj 2 Lendületet.',
    effect: (s) => {
        if(!s.player) return s;
        return { ...s, player: { ...s.player, energy: s.player.energy + 2 }};
    }
  },
  {
    id: 'df-skim', name: 'Ételosztás', type: 'Skill', cost: 1, rarity: 'Uncommon',
    description: 'Húzz 3 kártyát.',
    effect: (s) => drawCards(s, 3)
  },

  // WATCHER CARDS (Független Politikus)
  {
    id: 'wt-empty-fist', name: 'Felszólalás', type: 'Attack', cost: 1, rarity: 'Common', needsTarget: true,
    description: 'Okozz 9 sebzést.',
    effect: (s, targetId) => dealDamage(s, 9, 1, targetId)
  },
  {
    id: 'wt-halt', name: 'Módosító javaslat', type: 'Skill', cost: 0, rarity: 'Common',
    description: 'Nyerj 3 Cenzúrát. SZINERGIA: Ha volt Alapjog, +4 Cenzúra.',
    effect: (s) => {
       const bonus = hasSynergyWith('ic-ironwave', s) ? 4 : 0;
       return gainBlock(s, 3 + bonus);
    }
  },
  {
    id: 'wt-deceive', name: 'Interpelláció', type: 'Skill', cost: 1, rarity: 'Uncommon',
    description: 'Nyerj 4 Cenzúrát. Húzz 1 kártyát. SZINERGIA: Felszólalás után +1 kártya.',
    effect: (s) => {
       const count = hasSynergyWith('wt-empty-fist', s) ? 2 : 1;
       return drawCards(gainBlock(s, 4), count);
    }
  },

  // VOIDWALKER CARDS (Digitális Ellenálló)
  {
    id: 'vw-shadow', name: 'VPN Használat', type: 'Skill', cost: 1, rarity: 'Common',
    description: 'Nyerj 6 Cenzúrát. Húzz 1 kártyát.',
    effect: (s) => drawCards(gainBlock(s, 6), 1)
  },
  {
    id: 'vw-tear', name: 'Adatbázis feltörés', type: 'Attack', cost: 2, rarity: 'Uncommon', needsTarget: true,
    description: 'Okozz 15 sebzést. SZINERGIA: Tüntetés után a költség visszatér.',
    effect: (s, targetId) => {
       const s2 = dealDamage(s, 15, 1, targetId);
       if (hasSynergyWith('df-turbo', s) && s2.player) {
          return { ...s2, player: { ...s2.player, energy: s2.player.energy + 2 }};
       }
       return s2;
    }
  }
];

export const getStartingDeck = (cls: CharacterClass): Card[] => {
  const strike: Card = {
    id: `${cls}-strike`, name: 'Beadvány', type: 'Attack', cost: 1, rarity: 'Common', needsTarget: true,
    description: 'Okozz 6 sebzést.', effect: (s, targetId) => dealDamage(s, 6, 1, targetId)
  };
  const defend: Card = {
    id: `${cls}-defend`, name: 'Védekezés', type: 'Skill', cost: 1, rarity: 'Common',
    description: 'Nyerj 5 Cenzúrát.', effect: (s) => gainBlock(s, 5)
  };
  
  const clsPfx = cls === 'Diáktüntető' ? 'ic' : cls === 'Oknyomozó' ? 'sl' : cls === 'Civil Aktivista' ? 'df' : cls === 'Független Politikus' ? 'wt' : 'vw';

  const classUniques = UNIQUE_CARDS.filter(c => c.id.startsWith(clsPfx));
  const firstUnique = classUniques.length > 0 ? { ...classUniques[0], id: `${classUniques[0].id}-base` } : { ...strike, id: `${cls}-strike-uniq` };
  const secondUnique = classUniques.length > 1 ? { ...classUniques[1], id: `${classUniques[1].id}-base` } : { ...defend, id: `${cls}-defend-uniq` };

  return [
    {...strike, id: `${cls}-strike-1`}, {...strike, id: `${cls}-strike-2`},
    {...strike, id: `${cls}-strike-3`}, {...strike, id: `${cls}-strike-4`},
    {...defend, id: `${cls}-defend-1`}, {...defend, id: `${cls}-defend-2`},
    {...defend, id: `${cls}-defend-3`}, {...defend, id: `${cls}-defend-4`},
    firstUnique,
    secondUnique,
  ];
};

export const getRewardPool = (cls: CharacterClass): Card[] => {
  // Give all generic/unique cards as rewards
  return UNIQUE_CARDS.map(card => ({ ...card, id: `${card.id}-${Math.random()}` }));
};
