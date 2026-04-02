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
    id: "template1",
    name: "Golden Elegance",
    description: "Elegant golden theme for your special day",
    defaultConfig: {
      template_id: "template1",
      background_image: "/assets/cardback/1.jpeg",
      styling: {
        font_family: "Dancing Script",
        primary_color: "#D4AF37",
        secondary_color: "#B8860B",
        text_color: "#1F2937",
      },
      guest_name_position: "header",
    },
  },
  {
    id: "template2",
    name: "Silver Romance",
    description: "Classic silver and white design",
    defaultConfig: {
      template_id: "template2",
      background_image: "/assets/cardback/2.jpeg",
      styling: {
        font_family: "Dancing Script",
        primary_color: "#9CA3AF",
        secondary_color: "#6B7280",
        text_color: "#1F2937",
      },
      guest_name_position: "header",
    },
  },
  {
    id: "template3",
    name: "Classic Beige",
    description: "Warm beige tones for a cozy feel",
    defaultConfig: {
      template_id: "template3",
      background_image: "/assets/cardback/3.jpeg",
      styling: {
        font_family: "Dancing Script",
        primary_color: "#A0522D",
        secondary_color: "#CD853F",
        text_color: "#1F2937",
      },
      guest_name_position: "header",
    },
  },
  {
    id: "template4",
    name: "Royal Blue",
    description: "Deep blue and gold accents",
    defaultConfig: {
      template_id: "template4",
      background_image: "/assets/cardback/4.jpeg",
      styling: {
        font_family: "Dancing Script",
        primary_color: "#1E3A8A",
        secondary_color: "#3B82F6",
        text_color: "#1F2937",
      },
      guest_name_position: "header",
    },
  },
  {
    id: "template5",
    name: "Floral Blush",
    description: "Soft pink and peach floral background",
    defaultConfig: {
      template_id: "template5",
      background_image: "/assets/cardback/5.jpeg",
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
    id: "template6",
    name: "Vintage Charm",
    description: "A touch of vintage for your celebration",
    defaultConfig: {
      template_id: "template6",
      background_image: "/assets/cardback/6.jpeg",
      styling: {
        font_family: "Dancing Script",
        primary_color: "#4B5563",
        secondary_color: "#9CA3AF",
        text_color: "#111827",
      },
      guest_name_position: "header",
    },
  },
  {
    id: "template7",
    name: "Midnight Stars",
    description: "Deep dark background with subtle texture",
    defaultConfig: {
      template_id: "template7",
      background_image: "/assets/cardback/7.jpeg",
      styling: {
        font_family: "Dancing Script",
        primary_color: "#374151",
        secondary_color: "#4B5563",
        text_color: "#F9FAFB",
      },
      guest_name_position: "header",
    },
  },
  {
    id: "template8",
    name: "Nature's Breath",
    description: "Fresh and organic feel",
    defaultConfig: {
      template_id: "template8",
      background_image: "/assets/cardback/8.jpeg",
      styling: {
        font_family: "Dancing Script",
        primary_color: "#065F46",
        secondary_color: "#10B981",
        text_color: "#1F2937",
      },
      guest_name_position: "header",
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
