import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import InvitationPreview from "@/components/invitation/InvitationPreview";
import { InvitationConfig } from "@/types/invitation";
import { Eye } from "lucide-react";

interface InvitationPreviewCardProps {
  invitationConfig: InvitationConfig | null;
  eventData: {
    title: string;
    date: string;
    location: string;
  };
}

const InvitationPreviewCard: React.FC<InvitationPreviewCardProps> = ({
  invitationConfig,
  eventData,
}) => {
  const [previewGuestName, setPreviewGuestName] = useState("John Doe");
  const [showPreview, setShowPreview] = useState(false);

  if (!invitationConfig) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Invitation Card</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">
            No custom invitation card configured for this event.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Invitation Card Preview</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
          >
            <Eye className="w-4 h-4 mr-2" />
            {showPreview ? "Hide" : "Show"} Preview
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="preview-guest">Preview with Guest Name</Label>
          <Input
            id="preview-guest"
            placeholder="Enter a guest name"
            value={previewGuestName}
            onChange={(e) => setPreviewGuestName(e.target.value)}
          />
        </div>

        {showPreview && (
          <div className="bg-gray-50 p-6 rounded-lg">
            <InvitationPreview
              config={invitationConfig}
              guestName={previewGuestName}
              eventData={eventData}
            />
          </div>
        )}

        <div className="pt-4 border-t">
          <p className="text-sm text-gray-600">
            <strong>Template:</strong> {invitationConfig.template_id}
          </p>
          <p className="text-sm text-gray-600">
            <strong>Guest Name Position:</strong>{" "}
            {invitationConfig.guest_name_position}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default InvitationPreviewCard;
