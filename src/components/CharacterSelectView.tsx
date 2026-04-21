import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CharacterDefinition } from '../constants';
import { Heart, Coins, Zap } from 'lucide-react';
import { SpriteRenderer } from './SpriteRenderer';

interface CharacterSelectViewProps {
  characters: CharacterDefinition[];
  onSelect: (char: CharacterDefinition) => void;
}

const CLASS_THEME: Record<string, { accent: string; glow: string; bg: string }> = {
  'Diáktüntető':       { accent: '#ef4444', glow: '0 0 30px rgba(239,68,68,0.4)',   bg: 'from-[#2A0808] to-[#1a0808]' },
  'Oknyomozó':         { accent: '#10b981', glow: '0 0 30px rgba(16,185,129,0.4)',  bg: 'from-[#082A14] to-[#061a0c]' },
  'Civil Aktivista':   { accent: '#3b82f6', glow: '0 0 30px rgba(59,130,246,0.4)',  bg: 'from-[#082040] to-[#061228]' },
  'Független Politikus':{ accent: '#a855f7', glow: '0 0 30px rgba(168,85,247,0.4)', bg: 'from-[#1a0830] to-[#100520]' },
  'Digitális Ellenálló':{ accent: '#06b6d4', glow: '0 0 30px rgba(6,182,212,0.4)',  bg: 'from-[#082028] to-[#041318]' },
};

const CharacterSelectView: React.FC<CharacterSelectViewProps> = React.memo(({ characters, onSelect }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div className="flex flex-col items-center justify-center min-h-[90vh] md:min-h-0 py-8">
      <motion.h2
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-2xl md:text-4xl font-black italic mb-2 tracking-tighter text-white text-center"
      >
        VÁLASSZ KÉPVISELŐT
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-bento-text-dim text-xs uppercase tracking-widest mb-8 md:mb-12"
      >
        Mindegyiknek megvan a maga útja a túléléshez
      </motion.p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6 max-w-7xl w-full px-2">
        {characters.map((char, index) => {
          const theme = CLASS_THEME[char.class] || { accent: '#d4af37', glow: '', bg: 'from-[#1a0f0f] to-[#0d0707]' };
          const isHovered = hoveredIndex === index;

          return (
            <motion.div
              key={char.class}
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.1, type: 'spring', stiffness: 280, damping: 22 }}
              whileHover={{ y: -12 }}
              onClick={() => onSelect(char)}
              onHoverStart={() => setHoveredIndex(index)}
              onHoverEnd={() => setHoveredIndex(null)}
              className="bento-panel flex flex-col items-center cursor-pointer group overflow-hidden relative"
              style={{
                borderColor: isHovered ? theme.accent : undefined,
                boxShadow: isHovered ? theme.glow : undefined,
                transition: 'border-color 0.2s, box-shadow 0.2s',
              }}
            >
              {/* Sprite area */}
              <div className={`w-full h-48 mb-0 flex items-center justify-center border-b relative overflow-hidden bg-gradient-to-b ${theme.bg}`}
                style={{ borderColor: `${theme.accent}22` }}>
                {/* Ambient glow behind sprite */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-24 h-24 rounded-full blur-2xl"
                    style={{ background: `${theme.accent}22`, opacity: isHovered ? 1 : 0.4, transition: 'opacity 0.3s' }} />
                </div>
                {/* Sprite */}
                <div className="w-28 h-28 relative z-10 drop-shadow-xl">
                  <SpriteRenderer type={char.class} />
                </div>
                {/* Gradient fade at bottom */}
                <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-bento-panel to-transparent" />
              </div>

              <div className="px-4 pb-5 pt-4 flex flex-col items-center text-center w-full">
                <h3
                  className="text-xl font-black italic mb-1 transition-colors"
                  style={{ color: isHovered ? theme.accent : 'white' }}
                >
                  {char.class}
                </h3>
                <p className="text-[10px] text-bento-text-dim uppercase mb-4 leading-tight h-12 overflow-hidden">
                  {char.description}
                </p>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-2 w-full mb-3">
                  <div className="bg-black/30 p-2 rounded flex flex-col items-center border border-white/5">
                    <div className="flex items-center gap-1 mb-0.5">
                      <Heart size={9} style={{ color: theme.accent }} />
                      <span className="text-[8px] uppercase font-bold text-bento-text-dim">Népszerűség</span>
                    </div>
                    <span className="text-lg font-mono font-bold leading-none" style={{ color: theme.accent }}>
                      {char.maxHp}
                    </span>
                  </div>
                  <div className="bg-black/30 p-2 rounded flex flex-col items-center border border-white/5">
                    <div className="flex items-center gap-1 mb-0.5">
                      <Coins size={9} className="text-bento-gold" />
                      <span className="text-[8px] uppercase font-bold text-bento-text-dim">Közpénz</span>
                    </div>
                    <span className="text-lg font-mono font-bold leading-none text-bento-gold">{char.gold}</span>
                  </div>
                </div>

                {/* Relic */}
                <div className="w-full bento-panel py-2 px-3 bg-black/30 text-left">
                  <div className="flex items-center gap-1 mb-0.5">
                    <Zap size={9} style={{ color: theme.accent }} />
                    <span className="text-[8px] uppercase font-bold" style={{ color: theme.accent }}>
                      Kiváltság: {char.relic.name}
                    </span>
                  </div>
                  <p className="text-[9px] text-white/60 leading-tight italic">{char.relic.description}</p>
                </div>

                {/* Select button (shows on hover) */}
                <AnimatePresence>
                  {isHovered && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="w-full mt-3"
                    >
                      <div
                        className="w-full py-2 rounded font-black text-xs uppercase tracking-widest text-center"
                        style={{ background: theme.accent, color: '#1a0800' }}
                      >
                        Kiválasztás →
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
});

export default CharacterSelectView;
