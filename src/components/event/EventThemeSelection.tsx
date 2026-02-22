
import React from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";
import { themeLayouts } from "@/lib/theme/layouts";
import { Theme as ThemeType } from "@/lib/theme/types";

export type Theme = {
  id: string;
  name: string;
  description: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor?: string;
  textColor?: string;
  previewImage?: string;
};

// Create a new array based on the theme layouts
export const availableThemes: Theme[] = [
  {
    id: "vertical",
    name: "Vertical Layout",
    description: "Clean vertical layout with elegant spacing",
    primaryColor: "#9b87f5",
    secondaryColor: "#7E69AB",
    previewImage: "/assets/themes/vertical.jpg",
  },
  {
    id: "circular",
    name: "Circular Layout",
    description: "Curved elements with rounded aesthetic",
    primaryColor: "#FEC6A1",
    secondaryColor: "#FEF7CD",
    previewImage: "/assets/themes/circular.jpg",
  },
  {
    id: "diagonal",
    name: "Diagonal Layout",
    description: "Dynamic layout with angled elements",
    primaryColor: "#8B5CF6",
    secondaryColor: "#D946EF",
    previewImage: "/assets/themes/diagonal.jpg",
  },
  {
    id: "stacked",
    name: "Stacked Layout",
    description: "Modern layout with layered elements",
    primaryColor: "#1EAEDB",
    secondaryColor: "#33C3F0",
    previewImage: "/assets/themes/stacked.jpg",
  }
];

interface EventThemeSelectionProps {
  selectedTheme: string;
  onThemeChange: (themeId: string) => void;
}

const EventThemeSelection: React.FC<EventThemeSelectionProps> = ({
  selectedTheme,
  onThemeChange,
}) => {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium mb-2">Select Invitation Layout</h3>
        <p className="text-sm text-gray-500 mb-4">
          Choose a layout design for your event invitation
        </p>
      </div>
      
      <RadioGroup
        value={selectedTheme}
        onValueChange={onThemeChange}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4"
      >
        {availableThemes.map((theme) => (
          <Label
            key={theme.id}
            htmlFor={theme.id}
            className="cursor-pointer"
          >
            <Card className={`
              relative overflow-hidden border-2 transition-all duration-200
              ${selectedTheme === theme.id ? 'border-primary ring-2 ring-primary/20' : 'border-transparent hover:border-gray-200'}
            `}>
              <div className="relative aspect-[4/3]">
                {theme.previewImage ? (
                  <img 
                    src={theme.previewImage} 
                    alt={theme.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div 
                    className="w-full h-full flex items-center justify-center"
                    style={{
                      background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor})`
                    }}
                  >
                    <span className="text-white font-medium text-lg">{theme.name}</span>
                  </div>
                )}
                
                {selectedTheme === theme.id && (
                  <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                    <Check className="h-4 w-4" />
                  </div>
                )}
              </div>
              
              <div className="p-3">
                <RadioGroupItem
                  value={theme.id}
                  id={theme.id}
                  className="sr-only"
                />
                <div className="font-medium">{theme.name}</div>
                <p className="text-xs text-gray-500 mt-1">{theme.description}</p>
              </div>
            </Card>
          </Label>
        ))}
      </RadioGroup>
    </div>
  );
};

export default EventThemeSelection;
