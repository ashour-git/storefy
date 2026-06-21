import { auth } from '../../../../lib/auth';
import { toNextResponse } from 'better-auth/next-response';

export const POST = async (request: Request) => {
  return toNextResponse(await auth.handler(request));
};

export const GET = async (request: Request) => {
  return toNextResponse(await auth.handler(request));
};
