import { decodeJWTPayload } from './jwt';

describe('decodeJWTPayload', () => {
  it('should decode a valid JWT payload', () => {
    const payload = { user_id: 42, username: 'testuser' };
    const encoded = btoa(JSON.stringify(payload));
    const token = `header.${encoded}.signature`;
    expect(decodeJWTPayload(token)).toEqual(payload);
  });

  it('should return empty object for invalid token', () => {
    expect(decodeJWTPayload('invalid')).toEqual({});
  });

  it('should return empty object for malformed base64', () => {
    expect(decodeJWTPayload('a.!!!.b')).toEqual({});
  });

  it('should return empty object for empty string', () => {
    expect(decodeJWTPayload('')).toEqual({});
  });

  it('should handle payload without user_id', () => {
    const payload = { sub: 'test' };
    const encoded = btoa(JSON.stringify(payload));
    const token = `h.${encoded}.s`;
    const result = decodeJWTPayload(token);
    expect(result.user_id).toBeUndefined();
  });
});
