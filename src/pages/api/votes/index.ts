/**
 * Voting API — POST /api/votes, GET /api/votes
 * Story 2.3: Voting System
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { authorize } from '@/middleware/authorize';
import {
  castVote,
  hasUserVoted,
  type Vote,
} from '@/lib/elections/vote-manager';
import { createClient } from '@supabase/supabase-js';

type ResponseData =
  | Vote
  | { voted: boolean; error?: string }
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

    if (req.method === 'POST') {
      // AC1: Eleitor can vote in active election
      const { election_id, candidate_id } = req.body;

      if (!election_id) {
        return res.status(400).json({
          error: 'Missing required field: election_id',
        });
      }

      // Get encryption key from environment or election settings
      // TODO: Retrieve per-election encryption key from secure storage
      const encryptionKey = process.env.VOTE_ENCRYPTION_KEY;
      if (!encryptionKey) {
        return res.status(500).json({
          error: 'Encryption key not configured',
        });
      }

      try {
        const vote = await castVote(
          election_id,
          auth.userId,
          candidate_id || null, // null = abstention
          encryptionKey,
          supabase
        );

        return res.status(201).json(vote);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';

        // Handle specific errors
        if (message.includes('not currently active')) {
          return res.status(403).json({ error: message });
        }
        if (message.includes('already voted')) {
          return res.status(409).json({ error: message });
        }
        if (message.includes('not allowed')) {
          return res.status(400).json({ error: message });
        }
        if (message.includes('not found')) {
          return res.status(404).json({ error: message });
        }

        return res.status(400).json({ error: message });
      }
    }

    if (req.method === 'GET') {
      // Check if user has voted
      const { election_id } = req.query;

      if (!election_id || typeof election_id !== 'string') {
        return res.status(400).json({
          error: 'Missing required query parameter: election_id',
        });
      }

      const voted = await hasUserVoted(election_id, auth.userId, supabase);

      return res.status(200).json({ voted });
    }

    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Vote API error:', message);

    return res.status(500).json({ error: message });
  }
}
