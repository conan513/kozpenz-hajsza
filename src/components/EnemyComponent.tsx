import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Enemy } from '../types';
import { Shield, Sword, ChevronUp, ChevronDown, Skull } from 'lucide-react';
import { SpriteRenderer } from './SpriteRenderer';
import { StatusEffectList } from './StatusEffects';

interface EnemyComponentProps {
  enemy: Enemy;
  playerStatusEffects?: { type: string; stacks: number }[];
  onClick?: (id: string) => void;
  onHover: (e: React.MouseEvent, title: string, description: string) => void;
  onLeave: () => void;
}

const EnemyComponent: React.FC<EnemyComponentProps> = React.memo(({
  enemy, playerStatusEffects = [], onClick, onHover, onLeave,
}) => {
  const hpPct = Math.max(0, (enemy.hp / enemy.maxHp) * 100);
  const baseName = enemy.name.replace(/ [A-Z]$/, '');

  const [isHurt, setIsHurt] = useState(false);
  const [isDead, setIsDead] = useState(false);
  const prevHp = React.useRef(enemy.hp);

  // Detect damage taken
  useEffect(() => {
    if (enemy.hp < prevHp.current && enemy.hp > 0) {
      setIsHurt(true);
      const t = setTimeout(() => setIsHurt(false), 380);
      prevHp.current = enemy.hp;
      return () => clearTimeout(t);
    }
    if (enemy.hp <= 0 && !isDead) {
      setIsDead(true);
    }
    prevHp.current = enemy.hp;
  }, [enemy.hp]);

  // HP bar colour
  const hpBarClass =
    hpPct > 55 ? 'hp-bar-high' :
    hpPct > 25 ? 'hp-bar-medium' :
                 'hp-bar-low';

  // Calculate displayed intent value
  const intentValue = enemy.intent?.value || 0;
  let displayValue = intentValue;
  if (enemy.intent?.type === 'Attack') {
    if ((enemy.statusEffects || []).find(s => s.type === 'Weak'))          displayValue = Math.floor(displayValue * 0.75);
    if ((playerStatusEffects || []).find(s => s.type === 'Vulnerable'))    displayValue = Math.floor(displayValue * 1.5);
  }

  const intentIsAttack = enemy.intent?.type === 'Attack';

  return (
    <div
      className="flex flex-col items-center gap-3 cursor-crosshair transition-transform hover:scale-105"
      onClick={() => onClick?.(enemy.id)}
    >
      {/* Intent badge */}
      <motion.div
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        className={`bg-black/85 border rounded-lg px-3 py-1.5 flex items-center gap-2 shadow-lg z-10
          ${intentIsAttack ? 'border-red-500/60 intent-attack' : 'border-white/20'}`}
      >
        {intentIsAttack && (
          <div className="flex items-center gap-1 text-red-400 font-black text-sm">
            <Sword size={13} />
            <span>{displayValue}</span>
          </div>
        )}
        {enemy.intent?.type === 'Defend' && (
          <div className="flex items-center gap-1 text-blue-400 font-bold text-sm">
            <Shield size={13} />
            <span>{enemy.intent.value}</span>
          </div>
        )}
        {enemy.intent?.type === 'Buff' && (
          <div className="text-green-400 font-bold flex items-center gap-1 text-sm">
            <ChevronUp size={16} /> Buff
          </div>
        )}
        {(enemy.intent?.type === 'Debuff' || enemy.intent?.type === 'Curse') && (
          <div className="text-purple-400 font-bold flex items-center gap-1 text-sm">
            <ChevronDown size={16} /> Debuff
          </div>
        )}
      </motion.div>

      {/* Sprite */}
      <div className="relative">
        <motion.div
          key={`sprite-${enemy.id}`}
          className="w-28 h-28 md:w-40 md:h-40 flex items-center justify-center relative group"
        >
          <div className="absolute inset-0 rounded-full blur-2xl transition-all"
            style={{ background: intentIsAttack ? 'rgba(239,68,68,0.08)' : 'rgba(59,130,246,0.06)' }} />
          <div
            className="w-24 h-24 md:w-36 md:h-36 drop-shadow-[0_0_18px_rgba(0,0,0,0.9)]"
            onMouseEnter={(e) => onHover(e, enemy.name, `HP: ${enemy.hp}/${enemy.maxHp}`)}
            onMouseLeave={onLeave}
          >
            <SpriteRenderer type={baseName} isEnemy={true} isHurt={isHurt} isDead={isDead} />
          </div>
          {/* Status effects */}
          <div className="absolute top-0 left-0 z-10 w-full pr-4">
            <StatusEffectList effects={enemy.statusEffects} onHover={onHover} onLeave={onLeave} />
          </div>
        </motion.div>

        {/* Death overlay */}
        <AnimatePresence>
          {isDead && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
            >
              <Skull size={40} className="text-red-600 drop-shadow-[0_0_20px_rgba(220,38,38,0.8)]" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Name + HP bar */}
      <div className="w-40 md:w-56">
        <div className="flex justify-between items-end mb-1 px-1">
          <span className="text-white font-bold text-[10px] md:text-sm uppercase tracking-tight truncate max-w-[120px]">
            {enemy.name}
          </span>
          <div className="flex items-center gap-2 flex-shrink-0">
            {enemy.block > 0 && (
              <div className="bg-bento-block/80 px-1.5 py-0.5 rounded border border-blue-400/30 flex items-center gap-1">
                <Shield size={9} className="text-white fill-white" />
                <span className="text-white font-bold text-[9px]">{enemy.block}</span>
              </div>
            )}
            <span className="text-bento-text-dim font-mono text-[10px]">{enemy.hp}/{enemy.maxHp}</span>
          </div>
        </div>
        <div className="h-3 w-full bg-slate-900 rounded-full border border-bento-border overflow-hidden shadow-inner">
          <motion.div
            initial={{ width: '100%' }}
            animate={{ width: `${hpPct}%` }}
            transition={{ type: 'spring', stiffness: 120, damping: 20 }}
            className={`h-full rounded-full ${hpBarClass}`}
          />
        </div>
      </div>
    </div>
  );
});

export default EnemyComponent;
