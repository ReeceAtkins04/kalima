import { exportCsv } from "./api";
import { shareCsv } from "./native";
import type { Library } from "./types";

export type ExportOutcome = "shared" | "downloaded";

/**
 * Export one deck to CSV. On Android the file goes through the native share
 * sheet; in a browser it downloads with a blob anchor.
 */
export function exportDeckFile(
  library: Library,
  deckId: string,
  deckName: string,
): ExportOutcome | null {
  const csv = exportCsv(library, deckId);
  if (!csv) return null;

  const filename = `${deckName.replaceAll(/[^\w]+/g, "-").toLowerCase() || "kalima-deck"}.csv`;
  const contents = "\uFEFF" + csv;

  if (shareCsv(filename, contents)) return "shared";

  const blob = new Blob([contents], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  return "downloaded";
}
