# Vercelデプロイ手順

## 1. 準備

### 1.1 GitHubリポジトリにプッシュ
```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### 1.2 Vercelアカウント作成
- [Vercel](https://vercel.com) にアクセス
- GitHubアカウントでログイン

## 2. Vercelでプロジェクト作成

### 2.1 新規プロジェクト作成
1. Vercelダッシュボードで「New Project」をクリック
2. GitHubリポジトリを選択
3. 「Import」をクリック

### 2.2 環境変数設定
以下の環境変数を設定：

```
OPENAI_API_KEY=your_openai_api_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

**設定方法：**
- Project Settings → Environment Variables
- 各環境（Production, Preview, Development）に設定

### 2.3 ビルド設定
- Framework Preset: **Next.js**
- Build Command: `npm run build`（デフォルト）
- Output Directory: `.next`（デフォルト）
- Install Command: `npm install`（デフォルト）

### 2.4 デプロイ
- 「Deploy」をクリック
- ビルドが完了するまで待機（数分）

## 3. デプロイ後の確認

### 3.1 動作確認
- デプロイ完了後、提供されたURLにアクセス
- ログインページが表示されることを確認
- サイト登録・学習・チャットが動作することを確認

### 3.2 エラー確認
- Vercelダッシュボードの「Functions」タブでエラーログを確認
- 「Logs」タブでリアルタイムログを確認

## 4. カスタムドメイン設定（オプション）

### 4.1 ドメイン追加
1. Project Settings → Domains
2. 「Add Domain」をクリック
3. ドメイン名を入力
4. DNS設定を案内に従って設定

### 4.2 SSL証明書
- Vercelが自動的にSSL証明書を発行・更新

## 5. 環境変数の更新

### 5.1 環境変数を変更する場合
1. Project Settings → Environment Variables
2. 変数を編集または追加
3. 「Redeploy」をクリックして再デプロイ

## 6. トラブルシューティング

### ビルドエラー
- `package.json`の依存関係を確認
- Node.jsバージョンを確認（Vercelは自動検出）

### 環境変数エラー
- 環境変数が正しく設定されているか確認
- 変数名にタイポがないか確認

### APIエラー
- SupabaseのRLSポリシーを確認
- CORS設定を確認

## 7. 継続的デプロイ

### 自動デプロイ
- `main`ブランチへのプッシュで自動デプロイ
- プルリクエストでプレビューデプロイ

### 手動デプロイ
- Vercelダッシュボードから「Redeploy」をクリック

