export const lightColors = {
  primary: {
    100: "#111111",
    200: "#2A2A2D",
    300: "#404044",
    400: "#5B5C5D",
    500: "#76777A",
    600: "#919296",
    700: "#ADAEB2",
    800: "#C8C9CD",
    900: "#E4E5E8",
    1000: "#F2F3F5",
  },
  secondary: {
    100: "#111111",
    200: "#26262A",
    300: "#3F3F42",
    400: "#5B5C5D",
    500: "#76777A",
    600: "#919296",
    700: "#ADAEB2",
    800: "#C8C9CD",
    900: "#E4E5E8",
    1000: "#F2F3F5",
  },

  button: {
    primary: "#111111",
    secondary: "#E9EAEE",
  },

  // Semânticos: border = cor pura PRD, text = versão escura para WCAG AA (>= 4.5:1), bg = tom claro para badges
  success: {
    bg: "#E8F7F0",
    text: "#19764F",
    border: "#22A06B",
  },
  warning: {
    bg: "#FEF6E9",
    text: "#8C5E15",
    border: "#F5A524",
  },
  danger: {
    bg: "#FDEBEC",
    text: "#B93A3E",
    border: "#E5484D",
  },
  info: {
    bg: "#EBF2FE",
    text: "#3262C8",
    border: "#3E7BFA",
  },

  background: "#F2F3F5",
  surface: "#FFFFFF",
  surfaceAlt: "#E9EAEE",
  textPrimary: "#111111",
  textSecondary: "#5B5C5D",
  border: "#D9DADE",
  white: "#FFFFFF",
  black: "#000000",
};

export const darkColors = {
  primary: {
    100: "#F5F5F5",
    200: "#E4E5E8",
    300: "#C8C9CD",
    400: "#ADAEB2",
    500: "#919296",
    600: "#76777A",
    700: "#5B5C5D",
    800: "#3F3F42",
    900: "#26262A",
    1000: "#121214",
  },
  secondary: {
    100: "#F5F5F5",
    200: "#E4E5E8",
    300: "#C8C9CD",
    400: "#ADAEB2",
    500: "#919296",
    600: "#76777A",
    700: "#5B5C5D",
    800: "#3F3F42",
    900: "#26262A",
    1000: "#121214",
  },

  button: {
    primary: "#F5F5F5",
    secondary: "#26262A",
  },

  // Semânticos dark: border = cor pura PRD, text = tom claro para contraste sobre fundo escuro, bg = tom escuro para badges
  success: {
    bg: "#173326",
    text: "#4ADE80",
    border: "#22A06B",
  },
  warning: {
    bg: "#382813",
    text: "#FBBF24",
    border: "#F5A524",
  },
  danger: {
    bg: "#3B1D20",
    text: "#F87171",
    border: "#E5484D",
  },
  info: {
    bg: "#162744",
    text: "#60A5FA",
    border: "#3E7BFA",
  },

  background: "#121214",
  surface: "#1C1C1F",
  surfaceAlt: "#26262A",
  textPrimary: "#F5F5F5",
  textSecondary: "#A0A0A5",
  border: "#2E2E32",
  white: "#FFFFFF",
  black: "#000000",
};

export type ThemeColors = typeof lightColors;

// Por enquanto exporta lightColors diretamente (preparado para alternância futura)
export const Colors: ThemeColors = lightColors;

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
