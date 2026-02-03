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
  category: string;
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

export type CategoryBudget = {
    category: string;
    amount: number;
};

export const ocrEngineOptions = ['multimodal-ai', 'tesseract-ai'] as const;
export type OcrEngine = (typeof ocrEngineOptions)[number];

export type UserProfile = {
  name: string;
  monthlyBudget: number;
  currency: Currency;
  salary?: number;
  salaryPassword?: string;
  customCategories?: CustomCategory[];
  categoryBudgets?: CategoryBudget[];
  useMockAI?: boolean;
  defaultStatus?: ExpenseStatus;
  defaultRecurrence?: Recurrence;
  apiKey?: string;
  ocrEngine?: OcrEngine;
};

export const importanceLevels = ["high", "medium", "low"] as const;
export type Importance = (typeof importanceLevels)[number];

export type Task = {
  id: string;
  description: string;
  deadline: Date;
  importance: Importance;
  estimatedEffort: string;
  completed: boolean;
  startTime?: string;
  endTime?: string;
};

// For AI flow
export type TaskInput = {
  tasks: {
    description: string;
    deadline: string;
    importance: Importance;
    estimatedEffort: string;
  }[];
};

export type TaskOutput = {
  prioritizedTasks: {
    description: string;
    deadline: string;
    importance: Importance;
    estimatedEffort: string;
  }[];
  reasoning: string;
};

export type SavingsGoal = {
  id: string;
  name: string;
  amount: number;
  currentAmount: number;
  plan: string; // The AI generated plan in Markdown
  createdAt: string;
};

export type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};
