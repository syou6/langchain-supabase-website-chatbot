# デプロイメントガイド

## Vercelへのデプロイ

詳細な手順は [VERCEL_DEPLOY.md](./VERCEL_DEPLOY.md) を参照してください。

### クイックスタート

1. **GitHubにプッシュ**
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **Vercelでプロジェクト作成**
   - [Vercel](https://vercel.com) にアクセス
   - GitHubリポジトリをインポート

3. **環境変数を設定**
   ```
   OPENAI_API_KEY=your_openai_api_key
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```

4. **デプロイ**
   - 「Deploy」をクリック
   - 完了を待つ

## 環境変数

### 必須環境変数

- `OPENAI_API_KEY`: OpenAI APIキー
- `NEXT_PUBLIC_SUPABASE_URL`: SupabaseプロジェクトURL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase匿名キー
- `SUPABASE_SERVICE_ROLE_KEY`: Supabaseサービスロールキー

### オプション環境変数

- `PORT`: カスタムポート（デフォルト: 3000）

## トラブルシューティング

### ビルドエラー

- Node.jsバージョンを確認（Vercelは自動検出）
- 依存関係を確認（`package.json`）

### 環境変数エラー

- 環境変数が正しく設定されているか確認
- 変数名にタイポがないか確認

### APIエラー

- SupabaseのRLSポリシーを確認
- CORS設定を確認

## 継続的デプロイ

- `main`ブランチへのプッシュで自動デプロイ
- プルリクエストでプレビューデプロイ

