import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/layout';
import Link from 'next/link';
import { createSupabaseClient } from '@/utils/supabase-auth';
import {
  PLAN_CONFIG,
  planOrder,
  PlanTier,
  InternalPlan,
  getPlanLabel,
} from '@/lib/planConfig';

interface User {
  id: string;
  plan: InternalPlan;
  chat_quota: number;
  embedding_quota: number;
  stripe_subscription_id?: string | null;
  subscription_status?: string | null;
  cancel_at_period_end?: boolean | null;
}

const AVAILABLE_PLAN_TIERS: PlanTier[] = ['solo'];

const planCards = planOrder.map((tier) => ({
  tier,
  ...PLAN_CONFIG[tier],
  comingSoon: !AVAILABLE_PLAN_TIERS.includes(tier),
}));

export default function PlansPage() {
  const router = useRouter();
  const [authLoading, setAuthLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [upgrading, setUpgrading] = useState<PlanTier | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [resumeLoading, setResumeLoading] = useState(false);
  const [stripeError, setStripeError] = useState<string | null>(null);
  const supabase = createSupabaseClient();

  // 認証チェック
  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push('/auth/login');
        return;
      }

      setAuthLoading(false);
    };

    checkAuth();
  }, [router, supabase]);

  // ユーザー情報を取得
  useEffect(() => {
    if (authLoading) return;

    const fetchUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) return;

      try {
        setLoading(true);

        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (userError || !userData) {
          // ユーザーが存在しない場合は作成
          const { data: newUser } = await supabase
            .from('users')
            .insert({
              id: session.user.id,
              plan: 'starter',
              chat_quota: 1000,
              embedding_quota: 100000,
            })
            .select()
            .single();

          if (newUser) {
            setUser(newUser);
          }
        } else {
          setUser(userData);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [authLoading, supabase]);

  const handleCheckout = async (tier: PlanTier) => {
    if (!user || upgrading || !AVAILABLE_PLAN_TIERS.includes(tier)) {
      return;
    }

    const targetPlan = PLAN_CONFIG[tier];
    if (user.plan === targetPlan.internalPlan) {
      return;
    }

    try {
      setStripeError(null);
      setUpgrading(tier);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error('認証情報の取得に失敗しました。再ログインしてください。');
      }

      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ plan: tier }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(payload?.message || '決済セッションの作成に失敗しました。');
      }

      if (payload?.url) {
        window.location.href = payload.url as string;
        return;
      }

      throw new Error('StripeチェックアウトURLが取得できませんでした。');
    } catch (error: any) {
      console.error('Stripe checkout error:', error);
      setStripeError(error?.message ?? '決済ページへの遷移に失敗しました。');
    } finally {
      setUpgrading(null);
    }
  };

  const handleCancelSubscription = async () => {
    if (!user || cancelLoading) {
      return;
    }

    if (!confirm('次回の更新タイミングで解約します。よろしいですか？')) {
      return;
    }

    try {
      setStripeError(null);
      setCancelLoading(true);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error('認証情報の取得に失敗しました。再ログインしてください。');
      }

      const response = await fetch('/api/stripe/cancel-subscription', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (response.status === 401) {
        throw new Error('認証情報の有効期限が切れました。ログインし直してください。');
      }

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(payload?.message || '解約処理に失敗しました。');
      }

      setUser({
        ...user,
        subscription_status: payload?.status ?? user.subscription_status,
        cancel_at_period_end:
          typeof payload?.cancel_at_period_end === 'boolean'
            ? payload.cancel_at_period_end
            : true,
      });
    } catch (error: any) {
      console.error('Cancel subscription error:', error);
      setStripeError(error?.message ?? '解約手続きに失敗しました。');
    } finally {
      setCancelLoading(false);
    }
  };

  const handleResumeSubscription = async () => {
    if (!user || resumeLoading) {
      return;
    }

    try {
      setStripeError(null);
      setResumeLoading(true);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error('認証情報の取得に失敗しました。再ログインしてください。');
      }

      const response = await fetch('/api/stripe/resume-subscription', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (response.status === 401) {
        throw new Error('認証情報の有効期限が切れました。ログインし直してください。');
      }

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(payload?.message || '解約予約の取り消しに失敗しました。');
      }

      setUser({
        ...user,
        subscription_status: payload?.status ?? user.subscription_status,
        cancel_at_period_end:
          typeof payload?.cancel_at_period_end === 'boolean'
            ? payload.cancel_at_period_end
            : false,
      });
    } catch (error: any) {
      console.error('Resume subscription error:', error);
      setStripeError(error?.message ?? '解約予約の取り消しに失敗しました。');
    } finally {
      setResumeLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="flex min-h-screen items-center justify-center">
          <div className="rounded-full border border-white/10 bg-white/5 px-6 py-3 text-xs uppercase tracking-[0.25em] text-slate-200">
            読み込み中...
          </div>
        </div>
      </Layout>
    );
  }

  const currentPlanLabel = user ? getPlanLabel(user.plan) : null;

  return (
    <Layout>
      <div className="relative mx-auto max-w-6xl px-4 py-6 text-slate-100 sm:py-8">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-emerald-500/20 to-transparent blur-3xl" />
          <div className="absolute bottom-[-20%] left-[-10%] h-72 w-72 rounded-full bg-teal-400/15 blur-[140px]" />
        </div>

        <div className="relative space-y-8">
          <div className="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-[0_35px_120px_rgba(1,6,3,0.55)] backdrop-blur-2xl">
            <Link
              href="/dashboard"
              className="text-[11px] uppercase tracking-[0.35em] text-emerald-200/80"
            >
              ← ダッシュボード
            </Link>
            <h1 className="mt-2 text-3xl font-semibold text-white">プラン比較</h1>
            <p className="text-sm text-slate-300">
              スタータープランからStripe決済が利用可能です。プロ / ビジネスは近日公開予定。
            </p>
          </div>

          {stripeError && (
            <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
              {stripeError}
            </div>
          )}

          {user && (
            <div className="rounded-[28px] border border-white/10 bg-gradient-to-r from-emerald-500/10 via-green-400/5 to-cyan-300/10 p-4 text-sm text-emerald-50">
              現在のプラン: <strong>{currentPlanLabel}</strong>
              {user.stripe_subscription_id && (
                <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-xs text-emerald-100">
                    {user.cancel_at_period_end
                      ? '解約予約済み：現在の請求期間終了後に自動停止します'
                      : `サブスクリプション状態: ${user.subscription_status || 'active'}`}
                  </div>
                  <div className="flex gap-2">
                    {!user.cancel_at_period_end ? (
                      <button
                        onClick={handleCancelSubscription}
                        disabled={cancelLoading}
                        className="inline-flex items-center justify-center rounded-full border border-white/20 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {cancelLoading ? '処理中...' : '次回更新で解約'}
                      </button>
                    ) : (
                      <button
                        onClick={handleResumeSubscription}
                        disabled={resumeLoading}
                        className="inline-flex items-center justify-center rounded-full border border-white/20 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {resumeLoading ? '処理中...' : '解約予約を取り消す'}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="rounded-[28px] border border-dashed border-white/15 bg-white/5 px-4 py-3 text-xs text-slate-300">
            プロ / ビジネス（旧プロ / エンタープライズ）プランは現在最終調整中です。公開までしばらくお待ちください。
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {planCards.map((plan) => {
              const isCurrentPlan = user?.plan === plan.internalPlan;
              const isComingSoon = plan.comingSoon;
              const isProcessing = upgrading === plan.tier;
              const featureItems = [
                plan.siteLimitText,
                `月${plan.chatQuota.toLocaleString()}チャット`,
                `月${plan.embeddingQuota.toLocaleString()}トークン`,
                ...plan.features,
              ].filter(Boolean);

              const buttonDisabled = isCurrentPlan || isComingSoon || isProcessing;
              const buttonLabel = isCurrentPlan
                ? '現在のプラン'
                : isComingSoon
                ? '近日公開'
                : isProcessing
                ? 'リダイレクト中...'
                : '今すぐ申し込む';

              return (
                <div
                  key={plan.tier}
                  className={`relative overflow-hidden rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-[0_35px_120px_rgba(1,3,6,0.55)] backdrop-blur-2xl ${
                    plan.popular ? 'ring-1 ring-emerald-400/40' : ''
                  }`}
                >
                  <div className="pointer-events-none absolute inset-0 opacity-50">
                    {plan.popular && (
                      <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-emerald-500/30 blur-[90px]" />
                    )}
                  </div>
                  <div className="relative">
                    <div className="flex flex-wrap gap-2">
                      {plan.popular && (
                        <span className="inline-flex items-center rounded-full bg-emerald-400/20 px-3 py-1 text-xs font-semibold text-emerald-100">
                          人気
                        </span>
                      )}
                      {isComingSoon && (
                        <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-slate-200">
                          近日公開
                        </span>
                      )}
                      {isCurrentPlan && (
                        <span className="inline-flex items-center rounded-full border border-emerald-400/40 px-3 py-1 text-xs font-semibold text-emerald-100">
                          現在のプラン
                        </span>
                      )}
                    </div>

                    <div className="mt-4">
                      <h2 className="text-2xl font-semibold text-white">{plan.label}</h2>
                      <p className="mt-1 text-sm text-slate-300">{plan.description}</p>
                    </div>

                    <div className="mt-6">
                      <div className="text-3xl font-semibold text-white">{plan.priceLabel}</div>
                      <div className="text-xs uppercase tracking-[0.3em] text-slate-400">税込</div>
                    </div>

                    <div className="mt-6 space-y-3">
                      {featureItems.map((label, index) => (
                        <div key={index} className="flex items-start text-sm text-slate-200">
                          <svg
                            className="mr-2 h-5 w-5 flex-shrink-0 text-emerald-300"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>{label}</span>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => handleCheckout(plan.tier)}
                      disabled={buttonDisabled}
                      className={`mt-6 w-full rounded-full px-4 py-2.5 text-sm font-semibold transition ${
                        buttonDisabled
                          ? 'cursor-not-allowed border border-white/10 bg-white/5 text-slate-400'
                          : 'bg-gradient-to-r from-emerald-400 via-green-300 to-cyan-300 text-slate-900 shadow-[0_20px_45px_rgba(16,185,129,0.35)] hover:-translate-y-0.5'
                      }`}
                    >
                      {buttonLabel}
                    </button>
                    <p className="mt-2 text-xs text-slate-400">
                      {isCurrentPlan
                        ? 'ご利用中のプランです'
                        : isComingSoon
                        ? '現在準備中のため少々お待ちください'
                        : 'Stripeの決済画面に遷移します'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="rounded-[28px] border border-amber-300/30 bg-amber-500/10 p-4 text-sm text-amber-50">
            <h3 className="mb-2 font-semibold">⚠️ 注意事項</h3>
            <ul className="list-disc space-y-1 pl-5 text-amber-100">
              <li>スタータープランのお申し込みはStripe決済完了後に自動で反映されます。</li>
              <li>近日公開プランを希望される場合はサポートまでご連絡ください。</li>
              <li>プラン変更後のチャット/トークンクォータは次の課金期間から適用されます。</li>
            </ul>
          </div>
        </div>
      </div>
    </Layout>
  );
}
