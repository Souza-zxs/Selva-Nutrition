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

const inputClass =
  "carved-well w-full border-none bg-surface-dim px-4 py-3 text-sm text-on-surface focus:ring-1 focus:ring-secondary/50";
const labelClass =
  "mb-2 block text-label-caps text-on-surface-variant uppercase";

export default function AdminProductForm() {
  const { id } = useParams<{ id: string }>();
  const isNew = !id;
  const navigate = useNavigate();
  const fileInput = useRef<HTMLInputElement>(null);

  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [name, setName] = useState("");
  const [tag, setTag] = useState("");
  const [body, setBody] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState("");
  const [stock, setStock] = useState("0");
  const [active, setActive] = useState(true);

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
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
          setImage(data.image ?? "");
          setStock(String(data.stock));
          setActive(data.active);
        }
        setLoading(false);
      });
  }, [id, isNew]);

  function handleNameChange(value: string) {
    setName(value);
    if (!slugEdited) setSlug(slugify(value));
  }

  async function handleFile(file: File | null | undefined) {
    if (!file) return;
    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    const { data, error: invokeError } = await supabase.functions.invoke(
      "admin-upload-image",
      { body: formData },
    );

    setUploading(false);
    if (invokeError || data?.error) {
      setError(data?.error ?? invokeError.message);
      return;
    }
    setImage(data.url);
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  }

  function handleFileInput(e: ChangeEvent<HTMLInputElement>) {
    handleFile(e.target.files?.[0]);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      slug,
      name,
      tag: tag || null,
      body: body || null,
      price: Number(price),
      image: image || null,
      stock: Number(stock),
      active,
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
        <div>
          <span className={labelClass}>Foto</span>
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInput.current?.click()}
            className={`metallic-border relative flex aspect-square cursor-pointer flex-col items-center justify-center gap-2 bg-on-surface p-4 text-center transition-colors ${
              dragOver ? "ring-2 ring-secondary" : ""
            }`}
          >
            {image ? (
              <img
                src={image}
                alt={name || "Produto"}
                className="h-full w-full object-contain"
              />
            ) : (
              <>
                <Icon
                  name="upload"
                  className="text-3xl text-primary-container opacity-60"
                />
                <span className="text-xs text-primary-container opacity-70">
                  Arraste uma foto ou clique para escolher
                </span>
              </>
            )}
            {uploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-xs text-on-surface">
                Enviando...
              </div>
            )}
            <input
              ref={fileInput}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              className="hidden"
              onChange={handleFileInput}
            />
          </div>
          {image && (
            <button
              type="button"
              onClick={() => setImage("")}
              className="mt-2 text-xs text-on-surface-variant hover:text-error"
            >
              Remover foto
            </button>
          )}
        </div>

        <div className="flex flex-col gap-5">
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

          <label className="flex w-fit cursor-pointer items-center gap-3">
            <span className={labelClass + " mb-0"}>
              Visível no catálogo
            </span>
            <span
              onClick={() => setActive((a) => !a)}
              className={`relative h-6 w-11 rounded-full transition-colors ${
                active ? "bg-secondary" : "bg-surface-dim"
              }`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-on-surface transition-transform ${
                  active ? "translate-x-5" : "translate-x-0.5"
                }`}
              />
            </span>
          </label>

          {error && <p className="text-sm text-error">{error}</p>}

          <button
            type="submit"
            disabled={saving || uploading}
            className="mt-2 w-fit bg-secondary px-8 py-4 text-label-caps text-primary-container uppercase transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Salvando..." : "Salvar produto"}
          </button>
        </div>
      </form>
    </div>
  );
}
