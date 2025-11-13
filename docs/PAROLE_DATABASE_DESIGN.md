# 🗄️ Parole データベース設計書

## 概要

Parole機能で使用するデータベーステーブルと関数の詳細設計です。

---

## 1. テーブル設計

### **1.1 chat_logs テーブル**

チャットボットの質問と回答を保存するメインテーブルです。

#### **テーブル定義**

```sql
CREATE TABLE chat_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  site_id uuid REFERENCES sites(id) ON DELETE SET NULL,
  
  -- 質問と回答
  question text NOT NULL,
  answer text NOT NULL,
  
  -- メタデータ
  session_id text,
  source text DEFAULT 'embed' CHECK (source IN ('embed', 'dashboard')),
  user_agent text,
  referrer text,
  
  -- タグ（将来的に拡張）
  tags jsonb DEFAULT '[]'::jsonb,
  
  -- ベクトル（Phase 2で追加）
  question_embedding vector(512),
  
  -- クラスタリング（Phase 2で追加）
  cluster_id uuid,
  
  created_at timestamptz DEFAULT now()
);
```

#### **カラム詳細**

| カラム名 | 型 | NULL許可 | 説明 |
|---------|-----|---------|------|
| `id` | uuid | ❌ | プライマリキー |
| `user_id` | uuid | ❌ | ユーザーID（外部キー） |
| `site_id` | uuid | ✅ | サイトID（外部キー） |
| `question` | text | ❌ | ユーザーの質問内容 |
| `answer` | text | ❌ | AIの回答内容 |
| `session_id` | text | ✅ | セッションID（購入前/後判定用） |
| `source` | text | ❌ | 質問の発生元（'embed' or 'dashboard'） |
| `user_agent` | text | ✅ | ユーザーエージェント |
| `referrer` | text | ✅ | リファラー |
| `tags` | jsonb | ❌ | タグ配列（例: ["購入前", "価格"]） |
| `question_embedding` | vector(512) | ✅ | 質問のベクトル表現（Phase 2） |
| `cluster_id` | uuid | ✅ | クラスタID（Phase 2） |
| `created_at` | timestamptz | ❌ | 作成日時 |

#### **インデックス**

```sql
-- ユーザーIDでの検索
CREATE INDEX idx_chat_logs_user_id ON chat_logs(user_id);

-- サイトIDでの検索
CREATE INDEX idx_chat_logs_site_id ON chat_logs(site_id);

-- 作成日時でのソート
CREATE INDEX idx_chat_logs_created_at ON chat_logs(created_at DESC);

-- セッションIDでの検索
CREATE INDEX idx_chat_logs_session_id ON chat_logs(session_id);

-- クラスタIDでの検索（Phase 2）
CREATE INDEX idx_chat_logs_cluster_id ON chat_logs(cluster_id);

-- 発生元での検索
CREATE INDEX idx_chat_logs_source ON chat_logs(source);

-- 全文検索用（日本語）
CREATE INDEX idx_chat_logs_question_search 
  ON chat_logs USING gin(to_tsvector('japanese', question));

-- ベクトル検索用（Phase 2）
CREATE INDEX idx_chat_logs_embedding 
  ON chat_logs USING ivfflat (question_embedding vector_cosine_ops)
  WITH (lists = 100);
```

#### **RLS（Row Level Security）ポリシー**

```sql
-- ユーザーは自分のサイトのログのみ閲覧可能
CREATE POLICY "Users can view their own chat logs"
  ON chat_logs FOR SELECT
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM sites
      WHERE sites.id = chat_logs.site_id
      AND sites.user_id = auth.uid()
    )
  );

-- システム（API）のみログを挿入可能
CREATE POLICY "System can insert chat logs"
  ON chat_logs FOR INSERT
  WITH CHECK (true);

-- ユーザーは自分のログを更新可能
CREATE POLICY "Users can update their own chat logs"
  ON chat_logs FOR UPDATE
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM sites
      WHERE sites.id = chat_logs.site_id
      AND sites.user_id = auth.uid()
    )
  );
```

---

### **1.2 question_clusters テーブル（Phase 2）**

類似質問のクラスタ情報を保存するテーブルです。

#### **テーブル定義**

```sql
CREATE TABLE question_clusters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  
  -- クラスタ情報
  representative_question text NOT NULL,
  question_count int DEFAULT 0,
  
  -- メタデータ
  keywords text[],
  category text,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

#### **カラム詳細**

| カラム名 | 型 | NULL許可 | 説明 |
|---------|-----|---------|------|
| `id` | uuid | ❌ | プライマリキー |
| `site_id` | uuid | ❌ | サイトID（外部キー） |
| `representative_question` | text | ❌ | 代表質問 |
| `question_count` | int | ❌ | このクラスタに属する質問数 |
| `keywords` | text[] | ✅ | 抽出されたキーワード配列 |
| `category` | text | ✅ | カテゴリ（価格、機能、使い方など） |
| `created_at` | timestamptz | ❌ | 作成日時 |
| `updated_at` | timestamptz | ❌ | 更新日時 |

#### **インデックス**

```sql
CREATE INDEX idx_question_clusters_site_id ON question_clusters(site_id);
CREATE INDEX idx_question_clusters_question_count ON question_clusters(question_count DESC);
CREATE INDEX idx_question_clusters_category ON question_clusters(category);
```

#### **外部キー制約**

```sql
-- chat_logsテーブルとの関連付け（Phase 2で追加）
ALTER TABLE chat_logs
  ADD CONSTRAINT fk_chat_logs_cluster_id
  FOREIGN KEY (cluster_id) REFERENCES question_clusters(id) ON DELETE SET NULL;
```

---

## 2. 関数設計

### **2.1 get_question_ranking**

質問ランキングを取得する関数です。

#### **関数定義**

```sql
CREATE OR REPLACE FUNCTION get_question_ranking(
  p_site_id uuid,
  p_start_date timestamptz DEFAULT NULL,
  p_end_date timestamptz DEFAULT NULL,
  p_limit int DEFAULT 10
)
RETURNS TABLE (
  question text,
  count bigint,
  first_asked_at timestamptz,
  last_asked_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cl.question,
    COUNT(*)::bigint as count,
    MIN(cl.created_at) as first_asked_at,
    MAX(cl.created_at) as last_asked_at
  FROM chat_logs cl
  WHERE cl.site_id = p_site_id
    AND (p_start_date IS NULL OR cl.created_at >= p_start_date)
    AND (p_end_date IS NULL OR cl.created_at <= p_end_date)
  GROUP BY cl.question
  ORDER BY count DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### **パラメータ**

| パラメータ | 型 | 必須 | 説明 |
|---------|-----|------|------|
| `p_site_id` | uuid | ✅ | サイトID |
| `p_start_date` | timestamptz | ❌ | 開始日時 |
| `p_end_date` | timestamptz | ❌ | 終了日時 |
| `p_limit` | int | ❌ | 取得件数（デフォルト: 10） |

#### **戻り値**

| カラム名 | 型 | 説明 |
|---------|-----|------|
| `question` | text | 質問内容 |
| `count` | bigint | 質問数 |
| `first_asked_at` | timestamptz | 初回質問日時 |
| `last_asked_at` | timestamptz | 最終質問日時 |

---

### **2.2 get_keyword_frequency**

キーワード出現頻度を取得する関数です。

#### **関数定義**

```sql
CREATE OR REPLACE FUNCTION get_keyword_frequency(
  p_site_id uuid,
  p_start_date timestamptz DEFAULT NULL,
  p_end_date timestamptz DEFAULT NULL,
  p_limit int DEFAULT 20
)
RETURNS TABLE (
  keyword text,
  count bigint
) AS $$
BEGIN
  RETURN QUERY
  WITH words AS (
    SELECT unnest(string_to_array(
      lower(regexp_replace(cl.question, '[^\w\s]', '', 'g')), 
      ' '
    )) as word
    FROM chat_logs cl
    WHERE cl.site_id = p_site_id
      AND (p_start_date IS NULL OR cl.created_at >= p_start_date)
      AND (p_end_date IS NULL OR cl.created_at <= p_end_date)
      AND length(cl.question) > 0
  ),
  filtered_words AS (
    SELECT word
    FROM words
    WHERE length(word) > 2
      AND word NOT IN (
        'の', 'は', 'を', 'に', 'が', 'と', 'で', 'も', 'から', 'まで', 
        'より', 'など', 'について', 'です', 'ます', 'する', 'した', 
        'ある', 'ない', 'する', 'する', 'する'
      )
  )
  SELECT 
    word as keyword,
    COUNT(*)::bigint as count
  FROM filtered_words
  GROUP BY word
  ORDER BY count DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### **パラメータ**

| パラメータ | 型 | 必須 | 説明 |
|---------|-----|------|------|
| `p_site_id` | uuid | ✅ | サイトID |
| `p_start_date` | timestamptz | ❌ | 開始日時 |
| `p_end_date` | timestamptz | ❌ | 終了日時 |
| `p_limit` | int | ❌ | 取得件数（デフォルト: 20） |

#### **戻り値**

| カラム名 | 型 | 説明 |
|---------|-----|------|
| `keyword` | text | キーワード |
| `count` | bigint | 出現回数 |

---

### **2.3 get_question_timeline**

時系列データを取得する関数です。

#### **関数定義**

```sql
CREATE OR REPLACE FUNCTION get_question_timeline(
  p_site_id uuid,
  p_start_date timestamptz DEFAULT NULL,
  p_end_date timestamptz DEFAULT NULL,
  p_interval text DEFAULT 'day'
)
RETURNS TABLE (
  period_start timestamptz,
  question_count bigint
) AS $$
DECLARE
  v_interval_expression text;
BEGIN
  CASE p_interval
    WHEN 'day' THEN
      v_interval_expression := 'date_trunc(''day'', created_at)';
    WHEN 'week' THEN
      v_interval_expression := 'date_trunc(''week'', created_at)';
    WHEN 'month' THEN
      v_interval_expression := 'date_trunc(''month'', created_at)';
    ELSE
      v_interval_expression := 'date_trunc(''day'', created_at)';
  END CASE;

  RETURN QUERY
  EXECUTE format('
    SELECT 
      %s as period_start,
      COUNT(*)::bigint as question_count
    FROM chat_logs
    WHERE site_id = $1
      AND ($2 IS NULL OR created_at >= $2)
      AND ($3 IS NULL OR created_at <= $3)
    GROUP BY period_start
    ORDER BY period_start ASC
  ', v_interval_expression)
  USING p_site_id, p_start_date, p_end_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### **パラメータ**

| パラメータ | 型 | 必須 | 説明 |
|---------|-----|------|------|
| `p_site_id` | uuid | ✅ | サイトID |
| `p_start_date` | timestamptz | ❌ | 開始日時 |
| `p_end_date` | timestamptz | ❌ | 終了日時 |
| `p_interval` | text | ❌ | 集計間隔（'day', 'week', 'month'） |

#### **戻り値**

| カラム名 | 型 | 説明 |
|---------|-----|------|
| `period_start` | timestamptz | 期間の開始日時 |
| `question_count` | bigint | 質問数 |

---

## 3. パフォーマンス最適化

### **3.1 パーティション化（将来実装）**

大量のログが蓄積される場合、月別パーティション化を検討します。

```sql
-- パーティション化の例（将来実装）
CREATE TABLE chat_logs_2024_12 PARTITION OF chat_logs
  FOR VALUES FROM ('2024-12-01') TO ('2025-01-01');
```

### **3.2 アーカイブ戦略**

古いログは別テーブルにアーカイブすることを検討します。

```sql
-- アーカイブテーブル（将来実装）
CREATE TABLE chat_logs_archive (
  LIKE chat_logs INCLUDING ALL
);
```

---

## 4. データ整合性

### **4.1 外部キー制約**

```sql
-- user_idはauth.usersを参照
ALTER TABLE chat_logs
  ADD CONSTRAINT fk_chat_logs_user_id
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- site_idはsitesを参照
ALTER TABLE chat_logs
  ADD CONSTRAINT fk_chat_logs_site_id
  FOREIGN KEY (site_id) REFERENCES sites(id) ON DELETE SET NULL;
```

### **4.2 チェック制約**

```sql
-- sourceは'embed'または'dashboard'のみ許可
ALTER TABLE chat_logs
  ADD CONSTRAINT chk_chat_logs_source
  CHECK (source IN ('embed', 'dashboard'));
```

---

## 5. マイグレーション手順

1. **テーブル作成**
   ```bash
   psql -h <host> -U postgres -d postgres -f supabase/migrations/20241201_add_chat_logs.sql
   ```

2. **インデックス作成**
   - マイグレーションファイルに含まれています

3. **RLSポリシー設定**
   - マイグレーションファイルに含まれています

4. **関数作成**
   - マイグレーションファイルに含まれています

5. **動作確認**
   ```sql
   -- テーブルが作成されたか確認
   SELECT * FROM chat_logs LIMIT 1;
   
   -- 関数が作成されたか確認
   SELECT proname FROM pg_proc WHERE proname LIKE 'get_question%';
   ```

---

## 6. データモデル図

```
┌─────────────┐
│ auth.users  │
└──────┬──────┘
       │
       │ 1:N
       │
┌──────▼──────────┐      ┌──────────────┐
│   chat_logs     │──────│    sites     │
├─────────────────┤ N:1  ├──────────────┤
│ id              │      │ id           │
│ user_id (FK)    │      │ name         │
│ site_id (FK)    │      │ base_url     │
│ question        │      └──────────────┘
│ answer          │
│ session_id      │
│ source          │
│ tags            │
│ created_at      │
└─────────────────┘
       │
       │ N:1 (Phase 2)
       │
┌──────▼──────────────┐
│ question_clusters   │
├─────────────────────┤
│ id                  │
│ site_id (FK)        │
│ representative_q    │
│ question_count      │
│ keywords            │
│ category            │
└─────────────────────┘
```

---

## 7. 実装チェックリスト

- [ ] `chat_logs`テーブルの作成
- [ ] インデックスの作成
- [ ] RLSポリシーの設定
- [ ] `get_question_ranking`関数の作成
- [ ] `get_keyword_frequency`関数の作成
- [ ] `get_question_timeline`関数の作成
- [ ] 外部キー制約の設定
- [ ] チェック制約の設定
- [ ] 動作確認テストの実行

