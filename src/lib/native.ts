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

/**
 * Hand a CSV to the Android share sheet. Returns `false` in a browser so the
 * caller can fall back to a blob download.
 */
export function shareCsv(filename: string, contents: string): boolean {
  if (typeof window === "undefined" || !window.KalimaNative?.shareCsv) {
    return false;
  }

  try {
    window.KalimaNative.shareCsv(filename, contents);
    return true;
  } catch (error) {
    console.warn("Could not open the native CSV share sheet.", error);
    return false;
  }
}

/**
 * Feed the native system-bar insets into the CSS safe-area variables. Android
 * WebView leaves `env(safe-area-inset-*)` at zero, so the activity measures
 * them instead. No-op on desktop and in the browser.
 */
export function applyNativeInsets(): void {
  if (typeof window === "undefined") return;

  let raw: string | undefined;
  try {
    raw = window.KalimaNative?.getInsets?.();
  } catch (error) {
    console.warn("Could not read the native window insets.", error);
    return;
  }
  if (!raw) return;

  const [top, bottom, left, right] = raw
    .split(",")
    .map((part) => Number.parseInt(part, 10));

  const setInset = (name: string, value: number | undefined) => {
    if (value === undefined || !Number.isFinite(value)) return;
    document.documentElement.style.setProperty(
      name,
      `${Math.max(0, value)}px`,
    );
  };

  setInset("--top-safe", top);
  setInset("--bottom-safe", bottom);
  setInset("--left-safe", left);
  setInset("--right-safe", right);
}
