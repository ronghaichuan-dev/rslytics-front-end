export function decodeJWTPayload(token: string): {
  user_id?: number;
  username?: string;
} {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch {
    return {};
  }
}
