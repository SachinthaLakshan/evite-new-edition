import React from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Check } from "lucide-react";
import { InvitationTemplate } from "@/types/invitation";

interface TemplateSelectorProps {
  selectedTemplate: string;
  onTemplateChange: (templateId: string) => void;
}

const INVITATION_TEMPLATES: InvitationTemplate[] = [
  {
    id: "classic",
    name: "Classic Elegance",
    description: "Traditional design with elegant borders and centered layout",
    defaultConfig: {
      template_id: "classic",
      styling: {
        font_family: "Playfair Display",
        primary_color: "#8B5CF6",
        secondary_color: "#D946EF",
        text_color: "#1F2937",
      },
      guest_name_position: "top",
    },
  },
  {
    id: "modern",
    name: "Modern Minimalist",
    description: "Clean lines with contemporary typography and geometric accents",
    defaultConfig: {
      template_id: "modern",
      styling: {
        font_family: "Montserrat",
        primary_color: "#3B82F6",
        secondary_color: "#8B5CF6",
        text_color: "#374151",
      },
      guest_name_position: "top",
    },
  },
  {
    id: "floral",
    name: "Floral Romance",
    description: "Romantic design with floral decorations and soft colors",
    defaultConfig: {
      template_id: "floral",
      styling: {
        font_family: "Dancing Script",
        primary_color: "#EC4899",
        secondary_color: "#F472B6",
        text_color: "#1F2937",
      },
      guest_name_position: "header",
    },
  },
  {
    id: "minimal",
    name: "Minimal Chic",
    description: "Ultra-minimal design with focus on typography",
    defaultConfig: {
      template_id: "minimal",
      styling: {
        font_family: "Lora",
        primary_color: "#111827",
        secondary_color: "#6B7280",
        text_color: "#374151",
      },
      guest_name_position: "top",
    },
  },
];

const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  selectedTemplate,
  onTemplateChange,
}) => {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium mb-2">Select Invitation Template</h3>
        <p className="text-sm text-gray-500 mb-4">
          Choose a design template for your invitation card
        </p>
      </div>

      <RadioGroup
        value={selectedTemplate}
        onValueChange={onTemplateChange}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        {INVITATION_TEMPLATES.map((template) => (
          <Label
            key={template.id}
            htmlFor={template.id}
            className="cursor-pointer"
          >
            <Card
              className={`
                relative overflow-hidden border-2 transition-all duration-200 p-4
                ${
                  selectedTemplate === template.id
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-transparent hover:border-gray-200"
                }
              `}
            >
              {selectedTemplate === template.id && (
                <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                  <Check className="h-4 w-4" />
                </div>
              )}

              <RadioGroupItem
                value={template.id}
                id={template.id}
                className="sr-only"
              />

              <div className="space-y-2">
                <div className="font-medium text-base">{template.name}</div>
                <p className="text-xs text-gray-500">{template.description}</p>
              </div>
            </Card>
          </Label>
        ))}
      </RadioGroup>
    </div>
  );
};

export { TemplateSelector, INVITATION_TEMPLATES };
