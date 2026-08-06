import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode } from "react";
import { useState } from "react";
import Icon from "./Icon";

const GALLERY_EASE = [0.16, 1, 0.3, 1] as const;

export default function ProductGallery({
  images,
  productName,
  fallbackIcon,
  children,
}: {
  images: string[];
  productName: string;
  fallbackIcon?: string | null;
  /** Overlay content (e.g. offer badge) positioned over the main image. */
  children?: ReactNode;
}) {
  const [active, setActive] = useState(0);

  if (images.length === 0) {
    return (
      <div className="metallic-border photo-frame-vignette relative flex aspect-square items-center justify-center overflow-hidden bg-on-surface p-10">
        {children}
        <Icon
          name={fallbackIcon ?? "spa"}
          className="text-8xl text-primary-container opacity-40"
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 md:flex-row md:gap-4">
      {images.length > 1 && (
        <div className="order-2 flex gap-3 overflow-x-auto pb-1 md:order-1 md:w-20 md:flex-col md:overflow-visible md:pb-0">
          {images.map((src, i) => (
            <button
              key={src + i}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Ver foto ${i + 1} de ${images.length}`}
              aria-current={i === active}
              className={`relative aspect-square w-16 flex-shrink-0 overflow-hidden bg-on-surface transition-all duration-300 md:w-full ${
                i === active
                  ? "ring-2 ring-secondary"
                  : "opacity-50 ring-1 ring-outline-variant/25 hover:opacity-90"
              }`}
            >
              <img
                src={src}
                alt=""
                aria-hidden
                className="h-full w-full object-contain p-1.5"
              />
            </button>
          ))}
        </div>
      )}

      <div className="metallic-border photo-frame-vignette relative order-1 aspect-square flex-1 overflow-hidden bg-on-surface p-3 md:order-2">
        {children}
        <AnimatePresence mode="wait" initial={false}>
          <motion.img
            key={images[active]}
            src={images[active]}
            alt={productName}
            className="h-full w-full object-contain"
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.45, ease: GALLERY_EASE }}
          />
        </AnimatePresence>
        {images.length > 1 && (
          <span className="absolute right-3 bottom-3 z-10 bg-surface/70 px-2 py-1 text-[10px] tracking-widest text-on-surface-variant backdrop-blur-sm">
            {active + 1}/{images.length}
          </span>
        )}
      </div>
    </div>
  );
}
