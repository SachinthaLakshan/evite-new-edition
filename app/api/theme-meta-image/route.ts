import { NextRequest } from "next/server";
import { themeMetaImageProxyPath } from "@/lib/event-meta-image";

export async function GET(request: NextRequest) {
  const target = request.nextUrl.searchParams.get("url");
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!target || !supabaseUrl || !themeMetaImageProxyPath(target, supabaseUrl)) {
    return new Response("Image not allowed", { status: 400 });
  }

  const upstream = await fetch(target);
  if (!upstream.ok || !upstream.body) {
    return new Response("Could not load the theme image", { status: 502 });
  }

  return new Response(upstream.body, {
    headers: {
      "Content-Type": upstream.headers.get("content-type") || "image/jpeg",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
