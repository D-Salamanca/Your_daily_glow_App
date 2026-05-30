import { useCallback } from "react";
import { Filesystem, Directory, Encoding } from "@capacitor/filesystem";

/**
 * useFilesystem — custom hook using @capacitor/filesystem
 *
 * Provides a simple API over the Capacitor Filesystem plugin.
 * Default directory: Directory.Documents (app-scoped, no permissions needed on Android).
 */
export function useFilesystem(defaultDir = Directory.Documents) {
  /** Read a text file and return its contents */
  const readFile = useCallback(
    (path: string, dir = defaultDir) =>
      Filesystem.readFile({ path, directory: dir, encoding: Encoding.UTF8 }),
    [defaultDir]
  );

  /** Write (or overwrite) a text file */
  const writeFile = useCallback(
    (path: string, data: string, dir = defaultDir) =>
      Filesystem.writeFile({ path, data, directory: dir, encoding: Encoding.UTF8, recursive: true }),
    [defaultDir]
  );

  /** Delete a file */
  const deleteFile = useCallback(
    (path: string, dir = defaultDir) =>
      Filesystem.deleteFile({ path, directory: dir }),
    [defaultDir]
  );

  /** Create a directory (recursively) */
  const mkdir = useCallback(
    (path: string, dir = defaultDir) =>
      Filesystem.mkdir({ path, directory: dir, recursive: true }),
    [defaultDir]
  );

  /** List directory contents */
  const readdir = useCallback(
    (path: string, dir = defaultDir) =>
      Filesystem.readdir({ path, directory: dir }),
    [defaultDir]
  );

  /** Get the native URI of a file (useful for sharing) */
  const getUri = useCallback(
    (path: string, dir = defaultDir) =>
      Filesystem.getUri({ path, directory: dir }),
    [defaultDir]
  );

  /** Check if a file or directory exists */
  const stat = useCallback(
    (path: string, dir = defaultDir) =>
      Filesystem.stat({ path, directory: dir }),
    [defaultDir]
  );

  return { readFile, writeFile, deleteFile, mkdir, readdir, getUri, stat };
}
