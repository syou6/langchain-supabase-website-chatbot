# Supabase Google OAuth設定ガイド

## Supabase側での設定

### 1. Google Cloud Consoleでの設定

1. [Google Cloud Console](https://console.cloud.google.com/)にアクセス
2. プロジェクトを作成または選択
3. 「APIとサービス」→「認証情報」に移動
4. 「認証情報を作成」→「OAuth 2.0 クライアント ID」を選択
5. アプリケーションの種類を「ウェブアプリケーション」に設定
6. 承認済みのリダイレクト URIに以下を追加：
   ```
   https://<your-project-ref>.supabase.co/auth/v1/callback
   ```
   - `<your-project-ref>`はSupabaseのプロジェクト参照IDです
   - Supabaseダッシュボードの「Settings」→「API」で確認できます

7. クライアントIDとクライアントシークレットをコピー

### 2. Supabaseダッシュボードでの設定

1. Supabaseダッシュボードにログイン
2. プロジェクトを選択
3. 「Authentication」→「Providers」に移動
4. 「Google」を有効化
5. 以下の情報を入力：
   - **Client ID (for OAuth)**: Google Cloud Consoleで取得したクライアントID
   - **Client Secret (for OAuth)**: Google Cloud Consoleで取得したクライアントシークレット

6. 「Save」をクリック

### 3. リダイレクトURLの確認

Supabaseダッシュボードの「Authentication」→「URL Configuration」で以下が設定されていることを確認：

- **Site URL**: `http://localhost:3005` (開発環境) または本番URL
- **Redirect URLs**: `http://localhost:3005/**` (開発環境) または本番URL

## 動作確認

1. ログインページ（`/auth/login`）にアクセス
2. 「Googleでログイン」ボタンをクリック
3. Googleアカウントでログイン
4. ダッシュボードにリダイレクトされることを確認

## トラブルシューティング

### リダイレクトエラーが発生する場合

- Supabaseの「Redirect URLs」に正しいURLが設定されているか確認
- Google Cloud Consoleの「承認済みのリダイレクト URI」にSupabaseのコールバックURLが設定されているか確認

### 認証エラーが発生する場合

- Google Cloud ConsoleでOAuth同意画面が設定されているか確認
- SupabaseのGoogleプロバイダー設定でClient IDとClient Secretが正しく入力されているか確認

