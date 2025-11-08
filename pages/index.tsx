import Link from 'next/link';
import Layout from '@/components/layout';

const features = [
  {
    title: 'URLを渡すだけ',
    description:
      'チャットボット化したいページURLを登録するだけでOK。複雑なセットアップやクローラー設定は不要です。',
    badge: 'Step 1',
  },
  {
    title: 'SiteGPTが学習を代行',
    description:
      '私たちのチームがコンテンツを最適化し、Spotify / Supabase 風のネオングローUIに合わせてセットアップします。',
    badge: 'Step 2',
  },
  {
    title: '埋め込みスクリプトを受け取る',
    description:
      '生成されたウィジェットを 1 行の `<script>` でサイトに設置。以降の更新もダッシュボードから依頼できます。',
    badge: 'Step 3',
  },
];

const sellingPoints = [
  {
    title: 'ネオングロウなUI',
    description: 'Spotify/Supabase を意識したグラスデザインで、既存サイトに自然に溶け込みます。',
  },
  {
    title: '手ぶら導入',
    description: '学習～テスト～埋め込みまでワンストップ。URL登録と最終確認以外の負担はゼロ。',
  },
  {
    title: 'Supabase / LangChain ベース',
    description: '堅牢なキュー&ワーカー構成で、更新依頼にも素早く対応。',
  },
];

export default function Home() {
  return (
    <Layout>
      <div className="relative overflow-hidden bg-gradient-to-b from-[#01090f] via-[#030a12] to-[#00040a] text-slate-100">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 right-0 h-72 w-72 rounded-full bg-emerald-500/20 blur-3xl" />
          <div className="absolute left-10 top-1/2 h-64 w-64 rounded-full bg-cyan-400/20 blur-[160px]" />
        </div>

        <main className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl flex-col gap-16 px-6 py-16 sm:py-20">
          {/* Hero */}
          <section className="grid gap-10 lg:grid-cols-[3fr_2fr] lg:items-center">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-emerald-200/80">SiteGPT Neon</p>
              <h1 className="mt-3 text-4xl font-semibold leading-tight text-white sm:text-5xl">
                URLを渡すだけで<br className="hidden sm:block" />
                Spotify / Supabase を彷彿とさせる<br className="hidden sm:block" />
                チャットボットを最速導入
              </h1>
              <p className="mt-6 text-base text-slate-300 sm:text-lg">
                既存サイトのコピーを用意しなくてもOK。学習も埋め込みセットアップも SiteGPT チームがすべて代行します。
                あなたは URL を登録し、完了通知を待つだけ。
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/auth/login"
                  className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-emerald-400 via-green-300 to-cyan-300 px-6 py-3 text-base font-semibold text-slate-900 shadow-[0_25px_45px_rgba(16,185,129,0.35)] transition hover:-translate-y-0.5"
                >
                  無料で始める
                </Link>
                <a
                  href="#workflow"
                  className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-6 py-3 text-base font-medium text-slate-100 transition hover:bg-white/10"
                >
                  導入フローを見る →
                </a>
              </div>

              <div className="mt-10 grid gap-6 text-sm text-slate-300 sm:grid-cols-3">
                {['URL登録だけ', '埋め込み1行', '運営が代行'].map((item) => (
                  <div key={item} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[30px] border border-white/10 bg-gradient-to-b from-[#07151f] via-[#060c15] to-[#04060a] p-6 shadow-[0_40px_120px_rgba(1,5,3,0.75)]">
              <p className="text-xs uppercase tracking-[0.25em] text-emerald-200">実際の体験</p>
              <p className="mt-3 text-2xl font-semibold text-white">「URLを貼る → 数時間後には埋め込みコードが届いた」</p>
              <p className="mt-4 text-sm text-slate-400">
                - BtoB SaaS カスタマーサクセス
              </p>
              <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
                ダッシュボードから学習依頼を出すだけで、Spotify / Supabase 風のウィジェットが完成。1 行のスクリプトで本番サイトに実装できました。
              </div>
            </div>
          </section>

          {/* Selling points */}
          <section className="grid gap-6 md:grid-cols-3">
            {sellingPoints.map((point) => (
              <div key={point.title} className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
                <p className="text-sm uppercase tracking-[0.3em] text-emerald-200/80">Highlight</p>
                <h3 className="mt-2 text-xl font-semibold text-white">{point.title}</h3>
                <p className="mt-3 text-sm text-slate-300">{point.description}</p>
              </div>
            ))}
          </section>

          {/* Workflow */}
          <section id="workflow" className="rounded-[32px] border border-white/10 bg-white/5 p-6">
            <p className="text-xs uppercase tracking-[0.35em] text-emerald-200">Workflow</p>
            <h2 className="mt-2 text-3xl font-semibold text-white">3 ステップで導入完了</h2>
            <p className="mt-2 text-sm text-slate-300">
              まずは登録フォームからサイトURLを送ってください。学習・テスト・埋め込みまでワンストップでお手伝いします。
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {features.map((feature) => (
                <div key={feature.title} className="rounded-3xl border border-white/10 bg-slate-950/30 p-5">
                  <span className="rounded-full border border-emerald-400/40 px-3 py-1 text-xs font-semibold text-emerald-100">
                    {feature.badge}
                  </span>
                  <h3 className="mt-3 text-xl font-semibold text-white">{feature.title}</h3>
                  <p className="mt-2 text-sm text-slate-300">{feature.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="rounded-[32px] border border-white/10 bg-gradient-to-r from-emerald-500/20 via-green-400/10 to-cyan-400/20 p-6 text-center shadow-[0_35px_120px_rgba(1,6,3,0.55)]">
            <p className="text-xs uppercase tracking-[0.35em] text-emerald-100">Get started</p>
            <h2 className="mt-2 text-3xl font-semibold text-white">今すぐ URL を登録しよう</h2>
            <p className="mt-3 text-sm text-slate-100">
              登録後すぐにダッシュボードで状況を確認できます。学習・埋め込みは私たちが代行します。
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Link
                href="/auth/login"
                className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 shadow-[0_20px_45px_rgba(255,255,255,0.25)]"
              >
                今すぐはじめる
              </Link>
              <a
                href="mailto:support@sitegpt.jp"
                className="rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white"
              >
                個別相談する
              </a>
            </div>
          </section>
        </main>
      </div>
    </Layout>
  );
}
