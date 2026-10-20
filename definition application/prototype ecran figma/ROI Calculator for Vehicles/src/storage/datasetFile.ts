import { validateDataset, type Dataset } from "@/domain/dataset";

export const MAX_DATASET_FILE_BYTES = 1_000_000;

export type DatasetFileError = "file-too-large" | "invalid-json" | "invalid-dataset";

export type ParseDatasetFileResult =
  | { ok: true; dataset: Dataset }
  | { ok: false; error: DatasetFileError; details?: string[] };

export function parseDatasetFile(
  text: string,
  fileSizeBytes = new TextEncoder().encode(text).byteLength,
): ParseDatasetFileResult {
  if (fileSizeBytes > MAX_DATASET_FILE_BYTES) return { ok: false, error: "file-too-large" };

  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch {
    return { ok: false, error: "invalid-json" };
  }

  const validation = validateDataset(value);
  if (!validation.ok) return { ok: false, error: "invalid-dataset", details: validation.errors };
  return { ok: true, dataset: validation.dataset };
}

export function serializeDataset(dataset: Dataset): string {
  const validation = validateDataset(dataset);
  if (!validation.ok) throw new Error("Cannot export an invalid dataset.");
  return `${JSON.stringify(validation.dataset, null, 2)}\n`;
}
