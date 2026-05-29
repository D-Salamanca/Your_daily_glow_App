import { Component, useEffect, useRef, useState, type ErrorInfo, type ReactNode } from "react";
import L from "leaflet";
// leaflet CSS is already imported globally in index.css
import { MapPin, Loader2, AlertCircle, Navigation } from "lucide-react";
import { reverseGeocode, type GeocodeResult } from "@/services/geocodeService";
import styles from "./MapsComponent.module.css";

// ── Fix Leaflet icon paths broken by Vite bundler ────────────────────────────
const defaultIcon = L.icon({
  iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize:    [25, 41],
  iconAnchor:  [12, 41],
  popupAnchor: [1, -34],
  shadowSize:  [41, 41],
});
L.Marker.prototype.options.icon = defaultIcon;

// ── Error boundary ────────────────────────────────────────────────────────────
class MapErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(e: Error, i: ErrorInfo) { console.error("[Map]", e, i); }
  render() {
    if (this.state.hasError)
      return (
        <div className={`${styles.wrapper} ${styles.errorBox}`}>
          <AlertCircle className="w-8 h-8 text-muted-foreground" />
          <p>No se pudo cargar el mapa. Recarga la página.</p>
        </div>
      );
    return this.props.children;
  }
}

// ── Mock psychologists ────────────────────────────────────────────────────────
const PSYCHOLOGISTS = [
  { name: "Dra. Ana García",       specialty: "Ansiedad y estrés",  dlat:  0.008, dlng:  0.012 },
  { name: "Dr. Carlos Ruiz",       specialty: "Terapia cognitiva",  dlat: -0.005, dlng:  0.018 },
  { name: "Dra. María Fernández",  specialty: "Trauma y EMDR",      dlat:  0.012, dlng: -0.009 },
  { name: "Dr. Pablo Torres",      specialty: "Parejas y familia",  dlat: -0.009, dlng: -0.015 },
  { name: "Dra. Lucía Sánchez",    specialty: "Depresión y duelo",  dlat:  0.003, dlng:  0.022 },
];

// ── Props ─────────────────────────────────────────────────────────────────────
interface MapsComponentProps {
  lat:      number | null;
  lng:      number | null;
  loading:  boolean;
  error:    string | null;
  onLocate: () => void;
}

// ── Map using plain Leaflet JS (no react-leaflet) ─────────────────────────────
const LeafletMap = ({ lat, lng }: { lat: number; lng: number }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef       = useRef<L.Map | null>(null);
  const markersRef   = useRef<L.Marker[]>([]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Init map once
    if (!mapRef.current) {
      mapRef.current = L.map(el, { zoomControl: true, scrollWheelZoom: false });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(mapRef.current);
    }

    const map = mapRef.current;
    map.setView([lat, lng], 14);
    map.invalidateSize();

    // Clear old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // User marker
    const userMarker = L.marker([lat, lng])
      .addTo(map)
      .bindPopup("<strong>Tu ubicación</strong>");
    markersRef.current.push(userMarker);

    // Psychologist markers
    PSYCHOLOGISTS.forEach((p) => {
      const m = L.marker([lat + p.dlat, lng + p.dlng])
        .addTo(map)
        .bindPopup(`<strong>${p.name}</strong><br><small>${p.specialty}</small>`);
      markersRef.current.push(m);
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markersRef.current = [];
      }
    };
  // Only reinit when coords actually change
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lat, lng]);

  return <div ref={containerRef} className={styles.map} />;
};

// ── Main component ────────────────────────────────────────────────────────────
const MapsInner = ({ lat, lng, loading, error, onLocate }: MapsComponentProps) => {
  const [address, setAddress] = useState<GeocodeResult | null>(null);

  useEffect(() => {
    if (lat && lng) reverseGeocode(lat, lng).then(setAddress);
  }, [lat, lng]);

  if (loading) {
    return (
      <div className={`${styles.wrapper} ${styles.loadingBox}`}>
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p>Obteniendo tu ubicación…</p>
      </div>
    );
  }

  if (error || !lat || !lng) {
    return (
      <div className={`${styles.wrapper} ${styles.errorBox}`}>
        <AlertCircle className="w-8 h-8 text-muted-foreground" />
        <p>{error ?? "Activa la ubicación para ver psicólogos cerca de ti."}</p>
        <button
          onClick={onLocate}
          className="mt-1 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium flex items-center gap-2"
        >
          <Navigation className="w-4 h-4" />
          Activar ubicación
        </button>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <LeafletMap lat={lat} lng={lng} />
      <div className={styles.address}>
        <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0" />
        <span className={styles.addressText}>
          {address ? address.formatted : `${lat.toFixed(5)}, ${lng.toFixed(5)}`}
        </span>
      </div>
    </div>
  );
};

const MapsComponent = (props: MapsComponentProps) => (
  <MapErrorBoundary>
    <MapsInner {...props} />
  </MapErrorBoundary>
);

export default MapsComponent;
