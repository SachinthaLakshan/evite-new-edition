"use client";

import { buildSharePreviewText } from "@/lib/event-meta-image";

const SAMPLE_GUEST = "Kasun";

type WhatsAppSharePreviewProps = {
  imageUrl: string | null;
  title: string;
  message: string;
  url: string;
};

export default function WhatsAppSharePreview({
  imageUrl,
  title,
  message,
  url,
}: WhatsAppSharePreviewProps) {
  const previewText = buildSharePreviewText({
    guestName: SAMPLE_GUEST,
    message,
    url,
  });
  const linkStart = previewText.lastIndexOf(url);
  const beforeLink = linkStart >= 0 ? previewText.slice(0, linkStart) : previewText;
  const timeLabel = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="rounded-2xl bg-[#0b141a] p-3 shadow-inner">
      <div className="overflow-hidden rounded-lg bg-[#1f2c34]">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="WhatsApp share preview"
            className="aspect-[1200/630] w-full object-cover"
          />
        ) : (
          <div className="flex aspect-[1200/630] items-center justify-center bg-[#111b21] text-xs text-[#8696a0]">
            Share image preview
          </div>
        )}
        <div className="space-y-1 px-3 pb-2 pt-2">
          <p className="text-[15px] font-semibold leading-tight text-white">{title}</p>
          <p className="text-xs text-[#8696a0]">www.evite.lk</p>
          <p className="pt-1 text-[13px] leading-snug text-[#e9edef]">
            {beforeLink}
            {linkStart >= 0 && <span className="text-[#53bdeb] break-all">{url}</span>}
          </p>
          <p className="text-right text-[11px] text-[#8696a0]">{timeLabel}</p>
        </div>
      </div>
    </div>
  );
}
