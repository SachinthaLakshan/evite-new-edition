import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const sourcePath = join(dirname(fileURLToPath(import.meta.url)), "event-meta-image.ts");
const source = readFileSync(sourcePath, "utf8");
const javascript = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
  },
}).outputText;

const eventMetaImage = await import(
  `data:text/javascript;charset=utf-8,${encodeURIComponent(javascript)}`
);

const {
  EVENT_META_IMAGE_MAX_BYTES,
  buildSharePreviewText,
  eventImageStoragePath,
  eventMetaAspectMatches,
  formatMetaCoupleLine,
  formatMetaWeddingDate,
  validateEventMetaUpload,
} = eventMetaImage;

test("accepts jpeg, png, and webp at 1 MB", () => {
  for (const type of ["image/jpeg", "image/png", "image/webp"]) {
    assert.equal(
      validateEventMetaUpload({ type, size: EVENT_META_IMAGE_MAX_BYTES }).ok,
      true,
    );
  }
});

test("rejects other types, empty files, and files over 1 MB", () => {
  const gif = validateEventMetaUpload({ type: "image/gif", size: 1000 });
  assert.equal(gif.ok, false);
  assert.match(gif.message, /JPEG, PNG, or WebP/);

  const huge = validateEventMetaUpload({
    type: "image/jpeg",
    size: EVENT_META_IMAGE_MAX_BYTES + 1,
  });
  assert.equal(huge.ok, false);
  assert.match(huge.message, /1 MB/);

  const empty = validateEventMetaUpload({ type: "image/jpeg", size: 0 });
  assert.equal(empty.ok, false);
});

test("accepts landscape sizes close to the share image", () => {
  assert.equal(eventMetaAspectMatches(1200, 630), true);
  assert.equal(eventMetaAspectMatches(1600, 900), true);
  assert.equal(eventMetaAspectMatches(800, 1200), false);
  assert.equal(eventMetaAspectMatches(400, 200), false);
});

test("formats the couple line and wedding date", () => {
  assert.equal(formatMetaCoupleLine("Imasha", "Kasun"), "Imasha & Kasun");
  assert.equal(formatMetaCoupleLine("  ", "Kasun"), "Bride & Kasun");
  assert.equal(formatMetaWeddingDate("2026-11-20"), "20 November 2026");
  assert.equal(formatMetaWeddingDate("2026-11-20T18:30:00.000Z"), "20 November 2026");
  assert.equal(formatMetaWeddingDate(""), "");
});

test("builds the WhatsApp message with the guest link", () => {
  assert.equal(
    buildSharePreviewText({
      guestName: "Kasun",
      message: "We're excited to invite you to Admin Test. Please view your invitation and RSVP here",
      url: "http://www.evite.lk/s/ip0s7",
    }),
    "Hi Kasun! We're excited to invite you to Admin Test. Please view your invitation and RSVP here: http://www.evite.lk/s/ip0s7",
  );
});

test("reads the storage path from a public event image URL", () => {
  assert.equal(
    eventImageStoragePath(
      "https://example.supabase.co/storage/v1/object/public/event-images/user/meta/1.jpg",
    ),
    "user/meta/1.jpg",
  );
  assert.equal(eventImageStoragePath("https://example.com/other.jpg"), null);
});
