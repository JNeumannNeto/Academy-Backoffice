'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import api from '@/lib/api';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { DateInput } from '@/components/DateInput';
import { Usuario } from '@/types';

interface UsuarioEditForm {
  nome: string;
  email: string;
  codigoAluno?: number;
  telefone?: string;
  dataNascimento?: string;
  senha?: string;
  confirmarSenha?: string;
}

export default function EditarUsuarioPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  const { register, handleSubmit, watch, reset, control, formState: { errors } } = useForm<UsuarioEditForm>();

  const senha = watch('senha');

  useEffect(() => {
    carregarUsuario();
  }, [id]);

  const carregarUsuario = async () => {
    try {
  setLoading(true);
      const { data } = await api.get(`/api/usuarios/${id}`);
      
      if (data.sucesso) {
        setUsuario(data.dados);
        reset({
   nome: data.dados.nome,
          email: data.dados.email,
    codigoAluno: data.dados.codigoAluno,
   telefone: data.dados.telefone || '',
          dataNascimento: data.dados.dataNascimento?.split('T')[0] || '',
        });
   }
    } catch (err) {
      console.error('Erro ao carregar usuário:', err);
      setError('Erro ao carregar dados do usuário');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: UsuarioEditForm) => {
    setError('');
    setSaving(true);

    // Validação de senhas (se fornecidas)
    if (data.senha && data.senha !== data.confirmarSenha) {
      setError('As senhas não coincidem');
      setSaving(false);
      return;
    }

    try {
    const payload: Partial<UsuarioEditForm> = {
     nome: data.nome,
    email: data.email,
      ...(usuario?.tipo === 'aluno' && data.codigoAluno && { codigoAluno: Number(data.codigoAluno) }),
    ...(data.telefone && { telefone: data.telefone }),
      ...(data.dataNascimento && { dataNascimento: data.dataNascimento }),
    ...(data.senha && { senha: data.senha }),
      };

      const response = await api.patch(`/api/usuarios/${id}`, payload);

    if (response.data.sucesso) {
        router.push('/usuarios');
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { mensagem?: string } } };
      setError(error.response?.data?.mensagem || 'Erro ao atualizar usuário');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (!usuario) {
    return (
      <div className="text-center py-12">
<p className="text-gray-600">Usuário não encontrado</p>
        <button
          onClick={() => router.push('/usuarios')}
          className="mt-4 text-blue-600 hover:underline"
        >
     Voltar para lista de usuários
     </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
        className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <ArrowLeft size={20} />
        </button>
  <div>
      <h1 className="text-3xl font-bold text-gray-900">Editar Usuário</h1>
          <p className="text-gray-600 mt-1">
            {usuario.tipo === 'administrador' && 'Administrador'}
  {usuario.tipo === 'professor' && 'Professor'}
  {usuario.tipo === 'aluno' && `Aluno ${usuario.codigoAluno ? `#${usuario.codigoAluno}` : ''}`}
 </p>
      </div>
      </div>

      {/* Formulário */}
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg shadow p-6 space-y-6">
        {/* Tipo (readonly) */}
      <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Usuário
          </label>
   <input
            type="text"
            value={usuario.tipo.charAt(0).toUpperCase() + usuario.tipo.slice(1)}
   disabled
        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
          />
      <p className="mt-1 text-xs text-gray-500">
            O tipo de usuário não pode ser alterado
          </p>
        </div>

        {/* Nome */}
 <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nome Completo *
      </label>
          <input
 type="text"
      {...register('nome', { required: 'Nome é obrigatório' })}
      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {errors.nome && (
 <p className="mt-1 text-sm text-red-600">{errors.nome.message}</p>
          )}
        </div>

        {/* Email */}
        <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
            Email *
          </label>
 <input
            type="email"
            {...register('email', { 
       required: 'Email é obrigatório',
      pattern: {
    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
    message: 'Email inválido'
              }
            })}
className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
       />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        {/* Código do Aluno (apenas para alunos, readonly) */}
        {usuario.tipo === 'aluno' && (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
   Código do Aluno
  </label>
     <input
  type="number"
           {...register('codigoAluno')}
       disabled
   className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
/>
            <p className="mt-1 text-xs text-gray-500">
    O código do aluno não pode ser alterado
     </p>
          </div>
     )}

    {/* Telefone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Telefone
    </label>
          <input
      type="tel"
          {...register('telefone')}
       className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
     placeholder="(00) 00000-0000"
       />
        </div>

        {/* Data de Nascimento */}
        <Controller
          name="dataNascimento"
          control={control}
          render={({ field }) => (
            <DateInput
              label="Data de Nascimento"
              value={field.value || ''}
              onChange={field.onChange}
              name="dataNascimento"
            />
          )}
        />

        {/* Alterar Senha (opcional) */}
    <div className="border-t pt-6">
  <h3 className="text-lg font-semibold text-gray-900 mb-4">Alterar Senha (Opcional)</h3>
      <p className="text-sm text-gray-600 mb-4">Deixe em branco para manter a senha atual</p>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
   <label className="block text-sm font-medium text-gray-700 mb-2">
      Nova Senha
   </label>
     <input
                type="password"
 {...register('senha', { 
             minLength: { value: 6, message: 'Senha deve ter no mínimo 6 caracteres' }
                })}
      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      placeholder="••••••••"
     />
              {errors.senha && (
                <p className="mt-1 text-sm text-red-600">{errors.senha.message}</p>
           )}
            </div>

  <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
         Confirmar Nova Senha
          </label>
    <input
                type="password"
    {...register('confirmarSenha', { 
              validate: value => !senha || !value || value === senha || 'As senhas não coincidem'
                })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
           placeholder="••••••••"
     />
        {errors.confirmarSenha && (
       <p className="mt-1 text-sm text-red-600">{errors.confirmarSenha.message}</p>
              )}
    </div>
          </div>
        </div>

    {/* Erro geral */}
        {error && (
    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
  {error}
          </div>
  )}

        {/* Botões */}
        <div className="flex gap-4 justify-end pt-4 border-t">
     <button
 type="button"
     onClick={() => router.back()}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
     disabled={saving}
 >
            Cancelar
        </button>
          <button
   type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {saving ? (
              <>
      <LoadingSpinner />
                <span>Salvando...</span>
              </>
       ) : (
           <>
    <Save size={20} />
           <span>Salvar Alterações</span>
      </>
    )}
          </button>
    </div>
      </form>
    </div>
  );
}
