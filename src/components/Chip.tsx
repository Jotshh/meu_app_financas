import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Radius, Spacing, Typography } from "@/src/constants/theme";

interface ChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  count?: number;
  icon?: keyof typeof Ionicons.glyphMap;
}

export default function Chip({ label, selected, onPress, count, icon }: ChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        selected ? styles.selected : styles.unselected,
        pressed && styles.pressed,
      ]}
    >
      {icon ? (
        <Ionicons
          name={icon}
          size={16}
          color={selected ? Colors.white : Colors.textSecondary}
          style={styles.icon}
        />
      ) : null}
      <Text style={[styles.label, selected ? styles.labelSelected : styles.labelUnselected]}>
        {label}
      </Text>
      {count !== undefined ? (
        <View style={[styles.badge, selected ? styles.badgeSelected : styles.badgeUnselected]}>
          <Text style={[styles.badgeText, selected ? styles.badgeTextSelected : styles.badgeTextUnselected]}>
            {count}
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing[2],
    paddingHorizontal: Spacing[3],
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  selected: {
    backgroundColor: Colors.button.primary,
    borderColor: Colors.button.primary,
  },
  unselected: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  icon: {
    marginRight: Spacing[1],
  },
  label: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },
  labelSelected: {
    color: Colors.white,
  },
  labelUnselected: {
    color: Colors.textSecondary,
  },
  badge: {
    marginLeft: Spacing[2],
    paddingHorizontal: Spacing[1] + 2,
    paddingVertical: 1,
    borderRadius: Radius.full,
  },
  badgeSelected: {
    backgroundColor: Colors.primary[300],
  },
  badgeUnselected: {
    backgroundColor: Colors.surfaceAlt,
  },
  badgeText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
  },
  badgeTextSelected: {
    color: Colors.white,
  },
  badgeTextUnselected: {
    color: Colors.textSecondary,
  },
});

