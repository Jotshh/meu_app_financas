/** Todo valor monetário do app é inteiro em centavos. Converta só na borda (UI / gráficos). */
export const toCents = (reais: number): number => Math.round(reais * 100);
export const toReais = (cents: number): number => cents / 100;

export function formatBRL(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/** 1250 -> "1,3k" para eixos de gráfico (recebe reais). */
export function compactReais(reais: number): string {
  if (Math.abs(reais) >= 1000) return `${(reais / 1000).toFixed(1).replace(".", ",").replace(",0", "")}k`;
  return String(Math.round(reais));
}
