# サイトマップ確認方法

サイトマップが未検出の場合、以下の方法で確認できます。

## 1. ブラウザで直接確認

以下のURLをブラウザで開いて、サイトマップが存在するか確認してください：

```
https://あなたのサイト.com/sitemap.xml
https://あなたのサイト.com/sitemap_index.xml
https://あなたのサイト.com/sitemap-index.xml
https://あなたのサイト.com/sitemap1.xml
https://あなたのサイト.com/sitemap.txt
```

## 2. robots.txtを確認

```
https://あなたのサイト.com/robots.txt
```

`robots.txt`に以下のような行があれば、そこにサイトマップのURLが記載されています：

```
Sitemap: https://あなたのサイト.com/sitemap.xml
```

## 3. サーバーログを確認

学習を開始した後、Next.jsのサーバーログ（ターミナル）に以下のようなログが表示されます：

```
[Sitemap Detection] Trying: https://example.com/sitemap.xml - Status: 404
[Sitemap Detection] Trying: https://example.com/sitemap_index.xml - Status: 200
[Sitemap Detection] Content-Type: application/xml
[Sitemap Detection] Found sitemap at: https://example.com/sitemap_index.xml
```

## 4. サイトマップが存在しない場合

サイトマップが存在しない場合は、以下のいずれかの方法で対応できます：

### 方法1: サイトマップを作成する
- WordPressなどのCMSを使用している場合、プラグインでサイトマップを生成できます
- 静的サイトの場合は、サイトマップ生成ツールを使用できます

### 方法2: 手動でサイトマップURLを指定する
- ダッシュボードでサイトを登録する際、「サイトマップURL」フィールドに直接URLを入力してください
- 例: `https://example.com/custom-sitemap.xml`

### 方法3: ベースURLのみで学習する
- サイトマップURLを空欄のまま学習を開始すると、ベースURLのみが学習されます
- その後、必要に応じて個別のページを追加できます

## 5. よくある問題

### 問題1: サイトマップは存在するが検出されない
- **原因**: Content-Typeが`text/html`になっている
- **解決策**: サーバー設定でXMLファイルのContent-Typeを`application/xml`または`text/xml`に設定する

### 問題2: サイトマップは存在するがURLが抽出されない
- **原因**: サイトマップのXML形式が標準的でない
- **解決策**: サイトマップの形式を確認し、必要に応じて修正する

### 問題3: CORSエラー
- **原因**: サイトがCORSをブロックしている
- **解決策**: サーバー側でCORS設定を確認する（通常は問題ありません）

