import { useState, useEffect, useCallback } from "react";

export type PermissionStatus = "granted" | "denied" | "prompt" | "unsupported";

export interface PermissionsState {
  camera:        PermissionStatus;
  notifications: PermissionStatus;
  location:      PermissionStatus;
}

async function queryCameraStatus(): Promise<PermissionStatus> {
  if (!navigator.mediaDevices?.getUserMedia) return "unsupported";
  try {
    const result = await navigator.permissions.query({ name: "camera" as PermissionName });
    return result.state as PermissionStatus;
  } catch {
    return "prompt";
  }
}

async function queryNotificationStatus(): Promise<PermissionStatus> {
  if (!("Notification" in window)) return "unsupported";
  const perm = Notification.permission;
  return perm === "default" ? "prompt" : (perm as PermissionStatus);
}

async function queryLocationStatus(): Promise<PermissionStatus> {
  if (!navigator.geolocation) return "unsupported";
  try {
    const result = await navigator.permissions.query({ name: "geolocation" });
    return result.state === "granted" ? "granted"
         : result.state === "denied"  ? "denied"
         : "prompt";
  } catch {
    return "prompt";
  }
}

export function usePermissions() {
  const [camera, setCamera]               = useState<PermissionStatus>("prompt");
  const [notifications, setNotifications] = useState<PermissionStatus>("prompt");
  const [location, setLocation]           = useState<PermissionStatus>("prompt");
  const [cameraLoading, setCameraLoading] = useState(false);
  const [notifLoading, setNotifLoading]   = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

  // Leer estado actual al montar
  useEffect(() => {
    queryCameraStatus().then(setCamera);
    queryNotificationStatus().then(setNotifications);
    queryLocationStatus().then(setLocation);
  }, []);

  // ── Solicitar cámara ────────────────────────────────────────────────────
  const requestCamera = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setCamera("unsupported");
      return;
    }
    setCameraLoading(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach((t) => t.stop()); // liberar inmediatamente
      setCamera("granted");
    } catch (err: any) {
      setCamera(err?.name === "NotAllowedError" ? "denied" : "prompt");
    } finally {
      setCameraLoading(false);
    }
  }, []);

  // ── Solicitar notificaciones ────────────────────────────────────────────
  const requestNotifications = useCallback(async () => {
    if (!("Notification" in window)) {
      setNotifications("unsupported");
      return;
    }
    setNotifLoading(true);
    try {
      const result = await Notification.requestPermission();
      setNotifications(result as PermissionStatus);
    } finally {
      setNotifLoading(false);
    }
  }, []);

  // ── Solicitar ubicación ─────────────────────────────────────────────────
  const requestLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setLocation("unsupported");
      return;
    }
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      () => {
        setLocation("granted");
        setLocationLoading(false);
      },
      (err) => {
        setLocation(err.code === err.PERMISSION_DENIED ? "denied" : "prompt");
        setLocationLoading(false);
      },
      { timeout: 10_000 }
    );
  }, []);

  // ── Notificación de prueba ──────────────────────────────────────────────
  const sendTestNotification = useCallback(() => {
    if (Notification.permission !== "granted") return;
    new Notification("Sentir 💚", {
      body: "¿Cómo te sientes hoy? Tómate un momento para reflexionar.",
      icon: "/favicon.ico",
      badge: "/favicon.ico",
    });
  }, []);

  // ── Programar recordatorio diario ──────────────────────────────────────
  const scheduleDaily = useCallback((hour: number, minute: number) => {
    if (Notification.permission !== "granted") return;

    const now  = new Date();
    const next = new Date();
    next.setHours(hour, minute, 0, 0);
    if (next <= now) next.setDate(next.getDate() + 1);

    const msUntil = next.getTime() - now.getTime();

    // Primer disparo
    const timeout = setTimeout(() => {
      new Notification("Sentir 💚 · Hora de tu check-in", {
        body: "Un momento de reflexión puede cambiarlo todo. ¿Cómo estás hoy?",
        icon: "/favicon.ico",
      });
      // Repetir cada 24h
      const interval = setInterval(() => {
        new Notification("Sentir 💚 · Hora de tu check-in", {
          body: "Un momento de reflexión puede cambiarlo todo. ¿Cómo estás hoy?",
          icon: "/favicon.ico",
        });
      }, 24 * 60 * 60 * 1000);

      return () => clearInterval(interval);
    }, msUntil);

    return () => clearTimeout(timeout);
  }, []);

  return {
    camera,
    notifications,
    location,
    cameraLoading,
    notifLoading,
    locationLoading,
    requestCamera,
    requestNotifications,
    requestLocation,
    sendTestNotification,
    scheduleDaily,
  };
}
