"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/components/api-client";
import { ErrorMessage, statusLabels } from "@/components/report-ui";
import type { StatsDto } from "@/features/reports/application/contracts";

const number = new Intl.NumberFormat("es-MX");

function CountTable({
  caption,
  label,
  rows,
}: {
  caption: string;
  label: string;
  rows: { label: string; count: number }[];
}) {
  return (
    <section className="panel">
      <table className="w-full border-collapse text-left text-sm">
        <caption className="pb-5 text-left text-lg font-semibold">
          {caption}
        </caption>
        <thead>
          <tr className="border-b border-slate-200">
            <th scope="col" className="pb-3 font-semibold">
              {label}
            </th>
            <th scope="col" className="pb-3 text-right font-semibold">
              Reportes
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} className="border-b border-slate-100">
              <th scope="row" className="py-3 pr-3 font-normal">
                {row.label}
              </th>
              <td className="py-3 text-right tabular-nums">
                {number.format(row.count)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 && (
        <p className="hint">Aún no hay reportes públicos para este desglose.</p>
      )}
    </section>
  );
}

function monthLabel(value: string): string {
  const [year, month] = value.split("-").map(Number);
  if (!year || !month || month < 1 || month > 12) return value;
  return new Intl.DateTimeFormat("es-MX", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, 1)));
}

export default function StatisticsPage() {
  const [data, setData] = useState<StatsDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    api<StatsDto>("/api/stats", { signal: controller.signal })
      .then((result) => {
        if (!controller.signal.aborted) setData(result);
      })
      .catch((cause: unknown) => {
        if (!controller.signal.aborted) {
          setError(
            cause instanceof Error
              ? cause.message
              : "No pudimos cargar las estadísticas.",
          );
        }
      });
    return () => controller.abort();
  }, [attempt]);

  function retry() {
    setError(null);
    setData(null);
    setAttempt((current) => current + 1);
  }

  return (
    <main id="contenido" className="workspace">
      <div className="page-heading">
        <h1>Estadísticas de reportes</h1>
        <p>
          Conteos de incidencias públicas registradas en la plataforma. No
          representan estadísticas oficiales del municipio.
        </p>
      </div>

      {error ? (
        <ErrorMessage message={error} retry={retry} />
      ) : !data ? (
        <div className="panel" role="status">
          <p>Cargando estadísticas…</p>
        </div>
      ) : (
        <div className="mb-10 grid gap-5">
          <section className="panel" aria-labelledby="total-publico">
            <h2 id="total-publico" className="m-0 text-lg font-semibold">
              Reportes públicos
            </h2>
            <p className="my-3 text-4xl font-semibold tabular-nums">
              {number.format(data.total)}
            </p>
            <p className="hint">
              Incluye publicaciones en seguimiento y soluciones comunicadas o
              verificadas. Excluye pendientes y rechazados.
            </p>
            {data.total === 0 && (
              <p>No hay incidencias públicas registradas todavía.</p>
            )}
            <Link className="text-link" href="/reportes">
              Explorar reportes
            </Link>
          </section>
          <div className="grid items-start gap-5 lg:grid-cols-2">
            <CountTable
              caption="Por categoría"
              label="Categoría"
              rows={data.byCategory.map((row) => ({
                label: row.name,
                count: row.count,
              }))}
            />
            <CountTable
              caption="Por estado actual"
              label="Estado"
              rows={data.byStatus.map((row) => ({
                label: statusLabels[row.status],
                count: row.count,
              }))}
            />
          </div>
          <CountTable
            caption="Publicaciones por mes de registro (UTC)"
            label="Mes de creación"
            rows={data.monthly.map((row) => ({
              label: monthLabel(row.month),
              count: row.count,
            }))}
          />
          <p className="hint">
            El desglose mensual agrupa por fecha de creación los reportes que
            actualmente son públicos. No mide la fecha de reparación ni el
            tiempo de respuesta de una autoridad.
          </p>
        </div>
      )}
    </main>
  );
}
