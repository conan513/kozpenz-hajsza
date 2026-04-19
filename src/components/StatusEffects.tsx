import React from 'react';
import { StatusEffect } from '../types';
import { Sword, Shield, Zap, TrendingUp, TrendingDown, Info, ArrowDownNarrowWide } from 'lucide-react';

interface StatusEffectProps {
  effect: StatusEffect;
  onHover: (e: React.MouseEvent, title: string, description: string) => void;
  onLeave: () => void;
}

const EFFECT_DATA: Record<StatusEffect['type'], { name: string, description: string, icon: React.ReactNode, color: string }> = {
  Strength: {
    name: 'Befolyás (Erő)',
    description: 'Növeli az összes támadásod sebzését annyival, amennyi a jelző száma.',
    icon: <Sword size={10} />,
    color: 'text-red-400 border-red-400/30'
  },
  Weak: {
    name: 'Gyengeség',
    description: 'A karakter 25%-kal kevesebb sebzést okoz a támadásaival.',
    icon: <Sword size={10} className="rotate-180" />,
    color: 'text-gray-400 border-gray-400/30'
  },
  Vulnerable: {
    name: 'Sebezhetőség',
    description: 'A karakter 50%-kal több sebzést kap a támadásokból.',
    icon: <Shield size={10} className="text-red-500" />,
    color: 'text-red-500 border-red-500/30'
  },
  Dexterity: {
    name: 'Ügyesség',
    description: 'Növeli az összes védekező kártyád Cenzúra értékét annyival, amennyi a jelző száma.',
    icon: <Shield size={10} />,
    color: 'text-green-400 border-green-400/30'
  },
  Frail: {
    name: 'Törékenység',
    description: 'A karakter 25%-kal kevesebb Cenzúrát (védelmet) nyer a kártyákból.',
    icon: <Shield size={10} className="opacity-50" />,
    color: 'text-yellow-600 border-yellow-600/30'
  },
  Poison: {
    name: 'Infláció (DoT)',
    description: 'Kör elején sebzi a karaktert annyival, amennyi a jelző száma, majd 1-gyel csökken.',
    icon: <TrendingUp size={10} />,
    color: 'text-purple-400 border-purple-400/30'
  }
};

export const StatusEffectBadge: React.FC<StatusEffectProps> = ({ effect, onHover, onLeave }) => {
  const data = EFFECT_DATA[effect.type];
  
  return (
    <div 
      onMouseEnter={(e) => onHover(e, data.name, data.description)}
      onMouseLeave={onLeave}
      className={`flex items-center gap-1 bg-black/80 px-1.5 py-0.5 rounded border ${data.color} cursor-help transition-colors hover:bg-black`}
    >
      <span className="flex-shrink-0">{data.icon}</span>
      <span className="text-[10px] font-bold text-white">{effect.stacks}</span>
    </div>
  );
};

export const StatusEffectList: React.FC<{
  effects: StatusEffect[];
  onHover: (e: React.MouseEvent, title: string, description: string) => void;
  onLeave: () => void;
  className?: string;
}> = ({ effects, onHover, onLeave, className = "" }) => {
  if (!effects || effects.length === 0) return null;

  return (
    <div className={`flex flex-wrap gap-1 ${className}`}>
      {effects.map((s, i) => (
        <StatusEffectBadge 
          key={`${s.type}-${i}`} 
          effect={s} 
          onHover={onHover} 
          onLeave={onLeave} 
        />
      ))}
    </div>
  );
};
