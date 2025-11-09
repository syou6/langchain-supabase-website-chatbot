-- ============================================
-- WEBGPT.jp SaaS化 v3 マイグレーション
-- v2 → v3 への拡張
-- ============================================

-- ============================================
-- 1. users テーブル作成（Supabase Auth補助用）
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  plan text NOT NULL DEFAULT 'starter' CHECK (plan IN ('starter', 'pro', 'enterprise')),
  chat_quota int NOT NULL DEFAULT 1000, -- 月チャット上限
  embedding_quota int NOT NULL DEFAULT 100000, -- 月embedding上限（トークン数）
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_users_plan ON users(plan);

-- コメント
COMMENT ON TABLE users IS 'Supabase Auth補助テーブル（プラン・クォータ管理）';
COMMENT ON COLUMN users.plan IS 'プラン種別: starter / pro / enterprise';
COMMENT ON COLUMN users.chat_quota IS '月間チャット上限回数';
COMMENT ON COLUMN users.embedding_quota IS '月間embeddingトークン上限';

-- ============================================
-- 2. sites テーブルにカラム追加
-- ============================================
ALTER TABLE sites 
  ADD COLUMN IF NOT EXISTS is_embed_enabled boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS embed_script_id text;

-- インデックス
CREATE INDEX IF NOT EXISTS idx_sites_embed_enabled ON sites(is_embed_enabled);

-- コメント
COMMENT ON COLUMN sites.is_embed_enabled IS '埋め込みJSウィジェットの利用可否';
COMMENT ON COLUMN sites.embed_script_id IS '埋め込み用スクリプトの一意ID';

-- ============================================
-- 3. training_jobs テーブルにカラム追加
-- ============================================
ALTER TABLE training_jobs 
  ADD COLUMN IF NOT EXISTS attempt int DEFAULT 1,
  ADD COLUMN IF NOT EXISTS estimated_cost_usd numeric(10, 4) DEFAULT 0;

-- インデックス
CREATE INDEX IF NOT EXISTS idx_training_jobs_attempt ON training_jobs(attempt);

-- コメント
COMMENT ON COLUMN training_jobs.attempt IS 'リトライ回数（失敗時の再試行回数）';
COMMENT ON COLUMN training_jobs.estimated_cost_usd IS '学習で想定されるコスト（USD）';

-- ============================================
-- 4. documents テーブルにカラム追加
-- ============================================
ALTER TABLE documents 
  ADD COLUMN IF NOT EXISTS version int DEFAULT 1,
  ADD COLUMN IF NOT EXISTS valid_until timestamptz;

-- インデックス
CREATE INDEX IF NOT EXISTS idx_documents_version ON documents(version);
CREATE INDEX IF NOT EXISTS idx_documents_valid_until ON documents(valid_until);

-- コメント
COMMENT ON COLUMN documents.version IS '埋め込み版のバージョン番号（差分更新用）';
COMMENT ON COLUMN documents.valid_until IS '差分更新機能時の有効期限（NULL=無期限）';

-- ============================================
-- 5. model_policies テーブル作成
-- ============================================
CREATE TABLE IF NOT EXISTS model_policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE, -- 'embedding_3_small', 'embedding_3_large', 'gpt-4o-mini', etc.
  type text NOT NULL CHECK (type IN ('embedding', 'chat')),
  cost_per_1000_tokens_usd numeric(10, 6) NOT NULL DEFAULT 0,
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_model_policies_type ON model_policies(type);
CREATE INDEX IF NOT EXISTS idx_model_policies_is_default ON model_policies(is_default);

-- デフォルトモデルデータを投入
INSERT INTO model_policies (name, type, cost_per_1000_tokens_usd, is_default) VALUES
  ('text-embedding-3-small', 'embedding', 0.02, true), -- $0.02 per 1M tokens
  ('text-embedding-3-large', 'embedding', 0.13, false), -- $0.13 per 1M tokens
  ('gpt-4o-mini', 'chat', 0.15, true), -- $0.15 per 1M input tokens, $0.60 per 1M output tokens
  ('gpt-4o', 'chat', 2.50, false) -- $2.50 per 1M input tokens, $10.00 per 1M output tokens
ON CONFLICT (name) DO NOTHING;

-- コメント
COMMENT ON TABLE model_policies IS 'モデル選択やコスト制御用のポリシーテーブル';
COMMENT ON COLUMN model_policies.name IS 'モデル名（OpenAI API名など）';
COMMENT ON COLUMN model_policies.type IS 'モデル種別: embedding / chat';
COMMENT ON COLUMN model_policies.cost_per_1000_tokens_usd IS '1000トークンあたりのコスト（USD）';
COMMENT ON COLUMN model_policies.is_default IS 'デフォルトモデルかどうか';

-- ============================================
-- 6. usage_logs テーブル作成（アクセスログ）
-- ============================================
CREATE TABLE IF NOT EXISTS usage_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  site_id uuid REFERENCES sites(id) ON DELETE SET NULL,
  action text NOT NULL CHECK (action IN ('chat', 'embedding', 'training')),
  model_name text,
  tokens_consumed int DEFAULT 0,
  cost_usd numeric(10, 6) DEFAULT 0,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_usage_logs_user_id ON usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_site_id ON usage_logs(site_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_action ON usage_logs(action);
CREATE INDEX IF NOT EXISTS idx_usage_logs_created_at ON usage_logs(created_at DESC);

-- パーティション化（月別）を検討（将来的に）
-- CREATE TABLE usage_logs_2024_01 PARTITION OF usage_logs FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

-- コメント
COMMENT ON TABLE usage_logs IS 'アクセスログ（チャット・埋め込み・学習の使用状況を記録）';
COMMENT ON COLUMN usage_logs.action IS 'アクション種別: chat / embedding / training';
COMMENT ON COLUMN usage_logs.tokens_consumed IS '消費トークン数';
COMMENT ON COLUMN usage_logs.cost_usd IS 'コスト（USD）';

-- ============================================
-- 7. RLS (Row Level Security) ポリシー追加
-- ============================================

-- users テーブル
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own profile" ON users;
CREATE POLICY "Users can view their own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON users;
CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- usage_logs テーブル
ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own usage logs" ON usage_logs;
CREATE POLICY "Users can view their own usage logs"
  ON usage_logs FOR SELECT
  USING (auth.uid() = user_id);

-- model_policies テーブル（全員読み取り可能）
ALTER TABLE model_policies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view model policies" ON model_policies;
CREATE POLICY "Anyone can view model policies"
  ON model_policies FOR SELECT
  USING (true);

-- ============================================
-- 8. 関数・トリガー
-- ============================================

-- updated_at を自動更新する関数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- users テーブルの updated_at トリガー
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- sites テーブルの updated_at トリガー（既存の場合はスキップ）
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_sites_updated_at'
  ) THEN
    CREATE TRIGGER update_sites_updated_at
      BEFORE UPDATE ON sites
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- model_policies テーブルの updated_at トリガー
DROP TRIGGER IF EXISTS update_model_policies_updated_at ON model_policies;
CREATE TRIGGER update_model_policies_updated_at
  BEFORE UPDATE ON model_policies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 9. 月間使用量を集計する関数
-- ============================================
CREATE OR REPLACE FUNCTION get_monthly_usage(
  p_user_id uuid,
  p_month date DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  chat_count bigint,
  embedding_tokens bigint,
  total_cost_usd numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) FILTER (WHERE action = 'chat') as chat_count,
    COALESCE(SUM(tokens_consumed) FILTER (WHERE action = 'embedding'), 0) as embedding_tokens,
    COALESCE(SUM(cost_usd), 0) as total_cost_usd
  FROM usage_logs
  WHERE user_id = p_user_id
    AND DATE_TRUNC('month', created_at) = DATE_TRUNC('month', p_month);
END;
$$ LANGUAGE plpgsql;

-- コメント
COMMENT ON FUNCTION get_monthly_usage IS '指定ユーザーの月間使用量を集計';

-- ============================================
-- 10. クォータチェック関数
-- ============================================
CREATE OR REPLACE FUNCTION check_quota(
  p_user_id uuid,
  p_action text
)
RETURNS boolean AS $$
DECLARE
  v_user users%ROWTYPE;
  v_monthly_usage record;
BEGIN
  -- ユーザー情報を取得
  SELECT * INTO v_user FROM users WHERE id = p_user_id;
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- 今月の使用量を取得
  SELECT * INTO v_monthly_usage FROM get_monthly_usage(p_user_id);
  
  -- クォータチェック
  IF p_action = 'chat' THEN
    RETURN v_monthly_usage.chat_count < v_user.chat_quota;
  ELSIF p_action = 'embedding' THEN
    RETURN v_monthly_usage.embedding_tokens < v_user.embedding_quota;
  ELSE
    RETURN false;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- コメント
COMMENT ON FUNCTION check_quota IS 'ユーザーのクォータをチェック（true=利用可能、false=超過）';

-- ============================================
-- 完了メッセージ
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '✅ WEBGPT.jp SaaS化 v3 マイグレーション完了';
  RAISE NOTICE '   追加テーブル: users, model_policies, usage_logs';
  RAISE NOTICE '   拡張テーブル: sites, training_jobs, documents';
  RAISE NOTICE '   関数追加: get_monthly_usage, check_quota';
END $$;
