-- ============================================
-- STEP 1 確認用SQL
-- ============================================

-- 1. sites テーブルの確認
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'sites'
ORDER BY ordinal_position;

-- 2. training_jobs テーブルの確認
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'training_jobs'
ORDER BY ordinal_position;

-- 3. documents テーブルに site_id が追加されたか確認
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'documents'
AND column_name = 'site_id';

-- 4. インデックスの確認
SELECT 
  tablename,
  indexname,
  indexdef
FROM pg_indexes 
WHERE tablename IN ('sites', 'training_jobs', 'documents')
ORDER BY tablename, indexname;

-- 5. match_documents 関数の確認
SELECT 
  proname as function_name,
  pg_get_function_arguments(oid) as arguments,
  pg_get_function_result(oid) as return_type
FROM pg_proc 
WHERE proname = 'match_documents';

-- 6. match_documents 関数の詳細定義確認
SELECT pg_get_functiondef(oid) as function_definition
FROM pg_proc 
WHERE proname = 'match_documents';

-- 7. RLS ポリシーの確認
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename IN ('sites', 'training_jobs', 'documents')
ORDER BY tablename, policyname;

-- 8. テーブルの行数確認（空のテーブルであることを確認）
SELECT 
  'sites' as table_name,
  COUNT(*) as row_count,
  NULL::bigint as documents_with_site_id,
  NULL::bigint as documents_without_site_id
FROM sites
UNION ALL
SELECT 
  'training_jobs' as table_name,
  COUNT(*) as row_count,
  NULL::bigint as documents_with_site_id,
  NULL::bigint as documents_without_site_id
FROM training_jobs
UNION ALL
SELECT 
  'documents' as table_name,
  COUNT(*) as row_count,
  COUNT(site_id) as documents_with_site_id,
  COUNT(*) - COUNT(site_id) as documents_without_site_id
FROM documents;

-- 9. 外部キー制約の確認
SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name IN ('sites', 'training_jobs', 'documents')
ORDER BY tc.table_name, kcu.column_name;

