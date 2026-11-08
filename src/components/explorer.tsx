"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import type {
  CategoryDto,
  ReportListDto,
} from "@/features/reports/application/contracts";
import { api } from "./api-client";
import { ReportMap } from "./map";
import {
  ErrorMessage,
  formatDate,
  StatusBadge,
  statusLabels,
} from "./report-ui";
export function Explorer({
  initialView = "lista",
}: {
  initialView?: "lista" | "mapa";
}) {
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [data, setData] = useState<ReportListDto | null>(null);
  const [q, setQ] = useState("");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [view, setView] = useState(initialView);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    api<{ items: CategoryDto[] }>("/api/categories")
      .then((r) => setCategories(r.items))
      .catch(() => {});
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    const parameters = new URLSearchParams({ page: String(page), sort });
    if (query) parameters.set("q", query);
    if (category) parameters.set("category", category);
    if (status) parameters.set("status", status);
    api<ReportListDto>(`/api/reports?${parameters}`, {
      signal: controller.signal,
    })
      .then((result) => {
        setData(result);
        setError("");
      })
      .catch((e: Error) => {
        if (e.name !== "AbortError") {
          setError(e.message);
          setData(null);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [query, category, status, sort, page, retry]);
  function changeFilter(update: () => void) {
    setLoading(true);
    setPage(1);
    setRetry((value) => value + 1);
    update();
  }
  return (
    <section className="explorer" aria-label="Explorador de reportes">
      <div className="filterbar">
        <form
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            changeFilter(() => setQuery(q));
          }}
        >
          <label className="sr-only" htmlFor="buscar">
            Buscar reportes
          </label>
          <input
            id="buscar"
            type="search"
            placeholder="Buscar un problema o una calle"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            maxLength={100}
          />
          <button className="button secondary" type="submit">
            Buscar
          </button>
        </form>
        <label>
          Categoría
          <select
            value={category}
            onChange={(e) => changeFilter(() => setCategory(e.target.value))}
          >
            <option value="">Todas las categorías</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Estado
          <select
            value={status}
            onChange={(e) => changeFilter(() => setStatus(e.target.value))}
          >
            <option value="">Todos los estados</option>
            {(
              [
                "PUBLISHED",
                "UNDER_REVIEW",
                "SOLUTION_REPORTED",
                "SOLUTION_VERIFIED",
              ] as const
            ).map((s) => (
              <option key={s} value={s}>
                {statusLabels[s]}
              </option>
            ))}
          </select>
        </label>
        <label>
          Orden
          <select
            value={sort}
            onChange={(e) => changeFilter(() => setSort(e.target.value))}
          >
            <option value="newest">Más recientes</option>
            <option value="oldest">Más antiguos</option>
          </select>
        </label>
      </div>
      <div className="explorer-toolbar">
        <p>
          {loading
            ? "Consultando reportes…"
            : error
              ? "Consulta no disponible"
              : `${data?.items.length ?? 0} reportes en esta página`}
        </p>
        <div
          className="view-toggle"
          role="group"
          aria-label="Vista de reportes"
        >
          <button
            aria-pressed={view === "lista"}
            onClick={() => setView("lista")}
          >
            Lista
          </button>
          <button
            aria-pressed={view === "mapa"}
            onClick={() => setView("mapa")}
          >
            Mapa
          </button>
        </div>
      </div>
      <div className={`explorer-body view-${view}`}>
        <div className="results" aria-busy={loading}>
          {loading ? (
            <div className="empty" role="status">
              <span className="loader" />
              Consultando la comunidad…
            </div>
          ) : error ? (
            <ErrorMessage
              message={error}
              retry={() => {
                setLoading(true);
                setRetry((n) => n + 1);
              }}
            />
          ) : data?.items.length ? (
            <>
              <ul className="report-list">
                {data.items.map((r) => (
                  <li key={r.id}>
                    <Link href={`/reportes/${r.id}`} className="report-row">
                      <div className="report-row-top">
                        <span>{r.category.name}</span>
                        <StatusBadge status={r.status} />
                      </div>
                      <h2>{r.title}</h2>
                      <p>{r.description}</p>
                      <small>
                        {formatDate(r.createdAt)}{" "}
                        <span aria-hidden="true">·</span> Ver detalle →
                      </small>
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="pagination">
                <button
                  className="button secondary"
                  disabled={page === 1}
                  onClick={() => {
                    setLoading(true);
                    setPage((p) => p - 1);
                  }}
                >
                  Anterior
                </button>
                <span>Página {page}</span>
                <button
                  className="button secondary"
                  disabled={!data.hasMore}
                  onClick={() => {
                    setLoading(true);
                    setPage((p) => p + 1);
                  }}
                >
                  Siguiente
                </button>
              </div>
            </>
          ) : (
            <div className="empty">
              <span className="empty-symbol" aria-hidden="true">
                ◎
              </span>
              <h2>Aquí empieza el seguimiento.</h2>
              <p>
                No hay reportes publicados que coincidan con esta búsqueda.
                Puedes registrar un problema para revisión.
              </p>
              <Link className="button primary" href="/reportes/nuevo">
                Crear un reporte
              </Link>
            </div>
          )}
        </div>
        <div className="explorer-map">
          <ReportMap reports={data?.items} />
          <p className="map-footnote">
            El mapa muestra los resultados de esta página. Las ubicaciones
            públicas son aproximadas.
          </p>
        </div>
      </div>
    </section>
  );
}
