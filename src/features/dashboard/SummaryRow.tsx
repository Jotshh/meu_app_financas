import { StyleSheet, Text, View } from "react-native";
import { Colors, Radius, Spacing, Typography } from "@/src/constants/theme";
import { formatBRL } from "@/src/lib/money";
import type { MonthlyTotal } from "@/src/repositories/transactionRepository";

export default function SummaryRow({ current }: { current: MonthlyTotal }) {
  const negative = current.balanceCents < 0;
  return (
    <View style={styles.card}>
      <Cell label="Receitas" value={formatBRL(current.incomeCents)} color={Colors.success.text} />
      <View style={styles.divider} />
      <Cell label="Despesas" value={formatBRL(current.expenseCents)} color={Colors.danger.text} />
      <View style={styles.divider} />
      <Cell label="Saldo" value={formatBRL(current.balanceCents)} color={negative ? Colors.danger.text : Colors.textPrimary} />
    </View>
  );
}

function Cell({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={styles.cell}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, { color }]} numberOfLines={1} adjustsFontSizeToFit>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: "row", backgroundColor: Colors.surface, borderRadius: Radius.xl, paddingVertical: Spacing[4], borderWidth: 1, borderColor: Colors.border },
  cell: { flex: 1, paddingHorizontal: Spacing[3], gap: Spacing[1] },
  divider: { width: 1, backgroundColor: Colors.border },
  label: { fontSize: Typography.fontSize.sm, color: Colors.textSecondary },
  value: { fontSize: Typography.fontSize.md, fontWeight: Typography.fontWeight.bold },
});
