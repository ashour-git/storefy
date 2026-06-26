import { describe, expect, it } from 'vitest';
import { validateUploadFile, type UploadValidation } from '../uploads';

function expectError(result: UploadValidation): asserts result is { valid: false; error: string } {
  if (result.valid !== false) throw new Error('Expected validation to fail');
}

function expectValid(result: UploadValidation): asserts result is { valid: true } {
  if (result.valid !== true) throw new Error('Expected validation to pass');
}

describe('uploads', () => {
  it('rejects unsupported image type', () => {
    const result = validateUploadFile({ type: 'image/gif', size: 1000 });
    expectError(result);
    expect(result.error).toContain('Unsupported');
  });

  it('rejects oversized file', () => {
    const result = validateUploadFile({ type: 'image/jpeg', size: 6 * 1024 * 1024 });
    expectError(result);
    expect(result.error).toContain('too large');
  });

  it('accepts valid file', () => {
    const result = validateUploadFile({ type: 'image/png', size: 1024 });
    expectValid(result);
  });
});
