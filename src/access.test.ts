import { describe, expect, it } from 'vitest';
import access from './access';

describe('access', () => {
  it('returns can() that returns true for codes in the list', () => {
    const { can } = access({ permissionCodes: ['user:list', 'user:create'] });
    expect(can('user:list')).toBe(true);
    expect(can('user:create')).toBe(true);
  });

  it('returns false for codes not in the list', () => {
    const { can } = access({ permissionCodes: ['user:list'] });
    expect(can('user:delete')).toBe(false);
  });

  it('handles empty permissionCodes gracefully', () => {
    const { can } = access({});
    expect(can('user:list')).toBe(false);
  });
});
