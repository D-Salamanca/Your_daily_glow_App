import { useState, useCallback } from "react";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";

export interface CameraPhoto {
  dataUrl: string | undefined;
  format:  string;
}

export function useCamera() {
  const [photo, setPhoto]     = useState<CameraPhoto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  /** Take a photo with the device camera */
  const takePhoto = useCallback(async (): Promise<CameraPhoto | null> => {
    setLoading(true);
    setError(null);
    try {
      const result = await Camera.getPhoto({
        quality:      90,
        allowEditing: false,
        resultType:   CameraResultType.DataUrl,
        source:       CameraSource.Camera,
      });
      const p = { dataUrl: result.dataUrl, format: result.format };
      setPhoto(p);
      return p;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "No se pudo acceder a la cámara";
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /** Pick an existing photo from the gallery */
  const pickFromGallery = useCallback(async (): Promise<CameraPhoto | null> => {
    setLoading(true);
    setError(null);
    try {
      const result = await Camera.getPhoto({
        quality:      90,
        allowEditing: false,
        resultType:   CameraResultType.DataUrl,
        source:       CameraSource.Photos,
      });
      const p = { dataUrl: result.dataUrl, format: result.format };
      setPhoto(p);
      return p;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "No se pudo abrir la galería";
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearPhoto = useCallback(() => setPhoto(null), []);

  return { photo, loading, error, takePhoto, pickFromGallery, clearPhoto };
}
