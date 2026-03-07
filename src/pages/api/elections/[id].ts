/**
 * Single Election API — GET/PUT /api/elections/[id]
 * Story 2.1: Election Creation & Management
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { authorize } from '@/middleware/authorize';
import {
  getElection,
  updateElection,
  type Election,
} from '@/lib/elections/election-manager';
import { createClient } from '@supabase/supabase-js';

type ResponseData = Election | { error: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  try {
    // Authorize request
    const auth = await authorize(req, res);
    if (!auth) return;

    const { id } = req.query;
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Invalid election ID' });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    if (req.method === 'GET') {
      // Get election by ID with company isolation via RLS
      const election = await getElection(id, supabase);

      // RLS will prevent access to other company's elections
      // But we also verify companyId matches auth context
      if (election.company_id !== auth.companyId) {
        return res.status(403).json({
          error: 'Access denied to election from another company',
        });
      }

      return res.status(200).json(election);
    }

    if (req.method === 'PUT') {
      // AC5: RH Can Edit Own Elections
      if (auth.role !== 'admin' && auth.role !== 'rh') {
        return res.status(403).json({
          error: 'Only admin or rh can update elections',
        });
      }

      const election = await getElection(id, supabase);

      // Verify company ownership
      if (election.company_id !== auth.companyId) {
        return res.status(403).json({
          error: 'Access denied to election from another company',
        });
      }

      // Extract update data (allow partial updates)
      const {
        title,
        description,
        start_date,
        end_date,
        max_votes_per_user,
        allow_abstention,
        is_secret,
      } = req.body;

      const updateData = {
        ...(title && { title }),
        ...(description && { description }),
        ...(start_date && { start_date }),
        ...(end_date && { end_date }),
        ...(max_votes_per_user !== undefined && { max_votes_per_user }),
        ...(allow_abstention !== undefined && { allow_abstention }),
        ...(is_secret !== undefined && { is_secret }),
      };

      const updated = await updateElection(id, updateData, supabase);
      return res.status(200).json(updated);
    }

    res.setHeader('Allow', ['GET', 'PUT']);
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Election API error:', message);

    // Handle specific errors
    if (message.includes('not found')) {
      return res.status(404).json({ error: message });
    }
    if (message.includes('Cannot update active elections')) {
      return res.status(409).json({ error: message });
    }
    if (message.includes('End date must be after start date')) {
      return res.status(400).json({ error: message });
    }

    return res.status(500).json({ error: message });
  }
}
