import { useState, useEffect, useCallback, useRef } from "react";

export interface GeoState {
  lat:      number | null;
  lng:      number | null;
  accuracy: number | null;
  loading:  boolean;
  error:    string | null;
}

const INITIAL: GeoState = { lat: null, lng: null, accuracy: null, loading: false, error: null };

/**
 * useGeolocation — custom hook using the browser Geolocation API
 * (navigator.geolocation.getCurrentPosition / watchPosition)
 * Works on web and on Capacitor web runtime without extra plugins.
 */
export function useGeolocation(autoFetch = false) {
  const [state, setState] = useState<GeoState>(INITIAL);
  const watchIdRef = useRef<number | null>(null);

  /** One-shot fetch of current position */
  const getCurrentPosition = useCallback(() => {
    if (!navigator.geolocation) {
      setState((s) => ({ ...s, error: "GPS no disponible en este dispositivo" }));
      return;
    }
    setState((s) => ({ ...s, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setState({
          lat:      pos.coords.latitude,
          lng:      pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          loading:  false,
          error:    null,
        });
      },
      (err) => {
        const messages: Record<number, string> = {
          1: "Permiso de ubicación denegado",
          2: "Posición no disponible",
          3: "Tiempo de espera agotado",
        };
        setState((s) => ({
          ...s,
          loading: false,
          error: messages[err.code] ?? "No se pudo obtener la ubicación",
        }));
      },
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 30_000 }
    );
  }, []);

  /** Start watching position (continuous GPS updates) */
  const watchPosition = useCallback(() => {
    if (!navigator.geolocation || watchIdRef.current !== null) return;
    setState((s) => ({ ...s, loading: true, error: null }));

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        setState({
          lat:      pos.coords.latitude,
          lng:      pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          loading:  false,
          error:    null,
        });
      },
      (err) => {
        setState((s) => ({ ...s, loading: false, error: err.message }));
      },
      { enableHighAccuracy: true }
    );
  }, []);

  /** Stop watching position */
  const clearWatch = useCallback(() => {
    if (watchIdRef.current === null) return;
    navigator.geolocation?.clearWatch(watchIdRef.current);
    watchIdRef.current = null;
  }, []);

  useEffect(() => {
    if (autoFetch) getCurrentPosition();
    return () => { clearWatch(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoFetch]);

  return { ...state, getCurrentPosition, watchPosition, clearWatch };
}
