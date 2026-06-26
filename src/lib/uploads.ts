const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];
const MAX_SIZE = 5 * 1024 * 1024;

export interface UploadFile {
  type: string;
  size: number;
}

export type UploadValidation =
  | { valid: true }
  | { valid: false; error: string };

export function validateUploadFile(file: UploadFile): UploadValidation {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { valid: false, error: `Unsupported file type` };
  }
  if (file.size > MAX_SIZE) {
    return { valid: false, error: `File too large` };
  }
  return { valid: true };
}
