'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { DateInput } from '@/components/DateInput';
import api from '@/lib/api';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { AnamneseForm } from '@/components/AnamneseForm';
import { MultiSelect } from '@/components/MultiSelect';
import { Usuario, Objetivo, Equipamento } from '@/types';

interface TreinoModelo {
  _id: string;
  nome: string;
  cor: string;
  partes: any[];
  observacoes: string;
}

interface FichaForm {
  alunoId: string;
  professorReferenciaId: string;
  dataInicio: string;
  dataValidade: string;
  anotacoesNutricao: string;
}

export default function NovaFichaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Dados para selects
  const [alunos, setAlunos] = useState<Usuario[]>([]);
  const [professores, setProfessores] = useState<Usuario[]>([]);
  const [objetivos, setObjetivos] = useState<Objetivo[]>([]);
  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([]);
  const [treinosModelo, setTreinosModelo] = useState<TreinoModelo[]>([]);
  const [treinosSelecionados, setTreinosSelecionados] = useState<string[]>([]);

  // Estados complexos
  const [anamnese, setAnamnese] = useState({
    remedios: '' as string | undefined,
    problemasSaude: '' as string | undefined,
    doencas: '' as string | undefined,
    cirurgias: '' as string | undefined,
    condicoes: {
      diabetes: false,
      hipertensao: false,
      doencaCardiaca: false,
      hipoglicemia: false,
      alergia: false,
      descricaoAlergia: '' as string | undefined,
      outras: [] as string[] | undefined
    }
  });

  const [objetivosSelecionados, setObjetivosSelecionados] = useState<string[]>([]);

  const { register, handleSubmit, watch, formState: { errors }, control } = useForm<FichaForm>({
    defaultValues: {
  dataInicio: new Date().toISOString().split('T')[0]
    }
  });

  const alunoSelecionado = watch('alunoId');

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);
      console.log('📋 Carregando dados para nova ficha...');
      
      const [usuariosRes, objetivosRes, equipamentosRes, treinosRes] = await Promise.all([
        api.get('/api/usuarios'),
        api.get('/api/catalogo/objetivos'),
        api.get('/api/catalogo/equipamentos'),
        api.get('/api/treinos-modelo?ativo=true')
      ]);

    console.log('👥 Resposta usuários:', usuariosRes.data);
      console.log('🎯 Resposta objetivos:', objetivosRes.data);
  console.log('💪 Resposta equipamentos:', equipamentosRes.data);
      console.log('📝 Resposta treinos:', treinosRes.data);

      if (usuariosRes.data.sucesso) {
        const usuarios = usuariosRes.data.dados || [];
    console.log('✓ Usuários recebidos:', usuarios.length);
        
        setAlunos(usuarios.filter((u: Usuario) => u.tipo === 'aluno' && u.ativo));
   setProfessores(usuarios.filter((u: Usuario) => u.tipo === 'professor' && u.ativo));
      } else {
   setAlunos([]);
  setProfessores([]);
      }

 if (objetivosRes.data.sucesso) {
      const objetivos = objetivosRes.data.dados || [];
        console.log('✓ Objetivos recebidos:', objetivos.length);
        
        setObjetivos(objetivos.filter((o: Objetivo) => o.ativo));
      } else {
        setObjetivos([]);
      }

 if (equipamentosRes.data.sucesso) {
        const equipamentos = equipamentosRes.data.dados || [];
        console.log('✓ Equipamentos recebidos:', equipamentos.length);
        
        setEquipamentos(equipamentos.filter((e: Equipamento) => e.ativo));
      } else {
  setEquipamentos([]);
      }
      if (treinosRes.data.sucesso) {
        const treinos = treinosRes.data.dados || [];
        console.log('✓ Treinos modelo recebidos:', treinos.length);
        setTreinosModelo(treinos);
      } else {
        setTreinosModelo([]);
      }
   console.log(' Carregamento finalizado');
    } catch (err) {
      console.error(' Erro ao carregar dados:', err);
    setError('Erro ao carregar dados necessários');
      setAlunos([]);
      setProfessores([]);
      setObjetivos([]);
      setEquipamentos([]);
    } finally {
    setLoading(false);
    }
  };

  const onSubmit = async (data: FichaForm) => {
    setError('');

    // Validações
    if (!data.alunoId) {
      setError('Selecione um aluno');
      return;
    }

    if (!data.professorReferenciaId) {
      setError('Selecione um professor de referência');
      return;
    }

    if (objetivosSelecionados.length === 0) {
      setError('Selecione pelo menos um objetivo');
      return;
    }

    if (treinosSelecionados.length === 0) {
      setError('Selecione pelo menos um treino modelo');
      return;
    }

    setSaving(true);

    try {
      const payload = {
        alunoId: data.alunoId,
        professorReferenciaId: data.professorReferenciaId,
        dataInicio: data.dataInicio,
        dataValidade: data.dataValidade,
        anamnese,
        objetivos: objetivosSelecionados,
        anotacoesNutricao: data.anotacoesNutricao || '',
        treinosIds: treinosSelecionados
      };

      const response = await api.post('/api/fichas', payload);

      if (response.data.sucesso) {
        router.push('/fichas');
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { mensagem?: string } } };
      setError(error.response?.data?.mensagem || 'Erro ao criar ficha');
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

  const alunoInfo = alunos.find(a => a._id === alunoSelecionado);

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center gap-4">
    <button
     onClick={() => router.back()}
  className="p-2 hover:bg-gray-100 rounded-lg transition"
 >
   <ArrowLeft size={20} />
        </button>
        <div>
  <h1 className="text-3xl font-bold text-gray-900">Nova Ficha de Treino</h1>
          <p className="text-gray-600 mt-1">Preencha todos os dados da ficha</p>
 </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Seção 1: Informações Básicas */}
  <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Informações Básicas</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Aluno */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Aluno *
              </label>
              <select
                {...register('alunoId', { required: 'Aluno é obrigatório' })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Selecione um aluno...</option>
                {alunos.map(aluno => (
                  <option key={aluno._id} value={aluno._id}>
                    {aluno.nome} - Código #{aluno.codigoAluno}
                  </option>
                ))}
              </select>
              {errors.alunoId && (
                <p className="mt-1 text-sm text-red-600">{errors.alunoId.message}</p>
              )}
              {alunoInfo && (
                <p className="mt-1 text-sm text-gray-600">
                  Email: {alunoInfo.email}
                </p>
              )}
            </div>

            {/* Professor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Professor de Referência *
              </label>
              <select
                {...register('professorReferenciaId', { required: 'Professor é obrigatório' })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Selecione um professor...</option>
                {professores.map(prof => (
                  <option key={prof._id} value={prof._id}>
                    {prof.nome}
                  </option>
                ))}
              </select>
              {errors.professorReferenciaId && (
                <p className="mt-1 text-sm text-red-600">{errors.professorReferenciaId.message}</p>
              )}
            </div>

            {/* Data Início */}
            <Controller
              name="dataInicio"
              control={control}
              rules={{ required: 'Data de início é obrigatória' }}
              render={({ field }) => (
                <DateInput
                  label="Data de Início"
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  name="dataInicio"
                  error={errors.dataInicio?.message}
                  required
                />
              )}
            />

            {/* Data Validade */}
            <div>
              <Controller
                name="dataValidade"
                control={control}
                rules={{ required: 'Data de validade é obrigatória' }}
                render={({ field }) => (
                  <DateInput
                    label="Data de Validade"
                    value={field.value ?? ''}
                    onChange={field.onChange}
                    name="dataValidade"
                    error={errors.dataValidade?.message}
                    required
                  />
                )}
              />
              <p className="mt-1 text-xs text-gray-500">
                Geralmente 3 meses após a data de início
              </p>
            </div>
          </div>
        </div>

        {/* Seção 2: Anamnese */}
        <div className="bg-white rounded-lg shadow p-6">
          <AnamneseForm 
            value={anamnese} 
            onChange={(value) => setAnamnese(value as typeof anamnese)} 
          />
        </div>

        {/* Seção 3: Objetivos */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Objetivos do Aluno</h2>
          <MultiSelect
            options={objetivos.map(obj => ({ value: obj.nome, label: obj.nome }))}
            value={objetivosSelecionados}
            onChange={setObjetivosSelecionados}
            placeholder="Selecione os objetivos..."
            label="Objetivos *"
          />
          <p className="mt-2 text-sm text-gray-600">
            Selecione todos os grupos musculares e objetivos que serão trabalhados
          </p>
        </div>

        {/* Seção 4: Nutrição */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Anotações de Nutrição</h2>
          <textarea
            {...register('anotacoesNutricao')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={4}
            placeholder="Orientações nutricionais, dieta recomendada, suplementação..."
          />
        </div>

        {/* Seção 5: Treinos */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Treinos</h2>
          <p className="text-sm text-gray-600 mb-4">
            Selecione os treinos modelo que farão parte desta ficha
          </p>
          
          {treinosModelo.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>Nenhum treino modelo disponível.</p>
              <p className="text-sm mt-2">Crie treinos modelo primeiro em Treinos Modelo.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {treinosModelo.map((treino) => {
                const isSelected = treinosSelecionados.includes(treino._id);
                const exerciciosTotal = treino.partes.reduce((acc, parte) => acc + (parte.exercicios?.length || 0), 0);
                
                return (
                  <div
                    key={treino._id}
                    onClick={() => {
                      setTreinosSelecionados(prev => 
                        prev.includes(treino._id)
                          ? prev.filter(id => id !== treino._id)
                          : [...prev, treino._id]
                      );
                    }}
                    className={`cursor-pointer border-2 rounded-lg p-4 transition ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    style={isSelected ? { borderLeftWidth: '6px', borderLeftColor: treino.cor } : {}}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{treino.nome}</h3>
                        {treino.observacoes && (
                          <p className="text-xs text-gray-600 mt-1">{treino.observacoes}</p>
                        )}
                      </div>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600 mt-2">
                      <span>{treino.partes?.length || 0} parte(s)</span>
                      <span>•</span>
                      <span>{exerciciosTotal} exercício(s)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Erro geral */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Botões */}
        <div className="flex gap-4 justify-end sticky bottom-0 bg-white p-4 border-t shadow-lg rounded-lg">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            disabled={saving}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <LoadingSpinner />
                <span>Salvando...</span>
              </>
            ) : (
              <>
                <Save size={20} />
                <span>Criar Ficha</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
