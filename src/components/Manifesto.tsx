import { manifesto } from "../data/content";
import Icon from "./Icon";
import Reveal from "./motion/Reveal";

export default function Manifesto() {
  return (
    <section
      id="manifesto"
      className="bg-surface-container-low px-margin-mobile py-32 md:px-margin-desktop"
    >
      <div className="relative mx-auto grid max-w-container-max items-center gap-16 md:grid-cols-2">
        <Reveal>
          <span className="mb-4 block text-label-caps tracking-widest text-secondary uppercase">
            {manifesto.eyebrow}
          </span>
          <h2 className="font-serif mb-6 text-headline-lg-mobile leading-tight text-on-surface uppercase md:text-headline-lg">
            {manifesto.title}
          </h2>
          <p className="mb-5 text-body-lg text-on-surface-variant">
            {manifesto.body}
          </p>
          <p className="mb-8 text-sm text-on-surface-variant/80">
            {manifesto.bodySecondary}
          </p>
          <div className="space-y-6">
            {manifesto.points.map((point) => (
              <div key={point.title} className="flex items-start gap-4">
                <Icon name={point.icon} className="mt-1 text-secondary" />
                <div>
                  <h4 className="text-label-caps text-on-surface uppercase">
                    {point.title}
                  </h4>
                  <p className="text-sm text-on-surface-variant">
                    {point.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
        <Reveal delay={150} className="relative">
          <div className="absolute inset-x-0 bottom-0 h-2/3 rounded-full bg-secondary/10 blur-[100px]" />
          <div className="metallic-border photo-frame-vignette relative z-10 rounded-lg bg-on-surface p-8 shadow-2xl">
            <img
              alt="Linha SELVA Nutrition — manteigas Tallow"
              className="w-full object-contain transition-transform duration-1000 hover:scale-105"
              src={manifesto.image}
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
