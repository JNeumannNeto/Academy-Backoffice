'use client';

import { useEffect, useState, startTransition } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/store';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { initAuth, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [isInitialized, setIsInitialized] = useState(false);

  // Inicializa a autenticação apenas uma vez
  useEffect(() => {
    initAuth();
    startTransition(() => {
      setIsInitialized(true);
    });
  }, [initAuth]);

  // Redireciona apenas depois da inicialização
  useEffect(() => {
    if (isInitialized) {
      console.log('AuthProvider - Estado:', { isAuthenticated, pathname });
      
      // Rotas públicas que não precisam de autenticação
      const publicRoutes = ['/login'];
      const isPublicRoute = publicRoutes.includes(pathname);

      if (!isAuthenticated && !isPublicRoute) {
        console.log('AuthProvider - Redirecionando para login');
        router.replace('/login');
      } else if (isAuthenticated && pathname === '/login') {
        console.log('AuthProvider - Redirecionando para dashboard');
        router.push('/');
      }
    }
  }, [isAuthenticated, pathname, router, isInitialized]);

  // Não renderiza até inicializar
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
