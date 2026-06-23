import { serve } from 'inngest/next';
import { inngest } from '../../../inngest/client';
import { sendOrderEmail, rebuildKnowledge, checkAbandonedCarts, sendCartReminder } from '../../../inngest/functions';

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [sendOrderEmail, rebuildKnowledge, checkAbandonedCarts, sendCartReminder],
});
