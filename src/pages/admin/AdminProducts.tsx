import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { formatBRL } from "../../lib/currency";
import type { Product } from "../../types/product";
import Icon from "../../components/Icon";
import { OfferBadge, StockBadge } from "../../components/admin/StatusBadge";
import { buttonClass } from "../../components/ui/Button";

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: true });
    setProducts((data as Product[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function toggleActive(product: Product) {
    const nextActive = !product.active;
    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, active: nextActive } : p)),
    );
    const { error } = await supabase
      .from("products")
      .update({ active: nextActive })
      .eq("id", product.id);
    if (error) {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === product.id ? { ...p, active: product.active } : p,
        ),
      );
      alert(`Não foi possível atualizar a visibilidade: ${error.message}`);
    }
  }

  async function deleteProduct(product: Product) {
    if (!confirm(`Excluir "${product.name}" permanentemente?`)) return;
    const previous = products;
    setProducts((prev) => prev.filter((p) => p.id !== product.id));
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", product.id);
    if (error) {
      setProducts(previous);
      if (error.code === "23503") {
        alert(
          `"${product.name}" já foi vendido em pedidos anteriores e não pode ser excluído (isso apagaria o histórico desses pedidos). Use "Ocultar" para removê-lo da loja sem perder o histórico.`,
        );
      } else {
        alert(`Não foi possível excluir o produto: ${error.message}`);
      }
    }
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => p.name.toLowerCase().includes(q));
  }, [products, query]);

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="carved-well flex items-center gap-3 border border-outline-variant/10 bg-surface-dim px-4 py-3 sm:max-w-xs">
          <Icon name="search" className="text-on-surface-variant" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar produto..."
            className="w-full bg-transparent text-sm text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none"
          />
        </div>
        <Link
          to="/admin/produtos/novo"
          className={buttonClass("filled", "flex items-center justify-center gap-2 px-6 py-3")}
        >
          + Novo produto
        </Link>
      </div>

      {loading ? (
        <SkeletonRows />
      ) : filtered.length === 0 ? (
        <EmptyState hasQuery={query.length > 0} />
      ) : (
        <div className="admin-panel overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-outline-variant/15 bg-surface-container/30 text-label-caps text-on-surface-variant uppercase">
                <th className="py-4 pr-4 pl-6"></th>
                <th className="py-4 pr-4">Nome</th>
                <th className="py-4 pr-4">Preço</th>
                <th className="py-4 pr-4">Estoque</th>
                <th className="py-4 pr-4">Status</th>
                <th className="py-4 pr-6"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((product) => (
                <tr
                  key={product.id}
                  className="admin-row-hover border-b border-outline-variant/10 text-on-surface last:border-0"
                >
                  <td className="py-3 pr-4 pl-6">
                    <div className="flex h-12 w-12 items-center justify-center overflow-hidden bg-on-surface">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <Icon
                          name="spa"
                          className="text-2xl text-primary-container opacity-40"
                        />
                      )}
                    </div>
                  </td>
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      {product.name}
                      {product.is_featured && <OfferBadge />}
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-secondary">
                    {product.is_featured && product.sale_price != null ? (
                      <>
                        <span className="mr-2 text-xs text-on-surface-variant line-through">
                          {formatBRL(product.price)}
                        </span>
                        {formatBRL(product.sale_price)}
                      </>
                    ) : (
                      formatBRL(product.price)
                    )}
                  </td>
                  <td className="py-3 pr-4">
                    <StockBadge stock={product.stock} />
                  </td>
                  <td className="py-3 pr-4">
                    <span
                      className={`text-xs uppercase tracking-wide ${
                        product.active
                          ? "text-on-surface-variant"
                          : "text-on-surface-variant/50"
                      }`}
                    >
                      {product.active ? "Visível" : "Oculto"}
                    </span>
                  </td>
                  <td className="py-3 pr-6">
                    <div className="flex justify-end gap-4">
                      <Link
                        to={`/admin/produtos/${product.id}`}
                        className="text-on-surface hover:text-secondary hover:underline"
                      >
                        Editar
                      </Link>
                      <button
                        onClick={() => toggleActive(product)}
                        className="text-on-surface-variant hover:text-secondary"
                      >
                        {product.active ? "Ocultar" : "Mostrar"}
                      </button>
                      <button
                        onClick={() => deleteProduct(product)}
                        className="text-on-surface-variant hover:text-error"
                      >
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function SkeletonRows() {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="h-16 animate-pulse bg-surface-container-lowest"
        />
      ))}
    </div>
  );
}

function EmptyState({ hasQuery }: { hasQuery: boolean }) {
  return (
    <div className="admin-panel flex flex-col items-center gap-4 px-8 py-20 text-center">
      <Icon
        name="inventory"
        className="text-4xl text-secondary opacity-60"
      />
      {hasQuery ? (
        <p className="text-on-surface-variant">
          Nenhum produto encontrado para essa busca.
        </p>
      ) : (
        <>
          <p className="text-on-surface-variant">
            Ainda não há produtos cadastrados.
          </p>
          <Link
            to="/admin/produtos/novo"
            className={buttonClass("filled", "px-6 py-3")}
          >
            Cadastrar o primeiro
          </Link>
        </>
      )}
    </div>
  );
}
