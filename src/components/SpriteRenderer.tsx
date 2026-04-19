import React from 'react';
import { motion } from 'motion/react';

const PALETTE: Record<string, string> = {
  d: '#111827', // Dark outline/base
  w: '#f8fafc', // White/Light
  W: '#94a3b8', // Silver
  r: '#ef4444', // Red
  R: '#7f1d1d', // Dark Red
  g: '#10b981', // Green
  b: '#3b82f6', // Blue
  c: '#06b6d4', // Cyan
  p: '#a855f7', // Purple
  v: '#312e81', // Deep Void Purple
  s: '#0ea5e9', // Slime Teal
  O: '#d97706', // Orange
  Y: '#facc15', // Yellow
  '.': 'transparent'
};

const SPRITE_DATA: Record<string, string[]> = {
  'Diáktüntető' : [
    "....dddd....",
    "...dwrrwd...",
    "..dwwRRwwd..",
    "..dwwrrwwd..",
    "...dddddd...",
    "...wrrrrw...",
    "..dwRRRRwd..",
    "..ddrrrrdd..",
    "...drrrr....",
    "..drr..rr...",
    "..dd....dd..",
    "............"
  ],
  'Oknyomozó': [
    "....dddd....",
    "...dggggd...",
    "..dggggggd..",
    "..dgwwgggd..",
    "..dggggggd..",
    "...dddddd...",
    "...dgggd....",
    ".dw.dgd.wd..",
    ".dwwdgdwwd..",
    "..dd.g.dd...",
    "....d.d.....",
    "............"
  ],
  'Civil Aktivista': [
    "....dddd....",
    "...dbbbbd...",
    "..dbwwwcbd..",
    "..dbbccbbd..",
    "...dddddd...",
    "..w.bbbb.w..",
    "..wdccccdw..",
    "..d.bbbb.d..",
    "...dccccd...",
    "...dbbbc....",
    "....d.d.....",
    "............"
  ],
  'Független Politikus': [
    ".....YY.....",
    "....YppY....",
    "...pppppp...",
    "...pwwwwp...",
    "....pppp....",
    "...dppppd...",
    "..dwppppwd..",
    "..ddppppdd..",
    "...dppppd...",
    "...p....p...",
    "...d....d...",
    "............"
  ],
  'Digitális Ellenálló': [
    "....vvvv....",
    "...vppbpv...",
    "..vppwwwpv..",
    "..vvppbpvv..",
    "....vvvv....",
    "...dppppd...",
    "..ddpvvpdd..",
    "..dpvvvvpd..",
    "...dppppd...",
    "....pp.p....",
    "...v....v...",
    "............"
  ],
  Infláció: [
    "............",
    "............",
    "....ssss....",
    "...ssssss...",
    "..swwsssss..",
    ".sswssgssss.",
    ".ssssssssss.",
    ".dssssssssd.",
    "..dddddddd..",
    "............",
    "............",
    "............"
  ],
  'Plakát-mágus': [
    "............",
    "............",
    "...RddddR...",
    "..RwRYYRWR..",
    ".RRrYRRrYRR.",
    ".RRRrRYRrRR.",
    ".RRdrrrrdRR.",
    "..RRddddRR..",
    "...RRRRRR...",
    "............",
    "............",
    "............"
  ],
  'Gázszerelő': [
    "....dddd....",
    "...dbbbbd...",
    "..dbwwwwbd..",
    "..dbbbbbbd..",
    "...dddddd...",
    "...dccccd...",
    "..dccccccd..",
    "..dccccccd..",
    "...dccccd...",
    "....d..d....",
    "...d....d...",
    "............"
  ],
  'Kádervadász': [
    "....WWWW....",
    "...WddddW...",
    "..WdwwwwdW..",
    "..WdwwwwdW..",
    "...WWWWWW...",
    "...dWWWWd...",
    "..dWWWWWWd..",
    "..dWWWWWWd..",
    "...dWWWWd...",
    "....W..W....",
    "...W....W...",
    "............"
  ],
  'A Propagandagépezet': [
    "....cccc....",
    "...ccsscc...",
    "..ccsssscc..",
    "..ccwccwcc..",
    "...ccsscc...",
    "..ccsssscc..",
    ".cccssssccc.",
    "cccccccccccc",
    "...cc..cc...",
    "..cc....cc..",
    ".cc......cc.",
    "............"
  ],
  'A Megállíthatatlan Rezsidémon': [
    "....RRRR....",
    "...RROORR...",
    "..RROOOORR..",
    "..RRORRORR..",
    "...RRRRRR...",
    "...ROOOOR...",
    "..ROOOOOOR..",
    "..ROOOOOOR..",
    "...ROOOOR...",
    "....R..R....",
    "...R....R...",
    "............"
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
    "............"
  ]
};

interface SpriteRendererProps {
  type: string;
  className?: string;
  isEnemy?: boolean;
}

export const SpriteRenderer: React.FC<SpriteRendererProps> = ({ type, className = '', isEnemy = false }) => {
  const data = SPRITE_DATA[type] || SPRITE_DATA['Unknown'] || [];
  if (!data || data.length === 0) return null;
  const width = data[0]?.length || 1;
  const height = data.length || 1;

  return (
    <motion.div 
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: '100%', height: '100%' }}
      animate={{ 
        y: [-3, 3, -3],
        scaleY: [1, 0.96, 1],
        scaleX: [1, 1.02, 1]
      }}
      transition={{ 
        duration: 2 + Math.random(), 
        repeat: Infinity, 
        ease: "easeInOut" 
      }}
    >
      <svg 
        viewBox={`0 0 ${width} ${height}`} 
        className="w-full h-full drop-shadow-xl" 
        style={{ 
          transform: isEnemy ? 'scaleX(-1)' : 'none', 
          overflow: 'visible' 
        }}
      >
        <defs>
          <filter id="glow">
             <feGaussianBlur stdDeviation="0.5" result="coloredBlur"/>
             <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
             </feMerge>
          </filter>
        </defs>
        <g filter="url(#glow)">
          {data.map((row, y) => 
            row.split('').map((char, x) => (
              char !== '.' && (
                <rect 
                  key={`${x}-${y}`} 
                  x={x} 
                  y={y} 
                  width="1.05" 
                  height="1.05" 
                  fill={PALETTE[char] || 'transparent'} 
                />
              )
            ))
          )}
        </g>
      </svg>
      {/* Action / intent shadow or highlight can be added as adjacent components here */}
    </motion.div>
  );
};
