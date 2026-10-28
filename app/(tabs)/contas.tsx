import React, { useCallback, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { Ionicons } from "@expo/vector-icons";
import Button from "@/src/components/Button";
import EmptyState from "@/src/components/EmptyState";
import ScreenHeader from "@/src/components/ScreenHeader";
import { Colors, Radius, Spacing, Typography } from "@/src/constants/theme";
import type { AccountRow } from "@/src/db/types";
import { ACCOUNT_LABEL } from "@/src/lib/labels";
import { formatBRL } from "@/src/lib/money";
import { useCurrentUserId } from "@/src/features/auth/useCurrentUserId";
import { listAccounts } from "@/src/repositories/catalogRepository";

export default function ContasScreen() {
  const db = useSQLiteContext();
  const userId = useCurrentUserId();

  const [accounts, setAccounts] = useState<AccountRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAccounts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listAccounts(db, userId);
      setAccounts(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao carregar contas.");
    } finally {
      setLoading(false);
    }
  }, [db, userId]);

  useFocusEffect(
    useCallback(() => {
      loadAccounts();
    }, [loadAccounts]),
  );

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <FlatList
        data={accounts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.headerArea}>
            <ScreenHeader
              title="Contas"
              subtitle="Gerencie suas contas bancárias, cartões e carteiras"
            />
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.iconContainer}>
              <Ionicons
                name={
                  item.type === "credit_card"
                    ? "card-outline"
                    : item.type === "cash"
                    ? "cash-outline"
                    : item.type === "investment"
                    ? "trending-up-outline"
                    : "wallet-outline"
                }
                size={22}
                color={Colors.textPrimary}
              />
            </View>
            <View style={styles.info}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.type}>{ACCOUNT_LABEL[item.type] ?? item.type}</Text>
            </View>
            <View style={styles.balanceContainer}>
              <Text style={styles.balanceLabel}>Saldo inicial</Text>
              <Text style={styles.balanceValue}>
                {formatBRL(item.initial_balance_cents)}
              </Text>
            </View>
          </View>
        )}
        ListEmptyComponent={
          loading ? (
            <View style={styles.centerBox}>
              <ActivityIndicator color={Colors.textPrimary} />
            </View>
          ) : error ? (
            <EmptyState
              icon="alert-circle-outline"
              title="Não foi possível carregar"
              description={error}
              actionLabel="Tentar de novo"
              onAction={loadAccounts}
            />
          ) : (
            <EmptyState
              icon="wallet-outline"
              title="Nenhuma conta cadastrada"
              description="Cadastre suas contas bancárias e carteiras para acompanhar seus saldos."
              actionLabel="Nova conta (Em breve)"
              onAction={() => {}}
              actionDisabled
            />
          )
        }
        ListFooterComponent={
          accounts.length > 0 ? (
            <View style={styles.footer}>
              <Button label="Nova conta (Em breve)" onPress={() => {}} disabled fullWidth />
            </View>
          ) : undefined
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  listContent: {
    padding: Spacing[4],
    gap: Spacing[3],
    paddingBottom: Spacing[16],
  },
  headerArea: {
    marginBottom: Spacing[2],
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing[4],
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing[3],
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  info: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textPrimary,
  },
  type: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
  },
  balanceContainer: {
    alignItems: "flex-end",
    gap: 2,
  },
  balanceLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
  },
  balanceValue: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textPrimary,
  },
  centerBox: {
    paddingVertical: Spacing[12],
    alignItems: "center",
    justifyContent: "center",
  },
  footer: {
    marginTop: Spacing[4],
  },
});
