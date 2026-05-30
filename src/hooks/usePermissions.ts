import { useState, useEffect, useCallback } from "react";
import { Capacitor } from "@capacitor/core";
import { Camera }              from "@capacitor/camera";
import { Geolocation }         from "@capacitor/geolocation";
import { LocalNotifications }  from "@capacitor/local-notifications";

export type PermissionStatus = "granted" | "denied" | "prompt" | "unsupported";

// ── Status readers ────────────────────────────────────────────────────────────

async function queryCameraStatus(): Promise<PermissionStatus> {
  if (Capacitor.isNativePlatform()) {
    try {
      const { camera } = await Camera.checkPermissions();
      return camera === "granted" ? "granted"
           : camera === "denied"  ? "denied"
           : "prompt";
    } catch { return "prompt"; }
  }
  // Web fallback
  if (!navigator.mediaDevices?.getUserMedia) return "unsupported";
  try {
    const r = await navigator.permissions.query({ name: "camera" as PermissionName });
    return r.state === "granted" ? "granted" : r.state === "denied" ? "denied" : "prompt";
  } catch { return "prompt"; }
}

async function queryNotificationStatus(): Promise<PermissionStatus> {
  if (Capacitor.isNativePlatform()) {
    try {
      const { display } = await LocalNotifications.checkPermissions();
      return display === "granted" ? "granted"
           : display === "denied"  ? "denied"
           : "prompt";
    } catch { return "prompt"; }
  }
  // Web fallback
  if (!("Notification" in window)) return "unsupported";
  const p = Notification.permission;
  return p === "default" ? "prompt" : (p as PermissionStatus);
}

async function queryLocationStatus(): Promise<PermissionStatus> {
  if (Capacitor.isNativePlatform()) {
    try {
      const { location } = await Geolocation.checkPermissions();
      return location === "granted" ? "granted"
           : location === "denied"  ? "denied"
           : "prompt";
    } catch { return "prompt"; }
  }
  // Web fallback
  if (!navigator.geolocation) return "unsupported";
  try {
    const r = await navigator.permissions.query({ name: "geolocation" });
    return r.state === "granted" ? "granted" : r.state === "denied" ? "denied" : "prompt";
  } catch { return "prompt"; }
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function usePermissions() {
  const [camera,        setCamera]        = useState<PermissionStatus>("prompt");
  const [notifications, setNotifications] = useState<PermissionStatus>("prompt");
  const [location,      setLocation]      = useState<PermissionStatus>("prompt");
  const [cameraLoading,   setCameraLoading]   = useState(false);
  const [notifLoading,    setNotifLoading]    = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

  useEffect(() => {
    queryCameraStatus()      .then(setCamera);
    queryNotificationStatus().then(setNotifications);
    queryLocationStatus()    .then(setLocation);
  }, []);

  // ── Cámara ────────────────────────────────────────────────────────────────
  const requestCamera = useCallback(async () => {
    setCameraLoading(true);
    try {
      if (Capacitor.isNativePlatform()) {
        const { camera } = await Camera.requestPermissions({ permissions: ["camera"] });
        setCamera(camera === "granted" ? "granted" : camera === "denied" ? "denied" : "prompt");
      } else {
        if (!navigator.mediaDevices?.getUserMedia) { setCamera("unsupported"); return; }
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach((t) => t.stop());
        setCamera("granted");
      }
    } catch (err: any) {
      setCamera(err?.name === "NotAllowedError" ? "denied" : "prompt");
    } finally {
      setCameraLoading(false);
    }
  }, []);

  // ── Notificaciones ────────────────────────────────────────────────────────
  const requestNotifications = useCallback(async () => {
    setNotifLoading(true);
    try {
      if (Capacitor.isNativePlatform()) {
        const { display } = await LocalNotifications.requestPermissions();
        setNotifications(display === "granted" ? "granted" : display === "denied" ? "denied" : "prompt");
      } else {
        if (!("Notification" in window)) { setNotifications("unsupported"); return; }
        const result = await Notification.requestPermission();
        setNotifications(result === "default" ? "prompt" : result as PermissionStatus);
      }
    } catch {
      setNotifications("denied");
    } finally {
      setNotifLoading(false);
    }
  }, []);

  // ── Ubicación ─────────────────────────────────────────────────────────────
  const requestLocation = useCallback(async () => {
    setLocationLoading(true);
    try {
      if (Capacitor.isNativePlatform()) {
        const { location } = await Geolocation.requestPermissions();
        setLocation(location === "granted" ? "granted" : location === "denied" ? "denied" : "prompt");
      } else {
        if (!navigator.geolocation) { setLocation("unsupported"); return; }
        await new Promise<void>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            () => { setLocation("granted"); resolve(); },
            (err) => {
              setLocation(err.code === err.PERMISSION_DENIED ? "denied" : "prompt");
              resolve();
            },
            { timeout: 10_000 }
          );
        });
      }
    } catch {
      setLocation("denied");
    } finally {
      setLocationLoading(false);
    }
  }, []);

  // ── Notificación de prueba ────────────────────────────────────────────────
  const sendTestNotification = useCallback(async () => {
    if (Capacitor.isNativePlatform()) {
      await LocalNotifications.schedule({
        notifications: [{
          id:    9001,
          title: "Sentir 💚",
          body:  "¿Cómo te sientes hoy? Tómate un momento para reflexionar.",
          schedule: { at: new Date(Date.now() + 1000) }, // 1 segundo de retraso
        }],
      });
    } else {
      if (Notification.permission !== "granted") return;
      new Notification("Sentir 💚", {
        body:  "¿Cómo te sientes hoy? Tómate un momento para reflexionar.",
        icon:  "/favicon.ico",
        badge: "/favicon.ico",
      });
    }
  }, []);

  // ── Recordatorio diario ───────────────────────────────────────────────────
  const scheduleDaily = useCallback(async (hour: number, minute: number) => {
    if (Capacitor.isNativePlatform()) {
      const next = new Date();
      next.setHours(hour, minute, 0, 0);
      if (next <= new Date()) next.setDate(next.getDate() + 1);

      await LocalNotifications.schedule({
        notifications: [{
          id:    1001,
          title: "Sentir 💚 · Hora de tu check-in",
          body:  "Un momento de reflexión puede cambiarlo todo. ¿Cómo estás hoy?",
          schedule: { at: next, repeats: true, every: "day" },
        }],
      });
    } else {
      // Web: setTimeout (solo funciona mientras la pestaña está abierta)
      if (Notification.permission !== "granted") return;
      const now  = new Date();
      const next = new Date();
      next.setHours(hour, minute, 0, 0);
      if (next <= now) next.setDate(next.getDate() + 1);
      setTimeout(() => {
        new Notification("Sentir 💚 · Hora de tu check-in", {
          body: "Un momento de reflexión puede cambiarlo todo. ¿Cómo estás hoy?",
          icon: "/favicon.ico",
        });
      }, next.getTime() - now.getTime());
    }
  }, []);

  return {
    camera, notifications, location,
    cameraLoading, notifLoading, locationLoading,
    requestCamera, requestNotifications, requestLocation,
    sendTestNotification, scheduleDaily,
  };
}
