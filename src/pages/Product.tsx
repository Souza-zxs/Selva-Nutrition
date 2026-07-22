import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import Icon from "../components/Icon";
import ProductReviews from "../components/ProductReviews";
import ShippingEstimate from "../components/ShippingEstimate";
import { StockBadge } from "../components/admin/StatusBadge";
import Button from "../components/ui/Button";
import QtyStepper from "../components/ui/QtyStepper";
import { useCart } from "../context/CartContext";
import { useProduct } from "../hooks/useProducts";
import { formatBRL } from "../lib/currency";
import { discountPercent, effectivePrice } from "../lib/pricing";

export default function Product() {
  const { slug } = useParams<{ slug: string }>();
  const { product, loading, error } = useProduct(slug);
  const { addItem } = useCart();
  const [qty, setQty] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  if (loading) {
    return (
      <section className="min-h-screen bg-background px-margin-mobile pt-40 pb-32 md:px-margin-desktop">
        <div className="mx-auto grid max-w-5xl gap-12 md:grid-cols-2">
          <div className="aspect-square animate-pulse bg-surface-container-lowest" />
          <div className="flex flex-col gap-4">
            <div className="h-8 w-2/3 animate-pulse bg-surface-container-lowest" />
            <div className="h-24 animate-pulse bg-surface-container-lowest" />
          </div>
        </div>
      </section>
    );
  }

  if (error || !product) {
    return (
      <section className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-margin-mobile text-center">
        <p className="text-on-surface-variant">Produto não encontrado.</p>
        <Link to="/" className="text-secondary hover:underline">
          Voltar à loja
        </Link>
      </section>
    );
  }

  const isOnSale = product.is_featured && product.sale_price != null;
  const discount = discountPercent(product);
  const outOfStock = product.stock <= 0;

  function handleAdd() {
    if (!product) return;
    addItem(product, qty);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1600);
  }

  return (
    <section className="min-h-screen bg-background px-margin-mobile pt-40 pb-32 md:px-margin-desktop">
      <div className="mx-auto max-w-5xl">
        <Link
          to="/#colecao"
          className="mb-10 inline-flex items-center gap-2 text-sm text-on-surface-variant hover:text-secondary"
        >
          <Icon name="arrow_back" /> Voltar à coleção
        </Link>

        <div className="grid gap-12 md:grid-cols-2">
          <div className="metallic-border relative flex aspect-square items-center justify-center overflow-hidden bg-on-surface p-10">
            {isOnSale && (
              <span className="absolute top-4 left-4 z-10 bg-error px-3 py-1 text-[10px] font-semibold tracking-widest text-on-surface uppercase">
                Oferta{discount ? ` -${discount}%` : ""}
              </span>
            )}
            {product.image ? (
              <img
                alt={product.name}
                className="h-full w-full object-contain"
                src={product.image}
              />
            ) : (
              <Icon
                name={product.icon ?? "spa"}
                className="text-8xl text-primary-container opacity-40"
              />
            )}
          </div>

          <div>
            {product.tag && (
              <span className="mb-3 block text-[10px] tracking-widest text-secondary">
                {product.tag}
              </span>
            )}
            <h1 className="font-serif mb-4 text-headline-lg-mobile text-on-surface uppercase md:text-headline-lg">
              {product.name}
            </h1>

            <div className="mb-6">
              <StockBadge stock={product.stock} />
            </div>

            {product.body && (
              <p className="mb-4 text-on-surface-variant">{product.body}</p>
            )}
            {product.narrative && (
              <p className="mb-6 text-sm text-on-surface-variant">
                {product.narrative}
              </p>
            )}

            {product.specs && product.specs.length > 0 && (
              <ul className="mb-8 flex flex-col gap-2">
                {product.specs.map((spec) => (
                  <li
                    key={spec}
                    className="flex items-center gap-2 text-sm text-on-surface-variant"
                  >
                    <Icon name="check_circle" className="text-secondary" />
                    {spec}
                  </li>
                ))}
              </ul>
            )}

            {isOnSale ? (
              <div className="mb-8 flex items-baseline gap-3">
                <span className="text-sm text-on-surface-variant line-through">
                  {formatBRL(product.price)}
                </span>
                <span className="text-2xl text-secondary">
                  {formatBRL(product.sale_price!)}
                </span>
              </div>
            ) : (
              <span className="mb-8 block text-2xl text-on-surface">
                {formatBRL(product.price)}
              </span>
            )}

            <div className="mb-8 flex items-center gap-4">
              <QtyStepper
                value={qty}
                onChange={setQty}
                max={outOfStock ? 1 : product.stock}
              />
              <Button
                onClick={handleAdd}
                disabled={outOfStock}
                className="flex-1 py-4"
              >
                {outOfStock ? "Esgotado" : justAdded ? "Adicionado!" : "Comprar"}
              </Button>
            </div>

            <ShippingEstimate
              weightKg={product.weight_kg * qty}
              subtotal={effectivePrice(product) * qty}
            />
          </div>
        </div>

        <div className="mt-20">
          <ProductReviews productId={product.id} />
        </div>
      </div>
    </section>
  );
}
