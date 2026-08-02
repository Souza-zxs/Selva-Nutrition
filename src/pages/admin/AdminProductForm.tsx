import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type FormEvent,
} from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { slugify } from "../../lib/slugify";
import Icon from "../../components/Icon";
import Button from "../../components/ui/Button";

const inputClass =
  "carved-well w-full border-none bg-surface-dim px-4 py-3 text-sm text-on-surface focus:ring-1 focus:ring-secondary/50";
const labelClass =
  "mb-2 block text-label-caps text-on-surface-variant uppercase";

export default function AdminProductForm() {
  const { id } = useParams<{ id: string }>();
  const isNew = !id;
  const navigate = useNavigate();
  const fileInputs = useRef<(HTMLInputElement | null)[]>([]);

  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [name, setName] = useState("");
  const [tag, setTag] = useState("");
  const [body, setBody] = useState("");
  const [price, setPrice] = useState("");
  const [images, setImages] = useState<string[]>(["", "", ""]);
  const [stock, setStock] = useState("0");
  const [active, setActive] = useState(true);
  const [weightKg, setWeightKg] = useState("0.3");
  const [isFeatured, setIsFeatured] = useState(false);
  const [salePrice, setSalePrice] = useState("");

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<boolean[]>([false, false, false]);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isNew) return;
    supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single()
      .then(({ data }) => {
        if (data) {
          setSlug(data.slug);
          setSlugEdited(true);
          setName(data.name);
          setTag(data.tag ?? "");
          setBody(data.body ?? "");
          setPrice(String(data.price));
          const gallery: string[] =
            data.images?.length > 0
              ? data.images
              : data.image
                ? [data.image]
                : [];
          setImages([gallery[0] ?? "", gallery[1] ?? "", gallery[2] ?? ""]);
          setStock(String(data.stock));
          setActive(data.active);
          setWeightKg(String(data.weight_kg));
          setIsFeatured(data.is_featured);
          setSalePrice(data.sale_price != null ? String(data.sale_price) : "");
        }
        setLoading(false);
      });
  }, [id, isNew]);

  function handleNameChange(value: string) {
    setName(value);
    if (!slugEdited) setSlug(slugify(value));
  }

  async function handleFile(index: number, file: File | null | undefined) {
    if (!file) return;
    setUploading((prev) => prev.map((v, i) => (i === index ? true : v)));
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    const { data, error: invokeError } = await supabase.functions.invoke(
      "admin-upload-image",
      { body: formData },
    );

    setUploading((prev) => prev.map((v, i) => (i === index ? false : v)));
    if (invokeError || data?.error) {
      setError(data?.error ?? invokeError.message);
      return;
    }
    setImages((prev) => prev.map((v, i) => (i === index ? data.url : v)));
  }

  function handleDrop(index: number, e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOverIndex(null);
    handleFile(index, e.dataTransfer.files[0]);
  }

  function handleFileInput(index: number, e: ChangeEvent<HTMLInputElement>) {
    handleFile(index, e.target.files?.[0]);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (isFeatured) {
      if (!salePrice) {
        setError("Informe o preço promocional para marcar o produto em oferta.");
        return;
      }
      if (Number(salePrice) >= Number(price)) {
        setError("O preço promocional precisa ser menor que o preço normal.");
        return;
      }
    }

    setSaving(true);

    const gallery = images.filter(Boolean);

    const payload = {
      slug,
      name,
      tag: tag || null,
      body: body || null,
      price: Number(price),
      image: gallery[0] ?? null,
      images: gallery,
      stock: Number(stock),
      active,
      weight_kg: Number(weightKg),
      is_featured: isFeatured,
      sale_price: isFeatured ? Number(salePrice) : null,
    };

    const { error } = isNew
      ? await supabase.from("products").insert(payload)
      : await supabase.from("products").update(payload).eq("id", id);

    setSaving(false);
    if (error) {
      setError(error.message);
      return;
    }
    navigate("/admin/produtos");
  }

  if (loading) return <p className="text-on-surface-variant">Carregando...</p>;

  return (
    <div className="max-w-3xl">
      <Link
        to="/admin/produtos"
        className="mb-8 inline-flex items-center gap-2 text-sm text-on-surface-variant hover:text-secondary"
      >
        <Icon name="arrow_back" /> Voltar aos produtos
      </Link>

      <form className="grid gap-10 md:grid-cols-[220px_1fr]" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-6">
          <span className={labelClass}>Fotos (até 3)</span>
          {[0, 1, 2].map((index) => (
            <div key={index}>
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOverIndex(index);
                }}
                onDragLeave={() => setDragOverIndex(null)}
                onDrop={(e) => handleDrop(index, e)}
                onClick={() => fileInputs.current[index]?.click()}
                className={`metallic-border relative flex aspect-square cursor-pointer flex-col items-center justify-center gap-2 bg-on-surface p-4 text-center transition-colors ${
                  dragOverIndex === index ? "ring-2 ring-secondary" : ""
                }`}
              >
                {images[index] ? (
                  <img
                    src={images[index]}
                    alt={`${name || "Produto"} — foto ${index + 1}`}
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <>
                    <Icon
                      name="upload"
                      className="text-3xl text-primary-container opacity-60"
                    />
                    <span className="text-xs text-primary-container opacity-70">
                      {index === 0
                        ? "Arraste uma foto ou clique para escolher"
                        : "Foto opcional"}
                    </span>
                  </>
                )}
                {uploading[index] && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-xs text-on-surface">
                    Enviando...
                  </div>
                )}
                <input
                  ref={(el) => {
                    fileInputs.current[index] = el;
                  }}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  className="hidden"
                  onChange={(e) => handleFileInput(index, e)}
                />
              </div>
              {images[index] && (
                <button
                  type="button"
                  onClick={() =>
                    setImages((prev) =>
                      prev.map((v, i) => (i === index ? "" : v)),
                    )
                  }
                  className="mt-2 text-xs text-on-surface-variant hover:text-error"
                >
                  Remover foto
                </button>
              )}
            </div>
          ))}
          <p className="text-xs text-on-surface-variant/70">
            A primeira foto é a capa do produto e aparece na listagem quando
            só há uma imagem. Com 2 ou 3 fotos, o catálogo alterna entre elas
            automaticamente.
          </p>
        </div>

        <div className="flex flex-col gap-6">
          <div className="admin-panel flex flex-col gap-5 p-6">
            <h3 className="text-xs font-bold tracking-wide text-on-surface-variant uppercase">
              Informações
            </h3>
            <div>
              <label className={labelClass} htmlFor="name">
                Nome
              </label>
              <input
                id="name"
                className={inputClass}
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                required
              />
              <div className="mt-2 flex items-center gap-2 text-xs text-on-surface-variant">
                <span>URL: /{slug || "..."}</span>
                {!slugEdited ? (
                  <button
                    type="button"
                    onClick={() => setSlugEdited(true)}
                    className="text-secondary hover:underline"
                  >
                    editar
                  </button>
                ) : (
                  <input
                    className="border-none bg-transparent text-secondary underline focus:outline-none"
                    value={slug}
                    onChange={(e) => setSlug(slugify(e.target.value))}
                  />
                )}
              </div>
            </div>

            <div>
              <label className={labelClass} htmlFor="tag">
                Selo (opcional)
              </label>
              <input
                id="tag"
                className={inputClass}
                placeholder="Ex: OURO LÍQUIDO"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
              />
            </div>

            <div>
              <label className={labelClass} htmlFor="body">
                Descrição
              </label>
              <textarea
                id="body"
                className={inputClass}
                rows={3}
                value={body}
                onChange={(e) => setBody(e.target.value)}
              />
            </div>
          </div>

          <div className="admin-panel flex flex-col gap-5 p-6">
            <h3 className="text-xs font-bold tracking-wide text-on-surface-variant uppercase">
              Preço, estoque &amp; frete
            </h3>
            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className={labelClass} htmlFor="price">
                  Preço (R$)
                </label>
                <input
                  id="price"
                  className={inputClass}
                  type="number"
                  step="0.01"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="stock">
                  Estoque
                </label>
                <input
                  id="stock"
                  className={inputClass}
                  type="number"
                  min="0"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className={labelClass} htmlFor="weight">
                Peso (kg) — usado para calcular o frete
              </label>
              <input
                id="weight"
                className={inputClass}
                type="number"
                step="0.01"
                min="0.01"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="admin-panel p-6">
            <label className="flex w-fit cursor-pointer items-center gap-3">
              <span className={labelClass + " mb-0"}>Em oferta / promoção</span>
              <span
                onClick={() => setIsFeatured((f) => !f)}
                className={`relative h-6 w-11 rounded-full transition-colors ${
                  isFeatured ? "bg-secondary" : "bg-surface-container-lowest"
                }`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-on-surface transition-transform ${
                    isFeatured ? "translate-x-5" : "translate-x-0.5"
                  }`}
                />
              </span>
            </label>
            {isFeatured && (
              <div className="mt-4">
                <label className={labelClass} htmlFor="salePrice">
                  Preço promocional (R$)
                </label>
                <input
                  id="salePrice"
                  className={inputClass}
                  type="number"
                  step="0.01"
                  min="0"
                  value={salePrice}
                  onChange={(e) => setSalePrice(e.target.value)}
                  required
                />
                <p className="mt-2 text-xs text-on-surface-variant">
                  O produto ganha um selo de oferta no catálogo, com o preço
                  original riscado e este preço em destaque.
                </p>
              </div>
            )}
          </div>

          <div className="admin-panel flex items-center justify-between p-6">
            <span className={labelClass + " mb-0"}>Visível no catálogo</span>
            <span
              onClick={() => setActive((a) => !a)}
              className={`relative h-6 w-11 cursor-pointer rounded-full transition-colors ${
                active ? "bg-secondary" : "bg-surface-dim"
              }`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-on-surface transition-transform ${
                  active ? "translate-x-5" : "translate-x-0.5"
                }`}
              />
            </span>
          </div>

          {error && <p className="text-sm text-error">{error}</p>}

          <Button
            type="submit"
            disabled={saving || uploading.some(Boolean)}
            className="mt-2 w-fit px-8 py-4"
          >
            {saving ? "Salvando..." : "Salvar produto"}
          </Button>
        </div>
      </form>
    </div>
  );
}
