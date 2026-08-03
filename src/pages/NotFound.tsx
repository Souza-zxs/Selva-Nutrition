import { Link } from "react-router-dom";
import { buttonClass } from "../components/ui/Button";

export default function NotFound() {
  return (
    <section className="flex min-h-screen flex-col items-center justify-center bg-background px-margin-mobile pt-28 pb-20 text-center md:px-margin-desktop">
      <span className="mb-4 block text-label-caps tracking-widest text-secondary uppercase">
        Erro 404
      </span>
      <h1 className="font-serif mb-3 text-headline-lg-mobile text-on-surface uppercase md:text-headline-lg">
        Página não encontrada
      </h1>
      <p className="mb-10 max-w-md text-sm leading-relaxed text-on-surface-variant">
        O link que você seguiu pode estar quebrado ou a página foi movida.
        Volte para a loja e continue explorando a coleção.
      </p>
      <Link to="/" className={buttonClass("filled", "px-8 py-3")}>
        Voltar à loja
      </Link>
    </section>
  );
}
