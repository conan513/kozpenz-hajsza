import React, { useState } from 'react';
import { motion } from 'motion/react';
import { RewardState, Card, Relic } from '../types';
import { Coins, Zap, Layers, ChevronRight } from 'lucide-react';
import CardComponent from './CardComponent';

interface RewardViewProps {
  reward: RewardState;
  onCollectGold: () => void;
  onCollectRelic: (relic: Relic) => void;
  onChooseCard: (card: Card) => void;
  onSkip: () => void;
  hasCollectedGold: boolean;
  hasCollectedRelic: boolean;
  onHover: (e: React.MouseEvent, title: string, description: string) => void;
  onLeave: () => void;
}

const RewardView: React.FC<RewardViewProps> = ({ 
  reward, 
  onCollectGold, 
  onCollectRelic, 
  onChooseCard, 
  onSkip,
  hasCollectedGold,
  hasCollectedRelic,
  onHover,
  onLeave
}) => {
  const [showCardSelect, setShowCardSelect] = useState(false);

  if (showCardSelect) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 bg-bento-bg">
        <h2 className="text-2xl md:text-4xl font-black italic mb-8 md:mb-12 tracking-tighter text-center">VÁLASSZ KÁRTYÁT</h2>
        <div className="flex flex-wrap justify-center gap-4 md:gap-6 mb-8 md:mb-12">
          {reward.cards.map((card) => (
            <CardComponent 
              key={card.id} 
              card={card} 
              onClick={() => onChooseCard(card)} 
            />
          ))}
        </div>
        <button 
          onClick={() => setShowCardSelect(false)}
          className="text-bento-text-dim hover:text-white uppercase tracking-widest text-sm font-bold"
        >
          Mégse
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 bg-bento-bg">
      <div className="bento-panel max-w-xl w-full p-4 md:p-8 flex flex-col gap-4 md:gap-6">
        <h2 className="text-2xl md:text-3xl font-black italic text-center mb-2 md:mb-4">FÖLDCSUSZAMLÁSSZERŰ GYŐZELEM</h2>
        
        <div className="flex flex-col gap-3">
          {/* Gold Reward */}
          <motion.button
            whileHover={{ x: 5 }}
            disabled={hasCollectedGold}
            onClick={onCollectGold}
            className={`flex items-center justify-between p-4 bento-panel transition-all ${hasCollectedGold ? 'opacity-30' : 'hover:border-bento-gold'}`}
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center">
                <Coins size={20} className="text-bento-gold" />
              </div>
              <span className="font-bold">{reward.gold} Közpénz</span>
            </div>
            {!hasCollectedGold && <ChevronRight size={16} className="text-bento-text-dim" />}
          </motion.button>

          {/* Relic Reward */}
          {reward.relic && (
            <motion.button
              whileHover={{ x: 5 }}
              disabled={hasCollectedRelic}
              onClick={() => onCollectRelic(reward.relic!)}
              onMouseEnter={(e) => onHover(e, reward.relic!.name, reward.relic!.description)}
              onMouseLeave={onLeave}
              className={`flex items-center justify-between p-4 bento-panel transition-all ${hasCollectedRelic ? 'opacity-30' : 'hover:border-bento-energy'}`}
            >
              <div className="flex items-center gap-4 text-left">
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center">
                  <Zap size={20} className="text-bento-energy" />
                </div>
                <div>
                   <div className="font-bold">{reward.relic.name}</div>
                   <div className="text-[10px] text-bento-text-dim uppercase">{reward.relic.description}</div>
                </div>
              </div>
              {!hasCollectedRelic && <ChevronRight size={16} className="text-bento-text-dim" />}
            </motion.button>
          )}

          {/* Card Choice */}
          <motion.button
            whileHover={{ x: 5 }}
            onClick={() => setShowCardSelect(true)}
            className="flex items-center justify-between p-4 bento-panel hover:border-blue-400 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center">
                <Layers size={20} className="text-blue-400" />
              </div>
              <span className="font-bold">Új törvényjavaslat benyújtása</span>
            </div>
            <ChevronRight size={16} className="text-bento-text-dim" />
          </motion.button>
        </div>

        <button 
          onClick={onSkip}
          className="mt-4 px-8 py-3 bento-panel font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all"
        >
          Tovább
        </button>
      </div>
    </div>
  );
};

export default RewardView;
