import { useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSQLiteContext } from "expo-sqlite";
import Button from "@/src/components/Button";
import { Colors, Spacing, Typography } from "@/src/constants/theme";
import { seedDemoData } from "@/src/db/seedDemo";
import { useCurrentUserId } from "@/src/features/auth/useCurrentUserId";
import MonthlyChart from "@/src/features/dashboard/MonthlyChart";
import PaymentMethodChart from "@/src/features/dashboard/PaymentMethodChart";
import RecentTransactions from "@/src/features/dashboard/RecentTransactions";
import SummaryRow from "@/src/features/dashboard/SummaryRow";
import { useDashboardData } from "@/src/features/dashboard/useDashboardData";

export default function VisaoGeral() {
  const db = useSQLiteContext();
  const userId = useCurrentUserId();
  const { data, loading, error, reload } = useDashboardData(6);
  const [seeding, setSeeding] = useState(false);

  const monthName = new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

  async function handleSeed() {
    setSeeding(true);
    try { await seedDemoData(db, userId); await reload(); } finally { setSeeding(false); }
  }

  if (loading) return <View style={styles.center}><ActivityIndicator color={Colors.primary[500]} /></View>;

  if (error || !data) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorTitle}>Não foi possível carregar</Text>
        <Text style={styles.muted}>{error}</Text>
        <Button label="Tentar de novo" onPress={reload} variant="outline" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View>
          <Text style={styles.title}>Visão geral</Text>
          <Text style={styles.muted}>{monthName}</Text>
        </View>

        {data.isEmpty ? (
          <View style={styles.empty}>
            <Text style={styles.errorTitle}>Nenhum lançamento ainda</Text>
            <Text style={styles.muted}>Adicione seu primeiro lançamento ou carregue dados de exemplo para ver os gráficos.</Text>
            <Button label="Carregar dados de exemplo" onPress={handleSeed} loading={seeding} fullWidth />
          </View>
        ) : (
          <>
            <SummaryRow current={data.current} />
            <MonthlyChart months={data.months} />
            <PaymentMethodChart items={data.byMethod} />
            <RecentTransactions items={data.recent} />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing[4], gap: Spacing[4], paddingBottom: Spacing[12] },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: Spacing[3], padding: Spacing[6], backgroundColor: Colors.background },
  title: { fontSize: Typography.fontSize["2xl"], fontWeight: Typography.fontWeight.bold, color: Colors.textPrimary },
  muted: { fontSize: Typography.fontSize.base, color: Colors.textSecondary, textTransform: "capitalize" },
  errorTitle: { fontSize: Typography.fontSize.lg, fontWeight: Typography.fontWeight.semibold, color: Colors.textPrimary },
  empty: { gap: Spacing[3], paddingVertical: Spacing[8] },
});
