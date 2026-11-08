"use client";
import { useState } from "react";
import Link from "next/link";
import { useSession } from "@/components/session";
import { ErrorMessage } from "@/components/report-ui";
export default function AccessPage() {
  const { token, setToken } = useSession();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  async function signIn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!url || !key) return;
    setBusy(true);
    setError("");
    const values = new FormData(event.currentTarget);
    try {
      const response = await fetch(
        `${url.replace(/\/$/, "")}/auth/v1/token?grant_type=password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", apikey: key },
          body: JSON.stringify({
            email: values.get("email"),
            password: values.get("password"),
          }),
        },
      );
      const result = await response.json();
      if (!response.ok || !result.access_token)
        throw new Error(
          "No pudimos iniciar sesión. Revisa tus datos o intenta más tarde.",
        );
      setToken(result.access_token);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "No pudimos conectar con el servicio de acceso.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <main id="contenido" className="workspace">
      <div className="panel auth-panel">
        <p className="location-label">Tu participación, con privacidad</p>
        <h1>{token ? "Sesión iniciada" : "Accede a tu cuenta"}</h1>
        {token ? (
          <>
            <p>
              Tu identidad se verifica en el servidor para cada operación. La
              sesión se conserva solo mientras esta aplicación permanece
              abierta.
            </p>
            <div className="form-actions">
              <Link className="button primary" href="/reportes/nuevo">
                Crear reporte
              </Link>
              <Link className="button secondary" href="/moderacion">
                Moderación
              </Link>
              <button
                className="button secondary"
                onClick={() => setToken(null)}
              >
                Cerrar sesión
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="hint">
              Necesitas una cuenta del piloto para enviar reportes. No mostramos
              tu correo en las publicaciones.
            </p>
            {!url || !key ? (
              <div className="feedback info" role="status">
                El acceso aún no está disponible. Puedes explorar la plataforma
                y preparar un reporte sin enviarlo.
              </div>
            ) : (
              <form onSubmit={signIn}>
                <label className="field">
                  Correo electrónico
                  <input
                    name="email"
                    type="email"
                    autoComplete="username"
                    required
                    maxLength={254}
                  />
                </label>
                <label className="field">
                  Contraseña
                  <input
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    maxLength={200}
                  />
                </label>
                <div className="form-actions">
                  <button className="button primary" disabled={busy}>
                    {busy ? "Accediendo…" : "Iniciar sesión"}
                  </button>
                </div>
              </form>
            )}
            {error && <ErrorMessage message={error} />}
          </>
        )}
        <p className="hint">
          La plataforma es independiente y no es un canal de emergencias.
        </p>
      </div>
    </main>
  );
}
