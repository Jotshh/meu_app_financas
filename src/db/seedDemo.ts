import type { SQLiteDatabase } from "expo-sqlite";
import { Colors } from "@/src/constants/theme";
import { createAccount, createCategory, createSpreadsheet } from "@/src/repositories/catalogRepository";
import { insertTransaction } from "@/src/repositories/transactionRepository";
import { lastNMonths } from "@/src/lib/dates";

/** Só para desenvolvimento: popula 6 meses de dados se o usuário ainda não tem lançamentos. */
export async function seedDemoData(db: SQLiteDatabase, userId: string): Promise<boolean> {
  const count = await db.getFirstAsync<{ n: number }>(
    "SELECT COUNT(*) AS n FROM transactions WHERE user_id = ? AND deleted_at IS NULL", [userId]);
  if ((count?.n ?? 0) > 0) return false;

  const sheet = await createSpreadsheet(db, userId, { name: "Geral" });
  const nubank = await createAccount(db, userId, { name: "Nubank", type: "checking" });
  const carteira = await createAccount(db, userId, { name: "Carteira", type: "cash" });
  const salario = await createCategory(db, userId, { name: "Salário", kind: "income", color: Colors.success.border });
  const moradia = await createCategory(db, userId, { name: "Moradia", kind: "expense", color: Colors.primary[400] });
  const mercado = await createCategory(db, userId, { name: "Mercado", kind: "expense", color: Colors.primary[500] });
  const transporte = await createCategory(db, userId, { name: "Transporte", kind: "expense", color: Colors.primary[600] });
  const lazer = await createCategory(db, userId, { name: "Lazer", kind: "expense", color: Colors.primary[700] });

  const months = lastNMonths(6);
  const mercadoExtra = [0, 12000, -5000, 20000, 8000, 15000];
  const lazerValores = [9000, 15000, 6000, 22000, 11000, 18000];

  for (let i = 0; i < months.length; i++) {
    const m = months[i];
    const base = { spreadsheetId: sheet, accountId: nubank };
    await insertTransaction(db, userId, { ...base, type: "income", categoryId: salario, amountCents: 450000 + (i % 2) * 50000, date: `${m}-05`, description: "Salário", paymentMethod: "pix" });
    await insertTransaction(db, userId, { ...base, type: "expense", categoryId: moradia, amountCents: 120000, date: `${m}-10`, description: "Aluguel", paymentMethod: "pix" });
    await insertTransaction(db, userId, { ...base, type: "expense", categoryId: mercado, amountCents: 78000 + mercadoExtra[i], date: `${m}-12`, description: "Supermercado", paymentMethod: "cartao" });
    await insertTransaction(db, userId, { ...base, type: "expense", categoryId: transporte, amountCents: 25000 + i * 1500, date: `${m}-18`, description: "Combustível", paymentMethod: "a_vista" });
    await insertTransaction(db, userId, { ...base, type: "expense", categoryId: lazer, amountCents: lazerValores[i], date: `${m}-22`, description: "Lazer", paymentMethod: "pix" });
  }

  // Compra parcelada em 3x no cartão (as 3 parcelas caem nos últimos 3 meses).
  await insertTransaction(db, userId, {
    spreadsheetId: sheet, accountId: nubank, type: "expense", categoryId: lazer,
    amountCents: 240000, date: `${months[3]}-08`, description: "Fone e cadeira", paymentMethod: "cartao", installments: 3,
  });

  // Transferência (fica fora dos totais de receita/despesa).
  await insertTransaction(db, userId, {
    spreadsheetId: sheet, accountId: nubank, toAccountId: carteira, type: "transfer",
    amountCents: 20000, date: `${months[5]}-15`, description: "Saque para a carteira",
  });
  return true;
}
