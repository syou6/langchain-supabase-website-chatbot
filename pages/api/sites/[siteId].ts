import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseClient } from '@/utils/supabase-client';

// PUT: サイト情報更新
// DELETE: サイト削除
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { siteId } = req.query;

  if (!siteId || typeof siteId !== 'string') {
    return res.status(400).json({ message: 'siteId is required' });
  }

  if (req.method === 'PUT') {
    try {
      const { name, baseUrl, sitemapUrl } = req.body;

      const updateData: any = {};
      if (name) updateData.name = name;
      if (baseUrl) updateData.base_url = baseUrl;
      if (sitemapUrl !== undefined) updateData.sitemap_url = sitemapUrl || null;

      const { data, error } = await supabaseClient
        .from('sites')
        .update(updateData)
        .eq('id', siteId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return res.status(200).json(data);
    } catch (error) {
      console.error('Error updating site:', error);
      return res.status(500).json({
        message: 'Failed to update site',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  if (req.method === 'DELETE') {
    try {
      // CASCADEでdocumentsとtraining_jobsも自動削除される
      const { error } = await supabaseClient
        .from('sites')
        .delete()
        .eq('id', siteId);

      if (error) {
        throw error;
      }

      return res.status(200).json({ message: 'Site deleted successfully' });
    } catch (error) {
      console.error('Error deleting site:', error);
      return res.status(500).json({
        message: 'Failed to delete site',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}

