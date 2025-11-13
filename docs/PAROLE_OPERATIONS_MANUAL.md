# 📖 Parole機能 運用マニュアル

## 概要

Parole機能の運用・保守に関するマニュアルです。

---

## 1. デプロイ手順

### **1.1 データベースマイグレーション**

```bash
# 1. マイグレーションファイルを確認
cat supabase/migrations/20241201_add_chat_logs.sql

# 2. Supabaseダッシュボードで実行
# SQL Editorでマイグレーションファイルの内容を実行

# または、Supabase CLIで実行
supabase db push
```

### **1.2 アプリケーションデプロイ**

```bash
# 1. コードをプッシュ
git push origin main

# 2. Vercelで自動デプロイ（設定済みの場合）
# または手動デプロイ
vercel deploy --prod
```

### **1.3 動作確認**

1. チャット機能が正常に動作するか確認
2. ログが保存されるか確認
3. インサイトページが表示されるか確認

---

## 2. モニタリング

### **2.1 ログの確認**

#### **Supabaseダッシュボード**

1. Supabaseダッシュボードにログイン
2. `chat_logs`テーブルを確認
3. ログの件数と内容を確認

#### **アプリケーションログ**

```bash
# Vercelのログを確認
vercel logs

# または、Vercelダッシュボードで確認
```

### **2.2 パフォーマンス監視**

#### **データベースクエリのパフォーマンス**

```sql
-- 遅いクエリを確認
SELECT 
  query,
  calls,
  total_time,
  mean_time
FROM pg_stat_statements
WHERE query LIKE '%chat_logs%'
ORDER BY mean_time DESC
LIMIT 10;
```

#### **APIのレスポンスタイム**

- Vercel AnalyticsでAPIのレスポンスタイムを監視
- 1秒を超える場合は最適化を検討

---

## 3. トラブルシューティング

### **3.1 ログが保存されない**

#### **原因1: RLSポリシーの問題**

```sql
-- RLSポリシーを確認
SELECT * FROM pg_policies WHERE tablename = 'chat_logs';

-- ポリシーを再作成
-- supabase/migrations/20241201_add_chat_logs.sqlを再実行
```

#### **原因2: APIエラーの確認**

```bash
# アプリケーションログを確認
vercel logs --follow

# エラーメッセージを確認
```

### **3.2 分析APIが遅い**

#### **対処法1: インデックスの確認**

```sql
-- インデックスが存在するか確認
SELECT 
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'chat_logs';
```

#### **対処法2: クエリの最適化**

```sql
-- EXPLAIN ANALYZEでクエリを分析
EXPLAIN ANALYZE
SELECT * FROM get_question_ranking('site-id', NULL, NULL, 10);
```

### **3.3 データが表示されない**

#### **確認事項**

1. サイトIDが正しいか確認
2. 認証トークンが有効か確認
3. RLSポリシーが正しく設定されているか確認

---

## 4. データ管理

### **4.1 データのバックアップ**

#### **Supabaseの自動バックアップ**

- Supabase Proプラン以上で自動バックアップが有効
- バックアップの復元はSupabaseダッシュボードから実行可能

#### **手動バックアップ**

```bash
# pg_dumpでバックアップ
pg_dump -h <host> -U postgres -d postgres -t chat_logs > chat_logs_backup.sql
```

### **4.2 データのアーカイブ**

#### **古いログのアーカイブ**

```sql
-- 6ヶ月以上前のログをアーカイブテーブルに移動
INSERT INTO chat_logs_archive
SELECT * FROM chat_logs
WHERE created_at < NOW() - INTERVAL '6 months';

-- アーカイブ後に削除
DELETE FROM chat_logs
WHERE created_at < NOW() - INTERVAL '6 months';
```

### **4.3 データの削除**

#### **特定のサイトのログを削除**

```sql
-- 注意: 本番環境では実行前にバックアップを取得
DELETE FROM chat_logs
WHERE site_id = 'site-id-to-delete';
```

---

## 5. パフォーマンス最適化

### **5.1 インデックスの最適化**

```sql
-- インデックスの使用状況を確認
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
WHERE tablename = 'chat_logs';

-- 使用されていないインデックスを削除
DROP INDEX IF EXISTS idx_chat_logs_unused;
```

### **5.2 パーティション化**

大量のログが蓄積される場合、パーティション化を検討：

```sql
-- パーティション化の例（将来実装）
CREATE TABLE chat_logs_2024_12 PARTITION OF chat_logs
  FOR VALUES FROM ('2024-12-01') TO ('2025-01-01');
```

### **5.3 キャッシュの実装**

頻繁にアクセスされるデータはキャッシュを検討：

```typescript
// Redisを使用したキャッシュの例
import Redis from 'ioredis';
const redis = new Redis(process.env.REDIS_URL);

async function getQuestionRankingCached(siteId: string) {
  const cacheKey = `question_ranking:${siteId}`;
  const cached = await redis.get(cacheKey);
  
  if (cached) {
    return JSON.parse(cached);
  }
  
  const data = await getQuestionRanking(siteId);
  await redis.setex(cacheKey, 3600, JSON.stringify(data)); // 1時間キャッシュ
  return data;
}
```

---

## 6. セキュリティ

### **6.1 RLSポリシーの確認**

```sql
-- RLSポリシーを定期的に確認
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'chat_logs';
```

### **6.2 アクセスログの監視**

```sql
-- 異常なアクセスパターンを検出
SELECT 
  user_id,
  COUNT(*) as access_count,
  MAX(created_at) as last_access
FROM chat_logs
WHERE created_at > NOW() - INTERVAL '1 day'
GROUP BY user_id
HAVING COUNT(*) > 1000  -- 1日で1000件以上は異常
ORDER BY access_count DESC;
```

---

## 7. アップデート手順

### **7.1 機能追加時の手順**

1. **データベースマイグレーション**
   ```bash
   # 新しいマイグレーションファイルを作成
   touch supabase/migrations/YYYYMMDD_add_new_feature.sql
   ```

2. **APIエンドポイントの追加**
   ```bash
   # 新しいAPIエンドポイントを作成
   touch pages/api/insights/new-feature.ts
   ```

3. **UIの更新**
   ```bash
   # UIコンポーネントを更新
   ```

4. **テストの実行**
   ```bash
   npm run test
   ```

5. **デプロイ**
   ```bash
   git push origin main
   ```

### **7.2 バグ修正時の手順**

1. バグを再現
2. 修正を実装
3. テストを実行
4. デプロイ

---

## 8. よくある質問（FAQ）

### **Q1: ログが保存されない**

**A:** RLSポリシーを確認してください。API経由でのみログを挿入できるよう設定されています。

### **Q2: 分析APIが遅い**

**A:** インデックスが正しく作成されているか確認してください。大量のデータがある場合はパーティション化を検討してください。

### **Q3: データが表示されない**

**A:** サイトIDと認証トークンが正しいか確認してください。RLSポリシーが正しく設定されているかも確認してください。

---

## 9. 緊急時の対応

### **9.1 データベースエラー**

1. Supabaseダッシュボードでエラーを確認
2. 必要に応じてサポートに連絡
3. バックアップから復元を検討

### **9.2 APIエラー**

1. Vercelのログを確認
2. エラーメッセージを確認
3. 必要に応じてロールバック

---

## 10. 連絡先

- **開発チーム**: [連絡先]
- **Supabaseサポート**: [サポートURL]
- **Vercelサポート**: [サポートURL]

---

## 11. チェックリスト

### **日常的な確認**

- [ ] ログが正常に保存されているか
- [ ] APIのレスポンスタイムが許容範囲内か
- [ ] エラーログがないか

### **週次確認**

- [ ] データベースのサイズを確認
- [ ] パフォーマンスメトリクスを確認
- [ ] セキュリティログを確認

### **月次確認**

- [ ] バックアップの確認
- [ ] インデックスの最適化
- [ ] データのアーカイブ

