// const BASE_URL = 'http://localhost:3000/api';
import { clearAdminSession, getAdminToken, isAdminTokenExpired } from '../utils/session';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const getHeaders = (isFormData: boolean = false) => {
  const token = getAdminToken();
  const headers: Record<string, string> = {};

  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

const shouldSkipSessionLogout = (endpoint: string) => {
  return endpoint === '/auth/admin-login' || endpoint === '/auth/login';
};

const handleResponse = async (response: Response, endpoint: string) => {
  const data = await response.json().catch(() => ({
    success: false,
    message: 'Invalid server response.',
  }));

  if (response.status === 401 && !shouldSkipSessionLogout(endpoint)) {
    clearAdminSession();
  }

  return data;
};

const ensureActiveSession = (endpoint: string) => {
  if (!shouldSkipSessionLogout(endpoint) && getAdminToken() && isAdminTokenExpired()) {
    clearAdminSession();
    return false;
  }

  return true;
};

export const apiService = {
  async get(endpoint: string, params?: Record<string, any>) {
    try {
      if (!ensureActiveSession(endpoint)) {
        return { success: false, message: 'Phiên đăng nhập đã hết hạn.' };
      }

      let url = `${BASE_URL}${endpoint}`;
      if (params) {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            searchParams.append(key, value.toString());
          }
        });
        const queryString = searchParams.toString();
        if (queryString) {
          url += (url.includes('?') ? '&' : '?') + queryString;
        }
      }
      const response = await fetch(url, {
        method: 'GET',
        headers: getHeaders(),
      });
      return await handleResponse(response, endpoint);
    } catch (error) {
      console.error(`API GET Error (${endpoint}):`, error);
      throw error;
    }
  },

  async post(endpoint: string, body: any) {
    const isFormData = body instanceof FormData;
    try {
      if (!ensureActiveSession(endpoint)) {
        return { success: false, message: 'Phiên đăng nhập đã hết hạn.' };
      }

      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: getHeaders(isFormData),
        body: isFormData ? body : JSON.stringify(body),
      });
      return await handleResponse(response, endpoint);
    } catch (error) {
      console.error(`API POST Error (${endpoint}):`, error);
      throw error;
    }
  },

  async put(endpoint: string, body: any) {
    const isFormData = body instanceof FormData;
    try {
      if (!ensureActiveSession(endpoint)) {
        return { success: false, message: 'Phiên đăng nhập đã hết hạn.' };
      }

      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'PUT',
        headers: getHeaders(isFormData),
        body: isFormData ? body : JSON.stringify(body),
      });
      return await handleResponse(response, endpoint);
    } catch (error) {
      console.error(`API PUT Error (${endpoint}):`, error);
      throw error;
    }
  },

  async delete(endpoint: string) {
    try {
      if (!ensureActiveSession(endpoint)) {
        return { success: false, message: 'Phiên đăng nhập đã hết hạn.' };
      }

      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      return await handleResponse(response, endpoint);
    } catch (error) {
      console.error(`API DELETE Error (${endpoint}):`, error);
      throw error;
    }
  }
};
