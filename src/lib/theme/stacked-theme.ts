
import { ThemeColor } from "@/types/theme";

export const stackedGreyTheme: ThemeColor = {
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
    id: "stacked",
    name: "Stacked",
    headerStyle: "banner" as const,
    fontFamily: {
      title: "font-sans",
      body: "font-sans"
    },
    imageStyle: "rounded-xl shadow-xl",
    decorations: ["stacked"],
    sectionStyle: "bg-white/95 backdrop-blur-sm p-8 mx-auto rounded-xl shadow-md border-l-4 border-gray-300",
    animationStyle: "fade",
    layoutType: "stacked",
    containerStyle: "px-6 py-0 max-w-xl mx-auto space-y-10",
    dividerStyle: "h-8 my-8"
  }
};
