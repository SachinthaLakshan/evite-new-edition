"use client";

import { useEffect, useState } from "react";
import { Copy, LinkIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { getOrCreateEventShortUrl } from "@/lib/url-shortener";

export function SharedInviteLink({ eventId }: { eventId: string }) {
  const [shortUrl, setShortUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [copying, setCopying] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getOrCreateEventShortUrl(eventId)
      .then((url) => {
        if (!cancelled) setShortUrl(url);
      })
      .catch(() => {
        if (!cancelled) setShortUrl("");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [eventId]);

  const copy = async () => {
    if (!eventId) return;
    setCopying(true);
    try {
      const url = shortUrl || (await getOrCreateEventShortUrl(eventId));
      setShortUrl(url);
      await navigator.clipboard.writeText(url);
      toast.success("Short invitation link copied");
    } catch {
      toast.error("Could not copy the short link");
    } finally {
      setCopying(false);
    }
  };

  return (
    <div className="mt-3 flex min-w-0 items-center gap-2 rounded-xl border border-[#1E4A42]/20 bg-white px-3 py-2">
      <LinkIcon className="h-4 w-4 shrink-0 text-[#1E4A42]" />
      <span className="min-w-0 flex-1 truncate text-sm text-[#1E4A42]">
        {loading ? "Preparing short link..." : shortUrl || "Short link unavailable"}
      </span>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-8 shrink-0 rounded-full px-3"
        onClick={copy}
        disabled={copying || loading}
      >
        {copying || loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Copy className="h-3.5 w-3.5" />}
        <span className="ml-1.5">Copy</span>
      </Button>
    </div>
  );
}
