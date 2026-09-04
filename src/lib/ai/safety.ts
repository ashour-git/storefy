const blockedPatterns = [
  /ignore\s+(all\s+)?previous\s+instructions/i,
  /تجاهل\s+.*التعليمات/i,
  /system\s+prompt/i,
  /another\s+tenant/i,
  /other\s+stores?\s+data/i,
  /export\s+database/i,
  /secret|api[_\s-]?key|password/i,
  /كلمة\s+المرور|مفتاح\s+الـ?api/i,
  /jailbreak|DAN\s+mode/i,
];

const EMAIL_RE = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const PHONE_RE = /(\+?20)?[\s-]?01[0-9][\s-]?[0-9]{3}[\s-]?[0-9]{4}/g;
const CARD_RE = /\b(?:\d[ -]*?){13,19}\b/g;

export function moderateAgentInput(text: string): { allowed: boolean; reason?: string } {
  if (!text || text.trim().length < 2) return { allowed: false, reason: 'Message is too short.' };
  if (text.length > 1000) return { allowed: false, reason: 'Message is too long.' };
  const match = blockedPatterns.find((pattern) => pattern.test(text));
  if (match) return { allowed: false, reason: 'Blocked unsafe or cross-tenant request.' };
  return { allowed: true };
}

export function redactPII(text: string): string {
  return (text || '')
    .replace(EMAIL_RE, '[redacted-email]')
    .replace(PHONE_RE, '[redacted-phone]')
    .replace(CARD_RE, '[redacted-card]');
}

export function sanitizeModelInput(text: string, maxChars = 4000): string {
  return redactPII((text || '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim()).slice(0, maxChars);
}

export function capConversation<T extends { role: string; content: string }>(messages: T[], maxTurns = 6, maxCharsEach = 1500): T[] {
  return messages.slice(-maxTurns).map((m) => ({ ...m, content: (m.content || '').slice(0, maxCharsEach) }));
}

export function isSafeModelOutput(text: string): boolean {
  if (!text) return false;
  if (/system\s+prompt|api[_\s-]?key|secret/i.test(text)) return false;
  if (text.length > 6000) return false;
  return true;
}
