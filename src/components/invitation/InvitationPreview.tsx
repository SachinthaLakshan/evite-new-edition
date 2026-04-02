import React from "react";
import { InvitationConfig } from "@/types/invitation";
import BaseTemplate from "./templates/BaseTemplate";

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
  return (
    <div className="relative w-full">
      <div className={editable ? "pointer-events-none select-none" : ""}>
        <BaseTemplate 
          config={config}
          guestName={guestName}
          eventData={eventData}
        />
      </div>
    </div>
  );
};

export default InvitationPreview;
