/**
 * Vote Results API — GET /api/votes/results
 * Story 2.3: Voting System
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { authorize } from '@/middleware/authorize';
import { getPreliminaryResults } from '@/lib/elections/vote-manager';
import { createClient } from '@supabase/supabase-js';

type ResponseData =
  | {
      [candidateId: string]: number;
      abstentions: number;
    }
  | { error: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  try {
    // Authorize request
    const auth = await authorize(req, res);
    if (!auth) return;

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    if (req.method === 'GET') {
      const { election_id } = req.query;

      if (!election_id || typeof election_id !== 'string') {
        return res.status(400).json({
          error: 'Missing required query parameter: election_id',
        });
      }

      // Verify election exists and user has access (company isolation)
      const { data: election, error } = await supabase
        .from('elections')
        .select('company_id, status')
        .eq('id', election_id)
        .single();

      if (error || !election) {
        return res.status(404).json({ error: 'Election not found' });
      }

      if (election.company_id !== auth.companyId) {
        return res.status(403).json({
          error: 'Access denied to election from another company',
        });
      }

      // Get preliminary results
      const results = await getPreliminaryResults(election_id, supabase);

      return res.status(200).json(results);
    }

    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Results API error:', message);

    return res.status(500).json({ error: message });
  }
}
