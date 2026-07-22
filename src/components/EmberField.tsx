import { useEffect, useRef } from "react";

type EmberVariant = "hero" | "ambient";

interface EmberFieldProps {
  variant: EmberVariant;
  className?: string;
}

interface Ember {
  x: number;
  y: number;
  r: number;
  speed: number;
  drift: number;
  phase: number;
  maxOpacity: number;
}

const CONFIG: Record<
  EmberVariant,
  {
    count: number;
    speed: [number, number];
    radius: [number, number];
    opacity: [number, number];
    color: string;
  }
> = {
  hero: {
    count: 46,
    speed: [16, 34],
    radius: [1, 2.6],
    opacity: [0.35, 0.85],
    color: "201, 162, 39",
  },
  ambient: {
    count: 22,
    speed: [7, 14],
    radius: [0.6, 1.6],
    opacity: [0.08, 0.22],
    color: "201, 162, 39",
  },
};

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

export default function EmberField({ variant, className = "" }: EmberFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const config = CONFIG[variant];
    let width = 0;
    let height = 0;
    let embers: Ember[] = [];

    function spawn(randomHeight: boolean): Ember {
      return {
        x: rand(0, width),
        y: randomHeight ? rand(0, height) : height + rand(0, 30),
        r: rand(config.radius[0], config.radius[1]),
        speed: rand(config.speed[0], config.speed[1]),
        drift: rand(-1, 1),
        phase: rand(0, Math.PI * 2),
        maxOpacity: rand(config.opacity[0], config.opacity[1]),
      };
    }

    function resize() {
      const rect = canvas!.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      const dpr = window.devicePixelRatio || 1;
      canvas!.width = width * dpr;
      canvas!.height = height * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    resize();
    embers = Array.from({ length: config.count }, () => spawn(true));
    window.addEventListener("resize", resize);

    let raf = 0;
    let last = performance.now();

    function tick(now: number) {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      ctx!.clearRect(0, 0, width, height);

      for (const ember of embers) {
        ember.y -= ember.speed * dt;
        ember.phase += dt * 0.5;
        ember.x += Math.sin(ember.phase) * ember.drift * dt * 10;

        const t = 1 - ember.y / height;
        let k = 1;
        if (t < 0.12) k = Math.max(0, t / 0.12);
        else if (t > 0.75) k = Math.max(0, (1 - t) / 0.25);
        const opacity = ember.maxOpacity * k;

        if (opacity > 0.01) {
          const glowRadius = ember.r * 4;
          const gradient = ctx!.createRadialGradient(
            ember.x,
            ember.y,
            0,
            ember.x,
            ember.y,
            glowRadius,
          );
          gradient.addColorStop(0, `rgba(${config.color}, ${opacity})`);
          gradient.addColorStop(1, `rgba(${config.color}, 0)`);
          ctx!.fillStyle = gradient;
          ctx!.beginPath();
          ctx!.arc(ember.x, ember.y, glowRadius, 0, Math.PI * 2);
          ctx!.fill();
        }

        if (ember.y < -20) {
          Object.assign(ember, spawn(false));
        }
      }

      raf = requestAnimationFrame(tick);
    }

    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [variant]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none h-full w-full ${className}`}
    />
  );
}
