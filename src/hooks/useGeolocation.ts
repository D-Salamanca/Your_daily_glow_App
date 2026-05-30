import { useState, useEffect, useCallback, useRef } from "react";
import { Geolocation } from "@capacitor/geolocation";

export interface GeoState {
  lat:      number | null;
  lng:      number | null;
  accuracy: number | null;
  loading:  boolean;
  error:    string | null;
}

const INITIAL: GeoState = { lat: null, lng: null, accuracy: null, loading: false, error: null };

/**
 * useGeolocation — custom hook using @capacitor/geolocation
 *
 * Geolocation.getCurrentPosition() → one-shot GPS fix
 * Geolocation.watchPosition()      → continuous GPS updates
 *
 * Works on Android (native GPS), iOS and web (browser API fallback).
 */
export function useGeolocation(autoFetch = false) {
  const [state, setState] = useState<GeoState>(INITIAL);
  const watchIdRef = useRef<string | null>(null);

  /** One-shot fetch of current position */
  const getCurrentPosition = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const pos = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout:            10_000,
      });
      setState({
        lat:      pos.coords.latitude,
        lng:      pos.coords.longitude,
        accuracy: pos.coords.accuracy ?? null,
        loading:  false,
        error:    null,
      });
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "No se pudo obtener la ubicación";
      setState((s) => ({ ...s, loading: false, error: msg }));
    }
  }, []);

  /** Start watching position (continuous GPS updates) */
  const watchPosition = useCallback(async () => {
    if (watchIdRef.current) return;
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      watchIdRef.current = await Geolocation.watchPosition(
        { enableHighAccuracy: true },
        (pos, err) => {
          if (err || !pos) {
            setState((s) => ({
              ...s,
              loading: false,
              error: err?.message ?? "Error al rastrear ubicación",
            }));
            return;
          }
          setState({
            lat:      pos.coords.latitude,
            lng:      pos.coords.longitude,
            accuracy: pos.coords.accuracy ?? null,
            loading:  false,
            error:    null,
          });
        }
      );
    } catch (err: unknown) {
      setState((s) => ({
        ...s,
        loading: false,
        error: err instanceof Error ? err.message : "No se pudo iniciar el rastreo",
      }));
    }
  }, []);

  /** Stop watching position */
  const clearWatch = useCallback(async () => {
    if (!watchIdRef.current) return;
    await Geolocation.clearWatch({ id: watchIdRef.current });
    watchIdRef.current = null;
  }, []);

  useEffect(() => {
    if (autoFetch) getCurrentPosition();
    return () => { clearWatch(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoFetch]);

  return { ...state, getCurrentPosition, watchPosition, clearWatch };
}
