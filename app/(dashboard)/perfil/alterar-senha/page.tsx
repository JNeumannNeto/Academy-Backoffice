'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import api from '@/lib/api';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface AlterarSenhaForm {
  senhaAtual: string;
  novaSenha: string;
  confirmarSenha: string;
}

export default function AlterarSenhaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sucesso, setSucesso] = useState(false);

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<AlterarSenhaForm>();

  const novaSenha = watch('novaSenha');

  const onSubmit = async (data: AlterarSenhaForm) => {
    setError('');
    setSucesso(false);
    setLoading(true);

    if (data.novaSenha !== data.confirmarSenha) {
      setError('As senhas não coincidem');
      setLoading(false);
      return;
    }

    if (data.senhaAtual === data.novaSenha) {
      setError('A nova senha deve ser diferente da senha atual');
      setLoading(false);
      return;
    }

    try {
      const response = await api.put('/api/auth/alterarsenha', {
     senhaAtual: data.senhaAtual,
        novaSenha: data.novaSenha
      });

      if (response.data.sucesso) {
      setSucesso(true);
        reset();
      
  // Atualizar token se retornado
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
  }
    }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { mensagem?: string } } };
      setError(error.response?.data?.mensagem || 'Erro ao alterar senha');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
      <ArrowLeft size={20} />
        </button>
   <div>
   <h1 className="text-3xl font-bold text-gray-900">Alterar Senha</h1>
   <p className="text-gray-600 mt-1">Defina uma nova senha de acesso</p>
    </div>
      </div>

      {/* Card */}
      <div className="bg-white rounded-lg shadow p-6">
        {/* Informações de Segurança */}
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex gap-3">
          <Lock size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-medium mb-1">Dicas de Segurança</p>
       <ul className="text-blue-700 space-y-1 list-disc list-inside">
              <li>Use no mínimo 6 caracteres</li>
        <li>Combine letras, números e símbolos</li>
          <li>Não use informações pessoais óbvias</li>
        <li>Não compartilhe sua senha com ninguém</li>
     </ul>
          </div>
      </div>

        {/* Formulário */}
   <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
   {/* Senha Atual */}
    <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
         Senha Atual *
            </label>
   <input
       type="password"
              {...register('senhaAtual', { 
    required: 'Senha atual é obrigatória'
              })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
     placeholder="Digite sua senha atual"
    />
      {errors.senhaAtual && (
         <p className="mt-1 text-sm text-red-600">{errors.senhaAtual.message}</p>
 )}
          </div>

          {/* Divisor */}
    <div className="border-t border-gray-200 pt-6"></div>

{/* Nova Senha */}
          <div>
 <label className="block text-sm font-medium text-gray-700 mb-2">
  Nova Senha *
            </label>
            <input
  type="password"
{...register('novaSenha', { 
    required: 'Nova senha é obrigatória',
       minLength: { value: 6, message: 'Senha deve ter no mínimo 6 caracteres' }
         })}
      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
       placeholder="Digite sua nova senha"
         />
            {errors.novaSenha && (
           <p className="mt-1 text-sm text-red-600">{errors.novaSenha.message}</p>
            )}
          </div>

          {/* Confirmar Nova Senha */}
       <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
  Confirmar Nova Senha *
  </label>
   <input
        type="password"
  {...register('confirmarSenha', { 
          required: 'Confirmação de senha é obrigatória',
      validate: value => value === novaSenha || 'As senhas não coincidem'
           })}
     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        placeholder="Digite a nova senha novamente"
        />
     {errors.confirmarSenha && (
   <p className="mt-1 text-sm text-red-600">{errors.confirmarSenha.message}</p>
      )}
     </div>

  {/* Mensagens */}
   {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
    <AlertCircle size={16} />
              <span>{error}</span>
     </div>
      )}

 {sucesso && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
           <CheckCircle size={16} />
       <span>Senha alterada com sucesso!</span>
          </div>
     )}

          {/* Botões */}
  <div className="flex gap-4 justify-end pt-4 border-t">
   <button
       type="button"
 onClick={() => router.back()}
className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              disabled={loading}
            >
         Cancelar
      </button>
            <button
       type="submit"
              disabled={loading}
 className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
>
   {loading ? (
      <>
             <LoadingSpinner />
   <span>Alterando...</span>
     </>
    ) : (
                <>
      <Save size={20} />
             <span>Alterar Senha</span>
                </>
           )}
       </button>
          </div>
    </form>
      </div>
    </div>
  );
}
