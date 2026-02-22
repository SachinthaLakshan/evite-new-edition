import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TemplateSelector, INVITATION_TEMPLATES } from "./TemplateSelector";
import InvitationPreview from "./InvitationPreview";
import {
  InvitationConfig,
  AVAILABLE_FONTS,
  GUEST_NAME_POSITIONS,
} from "@/types/invitation";

interface InvitationDesignerProps {
  initialConfig?: InvitationConfig;
  eventData: {
    title: string;
    date: string;
    location: string;
  };
  onConfigChange: (config: InvitationConfig) => void;
}

const InvitationDesigner: React.FC<InvitationDesignerProps> = ({
  initialConfig,
  eventData,
  onConfigChange,
}) => {
  const [config, setConfig] = useState<InvitationConfig>(
    initialConfig || {
      template_id: "classic",
      couple_names: {
        person1: "",
        person2: "",
      },
      custom_text: {
        main_message: "Together with their families",
        additional_info: "Reception to follow",
      },
      text_positions: {
        couple_names: { x: 50, y: 30 },
        venue: { x: 50, y: 60 },
        date: { x: 50, y: 70 },
        guest_name: { x: 50, y: 10 },
      },
      styling: {
        font_family: "Playfair Display",
        primary_color: "#8B5CF6",
        secondary_color: "#D946EF",
        text_color: "#1F2937",
      },
      guest_name_position: "top",
    },
  );

  const [previewGuestName, setPreviewGuestName] = useState("John Doe");

  const handlePositionChange = (
    key: keyof InvitationConfig["text_positions"],
    position: { x: number; y: number },
  ) => {
    setConfig((prev) => ({
      ...prev,
      text_positions: {
        ...prev.text_positions,
        [key]: position,
      },
    }));
  };

  const getDefaultPositions = () => {
    const template = INVITATION_TEMPLATES.find(
      (t) => t.id === config.template_id,
    );
    if (template?.defaultConfig?.text_positions) {
      return template.defaultConfig.text_positions;
    }
    return {
      couple_names: { x: 50, y: 30 },
      venue: { x: 50, y: 60 },
      date: { x: 50, y: 70 },
      guest_name: { x: 50, y: 10 },
    };
  };

  useEffect(() => {
    onConfigChange(config);
  }, [config, onConfigChange]);

  const handleTemplateChange = (templateId: string) => {
    const template = INVITATION_TEMPLATES.find((t) => t.id === templateId);
    if (template && template.defaultConfig) {
      setConfig((prev) => ({
        ...prev,
        template_id: templateId,
        styling: template.defaultConfig.styling || prev.styling,
        guest_name_position:
          template.defaultConfig.guest_name_position ||
          prev.guest_name_position,
      }));
    }
  };

  const updateConfig = (path: string, value: any) => {
    setConfig((prev) => {
      const keys = path.split(".");
      const newConfig = { ...prev };
      let current: any = newConfig;

      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }

      current[keys[keys.length - 1]] = value;
      return newConfig;
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left side - Controls */}
        <div className="space-y-6">
          {/* Template Selection */}
          <TemplateSelector
            selectedTemplate={config.template_id}
            onTemplateChange={handleTemplateChange}
          />

          {/* Couple Names */}
          <Card>
            <CardHeader>
              <CardTitle>Names</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="person1">First Person Name</Label>
                <Input
                  id="person1"
                  placeholder="e.g., John"
                  value={config.couple_names.person1}
                  onChange={(e) =>
                    updateConfig("couple_names.person1", e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="person2">Second Person Name</Label>
                <Input
                  id="person2"
                  placeholder="e.g., Jane"
                  value={config.couple_names.person2}
                  onChange={(e) =>
                    updateConfig("couple_names.person2", e.target.value)
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Custom Text */}
          <Card>
            <CardHeader>
              <CardTitle>Custom Messages</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="main_message">Main Message</Label>
                <Textarea
                  id="main_message"
                  placeholder="e.g., Together with their families"
                  value={config.custom_text.main_message}
                  onChange={(e) =>
                    updateConfig("custom_text.main_message", e.target.value)
                  }
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="additional_info">Additional Information</Label>
                <Textarea
                  id="additional_info"
                  placeholder="e.g., Reception to follow"
                  value={config.custom_text.additional_info}
                  onChange={(e) =>
                    updateConfig("custom_text.additional_info", e.target.value)
                  }
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Styling */}
          <Card>
            <CardHeader>
              <CardTitle>Styling</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="font_family">Font Family</Label>
                <Select
                  value={config.styling.font_family}
                  onValueChange={(value) =>
                    updateConfig("styling.font_family", value)
                  }
                >
                  <SelectTrigger id="font_family">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AVAILABLE_FONTS.map((font) => (
                      <SelectItem key={font} value={font}>
                        <span style={{ fontFamily: font }}>{font}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="primary_color">Primary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="primary_color"
                      type="color"
                      value={config.styling.primary_color}
                      onChange={(e) =>
                        updateConfig("styling.primary_color", e.target.value)
                      }
                      className="w-16 h-10"
                    />
                    <Input
                      type="text"
                      value={config.styling.primary_color}
                      onChange={(e) =>
                        updateConfig("styling.primary_color", e.target.value)
                      }
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="secondary_color">Secondary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="secondary_color"
                      type="color"
                      value={config.styling.secondary_color}
                      onChange={(e) =>
                        updateConfig("styling.secondary_color", e.target.value)
                      }
                      className="w-16 h-10"
                    />
                    <Input
                      type="text"
                      value={config.styling.secondary_color}
                      onChange={(e) =>
                        updateConfig("styling.secondary_color", e.target.value)
                      }
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="text_color">Text Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="text_color"
                    type="color"
                    value={config.styling.text_color}
                    onChange={(e) =>
                      updateConfig("styling.text_color", e.target.value)
                    }
                    className="w-16 h-10"
                  />
                  <Input
                    type="text"
                    value={config.styling.text_color}
                    onChange={(e) =>
                      updateConfig("styling.text_color", e.target.value)
                    }
                    className="flex-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Guest Name Position */}
          <Card>
            <CardHeader>
              <CardTitle>Guest Name Position</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="guest_name_position">
                  Where should guest names appear?
                </Label>
                <Select
                  value={config.guest_name_position}
                  onValueChange={(value: any) =>
                    updateConfig("guest_name_position", value)
                  }
                >
                  <SelectTrigger id="guest_name_position">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {GUEST_NAME_POSITIONS.map((position) => (
                      <SelectItem key={position.value} value={position.value}>
                        {position.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="preview_guest_name">
                  Preview Guest Name (for testing)
                </Label>
                <Input
                  id="preview_guest_name"
                  placeholder="Enter a name to preview"
                  value={previewGuestName}
                  onChange={(e) => setPreviewGuestName(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right side - Preview */}
        <div className="lg:sticky lg:top-6 h-fit">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-4">
                <CardTitle>Live Preview</CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setConfig((prev) => ({
                      ...prev,
                      text_positions: getDefaultPositions(),
                    }))
                  }
                >
                  Reset positions
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-6 rounded-lg">
                <InvitationPreview
                  config={config}
                  guestName={previewGuestName}
                  eventData={eventData}
                  editable
                  onPositionChange={handlePositionChange}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default InvitationDesigner;
