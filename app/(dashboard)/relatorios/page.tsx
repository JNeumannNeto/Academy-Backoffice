'use client';

import { useState, useEffect } from 'react';
import { Users, FileText, Target, Dumbbell, AlertTriangle, TrendingUp, Calendar } from 'lucide-react';
import api from '@/lib/api';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Usuario, Ficha, Objetivo, Equipamento } from '@/types';
import { format, isPast, parseISO, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useRouter } from 'next/navigation';

interface Estatisticas {
  totalAlunos: number;
  totalProfessores: number;
  totalFichas: number;
  fichasAtivas: number;
  fichasVencidas: number;
  fichasVencendo: number;
  totalObjetivos: number;
  totalEquipamentos: number;
}

export default function RelatoriosPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Estatisticas>({
    totalAlunos: 0,
    totalProfessores: 0,
    totalFichas: 0,
    fichasAtivas: 0,
    fichasVencidas: 0,
    fichasVencendo: 0,
    totalObjetivos: 0,
    totalEquipamentos: 0
  });

  const [fichasVencendo, setFichasVencendo] = useState<Ficha[]>([]);
  const [fichasRecentes, setFichasRecentes] = useState<Ficha[]>([]);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);

 const [usuariosRes, fichasRes, objetivosRes, equipamentosRes] = await Promise.all([
    api.get('/api/usuarios'),
        api.get('/api/fichas'),
 api.get('/api/catalogo/objetivos'),
        api.get('/api/catalogo/equipamentos')
      ]);

 // Processar usuários
      if (usuariosRes.data.sucesso) {
    const usuarios: Usuario[] = usuariosRes.data.dados;
 const alunos = usuarios.filter(u => u.tipo === 'aluno' && u.ativo);
        const professores = usuarios.filter(u => u.tipo === 'professor' && u.ativo);

        setStats(prev => ({
          ...prev,
          totalAlunos: alunos.length,
          totalProfessores: professores.length
     }));
      }

      // Processar fichas
      if (fichasRes.data.sucesso) {
      const fichas: Ficha[] = fichasRes.data.fichas;
        
   const ativas = fichas.filter(f => f.ativa && !isPast(parseISO(f.dataValidade)));
   const vencidas = fichas.filter(f => f.vencida || isPast(parseISO(f.dataValidade)));
     
      // Fichas vencendo nos próximos 7 dias
        const vencendo = fichas.filter(f => {
          if (f.vencida || !f.ativa) return false;
          const dias = differenceInDays(parseISO(f.dataValidade), new Date());
          return dias >= 0 && dias <= 7;
        });

        // Fichas mais recentes (últimas 5)
        const recentes = [...fichas]
 .sort((a, b) => new Date(b.dataInicio).getTime() - new Date(a.dataInicio).getTime())
  .slice(0, 5);

        setStats(prev => ({
          ...prev,
          totalFichas: fichas.length,
          fichasAtivas: ativas.length,
          fichasVencidas: vencidas.length,
          fichasVencendo: vencendo.length
        }));

    setFichasVencendo(vencendo);
   setFichasRecentes(recentes);
      }

      // Processar objetivos
      if (objetivosRes.data.sucesso) {
 const objetivos: Objetivo[] = objetivosRes.data.objetivos;
        setStats(prev => ({
          ...prev,
          totalObjetivos: objetivos.filter(o => o.ativo).length
    }));
      }

   // Processar equipamentos
    if (equipamentosRes.data.sucesso) {
   const equipamentos: Equipamento[] = equipamentosRes.data.equipamentos;
        setStats(prev => ({
    ...prev,
          totalEquipamentos: equipamentos.filter(e => e.ativo).length
        }));
      }

  } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
);
  }

  const percentualAtivas = stats.totalFichas > 0 
    ? Math.round((stats.fichasAtivas / stats.totalFichas) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Relatórios e Estatísticas</h1>
        <p className="text-gray-600 mt-1">Visão geral do sistema</p>
      </div>

      {/* Cards de Estatísticas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
     {/* Total de Alunos */}
  <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
       <div>
  <p className="text-sm font-medium text-gray-600">Alunos Ativos</p>
     <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalAlunos}</p>
  </div>
     <div className="p-3 bg-blue-100 rounded-full">
       <Users size={24} className="text-blue-600" />
  </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-gray-600">
    <TrendingUp size={16} className="mr-1 text-green-600" />
<span>Usuários ativos no sistema</span>
          </div>
</div>

        {/* Total de Professores */}
    <div className="bg-white rounded-lg shadow p-6">
     <div className="flex items-center justify-between">
<div>
        <p className="text-sm font-medium text-gray-600">Professores</p>
   <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalProfessores}</p>
  </div>
   <div className="p-3 bg-green-100 rounded-full">
              <Users size={24} className="text-green-600" />
            </div>
   </div>
          <div className="mt-4 flex items-center text-sm text-gray-600">
            <span>Profissionais cadastrados</span>
          </div>
        </div>

        {/* Total de Fichas */}
  <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
     <div>
              <p className="text-sm font-medium text-gray-600">Total de Fichas</p>
      <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalFichas}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
  <FileText size={24} className="text-purple-600" />
  </div>
 </div>
  <div className="mt-4">
  <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Ativas</span>
   <span className="font-medium text-green-600">{stats.fichasAtivas}</span>
            </div>
  </div>
        </div>

        {/* Fichas Vencendo */}
        <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Vencendo em 7 dias</p>
      <p className="text-3xl font-bold text-gray-900 mt-2">{stats.fichasVencendo}</p>
          </div>
          <div className="p-3 bg-orange-100 rounded-full">
          <AlertTriangle size={24} className="text-orange-600" />
            </div>
          </div>
        <div className="mt-4 flex items-center text-sm text-orange-600">
     <Calendar size={16} className="mr-1" />
       <span>Requerem atenção</span>
   </div>
        </div>
 </div>

      {/* Gráfico de Status das Fichas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
     {/* Status das Fichas */}
     <div className="bg-white rounded-lg shadow p-6">
       <h2 className="text-lg font-semibold text-gray-900 mb-4">Status das Fichas</h2>
      
    <div className="space-y-4">
            <div>
 <div className="flex items-center justify-between mb-2">
           <span className="text-sm font-medium text-gray-700">Fichas Ativas</span>
       <span className="text-sm font-semibold text-green-600">{stats.fichasAtivas}</span>
          </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
    <div 
 className="bg-green-500 h-3 rounded-full transition-all duration-500"
         style={{ width: `${percentualAtivas}%` }}
      />
          </div>
   <p className="text-xs text-gray-500 mt-1">{percentualAtivas}% do total</p>
    </div>

            <div>
       <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Fichas Vencidas</span>
      <span className="text-sm font-semibold text-red-600">{stats.fichasVencidas}</span>
       </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
     className="bg-red-500 h-3 rounded-full transition-all duration-500"
style={{ width: `${stats.totalFichas > 0 ? (stats.fichasVencidas / stats.totalFichas) * 100 : 0}%` }}
/>
   </div>
            </div>

     <div>
          <div className="flex items-center justify-between mb-2">
       <span className="text-sm font-medium text-gray-700">Vencendo (7 dias)</span>
        <span className="text-sm font-semibold text-orange-600">{stats.fichasVencendo}</span>
              </div>
     <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
        className="bg-orange-500 h-3 rounded-full transition-all duration-500"
    style={{ width: `${stats.totalFichas > 0 ? (stats.fichasVencendo / stats.totalFichas) * 100 : 0}%` }}
           />
       </div>
            </div>
    </div>
      </div>

        {/* Catálogo */}
        <div className="bg-white rounded-lg shadow p-6">
    <h2 className="text-lg font-semibold text-gray-900 mb-4">Catálogo</h2>
          
 <div className="space-y-6">
     <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
      <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
             <Target size={20} className="text-blue-600" />
                </div>
          <div>
     <p className="font-medium text-gray-900">Objetivos</p>
                <p className="text-sm text-gray-600">Cadastrados no sistema</p>
                </div>
              </div>
      <span className="text-2xl font-bold text-blue-600">{stats.totalObjetivos}</span>
            </div>

       <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
    <div className="flex items-center gap-3">
     <div className="p-2 bg-purple-100 rounded-lg">
             <Dumbbell size={20} className="text-purple-600" />
          </div>
             <div>
        <p className="font-medium text-gray-900">Equipamentos</p>
    <p className="text-sm text-gray-600">Disponíveis para uso</p>
      </div>
</div>
   <span className="text-2xl font-bold text-purple-600">{stats.totalEquipamentos}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Fichas Vencendo */}
      {fichasVencendo.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
   <div className="flex items-center justify-between mb-4">
    <h2 className="text-lg font-semibold text-gray-900">Fichas Vencendo nos Próximos 7 Dias</h2>
    <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
  {fichasVencendo.length} fichas
  </span>
  </div>

     <div className="space-y-3">
         {fichasVencendo.map(ficha => {
              const diasRestantes = differenceInDays(parseISO(ficha.dataValidade), new Date());
       return (
  <div 
           key={ficha._id}
        className="flex items-center justify-between p-4 border border-orange-200 rounded-lg hover:bg-orange-50 transition cursor-pointer"
       onClick={() => router.push(`/fichas/${ficha._id}`)}
           >
     <div className="flex-1">
                    <p className="font-medium text-gray-900">{ficha.aluno.nome}</p>
                 <p className="text-sm text-gray-600">
           Código: #{ficha.aluno.codigoAluno}  Prof: {ficha.professorReferencia.nome}
             </p>
      </div>
 <div className="text-right">
            <p className="text-sm font-medium text-orange-600">
         {diasRestantes === 0 ? 'Vence hoje' : `${diasRestantes} dia(s)`}
   </p>
    <p className="text-xs text-gray-500">
   {format(parseISO(ficha.dataValidade), 'dd/MM/yyyy', { locale: ptBR })}
         </p>
        </div>
   </div>
    );
  })}
          </div>
        </div>
      )}

 {/* Fichas Recentes */}
      <div className="bg-white rounded-lg shadow p-6">
<h2 className="text-lg font-semibold text-gray-900 mb-4">Fichas Criadas Recentemente</h2>
        
        {fichasRecentes.length === 0 ? (
   <p className="text-center text-gray-500 py-8">Nenhuma ficha cadastrada ainda</p>
    ) : (
    <div className="space-y-3">
            {fichasRecentes.map(ficha => (
      <div 
    key={ficha._id}
     className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition cursor-pointer"
     onClick={() => router.push(`/fichas/${ficha._id}`)}
        >
     <div className="flex-1">
             <p className="font-medium text-gray-900">{ficha.aluno.nome}</p>
      <p className="text-sm text-gray-600">
      Prof: {ficha.professorReferencia.nome}  {ficha.treinos.length} treino(s)
   </p>
          </div>
<div className="text-right">
        <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${
           ficha.ativa ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
  }`}>
   {ficha.ativa ? 'Ativa' : 'Inativa'}
             </span>
    <p className="text-xs text-gray-500 mt-1">
          {format(parseISO(ficha.dataInicio), 'dd/MM/yyyy', { locale: ptBR })}
      </p>
            </div>
   </div>
    ))}
       </div>
        )}
      </div>

      {/* Resumo Geral */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow p-6 text-white">
        <h2 className="text-xl font-semibold mb-4">Resumo Geral do Sistema</h2>
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
 <p className="text-3xl font-bold">{stats.totalAlunos + stats.totalProfessores}</p>
 <p className="text-sm opacity-90">Usuários Totais</p>
   </div>
 <div className="text-center">
            <p className="text-3xl font-bold">{stats.totalFichas}</p>
      <p className="text-sm opacity-90">Fichas Criadas</p>
          </div>
   <div className="text-center">
        <p className="text-3xl font-bold">{stats.totalObjetivos}</p>
          <p className="text-sm opacity-90">Objetivos</p>
          </div>
  <div className="text-center">
       <p className="text-3xl font-bold">{stats.totalEquipamentos}</p>
    <p className="text-sm opacity-90">Equipamentos</p>
     </div>
      </div>
      </div>
    </div>
  );
}
