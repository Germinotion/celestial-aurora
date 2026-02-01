import { useState, useEffect, useRef } from 'react';

const CelestialAurora = () => {
  const canvasRef = useRef(null);
  const [theme, setTheme] = useState('aurora');
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  
  const themes = {
    aurora: {
      name: 'Northern Lights',
      colors: ['#00ff87', '#60efff', '#ff00ff', '#7b2cbf', '#240046'],
      bg: 'radial-gradient(ellipse at bottom, #1B2735 0%, #090a0f 100%)'
    },
    cosmic: {
      name: 'Cosmic Nebula',
      colors: ['#ff6b6b', '#feca57', '#ff9ff3', '#54a0ff', '#5f27cd'],
      bg: 'radial-gradient(ellipse at center, #1a1a2e 0%, #0f0f1a 100%)'
    },
    ocean: {
      name: 'Abyssal Dream',
      colors: ['#00cec9', '#0984e3', '#6c5ce7', '#a29bfe', '#dfe6e9'],
      bg: 'radial-gradient(ellipse at top, #0c2461 0%, #0a0a0f 100%)'
    },
    ember: {
      name: 'Phoenix Rising',
      colors: ['#ff9500', '#ff5e3a', '#ff2d55', '#c644fc', '#5856d6'],
      bg: 'radial-gradient(ellipse at bottom, #2d1b00 0%, #0a0505 100%)'
    }
  };

  useEffect(() => {
    setDimensions({ width: window.innerWidth, height: window.innerHeight });
    const handleResize = () => setDimensions({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const { width, height } = dimensions;
    canvas.width = width;
    canvas.height = height;
    
    let animationId;
    let time = 0;
    let mouse = { x: width / 2, y: height / 2, active: false };
    
    const currentColors = themes[theme].colors;
    
    // Create particles
    let particles = Array.from({ length: 120 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5 - 0.2,
      size: Math.random() * 3 + 1,
      color: currentColors[Math.floor(Math.random() * currentColors.length)],
      alpha: Math.random() * 0.5 + 0.5,
      life: Math.random(),
      decay: Math.random() * 0.002 + 0.001,
      angle: Math.random() * Math.PI * 2,
      angleSpeed: (Math.random() - 0.5) * 0.02
    }));

    // Stars
    const stars = Array.from({ length: 100 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 1.5,
      speed: Math.random() * 2 + 1
    }));

    const drawGlow = (x, y, radius, color, alpha) => {
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      const a1 = Math.floor(alpha * 255).toString(16).padStart(2, '0');
      const a2 = Math.floor(alpha * 128).toString(16).padStart(2, '0');
      gradient.addColorStop(0, color + a1);
      gradient.addColorStop(0.5, color + a2);
      gradient.addColorStop(1, color + '00');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    };

    const animate = () => {
      time += 0.016;

      // Fade effect
      ctx.fillStyle = 'rgba(10, 10, 15, 0.15)';
      ctx.fillRect(0, 0, width, height);

      // Draw stars
      stars.forEach((star, i) => {
        const twinkle = Math.sin(time * star.speed + i) * 0.5 + 0.5;
        ctx.fillStyle = `rgba(255, 255, 255, ${twinkle * 0.9})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size * twinkle + 0.5, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw aurora waves
      ctx.globalCompositeOperation = 'screen';
      for (let w = 0; w < 4; w++) {
        ctx.beginPath();
        ctx.strokeStyle = currentColors[w % currentColors.length] + '30';
        ctx.lineWidth = 80 - w * 15;
        ctx.lineCap = 'round';
        
        for (let x = 0; x <= width; x += 5) {
          const y = height * 0.5 + 
            Math.sin(x * 0.004 + time * 0.4 + w) * 70 +
            Math.sin(x * 0.008 + time * 0.2 + w * 2) * 35 +
            Math.cos(x * 0.002 + time * 0.6) * 90;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      // Update and draw particles
      particles.forEach((p, i) => {
        p.angle += p.angleSpeed;
        p.x += p.vx + Math.sin(p.angle) * 0.3;
        p.y += p.vy + Math.cos(time + i * 0.1) * 0.15;
        p.life -= p.decay;

        if (mouse.active) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 180 && dist > 0) {
            const force = (180 - dist) / 180;
            p.vx += (dx / dist) * force * 0.4;
            p.vy += (dy / dist) * force * 0.4;
          }
        }

        p.vx *= 0.98;
        p.vy *= 0.98;

        // Reset particle if dead
        if (p.life <= 0 || p.y < -50 || p.y > height + 50 || p.x < -50 || p.x > width + 50) {
          p.x = Math.random() * width;
          p.y = Math.random() * height;
          p.life = 1;
          p.vx = (Math.random() - 0.5) * 0.5;
          p.vy = (Math.random() - 0.5) * 0.5 - 0.2;
          p.color = currentColors[Math.floor(Math.random() * currentColors.length)];
        }

        const alpha = p.life * p.alpha;
        drawGlow(p.x, p.y, p.size * 12, p.color, alpha * 0.25);
        
        const alphaHex = Math.floor(alpha * 255).toString(16).padStart(2, '0');
        ctx.fillStyle = p.color + alphaHex;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Mouse glow
      if (mouse.active) {
        drawGlow(mouse.x, mouse.y, 80, '#ffffff', 0.15);
      }

      ctx.globalCompositeOperation = 'source-over';
      animationId = requestAnimationFrame(animate);
    };

    animate();

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };

    const handleMouseDown = (e) => {
      mouse.active = true;
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      // Burst particles
      for (let i = 0; i < 15; i++) {
        particles.push({
          x: mouse.x,
          y: mouse.y,
          vx: (Math.random() - 0.5) * 3,
          vy: (Math.random() - 0.5) * 3,
          size: Math.random() * 3 + 2,
          color: currentColors[Math.floor(Math.random() * currentColors.length)],
          alpha: 1,
          life: 1,
          decay: 0.015,
          angle: Math.random() * Math.PI * 2,
          angleSpeed: (Math.random() - 0.5) * 0.05
        });
      }
    };

    const handleMouseUp = () => { mouse.active = false; };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseUp);

    return () => {
      cancelAnimationFrame(animationId);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('mouseleave', handleMouseUp);
    };
  }, [theme, dimensions]);

  const currentTheme = themes[theme];

  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      overflow: 'hidden',
      background: currentTheme.bg,
      position: 'relative',
      fontFamily: "Georgia, serif"
    }}>
      <canvas 
        ref={canvasRef} 
        style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0,
          cursor: 'crosshair'
        }} 
      />
      
      {/* Title */}
      <div style={{
        position: 'absolute',
        top: '40px',
        left: '50%',
        transform: 'translateX(-50%)',
        textAlign: 'center',
        zIndex: 10,
        pointerEvents: 'none'
      }}>
        <h1 style={{
          fontSize: 'clamp(1.8rem, 5vw, 3.5rem)',
          fontWeight: 300,
          color: 'white',
          textShadow: '0 0 40px rgba(255,255,255,0.5)',
          letterSpacing: '0.25em',
          margin: 0,
          textTransform: 'uppercase'
        }}>
          {currentTheme.name}
        </h1>
        <p style={{
          fontSize: 'clamp(0.7rem, 2vw, 1rem)',
          color: 'rgba(255,255,255,0.5)',
          letterSpacing: '0.4em',
          marginTop: '12px',
          fontStyle: 'italic'
        }}>
          Click & drag to interact
        </p>
      </div>

      {/* Theme buttons */}
      <div style={{
        position: 'absolute',
        bottom: '40px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: '16px',
        zIndex: 10
      }}>
        {Object.entries(themes).map(([key, value]) => (
          <button
            key={key}
            onClick={() => setTheme(key)}
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              border: theme === key ? '3px solid white' : '2px solid rgba(255,255,255,0.3)',
              background: `linear-gradient(135deg, ${value.colors[0]}, ${value.colors[2]})`,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: theme === key 
                ? `0 0 25px ${value.colors[0]}88`
                : '0 4px 12px rgba(0,0,0,0.3)',
              transform: theme === key ? 'scale(1.15)' : 'scale(1)'
            }}
            title={value.name}
          />
        ))}
      </div>

      {/* Corner decorations */}
      <div style={{ position: 'absolute', top: 20, left: 20, width: 50, height: 50, borderLeft: '1px solid rgba(255,255,255,0.3)', borderTop: '1px solid rgba(255,255,255,0.3)' }} />
      <div style={{ position: 'absolute', top: 20, right: 20, width: 50, height: 50, borderRight: '1px solid rgba(255,255,255,0.3)', borderTop: '1px solid rgba(255,255,255,0.3)' }} />
      <div style={{ position: 'absolute', bottom: 100, left: 20, width: 50, height: 50, borderLeft: '1px solid rgba(255,255,255,0.3)', borderBottom: '1px solid rgba(255,255,255,0.3)' }} />
      <div style={{ position: 'absolute', bottom: 100, right: 20, width: 50, height: 50, borderRight: '1px solid rgba(255,255,255,0.3)', borderBottom: '1px solid rgba(255,255,255,0.3)' }} />
    </div>
  );
};

export default CelestialAurora;
