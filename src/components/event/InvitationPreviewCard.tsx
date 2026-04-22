import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import InvitationDesigner from "@/components/invitation/InvitationDesigner";
import { InvitationConfig, CardTemplate } from "@/types/invitation";
import { PencilIcon, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editConfig, setEditConfig] = useState<InvitationConfig | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const { data: templates = [], isLoading } = useQuery<CardTemplate[]>({
    queryKey: ["card_templates"],
    queryFn: async () => {
      const { data, error } = await (supabase
        .from("card_templates" as any) as any)
        .select("*");
      if (error) throw error;
      return data as CardTemplate[];
    },
  });

  const selectedTemplate = templates.find(
    (t) => t.id === invitationConfig?.selected_template_id || t.id === invitationConfig?.template_id
  );

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

  if (!invitationConfig || (!invitationConfig.selected_template_id && !invitationConfig.template_id)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Invitation Card</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 mb-4">
            No custom invitation card configured for this event.
          </p>
          {isEditable && onSave && (
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" onClick={() => {
                  setEditConfig({});
                  setIsEditDialogOpen(true);
                }}>
                  <PencilIcon className="w-4 h-4 mr-2" />
                  Select Template
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Select Invitation Card</DialogTitle>
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
                    Change Template
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
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : selectedTemplate ? (
          <div className="bg-gray-50 p-4 sm:p-6 rounded-lg overflow-hidden flex justify-center">
            <div className="bg-gray-100 max-w-sm w-full aspect-[3/4] relative flex items-center justify-center overflow-hidden rounded-md shadow-sm">
              <img
                src={selectedTemplate.image_url}
                alt={selectedTemplate.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 p-8 rounded-lg overflow-hidden flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl text-gray-400">?</span>
            </div>
            <p className="text-gray-500">Selected template not found.</p>
          </div>
        )}

        <div className="pt-4 border-t">
          {selectedTemplate && (
            <p className="font-semibold text-gray-900 mb-1">{selectedTemplate.name}</p>
          )}
          <p className="text-sm text-gray-500">
            Design manually processed by admin after creation.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default InvitationPreviewCard;

