const ADMIN_TOKEN_KEY = 'admin_token';
const ADMIN_USER_KEY = 'admin_user';
const SESSION_EXPIRED_EVENT = 'adminSessionExpired';

const decodeJwtPayload = (token: string): { exp?: number } | null => {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;

    const normalizedPayload = payload
      .replace(/-/g, '+')
      .replace(/_/g, '/')
      .padEnd(Math.ceil(payload.length / 4) * 4, '=');
    const decodedPayload = atob(normalizedPayload);
    return JSON.parse(decodedPayload);
  } catch {
    return null;
  }
};

export const getAdminToken = () => localStorage.getItem(ADMIN_TOKEN_KEY);

export const isAdminTokenExpired = (token: string | null = getAdminToken()) => {
  if (!token) return true;

  const payload = decodeJwtPayload(token);
  if (!payload?.exp) return false;

  return payload.exp * 1000 <= Date.now();
};

export const clearAdminSession = (redirectToLogin = true) => {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
  localStorage.removeItem(ADMIN_USER_KEY);
  window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));

  if (redirectToLogin && window.location.pathname !== '/login') {
    window.location.replace('/login?sessionExpired=1');
  }
};

export const onAdminSessionExpired = (handler: () => void) => {
  window.addEventListener(SESSION_EXPIRED_EVENT, handler);
  return () => window.removeEventListener(SESSION_EXPIRED_EVENT, handler);
};
