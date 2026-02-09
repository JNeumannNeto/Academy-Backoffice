'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import { useForm } from 'react-hook-form';
import api from '@/lib/api';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { TreinoBuilder } from '@/components/TreinoBuilder';
import { MultiSelect } from '@/components/MultiSelect';
import { Objetivo, Equipamento, Treino } from '@/types';

interface TreinoModeloForm {
  nome: string;
  descricao: string;
}

export default function EditarTreinoModeloPage() {
  const router = useRouter();
  const params = useParams();
  const treinoId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  
  const [objetivos, setObjetivos] = useState<Objetivo[]>([]);
  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([]);
  const [objetivosSelecionados, setObjetivosSelecionados] = useState<string[]>([]);
  const [treinos, setTreinos] = useState<Treino[]>([{
    partes: [],
    observacoes: ''
  }]);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<TreinoModeloForm>();

  useEffect(() => {
    carregarDados();
  }, [treinoId]);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const [objetivosRes, equipamentosRes, treinoRes] = await Promise.all([
        api.get('/api/catalogo/objetivos'),
        api.get('/api/catalogo/equipamentos'),
        api.get(`/api/treinos-modelo/${treinoId}`)
      ]);

      if (objetivosRes.data.sucesso) {
        setObjetivos(objetivosRes.data.dados.filter((o: Objetivo) => o.ativo));
      }

      if (equipamentosRes.data.sucesso) {
        setEquipamentos(equipamentosRes.data.dados.filter((e: Equipamento) => e.ativo));
      }

      if (treinoRes.data.sucesso) {
        const treino = treinoRes.data.dados;
        
        // Preencher formulário
        setValue('nome', treino.nome);
        setValue('descricao', treino.descricao || '');
        
        // Objetivos selecionados - extrair IDs
        const objetivoIds = treino.objetivos?.map((obj: any) => 
          typeof obj === 'string' ? obj : obj._id
        ) || [];
        setObjetivosSelecionados(objetivoIds);

        // Preparar treino para o builder
        setTreinos([{
          partes: treino.partes || [],
          observacoes: treino.observacoes || ''
        }]);
      }
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError('Erro ao carregar dados. Verifique se o ID é válido.');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: TreinoModeloForm) => {
    setError('');

    // Validações
    if (!data.nome) {
      setError('Informe um nome para o treino');
      return;
    }

    if (objetivosSelecionados.length === 0) {
      setError('Selecione pelo menos um objetivo');
      return;
    }

    if (treinos.length === 0 || treinos.every(t => t.partes.every(p => p.exercicios.length === 0))) {
      setError('Adicione pelo menos um exercício ao treino');
      return;
    }

    // Validar se todos os exercícios têm objetivo e equipamento
    const exercicioIncompleto = treinos.some(t =>
      t.partes.some(p => p.exercicios.some(e => !e.objetivo || !e.equipamento))
    );

    if (exercicioIncompleto) {
      setError('Todos os exercícios devem ter objetivo e equipamento selecionados');
      return;
    }

    setSaving(true);

    try {
      const treino = treinos[0]; // Treino modelo tem apenas 1 treino
      
      const payload = {
        nome: data.nome,
        descricao: data.descricao || '',
        partes: treino.partes,
        observacoes: treino.observacoes || '',
        objetivos: objetivosSelecionados
      };

      const response = await api.put(`/api/treinos-modelo/${treinoId}`, payload);

      if (response.data.sucesso) {
        router.push('/treinos-modelo');
      }
    } catch (err: any) {
      const mensagem = err.response?.data?.mensagem || 'Erro ao atualizar treino modelo';
      setError(mensagem);
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

  if (error && !treinos[0]?.partes) {
    return (
      <div className="p-8">
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
        <button
          onClick={() => router.push('/treinos-modelo')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={20} />
          Voltar para Treinos Modelo
        </button>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft size={20} />
          Voltar
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Editar Treino Modelo</h1>
          <p className="text-gray-600 mt-1">Altere as informações do treino</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Informações Básicas */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Informações do Treino</h2>
          
          <div className="space-y-4">
            {/* Nome */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome do Treino *
              </label>
              <input
                type="text"
                {...register('nome', { required: true })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: Treino A - Peito e Tríceps"
              />
              {errors.nome && (
                <p className="mt-1 text-sm text-red-600">Nome é obrigatório</p>
              )}
            </div>

            {/* Descrição */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição (opcional)
              </label>
              <textarea
                {...register('descricao')}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Breve descrição do treino..."
              />
            </div>

            {/* Objetivos */}
            <MultiSelect
              options={objetivos.map(obj => ({ value: obj._id, label: obj.nome }))}
              value={objetivosSelecionados}
              onChange={setObjetivosSelecionados}
              placeholder="Selecione os objetivos..."
              label="Objetivos *"
            />
          </div>
        </div>

        {/* Treino Builder */}
        <TreinoBuilder
          treinos={treinos}
          onChange={setTreinos}
          objetivos={objetivos}
          equipamentos={equipamentos}
        />

        {/* Botões */}
        <div className="flex gap-4 justify-end">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300"
          >
            {saving ? <LoadingSpinner /> : <Save size={20} />}
            {saving ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </form>
    </div>
  );
}
