import { StyleSheet, Text, View } from "react-native";
import { PieChart } from "react-native-gifted-charts";
import { Colors, Radius, Spacing, Typography } from "@/src/constants/theme";
import { PAYMENT_COLOR, PAYMENT_LABEL } from "@/src/lib/labels";
import { formatBRL, toReais } from "@/src/lib/money";
import type { PaymentMethodTotal } from "@/src/repositories/transactionRepository";

export default function PaymentMethodChart({ items }: { items: PaymentMethodTotal[] }) {
  const total = items.reduce((sum, i) => sum + i.totalCents, 0);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Despesas por forma de pagamento</Text>
      {total === 0 ? (
        <Text style={styles.empty}>Sem despesas neste mês.</Text>
      ) : (
        <View style={styles.row}>
          <PieChart
            donut
            radius={72}
            innerRadius={46}
            innerCircleColor={Colors.surface}
            data={items.map((i) => ({ value: toReais(i.totalCents), color: PAYMENT_COLOR[i.paymentMethod] }))}
            centerLabelComponent={() => (
              <View style={styles.center}>
                <Text style={styles.centerLabel}>Total</Text>
                <Text style={styles.centerValue} numberOfLines={1} adjustsFontSizeToFit>{formatBRL(total)}</Text>
              </View>
            )}
          />
          <View style={styles.legend}>
            {items.map((i) => (
              <View key={i.paymentMethod} style={styles.legendRow}>
                <View style={[styles.dot, { backgroundColor: PAYMENT_COLOR[i.paymentMethod] }]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.legendName}>{PAYMENT_LABEL[i.paymentMethod]}</Text>
                  <Text style={styles.legendValue}>{formatBRL(i.totalCents)} · {Math.round((i.totalCents / total) * 100)}%</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: Colors.surface, borderRadius: Radius.xl, padding: Spacing[4], gap: Spacing[3], borderWidth: 1, borderColor: Colors.border },
  title: { fontSize: Typography.fontSize.md, fontWeight: Typography.fontWeight.semibold, color: Colors.textPrimary },
  empty: { fontSize: Typography.fontSize.base, color: Colors.textSecondary },
  row: { flexDirection: "row", alignItems: "center", gap: Spacing[5] },
  center: { alignItems: "center", maxWidth: 70 },
  centerLabel: { fontSize: Typography.fontSize.xs, color: Colors.textSecondary },
  centerValue: { fontSize: Typography.fontSize.base, fontWeight: Typography.fontWeight.bold, color: Colors.textPrimary },
  legend: { flex: 1, gap: Spacing[3] },
  legendRow: { flexDirection: "row", alignItems: "center", gap: Spacing[2] },
  dot: { width: 10, height: 10, borderRadius: Radius.full },
  legendName: { fontSize: Typography.fontSize.base, fontWeight: Typography.fontWeight.medium, color: Colors.textPrimary },
  legendValue: { fontSize: Typography.fontSize.sm, color: Colors.textSecondary },
});
