import React from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Check, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CardTemplate } from "@/types/invitation";

interface TemplateSelectorProps {
  selectedTemplate: string;
  onTemplateChange: (templateId: string) => void;
}

const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  selectedTemplate,
  onTemplateChange,
}) => {
  const { data: templates = [], isLoading } = useQuery<CardTemplate[]>({
    queryKey: ["card_templates"],
    queryFn: async () => {
      const { data, error } = await (supabase
        .from("card_templates" as any) as any)
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as CardTemplate[];
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2">Loading templates...</span>
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <div className="text-center p-12 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No templates available. Please ask admin to add templates.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium mb-2">Select Invitation Template</h3>
        <p className="text-sm text-gray-500 mb-4">
          Choose a design template for your invitation card. Admin will design your final card manually based on this template.
        </p>
      </div>

      <RadioGroup
        value={selectedTemplate}
        onValueChange={onTemplateChange}
        className="grid grid-cols-2 md:grid-cols-3 gap-4"
      >
        {templates.map((template) => (
          <Label
            key={template.id}
            htmlFor={template.id}
            className="cursor-pointer group"
          >
            <Card
              className={`
                relative overflow-hidden border-2 transition-all duration-200 aspect-[3/4]
                ${
                  selectedTemplate === template.id
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-transparent hover:border-gray-200 shadow-sm hover:shadow-md"
                }
              `}
            >
              <img 
                src={template.image_url} 
                alt={template.name}
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
              />
              
              <div className="absolute inset-x-0 bottom-0 bg-black/60 p-2 text-white transform translate-y-full group-hover:translate-y-0 transition-transform">
                <p className="text-xs font-medium truncate">{template.name}</p>
              </div>

              {selectedTemplate === template.id && (
                <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1 shadow-lg">
                  <Check className="h-4 w-4" />
                </div>
              )}

              <RadioGroupItem
                value={template.id}
                id={template.id}
                className="sr-only"
              />
            </Card>
          </Label>
        ))}
      </RadioGroup>
    </div>
  );
};

export { TemplateSelector };

