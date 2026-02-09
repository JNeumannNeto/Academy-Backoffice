'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Edit, Calendar, User, Target, Trash2, Dumbbell } from 'lucide-react';
import api from '@/lib/api';
import { Ficha } from '@/types';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useAuthStore } from '@/lib/store';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function VisualizarFichaPage() {
const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const { usuario } = useAuthStore();

  const [ficha, setFicha] = useState<Ficha | null>(null);
  const [loading, setLoading] = useState(true);
  const [excluindo, setExcluindo] = useState(false);

  useEffect(() => {
    carregarFicha();
  }, [id]);

  const carregarFicha = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/api/fichas/${id}`);
      if (data.sucesso) {
        setFicha(data.dados);
      }
    } catch (error) {
      console.error('Erro ao carregar ficha:', error);
    } finally {
      setLoading(false);
    }
  };

  const excluirFicha = async () => {
    if (!confirm('Tem certeza que deseja excluir esta ficha? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      setExcluindo(true);
      const { data } = await api.delete(`/api/fichas/${id}`);
      if (data.sucesso) {
        router.push('/fichas');
      }
    } catch (error: any) {
      console.error('Erro ao excluir ficha:', error);
      alert(error.response?.data?.mensagem || 'Erro ao excluir ficha');
    } finally {
      setExcluindo(false);
    }
  };

  const podeEditar = usuario?.tipo === 'administrador' || usuario?.tipo === 'professor';

  if (loading) {
  return (
   <div className="flex items-center justify-center min-h-[400px]">
  <LoadingSpinner />
      </div>
    );
  }

  if (!ficha) {
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

  return (
    <div className="max-w-5xl mx-auto space-y-6">
   {/* Header */}
   <div className="flex items-center justify-between">
 <div className="flex items-center gap-4">
   <button
        onClick={() => router.back()}
  className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft size={20} />
          </button>
   <div>
            <h1 className="text-3xl font-bold text-gray-900">{ficha.aluno.nome}</h1>
   <p className="text-gray-600 mt-1">Código: #{ficha.aluno.codigoAluno}</p>
     </div>
  </div>

   {podeEditar && (
        <div className="flex gap-2">
          <button
            onClick={() => router.push(`/fichas/${id}/editar`)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Edit size={20} />
            <span>Editar Ficha</span>
          </button>
          <button
            onClick={excluirFicha}
            disabled={excluindo}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:bg-gray-400"
          >
            <Trash2 size={20} />
            <span>{excluindo ? 'Excluindo...' : 'Excluir'}</span>
          </button>
        </div>
      )}
 </div>

      {/* Status e Informações Gerais */}
      <div className="bg-white rounded-lg shadow p-6">
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  <div>
  <div className="flex items-center gap-2 text-gray-600 mb-2">
     <User size={20} />
       <span className="font-medium">Professor</span>
          </div>
         <p className="text-gray-900">{ficha.professorReferencia.nome}</p>
   </div>

    <div>
            <div className="flex items-center gap-2 text-gray-600 mb-2">
         <Calendar size={20} />
   <span className="font-medium">Período</span>
    </div>
  <p className="text-gray-900">
   {format(parseISO(ficha.dataInicio), 'dd/MM/yyyy', { locale: ptBR })} até{' '}
      {format(parseISO(ficha.dataValidade), 'dd/MM/yyyy', { locale: ptBR })}
 </p>
          </div>

   <div>
       <div className="flex items-center gap-2 text-gray-600 mb-2">
              <Target size={20} />
    <span className="font-medium">Status</span>
   </div>
       <span
       className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${
          ficha.vencida ? 'bg-red-100 text-red-800' :
       ficha.ativa ? 'bg-green-100 text-green-800' :
  'bg-gray-100 text-gray-800'
   }`}
       >
  {ficha.vencida ? 'Vencida' : ficha.ativa ? 'Ativa' : 'Inativa'}
          </span>
   </div>
  </div>
      </div>

  {/* Anamnese */}
   <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Anamnese</h2>
     
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
       {ficha.anamnese.remedios && (
     <div>
       <h3 className="font-medium text-gray-700 mb-2">Remédios</h3>
       <p className="text-gray-600">{ficha.anamnese.remedios}</p>
    </div>
   )}

   {ficha.anamnese.problemasSaude && (
            <div>
       <h3 className="font-medium text-gray-700 mb-2">Problemas de Saúde</h3>
   <p className="text-gray-600">{ficha.anamnese.problemasSaude}</p>
       </div>
     )}

      {ficha.anamnese.doencas && (
          <div>
      <h3 className="font-medium text-gray-700 mb-2">Doenças</h3>
       <p className="text-gray-600">{ficha.anamnese.doencas}</p>
    </div>
    )}

          {ficha.anamnese.cirurgias && (
         <div>
    <h3 className="font-medium text-gray-700 mb-2">Cirurgias</h3>
       <p className="text-gray-600">{ficha.anamnese.cirurgias}</p>
       </div>
    )}
  </div>

        {/* Condições */}
  <div className="mt-4 pt-4 border-t">
  <h3 className="font-medium text-gray-700 mb-3">Condições de Saúde</h3>
          <div className="flex flex-wrap gap-2">
 {ficha.anamnese.condicoes.diabetes && (
       <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">Diabetes</span>
       )}
            {ficha.anamnese.condicoes.hipertensao && (
       <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">Hipertensão</span>
            )}
     {ficha.anamnese.condicoes.doencaCardiaca && (
   <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">Doença Cardíaca</span>
 )}
{ficha.anamnese.condicoes.hipoglicemia && (
       <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">Hipoglicemia</span>
     )}
    {ficha.anamnese.condicoes.alergia && (
   <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
     Alergia {ficha.anamnese.condicoes.descricaoAlergia && `(${ficha.anamnese.condicoes.descricaoAlergia})`}
     </span>
   )}
     </div>
   </div>
      </div>

      {/* Objetivos */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Objetivos</h2>
        <div className="flex flex-wrap gap-2">
   {ficha.objetivos.map((obj, index) => (
     <span key={index} className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg">
    {obj}
  </span>
          ))}
        </div>
 </div>

      {/* Nutrição */}
      {ficha.anotacoesNutricao && (
   <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Anotações de Nutrição</h2>
   <p className="text-gray-600 whitespace-pre-wrap">{ficha.anotacoesNutricao}</p>
  </div>
      )}

      {/* Treinos */}
   <div className="space-y-4">
      <h2 className="text-2xl font-semibold text-gray-900">Treinos</h2>
      
   {ficha.treinos.map((treino, index) => (
   <div key={index} className="bg-white rounded-lg shadow p-6">
       <div className="flex items-center gap-3 mb-4">
 <div
        className="w-8 h-8 rounded-full"
     style={{ backgroundColor: treino.cor }}
       />
       <h3 className="text-lg font-semibold text-gray-900">
      Treino {String.fromCharCode(65 + index)}
       </h3>
    </div>

 {treino.partes.map((parte, pIndex) => (
       <div key={pIndex} className="mb-6 last:mb-0">
      {parte.nome && (
     <h4 className="font-medium text-gray-700 mb-3">{parte.nome}</h4>
    )}

       <div className="space-y-3">
   {parte.exercicios.map((exercicio, eIndex) => (
         <div key={eIndex} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
  <Dumbbell size={20} className="text-gray-400 mt-1" />
         <div className="flex-1">
      <p className="font-medium text-gray-900">{exercicio.objetivo}</p>
      <p className="text-sm text-gray-600">{exercicio.equipamento}</p>
         <div className="flex gap-4 mt-2 text-sm text-gray-600">
           <span>Séries: {exercicio.series.join(', ')}</span>
        <span>Repetições: {exercicio.repeticoes.join(', ')}</span>
     </div>
           {exercicio.detalhes && (
      <p className="text-sm text-gray-500 mt-2">{exercicio.detalhes}</p>
       )}
          </div>
       </div>
        ))}
     </div>
       </div>
         ))}

          {treino.observacoes && (
    <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-gray-600">
  <span className="font-medium">Observações:</span> {treino.observacoes}
   </p>
   </div>
            )}
          </div>
     ))}
      </div>
    </div>
  );
}
