-- ============================================
-- STEP 1: SaaS化対応 - Supabaseスキーマ拡張
-- ============================================
-- 既存のSupabaseプロジェクトを拡張して使用
-- 既存のdocumentsテーブルのデータは保持（site_idはNULL）

-- ============================================
-- 1. sites テーブル作成
-- ============================================
CREATE TABLE IF NOT EXISTS sites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  base_url text NOT NULL,
  sitemap_url text,
  status text NOT NULL DEFAULT 'idle' CHECK (status IN ('idle', 'training', 'ready', 'error')),
  last_trained_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_sites_user_id ON sites(user_id);
CREATE INDEX IF NOT EXISTS idx_sites_status ON sites(status);

-- updated_at自動更新トリガー
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_sites_updated_at BEFORE UPDATE ON sites
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 2. training_jobs テーブル作成
-- ============================================
CREATE TABLE IF NOT EXISTS training_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  started_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz,
  total_pages int DEFAULT 0,
  processed_pages int DEFAULT 0,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_training_jobs_site_id ON training_jobs(site_id);
CREATE INDEX IF NOT EXISTS idx_training_jobs_status ON training_jobs(status);
CREATE INDEX IF NOT EXISTS idx_training_jobs_created_at ON training_jobs(created_at DESC);

-- ============================================
-- 3. documents テーブルに site_id カラム追加
-- ============================================
-- 既存のdocumentsテーブルにsite_idを追加（NULL許可）
ALTER TABLE documents 
  ADD COLUMN IF NOT EXISTS site_id uuid REFERENCES sites(id) ON DELETE CASCADE;

-- site_idにインデックス追加
CREATE INDEX IF NOT EXISTS idx_documents_site_id ON documents(site_id);

-- 既存データの確認用コメント
-- 既存のdocumentsレコードはsite_idがNULLのまま
-- 新しいデータからsite_idが設定される

-- ============================================
-- 4. match_documents 関数を site_id 対応に修正
-- ============================================
-- 既存の関数を削除
DROP FUNCTION IF EXISTS match_documents(vector, int, jsonb);
DROP FUNCTION IF EXISTS match_documents(jsonb, int, vector);
DROP FUNCTION IF EXISTS match_documents(vector, int);

-- 新しい関数（site_id対応版）
CREATE FUNCTION match_documents (
  query_embedding vector(512),
  match_count int DEFAULT 10,
  filter jsonb DEFAULT '{}'::jsonb,
  match_site_id uuid DEFAULT NULL
) RETURNS TABLE (
  id bigint,
  content text,
  metadata jsonb,
  similarity float
)
LANGUAGE plpgsql
AS $$
#variable_conflict use_column
BEGIN
  RETURN QUERY
  SELECT
    documents.id,
    documents.content,
    documents.metadata,
    1 - (documents.embedding <=> query_embedding) as similarity
  FROM documents
  WHERE 
    documents.metadata @> filter
    AND (match_site_id IS NULL OR documents.site_id = match_site_id)
  ORDER BY documents.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- ============================================
-- 5. RLS (Row Level Security) ポリシー設定
-- ============================================
-- sitesテーブルのRLS有効化
ALTER TABLE sites ENABLE ROW LEVEL SECURITY;

-- ユーザーは自分のサイトのみ閲覧・操作可能
CREATE POLICY "Users can view their own sites"
  ON sites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sites"
  ON sites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sites"
  ON sites FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sites"
  ON sites FOR DELETE
  USING (auth.uid() = user_id);

-- training_jobsテーブルのRLS有効化
ALTER TABLE training_jobs ENABLE ROW LEVEL SECURITY;

-- ユーザーは自分のサイトのジョブのみ閲覧可能
CREATE POLICY "Users can view training jobs for their sites"
  ON training_jobs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM sites
      WHERE sites.id = training_jobs.site_id
      AND sites.user_id = auth.uid()
    )
  );

-- documentsテーブルのRLS有効化（既存のdocumentsテーブルがある場合）
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- ユーザーは自分のサイトのdocumentsのみ閲覧可能
CREATE POLICY "Users can view documents for their sites"
  ON documents FOR SELECT
  USING (
    site_id IS NULL OR
    EXISTS (
      SELECT 1 FROM sites
      WHERE sites.id = documents.site_id
      AND sites.user_id = auth.uid()
    )
  );

-- ============================================
-- 6. 確認用クエリ
-- ============================================
-- テーブル作成確認
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_schema = 'public' 
-- AND table_name IN ('sites', 'training_jobs', 'documents');

-- 関数確認
-- SELECT proname, pg_get_function_arguments(oid) 
-- FROM pg_proc 
-- WHERE proname = 'match_documents';

