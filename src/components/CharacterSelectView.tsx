import React from 'react';
import { motion } from 'motion/react';
import { CharacterDefinition } from '../constants';
import { Shield, Sword, Zap, Heart, Coins } from 'lucide-react';

interface CharacterSelectViewProps {
  characters: CharacterDefinition[];
  onSelect: (char: CharacterDefinition) => void;
}

const CharacterSelectView: React.FC<CharacterSelectViewProps> = ({ characters, onSelect }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[90vh] md:min-h-0 py-8">
      <motion.h2 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-2xl md:text-4xl font-black italic mb-8 md:mb-12 tracking-tighter text-white text-center"
      >
        VÁLASSZ KÉPVISELŐT
      </motion.h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6 max-w-7xl w-full px-2">
        {characters.map((char, index) => (
          <motion.div
            key={char.class}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -10 }}
            onClick={() => onSelect(char)}
            className="bento-panel flex flex-col items-center cursor-pointer group hover:border-white transition-all overflow-hidden"
          >
            <div className={`w-full h-48 mb-4 bg-slate-800 flex items-center justify-center border-b border-white/5 relative overflow-hidden`}>
               <div className="text-white/5 font-black text-8xl transition-all group-hover:scale-110 group-hover:rotate-6">{char.class[0]}</div>
               <div className="absolute inset-0 bg-gradient-to-t from-bento-panel to-transparent" />
            </div>

            <div className="px-5 pb-6 flex flex-col items-center text-center">
              <h3 className="text-2xl font-black italic mb-2 group-hover:text-bento-accent transition-colors">{char.class}</h3>
              <p className="text-[10px] text-bento-text-dim uppercase mb-4 leading-tight h-12 overflow-hidden">{char.description}</p>
              
              <div className="grid grid-cols-2 gap-2 w-full mb-4">
                <div className="bg-slate-900/50 p-2 rounded flex flex-col items-center border border-white/5">
                  <div className="flex items-center gap-1 mb-1">
                    <Heart size={10} className="text-bento-accent" />
                    <span className="text-[8px] uppercase font-bold text-bento-text-dim text-white/40">Népszerűség</span>
                  </div>
                  <span className="text-lg font-mono font-bold leading-none">{char.maxHp}</span>
                </div>
                <div className="bg-slate-900/50 p-2 rounded flex flex-col items-center border border-white/5">
                  <div className="flex items-center gap-1 mb-1">
                    <Coins size={10} className="text-bento-gold" />
                    <span className="text-[8px] uppercase font-bold text-bento-text-dim text-white/40">Közpénz</span>
                  </div>
                  <span className="text-lg font-mono font-bold leading-none">{char.gold}</span>
                </div>
              </div>

              <div className="w-full bento-panel py-3 px-4 bg-slate-900/30 text-left">
                <div className="text-[8px] uppercase font-bold text-bento-text-dim mb-1 flex items-center gap-1">Kiváltság: <span className="text-white">{char.relic.name}</span></div>
                <p className="text-[9px] text-white/60 leading-tight italic">{char.relic.description}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default CharacterSelectView;
