'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Column<T> {
  key: keyof T | string;
  label: string;
  render?: (item: T) => React.ReactNode;
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  emptyMessage?: string;
}

export function Table<T extends { _id: string }>({ 
  data, 
  columns, 
  loading = false,
  emptyMessage = 'Nenhum registro encontrado'
}: TableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = data.slice(startIndex, endIndex);

  if (loading) {
    return (
   <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
 <thead className="bg-gray-50">
       <tr>
      {columns.map((column) => (
   <th
    key={String(column.key)}
         className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
         >
      {column.label}
 </th>
  ))}
</tr>
  </thead>
 <tbody className="bg-white divide-y divide-gray-200">
            {currentData.map((item) => (
        <tr key={item._id} className="hover:bg-gray-50 transition">
   {columns.map((column) => (
            <td
           key={String(column.key)}
          className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
        >
       {column.render 
          ? column.render(item)
  : String(item[column.key as keyof T] || '-')}
            </td>
       ))}
       </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t">
          <div className="text-sm text-gray-700">
     Mostrando <span className="font-medium">{startIndex + 1}</span> a{' '}
          <span className="font-medium">{Math.min(endIndex, data.length)}</span> de{' '}
 <span className="font-medium">{data.length}</span> resultados
          </div>
          
    <div className="flex gap-2">
     <button
       onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
 disabled={currentPage === 1}
              className="px-3 py-1 border rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
     <ChevronLeft size={16} />
          </button>
         
    <span className="px-4 py-1 text-sm">
            Página {currentPage} de {totalPages}
    </span>
       
            <button
        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
         disabled={currentPage === totalPages}
  className="px-3 py-1 border rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
           <ChevronRight size={16} />
          </button>
      </div>
        </div>
      )}
    </div>
  );
}
