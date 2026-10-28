import { StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { BarChart } from "react-native-gifted-charts";
import { Colors, Radius, Spacing, Typography } from "@/src/constants/theme";
import { monthLabel } from "@/src/lib/dates";
import { compactReais, toReais } from "@/src/lib/money";
import type { MonthlyTotal } from "@/src/repositories/transactionRepository";

const BAR_WIDTH = 14;
const PAIR_GAP = 4;
const Y_AXIS_WIDTH = 40;

export default function MonthlyChart({ months }: { months: MonthlyTotal[] }) {
  const { width } = useWindowDimensions();
  // tela - margem da tela (2×16) - padding do card (2×16) - eixo Y
  const chartWidth = width - Spacing[4] * 4 - Y_AXIS_WIDTH;
  const groupWidth = BAR_WIDTH * 2 + PAIR_GAP;
  const groupGap = Math.max(6, Math.floor((chartWidth - 8 - months.length * groupWidth) / months.length));

  // Padrão de barras agrupadas do gifted-charts: dois itens por mês; o rótulo vai no primeiro.
  const data = months.flatMap((m) => [
    {
      value: toReais(m.incomeCents), frontColor: Colors.success.border, spacing: PAIR_GAP,
      label: monthLabel(m.month), labelWidth: groupWidth + 8,
      labelTextStyle: { color: Colors.textSecondary, fontSize: Typography.fontSize.sm },
    },
    { value: toReais(m.expenseCents), frontColor: Colors.danger.border, spacing: groupGap },
  ]);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Receitas e despesas</Text>
      <View style={styles.legend}>
        <Legend color={Colors.success.border} label="Receitas" />
        <Legend color={Colors.danger.border} label="Despesas" />
      </View>
      <BarChart
        data={data}
        width={chartWidth}
        height={170}
        barWidth={BAR_WIDTH}
        initialSpacing={8}
        disableScroll
        roundedTop
        noOfSections={4}
        yAxisThickness={0}
        xAxisThickness={1}
        xAxisColor={Colors.border}
        rulesColor={Colors.primary[900]}
        yAxisLabelWidth={Y_AXIS_WIDTH}
        yAxisTextStyle={{ color: Colors.textSecondary, fontSize: Typography.fontSize.xs }}
        formatYLabel={(label: string) => compactReais(Number(label))}
      />
    </View>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={styles.legendText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: Colors.surface, borderRadius: Radius.xl, padding: Spacing[4], gap: Spacing[3], borderWidth: 1, borderColor: Colors.border },
  title: { fontSize: Typography.fontSize.md, fontWeight: Typography.fontWeight.semibold, color: Colors.textPrimary },
  legend: { flexDirection: "row", gap: Spacing[4] },
  legendItem: { flexDirection: "row", alignItems: "center", gap: Spacing[2] },
  dot: { width: 8, height: 8, borderRadius: Radius.full },
  legendText: { fontSize: Typography.fontSize.sm, color: Colors.textSecondary },
});
