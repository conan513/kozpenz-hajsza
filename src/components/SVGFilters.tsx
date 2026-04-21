import React from 'react';

/**
 * Központi SVG filterek, amiket az egész alkalmazás használhat.
 * Ezzel elkerüljük a filterek duplikálását minden egyes komponensben.
 */
export const SVGFilters: React.FC = () => {
  return (
    <svg style={{ position: 'absolute', top: 0, left: 0, width: 0, height: 0, pointerEvents: 'none' }} aria-hidden="true">
      <defs>
        {/* Általános ragyogás effekt */}
        <filter id="global-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="0.4" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>

        {/* Erősebb ragyogás (pl. térkép vonalakhoz) */}
        <filter id="line-glow">
          <feGaussianBlur stdDeviation="1.5" result="blur"/>
          <feMerge>
            <feMergeNode in="blur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>

        {/* Sérülés (piros villanás) effekt */}
        <filter id="hurt-filter">
          <feColorMatrix 
            type="matrix" 
            values="2 0 0 0 0.5  
                    0 0.2 0 0 0  
                    0 0 0.2 0 0  
                    0 0 0 1 0"
          />
        </filter>
      </defs>
    </svg>
  );
};
