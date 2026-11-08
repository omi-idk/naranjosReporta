import Link from "next/link";
export default function NotFound() {
  return (
    <main id="contenido" className="workspace">
      <section className="panel auth-panel">
        <h1>No encontramos esta página</h1>
        <p>
          El enlace puede haber cambiado. Puedes continuar en el explorador de
          reportes.
        </p>
        <Link className="button primary" href="/reportes">
          Explorar reportes
        </Link>
      </section>
    </main>
  );
}
