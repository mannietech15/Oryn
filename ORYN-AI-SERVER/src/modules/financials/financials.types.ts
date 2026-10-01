export interface FinancialEntryInput {
  type: 'revenue' | 'expense';
  category: string;
  amount: number;
  date?: string;
  note?: string;
}
