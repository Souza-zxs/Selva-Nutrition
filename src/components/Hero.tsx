import { useRef } from "react";
import { motion, useScroll, useTransform, type Variants } from "framer-motion";
import { hero } from "../data/content";
import Icon from "./Icon";

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.16, delayChildren: 0.1 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] },
  },
};

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);

  return (
    <section
      ref={sectionRef}
      className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-surface"
    >
      <div className="absolute inset-0 z-0 overflow-hidden">
        <motion.img
          src="/products/hero-tallow-dramatic.webp"
          alt="Manteiga Tallow SELVA Nutrition"
          className="h-full w-full object-cover object-center"
          style={{ y, scale: 1.1 }}
        />
        <div className="hero-overlay absolute inset-0" />
      </div>
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 flex max-w-4xl flex-col items-center px-margin-mobile text-center"
      >
        <motion.span
          variants={item}
          className="mb-4 block text-label-caps tracking-[0.3em] text-secondary"
        >
          {hero.eyebrow}
        </motion.span>
        <motion.h1
          variants={item}
          className="gold-glow font-serif mb-8 text-headline-lg-mobile leading-none text-on-surface uppercase md:text-display-lg"
        >
          {hero.title}
        </motion.h1>
        <motion.p
          variants={item}
          className="mx-auto mb-10 max-w-2xl text-body-lg text-on-surface-variant"
        >
          {hero.subtitle}
        </motion.p>
        <motion.div
          variants={item}
          className="flex flex-col justify-center gap-4 md:flex-row"
        >
          <a
            href="#colecao"
            className="bg-secondary px-10 py-4 text-center text-label-caps text-primary-container uppercase transition-all hover:shadow-[0_0_25px_rgba(201,162,39,0.35)]"
          >
            {hero.primaryCta}
          </a>
          <a
            href="#manifesto"
            className="metallic-border px-10 py-4 text-center text-label-caps text-secondary uppercase transition-all hover:bg-secondary/10"
          >
            {hero.secondaryCta}
          </a>
        </motion.div>
      </motion.div>
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
        <Icon name="expand_more" className="text-secondary opacity-50" />
      </div>
    </section>
  );
}
