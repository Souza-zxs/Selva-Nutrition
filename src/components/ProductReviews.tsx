import { useState, type FormEvent } from "react";
import { useProductReviews } from "../hooks/useProductReviews";
import ReviewStars from "./ReviewStars";
import Button from "./ui/Button";
import Input from "./ui/Input";

export default function ProductReviews({ productId }: { productId: string }) {
  const { reviews, average, loading, submitReview } =
    useProductReviews(productId);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const { error } = await submitReview({
      author_name: name,
      rating,
      comment,
    });

    setSubmitting(false);
    if (error) {
      setError(error);
      return;
    }
    setSubmitted(true);
    setShowForm(false);
    setName("");
    setComment("");
    setRating(5);
  }

  return (
    <section className="border-t border-outline-variant/20 pt-12">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-serif mb-2 text-xl text-on-surface uppercase">
            Avaliações
          </h2>
          {average != null ? (
            <div className="flex items-center gap-3">
              <ReviewStars rating={average} size="text-lg" />
              <span className="text-sm text-on-surface-variant">
                {average.toFixed(1)} de 5 · {reviews.length} avaliaç
                {reviews.length === 1 ? "ão" : "ões"}
              </span>
            </div>
          ) : (
            !loading && (
              <p className="text-sm text-on-surface-variant">
                Ainda sem avaliações — seja o primeiro a avaliar.
              </p>
            )
          )}
        </div>
        {!showForm && !submitted && (
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowForm(true)}
            className="px-6 py-3"
          >
            Avaliar produto
          </Button>
        )}
      </div>

      {submitted && (
        <p className="mb-8 text-sm text-secondary">
          Obrigado! Sua avaliação foi enviada e vai aparecer aqui assim que
          for aprovada.
        </p>
      )}

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-10 flex flex-col gap-4 bg-surface-container-lowest p-6"
        >
          <div>
            <span className="mb-2 block text-label-caps text-on-surface-variant uppercase">
              Sua nota
            </span>
            <ReviewStars
              rating={rating}
              size="text-2xl"
              interactive
              onChange={setRating}
            />
          </div>
          <Input
            placeholder="Seu nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <textarea
            className="carved-well border-none bg-surface-dim px-4 py-3 text-sm text-on-surface focus:ring-1 focus:ring-secondary/50"
            placeholder="Conte como foi sua experiência (opcional)"
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          {error && <p className="text-sm text-error">{error}</p>}
          <div className="flex gap-3">
            <Button type="submit" disabled={submitting} className="px-6 py-3">
              {submitting ? "Enviando..." : "Enviar avaliação"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowForm(false)}
              className="px-6 py-3"
            >
              Cancelar
            </Button>
          </div>
        </form>
      )}

      {reviews.length > 0 && (
        <ul className="flex flex-col gap-6">
          {reviews.map((review) => (
            <li
              key={review.id}
              className="border-b border-outline-variant/10 pb-6 last:border-0"
            >
              <div className="mb-2 flex items-center justify-between gap-4">
                <span className="text-sm text-on-surface uppercase">
                  {review.author_name}
                </span>
                <ReviewStars rating={review.rating} />
              </div>
              {review.comment && (
                <p className="text-sm text-on-surface-variant">
                  {review.comment}
                </p>
              )}
              <span className="mt-2 block text-xs text-on-surface-variant/50">
                {new Date(review.created_at).toLocaleDateString("pt-BR")}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
