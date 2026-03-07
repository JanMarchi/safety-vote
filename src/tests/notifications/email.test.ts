/**
 * Email Service Tests
 * Story 4.2: Email Notifications
 */

import { describe, it, expect } from '@jest/globals';
import {
  generateElectionStartedEmail,
  generateElectionEndingEmail,
  generateElectionCompletedEmail,
  generateMagicLinkEmail,
  MockEmailService,
} from '@/lib/notifications/email-service';

describe('Story 4.2: Email Notifications', () => {
  describe('Email Templates', () => {
    it('should generate election started email', () => {
      const template = generateElectionStartedEmail({
        recipientEmail: 'user@example.com',
        electionTitle: 'Board Election',
        electionDate: '2026-04-01',
        actionUrl: 'https://safetyvote.com/vote',
      });

      expect(template.name).toBe('election-started');
      expect(template.subject).toContain('Board Election');
      expect(template.html).toContain('Votação Iniciada');
    });

    it('should generate election ending email', () => {
      const template = generateElectionEndingEmail({
        recipientEmail: 'user@example.com',
        electionTitle: 'Board Election',
        electionDate: '2026-04-15',
        actionUrl: 'https://safetyvote.com/vote',
      });

      expect(template.name).toBe('election-ending');
      expect(template.html).toContain('Encerrando em Breve');
    });

    it('should generate election completed email', () => {
      const template = generateElectionCompletedEmail({
        recipientEmail: 'user@example.com',
        electionTitle: 'Board Election',
        electionDate: '2026-04-15',
        actionUrl: 'https://safetyvote.com/results',
        winnerName: 'Alice',
      });

      expect(template.name).toBe('election-completed');
      expect(template.html).toContain('Finalizada');
      expect(template.html).toContain('Alice');
    });

    it('should generate magic link email', () => {
      const template = generateMagicLinkEmail(
        'user@example.com',
        'https://safetyvote.com/login?token=abc123'
      );

      expect(template.name).toBe('magic-link');
      expect(template.subject).toContain('Safety Vote');
      expect(template.html).toContain('Bem-vindo');
    });
  });

  describe('Email Service', () => {
    it('should send election started email', async () => {
      const service = new MockEmailService();

      const result = await service.send(
        'user@example.com',
        generateElectionStartedEmail({
          recipientEmail: 'user@example.com',
          electionTitle: 'Election',
          electionDate: '2026-04-01',
          actionUrl: 'https://safetyvote.com/vote',
        })
      );

      expect(result).toBe(true);
    });

    it('should handle email service errors gracefully', async () => {
      const service = new MockEmailService();

      // Mock an error scenario
      const result = await service.send('invalid-email', {
        name: 'test',
        subject: 'Test',
        html: '<p>Test</p>',
      });

      expect(typeof result).toBe('boolean');
    });
  });

  describe('Email Content Validation', () => {
    it('should include action URL in email template', () => {
      const actionUrl = 'https://safetyvote.com/vote/elec-123';
      const template = generateElectionStartedEmail({
        recipientEmail: 'user@example.com',
        electionTitle: 'Election',
        electionDate: '2026-04-01',
        actionUrl,
      });

      expect(template.html).toContain(actionUrl);
    });

    it('should include election title in subject', () => {
      const title = 'Annual Board Election 2026';
      const template = generateElectionStartedEmail({
        recipientEmail: 'user@example.com',
        electionTitle: title,
        electionDate: '2026-04-01',
        actionUrl: 'https://safetyvote.com',
      });

      expect(template.subject).toContain(title);
    });
  });
});
