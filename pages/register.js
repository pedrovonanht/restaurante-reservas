import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";

import { AuthShell } from "components/layout/auth-shell";
import { Input } from "components/ui/input";
import { Label } from "components/ui/label";
import { Button } from "components/ui/button";
import { useAuth } from "context/auth-context";
import { validateRegister, hasErrors } from "lib/validate";

export default function RegisterPage() {
  const router = useRouter();
  const { user, loading, register } = useAuth();

  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) router.replace("/");
  }, [loading, user, router]);

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    const errors = validateRegister(form);
    setFieldErrors(errors);
    setSubmitError(null);
    if (hasErrors(errors)) return;

    setSubmitting(true);
    try {
      await register(form);
      router.replace("/");
    } catch (err) {
      setSubmitError(err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell
      title="Criar conta"
      subtitle="Comece a gerenciar as reservas do seu restaurante."
      footer={
        <>
          Já tem uma conta?{" "}
          <Link href="/login" className="font-semibold text-primary">
            Entrar
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="username">Nome de usuário</Label>
          <Input
            id="username"
            autoComplete="username"
            placeholder="seu_usuario"
            value={form.username}
            onChange={(e) => update("username", e.target.value)}
            aria-invalid={!!fieldErrors.username}
          />
          {fieldErrors.username ? (
            <p className="text-[12px] text-destructive">
              {fieldErrors.username}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="voce@exemplo.com"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
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
            autoComplete="new-password"
            placeholder="Mínimo de 8 caracteres"
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
            aria-invalid={!!fieldErrors.password}
          />
          {fieldErrors.password ? (
            <p className="text-[12px] text-destructive">
              {fieldErrors.password}
            </p>
          ) : null}
        </div>

        {submitError ? (
          <div className="rounded-lg border border-destructive/30 bg-danger-tint px-3 py-2 text-[13px] text-destructive">
            {submitError.message}
          </div>
        ) : null}

        <Button
          type="submit"
          className="h-[50px] w-full rounded-lg text-[15px] font-bold hover:bg-primary/90"
          disabled={submitting}
        >
          {submitting ? "Criando conta…" : "Criar conta"}
        </Button>
      </form>
    </AuthShell>
  );
}
