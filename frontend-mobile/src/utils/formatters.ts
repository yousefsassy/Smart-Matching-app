import { BudgetRange } from '../types/serviceRequest';

export function formatBudgetRange(budget: BudgetRange) {
  return `${budget.min}–${budget.max} ${budget.currency}`;
}
