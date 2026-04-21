/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Sword, Zap, Trash2, Layers, ScrollText, Heart, RotateCcw, Coins } from 'lucide-react';
import { GameState, Card, MapNode, Enemy, Relic, Potion } from './types';
import { createInitialState, startCombat, resolveEnemyTurn, triggerRelics, shuffle, generateShopInventory } from './utils';
import { ENEMIES, ELITE_ENEMIES, BOSS_ENEMIES, CHARACTERS, CharacterDefinition } from './constants';
import CardComponent from './components/CardComponent';
import EnemyComponent from './components/EnemyComponent';
import MapComponent from './components/MapComponent';
import { RestView, EventView, ShopView, StartView, PileOverlay } from './components/SpecialViews';
import CharacterSelectView from './components/CharacterSelectView';
import RewardView from './components/RewardView';
import { StatusEffectList } from './components/StatusEffects';
import { EVENTS, START_EVENTS } from './constants';
import { getStartingDeck, getRewardPool, getWeightedRewardCards } from './lib/cardLibrary';
import { RELICS } from './lib/relicLibrary';
import { SpriteRenderer } from './components/SpriteRenderer';

export default function App() {
  const [state, setState] = useState<GameState>(createInitialState());
  const [isProcessing, setIsProcessing] = useState(false);
  const [viewingPile, setViewingPile] = useState<'deck' | 'draw' | 'discard' | 'exhaust' | null>(null);
  const [hoveredInfo, setHoveredInfo] = useState<{
    title: string;
    description: string;
    x: number;
    y: number;
    anchorX: number;
    side: 'top' | 'bottom';
    targetTop: number;
    targetBottom: number;
  } | null>(null);

  const handleMouseEnter = (e: React.MouseEvent, title: string, description: string) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const windowWidth = window.innerWidth;
    const tooltipWidth = 256; // Matching w-64
    const padding = 12;

    // Horizontal clamping
    let x = rect.left + rect.width / 2;
    // Ensure the box stays on screen
    const minX = (tooltipWidth / 2) + padding;
    const maxX = windowWidth - (tooltipWidth / 2) - padding;
    const clampedX = Math.max(minX, Math.min(maxX, x));

    setHoveredInfo({
      title,
      description,
      x: clampedX,
      y: rect.top - 10,
      anchorX: x, // Original center for the arrow
      side: rect.top < 150 ? 'bottom' : 'top', // Show below if too high
      targetTop: rect.top,
      targetBottom: rect.bottom
    });
  };

  const handleMouseLeave = () => {
    setHoveredInfo(null);
  };

  const handleSelectCharacter = (char: CharacterDefinition) => {
    if (isProcessing) return;
    setIsProcessing(true);
    const classCards = getStartingDeck(char.class);
    setState(prev => ({
      ...prev,
      view: 'Map',
      player: {
        class: char.class,
        maxHp: char.maxHp,
        hp: char.maxHp,
        block: 0,
        energy: 3,
        maxEnergy: 3,
        deck: classCards,
        drawPile: [],
        hand: [],
        discardPile: [],
        exhaustPile: [],
        statusEffects: [],
        relics: [char.relic],
        potions: [],
        maxPotions: 3,
        allies: [],
        maxAllies: 3
      },
      gold: char.gold,
      logs: [`Started run with ${char.class}.`, `Gained relic: ${char.relic.name}.`, ...prev.logs]
    }));
    setTimeout(() => setIsProcessing(false), 300);
  };

  const handleUsePotion = (index: number) => {
    setState(prev => {
        if (!prev.player || prev.turn !== 'Player') return prev;
        const potion = prev.player.potions[index];
        if (!potion) return prev;
        let newState = potion.effect(prev);
        const newPotions = [...newState.player!.potions];
        newPotions.splice(index, 1);
        return {
            ...newState,
            player: {
                ...newState.player!,
                potions: newPotions
            }
        };
    });
  };

  useEffect(() => {
    if (state.pendingHex && state.player) {
      const timer = setTimeout(() => {
        setState(prev => {
          if (!prev.pendingHex || !prev.player) return prev;
          return {
            ...prev,
            player: {
              ...prev.player,
              discardPile: [...prev.player.discardPile, prev.pendingHex]
            },
            pendingHex: null,
            logs: [`Az ártó kártya bekerült a Darálóba.`, ...prev.logs]
          };
        });
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [state.pendingHex, state.player]);


  const handleEndTurn = useCallback(() => {
    if (isProcessing) return;
    setIsProcessing(true);
    setState(prev => ({ ...prev, turn: 'Enemy' }));
    setTimeout(() => setIsProcessing(false), 500);
  }, [isProcessing]);

  useEffect(() => {
    if (state.turn === 'Enemy' && state.view === 'Combat') {
      const timer = setTimeout(() => {
        setState(prev => resolveEnemyTurn(prev));
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [state.turn, state.view]);

  // Clear tooltips on view change to prevent stuck popups
  useEffect(() => {
    setHoveredInfo(null);
  }, [state.view]);

  // Check for combat win/loss
  useEffect(() => {
    if (state.view === 'Combat' && state.enemies.length === 0 && state.player) {
      // Trigger end of combat relics (like Burning Blood)
      let finalState = triggerRelics(state, 'onCombatEnd');
      
      const rewardCards = getWeightedRewardCards(state.player.class, 3);
      const isEliteOrBoss = state.currentNodeId?.includes('Elite') || state.currentNodeId?.includes('Boss') || Math.random() < 0.2;
      const randomRelic = isEliteOrBoss ? RELICS[Math.floor(Math.random() * RELICS.length)] : null;

      setState(prev => ({
        ...finalState,
        view: 'Reward',
        logs: [`Defeated enemies!`, ...finalState.logs],
        reward: {
          gold: 15 + Math.floor(Math.random() * 20),
          relic: randomRelic,
          cards: rewardCards
        }
      }));
    }
    if (state.view === 'Combat' && state.player && state.player.hp <= 0) {
      setState(prev => ({ ...prev, view: 'GameOver' }));
    }
  }, [state.enemies.length, state.player?.hp, state.view, state.currentNodeId]);

  const handleCollectGold = () => {
    handleMouseLeave();
    setState(prev => {
        if (!prev.reward) return prev;
        return {
            ...prev,
            gold: prev.gold + prev.reward.gold,
            logs: [`Collected ${prev.reward.gold} Gold.`, ...prev.logs],
            reward: { ...prev.reward, gold: 0 }
        };
    });
  };

  const handleCollectRelic = (relic: any) => {
    handleMouseLeave();
    setState(prev => {
        if (!prev.player || !prev.reward) return prev;
        return {
            ...prev,
            player: { ...prev.player, relics: [...prev.player.relics, relic] },
            logs: [`Collected Relic: ${relic.name}.`, ...prev.logs],
            reward: { ...prev.reward, relic: null }
        };
    });
  };

  const handleChooseCard = (card: Card) => {
    handleMouseLeave();
    setState(prev => {
        if (!prev.player || !prev.reward) return prev;
        return {
            ...prev,
            player: { ...prev.player, deck: [...prev.player.deck, card] },
            logs: [`Added ${card.name} to deck.`, ...prev.logs],
            reward: { ...prev.reward, cards: [] }
        };
    });
  };

  const handleSkipRewards = () => {
    setState(prev => ({
        ...prev,
        view: 'Map',
        reward: null
    }));
    handleFinishNode();
  };

  const [targetingCard, setTargetingCard] = useState<{card: Card, index: number} | null>(null);

  const playCard = (card: Card, index: number, targetId?: string) => {
    if (isProcessing || !state.player || state.player.energy < card.cost || state.turn !== 'Player' || card.type === 'Hex') return;

    if (card.needsTarget && !targetId && state.enemies.length > 1) {
        setTargetingCard({ card, index });
        return;
    } else if (card.needsTarget && !targetId && state.enemies.length === 1) {
        targetId = state.enemies[0].id;
    }

    setIsProcessing(true);
    setTargetingCard(null);

    setState(prev => {
      if (!prev.player) return prev;
      
      const cardIndex = prev.player.hand.findIndex(c => c.id === card.id);
      if (cardIndex === -1) return prev;

      // Effect execution
      let newState = card.effect(prev, targetId);
      if (!newState.player) return newState;

      // Remove the played card from hand (only one instance)
      const newHand = [...newState.player.hand];
      const actualIndex = newHand.findIndex(c => c.id === card.id);
      if (actualIndex !== -1) newHand.splice(actualIndex, 1);

      const isPower = card.type === 'Power';
      
      const finalState = {
        ...newState,
        player: {
          ...newState.player,
          energy: newState.player.energy - card.cost,
          hand: newHand,
          discardPile: (isPower || card.exhaust) ? newState.player.discardPile : [...newState.player.discardPile, card],
          exhaustPile: card.exhaust ? [...newState.player.exhaustPile, card] : newState.player.exhaustPile
        },
        cardsPlayedThisTurn: [...newState.cardsPlayedThisTurn, card.id],
        enemies: newState.enemies.filter(e => e.hp > 0)
      };
      
      return triggerRelics(finalState, 'onCardPlay', card);
    });

    setTimeout(() => setIsProcessing(false), 200);
  };



  const handleNodeClick = (node: MapNode) => {
    if (isProcessing) return;
    setIsProcessing(true);
    if (node.type === 'Combat' || node.type === 'Elite' || node.type === 'Boss') {
      const enemyPool = node.type === 'Boss' ? BOSS_ENEMIES : node.type === 'Elite' ? ELITE_ENEMIES : ENEMIES;
      const randomEnemy = enemyPool[Math.floor(Math.random() * (enemyPool.length || 1))] || ENEMIES[0];
      
      setState(prev => ({
        ...startCombat(prev, randomEnemy, node),
        currentNodeId: node.id
      }));
    } else {
        setState(prev => {
            const nextView = node.type === 'Mystery' ? 'Event' : node.type === 'Rest' ? 'Rest' : node.type === 'Shop' ? 'Shop' : node.type === 'Start' ? 'Start' : 'Map';
            let randomEvent = null;
            let choices: any[] = [];
            
            if (nextView === 'Event') {
               randomEvent = EVENTS[Math.floor(Math.random() * EVENTS.length)];
               choices = shuffle(randomEvent.choices).slice(0, 3);
            } else if (nextView === 'Start') {
               randomEvent = START_EVENTS[Math.floor(Math.random() * START_EVENTS.length)];
               choices = shuffle(randomEvent.choices).slice(0, 3);
            }
            
            const newShopEnv = nextView === 'Shop' && prev.player ? generateShopInventory(prev.player) : null;
            
            return {
                ...prev,
                view: nextView as any,
                currentEvent: randomEvent,
                activeEventChoices: choices,
                shopInventory: newShopEnv,
                logs: [`Léptél: ${node.type}`, ...prev.logs],
                currentNodeId: node.id
            };
        });
    }
    setTimeout(() => setIsProcessing(false), 500);
  };

  const handleEventChoice = (choiceIndex: number) => {
    if (isProcessing) return;
    setIsProcessing(true);
    setState(prev => {
      if (!prev.currentEvent || !prev.activeEventChoices[choiceIndex]) return prev;
      const choice = prev.activeEventChoices[choiceIndex];
      const newState = choice.effect(prev);
      return {
        ...newState,
        view: 'Map', // Go back to map after event choice
        currentEvent: null,
        activeEventChoices: [],
        logs: [`Esemény lezárva: ${choice.label}`, ...newState.logs],
        map: newState.map.map(n => {
           if (n.id === newState.currentNodeId) return { ...n, visited: true, reachable: false };
           const node = newState.map.find(nodeRef => nodeRef.id === newState.currentNodeId)!;
           if (node.connections.includes(n.id)) return { ...n, reachable: true };
           return { ...n, reachable: false };
        })
      };
    });
    setTimeout(() => setIsProcessing(false), 500);
  };

  const handleFinishNode = (logMessage?: string, additionalStateUpdates?: Partial<GameState>) => {
    setState(prev => {
        const node = prev.map.find(n => n.id === prev.currentNodeId)!;
        return {
            ...prev,
            ...additionalStateUpdates,
            view: 'Map',
            currentEvent: null,
            logs: logMessage ? [logMessage, ...prev.logs] : (additionalStateUpdates?.logs || prev.logs),
            map: prev.map.map(n => {
                if (n.id === prev.currentNodeId) return { ...n, visited: true, reachable: false };
                if (node.connections.includes(n.id)) return { ...n, reachable: true };
                return { ...n, reachable: false };
            })
        };
    });
  };

  const handleBuyCard = (card: Card, price: number) => {
    if (isProcessing) return;
    handleMouseLeave();
    setIsProcessing(true);
    setState(prev => {
      if (!prev.player || !prev.shopInventory || prev.gold < price) return prev;
      return {
        ...prev,
        gold: prev.gold - price,
        player: { ...prev.player, deck: [...prev.player.deck, card] },
        shopInventory: {
          ...prev.shopInventory,
          cards: prev.shopInventory.cards.filter(c => c.item.id !== card.id)
        },
        logs: [`Megvásároltad: ${card.name} (${price} Közpénz)`, ...prev.logs]
      };
    });
    setTimeout(() => setIsProcessing(false), 300);
  };

  const handleBuyRelic = (relic: Relic, price: number) => {
    if (isProcessing) return;
    handleMouseLeave();
    setIsProcessing(true);
    setState(prev => {
      if (!prev.player || !prev.shopInventory || prev.gold < price) return prev;
      return {
        ...prev,
        gold: prev.gold - price,
        player: { ...prev.player, relics: [...prev.player.relics, relic] },
        shopInventory: {
          ...prev.shopInventory,
          relics: prev.shopInventory.relics.filter(r => r.item.id !== relic.id)
        },
        logs: [`Megvásároltad: ${relic.name} (${price} Közpénz)`, ...prev.logs]
      };
    });
    setTimeout(() => setIsProcessing(false), 300);
  };

  const handleBuyPotion = (potion: Potion, price: number) => {
    if (isProcessing) return;
    handleMouseLeave();
    setIsProcessing(true);
    setState(prev => {
      if (!prev.player || !prev.shopInventory || prev.gold < price || prev.player.potions.length >= prev.player.maxPotions) return prev;
      return {
        ...prev,
        gold: prev.gold - price,
        player: { ...prev.player, potions: [...prev.player.potions, potion] },
        shopInventory: {
          ...prev.shopInventory,
          potions: prev.shopInventory.potions.filter(p => p.item.id !== potion.id)
        },
        logs: [`Megvásároltad: ${potion.name} (${price} Közpénz)`, ...prev.logs]
      };
    });
    setTimeout(() => setIsProcessing(false), 300);
  };

  const handleRemoveCard = (price: number) => {
    if (isProcessing) return;
    setIsProcessing(true);
    setState(prev => {
        if (!prev.player || prev.gold < price || prev.player.deck.length === 0) return prev;
        
        let removedCard: Card;
        const index = Math.floor(Math.random() * prev.player.deck.length);
        removedCard = prev.player.deck[index];

        const newDeck = [...prev.player.deck];
        newDeck.splice(index, 1);

        return {
          ...prev,
          gold: prev.gold - price,
          player: { ...prev.player, deck: newDeck },
          logs: [`Eltüntettél egy kártyát a Cégtemetőben: ${removedCard.name} (${price} Közpénz)`, ...prev.logs]
        };
    });
    setTimeout(() => setIsProcessing(false), 300);
  };

  const handleRest = () => {
    if (isProcessing) return;
    setIsProcessing(true);
    setState(prev => {
      if (!prev.player) return prev;
      return {
        ...prev,
        player: {
          ...prev.player,
          hp: Math.min(prev.player.maxHp, prev.player.hp + Math.floor(prev.player.maxHp * 0.3))
        }
      };
    });
    handleFinishNode('Rested at campfire. (+30% HP)');
    setTimeout(() => setIsProcessing(false), 500);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-yellow-500/30 overflow-x-hidden">
        {state.view === 'Title' && (
          <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-bento-bg relative overflow-hidden">
            <div className="absolute inset-0 paper-texture opacity-30" />
            <motion.h1 
              initial={{ y: -50 }}
              animate={{ y: 0 }}
              className="text-6xl md:text-9xl font-black font-serif italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-bento-gold to-yellow-700 mb-4 text-center md:text-left drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)]"
            >
              NER<br/>SCROLLER
            </motion.h1>
            <p className="text-bento-gold/60 tracking-[0.3em] uppercase text-xs md:text-sm mb-12 font-bold text-center font-mono">Egy Kártyázós Közéleti Kaland</p>
            
            <motion.button
              whileHover={{ scale: 1.1, letterSpacing: '0.2em' }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setState(prev => ({ ...prev, view: 'CharacterSelect' }))}
              className="px-12 py-4 bg-bento-accent text-white font-black text-xl tracking-widest uppercase transition-all hover:shadow-[0_0_30px_rgba(229,62,62,0.3)] rounded-lg border border-white/20"
            >
              Kampány Indítása
            </motion.button>
          </div>
        )}

        {state.view === 'CharacterSelect' && (
          <div className="min-h-screen p-2 md:p-8">
            <CharacterSelectView characters={CHARACTERS} onSelect={handleSelectCharacter} />
          </div>
        )}

        {state.view === 'Map' && state.player && (
          <div className="min-h-screen w-full p-4 md:p-8 flex flex-col items-center bg-bento-bg overflow-y-auto overflow-x-hidden relative">
            <div className="absolute inset-0 paper-texture opacity-20 pointer-events-none" />
            <header className="w-full max-w-4xl flex flex-col md:flex-row justify-between items-center mb-8 bento-panel lux-shadow py-4 px-4 md:px-8 gap-4 rounded-sm border-t-4 border-t-bento-accent">
              <div className="flex items-center gap-4 md:gap-8 w-full md:w-auto justify-between md:justify-start">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-wider text-bento-text-dim">Népszerűség</span>
                  <div className="flex items-center gap-2">
                    <Heart size={14} className="text-bento-accent fill-shadow" />
                    <span className="text-sm md:text-xl font-mono font-bold">{state.player.hp}/{state.player.maxHp}</span>
                  </div>
                </div>
                <button 
                  onClick={() => setViewingPile('deck')}
                  className="flex flex-col hover:bg-white/5 p-1 rounded transition-colors text-left"
                >
                  <span className="text-[10px] uppercase tracking-wider text-bento-text-dim">Program</span>
                  <div className="flex items-center gap-2">
                    <Layers size={14} className="text-blue-400" />
                    <span className="text-sm md:text-xl font-mono font-bold">{state.player.deck.length}</span>
                  </div>
                </button>
                <div className="h-8 w-px bg-white/10 hidden md:block" />
                <button 
                  onClick={() => setViewingPile('exhaust')}
                  className="flex flex-col hover:bg-white/5 p-1 rounded transition-colors text-left"
                >
                  <span className="text-[10px] uppercase tracking-wider text-bento-text-dim">Kimerült</span>
                  <div className="flex items-center gap-2 text-purple-400">
                    <Trash2 size={14} />
                    <span className="text-sm md:text-xl font-mono font-bold">{state.player.exhaustPile?.length || 0}</span>
                  </div>
                </button>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-wider text-bento-text-dim">Közpénz</span>
                  <div className="flex items-center gap-2">
                    <Coins size={14} className="text-bento-gold" />
                    <span className="text-sm md:text-xl font-mono font-bold">{state.gold}</span>
                  </div>
                </div>
              </div>
              <h2 className="text-lg md:text-xl font-black font-serif italic tracking-tighter text-bento-gold/80">{state.player.class.toUpperCase()} · I. CIKLUS</h2>
            </header>

            <div className="w-full max-w-4xl">
              <MapComponent 
                nodes={state.map} 
                onNodeClick={handleNodeClick} 
                currentNodeId={state.currentNodeId}
              />
            </div>

            <div className="mt-8 w-full max-w-4xl bento-panel lux-shadow h-24 overflow-y-auto font-mono text-[10px] text-bento-text-main/80 bg-black/40 border-l-4 border-l-bento-gold transition-all hover:text-white p-4 relative">
                <div className="absolute inset-0 paper-texture opacity-40 pointer-events-none" />
                {state.logs.map((log, i) => (
                    <div key={i} className="mb-1 relative z-10">{`> ${log}`}</div>
                ))}
            </div>
          </div>
        )}

        {state.view === 'Combat' && (
          state.player && state.enemies ? (
            <div className="h-screen w-full flex flex-col p-2 md:p-5 bg-bento-bg overflow-hidden relative">
              <div className="absolute inset-0 paper-texture opacity-20 pointer-events-none" />
              <div className="grid grid-cols-1 md:grid-cols-12 md:grid-rows-[60px_1fr_220px] gap-2 md:gap-3 flex-1 overflow-hidden z-10">
                {/* Top Info Panels */}
                <div className="bento-panel col-span-1 md:col-span-8 flex items-center gap-4 md:gap-6 p-4">
                  <div className="flex flex-col flex-shrink-0">
                    <span className="text-[10px] uppercase tracking-wider text-bento-text-dim">Körzet</span>
                    <span className="font-bold text-sm md:text-base">{state.currentNodeId?.split('-')[1] || 1}</span>
                  </div>
                  <div className="flex-1">
                     <div className="flex justify-between items-end mb-1">
                        <span className="text-[10px] uppercase tracking-wider text-bento-text-dim">Népsz.</span>
                        <span className="text-bento-accent font-bold text-xs md:text-sm">{(state.player?.hp ?? 0)} / {(state.player?.maxHp ?? 100)}</span>
                     </div>
                     <div className="h-2 md:h-3 w-full bg-slate-800 rounded-full overflow-hidden border border-white/5">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${((state.player?.hp ?? 0) / (state.player?.maxHp ?? 1)) * 100}%` }}
                          className="h-full bg-bento-accent" 
                        />
                     </div>
                  </div>
                  <div className="flex flex-col flex-shrink-0">
                    <span className="text-[10px] uppercase tracking-wider text-bento-text-dim">Közpénz</span>
                    <span className="text-bento-gold font-bold text-sm md:text-base">{state.gold ?? 0} m. Ft</span>
                  </div>
                </div>

                <div className="bento-panel lux-shadow col-span-1 md:col-span-4 flex items-center justify-start md:justify-end gap-4 px-3 md:px-6 py-2 rounded-sm border-t-2 border-t-bento-gold">
                  <div className="flex flex-col items-start md:items-end">
                      <span className="text-[10px] uppercase tracking-wider text-bento-text-dim mb-1">Mutik</span>
                      <div className="flex gap-1.5 md:gap-2">
                        {(state.player?.relics || []).map((relic, i) => (
                          <div 
                            key={`${relic.id}-${i}`} 
                            className="w-8 h-8 rounded bg-slate-700 border border-white/10 flex items-center justify-center group cursor-help flex-shrink-0"
                            onMouseEnter={(e) => handleMouseEnter(e, relic.name, relic.description)}
                            onMouseLeave={handleMouseLeave}
                          >
                            <Zap size={14} className="text-bento-energy" />
                          </div>
                        ))}
                      </div>
                  </div>
                  
                  <div className="h-full w-px bg-white/10 mx-2" />

                  <div className="flex flex-col items-start md:items-end">
                      <span className="text-[10px] uppercase tracking-wider text-bento-text-dim mb-1">Csúszópénzek ({(state.player?.potions || []).length}/{(state.player?.maxPotions || 3)})</span>
                      <div className="flex gap-1.5 md:gap-2">
                         {Array.from({ length: state.player?.maxPotions || 3 }).map((_, i) => {
                            const potions = state.player?.potions || [];
                            const potion = potions[i];
                            if (!potion) {
                                return <div key={`empty-pot-${i}`} className="w-8 h-8 rounded-full border border-dashed border-white/20 bg-black/50" />;
                            }
                            return (
                              <button 
                                  key={`pot-${i}`} 
                                  onClick={() => handleUsePotion(i)}
                                  onMouseEnter={(e) => handleMouseEnter(e, potion.name, potion.description)}
                                  onMouseLeave={handleMouseLeave}
                                  disabled={state.turn !== 'Player'}
                                  className="w-8 h-8 rounded-full bg-blue-900 border border-blue-400 flex items-center justify-center group relative flex-shrink-0 hover:bg-blue-700 transition-colors"
                              >
                                  <span className="text-xs font-bold font-mono">P</span>
                              </button>
                            );
                         })}
                      </div>
                  </div>
                </div>

                {/* Middle Combat Panel */}
                <div className="bento-panel lux-shadow col-span-1 md:col-span-12 relative flex flex-col md:flex-row items-center justify-around bg-gradient-to-b from-[#1a0f0f] to-[#0d0707] py-8 md:py-0 min-h-[400px] md:min-h-0 rounded-sm border-2 border-bento-border overflow-hidden">
                  <div className="absolute inset-0 paper-texture opacity-30 pointer-events-none" />
                  {state.player && (
                    <div className="entity player flex flex-col items-center mb-8 md:mb-0">
                        <div className="w-32 h-32 md:w-40 md:h-40 bg-slate-700/0 mb-3 flex items-center justify-center p-2 relative group">
                            <div className="absolute inset-0 bg-bento-energy/0 group-hover:bg-bento-energy/20 rounded-full blur-xl transition-all" />
                            <SpriteRenderer type={state.player.class} />
                            <div className="absolute top-2 left-2 z-10 w-full pr-4">
                              <StatusEffectList 
                                effects={state.player.statusEffects || []}
                                onHover={handleMouseEnter}
                                onLeave={handleMouseLeave}
                              />
                            </div>
                        </div>
                        <div className="font-bold text-sm flex items-center gap-2">
                            {state.player.hp} / {state.player.maxHp}
                            {state.player.block > 0 && (
                              <span className="bg-bento-block px-2 py-0.5 rounded text-[10px] flex items-center gap-1">
                                <Shield size={10} fill="white" /> {state.player.block}
                              </span>
                            )}
                        </div>
                        <span className="text-[10px] uppercase tracking-widest text-bento-text-dim mt-1">A {state.player.class}</span>
                        {(state.player.allies && state.player.allies.length > 0) && (
                           <div className="flex gap-2 mt-4">
                             {state.player.allies.map((ally, i) => (
                               <div 
                                 key={`${ally.id}-${i}`}
                                 className="w-10 h-10 rounded-full bg-slate-800 border-2 border-bento-gold/50 flex flex-col items-center justify-center relative group cursor-help hover:border-bento-gold hover:bg-slate-700 transition-all shadow-[0_0_10px_rgba(212,175,55,0.2)]"
                                 onMouseEnter={(e) => handleMouseEnter(e, ally.name, ally.description)}
                                 onMouseLeave={handleMouseLeave}
                               >
                                  <span className="text-[8px] font-bold mt-1">SZÖV.</span>
                               </div>
                             ))}
                           </div>
                        )}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-4 items-center justify-center relative px-2 max-w-full overflow-hidden">
                      {targetingCard && (
                          <div className="absolute -top-16 left-1/2 -translate-x-1/2 text-bento-accent font-black animate-pulse uppercase tracking-widest text-[10px] md:text-sm z-50 bg-black/80 px-4 py-2 rounded-full border border-bento-accent/30 shadow-2xl whitespace-nowrap">
                              Kire nyomjuk rá? {targetingCard.card.name}
                          </div>
                      )}
                      {(state.enemies || []).map(enemy => (
                         <EnemyComponent 
                             key={enemy.id} 
                             enemy={enemy} 
                             playerStatusEffects={state.player?.statusEffects || []}
                             onClick={() => targetingCard && playCard(targetingCard.card, targetingCard.index, enemy.id)}
                             onHover={handleMouseEnter}
                             onLeave={handleMouseLeave}
                         />
                      ))}
                      {(!state.enemies || state.enemies.length === 0) && (
                        <div className="text-bento-text-dim uppercase tracking-tighter italic p-12 text-center">Népszavazás folyamatban...<br/><span className="text-[8px]">(Senki nincs a parlamentben)</span></div>
                      )}
                  </div>

                  {/* Logs Overlay inside combat panel */}
                  <div className="hidden lg:block absolute top-4 right-4 w-64 max-h-32 overflow-y-auto bg-black/70 backdrop-blur-sm rounded-sm p-3 border border-bento-gold/30 text-[10px] font-mono opacity-80 hover:opacity-100 transition-opacity lux-shadow">
                      <div className="absolute inset-0 paper-texture opacity-50 pointer-events-none" />
                      {(state.logs || []).slice(0, 4).map((log, i) => (
                          <div key={i} className={`mb-1 relative z-10 ${i === 0 ? 'text-bento-gold' : 'text-bento-text-main/60'}`}>{`> ${log}`}</div>
                      ))}
                  </div>
                </div>

                {/* Bottom Action Grid */}
                <div className="bento-panel col-span-1 md:col-span-2 flex flex-row md:flex-col items-center justify-center relative overflow-hidden p-4 md:p-0">
                  <div className="absolute inset-0 bg-radial-gradient from-teal-900/50 via-transparent to-transparent opacity-50 hidden md:block" />
                  <span className="text-[10px] md:text-xs uppercase tracking-wider text-bento-text-dim relative z-10 mr-4 md:mr-0">Energia</span>
                  <div className="text-3xl md:text-4xl font-black text-bento-energy drop-shadow-[0_0_10px_rgba(79,209,197,0.5)] relative z-10">
                    {(state.player?.energy ?? 0)}/{(state.player?.maxEnergy ?? 3)}
                  </div>
                </div>

                <div className="col-span-1 md:col-span-7 flex items-end justify-center relative z-20 pb-2 md:pb-6 overflow-visible">
                    <AnimatePresence mode="popLayout" initial={false}>
                      {(state.player?.hand || []).map((card, i) => {
                        const handSize = state.player?.hand.length || 1;
                        const center = (handSize - 1) / 2;
                        const offset = i - center;
                        const rotation = offset * 5;
                        const yOffset = Math.abs(offset) * Math.abs(offset) * 2;
                        const marginX = handSize <= 1 ? 0 : handSize <= 4 ? -10 : Math.max(-95, -20 - (handSize - 4) * 12);

                        return (
                          <motion.div
                            key={card.id}
                            layout
                            initial={{ y: 150, opacity: 0, scale: 0.8 }}
                            animate={{ y: yOffset, opacity: 1, scale: 1, rotate: rotation }}
                            exit={{ y: -150, opacity: 0, scale: 1.1, transition: { duration: 0.3 } }}
                            whileHover={{ rotate: 0, zIndex: 100, transition: { duration: 0.15 } }}
                            style={{ 
                              marginLeft: i === 0 ? 0 : marginX,
                              transformOrigin: "bottom center",
                              zIndex: 10 + i
                            }}
                            transition={{ 
                              type: 'spring',
                              stiffness: 400,
                              damping: 35,
                            }}
                            className="flex-shrink-0 relative"
                          >
                            <CardComponent 
                              card={card} 
                              gameState={state}
                              onClick={() => {
                                 const index = state.player?.hand.findIndex(c => c.id === card.id) ?? -1;
                                 if (index !== -1) playCard(card, index);
                              }}
                              disabled={(state.player?.energy ?? 0) < card.cost || state.turn !== 'Player' || isProcessing}
                            />
                            {targetingCard?.card.id === card.id && (
                               <div className="absolute inset-0 bg-bento-accent/20 rounded-lg pointer-events-none border-2 border-bento-accent animate-pulse" />
                            )}
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                </div>

                <div className="bento-panel lux-shadow col-span-1 md:col-span-3 flex flex-col gap-2 p-3 justify-between rounded-sm border-t-2 border-t-bento-gold">
                  <div className="flex flex-row gap-2">
                    <button 
                      onClick={() => setViewingPile('draw')}
                      className="flex-1 bg-black/50 p-2 rounded-sm text-center border border-white/5 hover:border-bento-gold/50 transition-colors group lux-shadow"
                    >
                      <div className="text-[10px] uppercase tracking-wider text-bento-text-dim mb-1 group-hover:text-bento-gold">Akták</div>
                      <strong className="text-base md:text-xl font-mono text-bento-text-main">{(state.player?.drawPile || []).length}</strong>
                    </button>
                    <button 
                      onClick={() => setViewingPile('discard')}
                      className="flex-1 bg-black/50 p-2 rounded-sm text-center border border-white/5 hover:border-red-500/50 transition-colors group lux-shadow"
                    >
                      <div className="text-[10px] uppercase tracking-wider text-bento-text-dim mb-1 group-hover:text-red-400">Daráló</div>
                      <strong className="text-base md:text-xl font-mono text-bento-text-main">{(state.player?.discardPile || []).length}</strong>
                    </button>
                    <button 
                      onClick={() => setViewingPile('exhaust')}
                      className="flex-1 bg-black/50 p-2 rounded-sm text-center border border-white/5 hover:border-purple-500/50 transition-colors group lux-shadow"
                    >
                      <div className="text-[10px] uppercase tracking-wider text-bento-text-dim mb-1 group-hover:text-purple-400">Kimerült</div>
                      <strong className="text-base md:text-xl font-mono text-bento-text-main">{(state.player?.exhaustPile || []).length}</strong>
                    </button>
                  </div>
                  
                  {/* End Turn Button */}
                  <motion.button
                    whileHover={{ scale: 1.02, backgroundColor: '#d4af37', color: '#1a0f0f' }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleEndTurn}
                    disabled={state.turn !== 'Player' || isProcessing}
                    className={`w-full py-4 rounded-sm font-black font-serif tracking-widest uppercase transition-all shadow-xl border-2 flex-1 flex items-center justify-center
                      ${state.turn === 'Player' && !isProcessing
                        ? 'bg-bento-panel text-bento-gold border-bento-gold hover:shadow-[0_0_20px_rgba(212,175,55,0.4)]' 
                        : 'bg-black/50 text-white/20 border-white/10 cursor-not-allowed'}
                      text-sm md:text-base
                    `}
                  >
                    {state.turn === 'Player' ? 'Kör Vége' : 'Központ...'}
                  </motion.button>
                </div>

              </div>
            </div>
          ) : (
            <div className="h-screen w-screen flex flex-col items-center justify-center p-8 text-center bg-bento-bg">
               <h2 className="text-2xl font-black italic mb-4">Üres a parlament...</h2>
               <p className="text-bento-text-dim text-sm mb-8">Hiba történt a csata betöltésekor. Várj egy pillanatot vagy indíts újra.</p>
               <button onClick={() => setState(createInitialState())} className="px-6 py-3 bg-white text-black font-bold uppercase tracking-widest rounded-lg">Új választás kiírása</button>
            </div>
          )
        )}

        {state.view === 'GameOver' && (
          <div className="min-h-screen flex flex-col items-center justify-center bg-bento-bg p-4">
            <h1 className="text-6xl md:text-9xl font-black italic text-bento-accent mb-8 drop-shadow-[0_0_50px_rgba(229,62,62,0.5)] text-center">MEGBUKTÁL</h1>
            <button 
                onClick={() => setState(createInitialState())}
                className="px-12 py-4 bg-white text-black font-black uppercase tracking-widest hover:scale-105 transition-transform rounded-lg text-center"
            >
                Új választás kiírása
            </button>
          </div>
        )}

        {state.view === 'Start' && state.currentEvent && (
          <div className="min-h-screen bg-bento-bg p-4 md:p-0">
            <StartView 
              logs={state.logs}
              event={state.currentEvent}
              choices={state.activeEventChoices}
              onChoose={handleEventChoice}
              onBackToMap={() => handleFinishNode()}
            />
          </div>
        )}

        {state.view === 'Rest' && (
          <div className="min-h-screen bg-bento-bg p-4 md:p-0">
            <RestView logs={state.logs} onRest={handleRest} onBackToMap={() => handleFinishNode()} />
          </div>
        )}

        {state.view === 'Event' && state.currentEvent && (
          <div className="min-h-screen bg-bento-bg p-4 md:p-0">
            <EventView 
              logs={state.logs} 
              event={state.currentEvent} 
              choices={state.activeEventChoices}
              onChoose={handleEventChoice}
              onBackToMap={() => handleFinishNode()} 
            />
          </div>
        )}

        {state.view === 'Shop' && state.shopInventory && (
          <div className="h-screen bg-bento-bg">
            <ShopView 
                logs={state.logs} 
                gold={state.gold} 
                inventory={state.shopInventory}
                gameState={state}
                onBuyCard={handleBuyCard}
                onBuyRelic={handleBuyRelic}
                onBuyPotion={handleBuyPotion}
                onRemoveCard={handleRemoveCard}
                playerHasFullPotions={state.player ? state.player.potions.length >= state.player.maxPotions : false}
                onBackToMap={() => handleFinishNode()} 
                onHover={handleMouseEnter}
                onLeave={handleMouseLeave}
            />
          </div>
        )}

        {state.view === 'Reward' && state.reward && (
          <div className="h-screen bg-bento-bg">
            <RewardView 
               reward={state.reward} 
               gameState={state}
               onCollectGold={handleCollectGold}
               onCollectRelic={handleCollectRelic}
               onChooseCard={handleChooseCard}
               onSkip={handleSkipRewards}
               hasCollectedGold={state.reward.gold === 0}
               hasCollectedRelic={state.reward.relic === null}
               onHover={handleMouseEnter}
               onLeave={handleMouseLeave}
            />
          </div>
        )}

        <AnimatePresence>
          {state.pendingHex && (
            <motion.div
              initial={{ opacity: 0, scale: 0, x: '-50%', y: '-50%' }}
              animate={{ opacity: 1, scale: 1.5, x: '-50%', y: '-50%' }}
              exit={{ opacity: 0, scale: 0.5, x: '100%', y: '100%', transition: { duration: 0.5 } }}
              className="fixed top-1/2 left-1/2 z-[200] pointer-events-none"
            >
               <div className="flex flex-col items-center gap-4">
                  <div className="bg-red-600 text-white px-4 py-1 rounded-full font-black italic animate-pulse shadow-[0_0_20px_rgba(220,38,38,0.6)]">ÚJ ÁTOK!</div>
                  <CardComponent card={state.pendingHex} gameState={state} />
               </div>
            </motion.div>
          )}

          {viewingPile && state.player && (
            <PileOverlay 
              title={
                viewingPile === 'deck' ? 'Meglévő Kártyák (Deck)' : 
                viewingPile === 'draw' ? 'Akták (Draw Pile)' : 
                viewingPile === 'discard' ? 'Daráló (Discard Pile)' : 
                'Kimerült Készlet (Exhaust Pile)'
              }
              cards={
                viewingPile === 'deck' ? state.player.deck : 
                viewingPile === 'draw' ? state.player.drawPile : 
                viewingPile === 'discard' ? state.player.discardPile : 
                state.player.exhaustPile
              }
              gameState={state}
              onClose={() => setViewingPile(null)}
            />
          )}
        </AnimatePresence>

        {/* Global Tooltip Portal */}
        <AnimatePresence>
          {hoveredInfo && (
            <motion.div
              initial={{ opacity: 0, y: hoveredInfo.side === 'top' ? 10 : -10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              style={{
                position: 'fixed',
                left: hoveredInfo.x,
                top: hoveredInfo.side === 'top' ? hoveredInfo.targetTop - 12 : hoveredInfo.targetBottom + 12,
                transform: `translateX(-50%) ${hoveredInfo.side === 'top' ? 'translateY(-100%)' : 'translateY(0%)'}`,
                zIndex: 9999,
                pointerEvents: 'none'
              }}
              className="w-64 bento-panel lux-shadow p-4 bg-black/95 backdrop-blur-xl border-bento-gold/50 rounded-sm relative overflow-hidden"
            >
              <div className="absolute inset-0 paper-texture opacity-30 pointer-events-none" />
              <div className="relative z-10 font-bold font-serif text-bento-gold text-sm md:text-base mb-1 flex items-center gap-2 border-b border-bento-gold/20 pb-1">
                <Zap size={14} className="text-bento-energy" /> {hoveredInfo.title}
              </div>
              <div className="relative z-10 text-bento-text-main font-mono text-[10px] md:text-xs leading-relaxed mt-2">{hoveredInfo.description}</div>
              
              {/* Arrow */}
              <div 
                className={`absolute w-3 h-3 bg-black/90 border-white/20 rotate-45 
                  ${hoveredInfo.side === 'top' 
                    ? '-bottom-1.5 border-r border-b' 
                    : '-top-1.5 border-l border-t'}
                `}
                style={{
                   left: `calc(50% + ${(hoveredInfo.anchorX - hoveredInfo.x)}px)`,
                   transform: 'translateX(-50%) rotate(45deg)'
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
    </div>
  );
}

