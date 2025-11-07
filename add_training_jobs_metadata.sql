-- training_jobsテーブルにmetadataフィールドを追加
-- サイトマップ検出情報などを保存するため

ALTER TABLE training_jobs 
  ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb;

-- コメント追加
COMMENT ON COLUMN training_jobs.metadata IS '学習ジョブのメタデータ（検出されたサイトマップURL、検出方法など）';

