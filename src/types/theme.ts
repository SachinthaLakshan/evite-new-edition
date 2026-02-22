
export interface ThemeLayout {
  id: string;
  name: string;
  headerStyle: "centered" | "side-by-side" | "banner" | "overlapping" | "simple";
  fontFamily: {
    title: string;
    body: string;
  };
  imageStyle: string;
  decorations: string[];
  sectionStyle: string;
  animationStyle: "fade" | "slide" | "scale" | "none";
  layoutType: "vertical" | "grid" | "asymmetric" | "circular" | "diagonal" | "stacked";
  containerStyle: string;
  dividerStyle: string;
}

// Add ThemeColor export
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

// Add this for backward compatibility
export interface ThemeConfig {
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
