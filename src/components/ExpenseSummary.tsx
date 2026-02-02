import type { Expense } from "@/app/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DollarSign, PiggyBank, CreditCard } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface BudgetOverviewProps {
  budget: number;
  expenses: Expense[];
}

export default function ExpenseSummary({ budget, expenses }: BudgetOverviewProps) {
  const spent = expenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  );
  const remaining = budget - spent;
  const progressPercentage = budget > 0 ? (spent / budget) * 100 : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Monthly Budget</CardTitle>
          <PiggyBank className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${budget.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">Your spending limit</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Spent so far</CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${spent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
          <Progress value={progressPercentage} className="mt-2 h-2" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Remaining</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${remaining < 0 ? 'text-destructive' : ''}`}>
            ${remaining.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2})}
          </div>
          <p className="text-xs text-muted-foreground">
            {remaining < 0 ? 'You are over budget' : 'Left in your budget'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
