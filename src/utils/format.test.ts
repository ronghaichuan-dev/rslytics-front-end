import { trim } from './format';

describe('trim', () => {
  it('should trim leading and trailing whitespace', () => {
    expect(trim('  hello  ')).toBe('hello');
  });

  it('should handle string with no whitespace', () => {
    expect(trim('hello')).toBe('hello');
  });

  it('should handle empty string', () => {
    expect(trim('')).toBe('');
  });

  it('should trim tabs and newlines', () => {
    expect(trim('\t\nhello\n\t')).toBe('hello');
  });
});
