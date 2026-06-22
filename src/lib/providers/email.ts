export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
}

export interface EmailProvider {
  send(message: EmailMessage): Promise<void>;
}

class ConsoleEmailProvider implements EmailProvider {
  async send(message: EmailMessage) {
    console.info('[email:console]', { to: message.to, subject: message.subject });
  }
}

export const emailProvider: EmailProvider = new ConsoleEmailProvider();
