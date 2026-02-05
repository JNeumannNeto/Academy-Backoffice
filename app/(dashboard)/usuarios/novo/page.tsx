'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Info } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import api from '@/lib/api';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { DateInput } from '@/components/DateInput';

interface UsuarioForm {
  nome: string;
  email: string;
  senha?: string;
  confirmarSenha?: string;
  tipo: 'professor' | 'aluno';
  codigoAluno?: number;
  telefone?: string;
  dataNascimento?: string;
}

export default function NovoUsuarioPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register, handleSubmit, watch, unregister, setValue, control, formState: { errors } } = useForm<UsuarioForm>({
  defaultValues: {
      tipo: 'aluno'
    }
  });

  const tipoSelecionado = watch('tipo');
  const senha = watch('senha');

  // Gerenciar campos de senha baseado no tipo
  useEffect(() => {
    if (tipoSelecionado === 'aluno') {
      // Remover campos de senha para alunos
      unregister('senha');
      unregister('confirmarSenha');
    } else {
      // Para professores, limpar os valores (mas manter registrados)
      setValue('senha', '');
      setValue('confirmarSenha', '');
    }
  }, [tipoSelecionado, unregister, setValue]);

  const onSubmit = async (data: UsuarioForm) => {
    setError('');
    setLoading(true);

    // Validação de senhas APENAS para professores
    if (data.tipo === 'professor') {
      if (!data.senha || !data.confirmarSenha) {
        setError('Senha é obrigatória para professores');
        setLoading(false);
        return;
      }
      if (data.senha !== data.confirmarSenha) {
        setError('As senhas não coincidem');
        setLoading(false);
        return;
      }
    }

    // Validação de código para alunos
    if (data.tipo === 'aluno' && !data.codigoAluno) {
      setError('Código do aluno é obrigatório');
      setLoading(false);
      return;
    }

    // Garante que erro de senha não persista para alunos
    if (data.tipo === 'aluno') {
      setError('');
    }

    try {
      const payload = {
        nome: data.nome,
        email: data.email,
        tipo: data.tipo,
        ...(data.tipo === 'aluno' && data.codigoAluno && { codigoAluno: Number(data.codigoAluno) }),
        ...(data.tipo === 'professor' && data.senha && { senha: data.senha }),
        ...(data.telefone && { telefone: data.telefone }),
        ...(data.dataNascimento && { dataNascimento: data.dataNascimento }),
      };

      // DEBUG: Log do payload (REMOVER depois)
      console.log('📤 Payload enviado:', JSON.stringify(payload, null, 2));

      const response = await api.post('/api/usuarios', payload);

      if (response.data.sucesso) {
        router.replace('/usuarios');
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { mensagem?: string } } };
      // DEBUG: Log do erro completo
      console.error('❌ Erro completo:', err);
      console.error('📥 Resposta da API:', error.response?.data);
      // Só mostra erro de senha se for professor
      let mensagem = error.response?.data?.mensagem;
      if (Array.isArray(mensagem)) {
        mensagem = mensagem.join(', ');
      }
      if (data.tipo === 'professor') {
        setError(mensagem || 'Erro ao criar usuário');
      } else {
        setError(mensagem && typeof mensagem === 'string' && !mensagem.toLowerCase().includes('senha') ? mensagem : 'Erro ao criar usuário');
      }
      setLoading(false);
    }
  };

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
<h1 className="text-3xl font-bold text-gray-900">Novo Usuário</h1>
       <p className="text-gray-600 mt-1">Cadastre um novo professor ou aluno</p>
     </div>
      </div>

      {/* DEBUG: Mostrar tipo selecionado */}
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm">
  <strong>🐛 DEBUG:</strong> Tipo selecionado: <code>{tipoSelecionado}</code>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg shadow p-6 space-y-6">
        {/* Tipo de Usuário */}
   <div>
 <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Usuário *
          </label>
      <div className="flex gap-4">
    <label className="flex items-center gap-2 cursor-pointer">
    <input
           type="radio"
    value="professor"
      {...register('tipo', { required: true })}
     className="w-4 h-4 text-blue-600"
  />
              <span>Professor</span>
            </label>
   <label className="flex items-center gap-2 cursor-pointer">
    <input
          type="radio"
         value="aluno"
           {...register('tipo', { required: true })}
                className="w-4 h-4 text-blue-600"
    />
              <span>Aluno</span>
      </label>
        </div>
        </div>

        {/* Aviso para alunos */}
        {tipoSelecionado === 'aluno' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
       <Info size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
         <div className="text-sm text-blue-900">
              <p className="font-medium mb-1">Senha será definida pelo aluno</p>
     <p className="text-blue-700">
           O aluno receberá um link para definir sua própria senha no primeiro acesso ao aplicativo.
     </p>
            </div>
          </div>
        )}

        {/* Nome */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
   Nome Completo *
 </label>
          <input
            type="text"
            {...register('nome', { required: 'Nome é obrigatório' })}
     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
   placeholder="Digite o nome completo"
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
 placeholder="email@exemplo.com"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
      )}
        </div>

 {/* Código do Aluno (apenas para alunos) */}
  {tipoSelecionado === 'aluno' && (
          <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
   Código do Aluno *
    </label>
  <input
              type="number"
      {...register('codigoAluno', { 
 required: 'Código é obrigatório',
                min: { value: 1, message: 'Código deve ser maior que 0' }
    })}
      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Digite o código único do aluno"
        />
     {errors.codigoAluno && (
       <p className="mt-1 text-sm text-red-600">{errors.codigoAluno.message}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Código numérico único para identificação do aluno
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

 {/* Senha - APENAS PARA PROFESSORES */}
        {tipoSelecionado === 'professor' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
            <div>
 <label className="block text-sm font-medium text-gray-700 mb-2">
       Senha *
     </label>
    <input
         type="password"
      {...register('senha', { 
        required: 'Senha é obrigatória',
     minLength: { value: 6, message: 'Senha deve ter no mínimo 6 caracteres' }
  })}
  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
  placeholder="Mínimo 6 caracteres"
              />
  {errors.senha && (
 <p className="mt-1 text-sm text-red-600">{errors.senha.message}</p>
 )}
            </div>

        <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
         Confirmar Senha *
         </label>
        <input
                type="password"
                {...register('confirmarSenha', { 
      required: 'Confirmação de senha é obrigatória',
       validate: value => value === senha || 'As senhas não coincidem'
         })}
     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      placeholder="Confirme a senha"
      />
    {errors.confirmarSenha && (
     <p className="mt-1 text-sm text-red-600">{errors.confirmarSenha.message}</p>
     )}
  </div>
     </div>
        )}

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
         <span>Salvando...</span>
            </>
            ) : (
              <>
     <Save size={20} />
           <span>Salvar Usuário</span>
            </>
            )}
          </button>
     </div>
      </form>
    </div>
  );
}
