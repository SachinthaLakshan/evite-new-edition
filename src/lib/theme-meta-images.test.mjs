import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const sourcePath = join(dirname(fileURLToPath(import.meta.url)), "theme-meta-images.ts");
const source = readFileSync(sourcePath, "utf8");
const javascript = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
  },
}).outputText;

const themeMetaImages = await import(
  `data:text/javascript;charset=utf-8,${encodeURIComponent(javascript)}`
);

const {
  THEME_META_IMAGE_MAX_BYTES,
  buildThemeMetaImageUpdate,
  themeMetaStoragePath,
  validateThemeMetaFile,
} = themeMetaImages;

test("accepts jpeg, png, and webp up to 5 MB", () => {
  for (const type of ["image/jpeg", "image/png", "image/webp"]) {
    const result = validateThemeMetaFile({ type, size: THEME_META_IMAGE_MAX_BYTES });
    assert.equal(result.ok, true);
  }
});

test("rejects other file types and files over 5 MB", () => {
  const gif = validateThemeMetaFile({ type: "image/gif", size: 1000 });
  assert.equal(gif.ok, false);
  assert.match(gif.message, /JPEG, PNG, or WebP/);

  const huge = validateThemeMetaFile({
    type: "image/jpeg",
    size: THEME_META_IMAGE_MAX_BYTES + 1,
  });
  assert.equal(huge.ok, false);
  assert.match(huge.message, /5 MB/);
});

test("builds a storage path from the theme id and mime type", () => {
  assert.equal(
    themeMetaStoragePath("classic", "image/jpeg", 1_700_000_000_000),
    "classic/1700000000000.jpg",
  );
  assert.equal(
    themeMetaStoragePath("redroseclassic", "image/png", 42),
    "redroseclassic/42.png",
  );
  assert.equal(
    themeMetaStoragePath("lavender", "image/webp", 7),
    "lavender/7.webp",
  );
});

test("refuses a theme id that is not a safe storage folder", () => {
  assert.throws(
    () => themeMetaStoragePath("../classic", "image/jpeg", 1),
    /theme id/,
  );
  assert.throws(
    () => themeMetaStoragePath("classic", "image/gif", 1),
    /mime/,
  );
});

test("records the new image, path, admin, and time on replace", () => {
  const update = buildThemeMetaImageUpdate({
    imageUrl: "https://cdn.example/classic/1.jpg",
    storagePath: "classic/1.jpg",
    userId: "admin-1",
    now: new Date("2026-11-08T12:00:00.000Z"),
  });

  assert.deepEqual(update, {
    image_url: "https://cdn.example/classic/1.jpg",
    storage_path: "classic/1.jpg",
    updated_by: "admin-1",
    updated_at: "2026-11-08T12:00:00.000Z",
  });
});
