import { Pressable, Text, ActivityIndicator, StyleSheet } from "react-native";
import { Colors, Typography, Spacing, Radius } from "@/src/constants/theme";

// Definindo os tipos aceitos pelo componente (TypeScript)
type ButtonVariant = "primary" | "outline" | "ghost" | "danger";
type ButtonSize    = "sm" | "md" | "lg";

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

export default function Button({
  label,
  onPress,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  fullWidth = false,
  icon,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const spinnerColor =
    variant === "primary"
      ? Colors.white
      : variant === "danger"
      ? Colors.danger.text
      : Colors.textPrimary;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        styles[variant],        // Aplica o estilo da variante
        styles[`size_${size}`], // Aplica o tamanho
        fullWidth && styles.fullWidth,
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={spinnerColor}
        />
      ) : (
        <>
          {icon && icon}
          <Text style={[styles.label, styles[`label_${variant}`], styles[`labelSize_${size}`]]}>
            {label}
          </Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: Spacing[2], borderRadius: Radius.lg, borderWidth: 1.5,
  },
  // Variantes
  primary:  { backgroundColor: Colors.button.primary, borderColor: Colors.button.primary },
  outline:  { backgroundColor: "transparent", borderColor: Colors.border },
  ghost:    { backgroundColor: "transparent", borderColor: "transparent" },
  danger:   { backgroundColor: Colors.danger.bg, borderColor: Colors.danger.border },
  // Tamanhos
  size_sm:  { paddingVertical: Spacing[2], paddingHorizontal: Spacing[3] },
  size_md:  { paddingVertical: Spacing[3], paddingHorizontal: Spacing[5] },
  size_lg:  { paddingVertical: Spacing[4], paddingHorizontal: Spacing[6] },
  // Estados
  fullWidth:  { width: "100%" },
  pressed:    { opacity: 0.85, transform: [{ scale: 0.98 }] },
  disabled:   { opacity: 0.45 },
  // Labels
  label:         { fontWeight: Typography.fontWeight.semibold },
  label_primary: { color: Colors.white },
  label_outline: { color: Colors.textPrimary },
  label_ghost:   { color: Colors.textPrimary },
  label_danger:  { color: Colors.danger.text },
  labelSize_sm:  { fontSize: Typography.fontSize.sm },
  labelSize_md:  { fontSize: Typography.fontSize.md },
  labelSize_lg:  { fontSize: Typography.fontSize.lg },
});
