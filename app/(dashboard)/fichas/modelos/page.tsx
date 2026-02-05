'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Users, Copy, Trash2 } from 'lucide-react';
import api from '@/lib/api';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface FichaModelo {
  _id: string;
  nomeModelo: string;
  professorReferencia: {
    nome: string;
  };
  alunosAtribuidos: Array<{
    aluno: {
      _id: string;
      nome: string;
      codigoAluno: number;
    };
    dataAtribuicao: string;
  }>;
  treinos: any[];
  objetivos: string[];
  dataValidade: string;
  createdAt: string;
}

export default function FichasModeloPage() {
  const router = useRouter();
  const [fichas, setFichas] = useState<FichaModelo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    carregarFichas();
  }, []);

  const carregarFichas = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/api/fichas/modelos');
      
      if (data.sucesso) {
        setFichas(data.dados);
      }
    } catch (err) {
      console.error('Erro ao carregar fichas modelo:', err);
      setError('Erro ao carregar fichas modelo');
    } finally {
      setLoading(false);
    }
  };

  const handleAtribuir = (fichaId: string) => {
    router.push(`/fichas/modelos/${fichaId}/atribuir`);
  };

  const handleDuplicar = async (fichaId: string) => {
    // TODO: Implementar duplicação
    console.log('Duplicar ficha:', fichaId);
  };

  const handleDesativar = async (fichaId: string) => {
    if (!confirm('Deseja realmente desativar esta ficha modelo?')) return;

    try {
      await api.delete(`/api/fichas/${fichaId}`);
      carregarFichas();
    } catch (err) {
      console.error('Erro ao desativar ficha:', err);
      alert('Erro ao desativar ficha');
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
          <h1 className="text-3xl font-bold text-gray-900">Fichas Modelo</h1>
          <p className="text-gray-600 mt-1">
            Crie fichas modelo para atribuir a vários alunos
          </p>
        </div>
        <button
          onClick={() => router.push('/fichas/novo')}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} />
          Nova Ficha Modelo
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Lista de Fichas */}
      {fichas.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
            <Copy size={32} className="text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Nenhuma Ficha Modelo
          </h3>
          <p className="text-gray-600 mb-4">
            Crie fichas modelo para reutilizar em vários alunos
          </p>
          <button
            onClick={() => router.push('/fichas/novo')}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <Plus size={20} />
            Criar Primeira Ficha Modelo
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {fichas.map((ficha) => (
            <div
              key={ficha._id}
              className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6"
            >
              {/* Nome */}
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {ficha.nomeModelo}
              </h3>

              {/* Professor */}
              <p className="text-sm text-gray-600 mb-4">
                Por: {ficha.professorReferencia.nome}
              </p>

              {/* Estatísticas */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Users size={16} className="text-blue-600" />
                  <span>
                    {ficha.alunosAtribuidos.length} aluno(s) atribuído(s)
                  </span>
                </div>
                <div className="text-sm text-gray-700">
                  🎯 {ficha.objetivos.length} objetivo(s)
                </div>
                <div className="text-sm text-gray-700">
                  💪 {ficha.treinos.length} treino(s)
                </div>
              </div>

              {/* Alunos Atribuídos */}
              {ficha.alunosAtribuidos.length > 0 && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs font-medium text-gray-700 mb-2">
                    Alunos com esta ficha:
                  </p>
                  <div className="space-y-1">
                    {ficha.alunosAtribuidos.slice(0, 3).map((attr) => (
                      <p key={attr.aluno._id} className="text-xs text-gray-600">
                        • {attr.aluno.nome} (#{attr.aluno.codigoAluno})
                      </p>
                    ))}
                    {ficha.alunosAtribuidos.length > 3 && (
                      <p className="text-xs text-gray-500 italic">
                        +{ficha.alunosAtribuidos.length - 3} mais...
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Ações */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleAtribuir(ficha._id)}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 text-sm"
                >
                  <Users size={16} />
                  Atribuir
                </button>
                <button
                  onClick={() => handleDuplicar(ficha._id)}
                  className="flex items-center justify-center bg-gray-200 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-300"
                  title="Duplicar"
                >
                  <Copy size={16} />
                </button>
                <button
                  onClick={() => handleDesativar(ficha._id)}
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
