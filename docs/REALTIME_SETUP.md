# 🔄 Supabase Realtime 設定ガイド

## 📋 概要

学習完了時にダッシュボードのステータスが即座に「準備完了」に切り替わるようにするための、Supabase Realtime 設定手順です。

---

## 🛠️ 1. Supabase ダッシュボードでの設定

### 1.1 `sites`テーブルを Realtime 対象にする

1. **Supabase ダッシュボードにログイン**

   - https://app.supabase.com にアクセス
   - プロジェクトを選択

2. **Database → Replication に移動**

   - 左メニューから「Database」を選択
   - 「Replication」タブをクリック

3. **`public.sites`テーブルを有効化**

   - テーブル一覧から `public.sites` を探す
   - Replication スイッチを**ON**にする
   - または、Replication モードを**FULL**に設定

   > **注意**: Replication を有効にすると、テーブルの変更が Realtime で配信されます。

### 1.2 `training_jobs`テーブルも Realtime 対象にする（推奨）

同様に `public.training_jobs` テーブルも Realtime 対象に設定してください。

- `public.training_jobs` の Replication スイッチを**ON**にする

---

## 🔍 2. 動作確認方法

### 2.1 ブラウザのコンソールで確認（開発環境のみ）

**開発環境**（`npm run dev`）でダッシュボードを開いた状態で、ブラウザの開発者ツール（F12）のコンソールタブを開きます。

以下のようなログが表示されれば、Realtime 接続が成功しています：

```
[Realtime] Sites channel subscribed
[Realtime] Training jobs channel subscribed
```

> **注意**: これらのログは**開発環境のみ**で表示されます。本番環境では表示されません（エラーのみ記録されます）。

### 2.2 学習完了時の動作確認

1. サイトの学習を開始
2. 学習が完了すると、コンソールに以下のログが表示されます：
   ```
   [Realtime] Training job completed for site <site_id>, fetching sites...
   [Realtime] Sites table changed, fetching sites...
   ```
3. ダッシュボードのステータスバッジが「学習中」から「準備完了」に自動的に切り替わります

---

## 🐛 3. トラブルシューティング

### 問題: Realtime 接続が失敗する

**確認事項**:

1. Supabase ダッシュボードで `sites` テーブルの Replication が有効になっているか
2. ブラウザのコンソールでエラーメッセージを確認
3. ネットワーク接続を確認

**デバッグコード**:
ブラウザのコンソールで以下を実行して、チャンネルの状態を確認できます：

```javascript
// 現在のSupabaseクライアントを取得（ダッシュボードページで実行）
const supabase =
  window.supabase || // グローバル変数があれば
  (() => {
    // または、React DevToolsでコンポーネントのstateから取得
    console.log('Supabase client not found in window');
  })();

// チャンネルの状態を監視
const channel = supabase.channel('sites-changes');
channel.on('status', (status) => {
  console.log('Channel status:', status);
});
channel.subscribe();
```

### 問題: 学習完了してもステータスが更新されない

**確認事項**:

1. `training_jobs` テーブルの Replication が有効になっているか
2. コンソールに `[Realtime] Training job completed` のログが表示されるか
3. バックエンドで `sites.status` が `'ready'` に更新されているか（Supabase ダッシュボードの Table Editor で確認）

**フォールバック**:
Realtime が失敗した場合でも、2 秒ごとのポーリング（`loadTrainingJobs`）により、最終的にはステータスが更新されます。

---

## 📝 4. 実装の詳細

### 4.1 現在の実装

`pages/dashboard.tsx` では以下の 2 つの Realtime チャンネルを設定しています：

1. **`sites-changes`**: `sites` テーブルの変更を監視

   - `status` が `'ready'` に更新されたら、サイト一覧を再取得

2. **`training-jobs-changes-{userId}`**: `training_jobs` テーブルの変更を監視
   - `status` が `'completed'` になったら、`fetchSites()` を呼び出してサイト一覧を再取得

### 4.2 フォールバック機能

Realtime が失敗した場合でも、以下のフォールバック機能があります：

- **ポーリング**: `trainingSites` に含まれるサイトについて、2 秒ごとに `training_jobs` を取得
- **手動更新**: ユーザーがページをリロードすれば、最新の状態が表示される

---

## ✅ チェックリスト

- [ ] Supabase ダッシュボードで `public.sites` の Replication を有効化
- [ ] Supabase ダッシュボードで `public.training_jobs` の Replication を有効化（推奨）
- [ ] ブラウザのコンソールで `[Realtime] Sites channel subscribed` が表示されることを確認
- [ ] 学習を開始して、完了時にステータスが自動更新されることを確認

---

## 📚 参考リンク

- [Supabase Realtime Documentation](https://supabase.com/docs/guides/realtime)
- [PostgreSQL Replication](https://supabase.com/docs/guides/database/extensions/replication)
