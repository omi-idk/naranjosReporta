"use client";
import { useEffect, useRef, useState } from "react";
import type { Map as LeafletMap, Marker } from "leaflet";
import type { ReportDto } from "@/features/reports/application/contracts";
import "leaflet/dist/leaflet.css";
type Point = { latitude: number; longitude: number };
export function ReportMap({
  reports,
  selected,
  onSelect,
}: {
  reports?: ReportDto[];
  selected?: Point | null;
  onSelect?: (point: Point) => void;
}) {
  const element = useRef<HTMLDivElement>(null);
  const map = useRef<LeafletMap | null>(null);
  const markers = useRef<Marker[]>([]);
  const selection = useRef<Marker | null>(null);
  const selectCallback = useRef(onSelect);
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    selectCallback.current = onSelect;
  }, [onSelect]);
  useEffect(() => {
    let active = true;
    let observer: ResizeObserver | undefined;
    import("leaflet")
      .then((L) => {
        if (!active || !element.current) return;
        const instance = L.map(element.current, {
          scrollWheelZoom: false,
        }).setView([20, -100], 5);
        map.current = instance;
        L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 19,
        })
          .on("tileerror", () => setError(true))
          .addTo(instance);
        instance.on("click", (event: L.LeafletMouseEvent) =>
          selectCallback.current?.({
            latitude: Number(event.latlng.lat.toFixed(6)),
            longitude: Number(event.latlng.lng.toFixed(6)),
          }),
        );
        observer = new ResizeObserver(() => instance.invalidateSize());
        observer.observe(element.current);
        setLoaded(true);
      })
      .catch(() => setError(true));
    return () => {
      active = false;
      observer?.disconnect();
      map.current?.remove();
      map.current = null;
    };
  }, []);
  useEffect(() => {
    if (!loaded || !map.current) return;
    let active = true;
    import("leaflet").then((L) => {
      if (!active || !map.current) return;
      markers.current.forEach((marker) => marker.remove());
      markers.current = (reports ?? []).map((report) => {
        const node = document.createElement("div");
        const title = document.createElement("strong");
        title.textContent = report.title;
        const link = document.createElement("a");
        link.href = `/reportes/${encodeURIComponent(report.id)}`;
        link.textContent = "Ver reporte";
        node.append(title, document.createElement("br"), link);
        return L.marker([report.latitude, report.longitude], {
          icon: L.divIcon({
            className: "report-pin",
            html: "<span></span>",
            iconSize: [24, 24],
          }),
          title: report.title,
        })
          .addTo(map.current!)
          .bindPopup(node);
      });
      if (reports?.length)
        map.current.fitBounds(
          L.latLngBounds(reports.map((r) => [r.latitude, r.longitude])),
          { padding: [35, 35], maxZoom: 15 },
        );
    });
    return () => {
      active = false;
    };
  }, [reports, loaded]);
  useEffect(() => {
    if (!loaded || !map.current || !selected) return;
    let active = true;
    import("leaflet").then((L) => {
      if (!active || !map.current) return;
      selection.current?.remove();
      selection.current = L.marker([selected.latitude, selected.longitude], {
        icon: L.divIcon({
          className: "selection-pin",
          html: "<span></span>",
          iconSize: [28, 28],
        }),
        title: "Ubicación seleccionada",
      }).addTo(map.current);
      map.current.setView([selected.latitude, selected.longitude], 16);
    });
    return () => {
      active = false;
    };
  }, [selected, loaded]);
  return (
    <div className="map-wrapper">
      <div
        className="map-canvas"
        ref={element}
        aria-label={
          onSelect
            ? "Mapa para seleccionar ubicación. También puedes escribir las coordenadas."
            : "Mapa de reportes publicados"
        }
      />
      {!loaded && (
        <p className="map-message" role="status">
          Cargando mapa…
        </p>
      )}
      {error && (
        <p className="map-message" role="status">
          No se pudieron cargar algunas teselas. Puedes usar las coordenadas
          manuales.
        </p>
      )}
      <span className="map-caption">
        {selected
          ? "Ubicación seleccionada"
          : reports?.length
            ? "Ubicaciones públicas aproximadas"
            : "Vista general · sin límites municipales verificados"}
      </span>
    </div>
  );
}
