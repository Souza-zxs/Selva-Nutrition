import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { Product } from "../types/product";

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("active", true)
        .order("created_at", { ascending: true });

      if (cancelled) return;
      if (error) {
        setError(error.message);
      } else {
        setProducts(data as Product[]);
      }
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { products, loading, error };
}

export function useProduct(slug: string | undefined) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);

    supabase
      .from("products")
      .select("*")
      .eq("slug", slug)
      .eq("active", true)
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) setError(error.message);
        setProduct((data as Product) ?? null);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  return { product, loading, error };
}
