import { comparison } from "../data/content";
import Icon from "./Icon";
import ProductSequenceViewer from "./ProductSequenceViewer";
import Reveal from "./motion/Reveal";

export default function Comparison() {
  return (
    <section className="bg-surface-container px-margin-mobile py-32 md:px-margin-desktop">
      <div className="mx-auto max-w-container-max">
        <Reveal className="mb-16 text-center">
          <h2 className="font-serif mb-4 text-headline-lg-mobile text-on-surface uppercase md:text-headline-lg">
            {comparison.title}
          </h2>
          <p className="mx-auto max-w-2xl text-body-lg text-on-surface-variant italic">
            {comparison.quote}
          </p>
        </Reveal>
        <Reveal className="flex flex-col items-center gap-12 lg:flex-row">
          <div className="w-full flex-1 border-l-4 border-error/50 bg-surface-dim p-12">
            <h3 className="font-serif mb-6 flex items-center gap-3 text-headline-lg text-error uppercase">
              <Icon name={comparison.enemy.icon} />
              {comparison.enemy.title}
            </h3>
            <ul className="space-y-4">
              {comparison.enemy.items.map((item) => (
                <li
                  key={item.label}
                  className="flex justify-between border-b border-outline-variant/20 pb-2"
                >
                  <span className="text-label-caps">{item.label}</span>
                  <span className="text-error">{item.value}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="w-full shrink-0 lg:w-[360px]">
            <ProductSequenceViewer
              images={[comparison.image]}
              alt="Produto SELVA em giro de 360 graus"
              className="metallic-border rounded-xl bg-surface-dim shadow-2xl"
            />
          </div>
          <div className="w-full flex-1 border-r-4 border-secondary/50 bg-surface-container-high p-12">
            <h3 className="font-serif mb-6 flex items-center gap-3 text-headline-lg text-secondary uppercase">
              <Icon name={comparison.solution.icon} />
              {comparison.solution.title}
            </h3>
            <ul className="space-y-4">
              {comparison.solution.items.map((item) => (
                <li
                  key={item.label}
                  className="flex justify-between border-b border-outline-variant/20 pb-2"
                >
                  <span className="text-label-caps">{item.label}</span>
                  <span className="text-secondary">{item.value}</span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
