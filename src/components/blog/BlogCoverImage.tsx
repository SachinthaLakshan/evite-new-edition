"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

type BlogCoverImageProps = {
  src: string;
  alt: string;
  priority?: boolean;
  sizes: string;
  className?: string;
  fill?: boolean;
};

export function BlogCoverImage({
  src,
  alt,
  priority,
  sizes,
  className,
  fill = true,
}: BlogCoverImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed || !src.trim()) {
    return (
      <div
        className={cn(
          "flex h-full w-full items-center justify-center bg-gradient-to-br from-[#f5e6d3] via-[#fffaf3] to-[#e8d4f4] text-sm font-semibold text-[#9a6b32]",
          className,
        )}
      >
        eVite Wedding Guide
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      priority={priority}
      sizes={sizes}
      className={cn("object-cover", className)}
      onError={() => setFailed(true)}
    />
  );
}
