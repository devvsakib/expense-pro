
'use client';

import type { Expense, UserProfile } from "@/app/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getCurrencySymbol } from "@/lib/utils";

interface BudgetProgressProps {
  user: UserProfile;
  expenses: Expense[];
}

export default function BudgetProgress({ user, expenses }: BudgetProgressProps) {
  const { monthlyBudget: budget, currency } = user;
  const currencySymbol = getCurrencySymbol(currency);
  
  const spent = expenses.reduce(
    (sum, expense) => expense.status === 'completed' ? sum + expense.amount : sum,
    0
  );
  const remaining = budget - spent;
  const budgetProgress = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Budget</CardTitle>
        <CardDescription>
          Your spending progress vs. your budget of {currencySymbol}{budget.toLocaleString()}.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
            <Progress value={budgetProgress} className="h-2"/>
            <div className="flex justify-between text-sm">
                <div className="font-medium">Spent: <span className="font-mono">{currencySymbol}{spent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2})}</span></div>
                <div className={`font-medium ${remaining < 0 ? 'text-destructive' : ''}`}>
                  Remaining: <span className="font-mono">{currencySymbol}{remaining.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                </div>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
