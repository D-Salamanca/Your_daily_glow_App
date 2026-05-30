import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId:   "com.sentir.app",
  appName: "Sentir",
  webDir:  "dist",

  plugins: {
    // @capacitor/preferences — native key-value storage
    Preferences: {
      group: "SentirApp",
    },

    // @capacitor/geolocation
    Geolocation: {
      // No extra config needed; permissions in AndroidManifest.xml
    },

    // @capacitor/camera
    Camera: {
      // No extra config needed; permissions in AndroidManifest.xml
    },

    // @capacitor/local-notifications
    LocalNotifications: {
      smallIcon:   "ic_stat_icon_config_sample",
      iconColor:   "#7BAE7F",
      sound:       "beep.wav",
    },

    // @capacitor/push-notifications
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },

    // @capacitor/haptics — no extra config needed
    // @capacitor/motion  — no extra config needed
    // @capacitor/device  — no extra config needed
    // @capacitor/filesystem — no extra config needed
  },

  android: {
    // Allow HTTP for local dev (Ollama on localhost)
    allowMixedContent: true,
    // Keep WebView alive when navigating between pages
    captureInput: true,
  },
};

export default config;
