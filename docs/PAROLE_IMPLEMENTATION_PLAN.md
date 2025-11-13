# 🚀 Parole機能実装計画書

## 📋 概要

Paroleは「顧客インサイト収集エンジン」として、チャットボットの質問ログからプロダクト改善に直結するナレッジを抽出する機能を提供します。

---

## 🎯 実装可能な機能（優先度順）

### ✅ **Phase 1: MVP（最小実装）** - 2-3週間で実装可能

#### 1. **チャットログの保存機能**
- **実装難易度**: ⭐⭐ (低)
- **技術スタック**: Supabase + PostgreSQL
- **内容**:
  - `chat_logs`テーブルを作成
  - 質問と回答を自動保存
  - 購入前/購入後のタグ付け（将来的に拡張可能）

#### 2. **質問ランキング機能**
- **実装難易度**: ⭐⭐ (低)
- **技術スタック**: PostgreSQL + Next.js API
- **内容**:
  - 週間/月間の質問数ランキング
  - キーワード出現頻度の可視化
  - シンプルなSQL集計で実現可能

#### 3. **基本的なダッシュボードUI**
- **実装難易度**: ⭐⭐⭐ (中)
- **技術スタック**: React + Tailwind CSS
- **内容**:
  - 質問ランキング表示
  - キーワードクラウド（簡易版）
  - 時系列グラフ（週/月の質問数推移）

---

### ✅ **Phase 2: 中級機能** - 3-4週間で実装可能

#### 4. **類似質問クラスタリング**
- **実装難易度**: ⭐⭐⭐⭐ (高)
- **技術スタック**: OpenAI Embeddings + PostgreSQL + pgvector
- **内容**:
  - 質問をベクトル化して保存
  - 類似度計算による自動クラスタリング
  - クラスタごとの質問数と代表質問の表示

#### 5. **購入前/購入後分析**
- **実装難易度**: ⭐⭐⭐ (中)
- **技術スタック**: PostgreSQL + タグ付けロジック
- **内容**:
  - ユーザーセッションの追跡
  - 購入前後の質問パターンの比較
  - コンバージョンに影響する質問の特定

#### 6. **CSVエクスポート機能**
- **実装難易度**: ⭐⭐ (低)
- **技術スタック**: Next.js API + CSV生成ライブラリ
- **内容**:
  - 質問ログの一括エクスポート
  - フィルタリング機能（期間、サイト、クラスタ）

---

### ✅ **Phase 3: 高度な機能** - 4-6週間で実装可能

#### 7. **AIによる改善提案**
- **実装難易度**: ⭐⭐⭐⭐⭐ (非常に高)
- **技術スタック**: OpenAI GPT-4 + LangChain
- **内容**:
  - LP改善ポイントの自動抽出
  - 質問パターンから価格戦略の提案
  - 開発ロードマップの優先順位付け

#### 8. **Slack / Notion連携**
- **実装難易度**: ⭐⭐⭐⭐ (高)
- **技術スタック**: Webhook + API連携
- **内容**:
  - 週次レポートの自動送信
  - 重要な質問の通知
  - Notionデータベースへの自動同期

#### 9. **マルチユーザー共有**
- **実装難易度**: ⭐⭐⭐ (中)
- **技術スタック**: Supabase RLS + 権限管理
- **内容**:
  - チームメンバーの追加
  - 閲覧権限の管理
  - コメント機能

---

## 🗄️ データベース設計

### 1. `chat_logs` テーブル

```sql
CREATE TABLE chat_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  site_id uuid REFERENCES sites(id) ON DELETE SET NULL,
  
  -- 質問と回答
  question text NOT NULL,
  answer text NOT NULL,
  
  -- メタデータ
  session_id text, -- セッション追跡用（将来的に購入前/後判定に使用）
  source text DEFAULT 'embed' CHECK (source IN ('embed', 'dashboard')), -- 質問の発生元
  user_agent text, -- ユーザーエージェント
  referrer text, -- リファラー
  
  -- タグ（将来的に拡張）
  tags jsonb DEFAULT '[]'::jsonb, -- ['購入前', '価格', '機能'] など
  
  -- ベクトル（Phase 2で追加）
  question_embedding vector(512), -- OpenAI text-embedding-3-small
  
  -- クラスタリング（Phase 2で追加）
  cluster_id uuid REFERENCES question_clusters(id) ON DELETE SET NULL,
  
  created_at timestamptz DEFAULT now()
);

-- インデックス
CREATE INDEX idx_chat_logs_user_id ON chat_logs(user_id);
CREATE INDEX idx_chat_logs_site_id ON chat_logs(site_id);
CREATE INDEX idx_chat_logs_created_at ON chat_logs(created_at DESC);
CREATE INDEX idx_chat_logs_session_id ON chat_logs(session_id);
CREATE INDEX idx_chat_logs_cluster_id ON chat_logs(cluster_id);

-- ベクトル検索用インデックス（Phase 2）
CREATE INDEX idx_chat_logs_embedding ON chat_logs USING ivfflat (question_embedding vector_cosine_ops);
```

### 2. `question_clusters` テーブル（Phase 2）

```sql
CREATE TABLE question_clusters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid REFERENCES sites(id) ON DELETE CASCADE,
  
  -- クラスタ情報
  representative_question text NOT NULL, -- 代表質問
  question_count int DEFAULT 0, -- このクラスタに属する質問数
  
  -- メタデータ
  keywords text[], -- 抽出されたキーワード
  category text, -- カテゴリ（価格、機能、使い方など）
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_question_clusters_site_id ON question_clusters(site_id);
CREATE INDEX idx_question_clusters_question_count ON question_clusters(question_count DESC);
```

---

## 🔧 実装の進め方

### **Step 1: データベーススキーマ作成** (1-2日)

1. `chat_logs`テーブルの作成
2. RLS（Row Level Security）ポリシーの設定
3. マイグレーションファイルの作成

### **Step 2: チャットAPI修正** (2-3日)

1. `/api/chat` と `/api/embed/chat` を修正
2. 質問と回答を`chat_logs`テーブルに保存
3. セッションIDの生成と追跡

### **Step 3: 分析API作成** (3-5日)

1. `/api/insights/questions` - 質問ランキング
2. `/api/insights/keywords` - キーワード抽出
3. `/api/insights/trends` - 時系列分析

### **Step 4: ダッシュボードUI作成** (5-7日)

1. `/dashboard/[siteId]/insights` ページ作成
2. 質問ランキング表示
3. キーワードクラウド（簡易版）
4. 時系列グラフ

### **Step 5: クラスタリング機能** (7-10日)

1. 質問のベクトル化処理
2. 類似度計算とクラスタリング
3. クラスタ表示UI

---

## 💡 現実的な実装スコープ

### **今すぐ実装可能（1-2週間）**

✅ **チャットログの保存**
- 質問と回答をデータベースに保存
- 基本的な検索・フィルタリング

✅ **質問ランキング**
- 週間/月間の質問数ランキング
- シンプルなキーワード抽出（文字列マッチング）

✅ **基本的なダッシュボード**
- 質問一覧表示
- ランキング表示
- 期間フィルタ

### **1-2ヶ月で実装可能**

✅ **類似質問クラスタリング**
- OpenAI Embeddingsを使用
- 自動クラスタリング
- クラスタ表示

✅ **購入前/購入後分析**
- セッション追跡
- タグ付け機能
- 比較分析

✅ **CSVエクスポート**
- データエクスポート機能
- フィルタリング

### **3-6ヶ月で実装可能**

✅ **AI改善提案**
- GPT-4を使用した分析
- LP改善提案
- 自動レポート生成

✅ **外部連携**
- Slack連携
- Notion連携
- メール通知

---

## 🎨 UI/UX設計のポイント

### **ダッシュボードの構成**

```
/dashboard/[siteId]/insights
├── 概要カード
│   ├── 今週の質問数
│   ├── 今月の質問数
│   └── 最も多い質問カテゴリ
├── 質問ランキング
│   ├── 週間TOP10
│   └── 月間TOP10
├── キーワード分析
│   ├── キーワードクラウド
│   └── キーワードランキング
├── 時系列グラフ
│   └── 質問数の推移（週/月）
└── 質問クラスタ（Phase 2）
    ├── クラスタ一覧
    └── 各クラスタの詳細
```

### **デザイン方針**

- **Clarity**: 重要な指標を3つ以内に絞る
- **Deference**: データが主役、UIは控えめに
- **Depth**: カードの階層と影で奥行きを表現

---

## 📊 技術的な考慮事項

### **パフォーマンス**

- 大量のログが蓄積される可能性があるため、パーティション化を検討
- ベクトル検索は`ivfflat`インデックスを使用
- キャッシュ戦略（Redis）を検討

### **コスト**

- OpenAI Embeddings: 質問1件あたり約$0.00002（512次元）
- ストレージ: Supabaseの無料プランで約500MB（約10万件のログ）
- 計算リソース: クラスタリングはバッチ処理で実行

### **セキュリティ**

- RLS（Row Level Security）でユーザー間のデータ分離
- 個人情報のマスキング（必要に応じて）
- アクセスログの監査

---

## 🚦 次のステップ

1. **データベーススキーマの作成**から始める
2. **チャットAPIの修正**でログ保存機能を追加
3. **基本的な分析API**を作成
4. **ダッシュボードUI**を実装

どの機能から実装を始めますか？

