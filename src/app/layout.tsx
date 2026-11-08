import type { Metadata } from "next";
import "./globals.css";
import { Navigation } from "@/components/navigation";
import { SessionProvider } from "@/components/session";
import { PwaRegistration } from "@/components/pwa";
export const metadata: Metadata = {
  title: "Naranjos Reporta",
  description: "Plataforma ciudadana independiente de Naranjos-Amatlán.",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-MX">
      <body>
        <PwaRegistration />
        <a className="skip" href="#contenido">
          Ir al contenido
        </a>
        <SessionProvider>
          <Navigation />
          {children}
        </SessionProvider>
        <footer className="app-footer">
          <strong>Naranjos Reporta</strong>
          <p>
            Iniciativa ciudadana independiente. No es un servicio oficial del
            Ayuntamiento ni un servicio de emergencias. Un reporte no constituye
            una denuncia oficial.
          </p>
        </footer>
      </body>
    </html>
  );
}
