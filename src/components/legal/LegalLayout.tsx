import type { ReactNode } from "react";
import { Link } from "react-router-dom";

type LegalLayoutProps = {
  eyebrow: string;
  title: string;
  updatedAt: string;
  children: ReactNode;
};

export default function LegalLayout({
  eyebrow,
  title,
  updatedAt,
  children,
}: LegalLayoutProps) {
  return (
    <section className="min-h-screen bg-background px-margin-mobile pt-28 pb-20 md:px-margin-desktop md:pt-40 md:pb-32">
      <div className="mx-auto max-w-2xl">
        <span className="mb-4 block text-label-caps tracking-widest text-secondary uppercase">
          {eyebrow}
        </span>
        <h1 className="font-serif mb-3 text-headline-lg-mobile text-on-surface uppercase md:text-headline-lg">
          {title}
        </h1>
        <p className="mb-12 text-sm text-on-surface-variant">
          Última atualização: {updatedAt}
        </p>
        <div className="legal-prose flex flex-col gap-6 text-sm leading-relaxed text-on-surface-variant [&_h2]:font-serif [&_h2]:mt-4 [&_h2]:text-lg [&_h2]:text-on-surface [&_h2]:uppercase [&_li]:ml-5 [&_li]:list-disc [&_strong]:text-on-surface">
          {children}
        </div>
        <Link
          to="/"
          className="mt-16 inline-block text-sm text-on-surface-variant hover:text-secondary"
        >
          Voltar à loja
        </Link>
      </div>
    </section>
  );
}
