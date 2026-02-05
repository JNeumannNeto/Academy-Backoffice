'use client';

interface AnamneseData {
  remedios?: string;
  problemasSaude?: string;
  doencas?: string;
  cirurgias?: string;
  condicoes: {
    diabetes: boolean;
    hipertensao: boolean;
    doencaCardiaca: boolean;
    hipoglicemia: boolean;
    alergia: boolean;
    descricaoAlergia?: string;
  outras?: string[];
  };
}

interface AnamneseFormProps {
  value: AnamneseData;
  onChange: (value: AnamneseData) => void;
}

export function AnamneseForm({ value, onChange }: AnamneseFormProps) {
  const updateField = (field: keyof Omit<AnamneseData, 'condicoes'>, fieldValue: string) => {
    onChange({ ...value, [field]: fieldValue });
  };

  const updateCondicao = <K extends keyof AnamneseData['condicoes']>(
    condicao: K,
    checked: AnamneseData['condicoes'][K]
  ) => {
    onChange({
      ...value,
      condicoes: {
        ...value.condicoes,
 [condicao]: checked
      }
  });
  };

  const updateDescricaoAlergia = (descricao: string) => {
    onChange({
      ...value,
      condicoes: {
        ...value.condicoes,
        descricaoAlergia: descricao
      }
    });
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Anamnese</h3>

      {/* Campos de texto livre */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Remédios em Uso
          </label>
          <textarea
            value={value.remedios || ''}
       onChange={(e) => updateField('remedios', e.target.value)}
 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      rows={3}
         placeholder="Liste os remédios que está tomando..."
       />
        </div>

     <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
      Problemas de Saúde
          </label>
    <textarea
            value={value.problemasSaude || ''}
onChange={(e) => updateField('problemasSaude', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      rows={3}
            placeholder="Descreva problemas de saúde atuais..."
   />
      </div>

        <div>
<label className="block text-sm font-medium text-gray-700 mb-2">
            Doenças Anteriores
   </label>
          <textarea
            value={value.doencas || ''}
    onChange={(e) => updateField('doencas', e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
     rows={3}
         placeholder="Liste doenças que já teve..."
          />
        </div>

    <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cirurgias
          </label>
     <textarea
     value={value.cirurgias || ''}
        onChange={(e) => updateField('cirurgias', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
rows={3}
      placeholder="Liste cirurgias realizadas..."
          />
    </div>
    </div>

      {/* Condições de saúde (checkboxes) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
      Condições de Saúde
  </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
 <input
     type="checkbox"
        checked={value.condicoes.diabetes}
         onChange={(e) => updateCondicao('diabetes', e.target.checked)}
 className="w-4 h-4 text-blue-600 rounded"
    />
  <span className="text-gray-700">Diabetes</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
    type="checkbox"
  checked={value.condicoes.hipertensao}
       onChange={(e) => updateCondicao('hipertensao', e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded"
   />
      <span className="text-gray-700">Hipertensão</span>
       </label>

        <label className="flex items-center gap-2 cursor-pointer">
            <input
       type="checkbox"
        checked={value.condicoes.doencaCardiaca}
              onChange={(e) => updateCondicao('doencaCardiaca', e.target.checked)}
           className="w-4 h-4 text-blue-600 rounded"
            />
      <span className="text-gray-700">Doença Cardíaca</span>
       </label>

        <label className="flex items-center gap-2 cursor-pointer">
   <input
              type="checkbox"
      checked={value.condicoes.hipoglicemia}
            onChange={(e) => updateCondicao('hipoglicemia', e.target.checked)}
         className="w-4 h-4 text-blue-600 rounded"
            />
        <span className="text-gray-700">Hipoglicemia</span>
        </label>

          <label className="flex items-center gap-2 cursor-pointer">
         <input
      type="checkbox"
  checked={value.condicoes.alergia}
              onChange={(e) => updateCondicao('alergia', e.target.checked)}
    className="w-4 h-4 text-blue-600 rounded"
   />
            <span className="text-gray-700">Alergia</span>
          </label>
        </div>

        {/* Campo condicional para descrição de alergia */}
      {value.condicoes.alergia && (
 <div className="mt-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">
   Descrição da Alergia
            </label>
   <input
  type="text"
            value={value.condicoes.descricaoAlergia || ''}
              onChange={(e) => updateDescricaoAlergia(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
           placeholder="Descreva a alergia..."
            />
    </div>
        )}
      </div>
    </div>
  );
}
