'use client';

import { useState } from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { Treino, Exercicio, Parte } from '@/types';
import { ExercicioForm } from './ExercicioForm';

interface TreinoBuilderProps {
  treinos: Treino[];
  onChange: (treinos: Treino[]) => void;
  objetivos: Array<{ _id: string; nome: string; categoria: string }>;
  equipamentos: Array<{ _id: string; nome: string }>;
}

const CORES_TREINO = [
  { value: '#EF4444', label: 'Vermelho' },
  { value: '#F97316', label: 'Laranja' },
  { value: '#F59E0B', label: 'Amarelo' },
  { value: '#10B981', label: 'Verde' },
  { value: '#3B82F6', label: 'Azul' },
  { value: '#8B5CF6', label: 'Roxo' },
  { value: '#EC4899', label: 'Rosa' },
  { value: '#6B7280', label: 'Cinza' },
];

// TreinoBuilder para treino modelo: apenas UM treino
export function TreinoBuilder({ treinos, onChange, objetivos, equipamentos }: TreinoBuilderProps) {
  // Força o treino modelo a ter apenas UM treino (treinos[0])
  const treino = treinos[0] || {
    partes: [{ exercicios: [] }],
    observacoes: ''
  };

  const setTreino = (novoTreino: Treino) => {
    onChange([novoTreino]);
  };

  const adicionarParte = () => {
    const novaParte: Parte = {
      nome: '',
      exercicios: []
    };
    setTreino({
      ...treino,
      partes: [...treino.partes, novaParte]
    });
  };

  const removerParte = (parteIndex: number) => {
    setTreino({
      ...treino,
      partes: treino.partes.filter((_, i) => i !== parteIndex)
    });
  };

  const adicionarExercicio = (parteIndex: number) => {
    const novoExercicio: Exercicio = {
      objetivo: '',
      equipamento: '',
      series: [3],
      repeticoes: [12],
      detalhes: '',
      ordem: treino.partes[parteIndex].exercicios.length
    };
    const novasPartes = [...treino.partes];
    novasPartes[parteIndex] = {
      ...novasPartes[parteIndex],
      exercicios: [...novasPartes[parteIndex].exercicios, novoExercicio]
    };
    setTreino({
      ...treino,
      partes: novasPartes
    });
  };

  const removerExercicio = (parteIndex: number, exercicioIndex: number) => {
    const novasPartes = [...treino.partes];
    novasPartes[parteIndex] = {
      ...novasPartes[parteIndex],
      exercicios: novasPartes[parteIndex].exercicios.filter((_, i) => i !== exercicioIndex)
    };
    setTreino({
      ...treino,
      partes: novasPartes
    });
  };

  const updateExercicio = (parteIndex: number, exercicioIndex: number, exercicio: Exercicio) => {
    const novasPartes = [...treino.partes];
    novasPartes[parteIndex].exercicios[exercicioIndex] = exercicio;
    setTreino({
      ...treino,
      partes: novasPartes
    });
  };

  const ordenarExerciciosPorCategoria = (parteIndex: number) => {
    const parte = treino.partes[parteIndex];
    const exerciciosOrdenados = [...parte.exercicios].sort((a, b) => {
      const objA = objetivos.find(o => o._id === a.objetivo);
      const objB = objetivos.find(o => o._id === b.objetivo);
      const ordem: Record<string, number> = {
        'aerobico_aquecimento': 1,
        'dinamico': 2,
        'musculacao': 3,
        'aerobico_desaquecimento': 4
      };
      const ordemA = objA ? (ordem[objA.categoria] || 3) : 3;
      const ordemB = objB ? (ordem[objB.categoria] || 3) : 3;
      return ordemA - ordemB;
    });
    const novasPartes = [...treino.partes];
    novasPartes[parteIndex] = {
      ...novasPartes[parteIndex],
      exercicios: exerciciosOrdenados.map((ex, idx) => ({ ...ex, ordem: idx }))
    };
    setTreino({
      ...treino,
      partes: novasPartes
    });
  };

  return (
    <div className="space-y-4">
      {/* Treino modelo único */}
      <div className="border border-gray-300 rounded-lg overflow-hidden">
        <div className="bg-gray-50 p-4 flex items-center gap-4">
          <div className="flex items-center gap-3">
            <h4 className="font-semibold text-gray-900">Treino Modelo</h4>
          </div>
        </div>
        <div className="p-4 space-y-4">
          {/* Partes */}
          {treino.partes.map((parte, parteIndex) => (
            <div key={parteIndex} className="border border-gray-200 rounded-lg p-4 bg-white">
              <div className="flex items-center justify-between mb-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome da Parte (opcional)
                  </label>
                  <input
                    type="text"
                    value={parte.nome || ''}
                    onChange={e => {
                      const novasPartes = [...treino.partes];
                      novasPartes[parteIndex] = { ...novasPartes[parteIndex], nome: e.target.value };
                      setTreino({ ...treino, partes: novasPartes });
                    }}
                    placeholder="Ex: Aquecimento, Principal, Finalização..."
                    className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                {treino.partes.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removerParte(parteIndex)}
                    className="text-red-600 hover:bg-red-50 p-2 rounded transition"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
              {/* Exercícios */}
              <div className="space-y-3">
                {parte.exercicios.map((exercicio, exercicioIndex) => (
                  <ExercicioForm
                    key={exercicioIndex}
                    exercicio={exercicio}
                    index={exercicioIndex}
                    objetivos={objetivos}
                    equipamentos={equipamentos}
                    onChange={ex => updateExercicio(parteIndex, exercicioIndex, ex)}
                    onRemove={() => removerExercicio(parteIndex, exercicioIndex)}
                  />
                ))}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => adicionarExercicio(parteIndex)}
                    className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition text-sm text-gray-600 hover:text-blue-600"
                  >
                    <Plus size={16} />
                    Adicionar Exercício
                  </button>
                  {parte.exercicios.length > 1 && (
                    <button
                      type="button"
                      onClick={() => ordenarExerciciosPorCategoria(parteIndex)}
                      className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition text-sm font-medium"
                    >
                      Ordenar Automaticamente
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={adicionarParte}
            className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition text-sm text-gray-600 hover:text-blue-600"
          >
            + Adicionar Parte
          </button>
          {/* Observações do Treino */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observações do Treino
            </label>
            <textarea
              value={treino.observacoes || ''}
              onChange={e => setTreino({ ...treino, observacoes: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              rows={2}
              placeholder="Observações gerais sobre este treino..."
            />
          </div>
        </div>
      </div>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800 mt-4">
        <p className="font-medium mb-1">Dica:</p>
        <p>Use o botão &ldquo;Ordenar Automaticamente&rdquo; para organizar os exercícios na ordem correta:</p>
        <ol className="list-decimal list-inside mt-2 space-y-1">
          <li>Aeróbicos de aquecimento</li>
          <li>Dinâmicos</li>
          <li>Musculação (mesmos objetivos juntos)</li>
          <li>Aeróbicos de desaquecimento</li>
        </ol>
      </div>
    </div>
  );
}
