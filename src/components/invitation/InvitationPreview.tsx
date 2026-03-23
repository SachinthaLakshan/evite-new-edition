import React from "react";
import { InvitationConfig } from "@/types/invitation";
import ClassicTemplate from "./templates/ClassicTemplate";
import ModernTemplate from "./templates/ModernTemplate";
import FloralTemplate from "./templates/FloralTemplate";
import MinimalTemplate from "./templates/MinimalTemplate";

interface InvitationPreviewProps {
  config: InvitationConfig;
  guestName?: string;
  eventData: {
    title: string;
    date: string;
    time?: string;
    location: string;
    bride_name?: string;
    groom_name?: string;
    description?: string;
  };
  editable?: boolean;
  onPositionChange?: (
    key: keyof InvitationConfig["text_positions"],
    position: { x: number; y: number },
  ) => void;
}

const InvitationPreview: React.FC<InvitationPreviewProps> = ({
  config,
  guestName,
  eventData,
  editable = false,
  onPositionChange,
}) => {
  const renderTemplate = () => {
    const props = {
      config,
      guestName,
      eventData,
    } as const;

    switch (config.template_id) {
      case "classic":
        return <ClassicTemplate {...props} />;
      case "modern":
        return <ModernTemplate {...props} />;
      case "floral":
        return <FloralTemplate {...props} />;
      case "minimal":
        return <MinimalTemplate {...props} />;
      default:
        // Automatically default to floral if we want, or keep classic
        return <ClassicTemplate {...props} />;
    }
  };

  return (
    <div className="relative w-full">
      <div className={editable ? "pointer-events-none select-none" : ""}>
        {renderTemplate()}
      </div>
    </div>
  );
};

export default InvitationPreview;
