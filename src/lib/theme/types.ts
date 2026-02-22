
import { ThemeLayout } from "@/types/theme";

export interface Theme {
  id: string;
  name: string;
  description: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor?: string;
  textColor?: string;
  previewImage?: string;
}

export interface ThemeColor {
  primary: string;
  secondary: string;
  accent?: string;
  textPrimary: string;
  textSecondary: string;
  background: string;
  buttonGradient: string;
  buttonHoverColor: string;
  gradientBackground: string;
  layout?: ThemeLayout;
  colors?: {
    primary: Record<string, string>;
    secondary: Record<string, string>;
    accent?: Record<string, string>;
  };
}
