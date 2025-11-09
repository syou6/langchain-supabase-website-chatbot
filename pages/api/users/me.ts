import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuthUser } from '@/utils/supabase-auth';
import { supabaseClient } from '@/utils/supabase-client';

const DEFAULT_USER_PAYLOAD = {
  plan: 'pending',
  chat_quota: 0,
  embedding_quota: 0,
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const authUser = await getAuthUser(req);

    const { data, error } = await supabaseClient
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    if (data) {
      return res.status(200).json(data);
    }

    const { data: newUser, error: insertError } = await supabaseClient
      .from('users')
      .insert({
        id: authUser.id,
        ...DEFAULT_USER_PAYLOAD,
      })
      .select()
      .single();

    if (insertError || !newUser) {
      throw insertError || new Error('Failed to create user');
    }

    return res.status(200).json(newUser);
  } catch (error: any) {
    if (error?.message === 'Unauthorized') {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    console.error('[Users] me handler error:', error);
    return res.status(500).json({
      message: 'Failed to fetch user',
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
