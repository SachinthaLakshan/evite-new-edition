import { ThemeLayout } from "@/types/theme";

// Define layout variations for different themes
export const themeLayouts: Record<string, ThemeLayout> = {
  "classic": {
    id: "classic",
    name: "Classic",
    headerStyle: "centered",
    fontFamily: {
      title: "font-script",
      body: "font-sans"
    },
    imageStyle: "rounded-full",
    decorations: ["floral-circle"],
    sectionStyle: "rounded-lg shadow-md",
    animationStyle: "fade",
    layoutType: "vertical",
    containerStyle: "px-4 py-12 max-w-4xl mx-auto space-y-16",
    dividerStyle: "h-10 my-8"
  },
  "circular": {
    id: "circular",
    name: "Circular",
    headerStyle: "centered",
    fontFamily: {
      title: "font-cursive",
      body: "font-sans"
    },
    imageStyle: "rounded-full border-4 border-white/70 shadow-xl",
    decorations: ["circular"],
    sectionStyle: "rounded-full bg-white/80 backdrop-blur-sm shadow-md p-8 flex items-center justify-center",
    animationStyle: "scale",
    layoutType: "circular",
    containerStyle: "px-4 py-12 max-w-4xl mx-auto space-y-20",
    dividerStyle: "h-10 my-10"
  },
  "vertical": {
    id: "vertical",
    name: "Vertical",
    headerStyle: "banner",
    fontFamily: {
      title: "font-sans",
      body: "font-sans"
    },
    imageStyle: "rounded-md shadow-md",
    decorations: ["vertical"],
    sectionStyle: "rounded-full bg-gray-200/95 backdrop-blur-sm shadow-sm p-6 mx-auto",
    animationStyle: "slide",
    layoutType: "vertical",
    containerStyle: "px-4 py-12 max-w-lg mx-auto space-y-12",
    dividerStyle: "h-6 my-6"
  },
  "diagonal": {
    id: "diagonal",
    name: "Diagonal",
    headerStyle: "overlapping",
    fontFamily: {
      title: "font-sans",
      body: "font-serif"
    },
    imageStyle: "rounded-md transform -rotate-2 shadow-lg",
    decorations: ["diagonal"],
    sectionStyle: "rounded-md bg-white/80 backdrop-blur-sm shadow-md p-6 transform rotate-2",
    animationStyle: "slide",
    layoutType: "diagonal",
    containerStyle: "px-4 py-12 max-w-3xl mx-auto space-y-12",
    dividerStyle: "h-8 my-8"
  },
  "stacked": {
    id: "stacked",
    name: "Stacked",
    headerStyle: "simple",
    fontFamily: {
      title: "font-sans font-bold",
      body: "font-sans"
    },
    imageStyle: "rounded-lg shadow-md",
    decorations: ["stacked"],
    sectionStyle: "rounded-lg bg-white/70 backdrop-blur-sm border-l-4 p-6",
    animationStyle: "fade",
    layoutType: "stacked",
    containerStyle: "px-4 py-12 max-w-2xl mx-auto space-y-8",
    dividerStyle: "h-6 my-6"
  },
  "modern": {
    id: "modern",
    name: "Modern",
    headerStyle: "side-by-side",
    fontFamily: {
      title: "font-sans",
      body: "font-sans"
    },
    imageStyle: "rounded-md",
    decorations: ["geometric"],
    sectionStyle: "rounded-sm shadow-lg border-l-4",
    animationStyle: "slide",
    layoutType: "grid",
    containerStyle: "px-4 py-12 max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8",
    dividerStyle: "h-8 my-8"
  },
  "rustic": {
    id: "rustic",
    name: "Rustic",
    headerStyle: "banner",
    fontFamily: {
      title: "font-serif",
      body: "font-serif"
    },
    imageStyle: "rounded-lg border-8 border-double",
    decorations: ["wooden-frame", "leaves"],
    sectionStyle: "border-2 rounded-none",
    animationStyle: "scale",
    layoutType: "vertical",
    containerStyle: "px-4 py-12 max-w-4xl mx-auto space-y-16",
    dividerStyle: "h-10 my-8"
  },
  "elegant": {
    id: "elegant",
    name: "Elegant",
    headerStyle: "overlapping",
    fontFamily: {
      title: "font-script",
      body: "font-serif"
    },
    imageStyle: "rounded-lg shadow-2xl",
    decorations: ["swirls", "ornate-border"],
    sectionStyle: "rounded-xl shadow-soft",
    animationStyle: "fade",
    layoutType: "asymmetric",
    containerStyle: "px-4 py-12 max-w-4xl mx-auto space-y-16",
    dividerStyle: "h-10 my-8"
  },
  "minimalist": {
    id: "minimalist",
    name: "Minimalist",
    headerStyle: "simple",
    fontFamily: {
      title: "font-sans",
      body: "font-sans"
    },
    imageStyle: "rounded-sm",
    decorations: [],
    sectionStyle: "border-b-2",
    animationStyle: "none",
    layoutType: "vertical",
    containerStyle: "px-4 py-12 max-w-3xl mx-auto space-y-12",
    dividerStyle: "h-6 my-6"
  },
};

export const getThemeLayout = (themeId: string): ThemeLayout => {
  // Default to classic if theme not found
  return themeLayouts[themeId] || themeLayouts.classic;
};
