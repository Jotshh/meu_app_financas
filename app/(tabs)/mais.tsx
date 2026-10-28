import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import ScreenHeader from "@/src/components/ScreenHeader";
import { Colors, Radius, Spacing, Typography } from "@/src/constants/theme";

interface SettingItem {
  key: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
}

const SETTINGS_ITEMS: SettingItem[] = [
  {
    key: "theme",
    icon: "contrast-outline",
    title: "Aparência e Tema",
    description: "Alternar entre modo claro e modo escuro",
  },
  {
    key: "spaces",
    icon: "folder-outline",
    title: "Planilhas e Espaços",
    description: "Organizar finanças pessoais, conjuntas ou trabalho",
  },
  {
    key: "export",
    icon: "download-outline",
    title: "Exportar dados",
    description: "Exportação de relatórios e lançamentos em CSV",
  },
  {
    key: "security",
    icon: "shield-checkmark-outline",
    title: "Segurança e Acesso",
    description: "Bloqueio com biometria ou senha numérica",
  },
];

export default function MaisScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <ScreenHeader
          title="Mais"
          subtitle="Ajustes, configurações e gerenciamento da conta"
        />

        <View style={styles.list}>
          {SETTINGS_ITEMS.map((item) => (
            <Pressable
              key={item.key}
              accessibilityRole="button"
              accessibilityLabel={`${item.title}, em breve`}
              style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
            >
              <View style={styles.iconCircle}>
                <Ionicons name={item.icon} size={22} color={Colors.textPrimary} />
              </View>

              <View style={styles.info}>
                <View style={styles.titleRow}>
                  <Text style={styles.title}>{item.title}</Text>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>Em breve</Text>
                  </View>
                </View>
                <Text style={styles.desc}>{item.description}</Text>
              </View>

              <Ionicons name="chevron-forward" size={18} color={Colors.textSecondary} />
            </Pressable>
          ))}
        </View>

        <View style={styles.aboutCard}>
          <Text style={styles.aboutTitle}>Finanças Pessoais</Text>
          <Text style={styles.aboutSubtitle}>Versão 1.0.0 · Design System Monocromático</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing[4],
    gap: Spacing[4],
    paddingBottom: Spacing[16],
  },
  list: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Spacing[3],
  },
  rowPressed: {
    backgroundColor: Colors.surfaceAlt,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  info: {
    flex: 1,
    gap: 2,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing[2],
  },
  title: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textPrimary,
  },
  desc: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
  },
  badge: {
    backgroundColor: Colors.surfaceAlt,
    paddingHorizontal: Spacing[2],
    paddingVertical: 1,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  badgeText: {
    fontSize: Typography.fontSize.xs - 1,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.textSecondary,
  },
  aboutCard: {
    alignItems: "center",
    paddingVertical: Spacing[6],
    gap: 2,
  },
  aboutTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textPrimary,
  },
  aboutSubtitle: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
  },
});

