"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { layoutOptions } from "@/components/event/EventLayoutSelection";
import WhatsAppSharePreview from "@/components/event/WhatsAppSharePreview";
import { SITE_URL } from "@/lib/seo/site";
import {
  EVENT_META_IMAGE_HEIGHT,
  EVENT_META_IMAGE_WIDTH,
  eventImageStoragePath,
  eventMetaAspectMatches,
  formatMetaCoupleLine,
  formatMetaWeddingDate,
  themeMetaImageProxyPath,
  validateEventMetaUpload,
} from "@/lib/event-meta-image";

const SAMPLE_SHARE_URL = "https://www.evite.lk/s/preview";

type EventMetaImageEditorProps = {
  brideName: string;
  groomName: string;
  weddingDate: string;
  eventTitle: string;
  themeId: string;
  shareUrl?: string | null;
  shareMessage: string;
  savedImageUrl?: string | null;
  saveLabel?: string;
  onAccept: (blob: Blob) => Promise<void> | void;
  onDraftChange?: () => void;
};

function themeFallback(themeId: string) {
  return layoutOptions.find((layout) => layout.id === themeId)?.bgImage || "/assets/floral-bg-og.jpg";
}

function canvasImageSource(src: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) return src;
  return themeMetaImageProxyPath(src, supabaseUrl) || src;
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Could not load the background image."));
    image.src = canvasImageSource(src);
  });
}

function canvasToJpeg(canvas: HTMLCanvasElement) {
  const encode = (quality: number) =>
    new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error("Could not capture the share image."))),
        "image/jpeg",
        quality,
      );
    });

  return (async () => {
    let quality = 0.86;
    let blob = await encode(quality);
    while (blob.size > 1024 * 1024 && quality > 0.5) {
      quality -= 0.08;
      blob = await encode(quality);
    }
    return blob;
  })();
}

function drawShareImage(
  canvas: HTMLCanvasElement,
  image: HTMLImageElement,
  coupleLine: string,
  dateLabel: string,
) {
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Could not draw the share image.");

  canvas.width = EVENT_META_IMAGE_WIDTH;
  canvas.height = EVENT_META_IMAGE_HEIGHT;

  const scale = Math.max(canvas.width / image.width, canvas.height / image.height);
  const width = image.width * scale;
  const height = image.height * scale;
  context.drawImage(
    image,
    (canvas.width - width) / 2,
    (canvas.height - height) / 2,
    width,
    height,
  );

  const wash = context.createLinearGradient(0, canvas.height * 0.28, 0, canvas.height * 0.78);
  wash.addColorStop(0, "rgba(255,255,255,0)");
  wash.addColorStop(0.5, "rgba(255,255,255,0.34)");
  wash.addColorStop(1, "rgba(255,255,255,0)");
  context.fillStyle = wash;
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillStyle = "#000000";
  context.shadowColor = "rgba(255,255,255,0.9)";
  context.shadowBlur = 16;

  let nameSize = 112;
  context.font = `${nameSize}px Parisienne, cursive`;
  while (context.measureText(coupleLine).width > 1080 && nameSize > 64) {
    nameSize -= 2;
    context.font = `${nameSize}px Parisienne, cursive`;
  }
  context.fillText(coupleLine, canvas.width / 2, canvas.height / 2 - 28);

  if (dateLabel) {
    context.font = "52px Georgia, serif";
    context.fillText(dateLabel, canvas.width / 2, canvas.height / 2 + nameSize * 0.55);
  }
  context.shadowBlur = 0;
}

export default function EventMetaImageEditor({
  brideName,
  groomName,
  weddingDate,
  eventTitle,
  themeId,
  shareUrl,
  shareMessage,
  savedImageUrl,
  saveLabel = "Save meta image",
  onAccept,
  onDraftChange,
}: EventMetaImageEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawnSignature = useRef<string | null>(null);
  const onDraftChangeRef = useRef(onDraftChange);
  onDraftChangeRef.current = onDraftChange;
  const [source, setSource] = useState<"default" | "upload">("default");
  const [defaultUrl, setDefaultUrl] = useState<string | null>(null);
  const [uploadUrl, setUploadUrl] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(savedImageUrl || null);
  const [preparing, setPreparing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [accepted, setAccepted] = useState(Boolean(savedImageUrl));
  const [customizing, setCustomizing] = useState(!savedImageUrl);

  useEffect(() => {
    let cancelled = false;
    const fallback = themeFallback(themeId);

    void (async () => {
      try {
        const { data, error } = await supabase
          .from("theme_meta_images")
          .select("image_url")
          .eq("theme_id", themeId)
          .maybeSingle();
        if (cancelled) return;
        if (error) {
          console.error(error);
          setDefaultUrl(fallback);
          return;
        }
        setDefaultUrl(data?.image_url || fallback);
      } catch {
        if (!cancelled) setDefaultUrl(fallback);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [themeId]);

  useEffect(() => {
    return () => {
      if (uploadUrl) URL.revokeObjectURL(uploadUrl);
    };
  }, [uploadUrl]);

  const backgroundUrl = source === "upload" && uploadUrl ? uploadUrl : defaultUrl;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !backgroundUrl) return;

    let cancelled = false;
    const signature = `${brideName}|${groomName}|${weddingDate}|${backgroundUrl}`;
    setPreparing(true);

    (async () => {
      try {
        await document.fonts.load("112px Parisienne");
        const image = await loadImage(backgroundUrl);
        if (cancelled) return;
        if (drawnSignature.current && drawnSignature.current !== signature) {
          setAccepted(false);
          onDraftChangeRef.current?.();
        }
        drawnSignature.current = signature;
        drawShareImage(
          canvas,
          image,
          formatMetaCoupleLine(brideName, groomName),
          formatMetaWeddingDate(weddingDate),
        );
        if (customizing) {
          setPreviewUrl(canvas.toDataURL("image/jpeg", 0.86));
        }
      } catch (error) {
        if (!cancelled) {
          console.error(error);
          toast.error("Could not prepare the share image preview.");
        }
      } finally {
        if (!cancelled) setPreparing(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [backgroundUrl, brideName, groomName, weddingDate, themeId, customizing]);

  const onUpload = async (file: File | undefined) => {
    if (!file) return;
    const check = validateEventMetaUpload(file);
    if (check.ok === false) {
      toast.error(check.message);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    try {
      const image = await loadImage(objectUrl);
      if (!eventMetaAspectMatches(image.width, image.height)) {
        URL.revokeObjectURL(objectUrl);
        toast.error("Use a landscape photo close to 1200×630 so it matches the share image.");
        return;
      }
    } catch {
      URL.revokeObjectURL(objectUrl);
      toast.error("Could not read that image.");
      return;
    }

    setUploadUrl((current) => {
      if (current) URL.revokeObjectURL(current);
      return objectUrl;
    });
    setSource("upload");
  };

  const save = async () => {
    const canvas = canvasRef.current;
    if (!canvas || preparing) return;
    setSaving(true);
    try {
      const blob = await canvasToJpeg(canvas);
      await onAccept(blob);
      setAccepted(true);
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : "Could not save the meta image.";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const displayUrl = shareUrl || SAMPLE_SHARE_URL;
  const title = `${eventTitle.trim() || "My Wedding"} | Invitation`;

  return (
    <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-100">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">WhatsApp share image</h3>
        <p className="text-sm text-gray-500 mt-1">
          Guests see this picture when the invite link is sent. Bride and groom names go in the middle, with the wedding date underneath. Save it so the image belongs to this event.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                setSource("default");
                setCustomizing(true);
              }}
              className={`rounded-xl border-2 p-4 text-left ${
                source === "default" ? "border-primary bg-primary/5" : "border-gray-200"
              }`}
            >
              <div className="font-semibold text-gray-900">Use default image</div>
              <p className="text-xs text-gray-500 mt-1">The theme share image, with your names and date added.</p>
            </button>
            <button
              type="button"
              onClick={() => {
                setSource("upload");
                setCustomizing(true);
              }}
              className={`rounded-xl border-2 p-4 text-left ${
                source === "upload" ? "border-primary bg-primary/5" : "border-gray-200"
              }`}
            >
              <div className="font-semibold text-gray-900">Upload your photo</div>
              <p className="text-xs text-gray-500 mt-1">Landscape JPEG, PNG, or WebP under 1 MB, close to 1200×630.</p>
            </button>
          </div>

          {source === "upload" && (
            <div className="space-y-2">
              <Label htmlFor="event-meta-upload">Couple photo</Label>
              <Input
                id="event-meta-upload"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  event.target.value = "";
                  void onUpload(file);
                }}
              />
            </div>
          )}

          <div className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-xs text-gray-600 break-all">
            <span className="font-semibold text-gray-800">Link in the message: </span>
            {shareUrl ? (
              <a href={shareUrl} className="text-purple-700 hover:underline" target="_blank" rel="noreferrer">
                {shareUrl}
              </a>
            ) : (
              <span>{SAMPLE_SHARE_URL}</span>
            )}
            {!shareUrl && (
              <p className="mt-1 text-gray-500">
                A real guest link is created when the event is saved. Each guest then receives their own short link.
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button type="button" onClick={() => void save()} disabled={!customizing || preparing || saving || !previewUrl}>
              {saving ? "Saving..." : saveLabel}
            </Button>
            {(preparing || saving) && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
            {savedImageUrl && !customizing && (
              <p className="text-sm text-gray-600">
                This is the image already saved for the event. Choose the default or a new photo, then save to replace it.
              </p>
            )}
            {accepted && !preparing && (
              <span className="text-sm text-green-700">
                {savedImageUrl ? "Saved for this event." : "Ready. It will be stored when you create the event."}
              </span>
            )}
          </div>
          {savedImageUrl && !accepted && (
            <p className="text-xs text-amber-700">
              The preview changed. Save again to replace the image stored for this event.
            </p>
          )}
        </div>

        <WhatsAppSharePreview
          imageUrl={previewUrl}
          title={title}
          message={shareMessage}
          url={displayUrl}
        />
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}

export async function uploadEventMetaImage(input: {
  blob: Blob;
  userId: string;
  eventId?: string;
  previousUrl?: string | null;
}) {
  const fileName = input.eventId
    ? `${input.userId}/meta/${input.eventId}-${Date.now()}.jpg`
    : `${input.userId}/meta/${Date.now()}.jpg`;

  const { error } = await supabase.storage.from("event-images").upload(fileName, input.blob, {
    contentType: "image/jpeg",
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw error;

  const {
    data: { publicUrl },
  } = supabase.storage.from("event-images").getPublicUrl(fileName);

  const previousPath = input.previousUrl ? eventImageStoragePath(input.previousUrl) : null;
  if (previousPath && previousPath !== fileName) {
    await supabase.storage.from("event-images").remove([previousPath]);
  }

  return publicUrl;
}
