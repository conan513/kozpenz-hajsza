/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Sword, Zap, Trash2, Layers, Heart, Coins, Music, MicOff, Volume2, VolumeX } from 'lucide-react';
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
import { soundEngine } from './lib/soundEngine';
import { DamageNumberProvider, useDamageNumber } from './components/DamageNumber';
import { CombatBackground } from './components/CombatBackground';
import { SVGFilters } from './components/SVGFilters';
import { TooltipProvider, useTooltip } from './components/TooltipProvider';

export default function App() {
  const [state, setState] = useState<GameState>(createInitialState());
  const [isProcessing, setIsProcessing] = useState(false);
  const [viewingPile, setViewingPile] = useState<'deck' | 'draw' | 'discard' | 'exhaust' | null>(null);
  const [screenFlash, setScreenFlash] = useState<string | null>(null);
  const [musicOn, setMusicOn] = useState(true);
  const [sfxOn, setSfxOn] = useState(true);
  
  const { showTooltip, hideTooltip } = useTooltip();
  const [targetingCard, setTargetingCard] = useState<{card: Card, index: number} | null>(null);
  const prevPlayerHp = useRef<number>(0);
  const prevEnemyHps = useRef<Record<string, number>>({});
  const { addNumber } = useDamageNumber();


  const handleSelectCharacter = useCallback((char: CharacterDefinition) => {
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
  }, [isProcessing]);

  const handleUsePotion = useCallback((index: number) => {
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
  }, []);

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
    soundEngine.playEndTurn();
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
    hideTooltip();
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

  // Damage number tracking
  useEffect(() => {
    if (state.view !== 'Combat') return;
    const currentHp = state.player?.hp ?? 0;
    const prev = prevPlayerHp.current;
    if (prev > 0 && currentHp < prev) {
      soundEngine.playDamage(prev - currentHp);
      addNumber(prev - currentHp, 'damage', window.innerWidth * 0.22, window.innerHeight * 0.5);
    } else if (prev > 0 && currentHp > prev) {
      addNumber(currentHp - prev, 'heal', window.innerWidth * 0.22, window.innerHeight * 0.5);
    }
    prevPlayerHp.current = currentHp;
  }, [state.player?.hp, state.view]);

  useEffect(() => {
    if (state.view !== 'Combat') return;
    state.enemies.forEach(enemy => {
      const prevHp = prevEnemyHps.current[enemy.id];
      if (prevHp !== undefined && enemy.hp < prevHp) {
        soundEngine.playDamage(prevHp - enemy.hp);
        addNumber(prevHp - enemy.hp, 'damage', window.innerWidth * 0.6, window.innerHeight * 0.45);
      }
      prevEnemyHps.current[enemy.id] = enemy.hp;
    });
    // Clear dead enemies from ref
    const ids = new Set(state.enemies.map(e => e.id));
    Object.keys(prevEnemyHps.current).forEach(id => { if (!ids.has(id)) { soundEngine.playEnemyDeath(); delete prevEnemyHps.current[id]; } });
  }, [state.enemies]);

  useEffect(() => {
    if (state.player?.block && state.player.block > 0) soundEngine.playBlock();
  }, [state.player?.block]);

  const handleCollectGold = useCallback(() => {
    hideTooltip();
    soundEngine.playGold();
    setState(prev => {
        if (!prev.reward) return prev;
        return {
            ...prev,
            gold: prev.gold + prev.reward.gold,
            logs: [`Collected ${prev.reward.gold} Gold.`, ...prev.logs],
            reward: { ...prev.reward, gold: 0 }
        };
    });
  }, [hideTooltip]);

  const handleCollectRelic = useCallback((relic: any) => {
    hideTooltip();
    setState(prev => {
        if (!prev.player || !prev.reward) return prev;
        return {
            ...prev,
            player: { ...prev.player, relics: [...prev.player.relics, relic] },
            logs: [`Collected Relic: ${relic.name}.`, ...prev.logs],
            reward: { ...prev.reward, relic: null }
        };
    });
  }, [hideTooltip]);

  const handleChooseCard = useCallback((card: Card) => {
    hideTooltip();
    setState(prev => {
        if (!prev.player || !prev.reward) return prev;
        return {
            ...prev,
            player: { ...prev.player, deck: [...prev.player.deck, card] },
            logs: [`Added ${card.name} to deck.`, ...prev.logs],
            reward: { ...prev.reward, cards: [] }
        };
    });
  }, [hideTooltip]);

  const handleFinishNode = useCallback((logMessage?: string, additionalStateUpdates?: Partial<GameState>) => {
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
  }, []);

  const handleSkipRewards = useCallback(() => {
    setState(prev => ({
        ...prev,
        view: 'Map',
        reward: null
    }));
    handleFinishNode();
  }, [handleFinishNode]);

  const playCard = useCallback((card: Card, index: number, targetId?: string) => {
    if (isProcessing || !state.player || state.player.energy < card.cost || state.turn !== 'Player' || card.type === 'Hex') return;

    if (card.needsTarget && !targetId && state.enemies.length > 1) {
        setTargetingCard({ card, index });
        return;
    } else if (card.needsTarget && !targetId && state.enemies.length === 1) {
        targetId = state.enemies[0].id;
    }

    setIsProcessing(true);
    setTargetingCard(null);

    // Sound + screen flash based on card type
    if (card.type === 'Attack') { soundEngine.playCardAttack(); setScreenFlash('red'); }
    else if (card.type === 'Skill') { soundEngine.playCardSkill(); setScreenFlash('teal'); }
    else if (card.type === 'Power') { soundEngine.playCardPower(); setScreenFlash('purple'); }
    else if (card.type === 'Hex')   { soundEngine.playCardHex(); }
    setTimeout(() => setScreenFlash(null), 320);

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
        enemies: newState.enemies.filter(e => e.hp > 0),
        logs: [`Játszott: ${card.name}`, ...newState.logs]
      };
      
      return triggerRelics(finalState, 'onCardPlay', card);
    });

    setTimeout(() => setIsProcessing(false), 200);
  // soundEngine is a module-level singleton – intentionally excluded from deps
  }, [isProcessing, state.player, state.enemies, state.turn]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleEnemyClick = useCallback((enemyId: string) => {
    if (targetingCard) {
      playCard(targetingCard.card, targetingCard.index, enemyId);
      setTargetingCard(null);
    }
  }, [targetingCard, playCard]);

  const handleCardClick = useCallback((card: Card) => {
    const index = state.player?.hand.findIndex(c => c.id === card.id) ?? -1;
    if (index === -1) return;
    
    if (card.needsTarget) {
      if (targetingCard?.card.id === card.id) {
        setTargetingCard(null);
      } else {
        setTargetingCard({ card, index });
      }
    } else {
      playCard(card, index);
    }
  }, [state.player?.hand, targetingCard, playCard]);



  const handleNodeClick = useCallback((node: MapNode) => {
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
  }, [isProcessing]);

  const handleEventChoice = useCallback((choiceIndex: number) => {
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
  }, [isProcessing]);


  const handleBuyCard = useCallback((card: Card, price: number) => {
    if (isProcessing) return;
    hideTooltip();
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
  }, [isProcessing, hideTooltip]);

  const handleBuyRelic = useCallback((relic: Relic, price: number) => {
    if (isProcessing) return;
    hideTooltip();
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
  }, [isProcessing, hideTooltip]);

  const handleBuyPotion = useCallback((potion: Potion, price: number) => {
    if (isProcessing) return;
    hideTooltip();
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
  }, [isProcessing, hideTooltip]);

  const handleRemoveCard = useCallback((price: number) => {
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
  }, [isProcessing]);

  const handleRest = useCallback(() => {
    if (isProcessing) return;
    setIsProcessing(true);
    soundEngine.playRest();
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
  }, [isProcessing, handleFinishNode]);

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-yellow-500/30 overflow-x-hidden">
          <SVGFilters />
          
          <AnimatePresence mode="wait">
            {state.view === 'Title' && (
              <motion.div key="title" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-screen flex flex-col items-center justify-center p-8 bg-bento-bg relative overflow-hidden">
                <div className="absolute inset-0 paper-texture opacity-30" />
                <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 70%, rgba(185,28,28,0.15) 0%, transparent 65%)' }} />
                {[...Array(12)].map((_, i) => (
                  <motion.div key={i}
                    className="absolute w-1 h-1 rounded-full bg-bento-gold/40"
                    style={{ left: `${10 + i * 7}%`, top: `${20 + Math.sin(i) * 40}%` }}
                    animate={{ y: [0, -30, 0], opacity: [0.2, 0.6, 0.2] }}
                    transition={{ duration: 3 + i * 0.4, repeat: Infinity, delay: i * 0.3 }}
                  />
                ))}
                <motion.h1
                  initial={{ y: -60, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 120, damping: 18 }}
                  className="text-6xl md:text-9xl font-black font-serif italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-bento-gold to-yellow-700 mb-4 text-center title-glow drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)]"
                >
                  NER<br/>SCROLLER
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-bento-gold/60 tracking-[0.3em] uppercase text-xs md:text-sm mb-12 font-bold text-center font-mono"
                >
                  Egy Kártyázós Közéleti Kaland
                </motion.p>
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6, type: 'spring' }}
                  whileHover={{ scale: 1.1, letterSpacing: '0.2em' }}
                  whileTap={{ scale: 0.9 }}
                  onClick={async () => {
                    setState(prev => ({ ...prev, view: 'CharacterSelect' }));
                    try {
                      await soundEngine.init();
                      soundEngine.startMusic();
                      soundEngine.playButtonClick();
                    } catch (e) {
                      console.warn("Sound init failed", e);
                    }
                  }}
                  className="px-12 py-4 bg-bento-accent text-white font-black text-xl tracking-widest uppercase transition-all hover:shadow-[0_0_40px_rgba(229,62,62,0.5)] rounded-lg border border-white/20"
                >
                  Kampány Indítása
                </motion.button>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2 }}
                  className="absolute bottom-8 text-bento-text-dim/40 text-[10px] uppercase tracking-widest font-mono"
                >
                  Kattints a hang és zene bekapcsolásához
                </motion.p>
              </motion.div>
            )}

            {state.view === 'CharacterSelect' && (
              <motion.div key="char-select" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-screen p-2 md:p-8">
                <CharacterSelectView characters={CHARACTERS} onSelect={handleSelectCharacter} />
              </motion.div>
            )}

            {state.view === 'Map' && state.player && (
              <motion.div key="map" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-screen w-full p-4 md:p-8 flex flex-col items-center bg-bento-bg relative overflow-y-auto overflow-x-hidden">
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
                    <button onClick={() => setViewingPile('deck')} className="flex flex-col hover:bg-white/5 p-1 rounded transition-colors text-left">
                      <span className="text-[10px] uppercase tracking-wider text-bento-text-dim">Program</span>
                      <div className="flex items-center gap-2">
                        <Layers size={14} className="text-blue-400" />
                        <span className="text-sm md:text-xl font-mono font-bold">{state.player.deck.length}</span>
                      </div>
                    </button>
                    <div className="h-8 w-px bg-white/10 hidden md:block" />
                    <button onClick={() => setViewingPile('exhaust')} className="flex flex-col hover:bg-white/5 p-1 rounded transition-colors text-left">
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
                  <MapComponent nodes={state.map} onNodeClick={handleNodeClick} currentNodeId={state.currentNodeId} />
                </div>

                <div className="mt-8 w-full max-w-4xl bento-panel lux-shadow h-24 overflow-y-auto font-mono text-[10px] text-bento-text-main/80 bg-black/40 border-l-4 border-l-bento-gold transition-all hover:text-white p-4 relative">
                    <div className="absolute inset-0 paper-texture opacity-40 pointer-events-none" />
                    {state.logs.map((log, i) => (
                        <div key={i} className="mb-1 relative z-10">{`> ${log}`}</div>
                    ))}
                </div>
              </motion.div>
            )}

            {state.view === 'Combat' && state.player && state.enemies && (
              <motion.div key="combat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-screen w-full flex flex-col p-2 md:p-5 bg-bento-bg overflow-hidden relative">
                <CombatBackground />
                {screenFlash && <div className={`screen-flash screen-flash-${screenFlash}`} />}
                
                <div className="grid grid-cols-1 md:grid-cols-12 md:grid-rows-[60px_1fr_220px] gap-2 md:gap-3 flex-1 overflow-hidden z-10">
                  {/* Top Stats */}
                  <div className="bento-panel col-span-1 md:col-span-8 flex items-center gap-6 p-4">
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="text-[10px] uppercase text-bento-text-dim">Népszerűség</span>
                        <span className="text-bento-accent font-bold text-xs">{state.player.hp} / {state.player.maxHp}</span>
                      </div>
                      <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden border border-white/5">
                        <div className="h-full bg-bento-accent" style={{ width: `${(state.player.hp / state.player.maxHp) * 100}%`, transition: 'width 0.4s cubic-bezier(0.25,0.46,0.45,0.94)', willChange: 'width' }} />
                      </div>
                    </div>
                    <div className="flex flex-col"><span className="text-[10px] text-bento-text-dim uppercase">Közpénz</span><span className="text-bento-gold font-bold">{state.gold} m. Ft</span></div>
                  </div>

                  <div className="bento-panel col-span-1 md:col-span-4 flex items-center justify-end gap-4 px-6 py-2 border-t-2 border-t-bento-gold relative overflow-hidden">
                    <div className="absolute inset-0 paper-texture opacity-10 pointer-events-none" />
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] uppercase text-bento-text-dim mb-1">Mutik</span>
                      <div className="flex gap-1.5">
                        {state.player.relics.map((relic, i) => (
                          <div key={i} className="w-8 h-8 rounded bg-slate-700 border border-white/10 flex items-center justify-center cursor-help" onMouseEnter={(e) => showTooltip(e, relic.name, relic.description)} onMouseLeave={hideTooltip}>
                            <Zap size={14} className="text-bento-energy" />
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="h-full w-px bg-white/10 mx-2" />
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] uppercase text-bento-text-dim mb-1">Italok</span>
                      <div className="flex gap-1.5">
                        {Array.from({ length: state.player.maxPotions }).map((_, i) => {
                          const pot = state.player!.potions[i];
                          return pot ? (
                            <button key={i} onClick={() => handleUsePotion(i)} onMouseEnter={(e) => showTooltip(e, pot.name, pot.description)} onMouseLeave={hideTooltip} className="w-8 h-8 rounded-full bg-blue-900 border border-blue-400 flex items-center justify-center text-[10px] font-bold">P</button>
                          ) : (
                            <div key={i} className="w-8 h-8 rounded-full border border-dashed border-white/20 bg-black/50" />
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Arena */}
                  <div className="bento-panel col-span-1 md:col-span-12 relative flex items-center justify-around bg-gradient-to-b from-[#1a0f0f] to-[#0d0707] border-2 border-bento-border overflow-hidden">
                    <div className="entity player flex flex-col items-center z-10">
                        <div className="w-32 h-32 md:w-40 md:h-40 relative">
                            <SpriteRenderer type={state.player.class} />
                            <div className="absolute top-0 left-0 w-full">
                              <StatusEffectList effects={state.player.statusEffects} onHover={showTooltip} onLeave={hideTooltip} />
                            </div>
                        </div>
                        <div className="font-bold text-sm mt-2 flex items-center gap-2">
                            {state.player.hp} / {state.player.maxHp}
                            {state.player.block > 0 && <span className="bg-bento-block px-2 py-0.5 rounded text-[10px] flex items-center gap-1"><Shield size={10} fill="white" /> {state.player.block}</span>}
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-6 items-center justify-center z-10">
                      {state.enemies.map(enemy => (
                        <EnemyComponent key={enemy.id} enemy={enemy} playerStatusEffects={state.player!.statusEffects} onClick={handleEnemyClick} onHover={showTooltip} onLeave={hideTooltip} />
                      ))}
                    </div>
                    <div className="hidden lg:block absolute top-4 right-4 w-64 max-h-32 overflow-y-auto bg-black/70 backdrop-blur-sm rounded-sm p-3 border border-bento-gold/30 text-[10px] font-mono opacity-80">
                      {state.logs.slice(0, 4).map((log, i) => (
                        <div key={i} className={`mb-1 ${i === 0 ? 'text-bento-gold' : 'text-white/40'}`}>{`> ${log}`}</div>
                      ))}
                    </div>
                  </div>

                  {/* Energy & Hand */}
                  <div className="bento-panel col-span-1 md:col-span-2 flex flex-col items-center justify-center">
                    <span className="text-[10px] uppercase text-bento-text-dim">Energia</span>
                    <div className="text-4xl font-black text-bento-energy">{state.player.energy}/{state.player.maxEnergy}</div>
                  </div>

                  <div className="col-span-1 md:col-span-7 flex items-end justify-center pb-6 relative z-20 overflow-visible">
                    <AnimatePresence mode="sync" initial={false}>
                      {state.player.hand.map((card, i) => {
                        const offset = i - (state.player!.hand.length - 1) / 2;
                        const marginX = state.player!.hand.length <= 4 ? -10 : Math.max(-90, -20 - (state.player!.hand.length - 4) * 12);
                        return (
                          <motion.div
                            key={card.id}
                            initial={{ y: 150, opacity: 0 }}
                            animate={{ y: Math.abs(offset) * Math.abs(offset) * 2, opacity: 1, rotate: offset * 5 }}
                            exit={{ y: -150, opacity: 0 }}
                            whileHover={{ rotate: 0, zIndex: 100, y: -20 }}
                            style={{ marginLeft: i === 0 ? 0 : marginX, transformOrigin: "bottom center", zIndex: 10 + i }}
                            className="flex-shrink-0"
                          >
                            <CardComponent card={card} gameState={state} onClick={handleCardClick} disabled={state.player!.energy < card.cost || state.turn !== 'Player' || isProcessing} />
                            {targetingCard?.card.id === card.id && (
                               <div className="absolute inset-0 bg-bento-accent/20 rounded-lg pointer-events-none border-2 border-bento-accent animate-pulse" />
                            )}
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>

                  {/* Piles & End Turn */}
                  <div className="bento-panel col-span-1 md:col-span-3 flex flex-col gap-2 p-3 justify-between border-t-2 border-t-bento-gold">
                    <div className="flex gap-2">
                      <button onClick={() => setViewingPile('draw')} className="flex-1 bg-black/50 p-2 rounded-sm text-center border border-white/5 hover:border-bento-gold/30">
                        <div className="text-[10px] text-bento-text-dim uppercase">Akták</div>
                        <strong className="text-xl font-mono">{state.player.drawPile.length}</strong>
                      </button>
                      <button onClick={() => setViewingPile('discard')} className="flex-1 bg-black/50 p-2 rounded-sm text-center border border-white/5 hover:border-red-500/30">
                        <div className="text-[10px] text-bento-text-dim uppercase">Daráló</div>
                        <strong className="text-xl font-mono">{state.player.discardPile.length}</strong>
                      </button>
                    </div>
                    <motion.button whileHover={{ scale: 1.02, backgroundColor: '#d4af37', color: '#1a0f0f' }} whileTap={{ scale: 0.98 }} onClick={handleEndTurn} disabled={state.turn !== 'Player' || isProcessing} className={`w-full py-4 rounded-sm font-black uppercase tracking-widest border-2 ${state.turn === 'Player' && !isProcessing ? 'border-bento-gold text-bento-gold' : 'border-white/10 text-white/20'}`}>
                      {state.turn === 'Player' ? 'Kör Vége' : 'Központ...'}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}

            {state.view === 'GameOver' && (
              <motion.div key="gameover" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen flex flex-col items-center justify-center bg-bento-bg p-4 relative overflow-hidden">
                <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center, rgba(139,0,0,0.25) 0%, rgba(5,2,2,0.95) 70%)' }} />
                <div className="absolute inset-0 paper-texture opacity-20" />
                <motion.h1
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 12 }}
                  className="text-6xl md:text-9xl font-black italic text-bento-accent mb-4 text-center relative z-10"
                  style={{ textShadow: '0 0 60px rgba(229,62,62,0.6), 0 0 120px rgba(229,62,62,0.3)' }}
                >
                  MEGBUKTÁL
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-bento-text-dim uppercase tracking-widest text-sm mb-10 relative z-10"
                >
                  A rendszer legyőzött. Ez most fáj.
                </motion.p>
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.9 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => { soundEngine.playButtonClick(); setState(createInitialState()); }}
                  className="px-12 py-4 bg-white text-black font-black uppercase tracking-widest hover:bg-bento-gold transition-colors rounded-lg text-center relative z-10"
                >
                  Új választás kiírása
                </motion.button>
              </motion.div>
            )}

            {state.view === 'Start' && state.currentEvent && (
              <div className="min-h-screen bg-bento-bg p-4 md:p-0">
                <StartView event={state.currentEvent} choices={state.activeEventChoices} onChoose={handleEventChoice} onBackToMap={() => handleFinishNode()} logs={state.logs} />
              </div>
            )}
            {state.view === 'Rest' && (
              <div className="min-h-screen bg-bento-bg p-4 md:p-0">
                <RestView onRest={handleRest} onBackToMap={() => handleFinishNode()} logs={state.logs} />
              </div>
            )}
            {state.view === 'Event' && state.currentEvent && (
              <div className="min-h-screen bg-bento-bg p-4 md:p-0">
                <EventView event={state.currentEvent} choices={state.activeEventChoices} onChoose={handleEventChoice} onBackToMap={() => handleFinishNode()} logs={state.logs} />
              </div>
            )}
            {state.view === 'Shop' && state.shopInventory && (
              <div className="h-screen bg-bento-bg">
                <ShopView gold={state.gold} inventory={state.shopInventory} gameState={state} onBuyCard={handleBuyCard} onBuyRelic={handleBuyRelic} onBuyPotion={handleBuyPotion} onRemoveCard={handleRemoveCard} onBackToMap={() => handleFinishNode()} playerHasFullPotions={(state.player?.potions.length || 0) >= (state.player?.maxPotions || 3)} onHover={showTooltip} onLeave={hideTooltip} logs={state.logs} />
              </div>
            )}
            {state.view === 'Reward' && state.reward && (
              <div className="h-screen bg-bento-bg">
                <RewardView reward={state.reward} gameState={state} onCollectGold={handleCollectGold} onCollectRelic={handleCollectRelic} onChooseCard={handleChooseCard} onSkip={handleSkipRewards} hasCollectedGold={state.reward.gold === 0} hasCollectedRelic={state.reward.relic === null} onHover={showTooltip} onLeave={hideTooltip} />
              </div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {viewingPile && state.player && (
              <PileOverlay 
                title={viewingPile === 'deck' ? 'Pakli' : viewingPile === 'draw' ? 'Akták' : viewingPile === 'discard' ? 'Daráló' : 'Kimerült'}
                cards={viewingPile === 'deck' ? state.player.deck : viewingPile === 'draw' ? state.player.drawPile : viewingPile === 'discard' ? state.player.discardPile : state.player.exhaustPile}
                gameState={state}
                onClose={() => setViewingPile(null)}
              />
            )}
          </AnimatePresence>
    </div>
  );
}

