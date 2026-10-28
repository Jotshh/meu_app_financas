import type { SQLiteDatabase } from "expo-sqlite";
import { SCHEMA_V1, SCHEMA_VERSION } from "./schema";

export const DATABASE_NAME = "financas.db";

/** Use em <SQLiteProvider onInit={initDatabase}>. Roda toda vez que o banco abre. */
export async function initDatabase(db: SQLiteDatabase): Promise<void> {
  // PRAGMAs de conexão: precisam rodar fora de transação e a cada abertura.
  await db.execAsync("PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;");

  const row = await db.getFirstAsync<{ user_version: number }>("PRAGMA user_version");
  const current = row?.user_version ?? 0;
  if (current >= SCHEMA_VERSION) return;

  await db.withTransactionAsync(async () => {
    if (current < 1) await db.execAsync(SCHEMA_V1);
    // if (current < 2) await db.execAsync(SCHEMA_V2);
    await db.execAsync(`PRAGMA user_version = ${SCHEMA_VERSION}`);
  });
}

export * from "./types";
