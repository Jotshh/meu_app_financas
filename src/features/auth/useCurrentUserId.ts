import { DEV_USER_ID } from "@/src/constants/dev";

/** TODO(auth): trocar pelo id da sessão do Supabase (session.user.id). Todas as consultas já recebem userId. */
export function useCurrentUserId(): string {
  return DEV_USER_ID;
}
