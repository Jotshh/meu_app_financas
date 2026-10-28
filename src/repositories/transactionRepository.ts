import type { SQLiteBindValue, SQLiteDatabase } from "expo-sqlite";
import { insertRow } from "@/src/db/helpers";
import { newId, nowISO } from "@/src/db/ids";
import type { PaymentMethod, TransactionListItem, TransactionType } from "@/src/db/types";
import { addMonthsClamped, addMonthsToKey, monthRange, splitInstallments } from "@/src/lib/dates";

/* ───────────────────────── Inserir ───────────────────────── */

export interface NewTransactionInput {
  spreadsheetId: string;
  accountId: string;
  /** Obrigatório (e diferente de accountId) quando type = 'transfer'. */
  toAccountId?: string | null;
  categoryId?: string | null;
  type: TransactionType;
  /** Em centavos. Com `installments` > 1 é o valor TOTAL, que será dividido entre as parcelas. */
  amountCents: number;
  /** 'YYYY-MM-DD'. Com parcelas, é a data da 1ª parcela. */
  date: string;
  description?: string;
  note?: string | null;
  /** Obrigatório para receita/despesa; ignorado em transferência. */
  paymentMethod?: PaymentMethod | null;
  /** Só para despesa no cartão. Gera uma linha por parcela, mês a mês. */
  installments?: number;
  recurringRuleId?: string | null;
  tagIds?: string[];
}

function validate(input: NewTransactionInput): void {
  if (!Number.isInteger(input.amountCents) || input.amountCents <= 0) throw new Error("O valor deve ser um inteiro positivo em centavos.");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date)) throw new Error("Data inválida; use YYYY-MM-DD.");

  if (input.type === "transfer") {
    if (!input.toAccountId || input.toAccountId === input.accountId) throw new Error("Transferência exige uma conta de destino diferente da origem.");
  } else if (!input.paymentMethod) {
    throw new Error("Informe a forma de pagamento (Pix, cartão ou à vista).");
  }

  const n = input.installments ?? 1;
  if (!Number.isInteger(n) || n < 1) throw new Error("Número de parcelas inválido.");
  if (n > 1) {
    if (input.type !== "expense" || input.paymentMethod !== "cartao") throw new Error("Parcelamento só vale para despesas no cartão.");
    if (input.amountCents < n) throw new Error("O valor é menor que o número de parcelas.");
  }
}

/** Insere o lançamento (ou todas as parcelas) numa única transação. Retorna os ids criados. */
export async function insertTransaction(db: SQLiteDatabase, userId: string, input: NewTransactionInput): Promise<string[]> {
  validate(input);

  const n = input.installments ?? 1;
  const isTransfer = input.type === "transfer";
  const amounts = n > 1 ? splitInstallments(input.amountCents, n) : [input.amountCents];
  const groupId = n > 1 ? newId() : null;
  const ids: string[] = [];

  await db.withTransactionAsync(async () => {
    for (let i = 0; i < amounts.length; i++) {
      const suffix = n > 1 ? ` (${i + 1}/${n})` : "";
      const id = await insertRow(db, "transactions", userId, {
        spreadsheet_id: input.spreadsheetId,
        account_id: input.accountId,
        to_account_id: isTransfer ? input.toAccountId : null,
        category_id: input.categoryId,
        type: input.type,
        amount_cents: amounts[i],
        date: addMonthsClamped(input.date, i),
        description: (input.description ?? "") + suffix,
        note: input.note,
        payment_method: isTransfer ? null : input.paymentMethod,
        installment_group_id: groupId,
        installment_number: groupId ? i + 1 : null,
        installment_total: groupId ? n : null,
        recurring_rule_id: input.recurringRuleId,
      });
      for (const tagId of input.tagIds ?? []) {
        await insertRow(db, "transaction_tags", userId, { transaction_id: id, tag_id: tagId });
      }
      ids.push(id);
    }
  });
  return ids;
}

/* ───────────────────────── Listar ───────────────────────── */

export interface TransactionFilters {
  /** Datas inclusivas, 'YYYY-MM-DD'. */
  from?: string;
  to?: string;
  spreadsheetId?: string;
  paymentMethod?: PaymentMethod;
  type?: TransactionType;
  /** Casa com conta de origem OU destino. */
  accountId?: string;
  categoryId?: string;
  /** Busca por trecho da descrição. */
  search?: string;
  limit?: number;
  offset?: number;
}

const escapeLike = (s: string) => s.replace(/[\\%_]/g, (c) => `\\${c}`);

function buildWhere(userId: string, f: TransactionFilters): { sql: string; params: SQLiteBindValue[] } {
  const where = ["t.user_id = ?", "t.deleted_at IS NULL"];
  const params: SQLiteBindValue[] = [userId];
  const add = (cond: string, ...p: SQLiteBindValue[]) => { where.push(cond); params.push(...p); };

  if (f.from) add("t.date >= ?", f.from);
  if (f.to) add("t.date <= ?", f.to);
  if (f.spreadsheetId) add("t.spreadsheet_id = ?", f.spreadsheetId);
  if (f.paymentMethod) add("t.payment_method = ?", f.paymentMethod);
  if (f.type) add("t.type = ?", f.type);
  if (f.accountId) add("(t.account_id = ? OR t.to_account_id = ?)", f.accountId, f.accountId);
  if (f.categoryId) add("t.category_id = ?", f.categoryId);
  if (f.search?.trim()) add("t.description LIKE ? ESCAPE '\\'", `%${escapeLike(f.search.trim())}%`);

  return { sql: where.join(" AND "), params };
}

export function listTransactions(db: SQLiteDatabase, userId: string, filters: TransactionFilters = {}): Promise<TransactionListItem[]> {
  const { sql, params } = buildWhere(userId, filters);
  return db.getAllAsync<TransactionListItem>(
    `SELECT t.*, c.name AS category_name, c.color AS category_color,
            a.name AS account_name, ta.name AS to_account_name
       FROM transactions t
       JOIN accounts a ON a.id = t.account_id
       LEFT JOIN accounts ta ON ta.id = t.to_account_id
       LEFT JOIN categories c ON c.id = t.category_id
      WHERE ${sql}
      ORDER BY t.date DESC, t.created_at DESC, t.installment_number
      LIMIT ? OFFSET ?`,
    [...params, filters.limit ?? 50, filters.offset ?? 0],
  );
}

/* ───────────────────────── Excluir (lógico) ───────────────────────── */

/** Marca como excluído (deleted_at) e sync_status='pending' para o delete subir no sync. Nunca apaga a linha. */
async function softDeleteWhere(db: SQLiteDatabase, userId: string, whereSql: string, whereParams: SQLiteBindValue[]): Promise<number> {
  const now = nowISO();
  const scope = `transaction_id IN (SELECT id FROM transactions WHERE user_id = ? AND deleted_at IS NULL AND ${whereSql})`;
  let changes = 0;

  await db.withTransactionAsync(async () => {
    for (const table of ["transaction_tags", "attachments"]) {
      await db.runAsync(
        `UPDATE ${table} SET deleted_at = ?, updated_at = ?, sync_status = 'pending' WHERE deleted_at IS NULL AND ${scope}`,
        [now, now, userId, ...whereParams],
      );
    }
    const res = await db.runAsync(
      `UPDATE transactions SET deleted_at = ?, updated_at = ?, sync_status = 'pending'
        WHERE user_id = ? AND deleted_at IS NULL AND ${whereSql}`,
      [now, now, userId, ...whereParams],
    );
    changes = res.changes;
  });
  return changes;
}

export const deleteTransaction = (db: SQLiteDatabase, userId: string, id: string) =>
  softDeleteWhere(db, userId, "id = ?", [id]);

/** Exclui as parcelas de um grupo a partir da parcela `fromNumber` (1 = todas; 3 = "esta e as próximas"). */
export const deleteInstallmentGroup = (db: SQLiteDatabase, userId: string, groupId: string, fromNumber = 1) =>
  softDeleteWhere(db, userId, "installment_group_id = ? AND installment_number >= ?", [groupId, fromNumber]);

/* ───────────────────────── Totais ───────────────────────── */

export interface MonthlyTotal {
  month: string; // 'YYYY-MM'
  incomeCents: number;
  expenseCents: number;
  balanceCents: number;
}

/** Receita/despesa por mês entre dois meses ('YYYY-MM'), inclusive. Transferências ficam de fora. Meses sem dados voltam zerados. */
export async function getMonthlyTotals(
  db: SQLiteDatabase, userId: string,
  opts: { fromMonth: string; toMonth: string; spreadsheetId?: string },
): Promise<MonthlyTotal[]> {
  const params: SQLiteBindValue[] = [userId, monthRange(opts.fromMonth).from, monthRange(opts.toMonth).to];
  if (opts.spreadsheetId) params.push(opts.spreadsheetId);

  const rows = await db.getAllAsync<{ month: string; income_cents: number; expense_cents: number }>(
    `SELECT substr(date, 1, 7) AS month,
            COALESCE(SUM(CASE WHEN type = 'income'  THEN amount_cents END), 0) AS income_cents,
            COALESCE(SUM(CASE WHEN type = 'expense' THEN amount_cents END), 0) AS expense_cents
       FROM transactions
      WHERE user_id = ? AND deleted_at IS NULL AND type <> 'transfer'
        AND date >= ? AND date <= ?
        ${opts.spreadsheetId ? "AND spreadsheet_id = ?" : ""}
      GROUP BY month`,
    params,
  );
  const byMonth = new Map(rows.map((r) => [r.month, r]));

  const result: MonthlyTotal[] = [];
  for (let m = opts.fromMonth; m <= opts.toMonth; m = addMonthsToKey(m, 1)) {
    const r = byMonth.get(m);
    const incomeCents = r?.income_cents ?? 0;
    const expenseCents = r?.expense_cents ?? 0;
    result.push({ month: m, incomeCents, expenseCents, balanceCents: incomeCents - expenseCents });
  }
  return result;
}

export interface PaymentMethodTotal { paymentMethod: PaymentMethod; totalCents: number; count: number }

/** Total por forma de pagamento num período (padrão: despesas). Transferências ficam de fora. */
export function getPaymentMethodTotals(
  db: SQLiteDatabase, userId: string,
  opts: { from: string; to: string; type?: "income" | "expense"; spreadsheetId?: string },
): Promise<PaymentMethodTotal[]> {
  const params: SQLiteBindValue[] = [userId, opts.type ?? "expense", opts.from, opts.to];
  if (opts.spreadsheetId) params.push(opts.spreadsheetId);

  return db.getAllAsync<PaymentMethodTotal>(
    `SELECT payment_method AS paymentMethod, SUM(amount_cents) AS totalCents, COUNT(*) AS count
       FROM transactions
      WHERE user_id = ? AND deleted_at IS NULL AND type = ?
        AND date >= ? AND date <= ? AND payment_method IS NOT NULL
        ${opts.spreadsheetId ? "AND spreadsheet_id = ?" : ""}
      GROUP BY payment_method
      ORDER BY totalCents DESC`,
    params,
  );
}

export interface TransactionTotals {
  incomeCents: number;
  expenseCents: number;
  balanceCents: number;
  count: number;
}

/** Totais agregados (entradas, saídas, balanço e quantidade) respeitando os mesmos filtros de listagem. */
export async function getTransactionTotals(
  db: SQLiteDatabase,
  userId: string,
  filters: TransactionFilters = {},
): Promise<TransactionTotals> {
  const { sql, params } = buildWhere(userId, filters);
  const row = await db.getFirstAsync<{
    income_cents: number | null;
    expense_cents: number | null;
    total_count: number | null;
  }>(
    `SELECT COALESCE(SUM(CASE WHEN t.type = 'income'  THEN t.amount_cents END), 0) AS income_cents,
            COALESCE(SUM(CASE WHEN t.type = 'expense' THEN t.amount_cents END), 0) AS expense_cents,
            COUNT(*) AS total_count
       FROM transactions t
      WHERE ${sql}`,
    params,
  );
  const incomeCents = row?.income_cents ?? 0;
  const expenseCents = row?.expense_cents ?? 0;
  return {
    incomeCents,
    expenseCents,
    balanceCents: incomeCents - expenseCents,
    count: row?.total_count ?? 0,
  };
}
