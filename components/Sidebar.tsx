'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, Database, FileText, BarChart, Dumbbell, Layers } from 'lucide-react';

export function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    { href: '/', label: 'Dashboard', icon: Home },
    { href: '/usuarios', label: 'Usuários', icon: Users },
    { href: '/catalogo', label: 'Catálogo', icon: Database },
    { href: '/treinos-modelo', label: 'Treinos Modelo', icon: Layers },
    { href: '/fichas', label: 'Fichas', icon: FileText },
    { href: '/relatorios', label: 'Relatórios', icon: BarChart },
  ];

  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen">
      <div className="p-6">
        <div className="flex items-center gap-2 text-2xl font-bold">
 <Dumbbell size={32} />
          <span>Academia</span>
        </div>
      </div>
      
      <nav className="px-4 space-y-1">
        {menuItems.map((item) => {
  const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
      <Link
        key={item.href}
    href={item.href}
    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
            isActive
     ? 'bg-blue-600 text-white'
           : 'text-gray-300 hover:bg-gray-800 hover:text-white'
    }`}
   >
       <Icon size={20} />
              <span className="font-medium">{item.label}</span>
</Link>
          );
    })}
      </nav>
</aside>
  );
}
