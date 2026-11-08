import { invoke } from "@tauri-apps/api/core";

export const isTauri =
  typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;

let nativeReady = false;

/**
 * Load the Rust-persisted library. Returns `null` on a first launch.
 * In a normal browser this is a no-op so the demo can use localStorage.
 */
export async function initNativeStorage(): Promise<string | null> {
  if (!isTauri) return null;

  try {
    const raw = await invoke<string | null>("load_library");
    nativeReady = true;
    return raw;
  } catch (error) {
    console.warn("Native library storage is unavailable; using localStorage.", error);
    return null;
  }
}

export function persistNativeLibrary(json: string): void {
  if (!isTauri || !nativeReady) return;

  invoke("save_library", { json }).catch((error) => {
    console.warn("Could not persist the library through Rust.", error);
  });
}

/**
 * Match the Android status and navigation bar icons to the resolved theme.
 * In a browser, or before the native bridge is attached, this is a no-op.
 */
export function setNativeTheme(dark: boolean): void {
  if (typeof window === "undefined") return;
  try {
    window.KalimaNative?.setTheme?.(dark);
  } catch (error) {
    console.warn("Could not set the native bar appearance.", error);
  }
}
