export const Colors = {
  primary: {
    100:  "#1B1C1C",
    200: "#303031",
    300: "#464747",
    400: "#5E5E5E",
    500: "#777777",
    600: "#919090",
    700: "#ACABAB",
    800: "#C7C6C6",
    900: "#E4E2E2",
    1000: "#F2F0F0",
  },
  secondary: {
    100:  "#1A1C1C",
    200: "#2F3131",
    300: "#464747",
    400: "#5E5E5F",
    500: "#777777",
    600: "#909191",
    700: "#ACABAB",
    800: "#C7C6C6",
    900: "#E3E2E2",
    1000: "#F1F0F0",
  },

  button: {
    primary: "#545454", secondary: "#EBE7E7",
  },

  success: { bg: "#d1fae5", text: "#065f46", border: "#34d399" },
  warning: { bg: "#fef3c7", text: "#92400e", border: "#fbbf24" },
  danger:  { bg: "#fee2e2", text: "#991b1b", border: "#f87171" },
  info:    { bg: "#dbeafe", text: "#1e40af", border: "#60a5fa" },

  background: "#EFEFEF",
  surface:    "#FFFFFF", 
  textPrimary:   "#1C1B1B", 
  textSecondary: "#5B5C5D", 
  border:        "#C4C7C7",
  white:         "#ffffff",
  black:         "#000000",
};

export const Typography = {
  fontSize: {
    xs:   10, sm: 12, base: 14, md: 16,
    lg: 18, xl: 22, "2xl": 28, "3xl": 36,
  },
  fontWeight: {
    regular: "400" as const,
    medium:  "500" as const,
    semibold:"600" as const,
    bold:    "700" as const,
    black:   "900" as const,
  },
  lineHeight: { tight: 1.2, normal: 1.5, relaxed: 1.8 },
};

export const Spacing = {
  1: 4,   2: 8,  3: 12, 4: 16, 5: 20,
  6: 24,  8: 32, 10: 40, 12: 48, 16: 64,
};

export const Radius = {
  sm: 6, md: 8, lg: 12, xl: 16, full: 9999,
};