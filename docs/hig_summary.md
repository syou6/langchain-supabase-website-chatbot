# 🧭 Apple Human Interface Guidelines（HIG）完全要約

## 🪞 概要

Apple の **Human Interface Guidelines（HIG）** は、すべての Apple プラットフォーム（[iOS](https://developer.apple.com/design/human-interface-guidelines/ios/), [iPadOS](https://developer.apple.com/design/human-interface-guidelines/ipados/), [macOS](https://developer.apple.com/design/human-interface-guidelines/macos/), [watchOS](https://developer.apple.com/design/human-interface-guidelines/watchos/), [tvOS](https://developer.apple.com/design/human-interface-guidelines/tvos/), [visionOS](https://developer.apple.com/design/human-interface-guidelines/visionos/))で「直感的・美しく・一貫性のある」体験を実現するための公式リファレンスです。

このまとめでは、プレミアムSaaSで HIG を活かすための要点と実装ヒントを章別に整理します。`premium-saas-ui-guidelines.md` / `premium-saas-ui-implementation-plan.md` と併用し、デザイン→実装→QA の各フェーズで参照してください。

---

## 0. 🎯 HIG のコア原則（Clarity / Deference / Depth）

| 原則 | 意味 | WEBGPT での適用例 |
| --- | --- | --- |
| **Clarity（明確性）** | 役割・階層・操作を一目で理解できるようにする | KPIカード上限3つ、主要CTAはPrimary Greenで統一、指示文はPlain Language。
| **Deference（尊重）** | コンテンツが主役。UIは控えめにサポート | Glassmorphismは背景のみ、コピーや指標を中心に見せる。
| **Depth（深度）** | 階層・奥行き・モーションで操作の結果を伝える | Elevation map（Base0/Surface2/Modal6）と200–300msの遷移を準備。 |

> **実務メモ**: 各画面レビュー時は上表を口頭チェック→「Clarityが崩れていないか？」の観点でFigmaコメントを残すと意図が揃います。

---

## 1. 🌈 デザインの基本原則（Foundations）

### 1.1 [カラー（Color）](https://developer.apple.com/design/human-interface-guidelines/color)
- **意味のある色使い**を行う。機能の区別や状態表示に色を使うが、情報伝達は色だけに頼らない。  
- **ライトモード / ダークモード** に両対応させる。システムカラーを利用することで自動適応。  
- **コントラスト比の基準**：小さい文字は 4.5:1 以上、大きい文字は 3:1 以上を推奨。

> **WEBGPT 実装ヒント**
> - `Base/Surface/Primary` トークンをライト・ダーク両方で定義し、HIGのシステムカラー（Label/Secondary/Fills）との対応表をつくる。  
> - Stripe 成功バナーなど状態色は Apple の Semantic Color (Green/Orange/Red/Blue) に近いトーンへ寄せると審査で通りやすい。

---

### 1.2 [タイポグラフィ（Typography）](https://developer.apple.com/design/human-interface-guidelines/typography)
- Apple標準フォントは **San Francisco（SF）** と **New York**。  
- SFは無駄のないサンセリフ体で、UI向け。New Yorkは読み物やタイトル向け。  
- **Dynamic Type** により、ユーザー設定の文字サイズに追従。  
- フォントサイズ・ウェイト・カラーを活用し「階層」を明確化する。

> **WEBGPT 実装ヒント**
> - Web実装では `Inter` や `Söhne` を使いながら、HIG推奨の文字サイズ比（H1:48/56, Body:16/24）を維持する。  
> - `prefers-reduced-motion` と合わせて `prefers-contrast` も検出し、Dynamic Type代替として `font-size: clamp()` を活用。

---

### 1.3 [レイアウト（Layout）](https://developer.apple.com/design/human-interface-guidelines/layout)
- **Safe Area** 内に主要要素を配置し、角丸ディスプレイなどに対応。  
- 要素間の「整列」と「間隔（Spacing）」を一貫して保つ。  
- **Auto Layout / SwiftUI Layout** を使うことでデバイスサイズに自動調整。  
- 情報の優先度に応じた**視覚的階層（Visual Hierarchy）**を設計。

> **WEBGPT 実装ヒント**
> - 8ptグリッドを基本にしつつ、Safe Area を意識して左右24pxの内側にCTAを収める。  
> - レスポンシブ時は「カード→スタック」の順で崩し、HIGで推奨される上→下の情報フローを崩さない。

---

### 1.4 [アイコン（Icons）](https://developer.apple.com/design/human-interface-guidelines/icons)
- シンプルで、直感的に意味が伝わる形状を採用。  
- **[SF Symbols](https://developer.apple.com/sf-symbols/)** を活用すれば、システム標準のスタイルと整合性が取れる。  
- カスタムアイコンはベクター（SVG/PDF）形式推奨。  
- サイズ、比率、パディングは一貫性を保つ。

> **WEBGPT 実装ヒント**
> - ダッシュボードのアクションアイコンは SF Symbols の `rectangle.and.pencil.and.ellipsis` 等を流用し、tailwindで線幅を調整。  
> - 独自アイコンを作る際も角丸比率 1:20 を意識すると HIG と調和する。

---

### 1.5 [マテリアル（Materials）](https://developer.apple.com/design/human-interface-guidelines/materials)
- **Liquid Glass** など、半透明レイヤーを利用して深みと階層を表現。  
- 機能層（ナビバーなど）とコンテンツ層を明確に分離。  
- **ぼかし・鮮やかさ・ブレンドモード**を適切に使用することで構造を作る。

> **WEBGPT 実装ヒント**
> - ガラス風カードは `backdrop-filter: blur(20px)` と `border: rgba(255,255,255,0.1)` を組み合わせ、背景動画があっても可読性を確保。  
> - Elevation 6 以上のモーダルには `drop-shadow(0 45px 120px rgba(1,8,4,0.45))` を適用し、奥行き感を統一。

---

### 1.6 [モーション（Motion）](https://developer.apple.com/design/human-interface-guidelines/motion)
- 動きは**目的を持たせる**（＝意味のない動きは避ける）。  
- 状態変化を補助する短いアニメーションで、ユーザーの理解を助ける。  
- 過度な動き・長時間のループは避け、視覚的な疲労を防ぐ。  
- システムが提供する標準アニメーション（Appear, Scale, Bounce等）を活用。

> **WEBGPT 実装ヒント**
> - CTAやバナーは 200–250ms / `cubic-bezier(0.4, 0, 0.2, 1)` をデフォルトとして `motion-reduce` で即時遷移に切替。  
> - 学習進捗バーは HIG の Activity 指針に倣い「確実な進捗（Determinate）」表示を優先する。

---

### 1.7 [アクセシビリティ（Accessibility）](https://developer.apple.com/design/human-interface-guidelines/accessibility)
- **VoiceOver / Dynamic Type / 高コントラスト**など、支援機能を完全サポート。  
- 色だけで状態を示さず、形やテキストでも示す。  
- 操作領域は最低 **44×44pt** を確保。  
- 音声・触覚・視覚など、複数の感覚経路で情報を伝達。

> **WEBGPT 実装ヒント**
> - Form フィールドは `aria-describedby` でエラーメッセージを関連づけ、成功トーストは `role="status"` に設定。  
> - タップ領域は `min-h-[44px]` で担保し、チェックリストで「Hoverだけに頼っていないか」を確認。

---

### 1.8 [プライバシー（Privacy）](https://developer.apple.com/design/human-interface-guidelines/privacy)
- データアクセスは**必要な時だけ**許可を求める。  
- 許可理由（Usage Description）は**明確で具体的**に。  
- Apple提供の**システム許可UI**を使用し、模倣UIは禁止。  
- 個人データはローカル保存またはSecure Enclaveで保護。

> **WEBGPT 実装ヒント**
> - OAuthや通知許諾モーダルはネイティブUIを尊重し、Webではモーダル文言を短く・主語を明確にする。  
> - サポートチャットで取得するメールアドレス等の扱いを `privacy.md` に追記し、プロンプトでも開示。

---

### 1.9 [右から左（Right-to-Left, RTL）対応](https://developer.apple.com/design/human-interface-guidelines/right-to-left)
- アラビア語やヘブライ語などに対応する際は、**UI要素を鏡像反転**。  
- ただし、画像・ロゴなど意味が変わるものは反転禁止。  
- テキスト揃え・スライダー方向・アニメーション方向も反転。

> **WEBGPT 実装ヒント**
> - `dir="rtl"` テストページを用意し、ヘッダー内のアイコン順序やアコーディオン矢印を鏡像反転できているか確認。  
> - チャートや進捗バーなど「意味が変わる」ビジュアルはRTLでも左→右進行を維持する。

---

### 1.10 [SF Symbols（シンボル設計）](https://developer.apple.com/design/human-interface-guidelines/sf-symbols)
- 4種類のレンダリングモード：Monochrome / Hierarchical / Palette / Multicolor。  
- アニメーション（Appear, Replace, Bounce, Wiggle, Breathe等）で動きを付与可能。  
- シンボルの**ウェイト・スケール・変形**はテキストと連動。

> **WEBGPT 実装ヒント**
> - SF Symbols をSVGに書き出して Tailwind `stroke-[1.5]` などで制御。ブランド色を適用する際も Hierarchical モードを意識。  
> - Animated Symbol を利用する場合は `prefers-reduced-motion` で停止できるようにする。

---

### 1.11 [ビジョンOSの空間設計（Spatial Layout）](https://developer.apple.com/design/human-interface-guidelines/spatial-layout)
- **Field of View（視野）**：要素を常に視界内に配置。  
- **Depth（奥行）**：影・反射・色温度の変化で立体感を出す。  
- **Scale（スケール）**：距離に応じてサイズを調整。  

> **WEBGPT 実装ヒント**
> - 今後 visionOS でダッシュボードを展開する際は「カードは 45–60° の視線内に配置」「奥行方向へ 20pt 以上離す」などHIGの距離ルールを下敷きにする。  
> - 2D UI でもパララックス用の影・光源の方向を統一しておくと XR 展開がスムーズ。

---

## 2. ⚙️ 推奨パターン & コンポーネント

| 項目 | HIGの要点 | WEBGPTでの意識ポイント |
| --- | --- | --- |
| **ナビゲーションバー** | タイトルを中央に、主要アクションは右側。スクロール時はサイズを縮小。 | Dashboardヘッダーはガラスモーフィズムで浮かせつつ、CTAは右端へ固定。 |
| **リスト / テーブル** | 単列の情報フロー、余白でグループ化。 | Plansテーブルは iOS Table のパディング(Left 16, Right 16)に合わせ、区切り線は 1px / 20% opacity。 |
| **カード** | 内容に応じて分割し、タップ領域を 44pt 以上に。 | KPIカードはタイトル→値→トレンドの順に配置し、角丸24pxでAppleらしい柔らかさにする。 |
| **フォーム** | ラベルは一貫して上配置、インラインValidationで即フィードバック。 | URL入力フォームは `TextField` パターンに倣い、失敗時は赤 + 説明文を同列表示。 |
| **通知 / トースト** | アラートは阻害しない軽量な表示。CTAは最大2つ。 | Stripe完了トーストは HIG の Banner スタイルを踏襲し、Primary CTA + Close のみ配置。 |

### 2.1 エコシステム連携
- HIGは AppKit / UIKit / SwiftUI ですぐ使えるコンポーネントを網羅しているため、Webで模倣する際も命名と階層を合わせるとマルチプラットフォーム展開が簡単になります。
- `premium-saas-ui-implementation-plan.md` の Phase3 でコンポーネント再設計を行う際、本表をそのまま仕様書のテンプレとして差し込むと Apple らしい一貫性を担保できます。

---

## 3. ✅ 運用チェックリスト（HIG対応）
- [ ] Clarity / Deference / Depth の3原則を画面レビューで毎回チェックしたか？
- [ ] System Colors / SF Symbols を使った箇所に代替テキスト・ラベルを付けたか？
- [ ] Dynamic Type / prefers-reduced-motion / prefers-contrast の3条件でレイアウト崩れがないか？
- [ ] Stripe完了バナーなど状態表示は、色以外のアイコン・テキストでも意味を伝えているか？
- [ ] RTLデモページ・スクリーンリーダー検証結果を Notion にログ化したか？
- [ ] ライブラリにないモーション・ガラスエフェクトを追加した場合、再利用ガイドをドキュメント化したか？

---

## 4. 🚀 WEBGPTへの適用ロードマップ（1つずつ実装）

| フェーズ | 画面 / コンポーネント | 目的（HIG観点） | 具体タスク | 担当 |
| --- | --- | --- | --- | --- |
| 1 | Dashboard Hero + ナビ | Clarity / Deference を最優先 | ・Hero内KPIを3つに制限し、Primary CTAを右端へ固定<br>・ガラスヘッダーのSafe Area内配置とスクロール時の縮小アニメを適用 | Design → Frontend |
| 2 | KPIカード & Training進捗 | Depth / Motion | ・Elevation mapに沿ったCard/Surface差分を定義<br>・Determinate Progress + 200ms easing を `shared/motion.ts` に追加 | Design System |
| 3 | URL登録フォーム | Clarity / Accessibility | ・テキストフィールドを上ラベル + インラインバリデーションへ変更<br>・44pxタップ領域と `aria-describedby` 紐付けを実装 | Frontend |
| 4 | Stripe完了バナー & トースト | Deference / System Colors | ・HIG Bannerパターンで背景をSecondary Fill、CTAは2件まで<br>・`role="status"` + Closeボタンを明示 | Frontend |
| 5 | Plansテーブル & Pricingカード | Clarity / Layout | ・左右16pxの余白、行間8/16pxのグリッドを適用<br>・重要情報→補足情報の順で並び替え | Design |
| 6 | ダーク/ライト / RTL / Motion Reduce | Accessibility | ・`prefers-color-scheme` 切替用のトークンマッピングを作成<br>・RTLチェックリストと `motion-reduce` 対応のスクリーン録画をNotionへ添付 | QA |

### 実装手順メモ
1. フェーズ1をFigmaでモック化 → `premium-saas-ui-implementation-plan.md` Phase4に添付。  
2. 各フェーズ完了時にこの表へ ✅ を追記し、GitHub PRに「HIG phase1」などのラベルを付ける。  
3. 週次のデザインレビューではフェーズ順に進捗を報告し、Clarity/Deference/Depthの観点で差分確認。  
4. 完了後は `premium-saas-ui-guidelines.md` の該当章へスクリーンショットと寸法を反映し、ガイドラインを最新版に保つ。

---

## 📎 参考リンク
- [Apple Human Interface Guidelines 公式サイト](https://developer.apple.com/design/human-interface-guidelines/)
- [SF Symbols Documentation](https://developer.apple.com/sf-symbols/)
- [Accessibility Developer Resources](https://developer.apple.com/accessibility/)
