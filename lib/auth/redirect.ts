export function safeAuthRedirect(value: string | null) {
  if (!value || !value.startsWith('/') || value.startsWith('//') || /[\\\r\n]/.test(value) || value.startsWith('/auth/callback')) return '/dashboard';
  return value;
}
