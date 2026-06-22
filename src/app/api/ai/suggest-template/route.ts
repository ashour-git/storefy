import { auth } from '../../../../lib/auth';
import { headers } from 'next/headers';
import { aiProvider } from '../../../../lib/providers/ai';
import { getErrorMessage } from '../../../../lib/errors';

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json() as { category?: string; locale?: string; businessDescription?: string };
    const suggestion = await aiProvider.suggestTemplate({
      category: body.category,
      locale: body.locale === 'en' ? 'en' : 'ar',
      businessDescription: body.businessDescription,
    });

    return Response.json(suggestion);
  } catch (error: unknown) {
    return Response.json({ error: 'Failed to suggest template', details: getErrorMessage(error) }, { status: 500 });
  }
}
