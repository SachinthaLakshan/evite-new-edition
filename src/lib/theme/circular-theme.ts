
import { ThemeColor } from "@/types/theme";

export const circularGreyTheme: ThemeColor = {
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
    id: "circular",
    name: "Circular",
    headerStyle: "banner" as const,
    fontFamily: {
      title: "font-sans",
      body: "font-sans"
    },
    imageStyle: "rounded-full shadow-2xl border-8 border-white/80",
    decorations: ["circular"],
    sectionStyle: "bg-white/95 backdrop-blur-sm p-8 mx-auto rounded-full shadow-lg",
    animationStyle: "scale",
    layoutType: "circular",
    containerStyle: "px-6 py-0 max-w-xl mx-auto space-y-16",
    dividerStyle: "h-12 my-12"
  }
};
