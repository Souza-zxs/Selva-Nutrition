import { ecosystem } from "../data/content";
import Icon from "./Icon";
import Reveal from "./motion/Reveal";

export default function Ecosystem() {
  return (
    <section
      id="source"
      className="bg-surface-container px-margin-mobile py-20 md:px-margin-desktop md:py-32"
    >
      <div className="mx-auto max-w-container-max">
        <Reveal className="mb-10 text-center md:mb-16">
          <h2 className="font-serif mb-4 text-headline-lg-mobile text-on-surface uppercase md:text-headline-lg">
            {ecosystem.title}
          </h2>
          <p className="mx-auto max-w-2xl text-body-lg text-on-surface-variant">
            {ecosystem.subtitle}
          </p>
        </Reveal>
        <div className="grid h-auto grid-cols-1 gap-gutter md:h-[600px] md:grid-cols-4">
          <Reveal className="metallic-border group relative h-105 overflow-hidden bg-surface-container md:col-span-2 md:row-span-2 md:h-auto">
            <img
              className="absolute inset-0 h-full w-full object-cover opacity-50 transition-transform duration-1000 group-hover:scale-105"
              src={ecosystem.source.image}
              alt="Paisagem selvagem"
            />
            <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-12">
              <Icon
                name={ecosystem.source.icon}
                className="mb-4 text-4xl text-secondary"
              />
              <h3 className="font-serif mb-4 text-headline-lg-mobile text-on-surface uppercase md:text-headline-lg">
                {ecosystem.source.title}
              </h3>
              <p className="text-body-md text-on-surface-variant">
                {ecosystem.source.body}
              </p>
              <button className="mt-6 flex items-center gap-2 text-label-caps text-secondary uppercase">
                {ecosystem.source.cta}
                <Icon name="arrow_outward" className="text-sm" />
              </button>
            </div>
          </Reveal>
          {ecosystem.tiles.map((tile, index) => (
            <Reveal
              key={tile.title}
              className={`metallic-border flex flex-col justify-between p-8 ${
                index === 0 ? "bg-primary-container" : "bg-surface-container"
              }`}
              delay={(index + 1) * 100}
            >
              <Icon name={tile.icon} className="text-4xl text-secondary" />
              <div>
                <h3 className="mb-2 text-label-caps text-on-surface uppercase">
                  {tile.title}
                </h3>
                <p className="text-sm text-on-surface-variant">
                  {tile.body}
                </p>
              </div>
            </Reveal>
          ))}
          <Reveal
            className="metallic-border flex items-center gap-8 bg-surface-container-high p-8 md:col-span-2"
            delay={300}
          >
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full border-2 border-secondary/20">
              <Icon name={ecosystem.lab.icon} className="text-3xl text-secondary" />
            </div>
            <div>
              <h3 className="mb-2 text-label-caps text-on-surface uppercase">
                {ecosystem.lab.title}
              </h3>
              <p className="text-body-md text-on-surface-variant">
                {ecosystem.lab.body}
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
