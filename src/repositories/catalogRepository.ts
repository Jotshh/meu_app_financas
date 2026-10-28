import type { SQLiteDatabase } from "expo-sqlite";
import { insertRow } from "@/src/db/helpers";
import type { AccountRow, AccountType, CategoryRow, SpreadsheetRow } from "@/src/db/types";

// Contas e categorias são GLOBAIS (por usuário). A aba (spreadsheet) só agrupa lançamentos.

export const createSpreadsheet = (db: SQLiteDatabase, userId: string, v: { name: string; color?: string; sortOrder?: number }) =>
  insertRow(db, "spreadsheets", userId, { name: v.name, color: v.color, sort_order: v.sortOrder ?? 0 });

export const createAccount = (
  db: SQLiteDatabase, userId: string,
  v: { name: string; type?: AccountType; initialBalanceCents?: number; color?: string },
) => insertRow(db, "accounts", userId, { name: v.name, type: v.type ?? "checking", initial_balance_cents: v.initialBalanceCents ?? 0, color: v.color });

export const createCategory = (
  db: SQLiteDatabase, userId: string,
  v: { name: string; kind: "income" | "expense"; color?: string; icon?: string },
) => insertRow(db, "categories", userId, { name: v.name, kind: v.kind, color: v.color, icon: v.icon });

export const listSpreadsheets = (db: SQLiteDatabase, userId: string) =>
  db.getAllAsync<SpreadsheetRow>(
    "SELECT * FROM spreadsheets WHERE user_id = ? AND deleted_at IS NULL ORDER BY sort_order, created_at", [userId]);

export const listAccounts = (db: SQLiteDatabase, userId: string) =>
  db.getAllAsync<AccountRow>("SELECT * FROM accounts WHERE user_id = ? AND deleted_at IS NULL ORDER BY name", [userId]);

export const listCategories = (db: SQLiteDatabase, userId: string, kind?: "income" | "expense") =>
  db.getAllAsync<CategoryRow>(
    `SELECT * FROM categories WHERE user_id = ? AND deleted_at IS NULL ${kind ? "AND kind = ?" : ""} ORDER BY name`,
    kind ? [userId, kind] : [userId]);
