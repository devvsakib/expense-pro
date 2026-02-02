export const expenseCategories = [
  "Food",
  "Transport",
  "Shopping",
  "Bills",
  "Entertainment",
  "Health",
  "Education",
  "Gifts",
  "Other",
] as const;

export type ExpenseCategory = (typeof expenseCategories)[number];

export const expenseStatuses = ["completed", "pending", "upcoming"] as const;
export type ExpenseStatus = (typeof expenseStatuses)[number];

export const recurrenceOptions = ["one-time", "daily", "weekly", "monthly"] as const;
export type Recurrence = (typeof recurrenceOptions)[number];

export type Expense = {
  id: string;
  title: string;
  amount: number;
  date: Date;
  category: ExpenseCategory;
  status: ExpenseStatus;
  recurrence: Recurrence;
  notes?: string;
};

export type CustomCategory = {
  id: string;
  name: string;
  color: string;
  emoji: string;
};

export const currencyOptions = [
    { value: "BDT", label: "BDT (৳)" },
    { value: "USD", label: "USD ($)" },
    { value: "EUR", label: "EUR (€)" },
    { value: "GBP", label: "GBP (£)" },
    { value: "INR", label: "INR (₹)" },
] as const;

export type Currency = typeof currencyOptions[number]['value'];


export type UserProfile = {
  name: string;
  monthlyBudget: number;
  currency: Currency;
  salary?: number;
  salaryPassword?: string;
};
