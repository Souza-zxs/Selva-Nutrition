import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export type ProductReview = {
  id: string;
  author_name: string;
  rating: number;
  comment: string | null;
  created_at: string;
};

export function useProductReviews(productId: string | undefined) {
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!productId) return;
    setLoading(true);
    const { data } = await supabase
      .from("product_reviews")
      .select("id, author_name, rating, comment, created_at")
      .eq("product_id", productId)
      .eq("approved", true)
      .order("created_at", { ascending: false });
    setReviews((data as ProductReview[]) ?? []);
    setLoading(false);
  }, [productId]);

  useEffect(() => {
    load();
  }, [load]);

  const average =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : null;

  async function submitReview(input: {
    author_name: string;
    rating: number;
    comment: string;
  }) {
    if (!productId) return { error: "Produto inválido" };
    const { error } = await supabase.from("product_reviews").insert({
      product_id: productId,
      author_name: input.author_name,
      rating: input.rating,
      comment: input.comment || null,
    });
    return { error: error?.message ?? null };
  }

  return { reviews, average, loading, submitReview };
}
