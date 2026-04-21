import React from 'react';
import { motion } from 'motion/react';
import { Card, GameState } from '../types';
import { Sword, Shield, Zap, Sparkles, AlertCircle } from 'lucide-react';

interface CardProps {
  card: Card;
  gameState: GameState;
  onClick?: () => void;
  disabled?: boolean;
  isDragging?: boolean;
}

const CardComponent: React.FC<CardProps> = ({ card, gameState, onClick, disabled, isDragging }) => {
  const getDynamicDescription = () => {
    // Csak harc közben számoljuk a módosítókat, egyébként az alapleírást mutatjuk
    if (!gameState.player || gameState.view !== 'Combat') return card.description;

    
    const strength = gameState.player.statusEffects.find(s => s.type === 'Strength')?.stacks || 0;
    const dexterity = gameState.player.statusEffects.find(s => s.type === 'Dexterity')?.stacks || 0;
    const isWeak = gameState.player.statusEffects.some(s => s.type === 'Weak');

    let desc = card.description;

    // Sebzés kalkuláció (Numbers followed by "sebzés")
    desc = desc.replace(/(\d+)(\s+sebzést)/g, (match, val, suffix) => {
      let num = parseInt(val);
      let finalNum = num + strength;
      if (isWeak) finalNum = Math.floor(finalNum * 0.75);
      const color = finalNum > num ? 'text-green-400' : finalNum < num ? 'text-red-400' : '';
      return `<span class="${color} font-bold">${finalNum}</span>${suffix}`;
    });

    // Védekezés kalkuláció (Numbers followed by "Cenzúrát" or "Blokkot")
    desc = desc.replace(/(\d+)(\s+(Cenzúrát|Blokkot))/g, (match, val, suffix) => {
      let num = parseInt(val);
      let finalNum = num + dexterity;
      const color = finalNum > num ? 'text-green-400' : finalNum < num ? 'text-red-400' : '';
      return `<span class="${color} font-bold">${finalNum}</span>${suffix}`;
    });

    return desc;
  };

  const getCardStyle = () => {
    let base = '';
    switch (card.type) {
      case 'Attack': base = 'border-[#8B0000]/70 bg-gradient-to-br from-[#2A0A0A] to-[#4A0E0E]'; break;
      case 'Skill': base = 'border-[#0d9488]/70 bg-gradient-to-br from-[#102A2A] to-[#164040]'; break;
      case 'Power': base = 'border-purple-500/70 bg-gradient-to-br from-[#2D1B4E] to-[#4C1D95]'; break;
      case 'Hex': base = 'border-stone-900/70 bg-gradient-to-br from-[#1A1A1A] to-[#292929]'; break;
      default: base = 'border-bento-border bg-bento-panel'; break;
    }
    if (card.characterClass === 'Colorless') {
       base = 'border-gray-400/70 bg-gradient-to-br from-gray-700 to-gray-800';
    }
    return base;
  };

  const getIcon = () => {
    switch (card.type) {
      case 'Attack': return <Sword size={16} className="text-red-400" />;
      case 'Skill': return <Shield size={16} className="text-teal-400" />;
      case 'Power': return <Sparkles size={16} className="text-purple-300" />;
      case 'Hex': return <AlertCircle size={16} className="text-stone-400" />;
    }
  };

  const getRarityStyle = () => {
     if (card.rarity === 'Rare') return 'ring-2 ring-bento-gold/80 drop-shadow-[0_0_12px_rgba(246,173,85,0.6)]';
     if (card.rarity === 'Uncommon') return 'ring-1 ring-gray-300/70 drop-shadow-[0_0_8px_rgba(200,200,200,0.5)]';
     return ''; // Common has no extra glow
  };

  return (
    <motion.div
      whileHover={{ scale: disabled ? 1 : 1.35, y: disabled ? 0 : -30, rotateZ: disabled ? 0 : Math.random() * 2 - 1, zIndex: 50 }}
      whileTap={{ scale: 0.95 }}
      onClick={disabled ? undefined : onClick}
      className={`relative w-28 h-40 md:w-32 md:h-44 rounded-sm border-2 p-1.5 md:p-2 lux-shadow cursor-pointer select-none transition-all overflow-hidden
        ${getCardStyle()}
        ${getRarityStyle()}
        ${disabled ? 'opacity-40 grayscale cursor-not-allowed shadow-none' : 'opacity-100 hover:shadow-2xl hover:z-50'}
      `}
    >
      {/* Paper texture overlay */}
      <div className="absolute inset-0 paper-texture opacity-60"></div>
      
      {card.type === 'Hex' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
           <span className="text-red-500/20 font-black text-4xl -rotate-45 tracking-widest border-4 border-red-500/20 px-2 rounded-sm">TITKOS</span>
        </div>
      )}

      <div className="relative z-10 flex items-start gap-1.5 mb-1 min-h-[28px]">
        <div className="w-6 h-6 md:w-7 md:h-7 flex-shrink-0 bg-bento-gold/90 rounded-sm flex items-center justify-center text-[#2A0A0A] font-black font-serif text-xs md:text-sm border border-black/50 shadow-sm">
          {card.cost < 0 ? 'X' : card.cost}
        </div>
        <span className="text-bento-text-main font-serif font-bold text-[9px] md:text-[10px] uppercase leading-tight line-clamp-2 break-words pt-0.5 md:pt-1 drop-shadow-md">{card.name}</span>
      </div>

      <div className="relative z-10 h-14 bg-black/40 rounded-sm mb-2 flex items-center justify-center border border-white/10 shadow-inner">
        <div className="text-white/40 drop-shadow-lg">{getIcon()}</div>
      </div>

      <div className="relative z-10 bg-black/50 rounded-sm p-1.5 h-14 flex flex-col justify-center border-t border-white/5">
        <div 
          className="text-bento-text-dim font-mono text-[8px] md:text-[9px] leading-snug text-center"
          dangerouslySetInnerHTML={{ __html: getDynamicDescription() }}
        />
      </div>

      <div className="absolute bottom-1 right-2 z-10">
        <span className="text-[6px] md:text-[7px] uppercase tracking-widest text-bento-gold/60 font-serif font-bold italic">
          {card.type === 'Attack' ? 'Támadás' : card.type === 'Skill' ? 'Törvény' : card.type === 'Power' ? 'Rendelet' : 'Átok'}
        </span>
      </div>
    </motion.div>
  );
};

export default CardComponent;
