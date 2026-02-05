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

export function TreinoBuilder({ treinos, onChange, objetivos, equipamentos }: TreinoBuilderProps) {
  const [treinoExpandido, setTreinoExpandido] = useState<number>(0);

  const adicionarTreino = () => {
    const novoTreino: Treino = {
      cor: CORES_TREINO[treinos.length % CORES_TREINO.length].value,
      partes: [{
        exercicios: []
      }],
      observacoes: ''
    };
    onChange([...treinos, novoTreino]);
    setTreinoExpandido(treinos.length);
  };

  const removerTreino = (index: number) => {
    onChange(treinos.filter((_, i) => i !== index));
    if (treinoExpandido >= treinos.length - 1) {
    setTreinoExpandido(Math.max(0, treinos.length - 2));
    }
  };

  const updateTreino = (index: number, treino: Treino) => {
    const novosTreinos = [...treinos];
    novosTreinos[index] = treino;
    onChange(novosTreinos);
  };

  const adicionarParte = (treinoIndex: number) => {
    const treino = treinos[treinoIndex];
    const novaParte: Parte = {
  nome: '',
  exercicios: []
    };
    updateTreino(treinoIndex, {
      ...treino,
      partes: [...treino.partes, novaParte]
    });
  };

  const removerParte = (treinoIndex: number, parteIndex: number) => {
  const treino = treinos[treinoIndex];
    updateTreino(treinoIndex, {
...treino,
      partes: treino.partes.filter((_, i) => i !== parteIndex)
    });
  };

  const adicionarExercicio = (treinoIndex: number, parteIndex: number) => {
    const treino = treinos[treinoIndex];
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

    updateTreino(treinoIndex, {
      ...treino,
      partes: novasPartes
    });
  };

  const removerExercicio = (treinoIndex: number, parteIndex: number, exercicioIndex: number) => {
 const treino = treinos[treinoIndex];
const novasPartes = [...treino.partes];
    novasPartes[parteIndex] = {
      ...novasPartes[parteIndex],
      exercicios: novasPartes[parteIndex].exercicios.filter((_, i) => i !== exercicioIndex)
    };

    updateTreino(treinoIndex, {
      ...treino,
      partes: novasPartes
    });
  };

  const updateExercicio = (treinoIndex: number, parteIndex: number, exercicioIndex: number, exercicio: Exercicio) => {
    const treino = treinos[treinoIndex];
 const novasPartes = [...treino.partes];
    novasPartes[parteIndex].exercicios[exercicioIndex] = exercicio;

  updateTreino(treinoIndex, {
      ...treino,
partes: novasPartes
    });
  };

  const ordenarExerciciosPorCategoria = (treinoIndex: number, parteIndex: number) => {
    const treino = treinos[treinoIndex];
    const parte = treino.partes[parteIndex];
    
    const exerciciosOrdenados = [...parte.exercicios].sort((a, b) => {
      const objA = objetivos.find(o => o.nome === a.objetivo);
      const objB = objetivos.find(o => o.nome === b.objetivo);
      
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

    updateTreino(treinoIndex, {
      ...treino,
      partes: novasPartes
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Treinos</h3>
        <button
    type="button"
    onClick={adicionarTreino}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
        >
        <Plus size={16} />
      Adicionar Treino
        </button>
      </div>

      {treinos.length === 0 && (
        <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
  <p className="text-gray-600 mb-2">Nenhum treino adicionado</p>
          <button
      type="button"
      onClick={adicionarTreino}
 className="text-blue-600 hover:text-blue-700 font-medium"
       >
 Clique para adicionar o primeiro treino
     </button>
    </div>
      )}

      <div className="space-y-4">
        {treinos.map((treino, treinoIndex) => (
          <div key={treinoIndex} className="border border-gray-300 rounded-lg overflow-hidden">
     {/* Header do Treino */}
    <div className="bg-gray-50 p-4">
   <div className="flex items-center justify-between">
     <div className="flex items-center gap-4 flex-1">
         <button
  type="button"
   onClick={() => setTreinoExpandido(treinoExpandido === treinoIndex ? -1 : treinoIndex)}
         className="text-gray-600 hover:text-gray-900"
  >
             {treinoExpandido === treinoIndex ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>

          <div className="flex items-center gap-3">
        <div
                 className="w-8 h-8 rounded-full border-2 border-gray-300"
             style={{ backgroundColor: treino.cor }}
             />
     <h4 className="font-semibold text-gray-900">
             Treino {String.fromCharCode(65 + treinoIndex)}
          </h4>
  </div>

      <select
            value={treino.cor}
     onChange={(e) => updateTreino(treinoIndex, { ...treino, cor: e.target.value })}
     className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
                  >
      {CORES_TREINO.map(cor => (
       <option key={cor.value} value={cor.value}>{cor.label}</option>
    ))}
      </select>
      </div>

              <button
        type="button"
          onClick={() => removerTreino(treinoIndex)}
     className="text-red-600 hover:bg-red-50 p-2 rounded transition"
            title="Remover treino"
     >
       <Trash2 size={18} />
    </button>
      </div>
     </div>

            {/* Conteúdo do Treino */}
            {treinoExpandido === treinoIndex && (
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
         onChange={(e) => {
       const novasPartes = [...treino.partes];
  novasPartes[parteIndex] = { ...novasPartes[parteIndex], nome: e.target.value };
    updateTreino(treinoIndex, { ...treino, partes: novasPartes });
               }}
        placeholder="Ex: Aquecimento, Principal, Finalização..."
   className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg"
     />
          </div>

      {treino.partes.length > 1 && (
      <button
     type="button"
  onClick={() => removerParte(treinoIndex, parteIndex)}
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
           onChange={(ex) => updateExercicio(treinoIndex, parteIndex, exercicioIndex, ex)}
      onRemove={() => removerExercicio(treinoIndex, parteIndex, exercicioIndex)}
    />
      ))}

      <div className="flex gap-2">
 <button
      type="button"
           onClick={() => adicionarExercicio(treinoIndex, parteIndex)}
      className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition text-sm text-gray-600 hover:text-blue-600"
     >
          <Plus size={16} />
     Adicionar Exercício
     </button>

            {parte.exercicios.length > 1 && (
        <button
     type="button"
     onClick={() => ordenarExerciciosPorCategoria(treinoIndex, parteIndex)}
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
      onClick={() => adicionarParte(treinoIndex)}
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
        onChange={(e) => updateTreino(treinoIndex, { ...treino, observacoes: e.target.value })}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
   rows={2}
   placeholder="Observações gerais sobre este treino..."
      />
        </div>
         </div>
            )}
       </div>
        ))}
      </div>

      {treinos.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
          <p className="font-medium mb-1"> Dica:</p>
        <p>Use o botão &ldquo;Ordenar Automaticamente&rdquo; para organizar os exercícios na ordem correta:</p>
    <ol className="list-decimal list-inside mt-2 space-y-1">
 <li>Aeróbicos de aquecimento</li>
            <li>Dinâmicos</li>
  <li>Musculação (mesmos objetivos juntos)</li>
            <li>Aeróbicos de desaquecimento</li>
          </ol>
        </div>
      )}
    </div>
  );
}
