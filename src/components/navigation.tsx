"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "./session";
export function Navigation() {
  const path = usePathname();
  const { token } = useSession();
  return (
    <header className="app-header">
      <Link className="brand" href="/" aria-label="Naranjos Reporta, inicio">
        <span className="brand-symbol" aria-hidden="true">
          n<span>.</span>
        </span>
        <span>
          Naranjos <strong>Reporta</strong>
        </span>
      </Link>
      <nav aria-label="Navegación principal">
        <Link href="/" aria-current={path === "/" ? "page" : undefined}>
          Inicio
        </Link>
        <Link
          href="/reportes"
          aria-current={path === "/reportes" ? "page" : undefined}
        >
          Explorar
        </Link>
        <Link href="/mapa">Mapa</Link>
        <Link
          href="/acceso"
          aria-current={path === "/acceso" ? "page" : undefined}
        >
          {token ? "Mi sesión" : "Acceso"}
        </Link>
      </nav>
      <Link href="/reportes/nuevo" className="button primary header-create">
        Crear reporte <span aria-hidden="true">＋</span>
      </Link>
    </header>
  );
}
