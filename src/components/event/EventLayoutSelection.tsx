import React from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Check, Sparkles, Layout } from "lucide-react";

export type LayoutOption = {
  id: string;
  name: string;
  description: string;
  bgImage: string;
};

export const layoutOptions: LayoutOption[] = [
  {
    id: "classic",
    name: "Classic Design",
    description: "Elegant, traditional full wedding invitation layout with countdown, maps, and music",
    bgImage: "/assets/classic-design.png",
  },
  {
    id: "lavender",
    name: "Lavender Design",
    description: "Modern, clean layout with beautiful soft violet tones, calendar info, and countdown",
    bgImage: "/assets/invite-lavendra.png",
  },
  {
    id: "sage",
    name: "Sage Design",
    description: "Elegant layout with fresh green tones, organic shapes, and classic floral motifs",
    bgImage: "/assets/invite-sage.png",
  },
  {
    id: "redrose",
    name: "Red Rose Design",
    description: "Romantic layout with deep crimson roses, warm champagne details, and gold accents",
    bgImage: "/assets/invite-redrose.png",
  },
  {
    id: "redroseclassic",
    name: "Red Rose Classic",
    description: "Romantic layout with red rose details, matching flower ring, and traditional classic elements",
    bgImage: "/assets/invite-redrose.png",
  },
];

interface EventLayoutSelectionProps {
  selectedLayout: string;
  onLayoutChange: (layoutId: string) => void;
}

const EventLayoutSelection: React.FC<EventLayoutSelectionProps> = ({
  selectedLayout,
  onLayoutChange,
}) => {
  // Normalize layout selection for backward compatibility
  const activeLayout = selectedLayout === "lavender" || selectedLayout === "sage" || selectedLayout === "redrose" || selectedLayout === "redroseclassic" ? selectedLayout : "classic";

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium mb-1 flex items-center gap-2 text-purple-950">
          <Layout className="w-5 h-5 text-purple-600" />
          Select Web Invite Layout
        </h3>
        <p className="text-sm text-gray-500">
          Choose the design layout style for your guest RSVP response page.
        </p>
      </div>

      <RadioGroup
        value={activeLayout}
        onValueChange={onLayoutChange}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        {layoutOptions.map((layout) => (
          <Label
            key={layout.id}
            htmlFor={`layout-${layout.id}`}
            className="cursor-pointer block"
          >
            <Card
              className={`
                relative overflow-hidden border-2 p-5 transition-all duration-200 hover:shadow-md h-full flex flex-col justify-between
                ${
                  activeLayout === layout.id
                    ? "border-[#7C3AED] ring-2 ring-purple-100 bg-purple-50/10"
                    : "border-gray-100 hover:border-gray-200"
                }
              `}
            >
              <div className="space-y-4">
                {/* Visual Preview block with full image view */}
                <div className="w-full h-64 rounded-lg overflow-hidden border border-purple-100 bg-[#F9F5FF] flex items-center justify-center shadow-inner">
                  <img 
                    src={layout.bgImage}
                    alt={layout.name}
                    className="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-200"
                  />
                </div>

                <div className="space-y-1">
                  <div className="font-semibold text-[#4C1D95] text-base">{layout.name}</div>
                  <p className="text-xs text-gray-500 leading-relaxed">{layout.description}</p>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4 border-t border-gray-50 pt-3">
                <span className="text-xs font-semibold text-[#7C3AED]">
                  {layout.id === "lavender" || layout.id === "sage" || layout.id === "redrose" || layout.id === "redroseclassic" ? "New Option" : "Classic / Standard"}
                </span>

                <RadioGroupItem
                  value={layout.id}
                  id={`layout-${layout.id}`}
                  className="sr-only"
                />

                {activeLayout === layout.id && (
                  <div className="bg-[#7C3AED] text-white rounded-full p-0.5 shadow-sm">
                    <Check className="h-4 w-4" />
                  </div>
                )}
              </div>
            </Card>
          </Label>
        ))}
      </RadioGroup>
    </div>
  );
};

export default EventLayoutSelection;
