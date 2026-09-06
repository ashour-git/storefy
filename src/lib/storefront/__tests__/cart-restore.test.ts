import { describe, expect, it } from 'vitest';
import { signRestoreToken, verifyRestoreToken } from '../cart-restore';

const SECRET = 'test-secret-123';
const IDS = { cartId: 'cart-1', tenantId: 'tenant-1' };

describe('restore token', () => {
  it('round-trips a valid token', () => {
    const token = signRestoreToken(IDS, SECRET);
    expect(verifyRestoreToken(token, SECRET)).toEqual(IDS);
  });

  it('rejects tampered tokens', () => {
    const token = signRestoreToken(IDS, SECRET);
    const [payload] = token.split('.');
    const forged = `${payload}.deadbeef`;
    expect(verifyRestoreToken(forged, SECRET)).toBeNull();
    const other = Buffer.from(JSON.stringify({ cartId: 'cart-2', tenantId: 'tenant-1', exp: Date.now() + 60000 })).toString('base64url');
    expect(verifyRestoreToken(`${other}.${token.split('.')[1]}`, SECRET)).toBeNull();
  });

  it('rejects expired tokens', () => {
    const token = signRestoreToken(IDS, SECRET, -1000);
    expect(verifyRestoreToken(token, SECRET)).toBeNull();
  });

  it('rejects tokens signed with another secret', () => {
    const token = signRestoreToken(IDS, SECRET);
    expect(verifyRestoreToken(token, 'other-secret')).toBeNull();
  });

  it('rejects malformed tokens', () => {
    expect(verifyRestoreToken('', SECRET)).toBeNull();
    expect(verifyRestoreToken('not-a-token', SECRET)).toBeNull();
  });
});
