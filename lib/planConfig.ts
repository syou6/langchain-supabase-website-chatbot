export type PlanTier = 'solo' | 'studio' | 'unlimited';

export type InternalPlan = 'pending' | 'starter' | 'pro' | 'enterprise';

export interface PlanDisplayConfig {
  label: string;
  description: string;
  priceLabel: string;
  siteLimitText: string;
  siteLimit: number | null;
  features: string[];
  internalPlan: InternalPlan;
  chatQuota: number;
  embeddingQuota: number;
  popular?: boolean;
}

export const PLAN_CONFIG: Record<PlanTier, PlanDisplayConfig> = {
  solo: {
    label: 'スターター',
    description: 'サイト1件、月100チャットまで。まずは試してみたい方向け。',
    priceLabel: '¥980 / 月',
    siteLimitText: '1サイトまで',
    siteLimit: 1,
    features: ['URL登録代行', '当社による初回学習', '月100チャットまで'],
    internalPlan: 'starter',
    chatQuota: 100,
    embeddingQuota: 50_000,
  },
  studio: {
    label: 'プロ',
    description: 'サイト3件、月500チャットまで。自動学習にも対応。',
    priceLabel: '¥2,980 / 月',
    siteLimitText: '最大3サイトまで',
    siteLimit: 3,
    features: ['月500チャット', '月3回まで再学習', '自動学習アップデート'],
    internalPlan: 'pro',
    chatQuota: 500,
    embeddingQuota: 300_000,
    popular: true,
  },
  unlimited: {
    label: 'ビジネス',
    description: 'サイト/チャット無制限。ホワイトラベルやAPI連携が可能。',
    priceLabel: '¥9,800 / 月〜',
    siteLimitText: '無制限',
    siteLimit: null,
    features: ['サイト・チャット無制限', 'ホワイトラベル / API', '専任サポート'],
    internalPlan: 'enterprise',
    chatQuota: 10_000,
    embeddingQuota: 1_000_000,
  },
};

export const planOrder: PlanTier[] = ['solo', 'studio', 'unlimited'];

export const isPlanTier = (value: any): value is PlanTier => {
  return typeof value === 'string' && planOrder.includes(value as PlanTier);
};

export const DEFAULT_INTERNAL_PLAN: InternalPlan = 'pending';

export const getPlanConfigByInternalPlan = (internalPlan: InternalPlan) => {
  return Object.values(PLAN_CONFIG).find(
    (config) => config.internalPlan === internalPlan,
  );
};

export const getSiteLimitForInternalPlan = (internalPlan: InternalPlan) => {
  const config = getPlanConfigByInternalPlan(internalPlan);
  if (!config) {
    return 0;
  }
  return config.siteLimit ?? null;
};

export const getPlanLabel = (internalPlan: InternalPlan) => {
  const config = getPlanConfigByInternalPlan(internalPlan);
  if (!config) {
    return '未契約';
  }
  return config.label;
};
