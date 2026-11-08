import type { ReportStatus } from "@/features/reports/domain/report";
export const statusLabels: Record<ReportStatus, string> = {
  PENDING_MODERATION: "Pendiente de revisión",
  PUBLISHED: "Publicado",
  UNDER_REVIEW: "En seguimiento",
  SOLUTION_REPORTED: "Solución comunicada",
  SOLUTION_VERIFIED: "Solución verificada",
  REJECTED: "Rechazado",
};
export function StatusBadge({ status }: { status: ReportStatus }) {
  return (
    <span className={`status-badge state-${status.toLowerCase()}`}>
      {statusLabels[status]}
    </span>
  );
}
export function ErrorMessage({
  message,
  retry,
}: {
  message: string;
  retry?: () => void;
}) {
  return (
    <div className="feedback error" role="alert">
      <strong>No pudimos completar la solicitud</strong>
      <p>{message}</p>
      {retry && (
        <button type="button" className="button secondary" onClick={retry}>
          Reintentar
        </button>
      )}
    </div>
  );
}
export const formatDate = (value: string) =>
  new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeZone: "America/Mexico_City",
  }).format(new Date(value));
