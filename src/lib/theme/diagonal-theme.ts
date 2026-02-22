
import { ThemeColor } from "@/types/theme";

export const diagonalGreyTheme: ThemeColor = {
  primary: "#333333",
  secondary: "#666666",
  accent: "#888888",
  textPrimary: "#222222",
  textSecondary: "#555555",
  background: "#F1F1F1",
  buttonGradient: "linear-gradient(to right, #666666, #888888)",
  buttonHoverColor: "#555555",
  gradientBackground: "linear-gradient(135deg, #F1F1F1, #E5E5E5)",
  layout: {
    id: "diagonal",
    name: "Diagonal",
    headerStyle: "banner" as const,
    fontFamily: {
      title: "font-sans",
      body: "font-sans"
    },
    imageStyle: "rounded-lg shadow-xl transform -rotate-2",
    decorations: ["diagonal"],
    sectionStyle: "bg-white/95 backdrop-blur-sm p-8 mx-auto transform rotate-2 rounded-lg shadow-md border-l-4 border-gray-300",
    animationStyle: "slide",
    layoutType: "diagonal",
    containerStyle: "px-6 py-0 max-w-xl mx-auto space-y-14",
    dividerStyle: "h-10 my-10"
  }
};
