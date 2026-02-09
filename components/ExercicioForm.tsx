'use client';

import { Trash2, GripVertical, Plus, X } from 'lucide-react';
import { Exercicio } from '@/types';
import { useEffect, useState } from 'react';

interface ExercicioFormProps {
  exercicio: Exercicio;
  index: number;
  objetivos: Array<{ _id: string; nome: string }>;
  equipamentos: Array<{ _id: string; nome: string }>;
  onChange: (exercicio: Exercicio) => void;
  onRemove: () => void;
  isJunto?: boolean;
}

export function ExercicioForm({
  exercicio,
  index,
  objetivos,
  equipamentos,
  onChange,
  onRemove,
  isJunto = false
}: ExercicioFormProps) {
  const [minutos, setMinutos] = useState(0);
  const [segundos, setSegundos] = useState(0);

  // Inicializar minutos e segundos do tempoSegundos existente
  useEffect(() => {
    if (exercicio.tempoSegundos) {
      const mins = Math.floor(exercicio.tempoSegundos / 60);
      const secs = exercicio.tempoSegundos % 60;
      setMinutos(mins);
      setSegundos(secs);
    }
  }, []);

  // Garantir que séries e repetições tenham o mesmo tamanho ao montar
  useEffect(() => {
    if (!exercicio.tipo || exercicio.tipo === 'series') {
      if (!exercicio.series || !exercicio.repeticoes) {
        // Inicializar com valores padrão se não existirem
        onChange({
          ...exercicio,
          tipo: 'series',
          series: exercicio.series || [10],
          repeticoes: exercicio.repeticoes || [10]
        });
      } else if (exercicio.series.length !== exercicio.repeticoes.length) {
        // Sincronizar tamanhos se forem diferentes
        const maxLength = Math.max(exercicio.series.length, exercicio.repeticoes.length);
        const newSeries = [...exercicio.series];
        const newRepeticoes = [...exercicio.repeticoes];
    
        // Preencher com valores padrão até terem o mesmo tamanho
        while (newSeries.length < maxLength) newSeries.push(10);
        while (newRepeticoes.length < maxLength) newRepeticoes.push(10);
   
        onChange({
          ...exercicio,
          tipo: 'series',
          series: newSeries,
          repeticoes: newRepeticoes
        });
      }
    }
  }, []);

  const updateField = <K extends keyof Exercicio>(field: K, value: Exercicio[K]) => {
    onChange({ ...exercicio, [field]: value });
  };

  const updateTipoExercicio = (novoTipo: 'series' | 'tempo') => {
    if (novoTipo === 'series') {
      onChange({
        ...exercicio,
        tipo: 'series',
        series: exercicio.series?.length ? exercicio.series : [10],
        repeticoes: exercicio.repeticoes?.length ? exercicio.repeticoes : [10],
        tempoSegundos: undefined
      });
      setMinutos(0);
      setSegundos(0);
    } else {
      onChange({
        ...exercicio,
        tipo: 'tempo',
        tempoSegundos: (minutos * 60) + segundos || 300, // 5 min default
        series: [],
        repeticoes: []
      });
    }
  };

  const updateTempo = (mins: number, secs: number) => {
    setMinutos(mins);
    setSegundos(secs);
    const totalSegundos = (mins * 60) + secs;
    onChange({
      ...exercicio,
      tempoSegundos: totalSegundos
    });
  };

  const updateSeries = (idx: number, value: string) => {
    const newSeries = [...exercicio.series];
    newSeries[idx] = Number(value) || 0;
    updateField('series', newSeries);
  };

  const updateRepeticoes = (idx: number, value: string) => {
    const newRepeticoes = [...exercicio.repeticoes];
    newRepeticoes[idx] = Number(value) || 0;
    updateField('repeticoes', newRepeticoes);
  };

  const addSerie = () => {
    console.log(' Adicionando série...');
    console.log('Séries atuais:', exercicio.series);
    console.log('Repetições atuais:', exercicio.repeticoes);
    
    // Garantir que ambos os arrays existam
    const currentSeries = exercicio.series || [];
    const currentRepeticoes = exercicio.repeticoes || [];
    
    const newSeries = [...currentSeries, 10];
    const newRepeticoes = [...currentRepeticoes, 10];
    
    console.log('Novas séries:', newSeries);
    console.log('Novas repetições:', newRepeticoes);
    console.log('Tamanhos - Séries:', newSeries.length, 'Repetições:', newRepeticoes.length);
    
    // Atualizar o exercício com os novos arrays
    onChange({
      ...exercicio,
      series: newSeries,
      repeticoes: newRepeticoes
    });
    
    console.log(' Série adicionada!');
  };

const removeSerie = (idx: number) => {
    if (exercicio.series.length > 1) {
      console.log(' Removendo série', idx);
      
      const newSeries = exercicio.series.filter((_, i) => i !== idx);
      const newRepeticoes = exercicio.repeticoes.filter((_, i) => i !== idx);
      
   console.log('Após remoção - Séries:', newSeries.length, 'Repetições:', newRepeticoes.length);
  
      onChange({
        ...exercicio,
     series: newSeries,
      repeticoes: newRepeticoes
      });
      
      console.log(' Série removida!');
    }
  };

  // Log para debug do render
  console.log(` Render Exercício ${index + 1}:`, {
    series: exercicio.series?.length || 0,
    repeticoes: exercicio.repeticoes?.length || 0,
    seriesArray: exercicio.series,
    repeticoesArray: exercicio.repeticoes
  });

  return (
    <div className={`p-4 border rounded-lg ${isJunto ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-white'}`}>
    <div className="flex items-start gap-3 mb-4">
   <div className="cursor-move mt-2">
          <GripVertical size={20} className="text-gray-400" />
  </div>
        
        <div className="flex-1 space-y-4">
        {/* Cabeçalho */}
       <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-900">
      Exercício {index + 1}
              {isJunto && <span className="ml-2 text-xs bg-blue-600 text-white px-2 py-1 rounded">Junto</span>}
</h4>
            <button
     type="button"
            onClick={onRemove}
          className="text-red-600 hover:bg-red-50 p-2 rounded transition"
         title="Remover exercício"
    >
    <Trash2 size={16} />
     </button>
          </div>

          {/* Objetivo e Equipamento */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
   <div>
   <label className="block text-sm font-medium text-gray-700 mb-2">
     Objetivo *
         </label>
<select
    value={exercicio.objetivo}
         onChange={(e) => updateField('objetivo', e.target.value)}
    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
   required
        >
           <option value="">Selecione...</option>
 {objetivos.map(obj => (
           <option key={obj._id} value={obj._id}>{obj.nome}</option>
      ))}
</select>
            </div>

     <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
      Equipamento *
</label>
  <select
                value={exercicio.equipamento}
     onChange={(e) => updateField('equipamento', e.target.value)}
           className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
  required
              >
         <option value="">Selecione...</option>
    {equipamentos.map(eq => (
          <option key={eq._id} value={eq._id}>{eq.nome}</option>
    ))}
    </select>
            </div>
          </div>

          {/* Tipo de Exercício */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Exercício *
            </label>
            <div className="flex gap-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name={`tipo-${index}`}
                  value="series"
                  checked={!exercicio.tipo || exercicio.tipo === 'series'}
                  onChange={() => updateTipoExercicio('series')}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Séries e Repetições</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name={`tipo-${index}`}
                  value="tempo"
                  checked={exercicio.tipo === 'tempo'}
                  onChange={() => updateTipoExercicio('tempo')}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Por Tempo</span>
              </label>
            </div>
          </div>

          {/* Séries e Repetições - só mostrar se tipo for 'series' */}
          {(!exercicio.tipo || exercicio.tipo === 'series') && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Séries e Repetições * (Total: {exercicio.series?.length || 0})
                </label>
                <button
                  type="button"
                  onClick={addSerie}
                  className="text-sm text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus size={14} />
                  Adicionar série
                </button>
              </div>

              <div className="space-y-2">
                {(exercicio.series || []).map((serie, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 w-16">Série {idx + 1}:</span>
                    <input
                      type="number"
                      min="1"
                      value={serie}
                      onChange={(e) => updateSeries(idx, e.target.value)}
                      className="w-20 px-3 py-1 border border-gray-300 rounded-lg"
                      placeholder="10"
                    />
                    <span className="text-sm text-gray-600">x</span>
                    <input
                      type="number"
                      min="1"
                      value={exercicio.repeticoes?.[idx] || 10}
                      onChange={(e) => updateRepeticoes(idx, e.target.value)}
                      className="w-20 px-3 py-1 border border-gray-300 rounded-lg"
                      placeholder="12"
                    />
                    <span className="text-sm text-gray-600">reps</span>
                    {exercicio.series.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSerie(idx)}
                        className="text-red-600 hover:bg-red-50 p-1 rounded cursor-pointer"
                        title="Remover série"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tempo - só mostrar se tipo for 'tempo' */}
          {exercicio.tipo === 'tempo' && (
          <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
                Duração do Exercício *
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="99"
                  value={minutos}
                  onChange={(e) => updateTempo(Number(e.target.value), segundos)}
                  className="w-20 px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="0"
                />
                <span className="text-sm text-gray-700">min</span>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={segundos}
                  onChange={(e) => updateTempo(minutos, Number(e.target.value))}
                  className="w-20 px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="0"
                />
                <span className="text-sm text-gray-700">seg</span>
              </div>
            </div>
          )}

  {/* Detalhes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
           Detalhes Adicionais
    </label>
  <textarea
      value={exercicio.detalhes || ''}
            onChange={(e) => updateField('detalhes', e.target.value)}
   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
  rows={2}
              placeholder="Ex: Carga, tempo de descanso, observações..."
            />
 </div>
   </div>
      </div>
    </div>
  );
}
