import {
  createEmptyDataset,
  validateDataset,
  type Dataset,
} from "@/domain/dataset";

export const DATASET_STORAGE_KEY = "bioflex-roi:local-dataset:v1";

export type DatasetStorageError =
  | "storage-read-failed"
  | "invalid-json"
  | "invalid-dataset"
  | "storage-write-failed";

export type LoadDatasetResult =
  | { ok: true; dataset: Dataset }
  | { ok: false; error: DatasetStorageError; details?: string[] };

export type SaveDatasetResult =
  | { ok: true }
  | { ok: false; error: "invalid-dataset" | "storage-write-failed"; details?: string[] };

export function loadDataset(storage?: Storage, now = new Date()): LoadDatasetResult {
  let raw: string | null;
  try {
    raw = (storage ?? window.localStorage).getItem(DATASET_STORAGE_KEY);
  } catch {
    return { ok: false, error: "storage-read-failed" };
  }

  if (raw === null) return { ok: true, dataset: createEmptyDataset(now) };

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ok: false, error: "invalid-json" };
  }

  const validation = validateDataset(parsed);
  if (!validation.ok) return { ok: false, error: "invalid-dataset", details: validation.errors };
  return { ok: true, dataset: validation.dataset };
}

export function saveDataset(dataset: Dataset, storage?: Storage): SaveDatasetResult {
  const validation = validateDataset(dataset);
  if (!validation.ok) return { ok: false, error: "invalid-dataset", details: validation.errors };

  try {
    (storage ?? window.localStorage).setItem(DATASET_STORAGE_KEY, JSON.stringify(validation.dataset));
    return { ok: true };
  } catch {
    return { ok: false, error: "storage-write-failed" };
  }
}
