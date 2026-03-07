/**
 * Single Candidate API — GET/DELETE /api/candidates/[id]
 * Story 2.2: Candidate Registration & Management
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { authorize } from '@/middleware/authorize';
import {
  getCandidate,
  removeCandidate,
  type Candidate,
} from '@/lib/elections/candidate-manager';
import { createClient } from '@supabase/supabase-js';

type ResponseData = Candidate | { error: string } | { message: string };

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
      return res.status(400).json({ error: 'Invalid candidate ID' });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    if (req.method === 'GET') {
      const candidate = await getCandidate(id, supabase);

      // Verify company ownership via RLS
      const { data: election, error } = await supabase
        .from('elections')
        .select('company_id')
        .eq('id', candidate.election_id)
        .single();

      if (error || !election) {
        return res.status(404).json({ error: 'Election not found' });
      }

      if (election.company_id !== auth.companyId) {
        return res.status(403).json({
          error: 'Access denied to candidate from another company',
        });
      }

      return res.status(200).json(candidate);
    }

    if (req.method === 'DELETE') {
      // AC5: RH can remove candidates
      if (auth.role !== 'admin' && auth.role !== 'rh') {
        return res.status(403).json({
          error: 'Only admin or rh can remove candidates',
        });
      }

      const candidate = await getCandidate(id, supabase);

      // Verify company ownership
      const { data: election, error } = await supabase
        .from('elections')
        .select('company_id')
        .eq('id', candidate.election_id)
        .single();

      if (error || !election) {
        return res.status(404).json({ error: 'Election not found' });
      }

      if (election.company_id !== auth.companyId) {
        return res.status(403).json({
          error: 'Access denied to remove candidate from another company',
        });
      }

      await removeCandidate(id, auth.userId, supabase);

      return res.status(200).json({
        message: 'Candidate removed successfully',
      });
    }

    res.setHeader('Allow', ['GET', 'DELETE']);
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Candidate API error:', message);

    // Handle specific errors
    if (message.includes('not found')) {
      return res.status(404).json({ error: message });
    }
    if (message.includes('Can only remove candidates from draft elections')) {
      return res.status(409).json({ error: message });
    }

    return res.status(500).json({ error: message });
  }
}
