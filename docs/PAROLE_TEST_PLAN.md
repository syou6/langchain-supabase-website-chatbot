# 🧪 Parole機能 テスト計画書

## 概要

Parole機能のテスト計画です。単体テスト、統合テスト、E2Eテストを含みます。

---

## 1. 単体テスト

### **1.1 データベース関数のテスト**

#### **`get_question_ranking`関数**

```sql
-- テストケース1: 正常系 - 質問ランキングの取得
SELECT * FROM get_question_ranking(
  'site-id-123'::uuid,
  NULL,
  NULL,
  10
);
-- 期待結果: 質問ランキングが返される

-- テストケース2: 期間フィルタ
SELECT * FROM get_question_ranking(
  'site-id-123'::uuid,
  '2024-12-01'::timestamptz,
  '2024-12-31'::timestamptz,
  10
);
-- 期待結果: 指定期間内の質問のみ返される

-- テストケース3: 存在しないサイトID
SELECT * FROM get_question_ranking(
  'non-existent-id'::uuid,
  NULL,
  NULL,
  10
);
-- 期待結果: 空の結果が返される
```

#### **`get_keyword_frequency`関数**

```sql
-- テストケース1: 正常系 - キーワード出現頻度の取得
SELECT * FROM get_keyword_frequency(
  'site-id-123'::uuid,
  NULL,
  NULL,
  20
);
-- 期待結果: キーワードと出現頻度が返される

-- テストケース2: ストップワードの除外
-- テストデータに「の」「は」「を」などのストップワードを含む質問を追加
-- 期待結果: ストップワードが結果に含まれない
```

#### **`get_question_timeline`関数**

```sql
-- テストケース1: 日別集計
SELECT * FROM get_question_timeline(
  'site-id-123'::uuid,
  NULL,
  NULL,
  'day'
);
-- 期待結果: 日別の質問数が返される

-- テストケース2: 週別集計
SELECT * FROM get_question_timeline(
  'site-id-123'::uuid,
  NULL,
  NULL,
  'week'
);
-- 期待結果: 週別の質問数が返される

-- テストケース3: 月別集計
SELECT * FROM get_question_timeline(
  'site-id-123'::uuid,
  NULL,
  NULL,
  'month'
);
-- 期待結果: 月別の質問数が返される
```

---

### **1.2 APIエンドポイントのテスト**

#### **`GET /api/insights/questions`**

```typescript
// テストケース1: 正常系
describe('GET /api/insights/questions', () => {
  it('should return question ranking', async () => {
    const response = await fetch('/api/insights/questions?site_id=test-site-id', {
      headers: {
        Authorization: `Bearer ${validToken}`,
      },
    });
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.questions).toBeDefined();
    expect(Array.isArray(data.questions)).toBe(true);
  });

  // テストケース2: 認証エラー
  it('should return 401 without token', async () => {
    const response = await fetch('/api/insights/questions?site_id=test-site-id');
    expect(response.status).toBe(401);
  });

  // テストケース3: サイトID未指定
  it('should return 400 without site_id', async () => {
    const response = await fetch('/api/insights/questions', {
      headers: {
        Authorization: `Bearer ${validToken}`,
      },
    });
    expect(response.status).toBe(400);
  });

  // テストケース4: 存在しないサイトID
  it('should return 404 for non-existent site', async () => {
    const response = await fetch('/api/insights/questions?site_id=non-existent-id', {
      headers: {
        Authorization: `Bearer ${validToken}`,
      },
    });
    expect(response.status).toBe(404);
  });

  // テストケース5: 権限エラー（他のユーザーのサイト）
  it('should return 403 for other user site', async () => {
    const response = await fetch('/api/insights/questions?site_id=other-user-site-id', {
      headers: {
        Authorization: `Bearer ${validToken}`,
      },
    });
    expect(response.status).toBe(403);
  });
});
```

#### **`GET /api/insights/keywords`**

```typescript
// テストケース1: 正常系
describe('GET /api/insights/keywords', () => {
  it('should return keyword frequency', async () => {
    const response = await fetch('/api/insights/keywords?site_id=test-site-id', {
      headers: {
        Authorization: `Bearer ${validToken}`,
      },
    });
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.keywords).toBeDefined();
    expect(Array.isArray(data.keywords)).toBe(true);
  });
});
```

#### **`GET /api/insights/timeline`**

```typescript
// テストケース1: 正常系
describe('GET /api/insights/timeline', () => {
  it('should return timeline data', async () => {
    const response = await fetch('/api/insights/timeline?site_id=test-site-id&interval=day', {
      headers: {
        Authorization: `Bearer ${validToken}`,
      },
    });
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.timeline).toBeDefined();
    expect(Array.isArray(data.timeline)).toBe(true);
  });

  // テストケース2: 無効なinterval
  it('should return 400 for invalid interval', async () => {
    const response = await fetch('/api/insights/timeline?site_id=test-site-id&interval=invalid', {
      headers: {
        Authorization: `Bearer ${validToken}`,
      },
    });
    expect(response.status).toBe(400);
  });
});
```

---

## 2. 統合テスト

### **2.1 チャットAPI + ログ保存**

```typescript
describe('Chat API + Log Save Integration', () => {
  it('should save chat log after chat completion', async () => {
    // 1. チャットAPIを呼び出す
    const chatResponse = await fetch('/api/embed/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question: 'テスト質問',
        site_id: 'test-site-id',
      }),
    });

    // 2. ストリーミング完了を待つ
    // ... ストリーミング処理 ...

    // 3. ログが保存されたか確認
    const { data: logs } = await supabase
      .from('chat_logs')
      .select('*')
      .eq('site_id', 'test-site-id')
      .eq('question', 'テスト質問')
      .order('created_at', { ascending: false })
      .limit(1);

    expect(logs).toBeDefined();
    expect(logs.length).toBe(1);
    expect(logs[0].question).toBe('テスト質問');
  });
});
```

---

### **2.2 分析API + UI**

```typescript
describe('Insights API + UI Integration', () => {
  it('should display question ranking in UI', async () => {
    // 1. テストデータを準備
    await createTestChatLogs('test-site-id', 10);

    // 2. APIを呼び出す
    const response = await fetch('/api/insights/questions?site_id=test-site-id', {
      headers: {
        Authorization: `Bearer ${validToken}`,
      },
    });

    // 3. UIで表示されることを確認
    const data = await response.json();
    expect(data.questions.length).toBeGreaterThan(0);
  });
});
```

---

## 3. E2Eテスト

### **3.1 チャットからインサイト表示までのフロー**

```typescript
describe('E2E: Chat to Insights Flow', () => {
  it('should complete full flow', async () => {
    // 1. チャットで質問する
    await page.goto('/dashboard/test-site-id');
    await page.fill('textarea', '価格はいくらですか？');
    await page.click('button[type="submit"]');
    await page.waitForSelector('.chat-message', { timeout: 10000 });

    // 2. インサイトページに移動
    await page.goto('/dashboard/test-site-id/insights');

    // 3. 質問ランキングが表示されることを確認
    await page.waitForSelector('.question-ranking');
    const ranking = await page.textContent('.question-ranking');
    expect(ranking).toContain('価格はいくらですか？');

    // 4. キーワードが表示されることを確認
    await page.waitForSelector('.keyword-cloud');
    const keywords = await page.textContent('.keyword-cloud');
    expect(keywords).toContain('価格');
  });
});
```

---

## 4. パフォーマンステスト

### **4.1 大量データでのテスト**

```typescript
describe('Performance Tests', () => {
  it('should handle large dataset efficiently', async () => {
    // 1. 大量のテストデータを作成（10,000件）
    await createBulkChatLogs('test-site-id', 10000);

    // 2. APIのレスポンスタイムを測定
    const startTime = Date.now();
    const response = await fetch('/api/insights/questions?site_id=test-site-id', {
      headers: {
        Authorization: `Bearer ${validToken}`,
      },
    });
    const endTime = Date.now();
    const responseTime = endTime - startTime;

    // 3. レスポンスタイムが許容範囲内か確認（1秒以内）
    expect(responseTime).toBeLessThan(1000);
    expect(response.status).toBe(200);
  });
});
```

---

## 5. セキュリティテスト

### **5.1 RLSポリシーのテスト**

```typescript
describe('Security Tests', () => {
  it('should prevent access to other user logs', async () => {
    // 1. ユーザーAのログを作成
    await createChatLog('user-a-site-id', 'user-a-id');

    // 2. ユーザーBのトークンでアクセス
    const response = await fetch('/api/insights/questions?site_id=user-a-site-id', {
      headers: {
        Authorization: `Bearer ${userBToken}`,
      },
    });

    // 3. 403エラーが返されることを確認
    expect(response.status).toBe(403);
  });
});
```

---

## 6. テスト環境のセットアップ

### **6.1 テストデータベース**

```bash
# テスト用のSupabaseプロジェクトを作成
# またはローカルでSupabaseを起動
supabase start
```

### **6.2 テストデータの準備**

```sql
-- テスト用のサイトとユーザーを作成
INSERT INTO sites (id, name, base_url, user_id) VALUES
  ('test-site-id', 'テストサイト', 'https://test.com', 'test-user-id');

-- テスト用のチャットログを作成
INSERT INTO chat_logs (user_id, site_id, question, answer) VALUES
  ('test-user-id', 'test-site-id', 'テスト質問1', 'テスト回答1'),
  ('test-user-id', 'test-site-id', 'テスト質問2', 'テスト回答2');
```

---

## 7. テスト実行

### **7.1 単体テストの実行**

```bash
# データベース関数のテスト
psql -h localhost -U postgres -d test_db -f tests/db_functions_test.sql

# APIエンドポイントのテスト
npm run test:api

# コンポーネントのテスト
npm run test:components
```

### **7.2 統合テストの実行**

```bash
npm run test:integration
```

### **7.3 E2Eテストの実行**

```bash
npm run test:e2e
```

---

## 8. テストカバレッジ

### **目標カバレッジ**

- **単体テスト**: 80%以上
- **統合テスト**: 60%以上
- **E2Eテスト**: 主要フローの100%

### **カバレッジレポート**

```bash
npm run test:coverage
```

---

## 9. テストチェックリスト

- [ ] データベース関数のテスト
- [ ] APIエンドポイントのテスト
- [ ] コンポーネントのテスト
- [ ] 統合テスト
- [ ] E2Eテスト
- [ ] パフォーマンステスト
- [ ] セキュリティテスト
- [ ] テストカバレッジの確認

