export interface PropertyLandmark {
  name: string;
  distance: string;
}

function asStringList(value: unknown) {
  if (Array.isArray(value)) {
    return value
      .map(String)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  if (typeof value !== "string" || !value.trim()) return [];

  try {
    const parsed: unknown = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed
        .map(String)
        .map((item) => item.trim())
        .filter(Boolean);
    }
  } catch {
    // Legacy properties store one landmark as plain text.
  }

  return [value.trim()];
}

/**
 * The backend currently exposes singular text fields. Multiple landmarks are
 * stored as parallel JSON arrays in those same fields, while a single item
 * remains plain text for compatibility with existing records.
 */
export function parsePropertyLandmarks(
  propertyLandMark: unknown,
  distance: unknown,
): PropertyLandmark[] {
  if (typeof propertyLandMark === "string" && propertyLandMark.trim()) {
    try {
      const parsed: unknown = JSON.parse(propertyLandMark);
      if (
        Array.isArray(parsed) &&
        parsed.every((item) => typeof item === "object" && item)
      ) {
        return parsed
          .map((item) => item as Record<string, unknown>)
          .map((item) => ({
            name: String(item.name ?? item.landmark ?? "").trim(),
            distance: String(item.distance ?? "").trim(),
          }))
          .filter((item) => item.name && item.distance);
      }
    } catch {
      // Fall through to the parallel-string format below.
    }
  }

  const names = asStringList(propertyLandMark);
  const distances = asStringList(distance);

  return names
    .map((name, index) => ({
      name,
      distance: distances[index] ?? "",
    }))
    .filter((item) => item.name && item.distance);
}

export function serializePropertyLandmarks(landmarks: PropertyLandmark[]) {
  const normalized = landmarks
    .map((item) => ({
      name: item.name.trim(),
      distance: item.distance.trim(),
    }))
    .filter((item) => item.name && item.distance);

  if (normalized.length === 0) {
    return { propertyLandMark: "", distance: "" };
  }
  if (normalized.length === 1) {
    return {
      propertyLandMark: normalized[0].name,
      distance: normalized[0].distance,
    };
  }

  return {
    propertyLandMark: JSON.stringify(normalized.map((item) => item.name)),
    distance: JSON.stringify(normalized.map((item) => item.distance)),
  };
}
