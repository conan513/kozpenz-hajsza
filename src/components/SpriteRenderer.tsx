import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const PALETTE: Record<string, string> = {
  d: '#0d0d12',
  w: '#f8fafc',
  W: '#94a3b8',
  r: '#ef4444',
  R: '#7f1d1d',
  g: '#10b981',
  G: '#065f46',
  b: '#3b82f6',
  B: '#1e3a8a',
  c: '#06b6d4',
  p: '#a855f7',
  v: '#312e81',
  s: '#0ea5e9',
  O: '#d97706',
  Y: '#facc15',
  n: '#78716c',
  '.': 'transparent',
};

const SPRITE_DATA: Record<string, string[]> = {
  'Diáktüntető': [
    "....dddd....",
    "...dWrrWd...",
    "..dWwrRwWd..",
    "..dWwrrwWd..",
    "...dddddd...",
    "..drrrrrd...",
    ".drRwwwRrd..",
    ".drrrrrRrd..",
    "..ddrrrdd...",
    "..dr...rd...",
    "..dd...dd...",
    "............",
  ],
  'Oknyomozó': [
    "....nnnn....",
    "...nggggn...",
    "..ngwwgggn..",
    "..ngwggggn..",
    "..nggggggn..",
    "...nnnnnn...",
    "..ngGGGGgn..",
    ".nWgGGGGgWn.",
    ".nWwgGGgwWn.",
    "..nn.G.nn...",
    "....G.G.....",
    "............",
  ],
  'Civil Aktivista': [
    "....dddd....",
    "...dbbbbd...",
    "..dbwwwcbd..",
    "..dbwccbbd..",
    "...dddddd...",
    "..w.bBBb.w..",
    "..wdBcccBdw.",
    "..d.bBBb.d..",
    "...dBcBBd...",
    "...dbBBbd...",
    "...dd..dd...",
    "............",
  ],
  'Független Politikus': [
    ".....YY.....",
    "....YppYY...",
    "...ppppppp..",
    "...pwwwwwp..",
    "....ppppp...",
    "..dpppppd...",
    ".dwppWpppwd.",
    "..ddppppdd..",
    "...dpppppd..",
    "...p.....p..",
    "...d.....d..",
    "............",
  ],
  'Digitális Ellenálló': [
    "....vvvv....",
    "...vbbcbv...",
    "..vbcwwwcv..",
    "..vvbcbcvv..",
    "....vvvv....",
    "...dpppppd..",
    "..ddpvvvpdd.",
    "..dpvvvvvpd.",
    "...dppppppd.",
    "....pp..pp..",
    "...v.....v..",
    "............",
  ],
  Infláció: [
    "............",
    "....ssss....",
    "...ssssss...",
    "..swwssssss.",
    ".sswssGssss.",
    ".ssssssssss.",
    ".dssssssssd.",
    "..ddssssdd..",
    "...dssssd...",
    "....ssss....",
    "............",
    "............",
  ],
  'Plakát-mágus': [
    "............",
    "...RddddR...",
    "..RwRYYRwR..",
    ".RRrYRRrYRR.",
    ".RRRrRYRrRR.",
    ".RRdrrrrdRR.",
    "..RRddddRR..",
    "...RRRRRR...",
    "....RRRR....",
    "............",
    "............",
    "............",
  ],
  'Gázszerelő': [
    "....nnnn....",
    "...nbbbbnd..",
    "..nbwwwwbnd.",
    "..nbbbbbbn..",
    "...nnnnnn...",
    "...ncccccn..",
    "..ncccccccn.",
    "..nccBBBccn.",
    "...ncccccn..",
    "....n..n....",
    "...n....n...",
    "............",
  ],
  'Kádervadász': [
    "....WWWW....",
    "...WddddW...",
    "..WdwwwwdW..",
    "..WdwWwwdW..",
    "...WWWWWW...",
    "...dWWWWd...",
    "..dWWBBWWd..",
    "..dWWWWWWd..",
    "...dWWWWd...",
    "....W..W....",
    "...W....W...",
    "............",
  ],
  'A Propagandagépezet': [
    "....cccc....",
    "...ccssBcc..",
    "..ccsssscc..",
    "..ccwccwcc..",
    "...ccsscc...",
    "..ccssccc...",
    ".cccsssscc..",
    "cccccccccccc",
    "...cc..cc...",
    "..cc....cc..",
    ".cc......cc.",
    "............",
  ],
  'A Megállíthatatlan Rezsidémon': [
    "....RRRR....",
    "...RROORR...",
    "..RROOOÖRR..",
    "..RRORRORR..",
    "...RRRRRR...",
    "...ROOOOR...",
    "..ROOOOOÖR..",
    "..ROOOOOOR..",
    "...ROOOOR...",
    "....R..R....",
    "...R....R...",
    "............",
  ],
  'Megafon Troll': [
    "............",
    "....nnnn....",
    "...nddddn...",
    "..ndwwwwdn..",
    "...nnnnnn...",
    "...nrrrrn...",
    "..nnrrrrnn..",
    "..nrYYYYrn..",
    "...nrrrrrn..",
    "....rr.rr...",
    "...n.....n..",
    "............",
  ],
  Unknown: [
    "............",
    "...WWWWWW...",
    "..WWddddWW..",
    ".WWdWwwWdWW.",
    ".WWddddddWW.",
    ".WWWWWWWWWW.",
    ".WWWWWWWWWW.",
    ".WWdWWWWdWW.",
    "..WWdWWdWW..",
    "...WWWWWW...",
    "............",
    "............",
  ],
};

interface SpriteRendererProps {
  type: string;
  className?: string;
  isEnemy?: boolean;
  isAttacking?: boolean;
  isHurt?: boolean;
  isDead?: boolean;
}

/**
 * Pixel art-ot renderelő komponens optimalizált SVG path-okkal.
 */
export const SpriteRenderer: React.FC<SpriteRendererProps> = React.memo(({
  type, className = '', isEnemy = false, isAttacking = false, isHurt = false, isDead = false,
}) => {
  const data = SPRITE_DATA[type] || SPRITE_DATA['Unknown'] || [];
  
  const { width, height, pathsByColor } = useMemo(() => {
    if (!data || data.length === 0) return { width: 0, height: 0, pathsByColor: {} };
    
    const w = data[0]?.length || 1;
    const h = data.length || 1;
    const colors: Record<string, string> = {};

    data.forEach((row, y) => {
      row.split('').forEach((char, x) => {
        if (char !== '.' && PALETTE[char]) {
          if (!colors[char]) colors[char] = '';
          // Megadunk egy 1.05-ös szélességet, hogy ne legyen rés a "pixelek" között
          colors[char] += `M${x} ${y}h1.05v1.05h-1.05z `;
        }
      });
    });

    return { width: w, height: h, pathsByColor: colors };
  }, [type]);

  if (width === 0) return null;

  const attackAnim = isAttacking
    ? { x: isEnemy ? [0, -20, 0] : [0, 20, 0], transition: { duration: 0.25 } }
    : {};

  const hurtClass = isHurt ? 'hurt-flash' : '';
  const deadClass = isDead ? 'pixel-death' : '';

  return (
    <AnimatePresence>
      {!isDead ? (
        <motion.div
          className={`relative flex items-center justify-center ${className} ${hurtClass}`}
          style={{ width: '100%', height: '100%' }}
          animate={
            isAttacking ? attackAnim :
            isHurt ? { x: [-4, 4, -4, 4, 0], transition: { duration: 0.3 } } :
            { y: [-3, 3, -3], scaleY: [1, 0.96, 1], scaleX: [1, 1.02, 1] }
          }
          transition={
            isAttacking || isHurt ? {} :
            { duration: 2 + Math.random() * 0.5, repeat: Infinity, ease: 'easeInOut' }
          }
        >
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-full drop-shadow-xl"
            style={{ transform: isEnemy ? 'scaleX(-1)' : 'none', overflow: 'visible' }}
          >
            <g filter="url(#global-glow)">
               {Object.entries(pathsByColor).map(([char, pathData]) => (
                 <path
                   key={char}
                   d={pathData}
                   fill={PALETTE[char]}
                   filter={isHurt ? 'url(#hurt-filter)' : undefined}
                 />
               ))}
            </g>
          </svg>
        </motion.div>
      ) : (
        <motion.div
          className={`relative flex items-center justify-center ${className} ${deadClass}`}
          style={{ width: '100%', height: '100%' }}
          initial={{ opacity: 1 }}
          animate={{ opacity: 0, scale: 0.5, rotate: 20, y: 20 }}
          transition={{ duration: 0.7, ease: 'easeIn' }}
        >
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full"
            style={{ transform: isEnemy ? 'scaleX(-1)' : 'none' }}>
            <g opacity="0.4">
               {Object.entries(pathsByColor).map(([char, pathData]) => (
                 <path key={char} d={pathData} fill={PALETTE[char]} />
               ))}
            </g>
          </svg>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

