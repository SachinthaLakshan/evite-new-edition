// Helper function to lighten a color
export function lightenColor(color: string, percent: number) {
  // Remove the # if it exists
  let hex = color.replace('#', '');
  
  // Convert to RGB
  let r = parseInt(hex.substring(0, 2), 16);
  let g = parseInt(hex.substring(2, 4), 16);
  let b = parseInt(hex.substring(4, 6), 16);
  
  // Lighten
  r = Math.min(255, Math.round(r + (255 - r) * (percent / 100)));
  g = Math.min(255, Math.round(g + (255 - g) * (percent / 100)));
  b = Math.min(255, Math.round(b + (255 - b) * (percent / 100)));
  
  // Convert back to hex
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

// Theme color configurations
export const getThemeColorStyles = (themeId: string) => {
  let theme;
  
  switch (themeId) {
    case "romantic":
      theme = {
        primary: "#FF6B8A",
        secondary: "#FF8E6E", 
        accent: "#FFC2E2",
        textPrimary: "#4A3B3B",
        textSecondary: "#6D5D5D",
        background: "#FFF9F9",
        buttonGradient: "linear-gradient(to right, #FF6B8A, #FF8E6E)",
        buttonHoverColor: "#FF5277",
        gradientBackground: "linear-gradient(135deg, #FFF0F3, #FFD9DF)",
      };
      break;
    case "elegant":
      theme = {
        primary: "#9570DB",
        secondary: "#B191E4",
        accent: "#D6BCFA",
        textPrimary: "#1A1F2C",
        textSecondary: "#4A5568",
        background: "#F9F7FF",
        buttonGradient: "linear-gradient(to right, #9570DB, #B191E4)",
        buttonHoverColor: "#7C53D0",
        gradientBackground: "linear-gradient(135deg, #F3F0FF, #E9DCFF)",
      };
      break;
    case "vertical":
      theme = {
        primary: "#333333",
        secondary: "#666666", 
        accent: "#888888",
        textPrimary: "#222222",
        textSecondary: "#555555",
        background: "#F1F1F1",
        buttonGradient: "linear-gradient(to right, #666666, #888888)",
        buttonHoverColor: "#555555",
        gradientBackground: "linear-gradient(135deg, #F1F1F1, #E5E5E5)",
      };
      break;
    default:
      theme = {
        primary: "#4F46E5",
        secondary: "#818CF8",
        accent: "#C7D2FE",
        textPrimary: "#1F2937",
        textSecondary: "#4B5563",
        background: "#F5F7FF",
        buttonGradient: "linear-gradient(to right, #4F46E5, #818CF8)",
        buttonHoverColor: "#4338CA",
        gradientBackground: "linear-gradient(135deg, #EEF2FF, #E0E7FF)",
      };
  }
  
  return theme;
};
