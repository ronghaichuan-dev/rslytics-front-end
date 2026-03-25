export default function access(initialState: { permissionCodes?: string[] }) {
  const codes = initialState?.permissionCodes ?? [];
  return {
    can: (code: string) => codes.includes(code),
  };
}
