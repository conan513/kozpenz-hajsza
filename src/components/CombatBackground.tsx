import React, { useEffect, useRef } from 'react';
import { motion } from 'motion/react';

/** Animált parliament szilhuett + ambient harc háttér */
export const CombatBackground: React.FC = React.memo(() => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gradientsRef = useRef<{ sky: CanvasGradient; fog: CanvasGradient; dome: CanvasGradient } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false }); // Performance hint
    if (!ctx) return;

    let frame = 0;
    let raf: number;

    // Particles
    const particles: { x: number; y: number; vy: number; vx: number; size: number; alpha: number }[] = [];
    for (let i = 0; i < 15; i++) {
      particles.push({
        x: Math.random() * 1000,
        y: Math.random() * 600,
        vy: -(0.15 + Math.random() * 0.35),
        vx: (Math.random() - 0.5) * 0.3,
        size: 2 + Math.random() * 4,
        alpha: 0.05 + Math.random() * 0.15,
      });
    }

    const updateGradients = (W: number, H: number) => {
      const sky = ctx.createLinearGradient(0, 0, 0, H);
      sky.addColorStop(0, '#0a0407');
      sky.addColorStop(0.6, '#1a0f0f');
      sky.addColorStop(1, '#2d0a0a');

      const fog = ctx.createRadialGradient(W / 2, H, 0, W / 2, H, W * 0.7);
      fog.addColorStop(0, 'rgba(180,30,30,0.08)');
      fog.addColorStop(1, 'transparent');

      const silhouetteY = H * 0.52;
      const domeGlow = ctx.createRadialGradient(W / 2, silhouetteY - 140, 0, W / 2, silhouetteY - 140, 120);
      domeGlow.addColorStop(0, 'rgba(180,28,28,0.2)');
      domeGlow.addColorStop(1, 'transparent');

      gradientsRef.current = { sky, fog, dome: domeGlow };
    };

    const draw = () => {
      const W = canvas.width;
      const H = canvas.height;
      if (!gradientsRef.current) updateGradients(W, H);
      const grads = gradientsRef.current!;

      ctx.fillStyle = grads.sky;
      ctx.fillRect(0, 0, W, H);

      ctx.fillStyle = grads.fog;
      ctx.fillRect(0, 0, W, H);

      // Parliament silhouette
      const silhouetteY = H * 0.52;
      ctx.fillStyle = 'rgba(8,3,3,0.92)';
      ctx.beginPath();
      ctx.moveTo(0, H);
      ctx.lineTo(0, silhouetteY + 30);
      ctx.lineTo(W * 0.05, silhouetteY + 30);
      ctx.lineTo(W * 0.05, silhouetteY + 10);
      ctx.lineTo(W * 0.1, silhouetteY + 10);
      ctx.lineTo(W * 0.1, silhouetteY);
      ctx.lineTo(W * 0.15, silhouetteY);
      ctx.lineTo(W * 0.15, silhouetteY - 20);
      ctx.lineTo(W * 0.18, silhouetteY - 20);
      ctx.lineTo(W * 0.18, silhouetteY - 40);
      ctx.lineTo(W * 0.21, silhouetteY - 40);
      ctx.lineTo(W * 0.21, silhouetteY - 80);
      ctx.lineTo(W * 0.215, silhouetteY - 100);
      ctx.lineTo(W * 0.22, silhouetteY - 80);
      ctx.lineTo(W * 0.25, silhouetteY - 80);
      ctx.lineTo(W * 0.25, silhouetteY - 50);
      ctx.lineTo(W * 0.3, silhouetteY - 50);
      ctx.lineTo(W * 0.3, silhouetteY - 60);
      ctx.lineTo(W * 0.35, silhouetteY - 60);
      ctx.lineTo(W * 0.35, silhouetteY - 70);
      ctx.lineTo(W * 0.38, silhouetteY - 70);
      ctx.lineTo(W * 0.38, silhouetteY - 110);
      ctx.bezierCurveTo(W * 0.42, silhouetteY - 165, W * 0.58, silhouetteY - 165, W * 0.62, silhouetteY - 110);
      ctx.lineTo(W * 0.62, silhouetteY - 70);
      ctx.lineTo(W * 0.65, silhouetteY - 70);
      ctx.lineTo(W * 0.65, silhouetteY - 60);
      ctx.lineTo(W * 0.7, silhouetteY - 60);
      ctx.lineTo(W * 0.7, silhouetteY - 50);
      ctx.lineTo(W * 0.75, silhouetteY - 50);
      ctx.lineTo(W * 0.75, silhouetteY - 80);
      ctx.lineTo(W * 0.78, silhouetteY - 80);
      ctx.lineTo(W * 0.785, silhouetteY - 100);
      ctx.lineTo(W * 0.79, silhouetteY - 80);
      ctx.lineTo(W * 0.79, silhouetteY - 40);
      ctx.lineTo(W * 0.82, silhouetteY - 40);
      ctx.lineTo(W * 0.82, silhouetteY - 20);
      ctx.lineTo(W * 0.85, silhouetteY - 20);
      ctx.lineTo(W * 0.85, silhouetteY);
      ctx.lineTo(W * 0.9, silhouetteY);
      ctx.lineTo(W * 0.9, silhouetteY + 10);
      ctx.lineTo(W * 0.95, silhouetteY + 10);
      ctx.lineTo(W * 0.95, silhouetteY + 30);
      ctx.lineTo(W, silhouetteY + 30);
      ctx.lineTo(W, H);
      ctx.closePath();
      ctx.fill();

      // Windows glow
      const t = frame * 0.02;
      ctx.fillStyle = `rgba(212,175,55,${0.04 + Math.sin(t) * 0.02})`;
      for (let wi = 0; wi < 8; wi++) {
        const wx = (0.25 + wi * 0.07) * W;
        ctx.fillRect(wx, silhouetteY - 60, 4, 6);
      }

      // Red glow from dome (using cached gradient)
      ctx.globalAlpha = 0.8 + Math.sin(t * 0.7) * 0.2;
      ctx.fillStyle = grads.dome;
      ctx.fillRect(W * 0.3, silhouetteY - 260, W * 0.4, 240);
      ctx.globalAlpha = 1.0;

      // Floating particles (simplified, no save/restore)
      particles.forEach(p => {
        p.y += p.vy;
        p.x += p.vx + Math.sin(frame * 0.01 + p.x) * 0.2;
        if (p.y < -10) { p.y = H + 10; p.x = Math.random() * W; }

        ctx.fillStyle = `rgba(212,175,55,${p.alpha})`;
        ctx.fillRect(p.x, p.y, p.size, p.size * 0.6);
      });

      frame++;
      raf = requestAnimationFrame(draw);
    };

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      updateGradients(canvas.width, canvas.height);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    draw();
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(5,2,2,0.7) 100%)',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
});

