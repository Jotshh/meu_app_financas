// Datas são guardadas como texto 'YYYY-MM-DD' (dia local, sem fuso) e meses como 'YYYY-MM'.
// Texto nesse formato ordena e compara corretamente com >= e <=, o que permite usar índices.

const pad = (n: number) => String(n).padStart(2, "0");

export function toISODate(d: Date = new Date()): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function monthKey(isoDate: string): string {
  return isoDate.slice(0, 7);
}

/** Soma meses mantendo o dia; se o mês de destino for mais curto, usa o último dia (31/01 + 1 mês = 28/02). */
export function addMonthsClamped(isoDate: string, months: number): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  const idx = m - 1 + months;
  const ny = y + Math.floor(idx / 12);
  const nm = ((idx % 12) + 12) % 12;
  const lastDay = new Date(ny, nm + 1, 0).getDate();
  return `${ny}-${pad(nm + 1)}-${pad(Math.min(d, lastDay))}`;
}

export function addMonthsToKey(key: string, months: number): string {
  return monthKey(addMonthsClamped(`${key}-01`, months));
}

/** Lista de 'YYYY-MM' do mais antigo ao mais recente, terminando em `ref`. */
export function lastNMonths(n: number, ref: Date = new Date()): string[] {
  const current = monthKey(toISODate(ref));
  return Array.from({ length: n }, (_, i) => addMonthsToKey(current, i - (n - 1)));
}

export function monthRange(key: string): { from: string; to: string } {
  return { from: `${key}-01`, to: `${key}-31` };
}

const MONTHS_PT = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
export function monthLabel(key: string): string {
  return MONTHS_PT[Number(key.slice(5, 7)) - 1];
}

/** Divide um total em centavos em N parcelas; a soma é sempre exatamente o total (sobra vai para as primeiras). */
export function splitInstallments(totalCents: number, n: number): number[] {
  const base = Math.floor(totalCents / n);
  const remainder = totalCents - base * n;
  return Array.from({ length: n }, (_, i) => base + (i < remainder ? 1 : 0));
}
