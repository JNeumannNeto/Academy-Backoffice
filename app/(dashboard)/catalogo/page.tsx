'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Check, X } from 'lucide-react';
import api from '@/lib/api';
import { Objetivo, Equipamento } from '@/types';
import { Modal } from '@/components/Modal';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useAuthStore } from '@/lib/store';

type TabType = 'objetivos' | 'equipamentos';

interface ObjetivoForm {
  nome: string;
  categoria: 'aerobico_aquecimento' | 'dinamico' | 'musculacao' | 'aerobico_desaquecimento';
  ordem: number;
}

interface EquipamentoForm {
  nome: string;
}

export default function CatalogoPage() {
  const { usuario } = useAuthStore();
  const [tabAtiva, setTabAtiva] = useState<TabType>('objetivos');
  const [objetivos, setObjetivos] = useState<Objetivo[]>([]);
  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([]);
  const [loading, setLoading] = useState(true);

  // Modais e formulários
  const [modalObjetivo, setModalObjetivo] = useState<{
    isOpen: boolean;
    objetivo: Objetivo | null;
    modo: 'criar' | 'editar';
  }>({ isOpen: false, objetivo: null, modo: 'criar' });

  const [modalEquipamento, setModalEquipamento] = useState<{
    isOpen: boolean;
    equipamento: Equipamento | null;
    modo: 'criar' | 'editar';
  }>({ isOpen: false, equipamento: null, modo: 'criar' });

  const [modalExcluir, setModalExcluir] = useState<{
    isOpen: boolean;
    tipo: 'objetivo' | 'equipamento';
    id: string;
    nome: string;
  } | null>(null);

  const [formObjetivo, setFormObjetivo] = useState<ObjetivoForm>({
 nome: '',
    categoria: 'musculacao',
  ordem: 1
  });

  const [formEquipamento, setFormEquipamento] = useState<EquipamentoForm>({
    nome: ''
  });

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);
    const [objResponse, equipResponse] = await Promise.all([
        api.get('/api/catalogo/objetivos'),
     api.get('/api/catalogo/equipamentos')
      ]);

      if (objResponse.data.sucesso) {
        // A API retorna 'dados' e não 'objetivos'
    setObjetivos(objResponse.data.dados || []);
      } else {
 setObjetivos([]);
      }
      
      if (equipResponse.data.sucesso) {
    // A API retorna 'dados' e não 'equipamentos'
   setEquipamentos(equipResponse.data.dados || []);
      } else {
   setEquipamentos([]);
  }
    } catch (error) {
      console.error('Erro ao carregar catálogo:', error);
  setObjetivos([]);
      setEquipamentos([]);
    } finally {
      setLoading(false);
    }
  };

  // Handlers Objetivos
  const abrirModalObjetivo = (objetivo?: Objetivo) => {
    if (objetivo) {
      setFormObjetivo({
        nome: objetivo.nome,
        categoria: objetivo.categoria,
   ordem: objetivo.ordem
      });
      setModalObjetivo({ isOpen: true, objetivo, modo: 'editar' });
 } else {
      setFormObjetivo({ nome: '', categoria: 'musculacao', ordem: 1 });
      setModalObjetivo({ isOpen: true, objetivo: null, modo: 'criar' });
    }
  };

  const salvarObjetivo = async () => {
    try {
      if (modalObjetivo.modo === 'criar') {
        await api.post('/api/catalogo/objetivos', formObjetivo);
      } else if (modalObjetivo.objetivo) {
   await api.patch(`/api/catalogo/objetivos/${modalObjetivo.objetivo._id}`, formObjetivo);
  }
      await carregarDados();
   setModalObjetivo({ isOpen: false, objetivo: null, modo: 'criar' });
    } catch (error) {
      console.error('Erro ao salvar objetivo:', error);
    }
  };

  const alternarStatusObjetivo = async (id: string, ativoAtual: boolean) => {
    try {
      await api.patch(`/api/catalogo/objetivos/${id}`, { ativo: !ativoAtual });
   await carregarDados();
    } catch (error) {
      console.error('Erro ao alterar status:', error);
    }
  };

  // Handlers Equipamentos
const abrirModalEquipamento = (equipamento?: Equipamento) => {
    if (equipamento) {
      setFormEquipamento({ nome: equipamento.nome });
      setModalEquipamento({ isOpen: true, equipamento, modo: 'editar' });
    } else {
      setFormEquipamento({ nome: '' });
      setModalEquipamento({ isOpen: true, equipamento: null, modo: 'criar' });
    }
  };

const salvarEquipamento = async () => {
    try {
      if (modalEquipamento.modo === 'criar') {
        await api.post('/api/catalogo/equipamentos', formEquipamento);
      } else if (modalEquipamento.equipamento) {
        await api.patch(`/api/catalogo/equipamentos/${modalEquipamento.equipamento._id}`, formEquipamento);
      }
   await carregarDados();
      setModalEquipamento({ isOpen: false, equipamento: null, modo: 'criar' });
    } catch (error) {
  console.error('Erro ao salvar equipamento:', error);
    }
  };

  const alternarStatusEquipamento = async (id: string, ativoAtual: boolean) => {
    try {
      await api.patch(`/api/catalogo/equipamentos/${id}`, { ativo: !ativoAtual });
      await carregarDados();
    } catch (error) {
      console.error('Erro ao alterar status:', error);
    }
  };

  const handleExcluir = async () => {
 if (!modalExcluir) return;

    try {
      if (modalExcluir.tipo === 'objetivo') {
      await api.delete(`/api/catalogo/objetivos/${modalExcluir.id}`);
      } else {
        await api.delete(`/api/catalogo/equipamentos/${modalExcluir.id}`);
      }
      await carregarDados();
setModalExcluir(null);
    } catch (error) {
      console.error('Erro ao excluir:', error);
    }
  };

  // Verifica se pode adicionar/editar (admin ou professor)
  const podeEditar = usuario?.tipo === 'administrador' || usuario?.tipo === 'professor';

  const categorias = [
  { value: 'aerobico_aquecimento', label: 'Aeróbico Aquecimento' },
    { value: 'dinamico', label: 'Dinâmico' },
 { value: 'musculacao', label: 'Musculação' },
    { value: 'aerobico_desaquecimento', label: 'Aeróbico Desaquecimento' }
  ];

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
          <h1 className="text-3xl font-bold text-gray-900">Catálogo</h1>
          <p className="text-gray-600 mt-1">Gerencie objetivos e equipamentos</p>
        </div>

        {podeEditar && (
          <button
    onClick={() => tabAtiva === 'objetivos' ? abrirModalObjetivo() : abrirModalEquipamento()}
    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
      >
            <Plus size={20} />
            <span>Novo {tabAtiva === 'objetivos' ? 'Objetivo' : 'Equipamento'}</span>
       </button>
    )}
      </div>

  {/* Tabs */}
    <div className="border-b border-gray-200">
     <div className="flex gap-4">
 <button
     onClick={() => setTabAtiva('objetivos')}
          className={`pb-4 px-2 border-b-2 transition ${
    tabAtiva === 'objetivos'
      ? 'border-blue-600 text-blue-600 font-medium'
          : 'border-transparent text-gray-600 hover:text-gray-900'
     }`}
          >
     Objetivos ({objetivos.length})
          </button>
        <button
            onClick={() => setTabAtiva('equipamentos')}
          className={`pb-4 px-2 border-b-2 transition ${
   tabAtiva === 'equipamentos'
        ? 'border-blue-600 text-blue-600 font-medium'
                : 'border-transparent text-gray-600 hover:text-gray-900'
  }`}
        >
  Equipamentos ({equipamentos.length})
     </button>
      </div>
      </div>

      {/* Conteúdo */}
      {tabAtiva === 'objetivos' ? (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {objetivos.map((objetivo) => (
   <div
  key={objetivo._id}
       className={`p-4 border rounded-lg ${
  objetivo.ativo ? 'border-gray-200' : 'border-gray-300 bg-gray-50'
             }`}
             >
       <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
            <h3 className="font-semibold text-gray-900">{objetivo.nome}</h3>
  <p className="text-sm text-gray-600 mt-1">
 {categorias.find(c => c.value === objetivo.categoria)?.label}
    </p>
          <p className="text-xs text-gray-500 mt-1">Ordem: {objetivo.ordem}</p>
         </div>
            <span
       className={`px-2 py-1 text-xs rounded-full ${
          objetivo.ativo
       ? 'bg-green-100 text-green-800'
   : 'bg-gray-100 text-gray-800'
   }`}
          >
{objetivo.ativo ? 'Ativo' : 'Inativo'}
         </span>
         </div>

     {podeEditar && (
    <div className="flex gap-2 mt-3 pt-3 border-t">
      <button
         onClick={() => abrirModalObjetivo(objetivo)}
               className="flex-1 p-2 text-blue-600 hover:bg-blue-50 rounded transition text-sm"
         >
       <Edit size={14} className="inline mr-1" />
    Editar
                 </button>
         <button
    onClick={() => alternarStatusObjetivo(objetivo._id, objetivo.ativo)}
 className={`flex-1 p-2 rounded transition text-sm ${
        objetivo.ativo
       ? 'text-red-600 hover:bg-red-50'
          : 'text-green-600 hover:bg-green-50'
}`}
        >
    {objetivo.ativo ? <X size={14} className="inline mr-1" /> : <Check size={14} className="inline mr-1" />}
   {objetivo.ativo ? 'Desativar' : 'Ativar'}
  </button>
    </div>
       )}
 </div>
     ))}
    </div>

       {objetivos.length === 0 && (
    <div className="text-center py-12 text-gray-500">
   Nenhum objetivo cadastrado
        </div>
          )}
          </div>
        </div>
    ) : (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
 {equipamentos.map((equipamento) => (
         <div
  key={equipamento._id}
           className={`p-4 border rounded-lg ${
              equipamento.ativo ? 'border-gray-200' : 'border-gray-300 bg-gray-50'
           }`}
            >
     <div className="flex items-start justify-between mb-2">
    <h3 className="font-semibold text-gray-900 flex-1">{equipamento.nome}</h3>
    <span
              className={`px-2 py-1 text-xs rounded-full ${
       equipamento.ativo
             ? 'bg-green-100 text-green-800'
        : 'bg-gray-100 text-gray-800'
        }`}
        >
   {equipamento.ativo ? 'Ativo' : 'Inativo'}
          </span>
      </div>

                  {podeEditar && (
    <div className="flex gap-2 mt-3 pt-3 border-t">
          <button
     onClick={() => abrirModalEquipamento(equipamento)}
      className="flex-1 p-2 text-blue-600 hover:bg-blue-50 rounded transition text-sm"
          >
              <Edit size={14} className="inline mr-1" />
      Editar
        </button>
      <button
  onClick={() => alternarStatusEquipamento(equipamento._id, equipamento.ativo)}
          className={`flex-1 p-2 rounded transition text-sm ${
                 equipamento.ativo
      ? 'text-red-600 hover:bg-red-50'
          : 'text-green-600 hover:bg-green-50'
            }`}
 >
         {equipamento.ativo ? <X size={14} className="inline mr-1" /> : <Check size={14} className="inline mr-1" />}
    {equipamento.ativo ? 'Desativar' : 'Ativar'}
      </button>
    </div>
       )}
                </div>
      ))}
      </div>

   {equipamentos.length === 0 && (
  <div className="text-center py-12 text-gray-500">
         Nenhum equipamento cadastrado
       </div>
     )}
          </div>
        </div>
      )}

      {/* Modal Objetivo */}
      <Modal
     isOpen={modalObjetivo.isOpen}
        onClose={() => setModalObjetivo({ isOpen: false, objetivo: null, modo: 'criar' })}
        title={modalObjetivo.modo === 'criar' ? 'Novo Objetivo' : 'Editar Objetivo'}
      >
        <div className="space-y-4">
   <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
     Nome do Objetivo *
    </label>
        <input
              type="text"
    value={formObjetivo.nome}
     onChange={(e) => setFormObjetivo({ ...formObjetivo, nome: e.target.value })}
      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
       placeholder="Ex: Pernas, Peito, etc."
            />
       </div>

 <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoria *
            </label>
       <select
          value={formObjetivo.categoria}
              onChange={(e) => setFormObjetivo({ ...formObjetivo, categoria: e.target.value as 'aerobico_aquecimento' | 'dinamico' | 'musculacao' | 'aerobico_desaquecimento' })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
   >
          {categorias.map(cat => (
      <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
   </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
           Ordem de Execução *
            </label>
            <input
           type="number"
    min="1"
  value={formObjetivo.ordem}
    onChange={(e) => setFormObjetivo({ ...formObjetivo, ordem: Number(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
    <p className="text-xs text-gray-500 mt-1">
              Define a ordem de execução dentro da categoria
       </p>
   </div>

          <div className="flex gap-3 justify-end pt-4 border-t">
         <button
          onClick={() => setModalObjetivo({ isOpen: false, objetivo: null, modo: 'criar' })}
      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
   >
     Cancelar
            </button>
            <button
  onClick={salvarObjetivo}
  disabled={!formObjetivo.nome}
     className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
       Salvar
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal Equipamento */}
    <Modal
        isOpen={modalEquipamento.isOpen}
        onClose={() => setModalEquipamento({ isOpen: false, equipamento: null, modo: 'criar' })}
        title={modalEquipamento.modo === 'criar' ? 'Novo Equipamento' : 'Editar Equipamento'}
    >
        <div className="space-y-4">
   <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
   Nome do Equipamento *
 </label>
       <input
   type="text"
              value={formEquipamento.nome}
   onChange={(e) => setFormEquipamento({ ...formEquipamento, nome: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
   placeholder="Ex: Leg Press, Supino, etc."
   />
    </div>

          <div className="flex gap-3 justify-end pt-4 border-t">
     <button
              onClick={() => setModalEquipamento({ isOpen: false, equipamento: null, modo: 'criar' })}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
       >
        Cancelar
 </button>
         <button
              onClick={salvarEquipamento}
            disabled={!formEquipamento.nome}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
   >
     Salvar
       </button>
   </div>
        </div>
      </Modal>
    </div>
  );
}
