import { Resend } from 'resend';

export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export interface EmailProvider {
  send(message: EmailMessage): Promise<void>;
}

class ResendEmailProvider implements EmailProvider {
  private client: Resend;
  private from: string;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.warn('⚠️ RESEND_API_KEY not set. Emails will be logged to console.');
    }
    this.client = new Resend(apiKey || 're_placeholder');
    this.from = process.env.EMAIL_FROM || 'Storefy <noreply@storefy.com>';
  }

  async send(message: EmailMessage): Promise<void> {
    if (!process.env.RESEND_API_KEY) {
      console.info('[email:console]', { to: message.to, subject: message.subject });
      return;
    }

    await this.client.emails.send({
      from: message.from || this.from,
      to: message.to,
      subject: message.subject,
      html: message.html,
    });
  }
}

class ConsoleEmailProvider implements EmailProvider {
  async send(message: EmailMessage) {
    console.info('[email:console]', { to: message.to, subject: message.subject });
  }
}

export const emailProvider: EmailProvider = process.env.RESEND_API_KEY
  ? new ResendEmailProvider()
  : new ConsoleEmailProvider();
