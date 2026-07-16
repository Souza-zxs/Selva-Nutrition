import { trustBadges } from "../data/content";
import Reveal from "./motion/Reveal";

export default function TrustBadges() {
  return (
    <section className="bg-surface-container-low px-margin-mobile py-32 md:px-margin-desktop">
      <div className="mx-auto max-w-container-max">
        <Reveal className="mb-16 text-center">
          <span className="mb-4 block text-label-caps tracking-widest text-secondary uppercase">
            Tradição &amp; Qualidade
          </span>
          <h2 className="font-serif mb-4 text-headline-lg-mobile text-on-surface uppercase md:text-headline-lg">
            Compromisso com a Verdade
          </h2>
        </Reveal>
        <Reveal className="grid grid-cols-1 items-center justify-items-center gap-12 sm:grid-cols-2 md:grid-cols-4">
          {trustBadges.map((badge) => (
            <div
              key={badge.title}
              className="group flex flex-col items-center text-center"
            >
              <img
                alt={badge.title}
                className="mb-6 h-48 w-48 rounded-full border-2 border-secondary/10 shadow-[0_0_30px_rgba(201,162,39,0.12)] transition-transform duration-500 group-hover:scale-110"
                src={badge.image}
              />
              <h3 className="mb-2 text-label-caps text-secondary uppercase">
                {badge.title}
              </h3>
              <p className="text-sm text-on-surface-variant">{badge.body}</p>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
