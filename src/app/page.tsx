import Link from "next/link";
import { Explorer } from "@/components/explorer";
export default function Home() {
  return (
    <main id="contenido" className="workspace">
      <section className="intro-row">
        <div>
          <p className="location-label">Naranjos-Amatlán, Veracruz</p>
          <h1>
            Lo que pasa en tu comunidad,
            <br className="desktop-break" /> en un mismo lugar.
          </h1>
          <p>Consulta incidencias, señala un problema y sigue su evolución.</p>
        </div>
        <div className="intro-actions">
          <Link className="button primary" href="/reportes/nuevo">
            Crear reporte <span aria-hidden="true">＋</span>
          </Link>
          <Link className="text-link" href="/reportes">
            Explorar reportes →
          </Link>
        </div>
      </section>
      <div className="section-heading">
        <h2>Explora la comunidad</h2>
        <span>Información ciudadana · publicación moderada</span>
      </div>
      <Explorer />
      <section className="how-it-works" aria-label="Cómo funciona">
        <div>
          <span>01</span>
          <h2>Ubica el problema</h2>
          <p>Elige un punto y describe qué ocurre, sin datos personales.</p>
        </div>
        <div>
          <span>02</span>
          <h2>Revisión comunitaria</h2>
          <p>Un moderador revisa el contenido antes de publicarlo.</p>
        </div>
        <div>
          <span>03</span>
          <h2>Sigue los cambios</h2>
          <p>Una solución comunicada se distingue de una verificada.</p>
        </div>
      </section>
    </main>
  );
}
