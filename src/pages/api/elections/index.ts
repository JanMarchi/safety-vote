/**
 * Election CRUD API — POST /api/elections, GET /api/elections
 * Story 2.1: Election Creation & Management
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { authorize } from '@/middleware/authorize';
import {
  createElection,
  listElections,
  type Election,
} from '@/lib/elections/election-manager';
import { createClient } from '@supabase/supabase-js';

type ResponseData =
  | Election
  | Election[]
  | { error: string }
  | { message: string };

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
      // AC1: Admin/RH Can Create Elections
      if (auth.role !== 'admin' && auth.role !== 'rh') {
        return res.status(403).json({
          error: 'Only admin or rh can create elections',
        });
      }

      const { title, description, start_date, end_date, max_votes_per_user, allow_abstention, is_secret } = req.body;

      // Validate required fields
      if (!title || !start_date || !end_date) {
        return res.status(400).json({
          error: 'Missing required fields: title, start_date, end_date',
        });
      }

      const election = await createElection(
        {
          title,
          description,
          start_date,
          end_date,
          max_votes_per_user,
          allow_abstention,
          is_secret,
        },
        auth.companyId,
        auth.userId,
        supabase
      );

      return res.status(201).json(election);
    }

    if (req.method === 'GET') {
      // List elections for company
      const elections = await listElections(auth.companyId, supabase);
      return res.status(200).json(elections);
    }

    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Election API error:', message);

    // Check for validation errors
    if (message.includes('End date must be after start date')) {
      return res.status(400).json({ error: message });
    }

    return res.status(500).json({ error: message });
  }
}
