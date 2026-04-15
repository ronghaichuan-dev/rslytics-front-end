export default function access(initialState: {
  username?: string;
  permissionCodes?: string[];
}) {
  const isAdmin = initialState?.username === 'admin';
  const codes = initialState?.permissionCodes ?? [];
  return {
    can: (code: string) => isAdmin || codes.includes(code),
  };
}
