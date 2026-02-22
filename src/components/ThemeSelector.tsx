
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { getThemeStyles } from '@/lib/theme-utils';

const themeOptions = [
  { id: "classic", name: "Classic" },
  { id: "modern", name: "Modern" },
  { id: "rustic", name: "Rustic" },
  { id: "elegant", name: "Elegant" },
  { id: "minimalist", name: "Minimalist" },
  // Add other themes
];

interface ThemeSelectorProps {
  selectedTheme: string;
  onChange: (themeId: string) => void;
}

const ThemeSelector: React.FC<ThemeSelectorProps> = ({ selectedTheme, onChange }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Theme Style</h3>
      <RadioGroup value={selectedTheme} onValueChange={onChange} className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {themeOptions.map((theme) => {
          const themeStyle = getThemeById(theme.id);
          
          return (
            <div key={theme.id} className="relative">
              <RadioGroupItem
                value={theme.id}
                id={`theme-${theme.id}`}
                className="peer sr-only"
              />
              <Label
                htmlFor={`theme-${theme.id}`}
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
              >
                <div
                  className="w-full h-16 rounded-md mb-2"
                  style={{ 
                    background: `linear-gradient(135deg, ${themeStyle.primaryColor}, ${themeStyle.secondaryColor})`
                  }}
                ></div>
                <span>{theme.name}</span>
              </Label>
            </div>
          );
        })}
      </RadioGroup>
    </div>
  );
};

// Add this function to handle theme style retrieval
function getThemeById(themeId: string) {
  // Import directly from EventThemeSelection to avoid circular dependencies
  const { availableThemes } = require('@/components/event/EventThemeSelection');
  return availableThemes.find(theme => theme.id === themeId) || availableThemes[0];
}

export default ThemeSelector;
