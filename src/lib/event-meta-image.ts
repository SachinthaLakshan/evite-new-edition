export const EVENT_META_IMAGE_MAX_BYTES = 1024 * 1024;
export const EVENT_META_IMAGE_WIDTH = 1200;
export const EVENT_META_IMAGE_HEIGHT = 630;

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export type EventMetaFileCheck =
  | { ok: true }
  | { ok: false; message: string };

export function validateEventMetaUpload(file: {
  type: string;
  size: number;
}): EventMetaFileCheck {
  if (!file.type || file.size <= 0) {
    return { ok: false, message: "Choose an image file." };
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return { ok: false, message: "Use a JPEG, PNG, or WebP image." };
  }
  if (file.size > EVENT_META_IMAGE_MAX_BYTES) {
    return { ok: false, message: "Image must be 1 MB or smaller." };
  }
  return { ok: true };
}

/** Landscape photos close to the 1200×630 share image. */
export function eventMetaAspectMatches(width: number, height: number) {
  if (width < 800 || height < 400) return false;
  const ratio = width / height;
  return ratio >= 1.6 && ratio <= 2.2;
}

export function formatMetaCoupleLine(bride: string, groom: string) {
  const left = bride.trim() || "Bride";
  const right = groom.trim() || "Groom";
  return `${left} & ${right}`;
}

export function formatMetaWeddingDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value.trim());
  if (!match) return "";
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function buildSharePreviewText(input: {
  guestName: string;
  message: string;
  url: string;
}) {
  const message = input.message.trim().replace(/[:\s]+$/, "");
  return `Hi ${input.guestName}! ${message}: ${input.url}`;
}

export function eventImageStoragePath(publicUrl: string) {
  const marker = "/event-images/";
  const index = publicUrl.indexOf(marker);
  if (index === -1) return null;
  const path = publicUrl.slice(index + marker.length).split("?")[0];
  if (!path) return null;
  try {
    return decodeURIComponent(path);
  } catch {
    return path;
  }
}
