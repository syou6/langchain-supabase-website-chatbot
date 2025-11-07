-- sitesテーブルにurl_listカラムを追加
-- 改行区切りのURLリストを保存するため

ALTER TABLE sites 
  ADD COLUMN IF NOT EXISTS url_list text;

-- コメント追加
COMMENT ON COLUMN sites.url_list IS '学習対象のURLリスト（1行に1つのURL、改行区切り）';

