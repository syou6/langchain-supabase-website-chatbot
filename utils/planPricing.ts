import { PLAN_CONFIG, PlanTier } from '@/lib/planConfig';

const priceMap: Record<PlanTier, string | undefined> = {
  solo: process.env.STRIPE_PRICE_SOLO,
  studio: process.env.STRIPE_PRICE_STUDIO,
  unlimited: process.env.STRIPE_PRICE_UNLIMITED,
};

export const getStripePriceId = (plan: PlanTier) => priceMap[plan] || null;

export const getPlanUpdatePayload = (plan: PlanTier) => {
  const config = PLAN_CONFIG[plan];
  return {
    plan: config.internalPlan,
    chat_quota: config.chatQuota,
    embedding_quota: config.embeddingQuota,
  };
};

