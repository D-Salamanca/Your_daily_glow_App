import { useCallback } from "react";
import { Haptics, ImpactStyle, NotificationType } from "@capacitor/haptics";

/**
 * useHaptics — custom hook using @capacitor/haptics
 *
 * Haptics.impact()       → short tactile bump (light / medium / heavy)
 * Haptics.notification() → success / warning / error pattern
 * Haptics.vibrate()      → standard vibration (300 ms)
 *
 * On devices without Taptic Engine / Vibrator the calls resolve silently.
 */
export function useHaptics() {
  /** Light impact — for subtle UI feedback (button taps, selections) */
  const impactLight = useCallback(
    () => Haptics.impact({ style: ImpactStyle.Light }).catch(() => {}),
    []
  );

  /** Medium impact — for confirmations */
  const impactMedium = useCallback(
    () => Haptics.impact({ style: ImpactStyle.Medium }).catch(() => {}),
    []
  );

  /** Heavy impact — for important actions (delete, errors) */
  const impactHeavy = useCallback(
    () => Haptics.impact({ style: ImpactStyle.Heavy }).catch(() => {}),
    []
  );

  /** Success notification pattern */
  const notifySuccess = useCallback(
    () => Haptics.notification({ type: NotificationType.Success }).catch(() => {}),
    []
  );

  /** Warning notification pattern */
  const notifyWarning = useCallback(
    () => Haptics.notification({ type: NotificationType.Warning }).catch(() => {}),
    []
  );

  /** Error notification pattern */
  const notifyError = useCallback(
    () => Haptics.notification({ type: NotificationType.Error }).catch(() => {}),
    []
  );

  /** Standard vibration (300 ms) */
  const vibrate = useCallback(
    () => Haptics.vibrate({ duration: 300 }).catch(() => {}),
    []
  );

  return {
    impactLight,
    impactMedium,
    impactHeavy,
    notifySuccess,
    notifyWarning,
    notifyError,
    vibrate,
  };
}
