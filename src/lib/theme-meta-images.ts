export const THEME_META_IMAGE_MAX_BYTES = 5 * 1024 * 1024;

const MIME_EXTENSION: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

const THEME_ID_PATTERN = /^[a-z0-9]+$/;

export type ThemeMetaImage = {
  theme_id: string;
  theme_name: string;
  image_url: string | null;
  storage_path: string | null;
  updated_at: string;
  updated_by: string | null;
};

export type ThemeMetaFileCheck =
  | { ok: true }
  | { ok: false; message: string };

export function validateThemeMetaFile(file: {
  type: string;
  size: number;
}): ThemeMetaFileCheck {
  if (!MIME_EXTENSION[file.type]) {
    return { ok: false, message: "Use a JPEG, PNG, or WebP image." };
  }
  if (file.size > THEME_META_IMAGE_MAX_BYTES) {
    return { ok: false, message: "Image must be 5 MB or smaller." };
  }
  return { ok: true };
}

export function themeMetaStoragePath(
  themeId: string,
  mimeType: string,
  nowMs: number,
): string {
  if (!THEME_ID_PATTERN.test(themeId)) {
    throw new Error(`Invalid theme id: ${themeId}`);
  }
  const extension = MIME_EXTENSION[mimeType];
  if (!extension) {
    throw new Error(`Unsupported mime type: ${mimeType}`);
  }
  return `${themeId}/${nowMs}.${extension}`;
}

export function buildThemeMetaImageUpdate(input: {
  imageUrl: string;
  storagePath: string;
  userId: string;
  now?: Date;
}) {
  return {
    image_url: input.imageUrl,
    storage_path: input.storagePath,
    updated_by: input.userId,
    updated_at: (input.now ?? new Date()).toISOString(),
  };
}

const THEME_META_ORDER = [
  "classic",
  "lavender",
  "sage",
  "redrose",
  "redroseclassic",
  "creamclassicdesign",
  "lotuspremium",
  "cozyroyale",
];

export function sortThemeMetaImages<T extends { theme_id: string }>(rows: T[]): T[] {
  return [...rows].sort((a, b) => {
    const aIndex = THEME_META_ORDER.indexOf(a.theme_id);
    const bIndex = THEME_META_ORDER.indexOf(b.theme_id);
    return (aIndex === -1 ? THEME_META_ORDER.length : aIndex) -
      (bIndex === -1 ? THEME_META_ORDER.length : bIndex);
  });
}
