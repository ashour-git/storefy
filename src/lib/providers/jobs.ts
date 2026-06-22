export interface JobRunner {
  enqueue<TPayload>(name: string, payload: TPayload): Promise<void>;
}

class InlineJobRunner implements JobRunner {
  async enqueue<TPayload>(name: string, payload: TPayload) {
    console.info('[jobs:inline]', name, payload);
  }
}

export const jobRunner: JobRunner = new InlineJobRunner();
