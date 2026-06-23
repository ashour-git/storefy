import { Inngest } from 'inngest';

export const inngest = new Inngest({
  id: 'storefy',
  name: 'Storefy',
  baseUrl: process.env.INNGEST_BASE_URL || 'http://localhost:3000',
  eventKey: process.env.INNGEST_EVENT_KEY || 'local-dev-key',
});
