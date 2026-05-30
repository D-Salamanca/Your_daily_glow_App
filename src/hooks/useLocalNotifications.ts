import { useState, useCallback } from "react";
import {
  LocalNotifications,
  type LocalNotificationSchema,
  type PermissionStatus,
} from "@capacitor/local-notifications";

/**
 * useLocalNotifications — custom hook using @capacitor/local-notifications
 *
 * LocalNotifications.requestPermissions() → ask user for permission
 * LocalNotifications.schedule()           → schedule one or more notifications
 * LocalNotifications.cancel()             → cancel pending notifications
 * LocalNotifications.getPending()         → list pending notifications
 */
export function useLocalNotifications() {
  const [permission, setPermission] = useState<PermissionStatus | null>(null);

  /** Request notification permissions (required on Android 13+ and iOS) */
  const requestPermissions = useCallback(async () => {
    const status = await LocalNotifications.requestPermissions();
    setPermission(status);
    return status;
  }, []);

  /** Check current permission status without prompting */
  const checkPermissions = useCallback(async () => {
    const status = await LocalNotifications.checkPermissions();
    setPermission(status);
    return status;
  }, []);

  /**
   * Schedule one or more local notifications.
   * Each notification needs a unique numeric id.
   *
   * Example:
   *   schedule([{
   *     id: 1,
   *     title: "Sentir 💚",
   *     body: "¿Cómo te sientes hoy?",
   *     schedule: { at: new Date(Date.now() + 60_000) },
   *   }])
   */
  const schedule = useCallback(
    async (notifications: LocalNotificationSchema[]) =>
      LocalNotifications.schedule({ notifications }),
    []
  );

  /** Cancel specific notifications by id */
  const cancel = useCallback(
    async (ids: number[]) =>
      LocalNotifications.cancel({ notifications: ids.map((id) => ({ id })) }),
    []
  );

  /** Return all pending (not yet delivered) notifications */
  const getPending = useCallback(
    () => LocalNotifications.getPending(),
    []
  );

  /** Schedule a daily reminder at a specific hour:minute */
  const scheduleDailyReminder = useCallback(
    async (hour: number, minute: number, message = "¿Cómo te sientes hoy?") => {
      const now  = new Date();
      const next = new Date();
      next.setHours(hour, minute, 0, 0);
      if (next <= now) next.setDate(next.getDate() + 1);

      return LocalNotifications.schedule({
        notifications: [
          {
            id:    1001,
            title: "Sentir 💚",
            body:  message,
            schedule: { at: next, repeats: true, every: "day" },
            smallIcon: "ic_stat_icon_config_sample",
          },
        ],
      });
    },
    []
  );

  return {
    permission,
    requestPermissions,
    checkPermissions,
    schedule,
    cancel,
    getPending,
    scheduleDailyReminder,
  };
}
