import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import Icon from "../components/Icon";
import ProductDescription from "../components/ProductDescription";
import ProductGallery from "../components/ProductGallery";
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
      <section className="min-h-screen bg-background px-margin-mobile pt-28 pb-20 md:px-margin-desktop md:pt-40 md:pb-32">
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
  const gallery =
    product.images && product.images.length > 0
      ? product.images
      : product.image
        ? [product.image]
        : [];

  function handleAdd() {
    if (!product) return;
    addItem(product, qty);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1600);
  }

  return (
    <section className="min-h-screen bg-background px-margin-mobile pt-28 pb-20 md:px-margin-desktop md:pt-40 md:pb-32">
      <div className="mx-auto max-w-5xl">
        <Link
          to="/#colecao"
          className="mb-10 inline-flex items-center gap-2 text-sm text-on-surface-variant hover:text-secondary"
        >
          <Icon name="arrow_back" /> Voltar à coleção
        </Link>

        <div className="grid items-start gap-12 md:grid-cols-2 lg:gap-16">
          <div className="md:sticky md:top-32">
            <ProductGallery images={gallery} productName={product.name} fallbackIcon={product.icon}>
              {isOnSale && (
                <span className="absolute top-4 left-4 z-10 bg-error px-3 py-1 text-[10px] font-semibold tracking-widest text-on-surface uppercase">
                  Oferta{discount ? ` -${discount}%` : ""}
                </span>
              )}
            </ProductGallery>
          </div>

          <div className="flex flex-col">
            <div className="border-b border-outline-variant/15 pb-6">
              {product.tag && (
                <span className="mb-3 block text-[10px] tracking-widest text-secondary">
                  {product.tag}
                </span>
              )}
              <h1 className="font-serif mb-4 text-headline-lg-mobile text-on-surface uppercase md:text-headline-lg">
                {product.name}
              </h1>
              <StockBadge stock={product.stock} />
            </div>

            <div className="border-b border-outline-variant/15 py-6">
              {isOnSale ? (
                <div className="flex items-baseline gap-3">
                  <span className="text-sm text-on-surface-variant line-through">
                    {formatBRL(product.price)}
                  </span>
                  <span className="font-serif text-3xl text-secondary">
                    {formatBRL(product.sale_price!)}
                  </span>
                </div>
              ) : (
                <span className="font-serif block text-3xl text-on-surface">
                  {formatBRL(product.price)}
                </span>
              )}

              <div className="mt-6 flex items-center gap-4">
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

              <div className="mt-4">
                <ShippingEstimate
                  weightKg={product.weight_kg * qty}
                  subtotal={effectivePrice(product) * qty}
                />
              </div>
            </div>

            {(product.body || product.narrative) && (
              <div className="border-b border-outline-variant/15 py-6">
                <ProductDescription
                  key={product.id}
                  body={product.body}
                  narrative={product.narrative}
                />
              </div>
            )}

            {product.specs && product.specs.length > 0 && (
              <div className="py-6">
                <span className="mb-4 block text-label-caps tracking-widest text-secondary uppercase">
                  Especificações
                </span>
                <ul className="flex flex-col gap-2">
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
              </div>
            )}
          </div>
        </div>

        <div className="mt-20">
          <ProductReviews productId={product.id} />
        </div>
      </div>
    </section>
  );
}
