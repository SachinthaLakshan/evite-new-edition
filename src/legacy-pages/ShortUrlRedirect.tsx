"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

export default function ShortUrlRedirect() {
  const { shortId } = useParams<{ shortId: string }>();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const redirectToOriginalUrl = async () => {
      if (!shortId) {
        setError("Invalid short URL");
        return;
      }

      try {
        // Look up the original URL in the database
        const { data, error } = await supabase
          .from("short_urls")
          .select("original_url, expires_at, clicks")
          .eq("short_id", shortId)
          .single();

        if (error || !data) {
          setError("Short URL not found");
          setTimeout(() => router.push("/404"), 2000);
          return;
        }

        // Check if URL has expired
        if (new Date(data.expires_at) < new Date()) {
          setError("This link has expired");

          // Delete the expired URL
          await supabase.from("short_urls").delete().eq("short_id", shortId);

          setTimeout(() => router.push("/404"), 2000);
          return;
        }

        // If URL is valid, increment click count if you track that
        const currentClicks = data.clicks || 0;
        await supabase
          .from("short_urls")
          .update({ clicks: currentClicks + 1 })
          .eq("short_id", shortId);

        // Redirect to the original URL
        const originalUrl = data.original_url;

        if (
          originalUrl.startsWith("/") ||
          originalUrl.startsWith(window.location.origin)
        ) {
          // For internal URLs, extract the path if it's a full URL
          const url = originalUrl.startsWith("/")
            ? originalUrl
            : originalUrl.replace(window.location.origin, "");
          router.push(url);
        } else {
          window.location.href = originalUrl;
        }
      } catch (err) {
        console.error("Error redirecting:", err);
        setError("Failed to process the short URL");
        setTimeout(() => router.push("/404"), 2000);
      }
    };

    redirectToOriginalUrl();
  }, [shortId, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      {error ? (
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">{error}</h1>
          <p className="text-gray-600">Redirecting to home page...</p>
        </div>
      ) : (
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <h1 className="text-2xl font-medium mb-2">Redirecting you...</h1>
          <p className="text-gray-600">Please wait a moment</p>
        </div>
      )}
    </div>
  );
}
