import React, { useEffect, useRef } from 'react';

interface FallingPetalsProps {
  enabled?: boolean;
}

export const FallingPetals: React.FC<FallingPetalsProps> = ({ enabled = true }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!enabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const petalColors = [
      'rgba(185, 28, 28, 0.75)',   // Deep Crimson
      'rgba(225, 29, 72, 0.7)',    // Rose Pink
      'rgba(217, 119, 6, 0.8)',    // Marigold Orange
      'rgba(245, 158, 11, 0.75)',  // Golden Amber
      'rgba(212, 175, 55, 0.65)',  // Gold shimmer
    ];

    const petalCount = window.innerWidth < 768 ? 20 : 35;
    const petals = Array.from({ length: petalCount }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 8 + 6,
      speedY: Math.random() * 1.2 + 0.6,
      speedX: Math.random() * 0.8 - 0.4,
      color: petalColors[Math.floor(Math.random() * petalColors.length)],
      angle: Math.random() * 360,
      spin: Math.random() * 1.5 - 0.75,
    }));

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      petals.forEach((p) => {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.angle * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        // Draw elegant petal shape
        ctx.ellipse(0, 0, p.size, p.size / 2.2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        p.y += p.speedY;
        p.x += p.speedX;
        p.angle += p.spin;

        if (p.y > canvas.height + 20) {
          p.y = -10;
          p.x = Math.random() * canvas.width;
        }
        if (p.x > canvas.width + 20) p.x = -10;
        if (p.x < -20) p.x = canvas.width + 10;
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-20"
      style={{ mixBlendMode: 'multiply' }}
    />
  );
};
