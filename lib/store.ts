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
    // Validar dados antes de salvar
    if (!usuario || !usuario.id || !usuario.nome || !usuario.email || !usuario.tipo) {
      console.error('Tentativa de salvar dados de usuário inválidos:', usuario);
      throw new Error('Dados de usuário inválidos');
    }
    
    if (!token || typeof token !== 'string' || token.trim().length === 0) {
      console.error('Token inválido:', token);
      throw new Error('Token inválido');
    }

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('token', token);
        localStorage.setItem('usuario', JSON.stringify(usuario));
        // Também salva em cookie para o middleware
        setCookie('token', token);
        console.log('Autenticação salva com sucesso:', { usuario: usuario.nome, email: usuario.email });
      } catch (error) {
        console.error('Erro ao salvar no localStorage:', error);
        throw new Error('Erro ao salvar dados de autenticação');
      }
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
      try {
        const token = localStorage.getItem('token');
        const usuarioStr = localStorage.getItem('usuario');
        
        if (token && usuarioStr) {
          // Verificar se não está vazio ou corrompido
          if (usuarioStr.trim().length === 0 || usuarioStr === 'undefined' || usuarioStr === 'null') {
            throw new Error('Dados de usuário vazios ou inválidos');
          }

          const usuario = JSON.parse(usuarioStr);
          
          // Validar se o objeto parseado tem os campos necessários
          if (usuario && usuario.id && usuario.nome && usuario.email && usuario.tipo) {
            // Atualiza o cookie também
            setCookie('token', token);
            set({ usuario, token, isAuthenticated: true });
          } else {
            // Dados inválidos, limpar
            console.warn('Dados de usuário inválidos no localStorage');
            throw new Error('Estrutura de usuário inválida');
          }
        } else {
          // Sem dados de autenticação
          set({ usuario: null, token: null, isAuthenticated: false });
        }
      } catch (error) {
        console.error('Erro ao inicializar autenticação:', error);
        // Limpar localStorage corrompido
        try {
          localStorage.removeItem('token');
          localStorage.removeItem('usuario');
          deleteCookie('token');
        } catch (cleanupError) {
          console.error('Erro ao limpar localStorage:', cleanupError);
        }
        set({ usuario: null, token: null, isAuthenticated: false });
      }
    }
  },
}));
