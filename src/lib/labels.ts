import type { AccountType, PaymentMethod } from "@/src/db/types";
import { Colors } from "@/src/constants/theme";

export const PAYMENT_LABEL: Record<PaymentMethod, string> = { pix: "Pix", cartao: "Cartão", a_vista: "À vista" };

export const PAYMENT_COLOR: Record<PaymentMethod, string> = {
  pix: Colors.info.border,
  cartao: Colors.warning.border,
  a_vista: Colors.success.border,

};

export const ACCOUNT_LABEL: Record<AccountType, string> = {
  checking: "Conta corrente",
  savings: "Poupança",
  cash: "Dinheiro / Carteira",
  credit_card: "Cartão de crédito",
  investment: "Investimento",
};
