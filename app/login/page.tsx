'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import api from '@/lib/api';
import { AxiosError } from 'axios';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { setAuth } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await api.post('/api/auth/login', { email, senha });
  
      if (data.sucesso) {
        setAuth(data.dados, data.token);
        // Redireciona para a página inicial (que é o dashboard)
        router.replace('/');
}
    } catch (err) {
      const axiosError = err as AxiosError<{ mensagem?: string }>;
      setError(axiosError.response?.data?.mensagem || 'Erro ao fazer login');
    } finally {
    setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 space-y-6">
   <div className="text-center">
 <h1 className="text-4xl font-bold text-gray-900">BackOffice</h1>
          <p className="text-gray-600 mt-2">Sistema de Gerenciamento de Academia</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
           Email
        </label>
            <input
      type="email"
              value={email}
      onChange={(e) => setEmail(e.target.value)}
    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
       placeholder="seu@email.com"
     required
            />
          </div>

 <div>
       <label className="block text-sm font-medium text-gray-700 mb-2">
              Senha
        </label>
<input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
     className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder=""
required
       />
          </div>

          {error && (
     <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {error}
      </div>
          )}

      <button
            type="submit"
        disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
         {loading ? 'Entrando...' : 'Entrar'}
   </button>
      </form>

        <div className="text-center text-sm text-gray-600 space-y-1">
          <p className="font-medium">Credenciais de Teste:</p>
          <p>Email: <span className="text-blue-600">admin@academia.com</span></p>
        <p>Senha: <span className="text-blue-600">admin123</span></p>
    </div>
    </div>
    </div>
  );
}
