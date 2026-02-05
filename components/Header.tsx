'use client';

import { useState } from 'react';
import { useAuthStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { LogOut, User, Settings, Lock, ChevronDown } from 'lucide-react';

export function Header() {
  const { usuario, logout } = useAuthStore();
  const router = useRouter();
  const [dropdownAberto, setDropdownAberto] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            BackOffice - Sistema de Academia
          </h2>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 px-4 py-2 bg-gray-100 rounded-lg">
            <User size={20} className="text-gray-600" />
            <div className="text-sm">
              <p className="font-semibold text-gray-900">{usuario?.nome}</p>
              <p className="text-gray-600 capitalize">{usuario?.tipo}</p>
            </div>
          </div>

          {/* Dropdown Configurações */}
          <div className="relative">
            <button
              onClick={() => setDropdownAberto(!dropdownAberto)}
              className="flex items-center gap-2 p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
              title="Configurações"
            >
              <Settings size={20} />
              <ChevronDown size={16} className={`transition-transform ${dropdownAberto ? 'rotate-180' : ''}`} />
            </button>
            
            {dropdownAberto && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                <button
                  onClick={() => {
                    setDropdownAberto(false);
                    router.push('/perfil/alterar-senha');
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition"
                >
                  <Lock size={18} />
                  <span>Alterar Senha</span>
                </button>
              </div>
            )}
          </div>
        
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
          >
            <LogOut size={20} />
            <span className="font-medium">Sair</span>
          </button>
        </div>
      </div>

      {/* Overlay para fechar dropdown ao clicar fora */}
      {dropdownAberto && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setDropdownAberto(false)}
        />
      )}
    </header>
  );
}
