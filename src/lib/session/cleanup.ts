/**
 * Session Cleanup Job
 *
 * Removes expired sessions from the database.
 * Designed to run daily (typically 2 AM UTC off-peak time).
 *
 * Criteria for deletion:
 * - Expired: expires_at < NOW()
 * - Revoked: revoked_at IS NOT NULL AND revoked_at < NOW() - 30 days
 * - Inactive: last_activity < NOW() - 24 hours (with expires_at also in past)
 */

import { supabase } from '../supabase';

export interface CleanupResult {
  success: boolean;
  deletedCount: number;
  duration: number; // milliseconds
  error?: string;
}

/**
 * Run session cleanup job
 *
 * Queries and removes old sessions matching cleanup criteria.
 * Safe to run multiple times - idempotent operation.
 *
 * Performance:
 * - Should complete in <5 seconds for typical databases
 * - Uses indexed queries for efficiency
 *
 * @returns CleanupResult with summary
 */
export async function cleanupExpiredSessions(): Promise<CleanupResult> {
  const startTime = Date.now();

  try {
    // Calculate cutoff times
    const now = new Date();
    const expiredBefore = now; // Sessions with expires_at < now
    const revokedBefore = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
    const inactiveBefore = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24 hours ago

    console.log('Starting session cleanup job');
    console.log(`  - Deleted expired sessions before: ${expiredBefore.toISOString()}`);
    console.log(`  - Deleting revoked sessions before: ${revokedBefore.toISOString()}`);
    console.log(`  - Deleting inactive sessions before: ${inactiveBefore.toISOString()}`);

    // Delete expired sessions (criteria: expires_at < now)
    const { count: expiredCount, error: expiredError } = await supabase
      .from('user_sessions')
      .delete()
      .lt('expires_at', expiredBefore.toISOString());

    if (expiredError) {
      throw new Error(`Failed to delete expired sessions: ${expiredError.message}`);
    }

    console.log(`  ✓ Deleted ${expiredCount || 0} expired sessions`);

    // Delete old revoked sessions (criteria: revoked_at < now - 30 days)
    const { count: revokedCount, error: revokedError } = await supabase
      .from('user_sessions')
      .delete()
      .not('revoked_at', 'is', null)
      .lt('revoked_at', revokedBefore.toISOString());

    if (revokedError) {
      throw new Error(`Failed to delete revoked sessions: ${revokedError.message}`);
    }

    console.log(`  ✓ Deleted ${revokedCount || 0} old revoked sessions`);

    // Delete inactive sessions (criteria: last_activity < now - 24h AND expires_at < now)
    // Only delete if both inactive AND expired to avoid deleting active users
    const { count: inactiveCount, error: inactiveError } = await supabase
      .from('user_sessions')
      .delete()
      .lt('last_activity', inactiveBefore.toISOString())
      .lt('expires_at', expiredBefore.toISOString())
      .is('revoked_at', null); // Don't double-delete revoked sessions

    if (inactiveError) {
      throw new Error(`Failed to delete inactive sessions: ${inactiveError.message}`);
    }

    console.log(`  ✓ Deleted ${inactiveCount || 0} inactive sessions`);

    const totalDeleted = (expiredCount || 0) + (revokedCount || 0) + (inactiveCount || 0);
    const duration = Date.now() - startTime;

    console.log(
      `Session cleanup completed: deleted ${totalDeleted} sessions in ${duration}ms`
    );

    return {
      success: true,
      deletedCount: totalDeleted,
      duration
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    console.error(`Session cleanup failed after ${duration}ms:`, errorMessage);

    return {
      success: false,
      deletedCount: 0,
      duration,
      error: errorMessage
    };
  }
}

/**
 * Schedule cleanup job to run daily
 *
 * For Node.js environments, use node-cron:
 *
 * ```typescript
 * import cron from 'node-cron';
 * import { scheduleCleanupJob } from '@/lib/session/cleanup';
 *
 * scheduleCleanupJob();
 * ```
 *
 * For serverless environments (Supabase Edge Functions):
 * Deploy as Edge Function that runs on schedule
 *
 * For Vercel/Netlify:
 * Use cron job via platform's scheduler or GitHub Actions
 */
export function scheduleCleanupJob(cronExpression: string = '0 2 * * *'): void {
  try {
    // Dynamic import to avoid requiring node-cron in non-Node environments
    const cronModule = require('node-cron');

    if (!cronModule) {
      console.warn('node-cron not available, skipping cleanup job scheduling');
      return;
    }

    cronModule.schedule(cronExpression, async () => {
      console.log('Running scheduled session cleanup job');
      const result = await cleanupExpiredSessions();

      if (!result.success) {
        console.error('Cleanup job failed:', result.error);
        // In production, send alert to monitoring system
      }
    });

    console.log(`Session cleanup scheduled: ${cronExpression} UTC`);
  } catch (error) {
    console.warn('Could not schedule cleanup job:', error);
    console.log('Cleanup must be triggered manually or via external scheduler');
  }
}

/**
 * Get cleanup statistics
 *
 * Returns count of sessions that would be deleted by next cleanup.
 * Useful for monitoring and alerting.
 *
 * @returns Object with counts of sessions in each category
 */
export async function getCleanupStatistics(): Promise<{
  expiredCount: number;
  revokedCount: number;
  inactiveCount: number;
  totalCleanable: number;
}> {
  try {
    const now = new Date();
    const revokedBefore = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const inactiveBefore = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Count expired sessions
    const { count: expiredCount } = await supabase
      .from('user_sessions')
      .select('id', { count: 'exact' })
      .lt('expires_at', now.toISOString());

    // Count revoked sessions older than 30 days
    const { count: revokedCount } = await supabase
      .from('user_sessions')
      .select('id', { count: 'exact' })
      .not('revoked_at', 'is', null)
      .lt('revoked_at', revokedBefore.toISOString());

    // Count inactive sessions
    const { count: inactiveCount } = await supabase
      .from('user_sessions')
      .select('id', { count: 'exact' })
      .lt('last_activity', inactiveBefore.toISOString())
      .lt('expires_at', now.toISOString())
      .is('revoked_at', null);

    const total = (expiredCount || 0) + (revokedCount || 0) + (inactiveCount || 0);

    return {
      expiredCount: expiredCount || 0,
      revokedCount: revokedCount || 0,
      inactiveCount: inactiveCount || 0,
      totalCleanable: total
    };
  } catch (error) {
    console.error('Error getting cleanup statistics:', error);
    return {
      expiredCount: 0,
      revokedCount: 0,
      inactiveCount: 0,
      totalCleanable: 0
    };
  }
}
