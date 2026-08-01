import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { PLACEHOLDER_KIT_IDS } from "../data/catalogOverrides";
import { useProducts } from "../hooks/useProducts";
import { formatBRL } from "../lib/currency";
import { discountPercent } from "../lib/pricing";
import type { Product } from "../types/product";
import { StockBadge } from "./admin/StatusBadge";
import Icon from "./Icon";
import Reveal from "./motion/Reveal";
import Button from "./ui/Button";
import Input from "./ui/Input";
import QtyStepper from "./ui/QtyStepper";

export default function ProductCatalog() {
  const { products, loading, error } = useProducts();

  return (
    <section
      id="colecao"
      className="bg-background px-margin-mobile py-20 md:px-margin-desktop md:py-32"
    >
      <div className="mx-auto max-w-container-max">
        <Reveal className="mb-10 flex flex-col items-start justify-between gap-8 md:mb-16 md:flex-row md:items-end">
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
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3 lg:gap-12">
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
        </div>
        {!loading && <NewsletterBand delay={products.length * 100} />}
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
  const [qty, setQty] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  const isOnSale = product.is_featured && product.sale_price != null;
  const discount = discountPercent(product);
  const isPlaceholder = PLACEHOLDER_KIT_IDS.has(product.id);
  const outOfStock = product.stock <= 0;
  const unavailable = outOfStock || isPlaceholder;

  function handleAdd() {
    addItem(product, qty);
    setJustAdded(true);
    setQty(1);
    setTimeout(() => setJustAdded(false), 1600);
  }

  const media = (
    <>
      {isOnSale && (
        <span className="absolute top-3 left-3 z-10 bg-error px-3 py-1 text-[10px] font-semibold tracking-widest text-on-surface uppercase">
          Oferta{discount ? ` -${discount}%` : ""}
        </span>
      )}
      {unavailable && (
        <span className="absolute top-3 right-3 z-10 border border-outline-variant/40 bg-surface-container-lowest/90 px-3 py-1 text-[10px] font-semibold tracking-widest text-on-surface-variant uppercase backdrop-blur-sm">
          {isPlaceholder ? "Em breve" : "Esgotado"}
        </span>
      )}
      {product.image ? (
        <img
          alt={product.name}
          className={`h-full w-full object-contain transition-transform duration-500 ${
            unavailable ? "opacity-40 grayscale" : "group-hover:scale-105"
          }`}
          src={product.image}
        />
      ) : (
        <Icon
          name={product.icon ?? "spa"}
          className="text-6xl text-primary-container opacity-40"
        />
      )}
    </>
  );

  return (
    <Reveal
      className="product-card flex flex-col rounded-sm p-8 shadow-lg shadow-black/30 transition-all duration-500 ease-out hover:-translate-y-2 hover:shadow-2xl hover:shadow-black/50"
      delay={delay}
    >
      {isPlaceholder ? (
        <div className="metallic-border photo-frame-vignette group relative mb-8 flex aspect-square items-center justify-center overflow-hidden bg-on-surface p-6">
          {media}
        </div>
      ) : (
        <Link
          to={`/produto/${product.slug}`}
          className="metallic-border photo-frame-vignette group relative mb-8 flex aspect-square items-center justify-center overflow-hidden bg-on-surface p-6"
        >
          {media}
        </Link>
      )}
      <span className="mb-2 block text-[10px] tracking-widest text-secondary">
        {product.tag}
      </span>
      {isPlaceholder ? (
        <h3 className="font-serif mb-3 text-2xl text-on-surface uppercase">
          {product.name}
        </h3>
      ) : (
        <Link to={`/produto/${product.slug}`}>
          <h3 className="font-serif mb-3 text-2xl text-on-surface uppercase transition-colors hover:text-secondary">
            {product.name}
          </h3>
        </Link>
      )}
      <p className="mb-4 flex-grow text-sm text-on-surface-variant">
        {product.body}
      </p>
      {!isPlaceholder && !outOfStock && product.stock <= 10 && (
        <div className="mb-4">
          <StockBadge stock={product.stock} />
        </div>
      )}
      {isOnSale ? (
        <span className="mb-6 flex items-baseline gap-3">
          <span className="text-sm text-on-surface-variant line-through">
            {formatBRL(product.price)}
          </span>
          <span className="font-serif text-2xl text-secondary">
            {formatBRL(product.sale_price!)}
          </span>
        </span>
      ) : (
        <span className="font-serif mb-6 block text-2xl text-secondary">
          {formatBRL(product.price)}
        </span>
      )}
      <div className="flex items-center gap-3">
        <QtyStepper
          value={qty}
          onChange={setQty}
          max={outOfStock ? 1 : product.stock}
        />
        <Button onClick={handleAdd} disabled={unavailable} className="flex-1 py-3">
          {isPlaceholder
            ? "Em breve"
            : outOfStock
              ? "Esgotado"
              : justAdded
                ? "Adicionado!"
                : "Comprar"}
        </Button>
      </div>
    </Reveal>
  );
}

function NewsletterBand({ delay }: { delay: number }) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
  };

  return (
    <Reveal
      delay={delay}
      className="mt-14 flex flex-col items-center border-t border-outline-variant/15 pt-12 text-center md:mt-20 md:pt-16"
    >
      <span className="mb-3 block text-label-caps tracking-widest text-secondary uppercase">
        Fique por dentro
      </span>
      <h3 className="font-serif mb-3 text-xl text-on-surface uppercase md:text-2xl">
        Faça parte da Elite
      </h3>
      <p className="mb-6 max-w-md text-sm text-on-surface-variant">
        Receba protocolos semanais de biohacking e ofertas exclusivas direto
        na sua inbox.
      </p>
      {submitted ? (
        <p className="text-label-caps text-secondary uppercase">
          Obrigado! Verifique seu e-mail.
        </p>
      ) : (
        <form className="flex w-full max-w-sm gap-2" onSubmit={handleSubmit}>
          <Input
            className="flex-grow"
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Button type="submit" className="px-6">
            OK
          </Button>
        </form>
      )}
    </Reveal>
  );
}
