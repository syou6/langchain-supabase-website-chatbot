-- RLSポリシーの簡易確認用SQL
-- このファイルをSupabaseのSQLエディタで実行してください

-- ============================================
-- 1. RLSが有効になっているか確認
-- ============================================
SELECT 
  tablename,
  CASE WHEN rowsecurity THEN '有効' ELSE '無効' END as rls_status
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('sites', 'training_jobs', 'documents')
ORDER BY tablename;

-- ============================================
-- 2. 設定されているポリシーを確認
-- ============================================
SELECT 
  tablename,
  policyname,
  cmd as command_type
FROM pg_policies 
WHERE tablename IN ('sites', 'training_jobs', 'documents')
ORDER BY tablename, policyname;

-- ============================================
-- 3. もしポリシーが表示されない場合
-- ============================================
-- 以下のコマンドでRLSを有効化してください：
-- ALTER TABLE sites ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE training_jobs ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
-- 
-- その後、supabase_rls_policies.sql を実行してください

