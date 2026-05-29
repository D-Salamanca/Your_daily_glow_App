/**
 * geocodeService — wrapper around the OpenCage Geocoding API
 * Docs: https://opencagedata.com/api
 *
 * Add VITE_OPENCAGE_API_KEY to your .env file.
 */

const API_KEY = import.meta.env.VITE_OPENCAGE_API_KEY as string | undefined;
const BASE_URL = "https://api.opencagedata.com/geocode/v1/json";

export interface GeocodeResult {
  city:       string;
  suburb:     string;
  country:    string;
  formatted:  string;
  lat:        number;
  lng:        number;
}

interface OpenCageComponent {
  city?:         string;
  town?:         string;
  village?:      string;
  suburb?:       string;
  neighbourhood?:string;
  country?:      string;
}

interface OpenCageResult {
  formatted: string;
  geometry: { lat: number; lng: number };
  components: OpenCageComponent;
}

interface OpenCageResponse {
  results: OpenCageResult[];
  status:  { code: number; message: string };
}

/**
 * Reverse geocode — convert lat/lng to a human-readable address.
 * Returns null if the API key is missing or the request fails.
 */
export async function reverseGeocode(lat: number, lng: number): Promise<GeocodeResult | null> {
  if (!API_KEY) {
    console.warn("[geocodeService] VITE_OPENCAGE_API_KEY not set — skipping reverse geocode");
    return null;
  }

  const url = `${BASE_URL}?q=${lat}+${lng}&key=${API_KEY}&language=es&limit=1&no_annotations=1`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`OpenCage HTTP ${res.status}`);

    const data: OpenCageResponse = await res.json();
    if (!data.results.length) return null;

    const r = data.results[0];
    const c = r.components;

    return {
      city:      c.city ?? c.town ?? c.village ?? "",
      suburb:    c.suburb ?? c.neighbourhood ?? "",
      country:   c.country ?? "",
      formatted: r.formatted,
      lat:       r.geometry.lat,
      lng:       r.geometry.lng,
    };
  } catch (err) {
    console.error("[geocodeService] reverseGeocode error:", err);
    return null;
  }
}

/**
 * Forward geocode — convert a place name to coordinates.
 * Returns null if the request fails or returns no results.
 */
export async function forwardGeocode(query: string): Promise<GeocodeResult | null> {
  if (!API_KEY) {
    console.warn("[geocodeService] VITE_OPENCAGE_API_KEY not set");
    return null;
  }

  const url = `${BASE_URL}?q=${encodeURIComponent(query)}&key=${API_KEY}&language=es&limit=1&no_annotations=1`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`OpenCage HTTP ${res.status}`);

    const data: OpenCageResponse = await res.json();
    if (!data.results.length) return null;

    const r = data.results[0];
    const c = r.components;

    return {
      city:      c.city ?? c.town ?? c.village ?? "",
      suburb:    c.suburb ?? c.neighbourhood ?? "",
      country:   c.country ?? "",
      formatted: r.formatted,
      lat:       r.geometry.lat,
      lng:       r.geometry.lng,
    };
  } catch (err) {
    console.error("[geocodeService] forwardGeocode error:", err);
    return null;
  }
}
