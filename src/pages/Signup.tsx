import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

export default function Signup() {
  const { signUp } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const { error } = await signUp(email, password, fullName);
    setSubmitting(false);
    if (error) {
      setError(error);
      return;
    }
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <section className="flex min-h-screen items-center justify-center bg-background px-margin-mobile pt-40 pb-32 md:px-margin-desktop">
        <div className="mx-auto max-w-md text-center">
          <h1 className="font-serif mb-4 text-headline-lg-mobile text-on-surface uppercase md:text-headline-lg">
            Quase lá
          </h1>
          <p className="text-on-surface-variant">
            Enviamos um link de confirmação para <strong>{email}</strong>.
            Confirme seu email para poder entrar.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-background px-margin-mobile pt-40 pb-32 md:px-margin-desktop">
      <div className="mx-auto max-w-md">
        <span className="mb-4 block text-label-caps tracking-widest text-secondary uppercase">
          Junte-se à elite
        </span>
        <h1 className="font-serif mb-10 text-headline-lg-mobile text-on-surface uppercase md:text-headline-lg">
          Criar conta
        </h1>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <Input
            placeholder="Nome completo"
            type="text"
            autoComplete="name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
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
            autoComplete="new-password"
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="text-sm text-error">{error}</p>}
          <Button type="submit" disabled={submitting} className="mt-2 py-4">
            {submitting ? "Criando..." : "Criar conta"}
          </Button>
        </form>
        <p className="mt-8 text-center text-sm text-on-surface-variant">
          Já tem conta?{" "}
          <Link to="/login" className="text-secondary hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </section>
  );
}
