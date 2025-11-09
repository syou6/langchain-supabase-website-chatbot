import type { NextApiRequest, NextApiResponse } from 'next';
import { getSupabaseAdminClient, requireAuth } from '@/utils/supabase-auth';

const allowInProduction = process.env.ENABLE_TEST_QUOTA_API === 'true';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  if (process.env.NODE_ENV === 'production' && !allowInProduction) {
    return res.status(403).json({ message: 'Not allowed in production' });
  }

  try {
    const userId = await requireAuth(req);

    const { chat_quota, embedding_quota } = req.body as {
      chat_quota?: number;
      embedding_quota?: number;
    };

    if (
      (typeof chat_quota !== 'number' || Number.isNaN(chat_quota)) &&
      (typeof embedding_quota !== 'number' || Number.isNaN(embedding_quota))
    ) {
      return res.status(400).json({
        message: 'chat_quota or embedding_quota must be provided as numbers',
      });
    }

    const payload: Record<string, number> = {};

    if (typeof chat_quota === 'number' && !Number.isNaN(chat_quota)) {
      payload.chat_quota = Math.max(0, Math.floor(chat_quota));
    }

    if (typeof embedding_quota === 'number' && !Number.isNaN(embedding_quota)) {
      payload.embedding_quota = Math.max(0, Math.floor(embedding_quota));
    }

    const supabaseAdmin = getSupabaseAdminClient();
    const { error } = await supabaseAdmin
      .from('users')
      .update(payload)
      .eq('id', userId);

    if (error) {
      throw error;
    }

    return res.status(200).json(payload);
  } catch (error: any) {
    console.error('[Admin] set quota error:', error);
    if (error?.message === 'Unauthorized') {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    return res.status(500).json({
      message: 'Failed to update quota',
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
