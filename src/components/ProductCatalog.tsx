import { useState } from "react";
import { useCart } from "../context/CartContext";
import { useProducts } from "../hooks/useProducts";
import { formatBRL } from "../lib/currency";
import type { Product } from "../types/product";
import Icon from "./Icon";
import Reveal from "./motion/Reveal";

export default function ProductCatalog() {
  const { products, loading, error } = useProducts();

  return (
    <section
      id="colecao"
      className="bg-background px-margin-mobile py-32 md:px-margin-desktop"
    >
      <div className="mx-auto max-w-container-max">
        <Reveal className="mb-16 flex flex-col items-end justify-between gap-8 md:flex-row">
          <div>
            <span className="mb-4 block text-label-caps tracking-widest text-secondary uppercase">
              Nossa Linha
            </span>
            <h2 className="font-serif text-headline-lg-mobile text-on-surface uppercase md:text-headline-lg">
              Coleção Raiz
            </h2>
          </div>
        </Reveal>
        {error && (
          <p className="mb-8 text-center text-sm text-error">
            Não foi possível carregar o catálogo agora. Tente novamente em
            instantes.
          </p>
        )}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {loading
            ? Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="aspect-square animate-pulse bg-surface-container-lowest"
                />
              ))
            : products.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  delay={index * 100}
                />
              ))}
          {!loading && (
            <NewsletterCard delay={products.length * 100} />
          )}
        </div>
      </div>
    </section>
  );
}

function ProductCard({
  product,
  delay,
}: {
  product: Product;
  delay: number;
}) {
  const { addItem } = useCart();
  const [justAdded, setJustAdded] = useState(false);

  function handleAdd() {
    addItem(product);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1600);
  }

  return (
    <Reveal className="product-card flex flex-col p-8" delay={delay}>
      <div className="metallic-border group mb-8 flex aspect-square items-center justify-center overflow-hidden bg-on-surface p-6">
        {product.image ? (
          <img
            alt={product.name}
            className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105"
            src={product.image}
          />
        ) : (
          <Icon
            name={product.icon ?? "spa"}
            className="text-6xl text-primary-container opacity-40"
          />
        )}
      </div>
      <span className="mb-2 block text-[10px] tracking-widest text-secondary">
        {product.tag}
      </span>
      <h3 className="font-serif mb-4 text-2xl text-on-surface uppercase">
        {product.name}
      </h3>
      <p className="mb-4 flex-grow text-sm text-on-surface-variant">
        {product.body}
      </p>
      <span className="mb-6 block text-body-lg text-on-surface">
        {formatBRL(product.price)}
      </span>
      <button
        onClick={handleAdd}
        className="w-full bg-secondary py-4 text-label-caps text-primary-container uppercase transition-all hover:brightness-110"
      >
        {justAdded ? "Adicionado!" : "Comprar"}
      </button>
    </Reveal>
  );
}

function NewsletterCard({ delay }: { delay: number }) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
  };

  return (
    <Reveal
      className="flex flex-col items-center justify-center bg-primary-container p-8 text-center"
      delay={delay}
    >
      <Icon name="history_edu" className="mb-6 text-6xl text-secondary" />
      <h3 className="font-serif mb-4 text-headline-lg text-on-surface uppercase">
        Faça parte da Elite
      </h3>
      <p className="mb-8 text-sm text-on-surface-variant">
        Receba protocolos semanais de biohacking e ofertas exclusivas direto
        na sua inbox.
      </p>
      {submitted ? (
        <p className="text-label-caps text-secondary uppercase">
          Obrigado! Verifique seu e-mail.
        </p>
      ) : (
        <form className="flex w-full gap-2" onSubmit={handleSubmit}>
          <input
            className="carved-well flex-grow border-none bg-surface-dim px-4 py-3 text-label-caps focus:ring-1 focus:ring-secondary/50"
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button
            type="submit"
            className="bg-secondary px-6 text-label-caps text-primary-container uppercase"
          >
            OK
          </button>
        </form>
      )}
    </Reveal>
  );
}
