"use client";
import { use, useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/components/api-client";
import { ReportMap } from "@/components/map";
import {
  StatusBadge,
  ErrorMessage,
  formatDate,
  statusLabels,
} from "@/components/report-ui";
import { useSession } from "@/components/session";
import type { ReportDetailDto } from "@/features/reports/application/contracts";
export default function DetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { token } = useSession();
  const [report, setReport] = useState<ReportDetailDto | null>(null);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    api<ReportDetailDto>(`/api/reports/${encodeURIComponent(id)}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      signal: controller.signal,
    })
      .then(setReport)
      .catch((e: Error) => {
        if (e.name !== "AbortError") setError(e.message);
      });
    return () => controller.abort();
  }, [id, token, retry]);
  return (
    <main id="contenido" className="workspace">
      <Link href="/reportes" className="back-link">
        ← Volver a reportes
      </Link>
      {error ? (
        <ErrorMessage
          message={error}
          retry={() => {
            setError("");
            setRetry((n) => n + 1);
          }}
        />
      ) : !report ? (
        <p role="status" className="panel">
          Cargando reporte…
        </p>
      ) : (
        <>
          <div className="page-heading">
            <p className="location-label">
              {report.category.name} · Reporte {report.id.slice(0, 8)}
            </p>
            <h1>{report.title}</h1>
            <StatusBadge status={report.status} />
          </div>
          <div className="detail-layout">
            <section className="panel">
              <h2>Descripción</h2>
              <p className="detail-description">{report.description}</p>
              <dl className="metadata">
                <div>
                  <dt>Fecha de registro</dt>
                  <dd>{formatDate(report.createdAt)}</dd>
                </div>
                <div>
                  <dt>Última actualización</dt>
                  <dd>{formatDate(report.updatedAt)}</dd>
                </div>
                <div>
                  <dt>Identificador</dt>
                  <dd>{report.id}</dd>
                </div>
                <div>
                  <dt>Ubicación pública</dt>
                  <dd>
                    Aproximada · {report.latitude}, {report.longitude}
                  </dd>
                </div>
              </dl>
              <h2>Seguimiento</h2>
              <ol className="timeline">
                {report.events.map((event) => (
                  <li key={event.id}>
                    <strong>{statusLabels[event.toStatus]}</strong>
                    <time dateTime={event.createdAt}>
                      {formatDate(event.createdAt)}
                    </time>
                  </li>
                ))}
              </ol>
              {report.status === "PENDING_MODERATION" && (
                <div className="feedback info">
                  Tu reporte está registrado y pendiente de revisión. Todavía no
                  es visible públicamente.
                </div>
              )}
              <p className="hint">
                Una solución comunicada por la comunidad no equivale a una
                solución verificada ni a una acción oficial del Ayuntamiento.
              </p>
            </section>
            <aside>
              <ReportMap reports={[report]} />
              <p className="map-footnote">
                Ubicación aproximada para proteger la privacidad.
              </p>
            </aside>
          </div>
        </>
      )}
    </main>
  );
}
