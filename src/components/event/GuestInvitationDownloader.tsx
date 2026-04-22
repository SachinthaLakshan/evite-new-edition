"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { DownloadIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface GuestInvitationDownloaderProps {
  attendeeName: string;
  finalCardUrl?: string | null;
}

export const GuestInvitationDownloader: React.FC<GuestInvitationDownloaderProps> = ({
  attendeeName,
  finalCardUrl,
}) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (!finalCardUrl) return;
    
    setIsDownloading(true);
    try {
      const response = await fetch(finalCardUrl);
      if (!response.ok) throw new Error("Network response was not ok");
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      const extMatch = finalCardUrl.match(/\.([^.?]+)(\?.*)?$/);
      const ext = extMatch ? extMatch[1] : "jpg";
      
      link.download = `Invitation_${attendeeName.replace(/\s+/g, "_")}.${ext}`;
      link.href = url;
      link.click();
      
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading image:", error);
      toast.error("Failed to download invitation card");
    } finally {
      setIsDownloading(false);
    }
  };

  if (!finalCardUrl) return null;

  return (
    <Button
      variant="ghost"
      size="sm"
      className="text-primary hover:text-primary-700 hover:bg-primary-50"
      onClick={handleDownload}
      disabled={isDownloading}
    >
      {isDownloading ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <DownloadIcon className="w-4 h-4 mr-2" />
      )}
      Download Invite
    </Button>
  );
};
