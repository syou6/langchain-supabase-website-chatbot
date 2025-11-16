# use-chat-submit 実装仕様書

catnose風の「nチャット体験」を実現するための実装仕様書

## 1. 目標と前提

### 1.1 目標（体験仕様）

PC でのチャット入力をこうする：

* **デフォルト（おすすめ）**

  * `Enter` … 改行

  * `Cmd/Ctrl + Enter` … 送信

* もう一つのモード（オプション）

  * `Enter` … 送信

  * `Shift + Enter` … 改行

  * `Cmd/Ctrl + Enter` … 送信

しかも：

* 日本語 IME 変換中は**絶対に送信されない**

* Safari / Chrome / OS によらず挙動が揃う

* 送信ショートカットを UI に文字で出せる（例: `⌘ + Enter で送信`）

これを **`use-chat-submit`** で実装する。([GitHub](https://github.com/catnose99/use-chat-submit))

### 1.2 あなたのスタック前提

* Next.js（React + TypeScript）

* Tailwind CSS

* チャット API は `onSubmit(message: string)` で呼べる前提（中で LangChain + Supabase 呼び出し）。

---

## 2. セットアップ

### 2.1 インストール

README にも書いてある通り、pnpm そのまま使えます。

```bash
pnpm add use-chat-submit

# or

# npm i use-chat-submit
# yarn add use-chat-submit
```

---

## 3. 実装の全体像

### 3.1 コンポーネント構成

最低限こう分けるときれい：

* `ChatInput`

  * textarea + 送信ボタン

  * **ここで useChatSubmit を使う**

* `ChatPage` / `ChatShell`

  * メッセージ一覧 + `ChatInput`

  * `onSubmit` で API（/api/chat）叩く

以下の仕様書は「`ChatInput` を use-chat-submit 仕様にする」ことに集中します。

---

## 4. ChatInput 実装仕様

### 4.1 型と props

```ts
type ChatInputProps = {
  onSubmit: (value: string) => Promise<void> | void;
  disabled?: boolean; // 送信中に true にする
  placeholder?: string;
  className?: string;
};
```

### 4.2 コンポーネント本体（WebGPTカラー適用版）

```tsx
import * as React from "react";
import { useChatSubmit } from "use-chat-submit";

type ChatInputProps = {
  onSubmit: (value: string) => Promise<void> | void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
};

export const ChatInput: React.FC<ChatInputProps> = ({ 
  onSubmit, 
  disabled,
  placeholder = "質問を入力してください...",
  className = "",
}) => {
  const [value, setValue] = React.useState("");

  const {
    getTextareaProps,
    triggerSubmit,
    shortcutHintLabels,
  } = useChatSubmit({
    mode: "mod-enter", // Cmd/Ctrl+Enter で送信 / Enter は改行（日本語向け推奨）
    onSubmit: async (text) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      await onSubmit(trimmed);
      setValue(""); // 送信後クリア
    },
    // allowEmptySubmit: false がデフォルトなので、空文字は送信されない
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        triggerSubmit(); // ボタン押下時も同じロジックを通す
      }}
      className={`space-y-2 ${className}`}
    >
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex-1 rounded-2xl border border-premium-stroke/40 bg-premium-elevated px-4 py-3 
                        focus-within:border-premium-accent focus-within:ring-1 focus-within:ring-premium-accent/60
                        transition">
          <textarea
            {...getTextareaProps({
              value,
              onChange: (e) => setValue(e.target.value),
              placeholder,
              rows: 2,
              className:
                "w-full resize-none border-none bg-transparent text-sm leading-relaxed text-premium-text " +
                "placeholder:text-premium-muted outline-none",
              disabled,
            })}
          />
        </div>
        <button
          type="submit"
          disabled={!value.trim() || disabled}
          className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-premium-accent via-premium-accentGlow to-premium-accent 
                     px-6 py-3 text-sm font-semibold text-slate-900 
                     shadow-[0_20px_45px_rgba(16,185,129,0.35)] 
                     transition hover:-translate-y-0.5 
                     disabled:cursor-not-allowed disabled:bg-premium-surface/70 disabled:text-premium-muted"
        >
          送信
        </button>
      </div>
      <p className="text-xs text-premium-muted">
        {shortcutHintLabels
          ? `${shortcutHintLabels.submit} で送信 · ${shortcutHintLabels.lineBreak} で改行`
          : "Cmd/Ctrl + Enter で送信 · Enter で改行"}
      </p>
    </form>
  );
};
```

### ポイント

* `useChatSubmit` は `getTextareaProps` と `triggerSubmit` を返すので、

  * textarea … `getTextareaProps({...})` で `onKeyDown`・`ref` を合成

  * 送信ボタン … `triggerSubmit()` を叩くだけ

    で Enter もボタンも同じロジックを通せます。

* `shortcutHintLabels` は `{ submit, lineBreak }` を持つオブジェクトで、

  OS に合わせた文字列（例: `⌘ + Enter` / `Ctrl + Enter`）を返してくれるので、そのまま UI に表示できます。

---

## 5. use-chat-submit の API 仕様（使う所だけ整理）

README の API を、あなたが使いそうな部分に絞って日本語でまとめます。

### 5.1 `useChatSubmit(options)`

#### 必須

* `onSubmit(value, ctx)`

  * `value: string` … textarea の現在値

  * `ctx.target` で実際の `<textarea>` 要素も触れる（フォーカス移動などしたければ）

#### よく使う option

* `mode`

  * `"mod-enter"` or `"enter"`

  * **`"mod-enter"`**（推奨）

    * Enter … 改行

    * Shift+Enter … 改行

    * Cmd/Ctrl+Enter … 送信

  * **`"enter"`**

    * Enter … 送信

    * Shift+Enter … 改行

    * Cmd/Ctrl+Enter … 送信

* `modKey`

  * `"meta" | "ctrl" | "auto"`

  * Mac / Windows の判定をライブラリに任せたいなら `"auto"`（デフォルト）で OK。

* `allowEmptySubmit`

  * `true` にすると空文字でも送信される

  * 普通のチャットなら `false` のままでよさそう。

* `stopPropagation`

  * 送信時に `e.stopPropagation()` するかどうか

  * ページ全体のショートカットとバッティングしそうなら `true` も検討。

（`enabled`, `shortcutHintLabelStyle`, `userAgentHint` もあるけど、

基本はデフォルトで問題ないので、最初は触らなくて OK。）

### 5.2 戻り値

* `getTextareaProps(userProps?)`

  * **これを `<textarea>` にスプレッドするのがメインの使い方**

  * ライブラリ側で `onKeyDown` / `ref` を注入してくれる。

  * その他の props（`value`, `onChange`, `className`, `rows` など）は `userProps` に普通に渡せる。

* `triggerSubmit()`

  * ボタンやフォーム `onSubmit` 側から **同じ「送信」処理** を呼びたいときに使う。

* `shortcutHintLabels`

  * `{ submit: string; lineBreak: string } | undefined`

  * OS 判定が終わると入ってくる。

* `textareaRef`

  * `<textarea>` の `RefObject`。送信後に `ref.current?.focus()` とかやりたいなら使える。

* `isEnabled`

  * 現在 hook が有効かどうか。

---

## 6. 現在の実装への適用

### 6.1 現在の実装（`pages/dashboard/[siteId].tsx`）

現在のチャット入力部分（651-678行目）:

```tsx
<form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
  <textarea
    ref={textAreaRef}
    disabled={loading || site.status !== 'ready'}
    onKeyDown={handleEnter}
    rows={2}
    className="flex-1 resize-none rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-400 shadow-[0_15px_35px_rgba(1,5,3,0.35)] backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/70"
    value={query}
    onChange={(e) => setQuery(e.target.value)}
    placeholder={
      site.status === 'ready'
        ? '質問を入力してください...'
        : 'サイトの学習が完了していません'
    }
  />
  <button
    type="submit"
    disabled={loading || !query || site.status !== 'ready'}
    className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-emerald-400 via-green-300 to-cyan-300 px-6 py-3 text-sm font-semibold text-slate-900 shadow-[0_20px_45px_rgba(16,185,129,0.35)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-slate-400"
  >
    送信
  </button>
</form>
```

現在の`handleEnter`関数（441-447行目）:

```tsx
const handleEnter = (e: any) => {
  if (e.key === 'Enter' && query) {
    handleSubmit(e);
  } else if (e.key == 'Enter') {
    e.preventDefault();
  }
};
```

### 6.2 変更後の実装

#### Step 1: ChatInputコンポーネントを作成

`components/chat/ChatInput.tsx` を作成:

```tsx
import * as React from "react";
import { useChatSubmit } from "use-chat-submit";

type ChatInputProps = {
  onSubmit: (value: string) => Promise<void> | void;
  disabled?: boolean;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
};

export const ChatInput: React.FC<ChatInputProps> = ({ 
  onSubmit, 
  disabled,
  placeholder = "質問を入力してください...",
  value,
  onChange,
  className = "",
}) => {
  const {
    getTextareaProps,
    triggerSubmit,
    shortcutHintLabels,
  } = useChatSubmit({
    mode: "mod-enter", // Cmd/Ctrl+Enter で送信 / Enter は改行
    onSubmit: async (text) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      await onSubmit(trimmed);
      onChange(""); // 送信後クリア
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        triggerSubmit();
      }}
      className={`flex flex-col gap-3 sm:flex-row ${className}`}
    >
      <div className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 
                      shadow-[0_15px_35px_rgba(1,5,3,0.35)] backdrop-blur-sm
                      focus-within:border-emerald-400/70 focus-within:ring-2 focus-within:ring-emerald-400/70
                      transition">
        <textarea
          {...getTextareaProps({
            value,
            onChange: (e) => onChange(e.target.value),
            placeholder,
            rows: 2,
            className:
              "w-full resize-none border-none bg-transparent text-sm text-slate-100 " +
              "placeholder:text-slate-400 outline-none",
            disabled,
          })}
        />
      </div>
      <button
        type="submit"
        disabled={!value.trim() || disabled}
        className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-emerald-400 via-green-300 to-cyan-300 
                   px-6 py-3 text-sm font-semibold text-slate-900 
                   shadow-[0_20px_45px_rgba(16,185,129,0.35)] 
                   transition hover:-translate-y-0.5 
                   disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-slate-400"
      >
        送信
      </button>
      {shortcutHintLabels && (
        <p className="text-xs text-slate-400 sm:col-span-2">
          {shortcutHintLabels.submit} で送信 · {shortcutHintLabels.lineBreak} で改行
        </p>
      )}
    </form>
  );
};
```

#### Step 2: `pages/dashboard/[siteId].tsx` を修正

変更点:

1. `use-chat-submit` をインポート（または `ChatInput` コンポーネントを使用）
2. `handleEnter` 関数を削除
3. フォーム部分を `ChatInput` コンポーネントに置き換え

**修正後のコード:**

```tsx
// インポート追加
import { ChatInput } from "@/components/chat/ChatInput";

// handleEnter関数を削除（441-447行目）

// フォーム部分を置き換え（651-678行目）
<div className="border-t border-white/10 px-4 py-5 sm:px-6">
  <div className="mx-auto max-w-3xl">
    <ChatInput
      onSubmit={handleSubmit}
      disabled={loading || site.status !== 'ready'}
      placeholder={
        site.status === 'ready'
          ? '質問を入力してください...'
          : 'サイトの学習が完了していません'
      }
      value={query}
      onChange={setQuery}
    />
  </div>
</div>
```

**`handleSubmit`関数の修正:**

現在の`handleSubmit`は`e.preventDefault()`を期待しているので、`ChatInput`から呼ばれる場合は`e`が`undefined`になる可能性があります。修正:

```tsx
async function handleSubmit(e?: any) {
  e?.preventDefault();

  if (!query || !siteId || typeof siteId !== 'string') {
    return; // alertは削除（UIで無効化されているので不要）
  }

  if (site?.status !== 'ready') {
    return; // alertは削除
  }

  const question = query.trim();
  // ... 以下既存のロジック
}
```

---

## 7. 埋め込みチャット（embed script）への適用

`pages/api/embed/script.ts` で生成される埋め込みスクリプトにも適用する場合。

### 7.1 現在の実装確認

埋め込みスクリプト内の入力欄（`pages/api/embed/script.ts` を確認）:

現在は通常の`textarea`と`keypress`イベントを使用している可能性があります。

### 7.2 適用方法

埋め込みスクリプトは通常のReactコンポーネントではないため、`use-chat-submit`を直接使うのは難しいです。

**オプション1: 埋め込みスクリプトをReact化する**

* 埋め込みスクリプトを小さなReactアプリとして配布
* `use-chat-submit`をそのまま使用可能

**オプション2: ロジックを移植する**

* `use-chat-submit`のロジックを読み解いて、バニラJSで再実装
* IME対応の`isComposing`チェックを自前で実装

**推奨: オプション1**

埋め込みスクリプトもReact化すれば、`use-chat-submit`をそのまま使えます。

---

## 8. チャットページ側（`ChatShell`）の使い方

上の `ChatInput` を、既存のチャットページからこう呼ぶイメージ：

```tsx
// pages/dashboard/[siteId].tsx

import { ChatInput } from "@/components/chat/ChatInput";

export default function SiteChat() {
  const [query, setQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  // ...

  const handleSubmit = async (text: string) => {
    // ここに LangChain / Supabase 呼び出しロジック
    const question = text.trim();

    setMessageState((state) => ({
      ...state,
      messages: [
        ...state.messages,
        {
          type: 'userMessage',
          message: question,
        },
      ],
      pending: undefined,
    }));

    setQuery('');
    setMessageState((state) => ({ ...state, pending: '' }));
    setLoading(true);

    // ... 既存のfetchEventSourceロジック
  };

  return (
    <div className="flex min-h-screen flex-col bg-premium-base text-premium-text">
      {/* メッセージ一覧 */}
      <main className="flex-1">
        {/* ... */}
      </main>
      
      <div className="border-t border-premium-stroke/60 px-4 py-5">
        <ChatInput 
          onSubmit={handleSubmit} 
          disabled={loading || site.status !== 'ready'}
          value={query}
          onChange={setQuery}
        />
      </div>
    </div>
  );
}
```

これで：

* IME 中の Enter で誤送信しない

* Cmd/Ctrl+Enter / Shift+Enter の挙動が**常に一定**

* 送信ボタンも同じ `onSubmit` を通る

という **catnose ライクな「nチャット体験」** を作れます。

---

## 9. 最低限の運用ルール

* **モードは基本 `"mod-enter"` 固定で良い**

  日本語ユーザー前提なら、まずこれで困らない。

* あとから「設定画面」で `"enter"` / `"mod-enter"` を切り替えることも可能

  → `mode` をユーザー設定から渡すだけ。

* IME 対応はライブラリ側がやってくれるので、

  自前で `isComposing` 判定はもう書かなくてよい。

---

## 10. 実装チェックリスト

### Phase 1: セットアップ ✅
- [ ] `use-chat-submit` をインストール
- [ ] `ChatInput` コンポーネントを作成
- [ ] 基本的な動作確認

### Phase 2: ダッシュボードチャットへの適用 ✅
- [ ] `pages/dashboard/[siteId].tsx` のフォームを `ChatInput` に置き換え
- [ ] `handleEnter` 関数を削除
- [ ] `handleSubmit` 関数を修正（`e`をオプショナルに）
- [ ] 動作確認（IME変換中に送信されないことを確認）

### Phase 3: 埋め込みチャットへの適用 ⏳
- [ ] 埋め込みスクリプトのReact化を検討
- [ ] または、バニラJSでロジックを移植
- [ ] 動作確認

### Phase 4: ユーザー設定（オプション） ⏳
- [ ] 設定画面で `mode` を切り替えられるようにする
- [ ] localStorage に保存
- [ ] デフォルトは `"mod-enter"`

---

## 11. トラブルシューティング

### 問題: IME変換中に送信されてしまう

**原因:** `use-chat-submit`が正しく適用されていない

**解決策:**
- `getTextareaProps`を正しくスプレッドしているか確認
- `onKeyDown`を上書きしていないか確認

### 問題: 送信ボタンを押しても送信されない

**原因:** `triggerSubmit()`が呼ばれていない

**解決策:**
- フォームの`onSubmit`で`e.preventDefault()`と`triggerSubmit()`を呼んでいるか確認
- ボタンの`type="submit"`が設定されているか確認

### 問題: ショートカットヒントが表示されない

**原因:** `shortcutHintLabels`が`undefined`

**解決策:**
- OS判定が完了するまで時間がかかる場合がある
- フォールバックテキストを表示する

---

## 12. 参考リンク

- [use-chat-submit GitHub](https://github.com/catnose99/use-chat-submit)
- [catnose99さんのGitHub](https://github.com/catnose99)
- [catnose99さんのウェブサイト](https://catnose.me)

---

## 13. 次のステップ

このドキュメントをベースに、

1. `use-chat-submit` をインストール
2. `ChatInput` コンポーネントを作成
3. `pages/dashboard/[siteId].tsx` を修正
4. 動作確認

ところまでいけば、**catnose ライクな「nチャット体験」** が実現できます。

