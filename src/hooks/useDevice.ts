import { useState, useEffect } from "react";
import { Device, type DeviceInfo, type BatteryInfo, type GetLanguageCodeResult } from "@capacitor/device";

export interface DeviceState {
  info:         DeviceInfo | null;
  battery:      BatteryInfo | null;
  languageCode: string | null;
  deviceId:     string | null;
  loading:      boolean;
  error:        string | null;
}

/**
 * useDevice — custom hook using @capacitor/device
 *
 * Exposes:
 *   Device.getInfo()        → model, OS, platform, manufacturer…
 *   Device.getBatteryInfo() → batteryLevel, isCharging
 *   Device.getLanguageCode() → user language (e.g. "es")
 *   Device.getId()          → unique device identifier
 */
export function useDevice() {
  const [state, setState] = useState<DeviceState>({
    info: null, battery: null, languageCode: null, deviceId: null,
    loading: true, error: null,
  });

  useEffect(() => {
    Promise.all([
      Device.getInfo(),
      Device.getBatteryInfo(),
      Device.getLanguageCode(),
      Device.getId(),
    ])
      .then(([info, battery, lang, id]) => {
        setState({
          info,
          battery,
          languageCode: (lang as GetLanguageCodeResult).value,
          deviceId:     id.identifier,
          loading:      false,
          error:        null,
        });
      })
      .catch((err: unknown) => {
        setState((s) => ({
          ...s,
          loading: false,
          error: err instanceof Error ? err.message : "Error obteniendo info del dispositivo",
        }));
      });
  }, []);

  return state;
}
