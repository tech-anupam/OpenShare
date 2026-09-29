"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "@/hooks/use-theme";

interface Particle {
  baseX: number;
  baseY: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  angle: number;
  speed: number;
  orbitRadius: number;
}

export function WebGLBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -2000, y: -2000, targetX: -2000, targetY: -2000 });
  const { theme } = useTheme();
  const themeRef = useRef(theme);
  const rafRef = useRef(0);
  const particlesRef = useRef<Particle[]>([]);

  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    const PARTICLE_COUNT = 75;
    const CONNECT_DIST = 130;
    const MOUSE_RADIUS = 180;
    const MOUSE_PULL = 0.08;

    function resize() {
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx!.scale(dpr, dpr);
    }

    function init() {
      particlesRef.current = [];
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        particlesRef.current.push({
          baseX: x,
          baseY: y,
          x,
          y,
          vx: 0,
          vy: 0,
          size: Math.random() * 1.2 + 0.8,
          angle: Math.random() * Math.PI * 2,
          speed: (Math.random() * 0.008 + 0.003) * (Math.random() < 0.5 ? 1 : -1),
          orbitRadius: Math.random() * 35 + 15,
        });
      }
    }

    resize();
    init();

    const onResize = () => {
      resize();
      init();
    };
    window.addEventListener("resize", onResize);

    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current.targetX = e.clientX;
      mouseRef.current.targetY = e.clientY;
    };
    window.addEventListener("mousemove", onMouseMove);

    const onMouseLeave = () => {
      mouseRef.current.targetX = -2000;
      mouseRef.current.targetY = -2000;
    };
    document.addEventListener("mouseleave", onMouseLeave);

    function render() {
      if (!ctx) return;
      const isDark = themeRef.current === "dark";

      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.15;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.15;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      ctx.clearRect(0, 0, width, height);

      const particles = particlesRef.current;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.angle += p.speed;

        const targetX = p.baseX + Math.cos(p.angle) * p.orbitRadius;
        const targetY = p.baseY + Math.sin(p.angle) * p.orbitRadius;

        const dx = mx - p.x;
        const dy = my - p.y;
        const distToMouse = Math.sqrt(dx * dx + dy * dy);

        if (distToMouse < MOUSE_RADIUS && distToMouse > 0) {
          const force = (1 - distToMouse / MOUSE_RADIUS) * MOUSE_PULL;
          p.vx += (dx / distToMouse) * force * 15;
          p.vy += (dy / distToMouse) * force * 15;
        }

        p.vx += (targetX - p.x) * 0.02;
        p.vy += (targetY - p.y) * 0.02;

        p.vx *= 0.88;
        p.vy *= 0.88;

        p.x += p.vx;
        p.y += p.vy;

        if (p.baseX < 0) p.baseX = width;
        if (p.baseX > width) p.baseX = 0;
        if (p.baseY < 0) p.baseY = height;
        if (p.baseY > height) p.baseY = 0;
      }

      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const d = Math.sqrt(dx * dx + dy * dy);

          if (d < CONNECT_DIST) {
            const alpha = (1 - d / CONNECT_DIST) * (isDark ? 0.12 : 0.08);
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = isDark
              ? `rgba(255, 255, 255, ${alpha})`
              : `rgba(0, 0, 0, ${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      if (mx > -100 && my > -100) {
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          const dx = mx - p.x;
          const dy = my - p.y;
          const d = Math.sqrt(dx * dx + dy * dy);

          if (d < MOUSE_RADIUS) {
            const alpha = (1 - d / MOUSE_RADIUS) * 0.35;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mx, my);
            ctx.strokeStyle = `rgba(59, 130, 246, ${alpha})`;
            ctx.lineWidth = 0.7;
            ctx.stroke();
          }
        }

        ctx.beginPath();
        ctx.arc(mx, my, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(59, 130, 246, 0.75)";
        ctx.fill();

        ctx.beginPath();
        ctx.arc(mx, my, 8, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(59, 130, 246, 0.18)";
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const dx = mx - p.x;
        const dy = my - p.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        const nearMouse = d < MOUSE_RADIUS;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = nearMouse
          ? "rgba(59, 130, 246, 0.7)"
          : isDark
          ? "rgba(255, 255, 255, 0.25)"
          : "rgba(0, 0, 0, 0.2)";
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(render);
    }

    rafRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseleave", onMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0"
      style={{ zIndex: -1, pointerEvents: "none" }}
    />
  );
}
