import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import Icon from "../../components/Icon";
import ReviewStars from "../../components/ReviewStars";

type Review = {
  id: string;
  author_name: string;
  rating: number;
  comment: string | null;
  approved: boolean;
  created_at: string;
  products: { name: string } | null;
};

export default function AdminReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"pending" | "approved">("pending");

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("product_reviews")
      .select("id, author_name, rating, comment, approved, created_at, products(name)")
      .order("created_at", { ascending: false });
    setReviews((data as unknown as Review[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function approve(review: Review) {
    setReviews((prev) =>
      prev.map((r) => (r.id === review.id ? { ...r, approved: true } : r)),
    );
    await supabase
      .from("product_reviews")
      .update({ approved: true })
      .eq("id", review.id);
  }

  async function remove(review: Review) {
    setReviews((prev) => prev.filter((r) => r.id !== review.id));
    await supabase.from("product_reviews").delete().eq("id", review.id);
  }

  const filtered = reviews.filter((r) =>
    filter === "pending" ? !r.approved : r.approved,
  );

  return (
    <div>
      <div className="mb-6 flex gap-2">
        {(["pending", "approved"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 text-label-caps uppercase transition-colors ${
              filter === f
                ? "bg-secondary text-primary-container"
                : "border border-outline-variant/30 text-on-surface-variant hover:text-secondary"
            }`}
          >
            {f === "pending" ? "Pendentes" : "Aprovadas"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="h-32 animate-pulse bg-surface-container-lowest" />
      ) : filtered.length === 0 ? (
        <div className="admin-panel flex flex-col items-center gap-4 px-8 py-20 text-center">
          <Icon name="check_circle" className="text-4xl text-secondary opacity-60" />
          <p className="text-on-surface-variant">
            {filter === "pending"
              ? "Nenhuma avaliação pendente."
              : "Nenhuma avaliação aprovada ainda."}
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-4">
          {filtered.map((review) => (
            <li
              key={review.id}
              className="admin-panel admin-row-hover p-6"
            >
              <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="text-on-surface uppercase">
                    {review.author_name}
                  </span>
                  <span className="ml-3 text-xs text-on-surface-variant">
                    {review.products?.name ?? "Produto removido"}
                  </span>
                </div>
                <ReviewStars rating={review.rating} />
              </div>
              {review.comment && (
                <p className="mb-4 text-sm text-on-surface-variant">
                  {review.comment}
                </p>
              )}
              <div className="flex items-center gap-4 text-sm">
                <span className="text-xs text-on-surface-variant/50">
                  {new Date(review.created_at).toLocaleDateString("pt-BR")}
                </span>
                {!review.approved && (
                  <button
                    onClick={() => approve(review)}
                    className="text-secondary hover:underline"
                  >
                    Aprovar
                  </button>
                )}
                <button
                  onClick={() => remove(review)}
                  className="text-on-surface-variant hover:text-error"
                >
                  Excluir
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
