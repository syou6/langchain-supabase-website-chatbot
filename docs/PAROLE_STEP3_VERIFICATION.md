# ✅ Step 3: 分析APIの動作確認

## 概要

Step 3では、作成した分析APIエンドポイントが正しく動作するか確認します。

---

## 📋 確認項目

### **1. データベース関数の動作確認**

✅ **完了済み**
- `get_question_ranking` - 質問ランキング取得
- `get_keyword_frequency` - キーワード出現頻度取得
- `get_question_timeline` - 時系列データ取得

### **2. APIエンドポイントの動作確認**

以下のAPIエンドポイントをテストします：

- `/api/insights/questions` - 質問ランキングAPI
- `/api/insights/keywords` - キーワード分析API
- `/api/insights/timeline` - 時系列分析API

---

## 🧪 動作確認手順

### **方法1: テストスクリプトを使用（推奨）**

1. **開発サーバーを起動**

```bash
npm run dev
```

2. **別のターミナルでテストスクリプトを実行**

```bash
npm run test:insights
```

**注意**: テストスクリプトを実行する前に、ブラウザでログインしてセッションを作成する必要があります。

---

### **方法2: 手動でAPIをテスト**

1. **開発サーバーを起動**

```bash
npm run dev
```

2. **ブラウザでログイン**

```
http://localhost:3000/auth/login
```

3. **ブラウザの開発者ツールでトークンを取得**

```javascript
// ブラウザのコンソールで実行
const session = await supabase.auth.getSession();
console.log('Access Token:', session.data.session?.access_token);
```

4. **APIをテスト**

```bash
# 質問ランキングAPI
curl -X GET "http://localhost:3000/api/insights/questions?site_id=YOUR_SITE_ID&limit=10" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# キーワード分析API
curl -X GET "http://localhost:3000/api/insights/keywords?site_id=YOUR_SITE_ID&limit=20" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# 時系列分析API
curl -X GET "http://localhost:3000/api/insights/timeline?site_id=YOUR_SITE_ID&interval=day" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

### **方法3: Supabase MCPで直接SQLを実行**

データベース関数が正しく動作するか確認：

```sql
-- 質問ランキング
SELECT * FROM get_question_ranking(
  'YOUR_SITE_ID'::uuid,
  NULL,
  NULL,
  10
);

-- キーワード出現頻度
SELECT * FROM get_keyword_frequency(
  'YOUR_SITE_ID'::uuid,
  NULL,
  NULL,
  20
);

-- 時系列データ
SELECT * FROM get_question_timeline(
  'YOUR_SITE_ID'::uuid,
  NULL,
  NULL,
  'day'
);
```

---

## ✅ 期待される結果

### **質問ランキングAPI**

```json
{
  "site_id": "xxx",
  "period": {
    "start": null,
    "end": null
  },
  "questions": [
    {
      "question": "価格はいくらですか？",
      "count": 2,
      "first_asked_at": "2025-11-13T11:58:55.884Z",
      "last_asked_at": "2025-11-13T11:58:55.884Z"
    }
  ]
}
```

### **キーワード分析API**

```json
{
  "site_id": "xxx",
  "period": {
    "start": null,
    "end": null
  },
  "keywords": [
    {
      "keyword": "価格",
      "count": 2
    }
  ]
}
```

### **時系列分析API**

```json
{
  "site_id": "xxx",
  "period": {
    "start": null,
    "end": null
  },
  "interval": "day",
  "timeline": [
    {
      "period_start": "2025-11-13T00:00:00.000Z",
      "question_count": 4
    }
  ]
}
```

---

## 🐛 トラブルシューティング

### **エラー1: 401 Unauthorized**

**原因**: 認証トークンが無効または未設定

**対処法**:
- ブラウザでログインしてセッションを作成
- トークンが正しく設定されているか確認

### **エラー2: 403 Forbidden**

**原因**: サイトの所有者ではない

**対処法**:
- 正しいサイトIDを使用しているか確認
- サイトの所有者であることを確認

### **エラー3: 404 Not Found**

**原因**: サイトIDが存在しない

**対処法**:
- サイトIDが正しいか確認
- データベースでサイトが存在するか確認

### **エラー4: 500 Internal Server Error**

**原因**: データベース関数のエラー

**対処法**:
- データベース関数が正しく作成されているか確認
- エラーログを確認

---

## 📝 チェックリスト

- [ ] データベース関数が正しく動作する
- [ ] `/api/insights/questions` が正しく動作する
- [ ] `/api/insights/keywords` が正しく動作する
- [ ] `/api/insights/timeline` が正しく動作する
- [ ] 認証が正しく機能する
- [ ] エラーハンドリングが正しく機能する
- [ ] レスポンス形式が正しい

---

## 🚀 次のステップ

Step 3が完了したら、Step 4（ダッシュボードUI作成）に進みます。

