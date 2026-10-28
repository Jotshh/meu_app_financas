import { StyleSheet, Text, View } from "react-native";
import { Colors, Radius, Spacing, Typography } from "@/src/constants/theme";
import type { TransactionListItem } from "@/src/db/types";
import { PAYMENT_LABEL } from "@/src/lib/labels";
import { formatBRL } from "@/src/lib/money";

export default function RecentTransactions({ items }: { items: TransactionListItem[] }) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Últimos lançamentos</Text>
      {items.map((t, idx) => {
        const isIncome = t.type === "income";
        const isTransfer = t.type === "transfer";
        const sign = isTransfer ? "" : isIncome ? "+ " : "− ";
        const color = isTransfer ? Colors.textSecondary : isIncome ? Colors.success.text : Colors.danger.text;
        const detail = isTransfer
          ? `${t.account_name} → ${t.to_account_name}`
          : [t.category_name, t.payment_method ? PAYMENT_LABEL[t.payment_method] : null].filter(Boolean).join(" · ");

        return (
          <View key={t.id} style={[styles.row, idx > 0 && styles.rowBorder]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.desc} numberOfLines={1}>{t.description || "Sem descrição"}</Text>
              <Text style={styles.detail} numberOfLines={1}>{t.date.slice(8, 10)}/{t.date.slice(5, 7)} · {detail}</Text>
            </View>
            <Text style={[styles.amount, { color }]}>{sign}{formatBRL(t.amount_cents)}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: Colors.surface, borderRadius: Radius.xl, padding: Spacing[4], borderWidth: 1, borderColor: Colors.border },
  title: { fontSize: Typography.fontSize.md, fontWeight: Typography.fontWeight.semibold, color: Colors.textPrimary, marginBottom: Spacing[2] },
  row: { flexDirection: "row", alignItems: "center", gap: Spacing[3], paddingVertical: Spacing[3] },
  rowBorder: { borderTopWidth: 1, borderTopColor: Colors.primary[900] },
  desc: { fontSize: Typography.fontSize.base, fontWeight: Typography.fontWeight.medium, color: Colors.textPrimary },
  detail: { fontSize: Typography.fontSize.sm, color: Colors.textSecondary },
  amount: { fontSize: Typography.fontSize.base, fontWeight: Typography.fontWeight.semibold },
});
