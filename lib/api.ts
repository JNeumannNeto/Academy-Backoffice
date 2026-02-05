// Configuração do cliente API
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : 'https://academyserver.jneumann.com.br');

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token automaticamente
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Interceptor para tratar erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
   // Token inválido ou expirado
   if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        window.location.href = '/login';
    }
    }
    return Promise.reject(error);
  }
);

export default api;
