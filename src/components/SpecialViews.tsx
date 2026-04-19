import React from 'react';
import { motion } from 'motion/react';
import { GameEvent, EventChoice, GameState, ShopInventory, Card, Relic, Potion } from '../types';
import { Coffee, ShoppingCart, HelpCircle, Coins, Heart, Zap, Tag, FlaskConical, PackageOpen, TowerControl, Trash2, X } from 'lucide-react';
import CardComponent from './CardComponent';

export const PileOverlay: React.FC<{ 
  title: string, 
  cards: Card[], 
  onClose: () => void 
}> = ({ title, cards, onClose }) => (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex flex-col p-4 md:p-12 items-center"
  >
    <div className="w-full max-w-6xl flex justify-between items-center mb-8 border-b border-white/10 pb-4">
      <h2 className="text-2xl md:text-4xl font-black italic uppercase tracking-tighter text-bento-gold">
        {title} <span className="text-white/40 ml-4 font-mono text-xl">{cards.length}</span>
      </h2>
      <button 
        onClick={onClose}
        className="p-3 bg-white/5 hover:bg-white/20 rounded-full transition-colors border border-white/10 group"
      >
        <X size={24} className="text-white group-hover:rotate-90 transition-transform" />
      </button>
    </div>

    <div className="flex-1 w-full overflow-y-auto custom-scrollbar pr-4">
        {cards.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-white/20 uppercase font-black italic text-4xl tracking-widest">
                Üres...
            </div>
        ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8 justify-items-center p-4">
                {cards.map((card, i) => (
                    <div key={`${card.id}-${i}`} className="transform md:scale-110 mb-4 hover:z-50">
                        <CardComponent card={card} />
                    </div>
                ))}
            </div>
        )}
    </div>
  </motion.div>
);

interface SpecialViewProps {
  onBackToMap: () => void;
  logs: string[];
}

export const StartView: React.FC<SpecialViewProps & { 
  event: GameEvent; 
  choices: EventChoice[]; 
  onChoose: (index: number) => void 
}> = ({ event, choices, onChoose }) => (
  <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8">
    <div className="bento-panel max-w-3xl w-full flex flex-col items-center gap-6 md:gap-8 text-center bg-[radial-gradient(circle_at_center,_#2d3748_0%,_#16171d_100%)] p-6 md:p-12 border-bento-gold">
      <div className="w-20 h-20 md:w-24 md:h-24 bg-bento-panel border-4 border-bento-gold rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(246,173,85,0.4)]">
        <TowerControl size={40} className="text-bento-gold md:hidden" />
        <TowerControl size={48} className="text-bento-gold hidden md:block" />
      </div>
      <div>
        <h2 className="text-2xl md:text-4xl font-black italic mb-2 text-bento-gold uppercase drop-shadow-md">{event.title}</h2>
        <p className="text-bento-text-dim uppercase tracking-widest text-[10px] md:text-sm leading-relaxed">{event.description}</p>
      </div>

      <div className="flex flex-col gap-4 w-full max-w-lg">
        {choices.map((choice, i) => (
           <motion.button 
              key={i}
              whileHover={{ scale: 1.02, x: 5 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onChoose(i)}
              className="w-full text-left bento-panel py-4 px-6 hover:border-bento-accent transition-all flex items-center gap-4 group relative overflow-hidden"
            >
              <div className="bg-slate-800 p-2 rounded-full text-bento-gold group-hover:text-white transition-colors relative z-10">
                 <HelpCircle size={20} />
              </div>
              <div className="relative z-10">
                  <div className="font-bold text-sm md:text-base text-white group-hover:text-bento-accent transition-colors">{choice.label}</div>
                  <div className="text-[10px] text-bento-text-dim uppercase mt-0.5">{choice.description}</div>
              </div>
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-bento-gold transform -translate-x-full group-hover:translate-x-0 transition-transform" />
           </motion.button>
        ))}
      </div>
    </div>
  </div>
);

export const RestView: React.FC<SpecialViewProps & { onRest: () => void }> = ({ onRest, onBackToMap }) => (
  <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8">
    <div className="bento-panel max-w-2xl w-full flex flex-col items-center gap-6 md:gap-8 text-center bg-[radial-gradient(circle_at_center,_#2d3748_0%,_#16171d_100%)] p-6 md:p-12">
      <div className="w-20 h-20 md:w-24 md:h-24 bg-bento-panel border-4 border-bento-border rounded-full flex items-center justify-center shadow-2xl">
        <Coffee size={40} className="text-white md:hidden" />
        <Coffee size={48} className="text-white hidden md:block" />
      </div>
      <div>
        <h2 className="text-2xl md:text-4xl font-black italic mb-2">Büfé Szünet</h2>
        <p className="text-bento-text-dim uppercase tracking-widest text-[10px] md:text-sm">Döntsd el, mire vered el a szabadidőd</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onRest}
          className="bento-panel flex flex-col items-center gap-4 py-8 hover:border-bento-accent transition-colors group"
        >
          <Heart size={32} className="text-bento-accent group-hover:fill-bento-accent" />
          <div className="text-xl font-bold">Kávé & Pogácsa</div>
          <p className="text-[10px] text-bento-text-dim px-4 uppercase">Gyógyulsz 30% Népszerűséget</p>
        </motion.button>

        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onBackToMap}
          className="bento-panel flex flex-col items-center gap-4 py-8 hover:border-bento-energy transition-colors group"
        >
          <Zap size={32} className="text-bento-energy group-hover:fill-bento-energy" />
          <div className="text-xl font-bold">Törvénymódosítás</div>
          <p className="text-[10px] text-bento-text-dim px-4 uppercase">Fejlessz egy kártyát</p>
        </motion.button>
      </div>
    </div>
  </div>
);

export const EventView: React.FC<SpecialViewProps & { 
  event: GameEvent; 
  choices: EventChoice[]; 
  onChoose: (index: number) => void 
}> = ({ event, choices, onChoose }) => (
  <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8">
    <div className="bento-panel max-w-3xl w-full grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-center bg-slate-900/50 p-6 md:p-8 border-white/5">
      <div className="h-48 md:h-96 bg-slate-800 rounded-lg flex items-center justify-center border border-white/5 overflow-hidden relative">
        <HelpCircle size={64} className="text-white/5 md:hidden" />
        <HelpCircle size={128} className="text-white/5 hidden md:block" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
           <span className="text-bento-gold font-black italic tracking-widest uppercase text-xs">Akták</span>
        </div>
      </div>
      
      <div className="flex flex-col gap-4 md:gap-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-black italic mb-4 text-white uppercase tracking-tighter">{event.title}</h2>
          <p className="text-bento-text-dim text-xs md:text-sm leading-relaxed italic">{event.description}</p>
        </div>

        <div className="flex flex-col gap-3">
          {choices.map((choice, i) => (
             <motion.button 
                key={i}
                whileHover={{ x: 10, backgroundColor: 'rgba(255,255,255,0.05)' }}
                onClick={() => onChoose(i)}
                className="w-full text-left bento-panel py-4 px-6 hover:border-bento-accent transition-all flex justify-between items-center group relative overflow-hidden"
              >
                <div className="relative z-10">
                  <div className="font-bold text-sm text-white group-hover:text-bento-accent transition-colors">{choice.label}</div>
                  <div className="text-[10px] text-bento-text-dim uppercase tracking-wider mt-0.5">{choice.description}</div>
                </div>
                <div className="absolute right-0 top-0 bottom-0 w-1 bg-bento-accent transform translate-x-full group-hover:translate-x-0 transition-transform" />
             </motion.button>
          ))}
        </div>
      </div>
    </div>
  </div>
);

interface ShopViewProps extends SpecialViewProps {
  gold: number;
  inventory: ShopInventory;
  onBuyCard: (card: Card, price: number) => void;
  onBuyRelic: (relic: Relic, price: number) => void;
  onBuyPotion: (potion: Potion, price: number) => void;
  onRemoveCard: (price: number) => void;
  playerHasFullPotions: boolean;
  onHover: (e: React.MouseEvent, title: string, description: string) => void;
  onLeave: () => void;
}

export const ShopView: React.FC<ShopViewProps> = ({ 
  gold, 
  inventory, 
  onBuyCard, 
  onBuyRelic, 
  onBuyPotion,
  onRemoveCard,
  onBackToMap,
  playerHasFullPotions,
  onHover,
  onLeave
}) => {
  return (
  <div className="min-h-screen flex flex-col p-4 md:p-8 overflow-y-auto">
    <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 shrink-0">
      <div className="flex items-center gap-4">
        <ShoppingCart size={32} className="text-bento-gold" />
        <h1 className="text-2xl md:text-4xl font-black italic text-center md:text-left">Leányvállalat Kft.</h1>
      </div>
      <div className="bento-panel flex items-center gap-3 py-2 px-6 w-full md:w-auto justify-center">
        <Coins size={20} className="text-bento-gold" />
        <span className="text-xl md:text-2xl font-mono font-bold tracking-tighter">{gold}</span>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 flex-1">
      {/* Cards Section */}
      <div className="md:col-span-8 flex flex-col gap-4">
        <h3 className="font-bold text-bento-text-dim uppercase tracking-widest text-sm flex items-center gap-2">
            <Tag size={16} /> Irányított Pályázatok (Kártyák)
        </h3>
        <div className="flex flex-wrap gap-4">
          {inventory.cards.map(({ item, price }, i) => {
            const canAfford = gold >= price;
            return (
              <div key={item.id + i} className="flex flex-col items-center gap-2 relative">
                <CardComponent card={item} disabled={!canAfford} onClick={canAfford ? () => onBuyCard(item, price) : undefined} />
                <div className={`flex items-center gap-1 font-mono font-bold text-sm bg-black/50 px-2 py-1 rounded-full border ${canAfford ? 'text-bento-gold border-bento-gold/30' : 'text-red-500 border-red-500/30 line-through'}`}>
                    <span>{price}</span> <Coins size={10} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Relics and Potions Section */}
      <div className="md:col-span-4 flex flex-col gap-8">
        <div className="flex flex-col gap-4">
            <h3 className="font-bold text-bento-text-dim uppercase tracking-widest text-sm flex items-center gap-2">
                <PackageOpen size={16} /> Zsebszerződések (Mutik)
            </h3>
            <div className="flex flex-col gap-2">
                {inventory.relics.map(({ item, price }, i) => {
                    const canAfford = gold >= price;
                    return (
                        <button 
                            key={item.id + i} 
                            disabled={!canAfford}
                            onClick={() => onBuyRelic(item, price)}
                            onMouseEnter={(e) => onHover(e, item.name, item.description)}
                            onMouseLeave={onLeave}
                            className={`bento-panel flex items-center justify-between p-3 transition-colors ${canAfford ? 'hover:border-bento-gold' : 'opacity-50 cursor-not-allowed grayscale'}`}
                        >
                            <div className="flex items-center gap-3">
                                <Zap size={16} className="text-bento-energy" />
                                <div className="text-left">
                                    <div className="font-bold text-sm leading-tight">{item.name}</div>
                                    <div className="text-[9px] text-bento-text-dim leading-tight line-clamp-1">{item.description}</div>
                                </div>
                            </div>
                            <div className={`flex items-center gap-1 font-mono font-bold ${canAfford ? 'text-bento-gold' : 'text-red-500 line-through'}`}>
                                {price} <Coins size={12} />
                            </div>
                        </button>
                    )
                })}
            </div>
        </div>

        <div className="flex flex-col gap-4">
            <h3 className="font-bold text-bento-text-dim uppercase tracking-widest text-sm flex items-center gap-2">
                <FlaskConical size={16} /> Csúszópénzek (Italok)
            </h3>
            <div className="flex flex-col gap-2">
                {inventory.potions.map(({ item, price }, i) => {
                    const canAfford = gold >= price && !playerHasFullPotions;
                    return (
                        <button 
                            key={item.id + i} 
                            disabled={!canAfford}
                            onClick={() => onBuyPotion(item, price)}
                            onMouseEnter={(e) => onHover(e, item.name, item.description)}
                            onMouseLeave={onLeave}
                            className={`bento-panel flex items-center justify-between p-3 transition-colors ${canAfford ? 'hover:border-bento-gold' : 'opacity-50 cursor-not-allowed grayscale'}`}
                            title={playerHasFullPotions ? "Tele vannak a zsebeid!" : undefined}
                        >
                            <div className="flex items-center gap-3">
                                <FlaskConical size={16} className="text-blue-400" />
                                <div className="text-left">
                                    <div className="font-bold text-sm leading-tight">{item.name}</div>
                                    <div className="text-[9px] text-bento-text-dim leading-tight line-clamp-1">{item.description}</div>
                                </div>
                            </div>
                            <div className={`flex items-center gap-1 font-mono font-bold ${canAfford ? 'text-bento-gold' : 'text-red-500 line-through'}`}>
                                {price} <Coins size={12} />
                            </div>
                        </button>
                    )
                })}
            </div>
        </div>

        <div className="bento-panel bg-slate-900/30 flex flex-col items-center justify-center text-center p-6 gap-4">
           <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center border border-white/5">
              <Trash2 size={24} className="text-blue-400" />
           </div>
           <h3 className="font-black italic text-lg md:text-xl">Cégtemető</h3>
           <p className="text-[10px] md:text-xs text-bento-text-dim uppercase">Eltüntetünk egy kompromittáló kártyát.</p>
           <button 
             disabled={gold < 75}
             onClick={() => onRemoveCard(75)}
             className={`w-full bento-panel py-3 font-bold transition-colors text-xs md:text-sm ${gold >= 75 ? 'hover:bg-slate-800 text-white' : 'opacity-50 cursor-not-allowed'}`}
           >
              Rendelem (75 <Coins size={12} className="inline" />)
           </button>
        </div>
      </div>
    </div>

    <div className="mt-8 shrink-0 flex justify-center pb-8 border-t border-white/10 pt-8">
      <motion.button 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onBackToMap}
        className="px-12 py-4 bento-panel font-black tracking-widest uppercase hover:border-white transition-colors"
      >
        Gépjárműbe Pattanás
      </motion.button>
    </div>
  </div>
  );
};


