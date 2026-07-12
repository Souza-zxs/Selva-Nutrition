import { useEffect, useRef } from "react";

type ProductSequenceViewerProps = {
  images: string[];
  alt: string;
  className?: string;
};

/**
 * Pseudo-3D product viewer. Rotation is driven by two passive inputs — the
 * scroll position of the section it lives in, and horizontal drag — combined
 * into a single continuous angle. No scroll-jacking or pinning: the page
 * keeps scrolling normally, this just reacts to it.
 *
 * With a real 24–36 frame turntable sequence (`images.length > 1`) it draws
 * the matching photo per angle. With a single placeholder photo it fakes a
 * turntable wobble via canvas transforms so the interaction is demonstrable
 * before real product photography exists — swap in the real frames later,
 * same component, same API.
 */
export default function ProductSequenceViewer({
  images,
  alt,
  className = "",
}: ProductSequenceViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const loadedImages = useRef<HTMLImageElement[]>([]);
  const scrollAngle = useRef(0);
  const dragOffset = useRef(0);
  const dragState = useRef<{ startX: number; startOffset: number } | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadedImages.current = [];

    Promise.all(
      images.map(
        (src) =>
          new Promise<HTMLImageElement>((resolve) => {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => resolve(img);
            img.onerror = () => resolve(img);
            img.src = src;
          }),
      ),
    ).then((imgs) => {
      if (cancelled) return;
      loadedImages.current = imgs;
      draw();
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [images.join("|")]);

  function draw() {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const imgs = loadedImages.current;
    if (!canvas || !ctx || imgs.length === 0) return;

    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);

    const twoPi = Math.PI * 2;
    const total = scrollAngle.current + dragOffset.current;
    const normalized = ((total % twoPi) + twoPi) % twoPi;

    if (imgs.length > 1) {
      const index = Math.min(
        imgs.length - 1,
        Math.floor((normalized / twoPi) * imgs.length),
      );
      drawContain(ctx, imgs[index], width, height);
      return;
    }

    const img = imgs[0];
    if (!img.complete || img.naturalWidth === 0) return;

    const wobble = Math.cos(normalized);
    const skew = Math.sin(normalized) * 0.06;
    const scaleX = 0.62 + 0.38 * Math.abs(wobble);

    ctx.save();
    ctx.translate(width / 2, height / 2);
    ctx.transform(scaleX, skew, 0, 1, 0, 0);
    ctx.translate(-width / 2, -height / 2);
    drawContain(ctx, img, width, height);
    ctx.restore();
  }

  function drawContain(
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    width: number,
    height: number,
  ) {
    if (!img.naturalWidth) return;
    const scale = Math.min(width / img.naturalWidth, height / img.naturalHeight);
    const w = img.naturalWidth * scale;
    const h = img.naturalHeight * scale;
    ctx.drawImage(img, (width - w) / 2, (height - h) / 2, w, h);
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.getContext("2d")?.scale(dpr, dpr);
      draw();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const rect = container.getBoundingClientRect();
        const vh = window.innerHeight;
        const progress = Math.min(
          1,
          Math.max(0, (vh - rect.top) / (vh + rect.height)),
        );
        scrollAngle.current = progress * Math.PI * 2;
        draw();
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      ro.disconnect();
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function onPointerDown(e: React.PointerEvent) {
    dragState.current = { startX: e.clientX, startOffset: dragOffset.current };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!dragState.current) return;
    const delta = e.clientX - dragState.current.startX;
    dragOffset.current = dragState.current.startOffset + delta * 0.012;
    draw();
  }

  function onPointerUp() {
    dragState.current = null;
  }

  return (
    <div
      ref={containerRef}
      className={`relative aspect-[3/4] w-full touch-pan-y select-none ${className}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
      role="img"
      aria-label={alt}
    >
      <canvas ref={canvasRef} className="h-full w-full cursor-grab active:cursor-grabbing" />
    </div>
  );
}
