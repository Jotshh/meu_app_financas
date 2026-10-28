import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import type { TransactionListItem } from "@/src/db/types";
import { lastNMonths, monthRange } from "@/src/lib/dates";
import { useCurrentUserId } from "@/src/features/auth/useCurrentUserId";
import {
  getMonthlyTotals, getPaymentMethodTotals, listTransactions,
  type MonthlyTotal, type PaymentMethodTotal,
} from "@/src/repositories/transactionRepository";

export interface DashboardData {
  months: MonthlyTotal[];
  current: MonthlyTotal;
  byMethod: PaymentMethodTotal[];
  recent: TransactionListItem[];
  isEmpty: boolean;
}

export function useDashboardData(monthCount = 6, spreadsheetId?: string) {
  const db = useSQLiteContext();
  const userId = useCurrentUserId();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      const list = lastNMonths(monthCount);
      const currentKey = list[list.length - 1];
      const range = monthRange(currentKey);

      const [months, byMethod, recent] = await Promise.all([
        getMonthlyTotals(db, userId, { fromMonth: list[0], toMonth: currentKey, spreadsheetId }),
        getPaymentMethodTotals(db, userId, { ...range, spreadsheetId }),
        listTransactions(db, userId, { spreadsheetId, limit: 5 }),
      ]);
      setData({ months, current: months[months.length - 1], byMethod, recent, isEmpty: recent.length === 0 });
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível carregar os dados.");
    } finally {
      setLoading(false);
    }
  }, [db, userId, monthCount, spreadsheetId]);

  // Recarrega sempre que a aba ganha foco (ex.: depois de lançar algo em outra tela).
  useFocusEffect(useCallback(() => { reload(); }, [reload]));

  return { data, loading, error, reload };
}
