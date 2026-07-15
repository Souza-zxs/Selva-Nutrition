import { useState } from "react";
import { footerLinks } from "../data/content";
import Icon from "./Icon";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
  };

  return (
    <footer
      id="journal"
      className="texture-kraft border-t border-outline-variant/20 bg-surface-container-lowest"
    >
      <div className="mx-auto flex w-full max-w-container-max flex-col items-start justify-between gap-12 px-margin-mobile py-16 md:flex-row md:items-center md:px-margin-desktop">
        <div className="max-w-sm">
          <div className="mb-6 text-headline-lg font-extrabold text-secondary uppercase">
            SELVA
          </div>
          <p className="text-body-md text-on-surface-variant italic">
            "Primitive Strength, Refined Performance."
          </p>
          <div className="mt-8 flex gap-4">
            <a
              href="#"
              aria-label="Website"
              className="metallic-border flex h-10 w-10 items-center justify-center rounded-full transition-all hover:bg-secondary hover:text-primary-container"
            >
              <Icon name="public" className="text-xl" />
            </a>
            <a
              href="#"
              aria-label="Podcast"
              className="metallic-border flex h-10 w-10 items-center justify-center rounded-full transition-all hover:bg-secondary hover:text-primary-container"
            >
              <Icon name="podcasts" className="text-xl" />
            </a>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-12 md:grid-cols-2">
          <div className="flex flex-col gap-4">
            <span className="mb-2 text-[10px] tracking-[0.2em] text-secondary uppercase">
              Explore
            </span>
            {footerLinks.explore.map((link) => (
              <a
                key={link}
                href="#"
                className="text-body-md text-on-surface-variant transition-colors hover:text-secondary"
              >
                {link}
              </a>
            ))}
          </div>
          <div className="flex flex-col gap-4">
            <span className="mb-2 text-[10px] tracking-[0.2em] text-secondary uppercase">
              Legal
            </span>
            {footerLinks.legal.map((link) => (
              <a
                key={link}
                href="#"
                className="text-body-md text-on-surface-variant transition-colors hover:text-secondary"
              >
                {link}
              </a>
            ))}
          </div>
        </div>
        <div className="w-full md:w-auto">
          <p className="mb-4 text-[10px] text-secondary uppercase">
            Newsletter
          </p>
          {submitted ? (
            <p className="text-label-caps text-secondary uppercase">
              Inscrito com sucesso!
            </p>
          ) : (
            <form className="flex gap-2" onSubmit={handleSubmit}>
              <input
                className="carved-well w-full border-none bg-surface-container px-6 py-3 text-on-surface placeholder:text-on-surface-variant/30 focus:ring-1 focus:ring-secondary/50 md:w-64"
                placeholder="Seu email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button
                type="submit"
                className="bg-secondary px-6 py-3 text-label-caps text-primary-container uppercase"
              >
                OK
              </button>
            </form>
          )}
        </div>
      </div>
      <div className="border-t border-outline-variant/10 px-margin-mobile py-8 text-center md:px-margin-desktop">
        <p className="text-[12px] tracking-widest text-on-surface-variant/40 uppercase">
          © 2026 SELVA NUTRITION. PRIMITIVE STRENGTH, REFINED PERFORMANCE.
        </p>
      </div>
    </footer>
  );
}
