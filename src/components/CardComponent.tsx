import React from 'react';
import { motion } from 'motion/react';
import { Card } from '../types';
import { Sword, Shield, Zap, Sparkles, AlertCircle } from 'lucide-react';

interface CardProps {
  card: Card;
  onClick?: () => void;
  disabled?: boolean;
  isDragging?: boolean;
}

const CardComponent: React.FC<CardProps> = ({ card, onClick, disabled, isDragging }) => {
  const getCardStyle = () => {
    switch (card.type) {
      case 'Attack': return 'border-red-500/50 bg-gradient-to-br from-slate-900 to-red-950';
      case 'Skill': return 'border-green-500/50 bg-gradient-to-br from-slate-900 to-green-950';
      case 'Power': return 'border-blue-500/50 bg-gradient-to-br from-slate-900 to-blue-950 shadow-[0_0_15px_rgba(59,130,246,0.3)]';
      case 'Hex': return 'border-purple-500/50 bg-gradient-to-br from-slate-900 to-purple-950';
      default: return 'border-bento-border bg-slate-900';
    }
  };

  const getIcon = () => {
    switch (card.type) {
      case 'Attack': return <Sword size={16} className="text-red-400" />;
      case 'Skill': return <Shield size={16} className="text-green-400" />;
      case 'Power': return <Sparkles size={16} className="text-blue-400" />;
      case 'Hex': return <AlertCircle size={16} className="text-purple-400" />;
    }
  };

  return (
    <motion.div
      whileHover={{ scale: disabled ? 1 : 1.05, y: disabled ? 0 : -5 }}
      whileTap={{ scale: 0.95 }}
      onClick={disabled ? undefined : onClick}
      className={`relative w-28 h-40 md:w-32 md:h-44 rounded-lg border-2 p-1.5 md:p-2 shadow-xl cursor-pointer select-none transition-all
        ${getCardStyle()}
        ${card.rarity === 'Rare' ? 'ring-1 ring-bento-gold/50' : ''}
        ${disabled ? 'opacity-30 grayscale cursor-not-allowed shadow-none' : 'opacity-100 hover:shadow-2xl'}
      `}
    >
      <div className="flex items-start gap-1.5 mb-1 min-h-[28px]">
        <div className="w-6 h-6 md:w-7 md:h-7 flex-shrink-0 bg-bento-energy rounded-full flex items-center justify-center text-black font-black text-xs md:text-sm border-2 border-white shadow-sm">
          {card.cost < 0 ? 'X' : card.cost}
        </div>
        <span className="text-white font-bold text-[8px] md:text-[9px] uppercase leading-tight line-clamp-2 break-words pt-0.5 md:pt-1">{card.name}</span>
      </div>

      <div className="h-16 bg-slate-800 rounded mb-2 flex items-center justify-center border border-white/5">
        <div className="text-white/20">{getIcon()}</div>
      </div>

      <div className="bg-black/20 rounded p-1.5 h-12 flex flex-col justify-center border border-white/5">
        <p className="text-bento-text-dim text-[9px] leading-tight text-center font-medium">
          {card.description}
        </p>
      </div>

      <div className="absolute bottom-1.5 left-2">
        <span className="text-[7px] uppercase tracking-widest text-white/40 font-bold">
          {card.type === 'Attack' ? 'Támadás' : card.type === 'Skill' ? 'Törvény' : card.type === 'Power' ? 'Rendelet' : 'Átok'}
        </span>
      </div>
    </motion.div>
  );
};

export default CardComponent;
