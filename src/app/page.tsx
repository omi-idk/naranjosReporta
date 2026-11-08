import Link from "next/link";
const categories = [
  "Baches",
  "Fugas de agua",
  "Alumbrado",
  "Basura",
  "Vialidades",
  "Espacios públicos",
];
export default function Home() {
  return (
    <>
      <header>
        <Link className="brand" href="/">
          NARANJOS <span>REPORTA</span>
        </Link>
        <span className="badge">Iniciativa ciudadana</span>
      </header>
      <main id="contenido">
        <section className="hero">
          <p className="eyebrow">NARANJOS-AMATLÁN · VERACRUZ</p>
          <h1>
            Un mejor entorno
            <br />
            empieza por <em>hacerlo visible.</em>
          </h1>
          <p className="intro">
            Un espacio ciudadano para registrar problemas de nuestra comunidad y
            dar seguimiento a su solución.
          </p>
          <a className="button" href="#estado">
            Conoce el proyecto <span aria-hidden="true">↗</span>
          </a>
          <p className="notice">
            Plataforma independiente. No es un servicio oficial del Ayuntamiento
            ni un servicio de emergencias.
          </p>
        </section>
        <section aria-labelledby="categorias">
          <p className="eyebrow">LO QUE PODEMOS MEJORAR</p>
          <h2 id="categorias">Cada detalle cuenta.</h2>
          <div className="grid">
            {categories.map((name, index) => (
              <article key={name}>
                <span className="number">0{index + 1}</span>
                <h3>{name}</h3>
              </article>
            ))}
          </div>
        </section>
        <section id="estado" className="status">
          <div>
            <p className="eyebrow">ESTADO DEL PROYECTO</p>
            <h2>Construyendo con transparencia.</h2>
          </div>
          <p>
            La plataforma está en desarrollo. Aún no recibe reportes ni muestra
            estadísticas, ubicaciones o incidencias reales. El registro se
            habilitará al completar los controles de identidad, privacidad y
            moderación.
          </p>
        </section>
      </main>
      <footer>
        Naranjos Reporta · Código abierto · Participación ciudadana
        independiente
      </footer>
    </>
  );
}
