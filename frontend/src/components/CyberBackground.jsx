import React, { useEffect, useRef } from 'react';

export default function CyberBackground({ threatLevel = 'NORMAL' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();
    window.addEventListener('resize', resize);

    // Particle nodes
    const particleCount = Math.min(65, Math.floor(window.innerWidth / 25));
    const particles = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 2 + 1,
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Node colors based on threat level
      let nodeColor = 'rgba(56, 189, 248, 0.6)';
      let lineColor = 'rgba(56, 189, 248, 0.12)';

      if (threatLevel === 'THREAT') {
        nodeColor = 'rgba(239, 68, 68, 0.7)';
        lineColor = 'rgba(239, 68, 68, 0.2)';
      } else if (threatLevel === 'SAFE') {
        nodeColor = 'rgba(16, 185, 129, 0.7)';
        lineColor = 'rgba(16, 185, 129, 0.18)';
      }

      // Update & Draw Particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = nodeColor;
        ctx.fill();

        // Connect nearby nodes
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 130) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = lineColor;
            ctx.lineWidth = 1 - dist / 130;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [threatLevel]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Dynamic Canvas Neural Network Mesh */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-60" />

      {/* Cyber Grid Texture Overlay */}
      <div 
        className="absolute inset-0 opacity-15"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}
      />

      {/* Dynamic Ambient Vignette & Threat Aura */}
      <div 
        className={`absolute inset-0 transition-colors duration-1000 ${
          threatLevel === 'THREAT'
            ? 'bg-radial-threat'
            : threatLevel === 'SAFE'
            ? 'bg-radial-safe'
            : 'bg-radial-normal'
        }`}
        style={{
          background: threatLevel === 'THREAT'
            ? 'radial-gradient(circle at 50% 30%, rgba(239, 68, 68, 0.18) 0%, rgba(15, 23, 42, 0.88) 70%, rgba(3, 7, 18, 0.98) 100%)'
            : threatLevel === 'SAFE'
            ? 'radial-gradient(circle at 50% 30%, rgba(16, 185, 129, 0.15) 0%, rgba(15, 23, 42, 0.88) 70%, rgba(3, 7, 18, 0.98) 100%)'
            : 'radial-gradient(circle at 50% 30%, rgba(56, 189, 248, 0.12) 0%, rgba(15, 23, 42, 0.88) 70%, rgba(3, 7, 18, 0.98) 100%)'
        }}
      />
    </div>
  );
}
