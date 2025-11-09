

# 🧱 WEBGPT.jp SaaS 化設計ドキュメント v2

（フェーズ B：マルチサイト・マルチユーザー RAG 基盤）

---

## 📋 0. 概要

本ドキュメントは、現行の単一サイト向け RAG システムを拡張し、
「ユーザーが自分の Web サイトを登録・学習・チャットできる」SaaS プラットフォームを構築するための技術仕様を定義する。

本仕様書では、以下のコンポーネントを対象とする：

- **データ層（Supabase）**：スキーマ設計・RLS ポリシー
- **API 層（Next.js API Routes）**：ジョブ管理・学習エンドポイント
- **アプリ層（Next.js フロント）**：ダッシュボード・チャット UI

---

## 🧩 1️⃣ データモデル詳細（Supabase）

### 1.1 `sites` テーブル（サイト登録情報）

| カラム名          | 型            | 制約                                  | 説明                                          |
| ----------------- | ------------- | ------------------------------------- | --------------------------------------------- |
| `id`              | `uuid`        | PRIMARY KEY DEFAULT gen_random_uuid() | サイト ID                                     |
| `user_id`         | `uuid`        | NOT NULL REFERENCES auth.users(id)    | 登録ユーザー                                  |
| `name`            | `text`        | NOT NULL                              | サイト名（例："STRIX 総合型選抜塾"）          |
| `base_url`        | `text`        | NOT NULL                              | クロールの起点 URL                            |
| `sitemap_url`     | `text`        | NULL                                  | 明示的なサイトマップ URL                      |
| `status`          | `text`        | NOT NULL DEFAULT 'idle'               | 状態：`idle` / `training` / `ready` / `error` |
| `last_trained_at` | `timestamptz` | NULL                                  | 最終学習日時                                  |
| `created_at`      | `timestamptz` | DEFAULT now()                         | 作成日時                                      |
| `updated_at`      | `timestamptz` | DEFAULT now()                         | 更新日時                                      |
| `favicon_url`     | `text`        | NULL                                  | 表示用アイコン URL（UI 用）                   |
| `pages_count`     | `int`         | NULL                                  | 最終学習ページ数                              |

#### インデックス

```sql
create index idx_sites_user_id on sites(user_id);
```

#### RLS ポリシー

```sql
alter table sites enable row level security;

create policy "Allow site owner full access"
on sites for all
using (auth.uid() = user_id);
```

---

### 1.2 `training_jobs` テーブル（学習ジョブ履歴）

| カラム名          | 型            | 制約                                            | 説明                                                 |
| ----------------- | ------------- | ----------------------------------------------- | ---------------------------------------------------- |
| `id`              | `uuid`        | PRIMARY KEY DEFAULT gen_random_uuid()           | ジョブ ID                                            |
| `site_id`         | `uuid`        | NOT NULL REFERENCES sites(id) ON DELETE CASCADE | 紐づくサイト                                         |
| `status`          | `text`        | NOT NULL DEFAULT 'pending'                      | 状態：`pending` / `running` / `completed` / `failed` |
| `started_at`      | `timestamptz` | DEFAULT now()                                   | 開始時刻                                             |
| `finished_at`     | `timestamptz` | NULL                                            | 終了時刻                                             |
| `total_pages`     | `int`         | NULL                                            | 全ページ数                                           |
| `processed_pages` | `int`         | NULL                                            | 処理済みページ数                                     |
| `error_message`   | `text`        | NULL                                            | エラーログ                                           |
| `created_at`      | `timestamptz` | DEFAULT now()                                   | 作成日時                                             |

#### インデックス

```sql
create index idx_training_jobs_site_id on training_jobs(site_id);
```

#### RLS ポリシー

```sql
alter table training_jobs enable row level security;

create policy "Users can access jobs for their sites"
on training_jobs for all
using (
  exists (
    select 1 from sites s
    where s.id = training_jobs.site_id
    and s.user_id = auth.uid()
  )
);
```

---

### 1.3 `documents` テーブル（RAG ベクトルデータ）

既存テーブルに以下を追加：

| カラム名  | 型     | 制約                                            | 説明               |
| --------- | ------ | ----------------------------------------------- | ------------------ |
| `site_id` | `uuid` | NULLABLE REFERENCES sites(id) ON DELETE CASCADE | どのサイトの文書か |

#### インデックス

```sql
create index idx_documents_site_id on documents(site_id);
```

#### RLS ポリシー

```sql
alter table documents enable row level security;

create policy "Users can read their own site's documents"
on documents for select
using (
  exists (
    select 1 from sites s
    where s.id = documents.site_id
    and s.user_id = auth.uid()
  )
);
```

---

### 1.4 `match_documents` 関数の改修

既存：

```sql
create function match_documents(query_embedding vector(1536), match_count int)
returns table (...)
```

改修：

```sql
create or replace function match_documents(
  query_embedding vector(1536),
  match_count int,
  target_site uuid
)
returns table (
  id uuid,
  content text,
  metadata jsonb,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select d.id, d.content, d.metadata,
         1 - (d.embedding <=> query_embedding) as similarity
  from documents d
  where d.site_id = target_site
  order by d.embedding <=> query_embedding
  limit match_count;
end;
$$;
```

---

## 🧠 2️⃣ API 仕様（Next.js /api）

### 2.1 `/api/sites`

| メソッド | 概要                   | 処理内容                                            |
| -------- | ---------------------- | --------------------------------------------------- |
| GET      | 自分のサイト一覧を取得 | Supabase Auth 経由で `user_id` に紐づくサイトを返す |
| POST     | 新規サイト登録         | body に `{ name, baseUrl, sitemapUrl }`             |
| PUT      | サイト情報更新         | `/api/sites/[siteId]` 経由                          |
| DELETE   | サイト削除             | 関連する documents, jobs 自動削除（CASCADE）        |

---

### 2.2 `/api/train/url`

#### POST

サイト学習を開始する API。

**リクエスト例：**

```json
{
  "site_id": "xxxx-xxxx",
  "baseUrl": "https://strix-sougougata.com/"
}
```

**ロジック詳細：**

1. Supabase 更新：

   - `sites.status = 'training'`
   - `training_jobs.insert(status='pending')`

2. 非同期ジョブ開始：

   - Sitemap or Base URL から URL リスト生成
   - 各ページを Cheerio で HTML→ テキスト抽出
   - Embedding 生成（text-embedding-3-small）
   - `documents.insert(site_id, content, embedding)`

3. 処理完了後：

   - `sites.status = 'ready'`
   - `training_jobs.status = 'completed'`
   - `sites.last_trained_at = now()`

**レスポンス例：**

```json
{
  "job_id": "xxxx-xxxx",
  "status": "running",
  "message": "Training started for site_id xxxx"
}
```

**エラーハンドリング：**

- Sitemap 取得失敗 → `status: failed`, `error_message` 保存
- Embedding API 失敗 → リトライ最大 3 回
- Supabase エラー → `training_jobs.status='failed'`

---

### 2.3 `/api/chat`

#### POST

チャット処理を行う。`site_id` ごとに異なる RAG データを参照。

**Request:**

```json
{
  "site_id": "xxxx-xxxx",
  "question": "STRIXのコースの違いは？"
}
```

**内部処理:**

1. `match_documents(query_embedding, 5, site_id)` 実行
2. 上位 5 件の content をコンテキストとしてまとめる
3. GPT-4o-mini へ投げる
4. 回答とソースリンクを返す

**Response:**

```json
{
  "answer": "...",
  "sources": [
    "https://strix-sougougata.com/course",
    "https://strix-sougougata.com/message"
  ]
}
```

---

## 💬 3️⃣ フロント構造（Next.js + Tailwind）

### `/dashboard`

- サイト一覧カード表示

  - ステータスバッジ（Training / Ready / Error）
  - 「学習開始」ボタン → `/api/train/url` POST

- 新規サイト登録フォーム（Modal）
- Supabase Realtime を使ってステータスをライブ更新可能

### `/dashboard/[siteId]`

- サイト別チャット画面
- クエリに `site_id` 付きでチャット呼び出し
- 右カラムに「学習履歴（training_jobs）」表示

---

## 🔁 4️⃣ フロー概要

```mermaid
flowchart TD
    A[ユーザー:サイト登録] --> B[sites テーブルに挿入]
    B --> C[学習ボタン押下 (/api/train/url)]
    C --> D[training_jobsにpending登録]
    D --> E[HTMLクロール & Embedding生成]
    E --> F[documentsに保存 (site_id紐付け)]
    F --> G[sites.status=ready更新]
    G --> H[チャットUIで利用可能]
```

---

## ⚙️ 5️⃣ 将来拡張（v3 以降）

| 機能                    | 内容                                                 |
| ----------------------- | ---------------------------------------------------- |
| 🔄 差分更新             | 前回学習との差分検出し再学習                         |
| 🧮 埋め込みモデル切替   | `text-embedding-3-large` や `bge-small` への動的切替 |
| 📦 埋め込み JS          | `<script>` タグ 1 行でボットを埋め込む機能           |
| 💰 Stripe 連携          | サイト数・チャット数による課金                       |
| 🧑‍💼 管理者ダッシュボード | サイト全体の利用状況可視化                           |

---
