
import { createShortUrl } from "@/lib/url-shortener";
import { Loader2, Share2Icon } from "lucide-react";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";

// Create a shareable event component
const ShareEventButton = ({ event }) => {
  const [sharingSharingId, setSharingId] = useState<string | null>(null);

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={sharingSharingId === event.id}
      onClick={async () => {
        try {
          setSharingId(event.id);
          const baseUrl = window.location.origin;
          const eventUrl = `${baseUrl}/response?eventId=${event.id}`;
          
          // Create a short URL
          const shortUrl = await createShortUrl(eventUrl);
          
          // Copy to clipboard
          await navigator.clipboard.writeText(shortUrl);
          toast.success("Short URL copied!");
        } catch (error) {
          console.error("Error sharing event:", error);
          toast.error("Failed to create short URL");
        } finally {
          setSharingId(null);
        }
      }}
    >
      {sharingSharingId === event.id ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <Share2Icon className="w-4 h-4 mr-2" />
      )}
      {sharingSharingId === event.id ? "Creating..." : "Share"}
    </Button>
  );
};

export default ShareEventButton;
