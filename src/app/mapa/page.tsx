import { Explorer } from "@/components/explorer";
export default function MapPage() {
  return (
    <main id="contenido" className="workspace">
      <div className="page-heading">
        <p className="location-label">Ubicaciones públicas aproximadas</p>
        <h1>Mapa de reportes</h1>
        <p>
          Explora los reportes publicados. El mapa comparte filtros con el
          listado.
        </p>
      </div>
      <Explorer initialView="mapa" />
    </main>
  );
}
