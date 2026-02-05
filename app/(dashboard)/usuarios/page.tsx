'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Plus, Edit, UserX, UserCheck } from 'lucide-react';
import api from '@/lib/api';
import { Usuario } from '@/types';
import { Table } from '@/components/Table';
import { Modal } from '@/components/Modal';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useAuthStore } from '@/lib/store';

type TipoUsuario = 'administrador' | 'professor' | 'aluno' | 'todos';

export default function UsuariosPage() {
  const router = useRouter();
  const { usuario: usuarioLogado } = useAuthStore();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState<TipoUsuario>('todos');
  const [modalDesativar, setModalDesativar] = useState<{ isOpen: boolean; usuario: Usuario | null }>({
    isOpen: false,
    usuario: null
  });

  useEffect(() => {
    carregarUsuarios();
  }, []);

  const carregarUsuarios = async () => {
    try {
      setLoading(true);
      console.log(' Carregando usuários...');
      
    const { data } = await api.get('/api/usuarios');
      console.log(' Resposta da API:', data);
      
      if (data.sucesso) {
        // A API retorna 'dados' e não 'usuarios'
        console.log(' Sucesso! Usuários recebidos:', data.dados?.length || 0);
    setUsuarios(data.dados || []);
      } else {
        console.warn(' API retornou sucesso=false');
   setUsuarios([]);
      }
    } catch (error) {
      console.error(' Erro ao carregar usuários:', error);
      setUsuarios([]);
    } finally {
      setLoading(false);
  console.log(' Carregamento finalizado');
    }
  };

  const handleDesativar = async () => {
    if (!modalDesativar.usuario) return;

    try {
      const novoStatus = !modalDesativar.usuario.ativo;
      const { data } = await api.patch(`/api/usuarios/${modalDesativar.usuario._id}`, {
        ativo: novoStatus
      });

      if (data.sucesso) {
        await carregarUsuarios();
        setModalDesativar({ isOpen: false, usuario: null });
      }
    } catch (error) {
      console.error('Erro ao alterar status:', error);
    }
  };

  // Garante que usuarios sempre seja um array
  const usuariosArray = Array.isArray(usuarios) ? usuarios : [];
  console.log(' Usuários no array:', usuariosArray.length, usuariosArray);

  const usuariosFiltrados = usuariosArray
 .filter(u => tipoFiltro === 'todos' || u.tipo === tipoFiltro)
 .filter(u => 
      u.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.codigoAluno && String(u.codigoAluno).includes(searchTerm))
  );
  
  console.log(' Usuários filtrados:', usuariosFiltrados.length, 'Filtro:', tipoFiltro, 'Busca:', searchTerm);

  const columns = [
    {
      key: 'nome',
      label: 'Nome',
    },
    {
      key: 'email',
      label: 'Email',
    },
    ...(tipoFiltro === 'aluno' || tipoFiltro === 'todos' ? [{
      key: 'codigoAluno',
      label: 'Código',
      render: (usuario: Usuario) => usuario.codigoAluno || '-'
    }] : []),
    {
      key: 'tipo',
      label: 'Tipo',
      render: (usuario: Usuario) => (
        <span className="capitalize px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
          {usuario.tipo}
      </span>
      )
    },
    {
      key: 'ativo',
      label: 'Status',
      render: (usuario: Usuario) => (
        <span className={`px-2 py-1 text-xs rounded-full ${
      usuario.ativo 
 ? 'bg-green-100 text-green-800' 
       : 'bg-red-100 text-red-800'
        }`}>
          {usuario.ativo ? 'Ativo' : 'Inativo'}
      </span>
      )
    },
    {
      key: 'acoes',
      label: 'Ações',
  render: (usuario: Usuario) => (
        <div className="flex gap-2">
        <button
    onClick={() => router.push(`/usuarios/${usuario._id}/editar`)}
     className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
            title="Editar"
   >
    <Edit size={16} />
 </button>
          <button
            onClick={() => setModalDesativar({ isOpen: true, usuario })}
       className={`p-2 rounded-lg transition ${
              usuario.ativo
          ? 'text-red-600 hover:bg-red-50'
   : 'text-green-600 hover:bg-green-50'
            }`}
   title={usuario.ativo ? 'Desativar' : 'Ativar'}
      >
       {usuario.ativo ? <UserX size={16} /> : <UserCheck size={16} />}
          </button>
        </div>
      )
    }
  ];

  const tabs: { tipo: TipoUsuario; label: string; count: number }[] = [
    { tipo: 'todos', label: 'Todos', count: usuariosArray.length },
    { tipo: 'administrador', label: 'Administradores', count: usuariosArray.filter(u => u.tipo === 'administrador').length },
    { tipo: 'professor', label: 'Professores', count: usuariosArray.filter(u => u.tipo === 'professor').length },
    { tipo: 'aluno', label: 'Alunos', count: usuariosArray.filter(u => u.tipo === 'aluno').length },
  ];

  // Apenas administradores podem criar novos usuários
  const podeAdicionar = usuarioLogado?.tipo === 'administrador';

  return (
    <div className="space-y-6">
 {/* Header */}
 <div className="flex items-center justify-between">
        <div>
     <h1 className="text-3xl font-bold text-gray-900">Usuários</h1>
       <p className="text-gray-600 mt-1">Gerencie os usuários do sistema</p>
   </div>
     
    {podeAdicionar && (
          <button
         onClick={() => router.push('/usuarios/novo')}
      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
       >
            <Plus size={20} />
     <span>Novo Usuário</span>
        </button>
      )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
 <div className="flex gap-4">
        {tabs.map(tab => (
  <button
     key={tab.tipo}
  onClick={() => setTipoFiltro(tab.tipo)}
    className={`pb-4 px-2 border-b-2 transition ${
           tipoFiltro === tab.tipo
          ? 'border-blue-600 text-blue-600 font-medium'
    : 'border-transparent text-gray-600 hover:text-gray-900'
         }`}
  >
      {tab.label} ({tab.count})
   </button>
    ))}
        </div>
</div>

      {/* Debug Info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm">
    <p className="font-semibold text-yellow-800 mb-2"> Debug Info:</p>
      <p>Total usuários no state: {usuarios.length}</p>
     <p>Loading: {loading ? 'Sim' : 'Não'}</p>
   <p>Filtro ativo: {tipoFiltro}</p>
 <p>Termo de busca: &quot;{searchTerm}&quot;</p>
     <p>Usuários filtrados: {usuariosFiltrados.length}</p>
        </div>
      )}

      {/* Search */}
      <div className="bg-white rounded-lg shadow p-4">
     <div className="relative">
    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
  type="text"
            placeholder="Buscar por nome, email ou código..."
    value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
   </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow">
        <Table
          data={usuariosFiltrados}
          columns={columns}
          loading={loading}
          emptyMessage="Nenhum usuário encontrado"
    />
      </div>

      {/* Modal Desativar/Ativar */}
      <Modal
    isOpen={modalDesativar.isOpen}
        onClose={() => setModalDesativar({ isOpen: false, usuario: null })}
        title={modalDesativar.usuario?.ativo ? 'Desativar Usuário' : 'Ativar Usuário'}
      >
<div className="space-y-4">
          <p className="text-gray-600">
  {modalDesativar.usuario?.ativo 
        ? 'Tem certeza que deseja desativar este usuário? Ele não poderá mais acessar o sistema.'
              : 'Tem certeza que deseja ativar este usuário? Ele poderá acessar o sistema novamente.'
    }
          </p>
          
    <div className="flex gap-3 justify-end">
            <button
          onClick={() => setModalDesativar({ isOpen: false, usuario: null })}
        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
    >
              Cancelar
       </button>
            <button
              onClick={handleDesativar}
     className={`px-4 py-2 rounded-lg text-white transition ${
       modalDesativar.usuario?.ativo
              ? 'bg-red-600 hover:bg-red-700'
   : 'bg-green-600 hover:bg-green-700'
          }`}
 >
              {modalDesativar.usuario?.ativo ? 'Desativar' : 'Ativar'}
      </button>
          </div>
    </div>
      </Modal>
    </div>
  );
}
