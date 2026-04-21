import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Enemy } from '../types';
import { Shield, Sword, ChevronUp, ChevronDown } from 'lucide-react';
import { SpriteRenderer } from './SpriteRenderer';
import { StatusEffectList } from './StatusEffects';

interface EnemyComponentProps {
  enemy: Enemy;
  playerStatusEffects?: { type: string, stacks: number }[];
  onClick?: () => void;
  onHover: (e: React.MouseEvent, title: string, description: string) => void;
  onLeave: () => void;
}

const EnemyComponent: React.FC<EnemyComponentProps> = ({ enemy, playerStatusEffects = [], onClick, onHover, onLeave }) => {
  const hpPercentage = (enemy.hp / enemy.maxHp) * 100;
  // Strip ' A', ' B', etc. suffix that was added for multiples to get base name
  const baseName = enemy.name.replace(/ [A-Z]$/, '');

  const intentValue = enemy.intent?.value || 0;
  let displayValue = intentValue;
  
  if (enemy.intent?.type === 'Attack') {
     const isWeak = !!(enemy.statusEffects || []).find(s => s.type === 'Weak');
     if (isWeak) displayValue = Math.floor(displayValue * 0.75);
     const isVuln = !!(playerStatusEffects || []).find(s => s.type === 'Vulnerable');
     if (isVuln) displayValue = Math.floor(displayValue * 1.5);
  }

  return (
    <div className="flex flex-col items-center gap-4 cursor-crosshair transition-transform hover:scale-105" onClick={onClick}>
      {/* Intent Indicator */}
      <motion.div 
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="bg-black/80 border border-white/20 rounded-lg px-3 py-1 flex items-center gap-2 shadow-lg z-10"
      >
        {enemy.intent?.type === 'Attack' && <div className="flex items-center gap-1 text-red-500 font-bold"><Sword size={14} /> {displayValue}</div>}
        {enemy.intent?.type === 'Defend' && <div className="flex items-center gap-1 text-blue-500 font-bold"><Shield size={14} /> {enemy.intent.value}</div>}
        {enemy.intent?.type === 'Buff' && <div className="text-green-500 font-bold flex items-center gap-1"><ChevronUp size={18} /></div>}
        {(enemy.intent?.type === 'Debuff' || enemy.intent?.type === 'Curse') && <div className="text-red-500 font-bold flex items-center gap-1"><ChevronDown size={18} /></div>}
      </motion.div>


      {/* Enemy Sprite */}
      <motion.div
        key={enemy.hp}
        animate={{ scale: [1, 1.05, 1], x: [0, -2, 2, 0] }}
        transition={{ duration: 0.2 }}
        className="w-32 h-32 md:w-48 md:h-48 bg-slate-800/20 border-bento-border flex items-center justify-center relative group"
      >
        <div className="absolute inset-0 bg-red-900/0 group-hover:bg-red-900/20 rounded-full blur-xl transition-all" />
        
        <div className="w-24 h-24 md:w-40 md:h-40 drop-shadow-[0_0_15px_rgba(0,0,0,0.8)]">
          <SpriteRenderer type={baseName} isEnemy={true} />
        </div>
        
        {/* Status Effects */}
        <div className="absolute top-2 left-2 z-10 w-full pr-4">
          <StatusEffectList 
            effects={enemy.statusEffects} 
            onHover={onHover} 
            onLeave={onLeave} 
          />
        </div>
      </motion.div>

      {/* Health Bar */}
      <div className="w-48 md:w-64">
        <div className="flex justify-between items-end mb-1 px-1">
          <span className="text-white font-bold text-[10px] md:text-sm uppercase tracking-tight">{enemy.name}</span>
          <div className="flex items-center gap-2">
            {enemy.block > 0 && (
              <div className="bg-bento-block px-2 py-0.5 rounded border border-white/20 flex items-center gap-1">
                <Shield size={10} className="text-white fill-white" />
                <span className="text-white font-bold text-[10px]">{enemy.block}</span>
              </div>
            )}
            <span className="text-bento-text-dim font-mono text-xs">{enemy.hp}/{enemy.maxHp}</span>
          </div>
        </div>
        <div className="h-3 w-full bg-slate-900 rounded-full border border-bento-border overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${hpPercentage}%` }}
            className="h-full bg-bento-accent"
          />
        </div>
      </div>
    </div>
  );
};

export default EnemyComponent;
