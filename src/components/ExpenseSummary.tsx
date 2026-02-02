import type { Expense, UserProfile } from "@/app/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DollarSign, PiggyBank, CreditCard, Hourglass, CalendarClock } from "lucide-react";
import { getCurrencySymbol } from "@/lib/utils";
import SalaryCard from "./SalaryCard";

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
  
  const pendingExpenses = expenses.filter(e => e.status === 'pending');
  const pendingCount = pendingExpenses.length;
  const pendingTotal = pendingExpenses.reduce((sum, e) => sum + e.amount, 0);

  const upcomingExpenses = expenses.filter(e => e.status === 'upcoming');
  const upcomingCount = upcomingExpenses.length;
  const upcomingTotal = upcomingExpenses.reduce((sum, e) => sum + e.amount, 0);


  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Monthly Budget</CardTitle>
          <PiggyBank className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{currencySymbol}{budget.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">Your spending limit</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Spent (Completed)</CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{currencySymbol}{spent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
           <p className="text-xs text-muted-foreground">
            in selected period
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Remaining (from Budget)</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${remaining < 0 ? 'text-destructive' : ''}`}>
            {currencySymbol}{remaining.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2})}
          </div>
          <p className="text-xs text-muted-foreground">
            {remaining < 0 ? 'You are over budget' : 'Left in your monthly budget'}
          </p>
        </CardContent>
      </Card>
      <SalaryCard user={user} />
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending Expenses</CardTitle>
          <Hourglass className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{currencySymbol}{pendingTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
          <p className="text-xs text-muted-foreground">{pendingCount} pending transaction(s)</p>
        </CardContent>
      </Card>
       <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Upcoming Expenses</CardTitle>
          <CalendarClock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{currencySymbol}{upcomingTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
          <p className="text-xs text-muted-foreground">{upcomingCount} upcoming transaction(s)</p>
        </CardContent>
      </Card>
    </div>
  );
}
