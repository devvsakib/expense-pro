import type { Expense, UserProfile } from "@/app/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Hourglass, CalendarClock } from "lucide-react";
import { getCurrencySymbol } from "@/lib/utils";
import SalaryCard from "./SalaryCard";
import { Progress } from "@/components/ui/progress";

interface BudgetOverviewProps {
  user: UserProfile;
  expenses: Expense[];
}

export default function ExpenseSummary({ user, expenses }: BudgetOverviewProps) {
  const { monthlyBudget: budget, currency } = user;
  const currencySymbol = getCurrencySymbol(currency);
  
  const spent = expenses.reduce(
    (sum, expense) => expense.status === 'completed' ? sum + expense.amount : sum,
    0
  );
  const remaining = budget - spent;
  const budgetProgress = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
  
  const pendingExpenses = expenses.filter(e => e.status === 'pending');
  const pendingCount = pendingExpenses.length;
  const pendingTotal = pendingExpenses.reduce((sum, e) => sum + e.amount, 0);

  const upcomingExpenses = expenses.filter(e => e.status === 'upcoming');
  const upcomingCount = upcomingExpenses.length;
  const upcomingTotal = upcomingExpenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="grid grid-cols-1 gap-6">
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
      
      <div className="grid grid-cols-2 gap-4">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Hourglass className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
            <div className="text-xl font-bold">{currencySymbol}{pendingTotal.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{pendingCount} transaction(s)</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            <CalendarClock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
            <div className="text-xl font-bold">{currencySymbol}{upcomingTotal.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{upcomingCount} transaction(s)</p>
            </CardContent>
        </Card>
      </div>

      <SalaryCard user={user} />
    </div>
  );
}
