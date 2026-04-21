import { GameState, Card, Enemy, EnemyIntentType, MapNode, Player, Relic, ShopInventory, Potion } from './types';
import { ENEMIES } from './constants';
import { getRewardPool, getColorlessPool, UNIQUE_CARDS, getWeightedRewardCards } from './lib/cardLibrary';
import { RELICS } from './lib/relicLibrary';
import { POTIONS } from './lib/potionLibrary';

export const triggerRelics = (state: GameState, hook: keyof Relic, payload?: any): GameState => {
  if (!state.player) return state;
  let currentState = state;
  state.player.relics.forEach(relic => {
    if (hook === 'onCombatStart' && relic.onCombatStart) currentState = relic.onCombatStart(currentState);
    if (hook === 'onCombatEnd' && relic.onCombatEnd) currentState = relic.onCombatEnd(currentState);
    if (hook === 'onTurnStart' && relic.onTurnStart) currentState = relic.onTurnStart(currentState);
    if (hook === 'onCardPlay' && relic.onCardPlay && payload) currentState = relic.onCardPlay(currentState, payload as Card);
  });
  return currentState;
};

export const shuffle = <T>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export const handleDiscardDamage = (playerHp: number, discardedCards: Card[], currentLogs: string[]): { nextHp: number, nextLogs: string[] } => {
  let nextHp = playerHp;
  let nextLogs = [...currentLogs];
  
  discardedCards.forEach(card => {
    if (card.id.startsWith('hx-bureaucracy')) {
      nextHp = Math.max(1, nextHp - 3);
      nextLogs = [`A Bürokrácia miatt vesztettél 3 HP-t az eldobáskor.`, ...nextLogs];
    }
  });
  
  return { nextHp, nextLogs };
};

export const generateShopInventory = (player: Player): ShopInventory => {
  const characterCards = getWeightedRewardCards(player.class, 8);
  const colorlessCard = getWeightedRewardCards('Colorless', 1)[0];
  
  const combinedRarePool = [...getRewardPool(player.class).filter(c => c.rarity === 'Rare'), ...getColorlessPool().filter(c => c.rarity === 'Rare')];
  const rareCardBase = combinedRarePool.length > 0 ? shuffle(combinedRarePool)[0] : getWeightedRewardCards(player.class, 1)[0];
  const rareCard = { ...rareCardBase, id: `${rareCardBase.id}-${Math.random()}` };
  
  const allCards = [...characterCards, colorlessCard, rareCard];

  // Pick 3 random relics not already owned
  const availableRelics = RELICS.filter(r => !player.relics.find(pr => pr.id === r.id));
  const shopRelics = shuffle(availableRelics).slice(0, 3);

  // Pick 3 random potions
  const shopPotions = shuffle(POTIONS).slice(0, 3);

  return {
    cards: allCards.map(c => ({ item: c, price: c.rarity === 'Common' ? 50 : c.rarity === 'Uncommon' ? 75 : 150 })),
    relics: shopRelics.map(r => ({ item: r, price: 150 + Math.floor(Math.random() * 150) })),
    potions: shopPotions.map(p => ({ item: p, price: 50 }))
  };
};

export const createInitialState = (): GameState => ({
  player: null,
  enemies: [],
  map: generateMap(),
  currentNodeId: null,
  view: 'Title',
  turn: 'Player',
  turnCount: 0,
  logs: ['Welcome to Spire Climber!'],
  gold: 0,
  currentEvent: null,
  activeEventChoices: [],
  reward: null,
  shopInventory: null,
  cardsPlayedThisTurn: [],
  cardsDiscardedThisTurn: 0,
  pendingHex: null,
});

export const generateMap = (): MapNode[] => {
  const floors = 15;
  const map: MapNode[] = [];
  const nodesPerFloor: MapNode[][] = [];

  for (let l = 0; l < floors; l++) {
    nodesPerFloor[l] = [];
    if (l === 0) {
      nodesPerFloor[l].push({ id: 'node-0-0', type: 'Start', floor: 0, x: 50, y: 5, connections: [], visited: false, reachable: true });
    } else if (l === floors - 1) {
      nodesPerFloor[l].push({ id: `node-${l}-0`, type: 'Boss', floor: l, x: 50, y: 95, connections: [], visited: false, reachable: false });
    } else {
      // 3 or 4 nodes per floor
      const count = Math.floor(Math.random() * 2) + 3; 
      for (let i = 0; i < count; i++) {
          let type: any = 'Combat';
          const r = Math.random();
          if (l === 1) { type = 'Combat'; } 
          else if (l === Math.floor(floors / 2)) { type = 'Shop'; } // Guaranteed shop halfway
          else {
               if (r < 0.2) type = 'Mystery';
               else if (r < 0.3) type = 'Rest';
               else if (r < 0.4) type = 'Shop';
               else if (r < 0.6) type = 'Elite';
               else type = 'Combat';
          }

          // Distribute x evenly, add slight random jitter
          const xPos = (100 / (count + 1)) * (i + 1) + (Math.random() * 10 - 5);
          const yPos = 5 + (l * (90 / (floors - 1))); // From y=5 to y=95

          nodesPerFloor[l].push({
              id: `node-${l}-${i}`, type, floor: l, x: Math.max(10, Math.min(90, xPos)), y: yPos, connections: [], visited: false, reachable: false
          });
      }
    }
    map.push(...nodesPerFloor[l]);
  }

  // Connect nodes
  for (let l = 0; l < floors - 1; l++) {
    const currentLayer = nodesPerFloor[l];
    const nextLayer = nodesPerFloor[l + 1];
    
    if (l === 0) {
        currentLayer[0].connections = nextLayer.map(n => n.id);
    } else if (l === floors - 2) {
        currentLayer.forEach(n => n.connections.push(nextLayer[0].id));
    } else {
        currentLayer.forEach((n, i) => {
            const targetIdx = Math.min(nextLayer.length - 1, Math.floor((i / currentLayer.length) * nextLayer.length));
            n.connections.push(nextLayer[targetIdx].id);

            // 40% chance to also connect to the right adjacent node
            if (Math.random() > 0.6 && targetIdx + 1 < nextLayer.length) {
                n.connections.push(nextLayer[targetIdx + 1].id);
            }
        });
        
        // Ensure every next layer node has an inbound connection
        nextLayer.forEach((nextLNode, j) => {
            const hasIncoming = currentLayer.some(c => c.connections.includes(nextLNode.id));
            if (!hasIncoming) {
                const sourceIdx = Math.min(currentLayer.length - 1, Math.floor((j / nextLayer.length) * currentLayer.length));
                if (!currentLayer[sourceIdx].connections.includes(nextLNode.id)) {
                    currentLayer[sourceIdx].connections.push(nextLNode.id);
                }
            }
        });
    }
  }

  // Sync connections back to flat map
  nodesPerFloor.flat().forEach(node => {
      const target = map.find(m => m.id === node.id);
      if (target) target.connections = node.connections;
  });

  return map;
};

export const startCombat = (state: GameState, enemyTemplate: typeof ENEMIES[0], node?: MapNode): GameState => {
  if (!state.player) return state;
  const shuffledDeck = shuffle(state.player.deck);
  const player: Player = {
    ...state.player,
    block: 0,
    energy: state.player.maxEnergy || 3,
    drawPile: shuffledDeck.slice(5),
    hand: shuffledDeck.slice(0, 5),
    discardPile: [],
    exhaustPile: [],
    statusEffects: [],
  };

  const isEliteOrBoss = node ? (node.type === 'Elite' || node.type === 'Boss') : false;
  const enemyCount = isEliteOrBoss ? 1 : Math.floor(Math.random() * 2) + 1;
  const enemies: Enemy[] = [];
  
  for (let i = 0; i < enemyCount; i++) {
    const template = enemyTemplate || ENEMIES[0];
    enemies.push({
      ...template,
      id: `enemy-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 4)}`,
      hp: template.maxHp,
      block: 0,
      intent: generateEnemyIntent(isEliteOrBoss),
      statusEffects: [],
      name: enemyCount > 1 ? `${template.name} ${String.fromCharCode(65 + i)}` : template.name
    });
  }

  const initialState: GameState = {
    ...state,
    view: 'Combat' as const,
    turnCount: 1,
    player,
    enemies,
    turn: 'Player' as const,
    logs: [`Encountered ${enemies.length} enemies!`, ...state.logs],
    cardsPlayedThisTurn: [],
  };

  return triggerRelics(initialState, 'onCombatStart');
};

export const generateEnemyIntent = (isEliteOrBoss: boolean = false): { type: EnemyIntentType; value: number } => {
  const types: EnemyIntentType[] = ['Attack', 'Defend', 'Buff', 'Debuff'];
  if (isEliteOrBoss) types.push('Curse', 'Curse'); // Növelt esély az átkokra
  const type = types[Math.floor(Math.random() * types.length)];
  let value = 5;
  if (type === 'Attack') value = 6 + Math.floor(Math.random() * 6);
  if (type === 'Debuff') value = 2 + Math.floor(Math.random() * 2);
  return { type, value };
};

export const resolveEnemyTurn = (state: GameState): GameState => {
  if (state.enemies.length === 0 || !state.player) return state;
  
  let tempState = { ...state };
  
  // 1. Trigger Allies (End of Player Turn)
  state.player.allies.forEach(ally => {
     tempState = ally.onTurnEnd(tempState);
  });
  
  // Refresh variables after allies
  if (!tempState.player) return tempState;
  let playerHp = tempState.player.hp;
  let playerBlock = tempState.player.block;
  let currentPlayerStatus = [...tempState.player.statusEffects];
  let playerDiscardPile = [...tempState.player.discardPile];
  let logs = [...tempState.logs];
  let newEnemies = [...tempState.enemies];
  
  newEnemies = newEnemies.filter(e => e.hp > 0);

  // 2. Enemy actions
  for (let i = 0; i < newEnemies.length; i++) {
    const enemy = newEnemies[i];
    if (enemy.hp <= 0) continue; 
    
    let enemyBlock = enemy.block;
    
    // Resolve Poison (Botrány) at START of enemy turn
    const poisonEffect = enemy.statusEffects.find(s => s.type === 'Poison');
    let currentEnemyHp = enemy.hp;
    if (poisonEffect) {
       const poisonDamage = poisonEffect.stacks;
       logs = [`${enemy.name} belebukik a Botrányba: ${poisonDamage} sebzés`, ...logs];
       currentEnemyHp = Math.max(0, enemy.hp - poisonDamage);
       newEnemies[i] = { ...enemy, hp: currentEnemyHp };
    }

    if (currentEnemyHp <= 0) continue; 
    
    if (enemy.intent.type === 'Attack') {
      let damage = enemy.intent.value || 0;
      const isWeak = !!enemy.statusEffects.find(s => s.type === 'Weak');
      if (isWeak) damage = Math.floor(damage * 0.75);
      
      const isVuln = !!currentPlayerStatus.find(s => s.type === 'Vulnerable');
      if (isVuln) damage = Math.floor(damage * 1.5);

      const finalDamage = Math.max(0, damage - playerBlock);
      playerBlock = Math.max(0, playerBlock - damage);
      playerHp = Math.max(0, playerHp - finalDamage);
      logs = [`${enemy.name} támad: ${damage} sebzés!`, ...logs];
    } else if (enemy.intent.type === 'Defend') {
      enemyBlock += enemy.intent.value || 0;
      logs = [`${enemy.name} kapott ${enemy.intent.value} Cenzúrát.`, ...logs];
    } else if (enemy.intent.type === 'Buff') {
      logs = [`${enemy.name} erőt gyűjt. (+2 Befolyás)`, ...logs];
      const existing = enemy.statusEffects.find(s => s.type === 'Strength');
      const newStatus = existing 
        ? enemy.statusEffects.map(s => s.type === 'Strength' ? { ...s, stacks: s.stacks + 2 } : s)
        : [...enemy.statusEffects, { type: 'Strength' as const, stacks: 2 }];
      newEnemies[i] = { ...newEnemies[i], statusEffects: newStatus };
    } else if (enemy.intent.type === 'Debuff') {
      const debuffType = Math.random() > 0.5 ? 'Weak' : 'Vulnerable';
      const debuffName = debuffType === 'Weak' ? 'Gyengeséget' : 'Sebezhetőséget';
      logs = [`${enemy.name} megvádol valamivel! (+${enemy.intent.value} kör ${debuffName})`, ...logs];
      
      const existing = currentPlayerStatus.find(s => s.type === debuffType);
      currentPlayerStatus = existing
        ? currentPlayerStatus.map(s => s.type === debuffType ? { ...s, stacks: s.stacks + (enemy.intent.value || 0) } : s)
        : [...currentPlayerStatus, { type: debuffType as any, stacks: (enemy.intent.value || 0) }];

    } else if (enemy.intent.type === 'Curse') {
      logs = [`${enemy.name} egy kompromittáló aktát csúsztatott a zsebedbe! (Bürokrácia a dobópakliba)`, ...logs];
      const hexCard = UNIQUE_CARDS.find(c => c.id === 'hx-bureaucracy');
      if (hexCard) {
         tempState = { ...tempState, pendingHex: { ...hexCard, id: `${hexCard.id}-${Math.random()}` } };
      }
    }
    
    const nextEnemyStatus = newEnemies[i].statusEffects
       .map(s => s.type === 'Strength' || s.type === 'Dexterity' ? s : { ...s, stacks: s.stacks - 1 })
       .filter(s => s.stacks > 0);

    newEnemies[i] = {
      ...newEnemies[i],
      block: enemyBlock,
      intent: generateEnemyIntent(tempState.currentNodeId?.includes('Elite') || tempState.currentNodeId?.includes('Boss')),
      statusEffects: nextEnemyStatus
    };
  }

  // Remove dead enemies
  newEnemies = newEnemies.filter(e => e.hp > 0);

  // Resolve Player Poison (Botrány) at the transition to Player Turn
  const playerPoison = currentPlayerStatus.find(s => s.type === 'Poison');
  if (playerPoison) {
     playerHp = Math.max(0, playerHp - playerPoison.stacks);
     logs = [`A rágalomhadjárat sebez: ${playerPoison.stacks} sebzés`, ...logs];
  }

  // 3. Process Delayed Effects (NextTurn...)
  let bonusEnergy = 0;
  let bonusDraw = 0;
  let bonusBlock = 0;
  
  currentPlayerStatus.forEach(s => {
    if (s.type === 'NextTurnEnergy') bonusEnergy += s.stacks;
    if (s.type === 'NextTurnDraw') bonusDraw += s.stacks;
    if (s.type === 'NextTurnBlock') bonusBlock += s.stacks;
  });

  if (bonusEnergy > 0) logs.push(`Kaptál ${bonusEnergy} extra Lendületet!`);
  if (bonusDraw > 0) logs.push(`Kaptál ${bonusDraw} extra Kártyát!`);
  if (bonusBlock > 0) logs.push(`Kaptál ${bonusBlock} extra Cenzúrát!`);

  // Reset for next turn
  const nextPlayerStatus = currentPlayerStatus
     .filter(s => s.type !== 'NextTurnEnergy' && s.type !== 'NextTurnDraw' && s.type !== 'NextTurnBlock')
     .map(s => s.type === 'Strength' || s.type === 'Dexterity' ? s : { ...s, stacks: s.stacks - 1 })
     .filter(s => s.stacks > 0);

  const retainedCards = tempState.player.hand.filter(c => c.retain);
  const discardedCards = tempState.player.hand.filter(c => !c.retain);
  
  const { nextHp: hpAfterDiscard, nextLogs: logsAfterDiscard } = handleDiscardDamage(playerHp, discardedCards, logs);
  playerHp = hpAfterDiscard;
  logs = logsAfterDiscard;

  const nextPlayer = {
    ...tempState.player,
    hp: playerHp,
    block: bonusBlock, // Starts with bonus block instead of 0
    energy: tempState.player.maxEnergy + bonusEnergy, // Add bonus energy
    hand: retainedCards,
    drawPile: [...tempState.player.drawPile],
    discardPile: [...playerDiscardPile, ...discardedCards],
    statusEffects: nextPlayerStatus
  };
  
  // Draw new cards
  const drawCount = 5 + bonusDraw;
  const replenishAndDraw = (p: typeof nextPlayer) => {
    let currentDrawPile = [...p.drawPile];
    let currentDiscardPile = [...p.discardPile];
    let currentHand = [...p.hand];
    
    for(let i = 0; i < drawCount; i++) {
        if (currentDrawPile.length === 0) {
            currentDrawPile = shuffle(currentDiscardPile);
            currentDiscardPile = [];
        }
        if (currentDrawPile.length > 0) {
            currentHand.push(currentDrawPile.pop()!);
        }
    }
    return { ...p, drawPile: currentDrawPile, discardPile: currentDiscardPile, hand: currentHand };
  };

  const nextState = {
    ...tempState,
    player: replenishAndDraw(nextPlayer),
    enemies: newEnemies,
    turn: 'Player' as const,
    turnCount: tempState.turnCount + 1,
    logs,
    cardsPlayedThisTurn: [],
    cardsDiscardedThisTurn: 0,
    pendingHex: null,
  };

  return triggerRelics(nextState, 'onTurnStart');
};
