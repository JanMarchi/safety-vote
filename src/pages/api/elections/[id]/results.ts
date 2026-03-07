/**
 * Election Results API — GET /api/elections/[id]/results
 * Story 2.4: Results & Tallying
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { authorize } from '@/middleware/authorize';
import {
  getElectionResults,
  getElectionWinner,
  generateResultsReport,
  validateResultsIntegrity,
  type TallyResult,
} from '@/lib/elections/results-manager';
import { createClient } from '@supabase/supabase-js';

type ResponseData =
  | TallyResult
  | { winner: { candidate_id: string; name: string; is_tied: boolean } }
  | { report: string }
  | { valid: boolean; issues: string[] }
  | { error: string };

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

    // Verify election exists and belongs to user's company
    const { data: election, error } = await supabase
      .from('elections')
      .select('company_id')
      .eq('id', id)
      .single();

    if (error || !election) {
      return res.status(404).json({ error: 'Election not found' });
    }

    if (election.company_id !== auth.companyId) {
      return res.status(403).json({
        error: 'Access denied to election from another company',
      });
    }

    if (req.method === 'GET') {
      const { format } = req.query;

      if (format === 'report') {
        const report = await generateResultsReport(id, supabase);
        return res.status(200).json({ report });
      }

      if (format === 'winner') {
        const winner = await getElectionWinner(id, supabase);
        if (!winner) {
          return res.status(404).json({ error: 'Election not completed or no votes' });
        }
        return res.status(200).json({ winner });
      }

      if (format === 'validate') {
        const validation = await validateResultsIntegrity(id, supabase);
        return res.status(200).json(validation);
      }

      // Default: return full results
      const results = await getElectionResults(id, supabase);
      if (!results) {
        return res.status(404).json({
          error: 'Election not completed yet or no results available',
        });
      }

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
