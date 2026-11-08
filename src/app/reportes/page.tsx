import { Explorer } from "@/components/explorer";
export default function ReportsPage() {
  return (
    <main id="contenido" className="workspace">
      <div className="page-heading">
        <p className="location-label">Consulta ciudadana</p>
        <h1>Explorar reportes</h1>
        <p>
          Busca por problema, categoría o estado. Consulta su ubicación y
          seguimiento.
        </p>
      </div>
      <Explorer />
    </main>
  );
}
