'use client';

import { useAuthStore } from '@/lib/store';
import { Users, FileText, Activity, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { usuario } = useAuthStore();

  const stats = [
    { label: 'Total de Alunos', value: '156', icon: Users, color: 'bg-blue-500' },
    { label: 'Fichas Ativas', value: '142', icon: FileText, color: 'bg-green-500' },
    { label: 'Treinos Hoje', value: '48', icon: Activity, color: 'bg-purple-500' },
    { label: 'Taxa de Frequência', value: '87%', icon: TrendingUp, color: 'bg-orange-500' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Bem-vindo{usuario?.nome ? `, ${usuario.nome}` : ''}!
        </h1>
        <p className="text-gray-600 mt-1">
    Aqui está um resumo das atividades de hoje
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
       return (
      <div key={stat.label} className="bg-white rounded-lg shadow p-6">
         <div className="flex items-center justify-between">
        <div>
      <p className="text-sm text-gray-600">{stat.label}</p>
      <p className="text-3xl font-bold text-gray-900 mt-1">
       {stat.value}
     </p>
  </div>
       <div className={`${stat.color} p-3 rounded-lg`}>
       <Icon className="text-white" size={24} />
      </div>
      </div>
      </div>
    );
})}
      </div>

<div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Ações Rápidas
        </h2>
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
href="/usuarios/novo"
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition text-center"
    >
            <Users className="mx-auto mb-2" size={32} />
   <p className="font-medium">Criar Usuário</p>
       </Link>
        <Link
          href="/fichas/novo"
   className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition text-center"
          >
      <FileText className="mx-auto mb-2" size={32} />
        <p className="font-medium">Nova Ficha</p>
       </Link>
          <Link
   href="/relatorios"
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition text-center"
       >
            <Activity className="mx-auto mb-2" size={32} />
      <p className="font-medium">Ver Relatórios</p>
  </Link>
        </div>
      </div>
  </div>
  );
}
