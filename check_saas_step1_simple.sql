-- ============================================
-- STEP 1 簡易確認用SQL（1つずつ実行）
-- ============================================

-- 【クエリ1】sites テーブルの構造確認
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'sites'
ORDER BY ordinal_position;

-- 【クエリ2】training_jobs テーブルの構造確認
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'training_jobs'
ORDER BY ordinal_position;

-- 【クエリ3】documents テーブルに site_id が追加されたか確認
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'documents'
AND column_name = 'site_id';

-- 【クエリ4】match_documents 関数の確認
SELECT 
  proname as function_name,
  pg_get_function_arguments(oid) as arguments
FROM pg_proc 
WHERE proname = 'match_documents';

-- 【クエリ5】テーブルの行数確認
SELECT 
  'sites' as table_name,
  COUNT(*) as row_count
FROM sites;

SELECT 
  'training_jobs' as table_name,
  COUNT(*) as row_count
FROM training_jobs;

SELECT 
  'documents' as table_name,
  COUNT(*) as total_count,
  COUNT(site_id) as with_site_id,
  COUNT(*) - COUNT(site_id) as without_site_id
FROM documents;

-- 【クエリ6】RLS ポリシーの確認
SELECT 
  tablename,
  policyname,
  cmd
FROM pg_policies 
WHERE tablename IN ('sites', 'training_jobs', 'documents')
ORDER BY tablename, policyname;

