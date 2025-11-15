# catnose99さんのUIデザイン参考ドキュメント

## 概要

[catnose99さんのGitHubリポジトリページ](https://github.com/catnose99?tab=repositories)のUIデザインを参考に、WebGPTダッシュボードの改善案をまとめます。

## catnose99さんのUIの特徴

### 1. **シンプルでクリーンなデザイン**
- 余白を適切に使用した読みやすいレイアウト
- 装飾を最小限に抑えたミニマルなデザイン
- 情報の階層が明確

### 2. **フィルタリング機能**
- **Type**: All / Sources / Forks / Archived / Can be sponsored / Mirrors / Templates
- **Language**: All / JavaScript / TypeScript / Shell / Ruby / HTML
- **Sort**: Last updated / Name / Stars

### 3. **リポジトリカードの情報表示**
- リポジトリ名（タイトル）
- 説明文
- 言語バッジ（色分け）
- スター数
- 最終更新日
- ライセンス情報（該当する場合）

### 4. **視覚的な階層構造**
- カードベースのレイアウト
- ホバー時の微細なインタラクション
- 重要な情報が目立つ配置

## WebGPTダッシュボードへの適用案

### 現在の実装との比較

#### 現在の実装
- カードベースのレイアウト ✓
- ステータスバッジ ✓
- サイト情報の表示 ✓
- アクションボタン ✓

#### 改善すべき点

1. **フィルタリング機能の追加**
   - ステータスでフィルタ（All / Ready / Training / Idle / Error）
   - 最終更新日でソート（Last updated / Name / Created date）
   - 検索機能（サイト名、URLで検索）

2. **情報表示の最適化**
   - サイトカードの情報をより簡潔に
   - 言語バッジの代わりにステータスバッジをより目立たせる
   - 最終学習日をより見やすく

3. **レイアウトの改善**
   - グリッドレイアウトの調整
   - カード間のスペーシング最適化
   - レスポンシブデザインの改善

## 実装案

### 1. フィルタリングUI

```tsx
// フィルタリングコンポーネント
<div className="mb-6 flex flex-wrap items-center gap-4">
  {/* Type Filter */}
  <select className="rounded-lg border border-premium-stroke/40 bg-premium-surface/70 px-3 py-2 text-sm text-premium-text">
    <option value="all">All</option>
    <option value="ready">Ready</option>
    <option value="training">Training</option>
    <option value="idle">Idle</option>
    <option value="error">Error</option>
  </select>

  {/* Sort */}
  <select className="rounded-lg border border-premium-stroke/40 bg-premium-surface/70 px-3 py-2 text-sm text-premium-text">
    <option value="last_updated">Last updated</option>
    <option value="name">Name</option>
    <option value="created">Created date</option>
  </select>

  {/* Search */}
  <input
    type="search"
    placeholder="Search sites..."
    className="flex-1 min-w-[200px] rounded-lg border border-premium-stroke/40 bg-premium-surface/70 px-3 py-2 text-sm text-premium-text placeholder:text-premium-muted"
  />
</div>
```

### 2. サイトカードの改善

```tsx
<Card className="group relative overflow-hidden p-5 transition hover:border-emerald-400/30">
  {/* ヘッダー部分 */}
  <div className="mb-3 flex items-start justify-between gap-2">
    <div className="flex-1 min-w-0">
      <h2 className="text-lg font-semibold text-premium-text truncate">
        {site.name}
      </h2>
      {/* 説明文があれば表示 */}
      {site.description && (
        <p className="mt-1 text-sm text-premium-muted line-clamp-2">
          {site.description}
        </p>
      )}
    </div>
    <div className="flex-shrink-0">
      {getStatusBadge(site.status)}
    </div>
  </div>

  {/* メタ情報 */}
  <div className="mb-4 flex flex-wrap items-center gap-4 text-xs text-premium-muted">
    <div className="flex items-center gap-1">
      <span>最終学習:</span>
      <span className="font-medium text-premium-text">
        {formatDate(site.last_trained_at)}
      </span>
    </div>
    <div className="flex items-center gap-1">
      <span>作成日:</span>
      <span className="font-medium text-premium-text">
        {formatDate(site.created_at)}
      </span>
    </div>
  </div>

  {/* URL表示（簡潔に） */}
  <div className="mb-4">
    <a
      href={site.base_url}
      target="_blank"
      rel="noopener noreferrer"
      className="text-xs text-premium-accent hover:underline truncate block"
    >
      {site.base_url}
    </a>
  </div>

  {/* アクションボタン */}
  <div className="flex gap-2">
    {/* アクションボタン群 */}
  </div>
</Card>
```

### 3. 空状態の改善

```tsx
{sites.length === 0 ? (
  <Card variant="dashed" className="px-6 py-16 text-center">
    <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-premium-surface/70 flex items-center justify-center">
      <svg className="h-8 w-8 text-premium-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
    </div>
    <p className="mb-2 text-base font-medium text-premium-text">
      登録されているサイトがありません
    </p>
    <p className="mb-6 text-sm text-premium-muted">
      最初のサイトを登録して、チャットボットを始めましょう
    </p>
    <Button onClick={() => setShowModal(true)}>
      + 新規サイト登録
    </Button>
  </Card>
) : (
  // サイトリスト
)}
```

### 4. グリッドレイアウトの最適化

```tsx
{/* フィルタリングUI */}
<div className="mb-6">
  {/* フィルタリングコンポーネント */}
</div>

{/* サイトグリッド */}
<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
  {filteredSites.map((site) => (
    <SiteCard key={site.id} site={site} />
  ))}
</div>
```

## 実装の優先順位

### Phase 1: 基本フィルタリング
1. ✅ ステータスでフィルタ
2. ✅ 最終更新日でソート
3. ✅ 検索機能

### Phase 2: UI改善
1. ✅ カードレイアウトの最適化
2. ✅ 情報表示の簡潔化
3. ✅ 空状態の改善

### Phase 3: 高度な機能
1. ⏳ バルク操作（複数選択、一括削除など）
2. ⏳ ビュー切り替え（グリッド / リスト）
3. ⏳ カスタムソート設定の保存

## デザイン原則

### catnose99さんのUIから学ぶべき点

1. **Clarity（明確性）**
   - 情報の階層を明確にする
   - 重要な情報を優先的に表示
   - 不要な装飾を削減

2. **Simplicity（シンプルさ）**
   - 機能を過剰に追加しない
   - ユーザーが迷わないUI
   - 直感的な操作

3. **Consistency（一貫性）**
   - 統一されたデザイン言語
   - 予測可能なインタラクション
   - 一貫したスペーシング

## 参考リンク

- [catnose99さんのGitHub](https://github.com/catnose99?tab=repositories)
- [catnose99さんのウェブサイト](https://catnose.me)

## GitHubリポジトリページの詳細分析

### UI要素の詳細

#### 1. **ヘッダーセクション**
```
┌─────────────────────────────────────────────────────┐
│ @catnose99  catnose99  Follow                       │
│                                                      │
│ Frontend developer.                                  │
│ 899 followers · 10 following                        │
│ Japan · https://catnose.me · X @catnose99          │
└─────────────────────────────────────────────────────┘
```

**特徴:**
- プロフィール情報が簡潔に表示
- ソーシャルリンクが明確
- フォロワー数などの統計情報

#### 2. **フィルタリングバー**
```
┌─────────────────────────────────────────────────────┐
│ Type: [All ▼]  Language: [All ▼]  Sort: [Last updated ▼] │
└─────────────────────────────────────────────────────┘
```

**特徴:**
- ドロップダウン形式のフィルタ
- 複数のフィルタを横並びに配置
- 視覚的に軽量で邪魔にならない

#### 3. **リポジトリカード**
```
┌─────────────────────────────────────────────────────┐
│ awesome-windows  Public                              │
│ Forked from 0PandaDEV/awesome-windows                │
│ An awesome & curated list of tools and apps...       │
│ Creative Commons Zero v1.0 Universal                 │
│ Updated Oct 14, 2025                                  │
└─────────────────────────────────────────────────────┘
```

**特徴:**
- リポジトリ名が大きく表示
- 説明文が2-3行で表示（truncate）
- メタ情報（ライセンス、更新日）が下部に配置
- 言語バッジが色分けされている

### カラーパレット分析

GitHubのデフォルトカラー:
- **背景**: `#0d1117` (ダークモード)
- **カード背景**: `#161b22`
- **ボーダー**: `#30363d`
- **テキスト**: `#c9d1d9`
- **テキスト（ミュート）**: `#8b949e`
- **リンク**: `#58a6ff`
- **言語バッジ**: 各言語ごとに異なる色

### タイポグラフィ

- **リポジトリ名**: 16px, font-weight: 600
- **説明文**: 14px, line-height: 1.5
- **メタ情報**: 12px, color: muted
- **フォント**: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial

### スペーシング

- **カード間のギャップ**: 16px
- **カード内パディング**: 16px
- **セクション間のマージン**: 24-32px
- **フィルタバーのマージン**: 16px

## 詳細な実装例

### 1. 完全なフィルタリングコンポーネント

```tsx
import { useState, useMemo, useEffect } from 'react';

interface FilterState {
  status: 'all' | 'ready' | 'training' | 'idle' | 'error';
  sort: 'last_updated' | 'name' | 'created';
  search: string;
}

export function SiteFilters({ sites, onFilterChange }: {
  sites: Site[];
  onFilterChange: (filtered: Site[]) => void;
}) {
  const [filters, setFilters] = useState<FilterState>({
    status: 'all',
    sort: 'last_updated',
    search: '',
  });

  const filteredSites = useMemo(() => {
    let result = [...sites];

    // ステータスフィルタ
    if (filters.status !== 'all') {
      result = result.filter(site => site.status === filters.status);
    }

    // 検索フィルタ
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(site =>
        site.name.toLowerCase().includes(searchLower) ||
        site.base_url.toLowerCase().includes(searchLower)
      );
    }

    // ソート
    result.sort((a, b) => {
      switch (filters.sort) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'created':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'last_updated':
        default:
          const aTime = a.last_trained_at ? new Date(a.last_trained_at).getTime() : 0;
          const bTime = b.last_trained_at ? new Date(b.last_trained_at).getTime() : 0;
          return bTime - aTime;
      }
    });

    return result;
  }, [sites, filters]);

  useEffect(() => {
    onFilterChange(filteredSites);
  }, [filteredSites, onFilterChange]);

  return (
    <div className="mb-6 flex flex-wrap items-center gap-3 border-b border-premium-stroke/40 pb-4">
      {/* ステータスフィルタ */}
      <div className="flex items-center gap-2">
        <label className="text-xs font-medium text-premium-muted">Type:</label>
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value as any })}
          className="rounded-lg border border-premium-stroke/40 bg-premium-surface/70 px-3 py-1.5 text-sm text-premium-text focus:outline-none focus:ring-2 focus:ring-emerald-400/60"
        >
          <option value="all">All</option>
          <option value="ready">Ready</option>
          <option value="training">Training</option>
          <option value="idle">Idle</option>
          <option value="error">Error</option>
        </select>
      </div>

      {/* ソート */}
      <div className="flex items-center gap-2">
        <label className="text-xs font-medium text-premium-muted">Sort:</label>
        <select
          value={filters.sort}
          onChange={(e) => setFilters({ ...filters, sort: e.target.value as any })}
          className="rounded-lg border border-premium-stroke/40 bg-premium-surface/70 px-3 py-1.5 text-sm text-premium-text focus:outline-none focus:ring-2 focus:ring-emerald-400/60"
        >
          <option value="last_updated">Last updated</option>
          <option value="name">Name</option>
          <option value="created">Created date</option>
        </select>
      </div>

      {/* 検索 */}
      <div className="flex-1 min-w-[200px]">
        <input
          type="search"
          placeholder="Search sites..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          className="w-full rounded-lg border border-premium-stroke/40 bg-premium-surface/70 px-3 py-1.5 text-sm text-premium-text placeholder:text-premium-muted focus:outline-none focus:ring-2 focus:ring-emerald-400/60"
        />
      </div>

      {/* 結果数表示 */}
      <div className="text-xs text-premium-muted">
        {filteredSites.length} {filteredSites.length === 1 ? 'site' : 'sites'}
      </div>
    </div>
  );
}
```

### 2. 改善されたサイトカードコンポーネント

```tsx
interface SiteCardProps {
  site: Site;
  isAdmin: boolean;
  trainingJob?: TrainingJob;
  onStartTraining: (siteId: string) => void;
  onDelete: (siteId: string) => void;
}

export function SiteCard({
  site,
  isAdmin,
  trainingJob,
  onStartTraining,
  onDelete,
}: SiteCardProps) {
  return (
    <Card className="group relative overflow-hidden p-5 transition-all hover:border-emerald-400/30 hover:shadow-lg">
      {/* ヘッダー */}
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h2 className="mb-1 text-lg font-semibold text-premium-text truncate">
            {site.name}
          </h2>
          {/* URLを簡潔に表示 */}
          <a
            href={site.base_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-premium-accent hover:underline truncate block"
            onClick={(e) => e.stopPropagation()}
          >
            {site.base_url}
          </a>
        </div>
        <div className="flex-shrink-0">
          {getStatusBadge(site.status)}
        </div>
      </div>

      {/* メタ情報（GitHubスタイル） */}
      <div className="mb-4 flex flex-wrap items-center gap-4 text-xs text-premium-muted">
        {site.last_trained_at && (
          <div className="flex items-center gap-1">
            <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
            <span>Updated {formatRelativeTime(site.last_trained_at)}</span>
          </div>
        )}
        <div className="flex items-center gap-1">
          <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
          </svg>
          <span>Created {formatRelativeTime(site.created_at)}</span>
        </div>
      </div>

      {/* 学習進捗（training時のみ） */}
      {site.status === 'training' && trainingJob && (
        <div className="mb-4 rounded-lg border border-premium-stroke/40 bg-premium-surface/70 p-3">
          <div className="mb-2 flex items-center justify-between text-xs">
            <span className="font-medium text-premium-text">Training progress</span>
            <span className="text-premium-muted">
              {trainingJob.processed_pages || 0} / {trainingJob.total_pages || 0}
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-premium-elevated/70">
            <div
              className="h-full bg-gradient-to-r from-premium-accent to-premium-accentGlow transition-all duration-300"
              style={{
                width: `${Math.min(100, ((trainingJob.processed_pages || 0) / (trainingJob.total_pages || 1)) * 100)}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* アクションボタン */}
      <div className="flex flex-wrap gap-2">
        {site.status === 'ready' && (
          <Link
            href={`/dashboard/${site.id}`}
            className="flex-1 rounded-lg bg-gradient-to-r from-premium-accent to-premium-accentGlow px-3 py-2 text-center text-sm font-semibold text-slate-900 transition hover:opacity-90"
          >
            Chat
          </Link>
        )}
        {isAdmin && (
          <>
            {site.status !== 'training' && (
              <button
                onClick={() => onStartTraining(site.id)}
                className="rounded-lg border border-premium-stroke/40 bg-premium-surface/70 px-3 py-2 text-sm font-medium text-premium-text transition hover:bg-premium-elevated/70"
              >
                {site.status === 'ready' ? 'Retrain' : 'Train'}
              </button>
            )}
            <button
              onClick={() => onDelete(site.id)}
              className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm font-medium text-rose-100 transition hover:bg-rose-500/20"
            >
              Delete
            </button>
          </>
        )}
      </div>
    </Card>
  );
}

// 相対時間フォーマット関数
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'today';
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}
```

### 3. 空状態の改善（GitHubスタイル）

```tsx
export function EmptyState({ onCreateSite }: { onCreateSite: () => void }) {
  return (
    <Card variant="dashed" className="px-8 py-16 text-center">
      <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-premium-surface/70">
        <svg
          className="h-10 w-10 text-premium-muted"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
      </div>
      <h3 className="mb-2 text-lg font-semibold text-premium-text">
        No sites yet
      </h3>
      <p className="mb-6 text-sm text-premium-muted">
        Get started by creating your first site. You can add multiple sites and manage them all from here.
      </p>
      <Button onClick={onCreateSite} size="md">
        <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        New site
      </Button>
    </Card>
  );
}
```

### 4. レスポンシブグリッドレイアウト

```tsx
export function SiteGrid({ sites }: { sites: Site[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {sites.map((site) => (
        <SiteCard key={site.id} site={site} />
      ))}
    </div>
  );
}
```

## GitHub UIパターンの詳細分析

### インタラクションパターン

1. **ホバーエフェクト**
   - カード: 軽微なシャドウとボーダー色の変化
   - ボタン: 背景色の変化と軽微なスケール
   - リンク: 下線の表示

2. **フォーカス状態**
   - キーボードナビゲーション時の明確なフォーカスリング
   - フォーカス可能要素の視覚的フィードバック

3. **ローディング状態**
   - スケルトンローディング
   - プログレスバーでの進捗表示

### アクセシビリティ

- **ARIAラベル**: すべてのインタラクティブ要素に適切なラベル
- **キーボードナビゲーション**: Tab順序の最適化
- **コントラスト比**: WCAG AA準拠（4.5:1以上）

## 実装チェックリスト

### Phase 1: 基本フィルタリング ✅
- [ ] ステータスフィルタの実装
- [ ] ソート機能の実装
- [ ] 検索機能の実装
- [ ] フィルタ状態のURLパラメータ化（オプション）

### Phase 2: UI改善 ✅
- [ ] サイトカードのリデザイン
- [ ] メタ情報の表示最適化
- [ ] 相対時間表示の実装
- [ ] 空状態の改善
- [ ] レスポンシブデザインの最適化

### Phase 3: 高度な機能 ⏳
- [ ] バルク操作（複数選択）
- [ ] ビュー切り替え（グリッド/リスト）
- [ ] フィルタ設定の保存（localStorage）
- [ ] キーボードショートカット
- [ ] ドラッグ&ドロップでの並び替え

## パフォーマンス最適化

### 仮想スクロール
大量のサイトがある場合のパフォーマンス向上:

```tsx
import { useVirtualizer } from '@tanstack/react-virtual';

export function VirtualizedSiteList({ sites }: { sites: Site[] }) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: sites.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 200,
    overscan: 5,
  });

  return (
    <div ref={parentRef} className="h-[600px] overflow-auto">
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            <SiteCard site={sites[virtualItem.index]} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

## 次のステップ

1. ✅ フィルタリング機能の実装
2. ✅ サイトカードのUI改善
3. ✅ 検索機能の追加
4. ✅ 相対時間表示の実装
5. ⏳ ユーザーテストとフィードバック収集
6. ⏳ 段階的な改善の継続
7. ⏳ パフォーマンス最適化の検討

