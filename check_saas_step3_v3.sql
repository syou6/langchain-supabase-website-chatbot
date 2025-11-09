-- ============================================
-- WEBGPT.jp SaaS化 v3 マイグレーション確認
-- ============================================

-- 1. users テーブル確認
SELECT 
  'users' as table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;

-- 2. sites テーブルの追加カラム確認
SELECT 
  'sites (new columns)' as table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'sites'
  AND column_name IN ('is_embed_enabled', 'embed_script_id')
ORDER BY ordinal_position;

-- 3. training_jobs テーブルの追加カラム確認
SELECT 
  'training_jobs (new columns)' as table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'training_jobs'
  AND column_name IN ('attempt', 'estimated_cost_usd')
ORDER BY ordinal_position;

-- 4. documents テーブルの追加カラム確認
SELECT 
  'documents (new columns)' as table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'documents'
  AND column_name IN ('version', 'valid_until')
ORDER BY ordinal_position;

-- 5. model_policies テーブル確認
SELECT 
  'model_policies' as table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'model_policies'
ORDER BY ordinal_position;

-- 6. usage_logs テーブル確認
SELECT 
  'usage_logs' as table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'usage_logs'
ORDER BY ordinal_position;

-- 7. デフォルトモデルデータ確認
SELECT 
  name,
  type,
  cost_per_1000_tokens_usd,
  is_default
FROM model_policies
ORDER BY type, is_default DESC;

-- 8. インデックス確認
SELECT 
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND (
    tablename IN ('users', 'model_policies', 'usage_logs')
    OR indexname LIKE '%embed%'
    OR indexname LIKE '%version%'
    OR indexname LIKE '%attempt%'
  )
ORDER BY tablename, indexname;

-- 9. RLSポリシー確認
SELECT 
  tablename,
  policyname,
  cmd as command_type
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('users', 'model_policies', 'usage_logs')
ORDER BY tablename, policyname;

-- 10. 関数確認
SELECT 
  routine_name,
  routine_type,
  data_type as return_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN ('get_monthly_usage', 'check_quota')
ORDER BY routine_name;

-- 11. トリガー確認
SELECT 
  trigger_name,
  event_object_table,
  action_timing,
  event_manipulation
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND (
    trigger_name LIKE '%updated_at%'
    OR event_object_table IN ('users', 'model_policies')
  )
ORDER BY event_object_table, trigger_name;
