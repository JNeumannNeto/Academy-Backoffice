'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Plus, Eye, Edit, Calendar, User, AlertCircle, Trash2 } from 'lucide-react';
import api from '@/lib/api';
import { Ficha } from '@/types';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useAuthStore } from '@/lib/store';
import { format, isPast, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function FichasPage() {
  const router = useRouter();
  const { usuario } = useAuthStore();
  const [fichas, setFichas] = useState<Ficha[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<'todas' | 'ativas' | 'vencidas'>('todas');
  const [excluindo, setExcluindo] = useState<string | null>(null);

  useEffect(() => {
    carregarFichas();
  }, []);

  const carregarFichas = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/api/fichas');
      if (data.sucesso) {
        // A API retorna 'dados' e não 'fichas'
        setFichas(data.dados || []);
      } else {
        setFichas([]);
      }
    } catch (error) {
      console.error('Erro ao carregar fichas:', error);
      setFichas([]);
    } finally {
      setLoading(false);
    }
  };

  const excluirFicha = async (fichaId: string, alunoNome: string) => {
    if (!confirm(`Tem certeza que deseja excluir a ficha de ${alunoNome}? Esta ação não pode ser desfeita.`)) {
      return;
    }

    try {
      setExcluindo(fichaId);
      const { data } = await api.delete(`/api/fichas/${fichaId}`);
      if (data.sucesso) {
        // Recarregar lista
        await carregarFichas();
      }
    } catch (error: any) {
      console.error('Erro ao excluir ficha:', error);
      alert(error.response?.data?.mensagem || 'Erro ao excluir ficha');
    } finally {
      setExcluindo(null);
    }
  };

  // Garante que fichas sempre seja um array
  const fichasArray = Array.isArray(fichas) ? fichas : [];

  const fichasFiltradas = fichasArray
    .filter(f => {
      const matchSearch = 
        f.aluno.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(f.aluno.codigoAluno).includes(searchTerm);
      
   const matchStatus = 
        filtroStatus === 'todas' ? true :
        filtroStatus === 'ativas' ? f.ativa && !isPast(parseISO(f.dataValidade)) :
        f.vencida || isPast(parseISO(f.dataValidade));

      return matchSearch && matchStatus;
    });

  const podeAdicionar = usuario?.tipo === 'administrador' || usuario?.tipo === 'professor';

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
 </div>
    );
  }

  return (
    <div className="space-y-6">
   {/* Header */}
      <div className="flex items-center justify-between">
  <div>
   <h1 className="text-3xl font-bold text-gray-900">Fichas de Treino</h1>
 <p className="text-gray-600 mt-1">Gerencie as fichas dos alunos</p>
  </div>

        {podeAdicionar && (
 <button
     onClick={() => router.push('/fichas/novo')}
  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Plus size={20} />
   <span>Nova Ficha</span>
          </button>
        )}
   </div>

      {/* Filtros */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Busca */}
 <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
       <input
  type="text"
   placeholder="Buscar por nome ou código do aluno..."
        value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    />
  </div>

        {/* Filtro de Status */}
        <div className="flex gap-2">
<button
            onClick={() => setFiltroStatus('todas')}
            className={`px-4 py-2 rounded-lg transition ${
      filtroStatus === 'todas'
              ? 'bg-blue-600 text-white'
          : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
         }`}
          >
        Todas ({fichasArray.length})
          </button>
          <button
     onClick={() => setFiltroStatus('ativas')}
            className={`px-4 py-2 rounded-lg transition ${
 filtroStatus === 'ativas'
      ? 'bg-green-600 text-white'
       : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
   }`}
     >
            Ativas ({fichasArray.filter(f => f.ativa && !isPast(parseISO(f.dataValidade))).length})
          </button>
          <button
 onClick={() => setFiltroStatus('vencidas')}
            className={`px-4 py-2 rounded-lg transition ${
        filtroStatus === 'vencidas'
    ? 'bg-red-600 text-white'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
        >
        Vencidas ({fichasArray.filter(f => f.vencida || isPast(parseISO(f.dataValidade))).length})
      </button>
 </div>
      </div>

      {/* Grid de Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
     {fichasFiltradas.map((ficha) => {
          const isVencida = isPast(parseISO(ficha.dataValidade));
    const diasRestantes = Math.ceil((new Date(ficha.dataValidade).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

return (
       <div
        key={ficha._id}
  className={`bg-white rounded-lg shadow hover:shadow-lg transition p-6 border-l-4 ${
    isVencida ? 'border-red-500' : ficha.ativa ? 'border-green-500' : 'border-gray-300'
      }`}
    >
   {/* Header do Card */}
 <div className="flex items-start justify-between mb-4">
    <div className="flex-1">
       <h3 className="font-semibold text-lg text-gray-900">
{ficha.aluno.nome}
 </h3>
           <p className="text-sm text-gray-600">
           Código: #{ficha.aluno.codigoAluno}
           </p>
       </div>
 <span
 className={`px-3 py-1 text-xs font-medium rounded-full ${
           isVencida
        ? 'bg-red-100 text-red-800'
          : ficha.ativa
  ? 'bg-green-100 text-green-800'
        : 'bg-gray-100 text-gray-800'
          }`}
 >
          {isVencida ? 'Vencida' : ficha.ativa ? 'Ativa' : 'Inativa'}
    </span>
          </div>

              {/* Informações */}
              <div className="space-y-3 mb-4">
             <div className="flex items-center gap-2 text-sm text-gray-600">
              <User size={16} />
    <span>Prof: {ficha.professorReferencia.nome}</span>
     </div>

    <div className="flex items-center gap-2 text-sm text-gray-600">
   <Calendar size={16} />
           <span>
      Validade: {format(parseISO(ficha.dataValidade), 'dd/MM/yyyy', { locale: ptBR })}
       </span>
        </div>

           {!isVencida && diasRestantes <= 7 && diasRestantes > 0 && (
           <div className="flex items-center gap-2 text-sm text-orange-600">
            <AlertCircle size={16} />
   <span>Vence em {diasRestantes} dia(s)</span>
          </div>
          )}

              <div className="pt-2 border-t">
           <p className="text-sm text-gray-600">
    {ficha.treinos.length} treino(s)  {ficha.objetivos.length} objetivo(s)
  </p>
         </div>
              </div>

    {/* Ações */}
       <div className="flex gap-2">
     <button
      onClick={() => router.push(`/fichas/${ficha._id}`)}
  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
   >
          <Eye size={16} />
       <span>Ver</span>
                </button>
                {podeAdicionar && (
                  <>
                    <button
                      onClick={() => router.push(`/fichas/${ficha._id}/editar`)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                      <Edit size={16} />
                      <span>Editar</span>
                    </button>
                    <button
                      onClick={() => excluirFicha(ficha._id, ficha.aluno.nome)}
                      disabled={excluindo === ficha._id}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:bg-gray-400"
                    >
                      <Trash2 size={16} />
                    </button>
                  </>
       )}
   </div>
    </div>
    );
        })}
      </div>

      {fichasFiltradas.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
   <p className="text-gray-500 mb-4">
            {searchTerm || filtroStatus !== 'todas'
       ? 'Nenhuma ficha encontrada com os filtros aplicados'
         : 'Nenhuma ficha cadastrada ainda'}
          </p>
    {podeAdicionar && !searchTerm && filtroStatus === 'todas' && (
     <button
      onClick={() => router.push('/fichas/novo')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
   <Plus size={20} />
   <span>Criar Primeira Ficha</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
