type BackHandler = () => boolean;

/**
 * A tiny stack of back handlers shared between sheets and screens.
 *
 * The Android activity calls `window.kalimaBack()`. The most recently
 * registered handler gets the first chance to consume the press; returning
 * `false` lets the system handle it (which exits the app from home).
 */
const handlers: BackHandler[] = [];

export function registerBackHandler(handler: BackHandler): () => void {
  handlers.push(handler);
  return () => {
    const index = handlers.lastIndexOf(handler);
    if (index !== -1) handlers.splice(index, 1);
  };
}

export function handleBack(): boolean {
  const handler = handlers[handlers.length - 1];
  if (!handler) return false;
  return handler();
}

declare global {
  interface Window {
    kalimaBack?: () => boolean;
    KalimaNative?: {
      setTheme?: (dark: boolean) => void;
    };
  }
}

if (typeof window !== "undefined") {
  window.kalimaBack = handleBack;
}
