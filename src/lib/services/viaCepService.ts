export interface ViaCepResult {
  cep: string;
  logradouro: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

export const buscarCep = async (cep: string): Promise<ViaCepResult | null> => {
  const cleaned = cep.replace(/\D/g, '');
  if (cleaned.length !== 8) return null;
  
  try {
    const response = await fetch(`https://viacep.com.br/ws/${cleaned}/json/`);
    if (!response.ok) return null;
    const data: ViaCepResult = await response.json();
    if (data.erro) return null;
    return data;
  } catch {
    return null;
  }
};

export const formatCep = (value: string): string => {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length > 5) return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  return digits;
};

export const formatPhone = (value: string): string => {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length > 10) return `(${digits.slice(0,2)}) ${digits.slice(2,7)}-${digits.slice(7)}`;
  if (digits.length > 6) return `(${digits.slice(0,2)}) ${digits.slice(2,6)}-${digits.slice(6)}`;
  if (digits.length > 2) return `(${digits.slice(0,2)}) ${digits.slice(2)}`;
  return digits;
};
