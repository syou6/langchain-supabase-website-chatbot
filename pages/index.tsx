import Link from 'next/link';
import { useState } from 'react';
import Layout from '@/components/layout';
import Button from '@/components/ui/Button';

const NAV_LINKS = [
  { label: 'Flow', href: '#flow' },
  { label: '機能', href: '#features' },
  { label: '料金', href: '#pricing' },
  { label: 'FAQ', href: '#faq' },
];

const HERO_FEATURES = [
  '導入から活用まで専任チームが伴走',
  '使った分だけのシンプルな料金体系',
  '95言語を自動認識して自然に応対',
  'まずは 7 日間の無料トライアル',
];

const TRUST_LOGOS = ['Coming Soon 1', 'Coming Soon 2', 'Coming Soon 3', 'Coming Soon 4', 'Coming Soon 5'];

const STAT_ITEMS = [
  { label: 'ベータ参加企業', value: '24社' },
  { label: '稼働中のサイト数', value: '38サイト' },
  { label: '対応言語', value: '95以上' },
  { label: '稼働率', value: '99.9%' },
];

const COMPARISON = {
  before: {
    title: 'よくあるチャットボットの困りごと',
    points: ['回答の精度が日によってバラバラ', '夜間は誰も対応できない', 'ブランドらしさが失われる', '結局サポート工数は減らない'],
  },
  after: {
    title: 'WEBGPT導入後に得られる体験',
    points: ['24時間365日の即時応答', 'ブランドトーンに合わせた会話', '社内ナレッジを安全に活用', '一次対応を自動化してコスト削減'],
  },
};

const STEPS = [
  {
    number: '01',
    title: 'トレーニングデータを同期',
    description: 'ベースURLを登録するだけで、クローラーが対象ページを収集し学習に反映します。',
  },
  {
    number: '02',
    title: 'サイトにインストール',
    description: '発行されたスクリプトを 1 行貼れば、どのCMSでもすぐにチャットが表示されます。',
  },
  {
    number: '03',
    title: '学習と改善',
    description: '会話ログとフィードバックをもとに自動で調整。必要に応じて人の手でも微調整できます。',
  },
];

const DETAILED_FEATURES = [
  {
    badge: 'Personalized',
    title: 'ブランドらしい受け答え',
    description: 'マニュアルやFAQから学習し、トーン&マナーを崩さずに回答します。',
  },
  {
    badge: 'Prompt',
    title: '声かけスクリプト',
    description: '来訪状況に合わせた一言を自動で表示し、会話のきっかけをつくります。',
  },
  {
    badge: 'Summary',
    title: 'メールサマリー',
    description: '1日の問い合わせを要点だけまとめてチームへ共有。素早く振り返れます。',
  },
  {
    badge: 'Human handoff',
    title: '人へのエスカレーション',
    description: 'AIで対応できない内容は、ログ付きで担当者に引き継げます。',
  },
  {
    badge: 'Lead',
    title: 'リード獲得',
    description: 'メールアドレスや要望をチャット内で取得し、そのままCRMへ連携。',
  },
  {
    badge: 'Actions',
    title: 'アクション実行',
    description: '予約・資料送付などを自然言語で指示し、定形処理を自動でこなします。',
  },
];

const FEATURE_CARDS = [
  { icon: '⚡', title: 'すぐに開始', description: 'トライアル申込からその日のうちにプロトタイプを確認できます。' },
  { icon: '🌐', title: '多言語対応', description: 'ユーザーの言語を自動判定し、自然な表現で返答します。' },
  { icon: '💬', title: '会話チューニング', description: 'ナレッジや禁止ワードを設定し、応答の質をコントロール。' },
  { icon: '📊', title: '会話インサイト', description: 'よくある質問や離脱ポイントを可視化し、改善施策に活かせます。' },
  { icon: '🛡️', title: '堅牢なセキュリティ', description: 'データは暗号化して保存し、アクセス権限も細かく管理。' },
  { icon: '✨', title: '継続学習', description: '会話ログをもとに自動でアップデート。必要に応じて再学習も代行します。' },
];

const INTEGRATIONS = [
  { name: 'Slack', icon: '💬' },
  { name: 'Crisp', icon: '💭' },
  { name: 'Intercom', icon: '🎯' },
  { name: 'Zendesk', icon: '🎫' },
  { name: 'Zapier', icon: '⚡' },
  { name: 'Make', icon: '🔧' },
  { name: 'Webhooks', icon: '🔗' },
  { name: 'API', icon: '🔌' },
];

const PRICING_PLANS = [
  {
    name: 'スターター',
    price: '¥980 / 月',
    popular: false,
    description: '月100チャット / サイト 1 件 / 初回学習代行',
    features: ['メールサポート', '埋め込みスクリプト提供', '訪問者ログ簡易レポート'],
    comingSoon: false,
  },
  {
    name: 'スタジオ（近日公開）',
    price: '¥2,980 / 月',
    popular: false,
    description: '月500チャット / サイト 3 件 / 自動再学習',
    features: ['優先サポート', '再学習リクエスト月3回', '準備中：自動アナリティクス'],
    comingSoon: true,
  },
  {
    name: 'アンリミテッド（近日公開）',
    price: '¥9,800 / 月〜',
    popular: false,
    description: 'チャット無制限 / サイト無制限 / 専任サクセス',
    features: ['カスタムブランディング', 'API・Webhook連携', 'SLA / セキュリティレビュー対応'],
    comingSoon: true,
  },
];

const FAQ_ITEMS = [
  {
    question: 'スクレイピングするページがなくてもテキストで学習させられますか？',
    answer: '現在はベースURLを登録していただく形ですが、テキストデータの直接アップロードにも対応予定です。ご希望があればサポートまでご相談ください。',
  },
  {
    question: '実際に触れるデモ環境はありますか？',
    answer: 'ダッシュボードのライブデモ（ログイン後）で実際の応答を試せます。必要に応じてスタッフによる同席デモも調整可能です。',
  },
  {
    question: 'どのようなコンテンツ形式を学習させられますか？',
    answer: '現在は公開URLのHTMLを自動で解析しています。PDFやFAQデータなどの取り込みは順次追加予定です。',
  },
  {
    question: 'サイトの内容が変わったときは自動で再学習しますか？',
    answer: 'スタータープランでは再学習依頼をお送りいただく形です。スタジオ以降のプランでは自動再学習機能を搭載予定です。',
  },
  {
    question: 'チャットボットをサイトに組み込む手順は？',
    answer: '発行された1行のスクリプトを `</body>` 直前に貼るだけです。WordPressやWixなど主要CMSでも同様に設置できます。',
  },
  {
    question: '初回の学習にはどのくらい時間がかかりますか？',
    answer: 'URL登録から最短数時間でテスト可能です。ページ数が多い場合でも原則1営業日以内にサンプルをお送りします。',
  },
  {
    question: '代理店やOEM向けのプランは用意されていますか？',
    answer: '近日公開予定のアンリミテッドプランでOEM/ホワイトラベルに対応予定です。個別要件はお問い合わせください。',
  },
  {
    question: 'ファイルアップロードで学習できますか？',
    answer: '現在はベースURLベースですが、PDFやテキストの直接投入機能を開発中です。ベータ参加をご希望の場合はご連絡ください。',
  },
];

const FINAL_POINTS = [
  '導入〜運用までカスタマーサクセスが伴走',
  '利用規模に合わせたシンプルな料金',
  '95以上の言語を自動でカバー',
  'まずは7日間の無料トライアル',
  '期間中いつでもキャンセルOK',
];

const FLOW_STEPS = [
  { title: 'URLを登録', body: '学習させたいサイトURLを入力するだけで準備完了。' },
  { title: 'WEBGPTが学習', body: '運営チームが内容を確認し最適な返答をセットアップ。' },
  { title: '埋め込み＆公開', body: 'コードを貼るだけで、デモと同じ会話を本番に。' },
];

export default function Home() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  return (
    <Layout showShellHeader={false} fullWidth>
      <div className="relative min-h-screen bg-premium-base text-premium-text">
        <div className="pointer-events-none absolute inset-0 bg-premium-grid opacity-50" />
        <div className="pointer-events-none absolute inset-0 bg-premium-radial opacity-60" />

        <div className="relative z-10">
          <header className="border-b border-premium-stroke/60">
            <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-5 text-sm sm:px-6 lg:px-8">
              <Link href="/" className="flex items-center gap-3 font-semibold text-premium-text">
                <span className="h-8 w-8 rounded-full border border-premium-stroke/50" />
                <span className="tracking-[0.35em] text-premium-muted">WEBGPT</span>
              </Link>
              <nav className="hidden items-center gap-4 text-xs uppercase tracking-[0.25em] text-premium-muted sm:flex">
                {NAV_LINKS.map((link) => (
                  <a key={link.href} href={link.href} className="transition hover:text-premium-accentGlow">
                    {link.label}
                  </a>
                ))}
                <Link
                  href="/auth/login"
                  className="rounded-full border border-premium-stroke/50 px-4 py-2 text-[11px] font-semibold tracking-[0.35em] text-premium-text transition hover:border-premium-accent/50"
                >
                  ログイン
                </Link>
              </nav>
            </div>
          </header>

          <main className="mx-auto max-w-4xl px-4 pb-16 pt-10 sm:px-6 lg:px-8">
            <section className="py-10 text-center">
              <p className="text-xs uppercase tracking-[0.35em] text-premium-muted">AI SUPPORT OS</p>
              <h1 className="mt-4 text-4xl font-semibold leading-tight sm:text-5xl">
                夜間も休日も、あなたのチームの一員としてAIが常駐
              </h1>
              <p className="mt-4 text-base text-premium-muted leading-relaxed">
                WEBGPTはサイトの情報とサポートノウハウを学習し、訪問者の疑問にすぐ応答できる専属チャットコンシェルジュです。
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button size="lg" onClick={() => (window.location.href = '/auth/login')}>
                  無料トライアルを開始
                </Button>
                <Button size="lg" variant="secondary" onClick={() => (window.location.href = '#demo')}>
                  デモを予約
                </Button>
              </div>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs text-premium-muted">
                {NAV_LINKS.map((link) => (
                  <a key={link.href} href={link.href} className="rounded-full border border-premium-stroke/40 px-4 py-2 transition hover:text-premium-accentGlow">
                    {link.label}
                  </a>
                ))}
              </div>
              <div className="mt-10 grid gap-3 text-left sm:grid-cols-2">
                {HERO_FEATURES.map((feature) => (
                  <div key={feature} className="rounded-2xl border border-premium-stroke/40 bg-premium-surface px-4 py-3 text-sm text-premium-muted">
                    <span className="text-premium-accent">✓</span>
                    <span className="ml-3">{feature}</span>
                  </div>
                ))}
              </div>
              <div className="mt-10 flex flex-wrap justify-center gap-3 text-xs text-premium-muted">
                {TRUST_LOGOS.map((logo, idx) => (
                  <span key={`${logo}-${idx}`} className="rounded-full border border-premium-stroke/40 px-4 py-2">
                    {logo}
                  </span>
                ))}
              </div>
            </section>

            <section className="border-t border-premium-stroke/60 py-12">
              <SectionHeading eyebrow="STATS" title="今すぐ数字で確認" align="center" />
              <div className="grid gap-4 text-center sm:grid-cols-2">
                {STAT_ITEMS.map((item) => (
                  <div key={item.label} className="rounded-2xl border border-premium-stroke/40 bg-premium-surface px-6 py-5">
                    <p className="text-3xl font-semibold">{item.value}</p>
                    <p className="text-sm text-premium-muted">{item.label}</p>
                  </div>
                ))}
              </div>
            </section>

            <section id="flow" className="border-t border-premium-stroke/60 py-12">
              <SectionHeading
                eyebrow="FLOW"
                title="導入から活用まで専任チームが伴走"
                description="申し込みから本番公開まで、すべての工程を一緒に進められます。"
              />
              <div className="grid gap-4 md:grid-cols-3">
                {FLOW_STEPS.map((step, idx) => (
                  <div key={step.title} className="rounded-2xl border border-premium-stroke/40 bg-premium-surface p-5 text-sm text-premium-muted">
                    <p className="text-xs uppercase tracking-[0.35em]">Step {String(idx + 1).padStart(2, '0')}</p>
                    <h3 className="mt-3 text-xl font-semibold text-premium-text">{step.title}</h3>
                    <p className="mt-2 leading-relaxed">{step.body}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="border-t border-premium-stroke/60 py-12">
              <SectionHeading eyebrow="Before / After" title="課題と改善をシンプルに比較" />
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-premium-stroke/40 bg-premium-base/60 p-6">
                  <span className="text-xs uppercase tracking-[0.35em] text-premium-muted">以前</span>
                  <h3 className="mt-3 text-2xl font-semibold">{COMPARISON.before.title}</h3>
                  <ul className="mt-4 space-y-3 text-sm text-premium-muted">
                    {COMPARISON.before.points.map((point) => (
                      <li key={point} className="flex items-start gap-3">
                        <span className="text-premium-danger">✕</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-2xl border border-premium-accent/40 bg-premium-surface/80 p-6">
                  <span className="text-xs uppercase tracking-[0.35em] text-premium-accent">導入後</span>
                  <h3 className="mt-3 text-2xl font-semibold">{COMPARISON.after.title}</h3>
                  <ul className="mt-4 space-y-3 text-sm">
                    {COMPARISON.after.points.map((point) => (
                      <li key={point} className="flex items-start gap-3">
                        <span className="text-premium-accent">✓</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            <section id="workflow" className="border-t border-premium-stroke/60 py-12">
              <SectionHeading
                eyebrow="導入フロー"
                title="たった 3 ステップで本番運用へ"
                description="面倒な初期設定は不要。お申し込みから最短即日でテストに進めます。"
              />
              <div className="relative border-l border-premium-stroke/40 pl-8">
                {STEPS.map((step, index) => (
                  <div key={step.number} className="relative pb-12 last:pb-0">
                    <span className="absolute -left-5 flex h-10 w-10 items-center justify-center rounded-full bg-premium-surface text-sm font-semibold text-premium-accent">
                      {step.number}
                    </span>
                    <h3 className="text-xl font-semibold">{step.title}</h3>
                    <p className="mt-2 text-sm text-premium-muted leading-relaxed">{step.description}</p>
                    {index !== STEPS.length - 1 && (
                      <span className="absolute -left-[0.45rem] top-10 h-full w-[1px] bg-premium-stroke/40" />
                    )}
                  </div>
                ))}
              </div>
            </section>

            <section id="features" className="border-t border-premium-stroke/60 py-12">
              <SectionHeading eyebrow="詳細機能" title="サポート現場の「こうだったら」を詰め込みました" align="center" />
              <div className="grid gap-5 md:grid-cols-2">
                {DETAILED_FEATURES.map((feature) => (
                  <div key={feature.title} className="rounded-2xl border border-premium-stroke/40 bg-premium-surface/80 p-5">
                    <span className="text-xs uppercase tracking-[0.35em] text-premium-muted">{feature.badge}</span>
                    <h3 className="mt-3 text-2xl font-semibold">{feature.title}</h3>
                    <p className="mt-2 text-sm text-premium-muted leading-relaxed">{feature.description}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="border-t border-premium-stroke/60 py-12">
              <SectionHeading
                eyebrow="主要機能"
                title="導入・運用・改善をシンプルにする装備"
                description="よく使う機能を厳選し、初めてでも迷わず扱えます。"
                align="center"
              />
              <div className="grid gap-4 md:grid-cols-2">
                {FEATURE_CARDS.map((card) => (
                  <div key={card.title} className="rounded-2xl border border-premium-stroke/40 bg-premium-surface/80 p-5">
                    <div className="text-2xl">{card.icon}</div>
                    <h3 className="mt-3 text-xl font-semibold">{card.title}</h3>
                    <p className="mt-2 text-sm text-premium-muted leading-relaxed">{card.description}</p>
                  </div>
                ))}
              </div>
            </section>

            <section id="integrations" className="border-t border-premium-stroke/60 py-12">
              <SectionHeading
                eyebrow="チャットボットを強化"
                title="外部ツール連携（準備中）"
                description="Slack や Zendesk などとの連携は現在開発中です。対応予定ツールを先行公開しています。"
                align="center"
              />
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {INTEGRATIONS.map((integration) => (
                  <div key={integration.name} className="rounded-2xl border border-premium-stroke/40 bg-premium-surface/70 px-4 py-4 text-center text-sm text-premium-muted transition hover:border-premium-accent/40">
                    <div className="text-2xl">{integration.icon}</div>
                    <p className="mt-2 font-semibold text-premium-text">{integration.name}</p>
                  </div>
                ))}
              </div>
            </section>

            <section id="demo" className="border-t border-premium-stroke/60 py-12">
              <div className="grid gap-6 lg:grid-cols-2">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-premium-muted">ライブデモ</p>
                  <h2 className="mt-3 text-4xl font-semibold">実際の受け答えをその場でチェック</h2>
                  <p className="mt-3 text-sm text-premium-muted leading-relaxed">
                    WEBGPT にサービス内容を質問して、応答スピードや自然さを確認してみてください。例: 「WEBGPTにはどんな機能がありますか？」「料金プランは？」など。
                  </p>
                </div>
                <div className="rounded-2xl border border-premium-stroke/40 bg-premium-surface/70 p-6 text-center">
                  <div className="aspect-video rounded-xl border border-premium-stroke/40 bg-gradient-to-br from-premium-surface to-premium-elevated p-6">
                    <h3 className="text-xl font-semibold">インタラクティブチャットボットデモ</h3>
                    <p className="mt-2 text-sm text-premium-muted">会話を開始して、AI の応答品質を体験しましょう。</p>
                    <Link
                      href="/auth/login"
                      className="mt-6 inline-flex items-center justify-center rounded-full bg-premium-accent px-6 py-2 text-sm font-semibold text-premium-base transition hover:bg-premium-accentGlow"
                    >
                      会話を開始
                    </Link>
                  </div>
                </div>
              </div>
            </section>

            <section className="border-t border-premium-stroke/60 py-12">
              <SectionHeading eyebrow="導入事例" title="導入事例は準備中です" align="center" />
              <div className="rounded-2xl border border-premium-stroke/40 bg-premium-surface/60 p-5 text-center text-sm text-premium-muted">
                現在ベータユーザー様の事例を整理している段階です。公開までしばらくお待ちください。
              </div>
            </section>

            <section id="pricing" className="border-t border-premium-stroke/60 py-12">
              <SectionHeading
                eyebrow="料金プラン"
                title="シンプルでわかりやすい定額制"
                description="全プランに 7 日間の無料トライアルが付属します。"
                align="center"
              />
              <div className="grid gap-4 md:grid-cols-3">
                {PRICING_PLANS.map((plan) => (
                  <div
                    key={plan.name}
                    className={`rounded-2xl border ${
                      plan.comingSoon ? 'border-dashed border-premium-stroke/40 text-premium-muted' : 'border-premium-accent/40'
                    } bg-premium-surface/80 p-6`}
                  >
                    <span className="inline-flex rounded-full border border-premium-stroke/50 px-3 py-1 text-xs font-semibold text-premium-muted">
                      {plan.comingSoon ? '近日公開' : '提供中'}
                    </span>
                    <h3 className={`mt-3 text-2xl font-semibold ${plan.comingSoon ? 'text-premium-text/70' : ''}`}>{plan.name}</h3>
                    <p className="mt-1 text-sm text-premium-muted">{plan.description}</p>
                    <p className="mt-4 text-3xl font-semibold">{plan.price}</p>
                    <ul className="mt-4 space-y-2 text-sm text-premium-muted">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2">
                          <span className={plan.comingSoon ? 'text-premium-muted' : 'text-premium-accent'}>✓</span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    {!plan.comingSoon && (
                      <Link href="/dashboard/plans" className="mt-6 block">
                        <Button className="w-full" size="full">
                          プランを確認
                        </Button>
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </section>

            <section id="faq" className="border-t border-premium-stroke/60 py-12">
              <SectionHeading
                eyebrow="FAQ"
                title="よくあるご質問"
                description="下記で解決しない場合は heartssh@gmail.com までお気軽にご連絡ください。"
                align="center"
              />
              <div className="space-y-3">
                {FAQ_ITEMS.map((faq, idx) => {
                  const isOpen = openFaqIndex === idx;
                  return (
                    <button
                      key={faq.question}
                      type="button"
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      className="w-full rounded-2xl border border-premium-stroke/40 bg-premium-surface/70 px-4 py-4 text-left text-sm text-premium-muted transition hover:border-premium-accent/40"
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-premium-text">
                          <span className="mr-3 text-premium-muted">Q{String(idx + 1).padStart(2, '0')}.</span>
                          {faq.question}
                        </p>
                        <span>{isOpen ? '−' : '+'}</span>
                      </div>
                      {isOpen && <p className="mt-2 text-premium-muted leading-relaxed">{faq.answer}</p>}
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="border-t border-premium-stroke/60 py-12">
              <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-premium-muted">Final Message</p>
                  <h2 className="mt-3 text-4xl font-semibold">WEBGPTをあなたのチームにも</h2>
                  <p className="mt-3 text-sm text-premium-muted leading-relaxed">URL登録→運営が学習→稼働連絡までのフローはすべて私たちが伴走します。</p>
                  <div className="mt-4 space-y-2 text-sm text-premium-muted">
                    {FINAL_POINTS.map((point) => (
                      <div key={point} className="flex items-center gap-2">
                        <span className="text-premium-accent">✓</span>
                        <span>{point}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                  <Button size="lg" onClick={() => (window.location.href = '/auth/login')}>
                    無料トライアルを開始
                  </Button>
                  <Button size="lg" variant="secondary" onClick={() => (window.location.href = '#demo')}>
                    デモを予約
                  </Button>
                </div>
              </div>
            </section>
          </main>

          <footer className="border-t border-premium-stroke/60 bg-premium-base/80">
            <div className="mx-auto max-w-4xl px-4 py-8 text-sm text-premium-muted sm:px-6 lg:px-8">
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <FooterColumn title="製品" links={[{ label: '機能', href: '#features' }, { label: '料金', href: '#pricing' }, { label: '連携', href: '#integrations' }, { label: 'API', href: '/docs' }]} />
                <FooterColumn title="会社" links={[{ label: 'について', href: '/about' }, { label: 'ブログ', href: '/blog' }, { label: '採用情報', href: '/careers' }, { label: 'プレス', href: '/press' }]} />
                <FooterColumn title="リソース" links={[{ label: 'ドキュメント', href: '/docs' }, { label: 'ヘルプセンター', href: '/help' }, { label: 'コミュニティ', href: '/community' }, { label: 'お問い合わせ', href: '/contact' }]} />
                <FooterColumn title="法的情報" links={[{ label: '特定商取引法', href: '/legal' }, { label: 'プライバシー', href: '/privacy' }, { label: '利用規約', href: '/terms' }, { label: 'セキュリティ', href: '/security' }]} />
              </div>
              <div className="mt-6 border-t border-premium-stroke/60 pt-4 text-xs">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-premium-accent/30" />
                  <p>© {new Date().getFullYear()} WEBGPT. All rights reserved.</p>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </Layout>
  );
}

interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  description?: string;
  action?: { label: string; href: string };
  align?: 'left' | 'center';
}

function SectionHeading({ eyebrow, title, description, action, align = 'left' }: SectionHeadingProps) {
  const alignment = align === 'center' ? 'text-center' : 'text-left';

  return (
    <div className={`mb-8 ${alignment}`}>
      <div className={`flex ${align === 'center' ? 'flex-col items-center' : 'flex-col gap-2 sm:flex-row sm:items-end sm:justify-between'}`}>
        <div className={align === 'center' ? 'max-w-2xl' : ''}>
          <p className="text-xs uppercase tracking-[0.35em] text-premium-muted">{eyebrow}</p>
          <h2 className="mt-2 text-3xl font-semibold text-premium-text">{title}</h2>
          {description && <p className="mt-2 text-sm text-premium-muted leading-relaxed">{description}</p>}
        </div>
        {action && align === 'left' && (
          <Link href={action.href} className="text-xs text-premium-muted transition hover:text-premium-accentGlow">
            {action.label}
          </Link>
        )}
      </div>
    </div>
  );
}

interface FooterColumnProps {
  title: string;
  links: { label: string; href: string }[];
}

function FooterColumn({ title, links }: FooterColumnProps) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.35em] text-premium-muted">{title}</p>
      <ul className="mt-3 space-y-2">
        {links.map((link) => (
          <li key={link.label}>
            <Link href={link.href} className="transition hover:text-premium-accentGlow">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
