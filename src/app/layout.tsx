import type { Metadata } from "next";
import "./globals.css";
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
        <a className="skip" href="#contenido">
          Ir al contenido
        </a>
        {children}
      </body>
    </html>
  );
}
