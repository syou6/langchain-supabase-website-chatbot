# 🧱 SiteGPT.jp SaaS化設計ドキュメント v3

（フェーズ B+: 拡張運用版）

## 📋 概要

このバージョン（v3）は、v2の基本構成に加えて、**運用・拡張・収益化**を見据えた仕様を定義する。

ユーザーが増え、サイト数・チャット数が膨らんでも耐えうるプラットフォームを目指す。

---

## 🧩 1️⃣ データモデル拡張

### 1.1 `users` テーブル（既存 Supabase Auth 外補助用）

※Supabase Auth だけだとメタデータ足りない場合用

| カラム               | 型           | 制約            | 説明                               |
| ----------------- | ----------- | ------------- | -------------------------------- |
| `id`              | uuid        | PRIMARY KEY   | 同じ as auth.users.id              |
| `plan`            | text        | NOT NULL      | 'starter' / 'pro' / 'enterprise' |
| `chat_quota`      | int         | NOT NULL      | 月チャット上限                          |
| `embedding_quota` | int         | NOT NULL      | 月 embedding 上限                   |
| `created_at`      | timestamptz | DEFAULT now() | 作成日時                             |

### 1.2 `sites` テーブル（v2＋追加カラム）

追加カラム：

| カラム                | 型       | 説明           |
| ------------------ | ------- | ------------ |
| `is_embed_enabled` | boolean | 埋め込みJS利用可否   |
| `embed_script_id`  | text    | 埋め込み用スクリプトID |

### 1.3 `training_jobs` テーブル（v2＋追加カラム）

追加：

| カラム                  | 型       | 説明               |
| -------------------- | ------- | ---------------- |
| `attempt`            | int     | リトライ回数           |
| `estimated_cost_usd` | numeric | 学習で想定されるコスト（USD） |

### 1.4 `documents` テーブル

追加：

| カラム           | 型           | 説明            |
| ------------- | ----------- | ------------- |
| `version`     | int         | 埋め込み版のバージョン番号 |
| `valid_until` | timestamptz | 差分更新機能時の有効期限  |

### 1.5 `model_policies` テーブル（新設）

モデル選択やコスト制御用。

| カラム                        | 型       | 説明                                                    |
| -------------------------- | ------- | ----------------------------------------------------- |
| `id`                       | uuid    | 主キー                                                   |
| `name`                     | text    | 'embedding_3_small', 'embedding_3_large', 'local_llm' |
| `type`                     | text    | 'embedding' / 'chat'                                  |
| `cost_per_1000_tokens_usd` | numeric | 単価                                                    |
| `is_default`               | boolean | デフォルトモデルか                                             |

---

## 🧠 2️⃣ API構造拡張

### 2.1 `/api/train/url`（v2＋拡張）

**追加パラメータ**：

```json
{
  "force_retrain": boolean
}
```

**拡張処理**：

* 差分更新モードなら、前回学習日時から更新されたページのみ学習
* `estimated_cost_usd` を `training_jobs` に記録
* キュー方式対応（ジョブ登録後、ワーカーが処理）

### 2.2 `/api/chat`（v2＋改良）

**追加レスポンスフィールド**：

```json
{
  "sources": [ ... ],
  "model_used": "<model_name>",
  "tokens_consumed": {
    "embedding": int,
    "chat": int
  },
  "cost_usd": number
}
```

**機能追加**：

* モデル切替サポート（ユーザーが plan に応じて model_policies から選択）
* チャット回数チェック＆quota超過時はプラン案内

### 2.3 `/api/embed/script`（新設）

**GET**

返却：

```js
// 埋め込みスクリプト
(function(){ /* widget loader for bot */ })();
```

**用途**：

* ユーザーが `<script src=".../embed/script?site_id=..."></script>` を貼るだけ
* `sites.is_embed_enabled` チェック後ロード

### 2.4 `/api/admin/usage`（新設）

**GET**

返却：

* 各テナントの月別チャット数/埋め込み数/コストUSD

  用途：管理者ダッシュボード用

---

## 🔁 3️⃣ UI構造拡張（Next.js）

### `/dashboard/plans`

* プラン比較ページ
* ユーザーが自分のプランを確認・アップグレード申請

### `/dashboard/usage`

* 今月の使用状況（埋め込みトークン数・チャット回数・コストUSD）グラフ表示

### `/dashboard/sites/[siteId]/embed`

* 埋め込みウィジェット設定画面

  * カラー/文字列/ポップアップ/固定チャットボタンなどカスタマイズ可能

---

## 📦 4️⃣ 運用・スケーラビリティ仕様

* **ジョブキュー**：Redis + BullMQ などで `/api/train/url` → キュー → ワーカー処理
* **モニタリング**：Prometheus + Grafanaで「平均チャンク数」「埋め込みトークン数」「チャット応答時間」を追跡
* **ログ保存**：Cloud Logging に「誰がいつどのサイトをどのモデルで使ったか」を記録
* **バックアップ**：Supabaseストレージに毎日 `documents` テーブルダンプ（差分）を保存

---

## 🛡️ 5️⃣ セキュリティ・ガバナンス

* **データ隔離**：RLS により user_id/site_id 限定アクセス
* **アクセスログ**：チャットAPI・学習API呼出毎に `user_id`, `site_id` をログ
* **コスト遮断**：月間埋め込みトークン数・チャット回数超過時は自動「停止」モード
* **プライバシー**：顧客ドメインのデータを暗号化（at-rest AES-256）を想定

---

## 🚀 6️⃣ 差分更新とモデル切替戦略

### 差分更新

* `documents.valid_until` による有効期限管理
* 前回 `last_trained_at` より更新のあった URL のみ再クロール＆埋め込み
* 古チャンクは `version++` または削除可能

### モデル切替

* `model_policies` テーブルでモデル管理
* プラン別に `type`／`cost_per_1000_tokens_usd` を定義
* チャット時に `model_used` をレスポンスに含め、コストを透明化

---

## ✅ 次アクション（v3実行版）

1. `/docs/architecture_v3.md` として保存
2. マイグレーションファイル（Supabase SQL）を v2 → v3 に更新
3. キュー・モニタリング基盤の設計（Redis／BullMQ）を次フェーズとして計画

---

これで **v3完了**。

次は **マイグレーションSQL＋ワーカー仕様書**も出せるから、必要ならそのまま作るね。

