const blockedPatterns = [
  /ignore\s+(all\s+)?previous\s+instructions/i,
  /system\s+prompt/i,
  /another\s+tenant/i,
  /other\s+stores?\s+data/i,
  /export\s+database/i,
  /secret|api[_\s-]?key|password/i,
];

export function moderateAgentInput(text: string): { allowed: boolean; reason?: string } {
  const match = blockedPatterns.find((pattern) => pattern.test(text));
  if (match) return { allowed: false, reason: 'Blocked unsafe or cross-tenant request.' };
  return { allowed: true };
}
