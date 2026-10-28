import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  SectionList,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { Ionicons } from "@expo/vector-icons";
import Chip from "@/src/components/Chip";
import EmptyState from "@/src/components/EmptyState";
import ScreenHeader from "@/src/components/ScreenHeader";
import { Colors, Radius, Spacing, Typography } from "@/src/constants/theme";
import type { PaymentMethod, TransactionListItem } from "@/src/db/types";
import { toISODate } from "@/src/lib/dates";
import { PAYMENT_LABEL } from "@/src/lib/labels";
import { formatBRL } from "@/src/lib/money";
import { useCurrentUserId } from "@/src/features/auth/useCurrentUserId";
import {
  getTransactionTotals,
  listTransactions,
  type TransactionTotals,
} from "@/src/repositories/transactionRepository";

const PAGE_SIZE = 25;
const PAYMENT_OPTIONS: Array<{ key: PaymentMethod | "all"; label: string }> = [
  { key: "all", label: "Todos" },
  { key: "pix", label: PAYMENT_LABEL.pix },
  { key: "cartao", label: PAYMENT_LABEL.cartao },
  { key: "a_vista", label: PAYMENT_LABEL.a_vista },
];

interface DaySection {
  date: string;
  title: string;
  dayTotalCents: number;
  data: TransactionListItem[];
}

function formatSectionTitle(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const itemDate = new Date(y, m - 1, d);
  const todayStr = toISODate();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = toISODate(yesterday);

  if (dateStr === todayStr) return "Hoje";
  if (dateStr === yesterdayStr) return "Ontem";

  return itemDate.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    weekday: "short",
  });
}

function groupIntoSections(items: TransactionListItem[]): DaySection[] {
  const map = new Map<string, TransactionListItem[]>();
  for (const item of items) {
    const list = map.get(item.date) ?? [];
    list.push(item);
    map.set(item.date, list);
  }

  return Array.from(map.entries()).map(([date, data]) => {
    const dayTotalCents = data.reduce((acc, t) => {
      if (t.type === "income") return acc + t.amount_cents;
      if (t.type === "expense") return acc - t.amount_cents;
      return acc;
    }, 0);

    return {
      date,
      title: formatSectionTitle(date),
      dayTotalCents,
      data,
    };
  });
}

export default function LancamentosScreen() {
  const db = useSQLiteContext();
  const userId = useCurrentUserId();

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | "all">("all");

  const [items, setItems] = useState<TransactionListItem[]>([]);
  const [totals, setTotals] = useState<TransactionTotals | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Debounce da busca
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Carrega lista inicial e totais
  const loadData = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      try {
        const filters = {
          search: debouncedSearch.trim() || undefined,
          paymentMethod: selectedMethod === "all" ? undefined : selectedMethod,
        };

        const [list, totalData] = await Promise.all([
          listTransactions(db, userId, { ...filters, limit: PAGE_SIZE, offset: 0 }),
          getTransactionTotals(db, userId, filters),
        ]);

        setItems(list);
        setTotals(totalData);
        setHasMore(list.length >= PAGE_SIZE);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Não foi possível carregar os lançamentos.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [db, userId, debouncedSearch, selectedMethod],
  );

  // Recarrega sempre que a tela ganha foco ou filtros mudam
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  // Paginação
  const handleLoadMore = async () => {
    if (loading || loadingMore || !hasMore) return;
    setLoadingMore(true);

    try {
      const filters = {
        search: debouncedSearch.trim() || undefined,
        paymentMethod: selectedMethod === "all" ? undefined : selectedMethod,
      };

      const nextItems = await listTransactions(db, userId, {
        ...filters,
        limit: PAGE_SIZE,
        offset: items.length,
      });

      if (nextItems.length > 0) {
        setItems((prev) => [...prev, ...nextItems]);
        setHasMore(nextItems.length >= PAGE_SIZE);
      } else {
        setHasMore(false);
      }
    } catch {
      // Ignora erro silencioso no scroll infinito
    } finally {
      setLoadingMore(false);
    }
  };

  const sections = useMemo(() => groupIntoSections(items), [items]);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadData(true)}
            tintColor={Colors.textPrimary}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        ListHeaderComponent={
          <View style={styles.headerArea}>
            <ScreenHeader
              title="Lançamentos"
              subtitle={
                totals
                  ? `${totals.count} ${totals.count === 1 ? "registro encontrado" : "registros encontrados"}`
                  : "Histórico e movimentações"
              }
            />

            {/* Campo de Busca */}
            <View style={styles.searchBox}>
              <Ionicons name="search" size={18} color={Colors.textSecondary} />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Buscar por descrição..."
                placeholderTextColor={Colors.textSecondary}
                style={styles.searchInput}
                autoCorrect={false}
                returnKeyType="search"
              />
              {search.length > 0 ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Limpar busca"
                  onPress={() => setSearch("")}
                  hitSlop={8}
                >
                  <Ionicons name="close-circle" size={18} color={Colors.textSecondary} />
                </Pressable>
              ) : null}
            </View>

            {/* Chips de Forma de Pagamento */}
            <View style={styles.chipsRow}>
              {PAYMENT_OPTIONS.map((opt) => (
                <Chip
                  key={opt.key}
                  label={opt.label}
                  selected={selectedMethod === opt.key}
                  onPress={() => setSelectedMethod(opt.key)}
                />
              ))}
            </View>

            {/* Resumo do filtro */}
            {totals ? (
              <View style={styles.summaryCard}>
                <View style={styles.summaryCell}>
                  <Text style={styles.summaryLabel}>Entradas</Text>
                  <Text style={[styles.summaryValue, { color: Colors.success.text }]}>
                    {formatBRL(totals.incomeCents)}
                  </Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryCell}>
                  <Text style={styles.summaryLabel}>Saídas</Text>
                  <Text style={[styles.summaryValue, { color: Colors.danger.text }]}>
                    {formatBRL(totals.expenseCents)}
                  </Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryCell}>
                  <Text style={styles.summaryLabel}>Balanço</Text>
                  <Text
                    style={[
                      styles.summaryValue,
                      {
                        color:
                          totals.balanceCents > 0
                            ? Colors.success.text
                            : totals.balanceCents < 0
                            ? Colors.danger.text
                            : Colors.textPrimary,
                      },
                    ]}
                  >
                    {formatBRL(totals.balanceCents)}
                  </Text>
                </View>
              </View>
            ) : null}
          </View>
        }
        renderSectionHeader={({ section: { title, dayTotalCents } }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{title}</Text>
            <Text
              style={[
                styles.sectionTotal,
                {
                  color:
                    dayTotalCents > 0
                      ? Colors.success.text
                      : dayTotalCents < 0
                      ? Colors.danger.text
                      : Colors.textSecondary,
                },
              ]}
            >
              {dayTotalCents > 0 ? "+ " : dayTotalCents < 0 ? "− " : ""}
              {formatBRL(Math.abs(dayTotalCents))}
            </Text>
          </View>
        )}
        renderItem={({ item }) => {
          const isIncome = item.type === "income";
          const isTransfer = item.type === "transfer";
          const sign = isTransfer ? "" : isIncome ? "+ " : "− ";
          const color = isTransfer
            ? Colors.info.text
            : isIncome
            ? Colors.success.text
            : Colors.danger.text;

          const detail = isTransfer
            ? `${item.account_name} → ${item.to_account_name ?? "Conta"}`
            : [
                item.category_name,
                item.payment_method ? PAYMENT_LABEL[item.payment_method] : null,
                item.installment_total
                  ? `${item.installment_number}/${item.installment_total}`
                  : null,
              ]
                .filter(Boolean)
                .join(" · ");

          return (
            <View style={styles.txRow}>
              <View style={styles.txLeft}>
                <Text style={styles.txDesc} numberOfLines={1}>
                  {item.description || "Sem descrição"}
                </Text>
                <Text style={styles.txDetail} numberOfLines={1}>
                  {detail}
                </Text>
              </View>
              <Text style={[styles.txAmount, { color }]}>
                {sign}
                {formatBRL(item.amount_cents)}
              </Text>
            </View>
          );
        }}
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
              onAction={() => loadData()}
            />
          ) : (
            <EmptyState
              icon="search-outline"
              title="Nenhum lançamento encontrado"
              description="Tente buscar por outro termo ou selecione uma forma de pagamento diferente."
            />
          )
        }
        ListFooterComponent={
          loadingMore ? (
            <View style={styles.footerLoading}>
              <ActivityIndicator size="small" color={Colors.textSecondary} />
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
    gap: Spacing[2],
    paddingBottom: Spacing[16],
  },
  headerArea: {
    gap: Spacing[3],
    marginBottom: Spacing[2],
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing[3],
    height: 44,
    gap: Spacing[2],
  },
  searchInput: {
    flex: 1,
    fontSize: Typography.fontSize.base,
    color: Colors.textPrimary,
    paddingVertical: 0,
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing[2],
  },
  summaryCard: {
    flexDirection: "row",
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    paddingVertical: Spacing[3],
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: Spacing[1],
  },
  summaryCell: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: Spacing[2],
    gap: Spacing[1],
  },
  summaryDivider: {
    width: 1,
    backgroundColor: Colors.border,
  },
  summaryLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
  },
  summaryValue: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing[2],
    paddingHorizontal: Spacing[1],
    marginTop: Spacing[2],
  },
  sectionTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textSecondary,
    textTransform: "capitalize",
  },
  sectionTotal: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },
  txRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing[3],
    gap: Spacing[3],
  },
  txLeft: {
    flex: 1,
    gap: 2,
  },
  txDesc: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.textPrimary,
  },
  txDetail: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
  },
  txAmount: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
  },
  centerBox: {
    paddingVertical: Spacing[12],
    alignItems: "center",
    justifyContent: "center",
  },
  footerLoading: {
    paddingVertical: Spacing[4],
    alignItems: "center",
    justifyContent: "center",
  },
});
