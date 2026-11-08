"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { CategoryDto } from "@/features/reports/application/contracts";
import { createReportSchema } from "@/features/reports/domain/report";
import { api } from "@/components/api-client";
import { ReportMap } from "@/components/map";
import { ErrorMessage } from "@/components/report-ui";
import { useSession } from "@/components/session";
export default function NewReportPage() {
  const { token } = useSession();
  const router = useRouter();
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [categoryError, setCategoryError] = useState("");
  const [point, setPoint] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [error, setError] = useState("");
  const errorRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (error) errorRef.current?.focus();
  }, [error]);
  const [review, setReview] = useState<ReturnType<
    typeof createReportSchema.parse
  > | null>(null);
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState({
    title: "",
    description: "",
    categoryId: "",
  });
  useEffect(() => {
    api<{ items: CategoryDto[] }>("/api/categories")
      .then((r) => setCategories(r.items))
      .catch((e: Error) => setCategoryError(e.message));
  }, []);
  function select(point: { latitude: number; longitude: number }) {
    setPoint(point);
    setLat(String(point.latitude));
    setLng(String(point.longitude));
    setError("");
  }
  function applyCoordinates() {
    const latitude = Number(lat),
      longitude = Number(lng);
    if (
      !lat.trim() ||
      !lng.trim() ||
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude) ||
      Math.abs(latitude) > 90 ||
      Math.abs(longitude) > 180
    ) {
      setError(
        "Escribe una latitud entre −90 y 90 y una longitud entre −180 y 180.",
      );
      return;
    }
    select({ latitude, longitude });
  }
  function prepare(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const parsed = createReportSchema.safeParse({
      title: values.get("title"),
      description: values.get("description"),
      categoryId: values.get("categoryId"),
      latitude: point?.latitude,
      longitude: point?.longitude,
      locationConsent: values.get("consent") === "on",
    });
    if (!parsed.success) {
      setError(
        !point
          ? "Selecciona una ubicación en el mapa o aplica las coordenadas."
          : "Revisa título, categoría, descripción y consentimiento antes de continuar.",
      );
      return;
    }
    setError("");
    setDraft({
      title: parsed.data.title,
      description: parsed.data.description,
      categoryId: parsed.data.categoryId,
    });
    setReview(parsed.data);
  }
  async function submit() {
    if (!review || !token || busy) return;
    setBusy(true);
    setError("");
    try {
      const result = await api<{ id: string }>("/api/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(review),
      });
      router.push(`/reportes/${result.id}?creado=1`);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "No pudimos guardar el reporte.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <main id="contenido" className="workspace">
      <Link className="back-link" href="/reportes">
        ← Volver a explorar
      </Link>
      <div className="page-heading">
        <p className="location-label">Participación ciudadana</p>
        <h1>Crear reporte</h1>
        <p>
          Describe un problema de la comunidad. Se revisará antes de publicarse.
        </p>
      </div>
      <div className="form-layout">
        <div className="panel">
          {review ? (
            <section>
              <h2>Revisa antes de enviar</h2>
              <h3>{review.title}</h3>
              <p className="detail-description">{review.description}</p>
              <p>
                Categoría:{" "}
                {categories.find((c) => c.id === review.categoryId)?.name}
              </p>
              <p>
                Ubicación: {review.latitude}, {review.longitude}
              </p>
              <p className="hint">
                El reporte quedará pendiente de moderación. Tu identidad no se
                mostrará públicamente.
              </p>
              {!token && (
                <div className="feedback info">
                  Necesitas iniciar sesión antes de enviar. Al salir de esta
                  pantalla, el borrador no se conserva; copia tu descripción si
                  deseas guardarla.
                  <p>
                    <Link href="/acceso">Ir a acceso</Link>
                  </p>
                </div>
              )}
              <div className="form-actions">
                <button
                  type="button"
                  className="button secondary"
                  disabled={busy}
                  onClick={() => setReview(null)}
                >
                  Editar
                </button>
                <button
                  type="button"
                  className="button primary"
                  disabled={!token || busy}
                  onClick={submit}
                >
                  {busy ? "Guardando…" : "Confirmar y enviar"}
                </button>
              </div>
            </section>
          ) : (
            <form onSubmit={prepare}>
              <section className="form-section">
                <h2>1. ¿Qué está pasando?</h2>
                <p>
                  Comparte información concreta y evita nombres, teléfonos o
                  datos privados.
                </p>
                <label className="field">
                  Título
                  <input
                    name="title"
                    autoComplete="off"
                    defaultValue={draft.title}
                    required
                    minLength={10}
                    maxLength={120}
                    placeholder="Describe el problema en una frase"
                  />
                </label>
                <label className="field">
                  Categoría
                  <select
                    name="categoryId"
                    required
                    defaultValue={draft.categoryId}
                  >
                    <option value="" disabled>
                      Selecciona una categoría
                    </option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </label>
                {categoryError && (
                  <p className="hint" role="status">
                    No pudimos cargar las categorías. Puedes preparar la
                    descripción, pero no enviarla todavía.
                  </p>
                )}
                <label className="field">
                  Descripción
                  <textarea
                    name="description"
                    autoComplete="off"
                    defaultValue={draft.description}
                    required
                    minLength={30}
                    maxLength={2000}
                    placeholder="¿Qué ocurre? ¿Qué referencias públicas ayudan a ubicarlo?"
                  />
                  <span className="hint">Entre 30 y 2,000 caracteres.</span>
                </label>
              </section>
              <section className="form-section">
                <h2>2. Ubica el problema</h2>
                <p>
                  Acerca el mapa y toca el punto, o escribe coordenadas. No
                  solicitamos la ubicación de tu dispositivo.
                </p>
                <ReportMap selected={point} onSelect={select} />
                <div className="coordinates">
                  <label className="field">
                    Latitud
                    <input
                      type="number"
                      name="latitude"
                      inputMode="decimal"
                      step="any"
                      min={-90}
                      max={90}
                      value={lat}
                      onChange={(e) => setLat(e.target.value)}
                    />
                  </label>
                  <label className="field">
                    Longitud
                    <input
                      type="number"
                      name="longitude"
                      inputMode="decimal"
                      step="any"
                      min={-180}
                      max={180}
                      value={lng}
                      onChange={(e) => setLng(e.target.value)}
                    />
                  </label>
                </div>
                <button
                  type="button"
                  className="button secondary"
                  onClick={applyCoordinates}
                >
                  Aplicar coordenadas
                </button>
                {point && (
                  <p className="hint" role="status">
                    Ubicación seleccionada: {point.latitude}, {point.longitude}
                  </p>
                )}
                <label className="checkbox">
                  <input name="consent" type="checkbox" required />
                  Acepto compartir esta ubicación para revisar el reporte.
                </label>
              </section>
              <section className="form-section">
                <h2>3. Privacidad y revisión</h2>
                <p>
                  La fotografía es opcional. La carga de imágenes aún no está
                  disponible; podrás registrar el problema sin evidencia
                  fotográfica.
                </p>
                <div className="form-actions">
                  <button className="button primary" type="submit">
                    Revisar reporte
                  </button>
                  <Link className="text-link" href="/acceso">
                    {token ? "Ver mi sesión" : "Iniciar sesión para enviar"}
                  </Link>
                </div>
              </section>
            </form>
          )}
          {error && (
            <div ref={errorRef} tabIndex={-1}>
              <ErrorMessage message={error} />
            </div>
          )}
        </div>
        <aside className="sidebar-note">
          <h2>Un reporte útil y responsable</h2>
          <ul>
            <li>Describe un solo problema por reporte.</li>
            <li>
              Ubica infraestructura pública. Evita señalar domicilios
              particulares.
            </li>
            <li>
              No incluyas datos personales ni información que identifique a
              terceros.
            </li>
            <li>La publicación depende de una revisión comunitaria.</li>
          </ul>
          <p>
            La plataforma no garantiza atención municipal. Una solución
            comunicada necesita verificación.
          </p>
        </aside>
      </div>
    </main>
  );
}
