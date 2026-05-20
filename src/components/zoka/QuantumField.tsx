import { useEffect, useRef } from "react";

/**
 * Privacy network — a slowly rotating constellation of nodes connected
 * by a dense web of fine lines. Inspired by cryptographic graph diagrams:
 * every node sees every other node, but only through abstract mathematical
 * relationships. Monochrome, meditative, and visually heavier than the
 * headline so the network itself reads as the protagonist.
 */
const QuantumField = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = 0;
    let height = 0;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    // Distribute N nodes on a sphere using the Fibonacci lattice — gives an
    // even, organic-looking distribution similar to the reference image.
    const NODE_COUNT = 42;
    type Node = { x: number; y: number; z: number; pulse: number };
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));
    const nodes: Node[] = Array.from({ length: NODE_COUNT }, (_, i) => {
      const y = 1 - (i / (NODE_COUNT - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const theta = goldenAngle * i;
      return {
        x: Math.cos(theta) * r,
        y,
        z: Math.sin(theta) * r,
        pulse: Math.random() * Math.PI * 2,
      };
    });

    const getTokens = () => {
      const styles = getComputedStyle(document.documentElement);
      const fg = styles.getPropertyValue("--foreground").trim() || "0 0% 98%";
      const bg = styles.getPropertyValue("--background").trim() || "0 0% 0%";
      return { fg, bg };
    };

    let raf = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const t = (now - start) / 1000;
      const { fg, bg } = getTokens();

      // Solid clear — crisp lines instead of phosphor trail
      ctx.fillStyle = `hsl(${bg})`;
      ctx.fillRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const radius = Math.min(width, height) * 0.48;

      // Slow combined rotation
      const ay = t * 0.18;
      const ax = Math.sin(t * 0.11) * 0.45;
      const cosY = Math.cos(ay), sinY = Math.sin(ay);
      const cosX = Math.cos(ax), sinX = Math.sin(ax);

      // Project nodes
      const projected = nodes.map((n) => {
        // rotate Y
        let x = n.x * cosY + n.z * sinY;
        let z = -n.x * sinY + n.z * cosY;
        let y = n.y;
        // rotate X
        const y2 = y * cosX - z * sinX;
        const z2 = y * sinX + z * cosX;
        y = y2; z = z2;

        // perspective
        const persp = 1 / (1.8 - z * 0.6);
        return {
          sx: cx + x * radius * persp,
          sy: cy + y * radius * persp,
          depth: (z + 1) / 2, // 0 (back) → 1 (front)
        };
      });

      // Draw EVERY pair — produces the dense interwoven web from the reference
      ctx.lineWidth = 0.4;
      for (let i = 0; i < projected.length; i++) {
        const a = projected[i];
        for (let j = i + 1; j < projected.length; j++) {
          const b = projected[j];
          const depth = (a.depth + b.depth) / 2;
          // Front lines are darker/sharper, back lines fade out
          const alpha = 0.04 + depth * 0.22;
          ctx.strokeStyle = `hsl(${fg} / ${alpha})`;
          ctx.beginPath();
          ctx.moveTo(a.sx, a.sy);
          ctx.lineTo(b.sx, b.sy);
          ctx.stroke();
        }
      }

      // Nodes — luminous white points, brighter when in front
      for (let i = 0; i < projected.length; i++) {
        const p = projected[i];
        const n = nodes[i];
        const pulse = 0.5 + 0.5 * Math.sin(t * 1.4 + n.pulse);
        const size = 1.6 + p.depth * 2.4 + pulse * 0.8;
        const alpha = 0.7 + p.depth * 0.3;

        // Soft white halo for depth
        if (p.depth > 0.45) {
          const haloAlpha = (p.depth - 0.45) * 0.5;
          const grd = ctx.createRadialGradient(p.sx, p.sy, 0, p.sx, p.sy, size * 4);
          grd.addColorStop(0, `hsl(0 0% 100% / ${haloAlpha})`);
          grd.addColorStop(1, `hsl(0 0% 100% / 0)`);
          ctx.fillStyle = grd;
          ctx.beginPath();
          ctx.arc(p.sx, p.sy, size * 4, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.fillStyle = `hsl(0 0% 100% / ${alpha})`;
        ctx.beginPath();
        ctx.arc(p.sx, p.sy, size, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      aria-hidden="true"
    />
  );
};

export default QuantumField;
