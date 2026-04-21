
import { GameState, StatusEffect, Card } from '../types';

export const dealDamage = (state: GameState, baseDamage: number, hits: number = 1, targetId?: string): GameState => {
  if (!state.player || state.enemies.length === 0) return state;
  let newEnemies = [...state.enemies];
  const strength = state.player.statusEffects.find(s => s.type === 'Strength')?.stacks || 0;
  const isAoE = targetId === 'ALL';
  const targets = isAoE ? newEnemies : targetId ? newEnemies.filter(e => e.id === targetId) : [newEnemies[0]];
  
  targets.forEach(target => {
    const isVuln = !!target.statusEffects.find(s => s.type === 'Vulnerable');
    const isWeak = !!state.player!.statusEffects.find(s => s.type === 'Weak');
    let finalDamage = baseDamage + strength;
    if (isWeak) finalDamage = Math.floor(finalDamage * 0.75);
    if (isVuln) finalDamage = Math.floor(finalDamage * 1.5);
    finalDamage *= hits;
    const actualDmg = Math.max(0, finalDamage - target.block);
    const targetIndex = newEnemies.findIndex(e => e.id === target.id);
    if (targetIndex !== -1) {
        newEnemies[targetIndex] = { ...target, hp: Math.max(0, target.hp - actualDmg), block: Math.max(0, target.block - finalDamage) };
    }
  });
  return { ...state, enemies: newEnemies };
};

export const gainBlock = (state: GameState, baseBlock: number): GameState => {
  if (!state.player) return state;
  const dex = state.player.statusEffects.find(s => s.type === 'Dexterity')?.stacks || 0;
  return { ...state, player: { ...state.player, block: state.player.block + baseBlock + dex } };
};

export const applyStatus = (state: GameState, type: StatusEffect['type'], stacks: number, targetId?: string): GameState => {
  if (!state.player) return state;
  let newEnemies = [...state.enemies];
  if (targetId === 'PLAYER') {
    const existing = state.player.statusEffects.find(s => s.type === type);
    return { ...state, player: { ...state.player, statusEffects: existing ? state.player.statusEffects.map(s => s.type === type ? { ...s, stacks: s.stacks + stacks } : s) : [...state.player.statusEffects, { type, stacks }] } };
  }
  const targets = targetId === 'ALL' ? newEnemies : targetId ? newEnemies.filter(e => e.id === targetId) : [newEnemies[0]];
  targets.forEach(target => {
    const targetIdx = newEnemies.findIndex(e => e.id === target.id);
    if (targetIdx !== -1) {
      const existing = target.statusEffects.find(s => s.type === type);
      newEnemies[targetIdx] = { ...target, statusEffects: existing ? target.statusEffects.map(s => s.type === type ? { ...s, stacks: s.stacks + stacks } : s) : [...target.statusEffects, { type, stacks }] };
    }
  });
  return { ...state, enemies: newEnemies };
};

export const drawCards = (state: GameState, amount: number): GameState => {
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
  return { ...state, player: { ...state.player, drawPile: newDrawPile, discardPile: newDiscardPile, hand: newHand } };
};

export const discardRandomCards = (state: GameState, amount: number): GameState => {
  if (!state.player || state.player.hand.length === 0) return state;
  let newHand = [...state.player.hand];
  let newDiscardPile = [...state.player.discardPile];
  let discardedCount = 0;
  for (let i = 0; i < amount; i++) {
    if (newHand.length === 0) break;
    const idx = Math.floor(Math.random() * newHand.length);
    const card = newHand.splice(idx, 1)[0];
    newDiscardPile.push(card);
    discardedCount++;
  }
  return { 
    ...state, 
    player: { ...state.player, hand: newHand, discardPile: newDiscardPile },
    cardsDiscardedThisTurn: (state.cardsDiscardedThisTurn || 0) + discardedCount
  };
};

