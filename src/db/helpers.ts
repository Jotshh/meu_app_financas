import type { SQLiteBindValue, SQLiteDatabase } from "expo-sqlite";
import type { TABLES } from "./schema";
import { newId, nowISO } from "./ids";

export type TableName = (typeof TABLES)[number];

/** INSERT que já preenche id, user_id, created_at, updated_at e sync_status='pending'. */
export async function insertRow(
  db: SQLiteDatabase,
  table: TableName,
  userId: string,
  values: Record<string, SQLiteBindValue | undefined>,
): Promise<string> {
  const now = nowISO();
  const id = newId();
  const row: Record<string, SQLiteBindValue> = { id, user_id: userId, created_at: now, updated_at: now, sync_status: "pending" };
  for (const [k, v] of Object.entries(values)) row[k] = v ?? null;

  const cols = Object.keys(row);
  await db.runAsync(
    `INSERT INTO ${table} (${cols.join(", ")}) VALUES (${cols.map(() => "?").join(", ")})`,
    Object.values(row),
  );
  return id;
}
