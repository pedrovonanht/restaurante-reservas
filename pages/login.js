import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";

import { AuthShell } from "components/layout/auth-shell";
import { Input } from "components/ui/input";
import { Label } from "components/ui/label";
import { Button } from "components/ui/button";
import { useAuth } from "context/auth-context";
import { validateLogin, hasErrors } from "lib/validate";

export default function LoginPage() {
  const router = useRouter();
  const { user, loading, login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) router.replace("/");
  }, [loading, user, router]);

  async function onSubmit(e) {
    e.preventDefault();
    const errors = validateLogin({ email, password });
    setFieldErrors(errors);
    setSubmitError(null);
    if (hasErrors(errors)) return;

    setSubmitting(true);
    try {
      await login(email, password);
      router.replace("/");
    } catch (err) {
      setSubmitError(err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell
      title="Entrar"
      subtitle="Acesse o painel de reservas do seu restaurante."
      footer={
        <>
          Não tem uma conta?{" "}
          <Link href="/register" className="font-semibold text-primary">
            Criar conta
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="voce@exemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={!!fieldErrors.email}
          />
          {fieldErrors.email ? (
            <p className="text-[12px] text-destructive">{fieldErrors.email}</p>
          ) : null}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">Senha</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={!!fieldErrors.password}
          />
          {fieldErrors.password ? (
            <p className="text-[12px] text-destructive">
              {fieldErrors.password}
            </p>
          ) : null}
        </div>

        {submitError ? (
          <div className="rounded-[10px] border border-destructive/30 bg-destructive/5 px-3 py-2 text-[13px] text-destructive">
            {submitError.message}
          </div>
        ) : null}

        <Button
          type="submit"
          className="h-[50px] w-full rounded-xl text-[15px] font-semibold hover:bg-primary/90"
          disabled={submitting}
        >
          {submitting ? "Entrando…" : "Entrar"}
        </Button>
      </form>
    </AuthShell>
  );
}
