import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseClient } from '@/utils/supabase-client';

// GET: ユーザーのサイト一覧取得
// POST: 新規サイト登録
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  // 認証チェック（簡易版：後でSupabase Authと連携）
  // 今は一旦スキップして実装

  if (req.method === 'GET') {
    try {
      // TODO: auth.uid()からuser_idを取得
      // 今は一旦全件取得（テスト用）
      const { data, error } = await supabaseClient
        .from('sites')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return res.status(200).json(data);
    } catch (error) {
      console.error('Error fetching sites:', error);
      return res.status(500).json({
        message: 'Failed to fetch sites',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  if (req.method === 'POST') {
    try {
      const { name, baseUrl, sitemapUrl } = req.body;

      if (!name || !baseUrl) {
        return res.status(400).json({
          message: 'name and baseUrl are required',
        });
      }

      // TODO: auth.uid()からuser_idを取得
      // 今はテスト用に固定値を使用
      const testUserId = '00000000-0000-0000-0000-000000000000'; // テスト用

      const { data, error } = await supabaseClient
        .from('sites')
        .insert({
          user_id: testUserId,
          name,
          base_url: baseUrl,
          sitemap_url: sitemapUrl || null,
          status: 'idle',
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return res.status(201).json(data);
    } catch (error) {
      console.error('Error creating site:', error);
      return res.status(500).json({
        message: 'Failed to create site',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}

