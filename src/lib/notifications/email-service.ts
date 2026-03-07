/**
 * Email Service — Email Notifications
 * Story 4.2: Email Notifications
 */

export interface EmailTemplate {
  name: string;
  subject: string;
  html: string;
}

export interface ElectionNotification {
  recipientEmail: string;
  electionTitle: string;
  electionDate: string;
  actionUrl: string;
}

/**
 * Generate election started email template
 */
export function generateElectionStartedEmail(
  notification: ElectionNotification
): EmailTemplate {
  return {
    name: 'election-started',
    subject: `${notification.electionTitle} - Votação Iniciada`,
    html: `
      <h2>Votação Iniciada</h2>
      <p>A eleição <strong>${notification.electionTitle}</strong> iniciou.</p>
      <p>Data: ${notification.electionDate}</p>
      <a href="${notification.actionUrl}" style="padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 5px;">
        Ir para Votação
      </a>
    `,
  };
}

/**
 * Generate election ending email template
 */
export function generateElectionEndingEmail(
  notification: ElectionNotification
): EmailTemplate {
  return {
    name: 'election-ending',
    subject: `${notification.electionTitle} - Votação Encerrando`,
    html: `
      <h2>Votação Encerrando em Breve</h2>
      <p>A eleição <strong>${notification.electionTitle}</strong> está encerrando.</p>
      <p>Faça seu voto antes do prazo final: ${notification.electionDate}</p>
      <a href="${notification.actionUrl}" style="padding: 10px 20px; background: #dc3545; color: white; text-decoration: none; border-radius: 5px;">
        Votar Agora
      </a>
    `,
  };
}

/**
 * Generate election completed email template
 */
export function generateElectionCompletedEmail(
  notification: ElectionNotification & { winnerName?: string }
): EmailTemplate {
  return {
    name: 'election-completed',
    subject: `${notification.electionTitle} - Resultados Disponíveis`,
    html: `
      <h2>Votação Finalizada</h2>
      <p>A eleição <strong>${notification.electionTitle}</strong> foi finalizada.</p>
      ${
        notification.winnerName
          ? `<p><strong>Vencedor:</strong> ${notification.winnerName}</p>`
          : ''
      }
      <a href="${notification.actionUrl}" style="padding: 10px 20px; background: #28a745; color: white; text-decoration: none; border-radius: 5px;">
        Ver Resultados
      </a>
    `,
  };
}

/**
 * Generate magic link email template
 */
export function generateMagicLinkEmail(
  recipientEmail: string,
  loginUrl: string
): EmailTemplate {
  return {
    name: 'magic-link',
    subject: 'Seu Link de Acesso - Safety Vote',
    html: `
      <h2>Bem-vindo ao Safety Vote</h2>
      <p>Clique no link abaixo para acessar sua conta:</p>
      <a href="${loginUrl}" style="padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 5px;">
        Acessar Conta
      </a>
      <p style="margin-top: 20px; font-size: 12px; color: #999;">
        Este link expira em 15 minutos. Se você não solicitou este acesso, ignore este email.
      </p>
    `,
  };
}

/**
 * Email service interface (to be implemented with actual email provider)
 */
export interface IEmailService {
  send(to: string, template: EmailTemplate): Promise<boolean>;
}

/**
 * Mock email service for development
 */
export class MockEmailService implements IEmailService {
  async send(to: string, template: EmailTemplate): Promise<boolean> {
    console.log(`[EMAIL] To: ${to}`);
    console.log(`[EMAIL] Subject: ${template.subject}`);
    console.log(`[EMAIL] Template: ${template.name}`);
    return true;
  }
}

/**
 * Get email service instance
 */
export function getEmailService(): IEmailService {
  const provider = process.env.EMAIL_PROVIDER || 'mock';

  switch (provider) {
    case 'sendgrid':
      // return new SendGridEmailService();
      return new MockEmailService();
    case 'mailgun':
      // return new MailgunEmailService();
      return new MockEmailService();
    default:
      return new MockEmailService();
  }
}

/**
 * Send election notification
 */
export async function sendElectionNotification(
  type: 'started' | 'ending' | 'completed',
  notification: ElectionNotification
): Promise<boolean> {
  const emailService = getEmailService();

  let template: EmailTemplate;

  switch (type) {
    case 'started':
      template = generateElectionStartedEmail(notification);
      break;
    case 'ending':
      template = generateElectionEndingEmail(notification);
      break;
    case 'completed':
      template = generateElectionCompletedEmail(notification);
      break;
  }

  try {
    return await emailService.send(notification.recipientEmail, template);
  } catch (error) {
    console.error(`Failed to send ${type} email:`, error);
    return false;
  }
}
