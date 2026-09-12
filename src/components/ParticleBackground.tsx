import React, { useEffect, useRef } from 'react';

interface ParticleBackgroundProps {
  speedMultiplier?: number;
  isDark?: boolean;
}

export const ParticleBackground: React.FC<ParticleBackgroundProps> = ({
  speedMultiplier = 1,
  isDark = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    const mouse: { x: number | null; y: number | null; radius: number } = {
      x: null,
      y: null,
      radius: 140,
    };

    function resize() {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    const handleMouseLeave = () => {
      mouse.x = null;
      mouse.y = null;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseout', handleMouseLeave);

    class Particle {
      x: number = 0;
      y: number = 0;
      size: number = 1.5;
      speedX: number = 0;
      speedY: number = 0;
      color: string = '#6366f1';
      alpha: number = 0.2;

      constructor() {
        this.reset(true);
      }

      reset(initial = false) {
        if (!canvas) return;
        this.x = Math.random() * canvas.width;
        this.y = initial ? Math.random() * canvas.height : canvas.height + 10;
        this.size = Math.random() * 2 + 0.8;
        this.speedX = (Math.random() - 0.5) * 0.7;
        this.speedY = -(Math.random() * 0.8 + 0.3);
        const colors = ['#6366f1', '#06b6d4', '#ec4899', '#38bdf8'];
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.alpha = Math.random() * 0.35 + 0.12;
      }

      update(multiplier: number) {
        if (!canvas) return;
        this.x += this.speedX * multiplier;
        this.y += this.speedY * multiplier;

        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < mouse.radius) {
            const force = (1 - dist / mouse.radius) * 3.5;
            this.x -= (dx / dist) * force;
            this.y -= (dy / dist) * force;
          }
        }

        if (this.y < -10 || this.x < -20 || this.x > canvas.width + 20) {
          this.reset();
        }
      }

      draw(c: CanvasRenderingContext2D) {
        c.save();
        c.globalAlpha = this.alpha;
        c.fillStyle = this.color;
        c.beginPath();
        c.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        c.fill();
        c.restore();
      }
    }

    const particleCount = Math.min(Math.floor(window.innerWidth / 20), 70);
    const particles: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    function animate() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < particles.length; i++) {
        particles[i].update(speedMultiplier);
        particles[i].draw(ctx);

        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 90) {
            ctx.beginPath();
            ctx.strokeStyle = isDark ? '#6366f1' : '#4f46e5';
            ctx.globalAlpha = (1 - dist / 90) * (isDark ? 0.12 : 0.08);
            ctx.lineWidth = 0.6;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
      animationFrameId = requestAnimationFrame(animate);
    }
    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseout', handleMouseLeave);
    };
  }, [speedMultiplier, isDark]);

  return (
    <canvas
      ref={canvasRef}
      id="particleCanvas"
      className="fixed inset-0 w-full h-full pointer-events-none z-0 opacity-70"
    />
  );
};
