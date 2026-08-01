import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

export default function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const { error } = await signIn(email, password);
    setSubmitting(false);
    if (error) {
      setError(error);
      return;
    }
    navigate("/");
  }

  return (
    <section className="min-h-screen bg-background px-margin-mobile pt-28 pb-20 md:px-margin-desktop md:pt-40 md:pb-32">
      <div className="mx-auto max-w-md">
        <span className="mb-4 block text-label-caps tracking-widest text-secondary uppercase">
          Bem-vindo de volta
        </span>
        <h1 className="font-serif mb-10 text-headline-lg-mobile text-on-surface uppercase md:text-headline-lg">
          Entrar
        </h1>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <Input
            placeholder="Email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            placeholder="Senha"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="text-sm text-error">{error}</p>}
          <Button type="submit" disabled={submitting} className="mt-2 py-4">
            {submitting ? "Entrando..." : "Entrar"}
          </Button>
        </form>
        <p className="mt-8 text-center text-sm text-on-surface-variant">
          Ainda não tem conta?{" "}
          <Link to="/cadastro" className="text-secondary hover:underline">
            Criar conta
          </Link>
        </p>
      </div>
    </section>
  );
}
