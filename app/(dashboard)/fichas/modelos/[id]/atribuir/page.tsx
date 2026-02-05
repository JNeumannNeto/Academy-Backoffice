'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, UserPlus, X } from 'lucide-react';
import api from '@/lib/api';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface Aluno {
  _id: string;
  nome: string;
  email: string;
  codigoAluno: number;
  fichasAtivas?: number;
}

interface FichaModelo {
  _id: string;
  nomeModelo: string;
  alunosAtribuidos: Array<{
    aluno: {
      _id: string;
      nome: string;
      codigoAluno: number;
    };
  }>;
}

export default function AtribuirFichaPage() {
  const router = useRouter();
  const params = useParams();
  const fichaId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [ficha, setFicha] = useState<FichaModelo | null>(null);
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [alunosSelecionados, setAlunosSelecionados] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    carregarDados();
  }, [fichaId]);

  const carregarDados = async () => {
    try {
      setLoading(true);
      
      const [fichaRes, alunosRes] = await Promise.all([
        api.get(`/api/fichas/${fichaId}`),
        api.get('/api/usuarios')
      ]);

      if (fichaRes.data.sucesso) {
        setFicha(fichaRes.data.dados);
      }

      if (alunosRes.data.sucesso) {
        const todosAlunos = alunosRes.data.dados.filter((u: any) => u.tipo === 'aluno' && u.ativo);
        
        // Carregar número de fichas ativas para cada aluno
        const alunosComFichas = await Promise.all(
          todosAlunos.map(async (aluno: Aluno) => {
            try {
              const fichasRes = await api.get(`/api/fichas/aluno/${aluno._id}`);
              return {
                ...aluno,
                fichasAtivas: fichasRes.data.total || 0
              };
            } catch {
              return { ...aluno, fichasAtivas: 0 };
            }
          })
        );
        
        setAlunos(alunosComFichas);
      }
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAluno = (alunoId: string) => {
    setAlunosSelecionados(prev => 
      prev.includes(alunoId)
        ? prev.filter(id => id !== alunoId)
        : [...prev, alunoId]
    );
  };

  const handleAtribuir = async () => {
    if (alunosSelecionados.length === 0) {
      setError('Selecione pelo menos um aluno');
      return;
    }

    try {
      setSaving(true);
      setError('');

      const response = await api.post(`/api/fichas/${fichaId}/atribuir`, {
        alunosIds: alunosSelecionados
      });

      if (response.data.sucesso) {
        alert(`Ficha atribuída com sucesso!\n${response.data.mensagem}`);
        router.push('/fichas/modelos');
      }
    } catch (err: any) {
      const mensagem = err.response?.data?.mensagem || 'Erro ao atribuir ficha';
      setError(mensagem);
    } finally {
      setSaving(false);
    }
  };

  const handleRemoverAtribuicao = async (alunoId: string) => {
    if (!confirm('Deseja remover esta atribuição?')) return;

    try {
      await api.delete(`/api/fichas/${fichaId}/atribuir/${alunoId}`);
      carregarDados();
    } catch (err) {
      alert('Erro ao remover atribuição');
    }
  };

  const alunosFiltrados = alunos.filter(aluno => 
    aluno.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    aluno.codigoAluno.toString().includes(searchTerm)
  );

  const alunosJaAtribuidos = ficha?.alunosAtribuidos.map(a => a.aluno._id) || [];

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
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft size={20} />
          Voltar
        </button>
        <h1 className="text-3xl font-bold text-gray-900">
          Atribuir Ficha: {ficha?.nomeModelo}
        </h1>
        <p className="text-gray-600 mt-1">
          Selecione os alunos que receberão esta ficha
        </p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de Alunos */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
          <div className="mb-4">
            <input
              type="text"
              placeholder="Buscar aluno por nome ou código..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {alunosFiltrados.map((aluno) => {
              const jaAtribuido = alunosJaAtribuidos.includes(aluno._id);
              const selecionado = alunosSelecionados.includes(aluno._id);
              const podeSelecionar = !jaAtribuido && (aluno.fichasAtivas || 0) < 3;

              return (
                <div
                  key={aluno._id}
                  className={`p-4 border rounded-lg transition-all ${
                    jaAtribuido
                      ? 'bg-green-50 border-green-200'
                      : selecionado
                      ? 'bg-blue-50 border-blue-500'
                      : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        {!jaAtribuido && (
                          <input
                            type="checkbox"
                            checked={selecionado}
                            onChange={() => handleToggleAluno(aluno._id)}
                            disabled={!podeSelecionar}
                            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                        )}
                        <div>
                          <p className="font-medium text-gray-900">
                            {aluno.nome} - #{aluno.codigoAluno}
                          </p>
                          <p className="text-sm text-gray-600">{aluno.email}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {aluno.fichasAtivas || 0}/3 fichas ativas
                          </p>
                        </div>
                      </div>
                    </div>

                    {jaAtribuido && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-green-600 font-medium">
                          ✓ Atribuído
                        </span>
                        <button
                          onClick={() => handleRemoverAtribuicao(aluno._id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                          title="Remover atribuição"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    )}

                    {!jaAtribuido && !podeSelecionar && (
                      <span className="text-sm text-orange-600 font-medium">
                        Limite atingido
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Painel de Ação */}
        <div className="bg-white rounded-lg shadow p-6 h-fit">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Resumo da Atribuição
          </h3>

          <div className="space-y-4 mb-6">
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-700">
                <span className="font-medium">{alunosSelecionados.length}</span> aluno(s) selecionado(s)
              </p>
            </div>

            <div className="p-3 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-700">
                <span className="font-medium">{alunosJaAtribuidos.length}</span> já atribuído(s)
              </p>
            </div>
          </div>

          <button
            onClick={handleAtribuir}
            disabled={alunosSelecionados.length === 0 || saving}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {saving ? (
              <LoadingSpinner />
            ) : (
              <>
                <UserPlus size={20} />
                Atribuir aos Selecionados
              </>
            )}
          </button>

          <p className="text-xs text-gray-500 mt-4 text-center">
            Cada aluno pode ter até 3 fichas ativas
          </p>
        </div>
      </div>
    </div>
  );
}
