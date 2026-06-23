import { inngest } from '../../inngest/client';

export interface JobRunner {
  enqueue<TPayload>(name: string, payload: TPayload): Promise<void>;
}

class InngestJobRunner implements JobRunner {
  async enqueue<TPayload>(name: string, payload: TPayload) {
    await inngest.send({ name, data: payload as any });
  }
}

class InlineJobRunner implements JobRunner {
  async enqueue<TPayload>(name: string, payload: TPayload) {
    console.info('[jobs:inline]', name, payload);
  }
}

export const jobRunner: JobRunner = process.env.INNGEST_EVENT_KEY
  ? new InngestJobRunner()
  : new InlineJobRunner();
