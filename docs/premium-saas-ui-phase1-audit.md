# プレミアムSaaS UI監査（Phase 1）

> 参照ドキュメント: `docs/premium-saas-ui-guidelines.md`, `docs/premium-saas-ui-implementation-plan.md`
>
> 目的: 主要画面をガイドラインと照合し、次フェーズ（Design Tokens/コンポーネント刷新）に渡すためのギャップを可視化する。

---

## 1. 対象画面と評価サマリ

| 画面 | ファイル | カラー/トークン | レイアウト/余白 | メッセージ/UX | 優先度 |
| --- | --- | --- | --- | --- | --- |
| LP（マーケ） | `pages/index.tsx` | ⚠️ 旧Tailwindカラーが散在（例: `text-emerald-200`, `bg-white/5`）でトーンが散漫 | ⚠️ セクション単位の余白はあるが 8pt グリッド未統一、装飾過多 | △ CTA文言は良いが「運営が学習」等の最新メッセージが未反映 | High |
| ダッシュボード | `pages/dashboard.tsx` | ⚠️ ほぼ全て `border-white/10` ベース。新トークン未適用 | ⚠️ カード密度が高く、サイト一覧で視線誘導が弱い | △ サブスク案内は追加済みだがバナーのヒエラルキーが弱い | High |
| プラン比較 | `pages/dashboard/plans.tsx` | ✅ 新トークン＆モーション導入済み | ✅ 余白/階層/案内メッセージが新基準を満たす | ✅ 決済後UXも改善 | — |
| ログイン/サインアップ | `pages/auth/login.tsx` | ⚠️ ネオン調の旧配色 (`bg-white/5` + `text-emerald-200/80`) | ⚠️ 入力欄がガラス調でブランドとずれ、アクセスビリティ不足 | ⚠️ コヒーレントなコピー/サクセス案内が不足 | Medium |

---

## 2. 詳細フィードバック

### 2.1 マーケティングLP（`pages/index.tsx`）
- **カラーの一貫性が崩れている**: ヒーロー含めページ全体で `text-emerald-200`, `bg-white/5`, `bg-gradient-to-r from-emerald-400...` が多用され、ガイドラインの「深緑×黒＋限定アクセント」という要件に合わない（例: `pages/index.tsx:195-227`, `262-347`).
- **装飾過多による可読性低下**: ロゴグリッドやプラン表など至る所でグラデーション＋白枠が重なり、HIG/Materialが推奨する“Clarity”が損なわれている（`pages/index.tsx:230-359`).
- **最新UXメッセージ未反映**: 「URL登録→運営が学習→Stripe後の待機案内」というシナリオがLPでは語られていない。CTAの後に期待行動を明示したセクションを追加する必要がある。
- **レスポンシブ余白**: 主要セクションのパディングが固定値のため、モバイルで詰まりが発生（e.g. `px-6` 固定）。8pt系スケールで `px-4 / px-8 / px-12` と段階制御が必要。

### 2.2 ダッシュボード（`pages/dashboard.tsx`）
- **旧スタイルが残ったまま**: ラッパーやカードが `border-white/10 bg-white/5` を多用し、`styles/base.css` で定義したトークンが反映されていない（`pages/dashboard.tsx:740-878`). Premiumトーンに合わせるには `bg-premium-surface`, `text-premium-text` etc. を当てる必要。
- **行動導線の強弱不足**: サイト登録ボタン (`pages/dashboard.tsx:761-868`) が無料ユーザーでも強烈に光る一方、契約後バナー (`pages/dashboard.tsx:834-858`) は控えめで視認性が低い。優先度づけを再設計。
- **情報階層が曖昧**: サイトカード内のテキストスタイルがほぼ同一 (`text-slate-300`/`text-white`)、状態バッジも `border` ベースで視認性が低い (`pages/dashboard.tsx:874-900`). トレーニング進捗に応じて色/アイコンを分ける必要あり。
- **アクセシビリティ**: Loading状態やテーブルテキストが `text-slate-200` など低コントラスト (`pages/dashboard.tsx:723-775`). 新配色で WCAG AA を満たす色へ差し替え推奨。

### 2.3 認証画面（`pages/auth/login.tsx`）
- **ブランドからの乖離**: グラスモーフィズム調 (`bg-white/5`, `text-emerald-200/80`) が強く、ダッシュボードやプラン比較でのシックなトーンとズレる (`pages/auth/login.tsx:74-170`).
- **フォームコントロール**: input が `shadow-[0_15px_35px...]` で過度に光っており、Material/Fluentが推奨する “meaningful elevation” を逸脱。トークン化された focus state（緑ライン＋微光）へ統一する必要。
- **メッセージ不足**: 完了後の案内や「運営が学習するので待機」のコンテキストが無い。ログイン直前でも期待体験を再度伝える文言を追加すべき。

---

## 3. 推奨アクション（Phase 1 → 2 連携）
1. **トークンマップの適用範囲を洗い出す**: LP, ダッシュボード, Auth それぞれで `premium-*` クラスへの置換対象を一覧化。Tailwindプラグイン/`@apply`での共通化を検討。
2. **ヒーロー/CTAコンポーネントの再利用化**: LP・ダッシュボード・プランで CTA スタイルがバラバラなので、フェーズ2で `components/cta-button.tsx` のような共通化を視野に入れる。
3. **ストーリーテリングライン**: LPとアプリ内で「URL登録→運営学習→Stripe決済→完了待ち」の流れを統一。コピー/マイクロ文言をガイドラインの tone & manner に合わせて更新。
4. **アクセシビリティチェックを自動化**: Phase 2 で tokens を導入した後、Lighthouse/AxeでダッシュボードとLPの AA 準拠を確認できるタスクをバックログ化。

---

## 4. 次ステップ
- フェーズ2「デザイントークン & システム定義」へ進む際、本監査で列挙した対象クラス/コンポーネントを優先順に置換。
- 具体的には `pages/dashboard.tsx` と `pages/index.tsx` から着手し、共通カード/ボタンのスタイルを Figma + Tailwind で同期、`premium-saas-ui-guidelines.md` の配色・モーション仕様をそのまま落とし込む。
