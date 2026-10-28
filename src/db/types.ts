export type TransactionType = "income" | "expense" | "transfer";
export type PaymentMethod = "pix" | "cartao" | "a_vista";
export type SyncStatus = "pending" | "synced" | "conflict";
export type AccountType = "checking" | "savings" | "cash" | "credit_card" | "investment";
export type RecurrenceFrequency = "daily" | "weekly" | "monthly" | "yearly";

export interface BaseRow {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  sync_status: SyncStatus;
}

export interface SpreadsheetRow extends BaseRow { name: string; color: string | null; sort_order: number }
export interface AccountRow extends BaseRow { name: string; type: AccountType; initial_balance_cents: number; color: string | null }
export interface CategoryRow extends BaseRow { name: string; kind: "income" | "expense"; color: string | null; icon: string | null }

export interface TransactionRow extends BaseRow {
  spreadsheet_id: string;
  account_id: string;
  to_account_id: string | null;
  category_id: string | null;
  type: TransactionType;
  amount_cents: number;
  date: string; // 'YYYY-MM-DD'
  description: string;
  note: string | null;
  payment_method: PaymentMethod | null;
  installment_group_id: string | null;
  installment_number: number | null;
  installment_total: number | null;
  recurring_rule_id: string | null;
}

export interface TransactionListItem extends TransactionRow {
  category_name: string | null;
  category_color: string | null;
  account_name: string;
  to_account_name: string | null;
}
