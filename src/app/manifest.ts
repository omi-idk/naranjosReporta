import type { MetadataRoute } from "next";
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Naranjos Reporta",
    short_name: "Reporta",
    description: "Participación ciudadana independiente en Naranjos-Amatlán.",
    start_url: "/",
    display: "standalone",
    background_color: "#f8fafc",
    theme_color: "#315fbb",
    lang: "es-MX",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
