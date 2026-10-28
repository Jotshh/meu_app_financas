// Schema v1. Mudanças futuras entram como SCHEMA_V2 etc. e um novo passo em initDatabase (PRAGMA user_version).

export const SCHEMA_VERSION = 1;

// Colunas comuns a TODAS as tabelas (necessárias para sync + exclusão lógica).
const BASE = `
  id TEXT PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT,
  sync_status TEXT NOT NULL DEFAULT 'pending' CHECK (sync_status IN ('pending','synced','conflict'))`;

export const TABLES = [
  "spreadsheets", "accounts", "categories", "recurring_rules", "transactions",
  "budgets", "tags", "transaction_tags", "attachments",
] as const;

export const SCHEMA_V1 = `
CREATE TABLE IF NOT EXISTS spreadsheets (
  ${BASE},
  name TEXT NOT NULL,
  color TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS accounts (
  ${BASE},
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'checking' CHECK (type IN ('checking','savings','cash','credit_card','investment')),
  initial_balance_cents INTEGER NOT NULL DEFAULT 0,
  color TEXT
);

CREATE TABLE IF NOT EXISTS categories (
  ${BASE},
  name TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('income','expense')),
  color TEXT,
  icon TEXT
);

CREATE TABLE IF NOT EXISTS recurring_rules (
  ${BASE},
  spreadsheet_id TEXT NOT NULL REFERENCES spreadsheets(id),
  account_id TEXT NOT NULL REFERENCES accounts(id),
  to_account_id TEXT REFERENCES accounts(id),
  category_id TEXT REFERENCES categories(id),
  type TEXT NOT NULL CHECK (type IN ('income','expense','transfer')),
  amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
  payment_method TEXT CHECK (payment_method IN ('pix','cartao','a_vista')),
  description TEXT NOT NULL DEFAULT '',
  note TEXT,
  frequency TEXT NOT NULL CHECK (frequency IN ('daily','weekly','monthly','yearly')),
  interval_count INTEGER NOT NULL DEFAULT 1 CHECK (interval_count >= 1),
  start_date TEXT NOT NULL,
  end_date TEXT,
  next_run_date TEXT NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0,1))
);

CREATE TABLE IF NOT EXISTS transactions (
  ${BASE},
  spreadsheet_id TEXT NOT NULL REFERENCES spreadsheets(id),
  account_id TEXT NOT NULL REFERENCES accounts(id),
  to_account_id TEXT REFERENCES accounts(id),
  category_id TEXT REFERENCES categories(id),
  type TEXT NOT NULL CHECK (type IN ('income','expense','transfer')),
  amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
  date TEXT NOT NULL CHECK (date GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'),
  description TEXT NOT NULL DEFAULT '',
  note TEXT,
  payment_method TEXT CHECK (payment_method IN ('pix','cartao','a_vista')),
  installment_group_id TEXT,
  installment_number INTEGER,
  installment_total INTEGER,
  recurring_rule_id TEXT REFERENCES recurring_rules(id),
  CHECK (type <> 'transfer' OR (to_account_id IS NOT NULL AND to_account_id <> account_id)),
  CHECK (type = 'transfer' OR to_account_id IS NULL),
  CHECK (
    (installment_group_id IS NULL AND installment_number IS NULL AND installment_total IS NULL)
    OR (installment_group_id IS NOT NULL AND installment_number IS NOT NULL AND installment_total IS NOT NULL
        AND installment_number BETWEEN 1 AND installment_total)
  )
);

CREATE TABLE IF NOT EXISTS budgets (
  ${BASE},
  category_id TEXT NOT NULL REFERENCES categories(id),
  month TEXT NOT NULL CHECK (month GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]'),
  amount_cents INTEGER NOT NULL CHECK (amount_cents >= 0)
);

CREATE TABLE IF NOT EXISTS tags (
  ${BASE},
  name TEXT NOT NULL COLLATE NOCASE,
  color TEXT
);

CREATE TABLE IF NOT EXISTS transaction_tags (
  ${BASE},
  transaction_id TEXT NOT NULL REFERENCES transactions(id),
  tag_id TEXT NOT NULL REFERENCES tags(id)
);

CREATE TABLE IF NOT EXISTS attachments (
  ${BASE},
  transaction_id TEXT NOT NULL REFERENCES transactions(id),
  file_name TEXT NOT NULL,
  mime_type TEXT,
  size_bytes INTEGER,
  local_uri TEXT,
  remote_path TEXT
);

-- Índices parciais (WHERE deleted_at IS NULL): as consultas do app sempre filtram linhas não excluídas.
CREATE INDEX IF NOT EXISTS idx_tx_user_date    ON transactions(user_id, date)            WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_tx_sheet_date   ON transactions(spreadsheet_id, date)    WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_tx_method_date  ON transactions(payment_method, date)    WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_tx_account      ON transactions(account_id, date)         WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_tx_to_account   ON transactions(to_account_id)            WHERE to_account_id IS NOT NULL AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_tx_category     ON transactions(category_id, date)        WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_tx_installment  ON transactions(installment_group_id, installment_number) WHERE installment_group_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tx_recurring    ON transactions(recurring_rule_id, date)  WHERE recurring_rule_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS ux_budgets_category_month ON budgets(user_id, category_id, month) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS ux_tags_name              ON tags(user_id, name)                  WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS ux_tx_tags_pair           ON transaction_tags(transaction_id, tag_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_tx_tags_tag      ON transaction_tags(tag_id)        WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_attachments_tx   ON attachments(transaction_id)     WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_rules_next_run   ON recurring_rules(next_run_date)  WHERE is_active = 1 AND deleted_at IS NULL;

-- Fila de sync: o que ainda não subiu.
${TABLES.map((t) => `CREATE INDEX IF NOT EXISTS idx_${t}_sync ON ${t}(sync_status) WHERE sync_status <> 'synced';`).join("\n")}
`;
