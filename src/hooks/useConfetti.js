import { useEffect, useRef } from 'react';

/**
 * useConfetti - returns a `burst(x, y, opts)` fn that draws a brief particle
 * burst on a fixed overlay canvas. Pure canvas, no deps.
 */
export function useConfetti() {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const rafRef = useRef(null);

  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.style.cssText = `
      position: fixed; inset: 0; pointer-events: none;
      width: 100%; height: 100%; z-index: 9999;
    `;
    document.body.appendChild(canvas);
    canvasRef.current = canvas;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      const ctx = canvas.getContext('2d');
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const ctx = canvas.getContext('2d');
    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const ps = particlesRef.current;
      for (let i = ps.length - 1; i >= 0; i--) {
        const p = ps[i];
        p.vy += 0.18; // gravity
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.99;
        p.life -= 1;
        p.rot += p.spin;

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        if (p.shape === 'circle') {
          ctx.beginPath();
          ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.shape === 'star') {
          drawStar(ctx, 0, 0, p.size, p.size * 0.45, 5);
        } else {
          ctx.fillRect(-p.size, -p.size * 0.4, p.size * 2, p.size * 0.8);
        }
        ctx.restore();

        if (p.life <= 0 || p.y > window.innerHeight + 40) ps.splice(i, 1);
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
      canvas.remove();
    };
  }, []);

  const burst = (x, y, opts = {}) => {
    const {
      count = 32,
      colors = ['#FF8FB8', '#FFD56B', '#CDB4FF', '#9AD7F5', '#6A4C93'],
      power = 1,
      shapes = ['rect', 'circle', 'star']
    } = opts;
    const ps = particlesRef.current;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = (3 + Math.random() * 6) * power;
      ps.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        size: 4 + Math.random() * 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 60 + Math.random() * 40,
        maxLife: 90,
        rot: Math.random() * Math.PI,
        spin: (Math.random() - 0.5) * 0.3,
        shape: shapes[Math.floor(Math.random() * shapes.length)]
      });
    }
  };

  return burst;
}

function drawStar(ctx, cx, cy, outer, inner, points) {
  let rot = (Math.PI / 2) * 3;
  const step = Math.PI / points;
  ctx.beginPath();
  ctx.moveTo(cx, cy - outer);
  for (let i = 0; i < points; i++) {
    let x = cx + Math.cos(rot) * outer;
    let y = cy + Math.sin(rot) * outer;
    ctx.lineTo(x, y);
    rot += step;
    x = cx + Math.cos(rot) * inner;
    y = cy + Math.sin(rot) * inner;
    ctx.lineTo(x, y);
    rot += step;
  }
  ctx.lineTo(cx, cy - outer);
  ctx.closePath();
  ctx.fill();
}
