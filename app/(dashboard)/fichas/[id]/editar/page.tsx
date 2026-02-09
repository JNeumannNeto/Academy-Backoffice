'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import api from '@/lib/api';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { DateInput } from '@/components/DateInput';
import { AnamneseForm } from '@/components/AnamneseForm';
import { MultiSelect } from '@/components/MultiSelect';
import { TreinoBuilder } from '@/components/TreinoBuilder';
import { Usuario, Objetivo, Equipamento, Treino, Ficha } from '@/types';

interface FichaForm {
  alunoId: string;
  professorReferenciaId: string;
  dataInicio: string;
  dataValidade: string;
  anotacoesNutricao: string;
}

export default function EditarFichaPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Dados originais
  const [fichaOriginal, setFichaOriginal] = useState<Ficha | null>(null);

  // Dados para selects
  const [alunos, setAlunos] = useState<Usuario[]>([]);
  const [professores, setProfessores] = useState<Usuario[]>([]);
  const [objetivos, setObjetivos] = useState<Objetivo[]>([]);
  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([]);

  // Estados complexos
  const [anamnese, setAnamnese] = useState<{
 remedios?: string;
    problemasSaude?: string;
    doencas?: string;
    cirurgias?: string;
    condicoes: {
 diabetes: boolean;
 hipertensao: boolean;
  doencaCardiaca: boolean;
      hipoglicemia: boolean;
  alergia: boolean;
      descricaoAlergia?: string;
      outras?: string[];
    };
  }>({
    remedios: '',
    problemasSaude: '',
    doencas: '',
 cirurgias: '',
    condicoes: {
      diabetes: false,
      hipertensao: false,
      doencaCardiaca: false,
      hipoglicemia: false,
   alergia: false,
      descricaoAlergia: '',
      outras: []
    }
  });

  const [objetivosSelecionados, setObjetivosSelecionados] = useState<string[]>([]);
  const [treinos, setTreinos] = useState<Treino[]>([]);

  const { register, handleSubmit, reset, watch, control, formState: { errors } } = useForm<FichaForm>();

  const alunoSelecionado = watch('alunoId');

  useEffect(() => {
carregarDados();
  }, [id]);

  const carregarDados = async () => {
try {
      setLoading(true);

      const [fichaRes, usuariosRes, objetivosRes, equipamentosRes] = await Promise.all([
        api.get(`/api/fichas/${id}`),
        api.get('/api/usuarios'),
 api.get('/api/catalogo/objetivos'),
        api.get('/api/catalogo/equipamentos')
      ]);

      // Ficha
      if (fichaRes.data.sucesso) {
        const ficha = fichaRes.data.dados;
        setFichaOriginal(ficha);

        console.log('📥 Ficha carregada:', ficha);

        // Preencher formulário
        reset({
          alunoId: ficha.aluno._id,
          professorReferenciaId: ficha.professorReferencia._id,
          dataInicio: ficha.dataInicio.split('T')[0],
          dataValidade: ficha.dataValidade.split('T')[0],
          anotacoesNutricao: ficha.anotacoesNutricao || ''
        });

        // Anamnese
        setAnamnese(ficha.anamnese);

        // Objetivos
        setObjetivosSelecionados(ficha.objetivos);

        // Normalizar treinos: converter objetivo e equipamento para IDs
        const treinosNormalizados = ficha.treinos?.map((treino: any) => ({
          _id: treino._id,
          cor: treino.cor,
          nome: treino.nome,
          partes: treino.partes?.map((parte: any) => ({
            nome: parte.nome,
            exercicios: parte.exercicios?.map((ex: any) => ({
              objetivo: typeof ex.objetivo === 'string' ? ex.objetivo : ex.objetivo?._id || '',
              equipamento: typeof ex.equipamento === 'string' ? ex.equipamento : ex.equipamento?._id || '',
              tipo: ex.tipo || 'series',
              series: ex.series || [],
              repeticoes: ex.repeticoes || [],
              tempoSegundos: ex.tempoSegundos,
              detalhes: ex.detalhes || '',
              ordem: ex.ordem
            })) || [],
            exerciciosJuntos: parte.exerciciosJuntos
          })) || [],
          observacoes: treino.observacoes || ''
        })) || [];

        setTreinos(treinosNormalizados);
      }

      // Usuários
      if (usuariosRes.data.sucesso) {
        const usuarios = usuariosRes.data.dados;
        setAlunos(usuarios.filter((u: Usuario) => u.tipo === 'aluno' && u.ativo));
        setProfessores(usuarios.filter((u: Usuario) => u.tipo === 'professor' && u.ativo));
      }

      // Objetivos
      if (objetivosRes.data.sucesso) {
        setObjetivos(objetivosRes.data.dados.filter((o: Objetivo) => o.ativo));
      }

      // Equipamentos
      if (equipamentosRes.data.sucesso) {
        setEquipamentos(equipamentosRes.data.dados.filter((e: Equipamento) => e.ativo));
      }
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError('Erro ao carregar dados da ficha');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: FichaForm) => {
    setError('');

    // Validações
    if (objetivosSelecionados.length === 0) {
      setError('Selecione pelo menos um objetivo');
    return;
    }

    if (treinos.length === 0) {
      setError('Adicione pelo menos um treino');
      return;
    }

    // Validar treinos
const treinoSemExercicios = treinos.some(t => 
      t.partes.every(p => p.exercicios.length === 0)
    );

    if (treinoSemExercicios) {
      setError('Todos os treinos devem ter pelo menos um exercício');
    return;
    }

    const exercicioIncompleto = treinos.some(t =>
      t.partes.some(p =>
        p.exercicios.some(e => !e.objetivo || !e.equipamento)
      )
    );

    if (exercicioIncompleto) {
      setError('Todos os exercícios devem ter objetivo e equipamento selecionados');
      return;
  }

    setSaving(true);

    try {
      const payload = {
        aluno: data.alunoId,
  professorReferencia: data.professorReferenciaId,
        dataInicio: data.dataInicio,
        dataValidade: data.dataValidade,
     anamnese,
objetivos: objetivosSelecionados,
    anotacoesNutricao: data.anotacoesNutricao || '',
     treinos
      };

      const response = await api.patch(`/api/fichas/${id}`, payload);

      if (response.data.sucesso) {
   router.push('/fichas');
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { mensagem?: string } } };
      setError(error.response?.data?.mensagem || 'Erro ao atualizar ficha');
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

  if (!fichaOriginal) {
    return (
      <div className="text-center py-12">
  <p className="text-gray-600">Ficha não encontrada</p>
  <button
          onClick={() => router.push('/fichas')}
    className="mt-4 text-blue-600 hover:underline"
        >
          Voltar para fichas
        </button>
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
        <h1 className="text-3xl font-bold text-gray-900">Editar Ficha de Treino</h1>
       <p className="text-gray-600 mt-1">{fichaOriginal.aluno.nome}</p>
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
                  value={field.value || ''}
                  onChange={field.onChange}
                  name="dataInicio"
                  error={errors.dataInicio?.message}
                  required
                />
              )}
            />

            {/* Data Validade */}
            <Controller
              name="dataValidade"
              control={control}
              rules={{ required: 'Data de validade é obrigatória' }}
              render={({ field }) => (
                <DateInput
                  label="Data de Validade"
                  value={field.value || ''}
                  onChange={field.onChange}
                  name="dataValidade"
                  error={errors.dataValidade?.message}
                  required
                />
              )}
            />
  </div>
 </div>

        {/* Seção 2: Anamnese */}
        <div className="bg-white rounded-lg shadow p-6">
    <AnamneseForm 
            value={anamnese} 
onChange={setAnamnese} 
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
          <TreinoBuilder
      treinos={treinos}
    onChange={setTreinos}
  objetivos={objetivos}
       equipamentos={equipamentos}
          />
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
   <span>Salvar Alterações</span>
      </>
     )}
          </button>
   </div>
      </form>
    </div>
  );
}
