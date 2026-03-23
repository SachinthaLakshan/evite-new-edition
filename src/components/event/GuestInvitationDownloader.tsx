"use client";

import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { DownloadIcon, Loader2 } from "lucide-react";
import { toJpeg } from "html-to-image";
import InvitationPreview from "@/components/invitation/InvitationPreview";
import { InvitationConfig } from "@/types/invitation";

interface GuestInvitationDownloaderProps {
  attendeeName: string;
  config: InvitationConfig;
  eventData: any;
}

export const GuestInvitationDownloader: React.FC<GuestInvitationDownloaderProps> = ({
  attendeeName,
  config,
  eventData,
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    setIsDownloading(true);
    
    // Give React a moment to render the off-screen container and load any remote fonts/images.
    // We wait 1500ms because Framer Motion animations on the templates have staggered delays up to 0.8s.
    setTimeout(async () => {
      if (!containerRef.current) {
        setIsDownloading(false);
        return;
      }
      
      try {
        const dataUrl = await toJpeg(containerRef.current, {
          quality: 1,
          pixelRatio: 2, // High resolution for 300DPI-like print scaling
          style: {
            margin: '0', 
          }
        });

        const link = document.createElement("a");
        link.download = `Invitation_${attendeeName.replace(/\s+/g, "_")}.jpg`;
        link.href = dataUrl;
        link.click();
      } catch (error) {
        console.error("Error generating image:", error);
      } finally {
        setIsDownloading(false);
      }
    }, 1500); // Increased delay to ensure animations finish completely
  };

  return (
    <>
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

      {isDownloading && (
        <div 
          className="fixed top-[-10000px] left-[-10000px] pointer-events-none w-[672px]" 
          style={{ width: "672px" }}
        >
          <div ref={containerRef} className="bg-white">
            <InvitationPreview
              config={config}
              guestName={attendeeName}
              eventData={eventData}
              editable={false}
            />
          </div>
        </div>
      )}
    </>
  );
};
