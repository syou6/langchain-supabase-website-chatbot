# catnose99 風 UI ガイド

## カラーパレット
```css
:root {
  --color-base-background: #111;
  --color-base-background-lighter: #24242d;
  --color-base-text: #fff;
  --color-base-text-lighter: rgba(212, 231, 241, 0.6);
  --color-border: rgba(115, 125, 130, 0.4);
  --color-primary-background: #9060ff;
  --color-primary-text: #b494ff;
}
```

Tailwind 拡張例：
```ts
colors: {
  premium: {
    bg: '#111111',
    bgElevated: '#24242d',
    fg: '#ffffff',
    fgMuted: 'rgba(212, 231, 241, 0.6)',
    border: 'rgba(115, 125, 130, 0.4)',
    accent: '#9060ff',
    accentSoft: '#b494ff',
  },
}
```

## Team Blog Hub の UI

### 構造
1. ヘッダー（ロゴ＋リンク）
2. ヒーロー（タイトル＋説明）
3. セクション（Members / Articles）
   - セクションヘッダー（タイトル＋「See Details →」）
   - コンテンツ（カードグリッド）

### Members カード
- 角丸大きめ、背景 `bgElevated`
- アバター＋名前（白）＋ロール（`fgMuted`）

### Articles リスト
- 左上にメタ (`fgMuted`)
- タイトルは白の太字（`font-semibold`）
- hover: 背景 or ボーダーを明るく / わずかに浮かせる

## timeline の UI

### ヒーロー
- 大きな見出し（`text-4xl`〜`text-5xl`）
- 行間広めのパラグラフ

### タイムライン
- 左に縦線＋ノード
- 年バッジ（pill 形状）
- 各イベント：メタ情報＋タイトル

## 共通スタイル
- 背景は黒に近いダークグレー
- 色数は最小限（白＋アクセント）
- 余白を広く、セクションごとに区切る
- カードは角丸＋薄いボーダーで立体感

## WebGPT への適用案

### フィルタ/UI
```tsx
<div className="mb-6 flex flex-wrap items-center gap-4">
  <select className="...">...</select>
  <select className="...">...</select>
  <input type="search" className="..." />
</div>
```

### サイトカード
```tsx
<Card className="group relative overflow-hidden p-5">
  <div className="mb-3 flex items-start justify-between">
    <div className="flex-1 min-w-0">
      <h2 className="text-lg font-semibold text-premium-fg truncate">{site.name}</h2>
      {site.description && (
        <p className="mt-1 text-sm text-premium-fgMuted line-clamp-2">{site.description}</p>
      )}
    </div>
    {getStatusBadge(site.status)}
  </div>
  <div className="mb-4 flex flex-wrap gap-4 text-xs text-premium-fgMuted">
    <div className="flex items-center gap-1">
      <span>最終学習:</span>
      <span className="font-medium text-premium-fg">{formatDate(site.last_trained_at)}</span>
    </div>
    <div className="flex items-center gap-1">
      <span>作成日:</span>
      <span className="font-medium text-premium-fg">{formatDate(site.created_at)}</span>
    </div>
  </div>
  <a href={site.base_url} className="...">{site.base_url}</a>
  <div className="flex gap-2">{/* アクションボタン */}</div>
</Card>
```

### 空状態
```tsx
<Card variant="dashed" className="px-6 py-16 text-center">
  <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-premium-surface/70 flex items-center justify-center">
    <svg className="h-8 w-8 text-premium-muted" ... />
  </div>
  <p className="mb-2 text-base font-medium text-premium-fg">登録されているサイトがありません</p>
  <p className="mb-6 text-sm text-premium-fgMuted">最初のサイトを登録して、チャットボットを始めましょう</p>
  <Button onClick={...}>+ 新規サイト登録</Button>
</Card>
```
