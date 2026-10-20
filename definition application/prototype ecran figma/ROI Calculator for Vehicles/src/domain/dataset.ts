export const DATASET_SCHEMA_VERSION = 1 as const;

export type Fill = {
  id: string;
  recordedAt: string;
  e85PricePerLitreEur: number;
  sp95PricePerLitreEur: number;
  litres: number;
};

export type Vehicle = {
  id: string;
  make: string;
  model: string;
  boxCostEur: number;
  installDate: string;
  createdAt: string;
  fills: Fill[];
};

export type Dataset = {
  schemaVersion: typeof DATASET_SCHEMA_VERSION;
  updatedAt: string;
  vehicles: Vehicle[];
};

export type DatasetValidationResult =
  | { ok: true; dataset: Dataset }
  | { ok: false; errors: string[] };

const uuidPattern = /^[\da-f]{8}-(?:[\da-f]{4}-){3}[\da-f]{12}$/i;
const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const utcDateTimePattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/;

export function createEmptyDataset(now = new Date()): Dataset {
  return {
    schemaVersion: DATASET_SCHEMA_VERSION,
    updatedAt: now.toISOString(),
    vehicles: [],
  };
}

export function validateDataset(value: unknown): DatasetValidationResult {
  const errors: string[] = [];

  if (!isRecord(value)) return { ok: false, errors: ["Dataset must be a JSON object."] };
  if (!hasOnlyKeys(value, ["schemaVersion", "updatedAt", "vehicles"])) {
    errors.push("Dataset contains unsupported fields.");
  }
  if (value.schemaVersion !== DATASET_SCHEMA_VERSION) {
    errors.push(`Unsupported dataset schema version: ${String(value.schemaVersion)}.`);
  }
  if (!isUtcDateTime(value.updatedAt)) errors.push("Dataset updatedAt must be a valid UTC date and time.");
  if (!Array.isArray(value.vehicles)) errors.push("Dataset vehicles must be an array.");

  const ids = new Set<string>();
  const vehicles: Vehicle[] = [];

  if (Array.isArray(value.vehicles)) {
    value.vehicles.forEach((candidate, vehicleIndex) => {
      const vehiclePath = `vehicles[${vehicleIndex}]`;
      if (!isRecord(candidate)) {
        errors.push(`${vehiclePath} must be an object.`);
        return;
      }
      if (!hasOnlyKeys(candidate, ["id", "make", "model", "boxCostEur", "installDate", "createdAt", "fills"])) {
        errors.push(`${vehiclePath} contains unsupported fields.`);
      }

      const id = readId(candidate.id, `${vehiclePath}.id`, ids, errors);
      const make = readRequiredString(candidate.make, `${vehiclePath}.make`, errors);
      const model = readRequiredString(candidate.model, `${vehiclePath}.model`, errors);
      const boxCostEur = readPositiveNumber(candidate.boxCostEur, `${vehiclePath}.boxCostEur`, errors);
      const installDate = candidate.installDate;
      if (!isCalendarDate(installDate)) errors.push(`${vehiclePath}.installDate must be a valid YYYY-MM-DD date.`);
      const createdAt = candidate.createdAt;
      if (!isUtcDateTime(createdAt)) errors.push(`${vehiclePath}.createdAt must be a valid UTC date and time.`);
      if (!Array.isArray(candidate.fills)) errors.push(`${vehiclePath}.fills must be an array.`);

      const fills: Fill[] = [];
      if (Array.isArray(candidate.fills)) {
        candidate.fills.forEach((fillCandidate, fillIndex) => {
          const fillPath = `${vehiclePath}.fills[${fillIndex}]`;
          if (!isRecord(fillCandidate)) {
            errors.push(`${fillPath} must be an object.`);
            return;
          }
          if (!hasOnlyKeys(fillCandidate, ["id", "recordedAt", "e85PricePerLitreEur", "sp95PricePerLitreEur", "litres"])) {
            errors.push(`${fillPath} contains unsupported fields.`);
          }

          const fillId = readId(fillCandidate.id, `${fillPath}.id`, ids, errors);
          const recordedAt = fillCandidate.recordedAt;
          if (!isUtcDateTime(recordedAt)) errors.push(`${fillPath}.recordedAt must be a valid UTC date and time.`);
          if (isUtcDateTime(recordedAt) && isCalendarDate(installDate) && recordedAt.slice(0, 10) < installDate) {
            errors.push(`${fillPath}.recordedAt cannot be earlier than the vehicle installation date.`);
          }
          const e85PricePerLitreEur = readPositiveNumber(fillCandidate.e85PricePerLitreEur, `${fillPath}.e85PricePerLitreEur`, errors);
          const sp95PricePerLitreEur = readPositiveNumber(fillCandidate.sp95PricePerLitreEur, `${fillPath}.sp95PricePerLitreEur`, errors);
          const litres = readPositiveNumber(fillCandidate.litres, `${fillPath}.litres`, errors);

          if (fillId && isUtcDateTime(recordedAt) && e85PricePerLitreEur !== null && sp95PricePerLitreEur !== null && litres !== null) {
            fills.push({ id: fillId, recordedAt, e85PricePerLitreEur, sp95PricePerLitreEur, litres });
          }
        });
      }

      if (
        id && make !== null && model !== null && boxCostEur !== null
        && isCalendarDate(installDate) && isUtcDateTime(createdAt)
        && Array.isArray(candidate.fills) && fills.length === candidate.fills.length
      ) {
        vehicles.push({
          id,
          make,
          model,
          boxCostEur,
          installDate,
          createdAt,
          fills,
        });
      }
    });
  }

  if (errors.length > 0 || value.schemaVersion !== DATASET_SCHEMA_VERSION || !isUtcDateTime(value.updatedAt) || !Array.isArray(value.vehicles) || vehicles.length !== value.vehicles.length) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    dataset: {
      schemaVersion: DATASET_SCHEMA_VERSION,
      updatedAt: value.updatedAt,
      vehicles,
    },
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasOnlyKeys(value: Record<string, unknown>, allowed: string[]): boolean {
  return Object.keys(value).every((key) => allowed.includes(key));
}

function readId(value: unknown, path: string, ids: Set<string>, errors: string[]): string | null {
  if (typeof value !== "string" || !uuidPattern.test(value)) {
    errors.push(`${path} must be a UUID string.`);
    return null;
  }
  const normalized = value.toLowerCase();
  if (ids.has(normalized)) errors.push(`${path} must be unique in the dataset.`);
  ids.add(normalized);
  return normalized;
}

function readRequiredString(value: unknown, path: string, errors: string[]): string | null {
  if (typeof value !== "string" || value.trim().length === 0) {
    errors.push(`${path} must be a non-empty string.`);
    return null;
  }
  return value.trim();
}

function readPositiveNumber(value: unknown, path: string, errors: string[]): number | null {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    errors.push(`${path} must be a finite positive number.`);
    return null;
  }
  return value;
}

function isCalendarDate(value: unknown): value is string {
  if (typeof value !== "string" || !datePattern.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function isUtcDateTime(value: unknown): value is string {
  if (typeof value !== "string" || !utcDateTimePattern.test(value) || !isCalendarDate(value.slice(0, 10))) return false;
  const time = value.slice(11).match(/^(\d{2}):(\d{2}):(\d{2})/);
  if (!time || Number(time[1]) > 23 || Number(time[2]) > 59 || Number(time[3]) > 59) return false;
  return Number.isFinite(Date.parse(value));
}
