# KDS AI v3.0 Backup

This branch is a rollback snapshot of the KDS-AI repository at the time of backup creation.

## Code snapshot
Branch: `backup/kds-ai-v3.0-working`

## Supabase knowledge snapshot
Project: KDS-AI-v1
Project ref: eopvkwhcgznvubesaszv

The following SQL recreates the current `public.kds_ai_knowledge` rows as they existed when this backup was created.

```sql
CREATE TABLE IF NOT EXISTS public.kds_ai_knowledge (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fact_key text NOT NULL UNIQUE,
  fact_value text NOT NULL,
  source text NOT NULL DEFAULT 'admin',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.kds_ai_knowledge
(id, fact_key, fact_value, source, created_at, updated_at)
VALUES
('df2db1b6-3337-4189-bc57-2414f7d0ef48', 'kaka_ist_lecker', 'kaka ist lecker', 'deleted', '2026-09-23 16:11:11.458785+00', '2026-09-23 16:11:11.458785+00'),
('2c8a988e-f03a-4de7-8745-71ec8541fb3f', 'kostenlose_website_analyse', 'KDS bietet eine kostenlose Website-Analyse nach Anfrage an.', 'deleted', '2026-09-23 15:33:30.694203+00', '2026-09-23 15:33:30.694203+00'),
('204243fb-0841-47f7-8894-e83fa29d6b48', 'testkunden_erhalten_test_email', 'Testkunden erhalten Test email', 'deleted', '2026-09-23 15:49:22.462858+00', '2026-09-23 15:49:22.462858+00')
ON CONFLICT (fact_key) DO UPDATE SET
  fact_value = EXCLUDED.fact_value,
  source = EXCLUDED.source,
  updated_at = EXCLUDED.updated_at;
```

Do not store secrets, API keys, service-role keys, admin passwords, or signing secrets in this backup.
