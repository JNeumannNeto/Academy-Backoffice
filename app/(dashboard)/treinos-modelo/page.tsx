'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Edit, Copy, Trash2 } from 'lucide-react';
import api from '@/lib/api';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface TreinoModelo {
  _id: string;
  nome: string;
  descricao: string;
  cor: string;
  partes: any[];
  observacoes: string;
  objetivos: string[];
  ativo: boolean;
  createdAt: string;
}

export default function TreinosModeloPage() {
  const router = useRouter();
  const [treinos, setTreinos] = useState<TreinoModelo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    carregarTreinos();
  }, []);

  const carregarTreinos = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/api/treinos-modelo');
      
      if (data.sucesso) {
        setTreinos(data.dados);
      }
    } catch (err) {
      console.error('Erro ao carregar treinos:', err);
      setError('Erro ao carregar treinos modelo');
    } finally {
      setLoading(false);
    }
  };

  const handleDuplicar = async (treinoId: string) => {
    try {
      const { data } = await api.post(`/api/treinos-modelo/${treinoId}/duplicar`);
      if (data.sucesso) {
        carregarTreinos();
      }
    } catch (err) {
      alert('Erro ao duplicar treino');
    }
  };

  const handleDesativar = async (treinoId: string) => {
    if (!confirm('Deseja realmente desativar este treino modelo?')) return;

    try {
      await api.delete(`/api/treinos-modelo/${treinoId}`);
      carregarTreinos();
    } catch (err) {
      alert('Erro ao desativar treino');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Treinos Modelo</h1>
          <p className="text-gray-600 mt-1">
            Crie treinos reutilizáveis para montar fichas rapidamente
          </p>
        </div>
        <button
          onClick={() => router.push('/treinos-modelo/novo')}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} />
          Novo Treino
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Lista de Treinos */}
      {treinos.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
            <Copy size={32} className="text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Nenhum Treino Modelo
          </h3>
          <p className="text-gray-600 mb-4">
            Crie treinos modelo para reutilizar em várias fichas
          </p>
          <button
            onClick={() => router.push('/treinos-modelo/novo')}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <Plus size={20} />
            Criar Primeiro Treino
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {treinos.map((treino) => (
            <div
              key={treino._id}
              className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 border-l-4"
              style={{ borderLeftColor: treino.cor }}
            >
              {/* Nome e Descrição */}
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {treino.nome}
                </h3>
                {treino.descricao && (
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {treino.descricao}
                  </p>
                )}
              </div>

              {/* Estatísticas */}
              <div className="space-y-2 mb-4">
                <div className="text-sm text-gray-700">
                  💪 {treino.partes?.reduce((acc, p) => acc + (p.exercicios?.length || 0), 0)} exercício(s)
                </div>
                <div className="text-sm text-gray-700">
                  🎯 {treino.objetivos?.length || 0} objetivo(s)
                </div>
                {treino.partes && treino.partes.length > 0 && (
                  <div className="text-xs text-gray-600">
                    Partes: {treino.partes.map(p => p.nome).filter(Boolean).join(', ') || 'N/A'}
                  </div>
                )}
              </div>

              {/* Ações */}
              <div className="flex gap-2">
                <button
                  onClick={() => router.push(`/treinos-modelo/${treino._id}/editar`)}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 text-sm"
                >
                  <Edit size={16} />
                  Editar
                </button>
                <button
                  onClick={() => handleDuplicar(treino._id)}
                  className="flex items-center justify-center bg-gray-200 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-300"
                  title="Duplicar"
                >
                  <Copy size={16} />
                </button>
                <button
                  onClick={() => handleDesativar(treino._id)}
                  className="flex items-center justify-center bg-red-100 text-red-600 px-3 py-2 rounded-lg hover:bg-red-200"
                  title="Desativar"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
