"use client";
export default function PageError({ reset }: { reset: () => void }) {
  return (
    <main id="contenido" className="workspace">
      <section className="panel auth-panel" role="alert">
        <h1>No pudimos cargar la página</h1>
        <p>
          Intenta de nuevo. Si estabas preparando un reporte, confirma que se
          haya guardado antes de enviarlo otra vez.
        </p>
        <button className="button primary" onClick={reset}>
          Reintentar
        </button>
      </section>
    </main>
  );
}
