import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import InvitationPreview from "@/components/invitation/InvitationPreview";
import InvitationDesigner from "@/components/invitation/InvitationDesigner";
import { InvitationConfig } from "@/types/invitation";
import { Eye, PencilIcon, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface InvitationPreviewCardProps {
  invitationConfig: InvitationConfig | null;
  eventData: {
    title: string;
    date: string;
    time?: string;
    location: string;
    bride_name?: string;
    groom_name?: string;
    description?: string;
  };
  isEditable?: boolean;
  onSave?: (config: InvitationConfig) => Promise<void>;
}

const InvitationPreviewCard: React.FC<InvitationPreviewCardProps> = ({
  invitationConfig,
  eventData,
  isEditable = false,
  onSave,
}) => {
  const [previewGuestName, setPreviewGuestName] = useState("John Doe");
  const [showPreview, setShowPreview] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editConfig, setEditConfig] = useState<InvitationConfig | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleEditClick = () => {
    setEditConfig(invitationConfig);
    setIsEditDialogOpen(true);
  };

  const handleSave = async () => {
    if (!editConfig || !onSave) return;
    setIsSaving(true);
    try {
      await onSave(editConfig);
      setIsEditDialogOpen(false);
    } finally {
      setIsSaving(false);
    }
  };

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
        <CardTitle className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <span>Invitation Card Preview</span>
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {isEditable && onSave && (
              <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" onClick={handleEditClick}>
                    <PencilIcon className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Edit Invitation Card</DialogTitle>
                  </DialogHeader>
                  <div className="mt-4">
                    {editConfig && (
                      <InvitationDesigner
                        initialConfig={editConfig}
                        eventData={eventData}
                        onConfigChange={setEditConfig}
                      />
                    )}
                  </div>
                  <div className="flex justify-end gap-2 mt-6">
                    <Button
                      variant="outline"
                      onClick={() => setIsEditDialogOpen(false)}
                      disabled={isSaving}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={isSaving}>
                      {isSaving ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
            >
              <Eye className="w-4 h-4 mr-2" />
              {showPreview ? "Hide" : "Show"} Preview
            </Button>
          </div>
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
          <div className="bg-gray-50 p-4 sm:p-6 rounded-lg overflow-x-auto flex justify-center">
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
