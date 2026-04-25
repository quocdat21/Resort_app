const BASE_URL = 'http://localhost:3000/api';

const getHeaders = (isFormData: boolean = false) => {
  const token = localStorage.getItem('admin_token');
  const headers: Record<string, string> = {};

  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

export const apiService = {
  async get(endpoint: string) {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return await response.json();
    } catch (error) {
      console.error(`API GET Error (${endpoint}):`, error);
      throw error;
    }
  },

  async post(endpoint: string, body: any) {
    const isFormData = body instanceof FormData;
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: getHeaders(isFormData),
        body: isFormData ? body : JSON.stringify(body),
      });
      return await response.json();
    } catch (error) {
      console.error(`API POST Error (${endpoint}):`, error);
      throw error;
    }
  },

  async put(endpoint: string, body: any) {
    const isFormData = body instanceof FormData;
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'PUT',
        headers: getHeaders(isFormData),
        body: isFormData ? body : JSON.stringify(body),
      });
      return await response.json();
    } catch (error) {
      console.error(`API PUT Error (${endpoint}):`, error);
      throw error;
    }
  },

  async delete(endpoint: string) {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      return await response.json();
    } catch (error) {
      console.error(`API DELETE Error (${endpoint}):`, error);
      throw error;
    }
  }
};
