import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TemplateSelector } from "./TemplateSelector";
import { InvitationConfig, CardTemplate } from "@/types/invitation";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface InvitationDesignerProps {
  initialConfig?: InvitationConfig;
  eventData: {
    title: string;
    date: string;
    time?: string;
    location: string;
    bride_name?: string;
    groom_name?: string;
    description?: string;
  };
  onConfigChange: (config: InvitationConfig) => void;
}

const InvitationDesigner: React.FC<InvitationDesignerProps> = ({
  initialConfig,
  eventData,
  onConfigChange,
}) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    initialConfig?.selected_template_id || ""
  );

  // Fetch all templates to find the selected one and show its image
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

  const selectedTemplate = templates.find(t => t.id === selectedTemplateId);

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplateId(templateId);
    onConfigChange({
      ...initialConfig,
      selected_template_id: templateId,
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left side - Template Selection */}
        <div className="space-y-6">
          <TemplateSelector
            selectedTemplate={selectedTemplateId}
            onTemplateChange={handleTemplateChange}
          />
        </div>

        {/* Right side - Preview */}
        <div className="lg:sticky lg:top-6 h-fit">
          <Card className="overflow-hidden">
            <CardHeader className="bg-gray-50/50">
              <CardTitle className="text-lg">Live Preview</CardTitle>
              <p className="text-xs text-gray-500">How your card background will look</p>
            </CardHeader>
            <CardContent className="p-0">
              <div className="bg-gray-100 aspect-[3/4] relative flex items-center justify-center overflow-hidden">
                {isLoading ? (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <span className="text-sm text-gray-500">Loading preview...</span>
                  </div>
                ) : selectedTemplate ? (
                  <img
                    src={selectedTemplate.image_url}
                    alt={selectedTemplate.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center p-8">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl text-gray-400">?</span>
                    </div>
                    <p className="text-gray-500 text-sm">Please select a template to see preview</p>
                  </div>
                )}
                
                {selectedTemplate && (
                  <div className="absolute inset-0 pointer-events-none border-4 border-primary/10"></div>
                )}
              </div>
              
              {selectedTemplate && (
                <div className="p-4 border-t bg-white">
                  <h4 className="font-semibold text-gray-900">{selectedTemplate.name}</h4>
                  <p className="text-sm text-gray-500 mt-1">
                    Design manually processed by admin after creation.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default InvitationDesigner;

