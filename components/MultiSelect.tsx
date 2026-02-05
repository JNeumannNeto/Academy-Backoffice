'use client';

import { useState } from 'react';
import { ChevronDown, X } from 'lucide-react';

interface Option {
  value: string;
  label: string;
}

interface MultiSelectProps {
  options: Option[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  label?: string;
}

export function MultiSelect({ options, value, onChange, placeholder = 'Selecione...', label }: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOption = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter(v => v !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  };

  const removeOption = (optionValue: string) => {
    onChange(value.filter(v => v !== optionValue));
  };

  const selectedLabels = value.map(v => options.find(o => o.value === v)?.label || v);

  return (
 <div className="relative">
      {label && (
    <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      
      <div className="relative">
        <button
     type="button"
     onClick={() => setIsOpen(!isOpen)}
     className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-left flex items-center justify-between hover:border-gray-400 transition"
    >
     <span className="text-gray-700">
 {value.length === 0 ? placeholder : `${value.length} selecionado(s)`}
          </span>
      <ChevronDown size={20} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <>
     <div
     className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
     <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
   {options.map(option => (
    <label
      key={option.value}
      className="flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer"
     >
      <input
         type="checkbox"
          checked={value.includes(option.value)}
      onChange={() => toggleOption(option.value)}
        className="mr-3"
           />
    <span className="text-gray-700">{option.label}</span>
  </label>
  ))}
 </div>
   </>
        )}
      </div>

      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
{selectedLabels.map((label, index) => (
  <span
    key={value[index]}
     className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
   >
    {label}
  <button
         type="button"
                onClick={() => removeOption(value[index])}
       className="hover:bg-blue-200 rounded-full p-0.5"
              >
      <X size={14} />
       </button>
</span>
     ))}
        </div>
  )}
    </div>
  );
}
