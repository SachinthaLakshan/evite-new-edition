
import { ThemeColor, ThemeLayout } from "@/types/theme";
import { getThemeLayout } from "@/lib/theme/layouts";
import { verticalGreyTheme } from "@/lib/theme/vertical-theme";
import { circularGreyTheme } from "@/lib/theme/circular-theme";
import { diagonalGreyTheme } from "@/lib/theme/diagonal-theme";
import { stackedGreyTheme } from "@/lib/theme/stacked-theme";

// Get theme styles based on theme ID
export const getThemeStyles = (themeId: string): ThemeColor => {
  switch (themeId) {
    case "circular":
      return circularGreyTheme;
    case "diagonal":
      return diagonalGreyTheme;
    case "stacked":
      return stackedGreyTheme;
    case "vertical":
    default:
      return verticalGreyTheme;
  }
};

// Update component styles based on theme
export const getComponentStyles = (theme: ThemeColor) => {
  return {
    primaryButton: `bg-[${theme.primary}] hover:bg-[${theme.buttonHoverColor}] text-white`,
    secondaryButton: `bg-[${theme.secondary}] hover:bg-[${theme.buttonHoverColor}] text-white`,
    heading: `text-[${theme.textPrimary}] font-semibold`,
    subheading: `text-[${theme.textSecondary}]`,
    card: `bg-white shadow-md rounded-lg p-6`,
    gradientBackground: theme.gradientBackground,
  };
};

// Get theme color styles
export const getThemeColorStyles = (themeId: string): ThemeColor => {
  return getThemeStyles(themeId);
};

// Re-export the getThemeLayout function from layouts.ts
export { getThemeLayout } from "@/lib/theme/layouts";
