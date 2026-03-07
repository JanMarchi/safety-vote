/**
 * Candidate CRUD API — POST /api/candidates, GET /api/candidates
 * Story 2.2: Candidate Registration & Management
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { authorize } from '@/middleware/authorize';
import {
  registerAsCandidate,
  addCandidate,
  listCandidates,
  type Candidate,
} from '@/lib/elections/candidate-manager';
import { createClient } from '@supabase/supabase-js';

type ResponseData = Candidate | Candidate[] | { error: string };

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

    if (req.method === 'POST') {
      const { election_id, name, proposal, photo_url } = req.body;

      if (!election_id) {
        return res.status(400).json({
          error: 'Missing required field: election_id',
        });
      }

      // AC1: User can register as candidate (eleitor, rh, admin all can)
      // AC4: RH/Admin can add candidates (different endpoint behavior)
      if (auth.role === 'rh' || auth.role === 'admin') {
        // RH/Admin adding candidate
        if (!name) {
          return res.status(400).json({
            error: 'Missing required field: name',
          });
        }

        const candidate = await addCandidate(
          election_id,
          { name, proposal, photo_url },
          auth.userId,
          supabase
        );

        return res.status(201).json(candidate);
      } else {
        // Regular user self-registration
        const candidate = await registerAsCandidate(
          election_id,
          auth.userId,
          { name, proposal },
          supabase
        );

        return res.status(201).json(candidate);
      }
    }

    if (req.method === 'GET') {
      const { election_id } = req.query;

      if (!election_id || typeof election_id !== 'string') {
        return res.status(400).json({
          error: 'Missing required query parameter: election_id',
        });
      }

      // AC6: Verify company isolation via RLS
      // Get election to check company ownership
      const { data: election, error: electionError } = await supabase
        .from('elections')
        .select('company_id')
        .eq('id', election_id)
        .single();

      if (electionError || !election) {
        return res.status(404).json({ error: 'Election not found' });
      }

      if (election.company_id !== auth.companyId) {
        return res.status(403).json({
          error: 'Access denied to candidates from another company',
        });
      }

      const candidates = await listCandidates(election_id, supabase);
      return res.status(200).json(candidates);
    }

    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Candidate API error:', message);

    // Handle specific errors
    if (message.includes('Cannot register after election starts')) {
      return res.status(403).json({ error: message });
    }
    if (message.includes('Already registered as candidate')) {
      return res.status(409).json({ error: message });
    }
    if (message.includes('not found')) {
      return res.status(404).json({ error: message });
    }

    return res.status(500).json({ error: message });
  }
}
