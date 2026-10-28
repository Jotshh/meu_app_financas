import type { PaymentMethod } from "@/src/db/types";
import { Colors } from "@/src/constants/theme";

export const PAYMENT_LABEL: Record<PaymentMethod, string> = { pix: "Pix", cartao: "Cartão", a_vista: "À vista" };

export const PAYMENT_COLOR: Record<PaymentMethod, string> = {
  pix: Colors.primary[100],     // #111111 (cinza escuro)
  cartao: Colors.primary[500],  // #76777A (cinza médio)
  a_vista: Colors.primary[800], // #C8C9CD (cinza claro)
};

export const ACCOUNT_LABEL: Record<AccountType, string> = {
  checking: "Conta corrente",
  savings: "Poupança",
  cash: "Dinheiro / Carteira",
  credit_card: "Cartão de crédito",
  investment: "Investimento",
};
