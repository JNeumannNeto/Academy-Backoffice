// Store global com Zustand
import { create } from 'zustand';

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  tipo: 'administrador' | 'professor' | 'aluno';
  codigoAluno?: number;
}

interface AuthState {
  usuario: Usuario | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (usuario: Usuario, token: string) => void;
  logout: () => void;
  initAuth: () => void;
}

// Função auxiliar para definir cookie
const setCookie = (name: string, value: string, days: number = 7) => {
  if (typeof window === 'undefined') return;
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
};

// Função auxiliar para deletar cookie
const deleteCookie = (name: string) => {
  if (typeof window === 'undefined') return;
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:01 GMT;path=/`;
};

export const useAuthStore = create<AuthState>((set) => ({
  usuario: null,
  token: null,
  isAuthenticated: false,
  
  setAuth: (usuario, token) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
      localStorage.setItem('usuario', JSON.stringify(usuario));
      // Também salva em cookie para o middleware
      setCookie('token', token);
    }
    set({ usuario, token, isAuthenticated: true });
  },
  
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      deleteCookie('token');
    }
    set({ usuario: null, token: null, isAuthenticated: false });
  },
  
  initAuth: () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      const usuarioStr = localStorage.getItem('usuario');
      
      if (token && usuarioStr) {
        try {
          const usuario = JSON.parse(usuarioStr);
      // Atualiza o cookie também
          setCookie('token', token);
          set({ usuario, token, isAuthenticated: true });
        } catch (error) {
          console.error('Erro ao parsear usuário:', error);
        }
      }
    }
  },
}));
