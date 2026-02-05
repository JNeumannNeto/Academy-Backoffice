export interface Objetivo {
  _id: string;
  nome: string;
  categoria: 'aerobico_aquecimento' | 'dinamico' | 'musculacao' | 'aerobico_desaquecimento';
  ordem: number;
  ativo: boolean;
}

export interface Equipamento {
  _id: string;
  nome: string;
  ativo: boolean;
}

export interface Exercicio {
  objetivo: string;
  equipamento: string;
  series: number[];
  repeticoes: number[];
  detalhes?: string;
  ordem: number;
}

export interface Parte {
  nome?: string;
  exercicios: Exercicio[];
  exerciciosJuntos?: number[][];
}

export interface Treino {
  _id?: string;
  cor: string;
  partes: Parte[];
  observacoes?: string;
}

export interface Anamnese {
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

export interface Ficha {
  _id: string;
  aluno: {
    _id: string;
    nome: string;
    email: string;
  codigoAluno: number;
  };
  professorReferencia: {
    _id: string;
  nome: string;
    email: string;
  };
  dataInicio: string;
  dataValidade: string;
  anamnese: Anamnese;
  objetivos: string[];
  anotacoesNutricao?: string;
  treinos: Treino[];
  ativa: boolean;
  vencida: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Usuario {
  _id: string;
  nome: string;
  email: string;
  tipo: 'administrador' | 'professor' | 'aluno';
  codigoAluno?: number;
  telefone?: string;
  dataNascimento?: string;
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
}
