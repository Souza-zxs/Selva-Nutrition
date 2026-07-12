import { motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

const VARIANTS: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
};

export default function Reveal({ children, className, delay = 0 }: RevealProps) {
  return (
    <motion.div
      className={className}
      variants={VARIANTS}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: delay / 1000 }}
    >
      {children}
    </motion.div>
  );
}
