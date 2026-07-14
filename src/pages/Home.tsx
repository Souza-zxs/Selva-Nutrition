import { useRef } from "react";
import BotanicalMotif from "../components/BotanicalMotif";
import Ecosystem from "../components/Ecosystem";
import Hero from "../components/Hero";
import Manifesto from "../components/Manifesto";
import ProductCatalog from "../components/ProductCatalog";
import TrustBadges from "../components/TrustBadges";

export default function Home() {
  const rootRef = useRef<HTMLDivElement>(null);

  return (
    <main>
      <Hero />
      <div ref={rootRef} className="relative">
        <BotanicalMotif
          containerRef={rootRef}
          className="pointer-events-none absolute top-0 left-1/2 z-20 hidden h-full w-[640px] -translate-x-1/2 opacity-[0.20] lg:block"
        />
        <Manifesto />
        <ProductCatalog />
        <TrustBadges />
        <Ecosystem />
      </div>
    </main>
  );
}
