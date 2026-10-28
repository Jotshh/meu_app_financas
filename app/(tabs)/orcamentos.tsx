import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import EmptyState from "@/src/components/EmptyState";
import ScreenHeader from "@/src/components/ScreenHeader";
import { Colors, Radius, Spacing, Typography } from "@/src/constants/theme";

export default function OrcamentosScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <ScreenHeader
          title="Orçamentos"
          subtitle="Planejamento e limites mensais de gastos por categoria"
        />

        <EmptyState
          icon="flag-outline"
          title="Defina seus limites de gastos"
          description="Monitore em tempo real o quanto você já gastou no mês e receba avisos preventivos para não estourar o orçamento."
          actionLabel="Criar orçamento (Em breve)"
          onAction={() => {}}
          actionDisabled
        />

        {/* Card informativo de regras semânticas */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Como funcionam os limites:</Text>
          <View style={styles.ruleItem}>
            <View style={[styles.dot, { backgroundColor: Colors.textSecondary }]} />
            <Text style={styles.ruleText}>
              <Text style={styles.ruleStrong}>Até 85%:</Text> Gastos sob controle e dentro da meta.
            </Text>
          </View>
          <View style={styles.ruleItem}>
            <View style={[styles.dot, { backgroundColor: Colors.warning.border }]} />
            <Text style={styles.ruleText}>
              <Text style={styles.ruleStrong}>De 85% a 100%:</Text> Alerta preventivo em amarelo âmbar.
            </Text>
          </View>
          <View style={styles.ruleItem}>
            <View style={[styles.dot, { backgroundColor: Colors.danger.border }]} />
            <Text style={styles.ruleText}>
              <Text style={styles.ruleStrong}>Acima de 100%:</Text> Limite estourado em vermelho.
            </Text>
          </View>
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
  infoCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing[4],
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing[3],
    marginTop: Spacing[2],
  },
  infoTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textPrimary,
  },
  ruleItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing[2],
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: Radius.full,
  },
  ruleText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    flex: 1,
  },
  ruleStrong: {
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textPrimary,
  },
});

