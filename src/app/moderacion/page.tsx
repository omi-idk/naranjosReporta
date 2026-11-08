"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { api } from "@/components/api-client";
import { ErrorMessage, formatDate, StatusBadge } from "@/components/report-ui";
import { useSession } from "@/components/session";
import type {
  ReportDto,
  ReportListDto,
} from "@/features/reports/application/contracts";

function ReviewCard({
  report,
  token,
  onReviewed,
}: {
  report: ReportDto;
  token: string;
  onReviewed: (id: string) => void;
}) {
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const button = (event.nativeEvent as SubmitEvent)
      .submitter as HTMLButtonElement | null;
    const to = button?.value;
    if (to !== "PUBLISHED" && to !== "REJECTED") return;
    if (reason.trim().length < 10) {
      setError("Explica la decisión con al menos 10 caracteres.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await api(`/api/reports/${report.id}/transitions`, {
        method: "POST",
        headers: {
          authorization: `Bearer ${token}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          to,
          reason: reason.trim(),
          version: report.version,
        }),
      });
      onReviewed(report.id);
    } catch (failure) {
      setError(
        failure instanceof Error
          ? failure.message
          : "No se guardó la decisión. Intenta de nuevo.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <article className="panel" style={{ marginBottom: 20 }} aria-busy={busy}>
      <div className="section-heading">
        <span>
          {report.category.name} · {formatDate(report.createdAt)}
        </span>
        <StatusBadge status={report.status} />
      </div>
      <h2 style={{ fontSize: 21, margin: "12px 0" }}>
        <Link href={`/reportes/${report.id}`}>{report.title}</Link>
      </h2>
      <p className="detail-description">{report.description}</p>
      <p className="hint">Identificador: {report.id}</p>
      <form onSubmit={submit}>
        <label className="field" htmlFor={`reason-${report.id}`}>
          Motivo de la decisión
          <textarea
            id={`reason-${report.id}`}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            required
            minLength={10}
            maxLength={1000}
            disabled={busy}
            aria-describedby={`reason-hint-${report.id}`}
          />
        </label>
        <p className="hint" id={`reason-hint-${report.id}`}>
          Registra lo que revisaste. Evita nombres, teléfonos y otros datos
          personales. El motivo queda en la auditoría interna.
        </p>
        {error && <ErrorMessage message={error} />}
        <div className="form-actions">
          <button
            className="button primary"
            name="decision"
            value="PUBLISHED"
            type="submit"
            disabled={busy}
          >
            {busy ? "Guardando…" : "Aprobar publicación"}
          </button>
          <button
            className="button secondary"
            name="decision"
            value="REJECTED"
            type="submit"
            disabled={busy}
          >
            Rechazar reporte
          </button>
        </div>
      </form>
    </article>
  );
}

export default function ModerationPage() {
  const { token } = useSession();
  const [data, setData] = useState<ReportListDto | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [resolvedToken, setResolvedToken] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    if (!token) return;
    let active = true;
    async function load() {
      try {
        const session = await api<{ role: string }>("/api/session", {
          headers: { authorization: `Bearer ${token}` },
        });
        if (session.role !== "MODERATOR")
          throw new Error("Tu cuenta no tiene permisos de moderación.");
        const queue = await api<ReportListDto>(`/api/moderation?page=${page}`, {
          headers: { authorization: `Bearer ${token}` },
        });
        if (active) {
          setData(queue);
          setError("");
        }
      } catch (failure) {
        if (active) {
          setData(null);
          setError(
            failure instanceof Error
              ? failure.message
              : "No se pudo consultar la cola.",
          );
        }
      } finally {
        if (active) {
          setResolvedToken(token);
          setLoading(false);
        }
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, [token, page, retry]);

  function reviewed(id: string) {
    setData((current) =>
      current
        ? {
            ...current,
            items: current.items.filter((report) => report.id !== id),
          }
        : null,
    );
    setNotice(
      "Decisión registrada. El cambio quedó guardado en el historial del reporte.",
    );
  }
  function changePage(next: number) {
    setLoading(true);
    setNotice("");
    setPage(next);
  }

  return (
    <main className="workspace" id="contenido">
      <div className="page-heading">
        <p className="location-label">Revisión comunitaria</p>
        <h1>Moderación de reportes</h1>
        <p>
          Revisa el contenido antes de publicarlo. Aprobar una publicación no
          verifica su solución ni implica atención oficial.
        </p>
      </div>
      {!token ? (
        <section className="panel" style={{ marginBottom: 40 }}>
          <h2>Accede con una cuenta autorizada</h2>
          <p>
            La cola está disponible exclusivamente para moderadores. Los
            permisos se verifican en el servidor.
          </p>
          <Link className="button primary" href="/acceso">
            Iniciar sesión
          </Link>
        </section>
      ) : (
        <div style={{ maxWidth: 900, marginBottom: 40 }}>
          {notice && (
            <p className="feedback success" role="status">
              {notice}
            </p>
          )}
          {loading || resolvedToken !== token ? (
            <div className="empty" role="status">
              <span className="loader" />
              Consultando reportes pendientes…
            </div>
          ) : error ? (
            <ErrorMessage
              message={error}
              retry={() => {
                setLoading(true);
                setRetry((value) => value + 1);
              }}
            />
          ) : (
            <>
              {data?.items.length ? (
                data.items.map((report) => (
                  <ReviewCard
                    key={report.id}
                    report={report}
                    token={token}
                    onReviewed={reviewed}
                  />
                ))
              ) : (
                <section className="panel">
                  <h2>No hay reportes pendientes en esta página</h2>
                  <p>
                    La cola se actualiza con los reportes recibidos. No se
                    muestran publicaciones ficticias.
                  </p>
                  <button
                    className="button secondary"
                    onClick={() => {
                      setLoading(true);
                      setRetry((value) => value + 1);
                    }}
                  >
                    Actualizar cola
                  </button>
                </section>
              )}
              <div className="pagination">
                <button
                  className="button secondary"
                  disabled={page === 1}
                  onClick={() => changePage(page - 1)}
                >
                  Anterior
                </button>
                <span>Página {page}</span>
                <button
                  className="button secondary"
                  disabled={!data?.hasMore}
                  onClick={() => changePage(page + 1)}
                >
                  Siguiente
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </main>
  );
}
